import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';

export interface PaymentResultViewProps {
    status: 'success' | 'failed' | 'processing';
    title?: string;
    message?: string | null;
    onPrimaryAction: () => void;
    primaryActionLabel?: string;
    onSecondaryAction?: () => void;
    secondaryActionLabel?: string;
    children?: React.ReactNode;
}

export const PaymentResultView: React.FC<PaymentResultViewProps> = ({
    status,
    title,
    message,
    onPrimaryAction,
    primaryActionLabel,
    onSecondaryAction,
    secondaryActionLabel,
    children,
}) => {
    const { t, isRTL } = useLocalizedTranslation("team"); // Using team since we found payment keys there

    const isSuccess = status === 'success';
    const isFailed = status === 'failed';
    const isProcessing = status === 'processing';

    const defaultTitle = isSuccess 
        ? t("payment.success_modal.title") 
        : isFailed 
            ? t("payment.alerts.fail") 
            : t("payment.actions.processing");

    const defaultMessage = isSuccess 
        ? t("payment.success_modal.description") 
        : isFailed 
            ? t("payment.alerts.incomplete_data") 
            : "";

    return (
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
            <div dir={isRTL ? "rtl" : "ltr"} className="w-full max-w-[500px] bg-white border border-ds-border rounded-3xl shadow-xl overflow-hidden">
                <div className="p-10 text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-500 ${
                        isSuccess ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-blue-50"
                    }`}>
                        {isSuccess && <CheckCircle className="w-12 h-12 text-green-600 animate-in zoom-in" />}
                        {isFailed && <XCircle className="w-12 h-12 text-red-600 animate-in zoom-in" />}
                        {isProcessing && <Loader2 className="w-12 h-12 text-ds-primary animate-spin" />}
                    </div>

                    <h2 className="text-3xl font-black text-ds-text-primary mb-4">
                        {title || defaultTitle}
                    </h2>
                    
                    <p className="text-ds-text-secondary text-lg mb-8 leading-relaxed">
                        {message || defaultMessage}
                    </p>

                    {children && (
                        <div className="mb-10">
                            {children}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={onPrimaryAction}
                            disabled={isProcessing}
                            className={`w-full h-14 font-bold rounded-xl transition-colors text-lg ${
                                isSuccess 
                                    ? "bg-green-600 hover:bg-green-700 text-white" 
                                    : isFailed 
                                        ? "bg-red-600 hover:bg-red-700 text-white" 
                                        : "bg-ds-primary hover:bg-ds-primary-dark text-white opacity-50 cursor-not-allowed"
                            }`}
                        >
                            {primaryActionLabel || (isSuccess ? t("payment.actions.return_home") : isFailed ? t("payment.actions.back") : t("payment.actions.processing"))}
                        </button>
                        
                        {onSecondaryAction && !isProcessing && (
                            <button
                                type="button"
                                onClick={onSecondaryAction}
                                className="w-full h-14 bg-transparent border-2 border-gray-200 text-ds-text-primary font-bold rounded-xl hover:bg-gray-50 transition-colors text-lg"
                            >
                                {secondaryActionLabel || t("payment.actions.back")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
