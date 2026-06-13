import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from '@/services/axios';
import { useAuth } from '@/context/AuthContext';
import bookingService from '@/services/bookingService';
import { Copy } from "lucide-react";
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';
import { PaymobCheckoutFrame } from '@/components/shared/PaymobCheckoutFrame';
import {
  isPaymobReturnFailed,
  isPaymobReturnSuccess,
  startPaymobPayment,
  getPaymobPaymentStatus,
  waitForPaymobCompletion,
} from '@/services/paymobService';
import { PaymentResultView } from '@/components/shared/PaymentResultView';

const MemberSportPaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const { t, isRTL, language } = useLocalizedTranslation("member");
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [shareUrl, setShareUrl] = useState<string>("");
    const [paymobIframeUrl, setPaymobIframeUrl] = useState<string | null>(null);

    const dateLocale = language === "en" ? "en-US" : "ar-EG";

    const paymentData = useMemo(() => {
        const type = searchParams.get("type") || "subscription";
        const subscriptionId = Number(searchParams.get("subscriptionId") || 0);
        const bookingId = searchParams.get("bookingId") || "";
        const paymentReference = searchParams.get("paymentReference") || "PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const amountStr = searchParams.get("amount");
        const amount = amountStr && Number(amountStr) > 0 ? Number(amountStr) : 0;
        const currency = searchParams.get("currency") || "EGP";
        const sportName = searchParams.get("sportName") || "";
        const slotTime = searchParams.get("slotTime") || searchParams.get("time") || "-";
        const slotDays = searchParams.get("slotDays") || searchParams.get("date") || "-";
        const court = searchParams.get("court") || searchParams.get("courtName") || "-";
        const slotId = searchParams.get("slotId") || "";
        const teamId = searchParams.get("teamId") || "";

        const raw = {
            type,
            subscriptionId,
            bookingId,
            paymentReference,
            amount,
            currency,
            sportName,
            slotTime,
            slotDays,
            court,
            slotId,
            teamId,
        } as const;

        const isBookingPayment =
            raw.type === "booking" ||
            (!!raw.bookingId && !(raw.subscriptionId > 0));

        return {
            ...raw,
            isBooking: isBookingPayment,
            isValid: isBookingPayment ? !!raw.bookingId : (raw.subscriptionId > 0 || !!raw.slotId || !!raw.teamId),
        };
    }, [searchParams]);

    const displaySportName = paymentData.sportName || t("payment.labels.sportDefault");

    const handleBack = async () => {
        if (paymentData.isBooking) {
            if (paymentData.bookingId) {
                try {
                    await api.delete(`/members/bookings/${paymentData.bookingId}`, {
                        data: { reason: "Cancelled by user during payment" }
                    });
                } catch {
                    // ignore
                }
            }
            navigate("/member/dashboard?tab=courts", { replace: true });
            return;
        }

        if (paymentData.subscriptionId > 0) {
            try {
                await api.patch(`/member-subscriptions/${paymentData.subscriptionId}/cancel`, {
                    reason: "Cancelled from member payment page",
                });
            } catch {
                // Best-effort only; navigation should not be blocked.
            }
        }

        navigate("/member/dashboard/subscribe", { replace: true });
    };

    const completeBookingPayment = useCallback(async () => {
        if (!paymentData.bookingId) throw new Error(t("payment.alerts.missing_booking_id"));
        const booking = await bookingService.confirmPayment(paymentData.bookingId, paymentData.paymentReference);

        try {
            const userId = user?.member_id || user?.team_member_id;
            if (userId) {
                const storageKey = `confirmed_bookings_${userId}`;
                const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
                existing.push({
                    id: paymentData.bookingId,
                    date: paymentData.slotDays,
                    time: paymentData.slotTime,
                    court: paymentData.court,
                    confirmedAt: Date.now(),
                });
                localStorage.setItem(storageKey, JSON.stringify(existing));
            }
        } catch { /* silent */ }

        const origin = window.location.origin;
        let token = booking?.share_token;

        if (!token && paymentData.bookingId) {
            try {
                const details = await bookingService.getBookingDetails(paymentData.bookingId);
                token = details?.share_token;
            } catch {
                // ignore
            }
        }

        setShareUrl(token ? `${origin}/bookings/share/${token}` : "");
        setSuccessMessage(t("payment.alerts.success_booking"));
        setShowSuccessModal(true);
    }, [paymentData, t, user?.member_id, user?.team_member_id]);

    const completeSubscriptionPayment = useCallback(async () => {
        const subscriptionId = paymentData.subscriptionId;
        if (!subscriptionId) {
            throw new Error(t("payment.alerts.missing_subscription"));
        }

        const status = await getPaymobPaymentStatus(paymentData.paymentReference);
        if (status.status !== "completed") {
            await api.post(`/member-subscriptions/${subscriptionId}/confirm-payment`, {
                payment_reference: paymentData.paymentReference,
                transaction_id: `M-SUB-${subscriptionId}-${Date.now()}`,
                payment_method: "credit_card",
                gateway_response: "paymob",
            });
        }

        setSuccessMessage(t("payment.alerts.success_subscription"));
    }, [paymentData.paymentReference, paymentData.subscriptionId, t]);

    const handleGatewaySuccess = useCallback(async () => {
        if (paymentData.isBooking) {
            await completeBookingPayment();
            return;
        }
        await completeSubscriptionPayment();
    }, [completeBookingPayment, completeSubscriptionPayment, paymentData.isBooking]);

    useEffect(() => {
        const paymentReference = searchParams.get("paymentReference") || paymentData.paymentReference;
        if (!paymentReference) return;

        if (isPaymobReturnFailed(searchParams)) {
            // Error is handled in render
            return;
        }

        if (!isPaymobReturnSuccess(searchParams)) return;

        void (async () => {
            setProcessing(true);
            setErrorMessage(null);
            try {
                await waitForPaymobCompletion(paymentReference, { attempts: 20, intervalMs: 1500 });
                await handleGatewaySuccess();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : t("payment.alerts.fail");
                setErrorMessage(message);
            } finally {
                setProcessing(false);
            }
        })();
    }, [handleGatewaySuccess, paymentData.paymentReference, searchParams, t]);

    const pollPaymobCompletion = useCallback(async (paymentReference: string) => {
        try {
            await waitForPaymobCompletion(paymentReference, { attempts: 45, intervalMs: 2000 });
            setPaymobIframeUrl(null);
            await handleGatewaySuccess();
        } catch (error: unknown) {
            setPaymobIframeUrl(null);
            setErrorMessage(error instanceof Error ? error.message : t("payment.alerts.fail"));
        } finally {
            setProcessing(false);
        }
    }, [handleGatewaySuccess, t]);

    const handleCopyLink = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl).catch(() => undefined);
        const btn = document.getElementById("member-copy-btn");
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = t("payment.actions.copied");
            setTimeout(() => { btn.innerText = originalText; }, 2000);
        }
    };

    const handlePayNow = async () => {
        if (!paymentData.isValid) {
            setErrorMessage(t("payment.alerts.incomplete_data"));
            return;
        }

        setProcessing(true);
        setErrorMessage(null);

        try {
            const paymob = await startPaymobPayment({
                paymentReference: paymentData.paymentReference,
                returnPath: "/member/payment",
                billingData: {
                    first_name: user?.first_name_en || user?.first_name_ar || "Member",
                    last_name: user?.last_name_en || user?.last_name_ar || "User",
                    email: user?.email || "member@club.local",
                    phone_number: (user as any)?.phone || (user as any)?.phone_number || "+201000000000",
                },
                context: {
                    subscription_id: paymentData.subscriptionId || undefined,
                    booking_id: paymentData.bookingId || undefined,
                    payment_kind: paymentData.isBooking ? "booking" : "subscription",
                    sportName: paymentData.sportName,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                },
            });

            setPaymobIframeUrl(paymob.iframeUrl);
            void pollPaymobCompletion(paymentData.paymentReference);
        } catch (error: unknown) {
            console.error("Payment error:", error);
            const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
            setErrorMessage(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                t("payment.alerts.fail")
            );
            setProcessing(false);
        }
    };

    const currencyLabel = paymentData.currency === "EGP"
        ? t("sports.currency", { defaultValue: "ج.م" })
        : paymentData.currency;

    if (isPaymobReturnFailed(searchParams) || !!errorMessage) {
        return (
            <PaymentResultView 
                status="failed" 
                message={errorMessage || `${t("payment.alerts.fail")}${searchParams.get("data.message") ? ` (${searchParams.get("data.message")})` : ""}`}
                onPrimaryAction={handleBack}
                    // Remove paymob params so user can retry
                primaryActionLabel={t("payment.actions.back")}
            />
        );
    }

    if (isPaymobReturnSuccess(searchParams) || showSuccessModal || successMessage) {
        if (processing) {
            return <PaymentResultView status="processing" onPrimaryAction={() => {}} />;
        }
        return (
            <PaymentResultView 
                status="success" 
                message={successMessage} 
                onPrimaryAction={() => navigate("/member/dashboard?tab=home", { replace: true })}
            >
                {shareUrl && (
                    <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
                        <label className="block text-xs font-bold text-ds-text-muted mb-1 px-1">
                            {t("payment.labels.invite_link")}
                        </label>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                            <div className="flex-1 overflow-hidden">
                                <p dir="ltr" className="text-sm font-mono text-gray-600 truncate px-2">
                                    {shareUrl}
                                </p>
                            </div>
                            <button
                                id="member-copy-btn"
                                type="button"
                                onClick={handleCopyLink}
                                className="flex items-center gap-2 px-4 py-2 bg-ds-primary text-white text-xs font-bold rounded-lg hover:bg-ds-primary-dark transition-colors shrink-0"
                            >
                                <Copy className="w-3 h-3" />
                                {t("payment.actions.copy")}
                            </button>
                        </div>
                    </div>
                )}
            </PaymentResultView>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
            <div dir={isRTL ? "rtl" : "ltr"} className="w-full max-w-[520px] bg-white border border-ds-border rounded-2xl shadow-ds-card p-6">
                <h1 className="text-2xl font-black text-ds-text-primary mb-2">{t("payment.title")}</h1>
                <p className="text-sm text-ds-text-secondary mb-6">
                    {paymentData.isBooking
                        ? t("payment.description_booking")
                        : t("payment.description_subscription")}
                </p>

                {!paymentData.isValid ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm mb-5">
                        {t("payment.invalid_data")}
                    </div>
                ) : null}

                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-ds-text-secondary">{t("payment.labels.sport")}</span>
                        <span className="font-bold text-ds-text-primary">{displaySportName}</span>
                    </div>
                    {paymentData.isBooking && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-ds-text-secondary">{t("payment.labels.time")}</span>
                                <span className="font-bold text-ds-text-primary">{paymentData.slotTime}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-ds-text-secondary">{t("payment.labels.days")}</span>
                                <span className="font-bold text-ds-text-primary">{paymentData.slotDays}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-ds-text-secondary">{t("payment.labels.court")}</span>
                                <span className="font-bold text-ds-text-primary">{paymentData.court}</span>
                            </div>
                        </>
                    )}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-ds-text-secondary">{t("payment.labels.reference")}</span>
                        <span dir="ltr" className="font-mono text-xs text-ds-text-primary">{paymentData.paymentReference || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-ds-text-secondary">{t("payment.labels.amount")}</span>
                        <span className="font-black text-xl text-ds-orange">
                            {paymentData.amount > 0
                                ? `${paymentData.amount.toLocaleString(dateLocale)} ${currencyLabel}`
                                : t("payment.labels.waiting_cost")}
                        </span>
                    </div>
                </div>

                {!isPaymobReturnFailed(searchParams) && errorMessage ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm mb-4">
                        {errorMessage}
                    </div>
                ) : null}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={!paymentData.isValid || processing}
                        className="flex-1 h-11 rounded-lg bg-ds-primary text-white font-bold hover:opacity-95 disabled:opacity-60"
                    >
                        {processing ? t("payment.actions.processing") : t("payment.actions.pay_now")}
                    </button>
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={processing}
                        className="flex-1 h-11 rounded-lg border border-ds-border text-ds-text-primary font-bold hover:bg-gray-50 disabled:opacity-60"
                    >
                        {t("payment.actions.back")}
                    </button>
                </div>
            </div>



            {paymobIframeUrl && (
                <PaymobCheckoutFrame
                    iframeUrl={paymobIframeUrl}
                    onClose={() => {
                        setPaymobIframeUrl(null);
                        setProcessing(false);
                    }}
                    title={t("payment.actions.processing")}
                />
            )}
        </div>
    );
};

export default MemberSportPaymentPage;
