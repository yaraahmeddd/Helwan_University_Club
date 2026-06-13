import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import bookingService from '@/services/bookingService';
import { Copy } from "lucide-react";
import { PaymobCheckoutFrame } from '@/components/shared/PaymobCheckoutFrame';
import {
  isPaymobReturnFailed,
  isPaymobReturnSuccess,
  startPaymobPayment,
  getPaymobPaymentStatus,
  waitForPaymobCompletion,
} from '@/services/paymobService';
import { PaymentResultView } from '@/components/shared/PaymentResultView';

interface TeamMemberSubscriptionApi {
    id?: number | string;
    subscription_id?: number | string;
    team_id?: string;
    status?: string;
    subscription_status?: string;
    payment_reference?: string | null;
    payment_completed_at?: string | null;
    price?: number | string;
}

interface LastPaidSportCache {
    name: string;
    amount: number;
    teamId?: string;
    paidAt: number;
}

const TeamMemberSportPaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation("team");
    const { user } = useAuth();
    const [processing, setProcessing] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [shareUrl, setShareUrl] = useState<string>("");
    const [paymobIframeUrl, setPaymobIframeUrl] = useState<string | null>(null);

    const isRtl = i18n.resolvedLanguage?.startsWith('ar') || i18n.language.startsWith('ar');

    const paymentData = useMemo(() => {
        const type = searchParams.get("type") || "subscription";
        const subscriptionId = Number(searchParams.get("subscriptionId") || 0);
        const bookingId = searchParams.get("bookingId") || "";
        const paymentReference = searchParams.get("paymentReference") || "PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const amountStr = searchParams.get("amount");
        const amount = amountStr && Number(amountStr) > 0 ? Number(amountStr) : 0;
        const currency = searchParams.get("currency") || "EGP";
        const sportName = searchParams.get("sportName") || "Sport";
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
            teamId,
            slotId,
        } as const;

        const isBooking =
            raw.type === "booking" ||
            (!!raw.bookingId && !(raw.subscriptionId > 0));

        return {
            ...raw,
            isBooking,
            isValid: isBooking ? !!raw.bookingId : (raw.subscriptionId > 0 || !!raw.teamId || !!raw.slotId),
        };
    }, [searchParams]);

    const loadTeamMemberSubscriptions = async () => {
        if (!user?.team_member_id) return [] as TeamMemberSubscriptionApi[];
        const parseRaw = (payload: unknown) => {
            const source = payload as {
                data?: { subscriptions?: unknown[] } | unknown[];
                subscriptions?: unknown[];
            };
            if (Array.isArray((source.data as { subscriptions?: unknown[] } | undefined)?.subscriptions)) {
                return (source.data as { subscriptions: unknown[] }).subscriptions;
            }
            if (Array.isArray(source.data)) {
                return source.data;
            }
            if (Array.isArray(source.subscriptions)) {
                return source.subscriptions;
            }
            return [];
        };
        try {
            const res = await api.get(`/team-member-subscriptions/${user.team_member_id}/subscriptions`);
            return parseRaw(res.data) as TeamMemberSubscriptionApi[];
        } catch {
            const fallback = await api.get(`/team-members/${user.team_member_id}/subscriptions`);
            return parseRaw(fallback.data) as TeamMemberSubscriptionApi[];
        }
    };

    const resolvePaymentData = async () => {
        let resolvedSubscriptionId = paymentData.subscriptionId;
        let resolvedPaymentReference = paymentData.paymentReference;
        let resolvedAmount = paymentData.amount;
        let resolvedCurrency = paymentData.currency;

        if (user?.team_member_id && (paymentData.teamId || paymentData.slotId)) {
            try {
                const subscriptions = await loadTeamMemberSubscriptions();
                const candidates = paymentData.teamId
                    ? subscriptions.filter((s) => String(s.team_id || "") === String(paymentData.teamId))
                    : subscriptions;

                const pendingCandidate =
                    candidates.find((s) => String(s.subscription_status || "").toLowerCase() === "pending_payment") ||
                    candidates[0];

                if (pendingCandidate) {
                    const candidateSubscriptionId = Number(pendingCandidate.subscription_id || pendingCandidate.id || 0);
                    if (!resolvedSubscriptionId || candidateSubscriptionId > 0) {
                        resolvedSubscriptionId = candidateSubscriptionId;
                    }
                    if (!resolvedPaymentReference) {
                        resolvedPaymentReference = String(pendingCandidate.payment_reference || "");
                    }
                    if (resolvedAmount <= 0) {
                        resolvedAmount = Number(pendingCandidate.price || 0);
                    }
                }
            } catch {
                // Keep URL values and try subscribe fallback below.
            }
        }

        if (
            user?.team_member_id &&
            (paymentData.teamId || paymentData.slotId) &&
            (!resolvedSubscriptionId || !resolvedPaymentReference || resolvedAmount <= 0)
        ) {
            const subscribeRes = await api.post("/team-member-subscriptions/subscribe", {
                ...(paymentData.slotId ? { schedule_id: paymentData.slotId } : { team_id: paymentData.teamId }),
                team_member_id: user.team_member_id,
            });

            const subscribePayload = subscribeRes?.data || {};
            const subscriptionData = subscribePayload.data || {};
            const payment = subscribePayload.payment || {};

            resolvedSubscriptionId = Number(
                subscriptionData.id || subscriptionData.subscription_id || resolvedSubscriptionId || 0
            );
            resolvedPaymentReference = String(
                payment.reference || subscriptionData.payment_reference || resolvedPaymentReference || ""
            );
            resolvedAmount = Number(payment.amount ?? subscriptionData.price ?? resolvedAmount ?? 0);
            resolvedCurrency = String(payment.currency || resolvedCurrency || "EGP");
        }

        return {
            subscriptionId: resolvedSubscriptionId,
            paymentReference: resolvedPaymentReference,
            amount: resolvedAmount,
            currency: resolvedCurrency,
        };
    };

    const confirmPaymentRequest = async (
        subscriptionId: number,
        payload: {
            payment_reference?: string;
            transaction_id: string;
            payment_method: string;
            gateway_response: string;
        }
    ) => {
        try {
            return await api.post(
                `/team-member-subscriptions/subscriptions/${subscriptionId}/confirm-payment`,
                payload
            );
        } catch (error: unknown) {
            const err = error as {
                status?: number;
                original?: { response?: { status?: number } };
            };
            const maybe404 =
                err?.status === 404 ||
                (err?.original as { response?: { status?: number } } | undefined)?.response?.status === 404;
            if (!maybe404) {
                throw error;
            }

            return await api.post(
                `/team-members/subscriptions/${subscriptionId}/confirm-payment`,
                payload
            );
        }
    };

    const handleBack = async () => {
        // If there is a pending subscription created by the join flow, cancel it
        // so the sport is not left as "added" when the member clicks Cancel.
        const subscriptionId = paymentData.subscriptionId;
        if (subscriptionId > 0 && !paymentData.isBooking) {
            setCancelling(true);
            try {
                try {
                    await api.patch(`/team-member-subscriptions/subscriptions/${subscriptionId}/cancel`, {
                        reason: "Cancelled from team member payment page",
                    });
                } catch {
                    try {
                        await api.patch(`/team-members/subscriptions/${subscriptionId}/cancel`);
                    } catch { /* ignore – navigate regardless */ }
                }
            } finally {
                setCancelling(false);
            }
        }
        // Navigate back to the explore-sports tab instead of the dashboard root
        navigate("/team-member/dashboard?tab=explore-sports", { replace: true });
    };

    const handleCopyLink = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl).catch(() => undefined);
        const btn = document.getElementById("team-copy-btn");
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = t("payment.actions.copied");
            setTimeout(() => { btn.innerText = originalText; }, 2000);
        }
    };

    const persistLastPaidSport = (args: { sportName: string; amount: number; teamId?: string }) => {
        const payload: LastPaidSportCache = {
            name: args.sportName || t("payment.labels.sportDefault"),
            amount: Number(args.amount) || 0,
            teamId: args.teamId,
            paidAt: Date.now(),
        };
        sessionStorage.setItem("tm_last_paid_sport", JSON.stringify(payload));
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
            } catch { /* ignore */ }
        }
        setShareUrl(token ? `${origin}/bookings/share/${token}` : "");
        setSuccessMessage(t("payment.alerts.success_booking"));
        setShowSuccessModal(true);
    }, [paymentData, t, user?.member_id, user?.team_member_id]);

    const completeSubscriptionPayment = useCallback(async () => {
        const resolved = await resolvePaymentData();
        if (!resolved.subscriptionId) {
            throw new Error(t("payment.alerts.missing_subscription"));
        }

        const paymentReference = resolved.paymentReference || paymentData.paymentReference;
        const status = await getPaymobPaymentStatus(paymentReference);
        if (status.status !== "completed") {
            await confirmPaymentRequest(resolved.subscriptionId, {
                ...(paymentReference ? { payment_reference: paymentReference } : {}),
                transaction_id: `TXN-${resolved.subscriptionId}-${Date.now()}`,
                payment_method: "credit_card",
                gateway_response: "paymob",
            });
        }
        persistLastPaidSport({
            sportName: paymentData.sportName,
            amount: resolved.amount,
            teamId: paymentData.teamId || undefined,
        });
        setSuccessMessage(t("payment.alerts.success_subscription"));
    }, [paymentData.sportName, paymentData.teamId, t]);

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
            // Error handled in render
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
                setErrorMessage(error instanceof Error ? error.message : t("payment.alerts.fail"));
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

    const handlePayNow = async () => {
        if (!paymentData.isValid) {
            setErrorMessage(t("payment.alerts.incomplete_data"));
            return;
        }

        setProcessing(true);
        setErrorMessage(null);

        try {
            const resolved = paymentData.isBooking
                ? paymentData
                : await resolvePaymentData();

            const paymob = await startPaymobPayment({
                paymentReference: resolved.paymentReference || paymentData.paymentReference,
                returnPath: "/team-member/payment",
                billingData: {
                    first_name: user?.first_name_en || user?.first_name_ar || "Player",
                    last_name: user?.last_name_en || user?.last_name_ar || "User",
                    email: user?.email || "player@club.local",
                    phone_number: (user as any)?.phone || (user as any)?.phone_number || "+201000000000",
                },
                context: {
                    subscription_id: resolved.subscriptionId || paymentData.subscriptionId || undefined,
                    booking_id: paymentData.bookingId || undefined,
                    payment_kind: paymentData.isBooking ? "booking" : "subscription",
                    sportName: paymentData.sportName,
                    amount: resolved.amount || paymentData.amount,
                    currency: resolved.currency || paymentData.currency,
                },
            });

            setPaymobIframeUrl(paymob.iframeUrl);
            void pollPaymobCompletion(resolved.paymentReference || paymentData.paymentReference);
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

    if (isPaymobReturnFailed(searchParams) || !!errorMessage) {
        return (
            <PaymentResultView 
                status="failed" 
                message={errorMessage || `${t("payment.alerts.fail")}${searchParams.get("data.message") ? ` (${searchParams.get("data.message")})` : ""}`}
                onPrimaryAction={handleBack}
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
                onPrimaryAction={() => navigate("/team-member/dashboard", { replace: true })}
            >
                {shareUrl && (
                    <div className={`space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
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
                                id="team-copy-btn"
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
            <div dir={isRtl ? "rtl" : "ltr"} className="w-full max-w-[520px] bg-white border border-ds-border rounded-2xl shadow-ds-card p-6">
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
                        <span className="font-bold text-ds-text-primary">{paymentData.sportName}</span>
                    </div>
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
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-ds-text-secondary">{t("payment.labels.reference")}</span>
                        <span dir="ltr" className="font-mono text-xs text-ds-text-primary">{paymentData.paymentReference || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-ds-text-secondary">{t("payment.labels.amount")}</span>
                        <span className="font-black text-xl text-ds-orange">
                            {paymentData.amount > 0
                                ? `${paymentData.amount.toLocaleString(isRtl ? "ar-EG" : "en-US")} ${paymentData.currency === "EGP" ? t("sports.currency") : paymentData.currency}`
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
                        disabled={processing || cancelling}
                        className="flex-1 h-11 rounded-lg border border-ds-border text-ds-text-primary font-bold hover:bg-gray-50 disabled:opacity-60"
                    >
                        {cancelling ? t("explore_sports.actions.sending") : t("payment.actions.back")}
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

export default TeamMemberSportPaymentPage;
