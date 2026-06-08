import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";
import bookingService from "../services/bookingService";
import { CheckCircle, Copy } from "lucide-react";
import { useLocalizedTranslation } from "../hooks/useLocalizedTranslation";

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
            if (paymentData.isBooking) {
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
                        // ignore, we'll just show modal without link
                    }
                }

                if (token) {
                    setShareUrl(`${origin}/bookings/share/${token}`);
                } else {
                    setShareUrl("");
                }

                setSuccessMessage(t("payment.alerts.success_booking"));
                setShowSuccessModal(true);
            } else {
                const subscriptionId = paymentData.subscriptionId;
                if (!subscriptionId) {
                    setErrorMessage(t("payment.alerts.missing_subscription"));
                    return;
                }

                await api.post(`/member-subscriptions/${subscriptionId}/confirm-payment`, {
                    payment_reference: paymentData.paymentReference,
                    transaction_id: `M-SUB-${subscriptionId}-${Date.now()}`,
                    payment_method: "credit_card",
                    gateway_response: "member_payment_page",
                });

                setSuccessMessage(t("payment.alerts.success_subscription"));
                setTimeout(() => {
                    navigate("/member/dashboard?tab=sports", { replace: true });
                }, 1500);
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            setErrorMessage(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                t("payment.alerts.fail")
            );
        } finally {
            setProcessing(false);
        }
    };

    const currencyLabel = paymentData.currency === "EGP"
        ? t("sports.currency")
        : paymentData.currency;

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
                                ? `${paymentData.amount.toLocaleString(dateLocale)} ${currencyLabel}`
                                : t("payment.labels.waiting_cost")}
                        </span>
                    </div>
                </div>

                {successMessage ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm mb-4">
                        {successMessage}
                    </div>
                ) : null}

                {errorMessage ? (
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

            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div dir={isRTL ? "rtl" : "ltr"} className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>

                            <h2 className="text-2xl font-black text-ds-text-primary mb-2">
                                {t("payment.success_modal.title")}
                            </h2>
                            <p className="text-ds-text-secondary mb-8">
                                {t("payment.success_modal.description")}
                            </p>

                            {shareUrl && (
                                <div className={`space-y-4 mb-8 ${isRTL ? "text-right" : "text-left"}`}>
                                    <label className="block text-xs font-bold text-ds-text-muted mb-1 px-1">
                                        {t("payment.labels.invite_link")}
                                    </label>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                                        <div className="flex-1 overflow-hidden">
                                            <p
                                                dir="ltr"
                                                className="text-sm font-mono text-gray-600 truncate px-2"
                                            >
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

                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate("/member/dashboard?tab=home", { replace: true })}
                                    className="w-full h-12 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    {t("payment.actions.return_home")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberSportPaymentPage;
