import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/StaffPagesComponents/ui/dialog';
import { PaymobCheckoutFrame } from '@/components/shared/PaymobCheckoutFrame';
import { startPaymobPayment, waitForPaymobCompletion } from '@/services/paymobService';
import { Loader2, AlertCircle } from 'lucide-react';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';

interface AdminPaymobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentReference: string;
  amount: number;
  description: string;
}

export function AdminPaymobModal({
  isOpen,
  onClose,
  onSuccess,
  paymentReference,
  amount,
  description,
}: AdminPaymobModalProps) {
  const { t } = useLocalizedTranslation('finance');
  const { t: tCommon } = useLocalizedTranslation('common');
  
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && paymentReference) {
      void initializePayment();
    } else {
      setIframeUrl(null);
      setError(null);
    }
  }, [isOpen, paymentReference]);

  const initializePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      // Start payment
      const res = await startPaymobPayment({
        paymentReference,
        returnPath: `/staff/dashboard/finance/subscriptions`, // They will return to the same page
        context: {
          sportName: description,
          amount,
        },
      });

      setIframeUrl(res.iframeUrl);
      pollForCompletion(paymentReference);
    } catch (err: any) {
      console.error('Failed to init Paymob for admin:', err);
      setError(err.message || tCommon('errors.default'));
    } finally {
      setLoading(false);
    }
  };

  const pollForCompletion = async (ref: string) => {
    try {
      await waitForPaymobCompletion(ref, { attempts: 60, intervalMs: 3000 });
      // Payment successful!
      onSuccess();
    } catch (err) {
      // It might have failed or cancelled, we don't necessarily show an error 
      // unless they are still on the modal.
      console.warn('Paymob polling ended:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Pay via Paymob</DialogTitle>
          <DialogDescription>
            Reference: <span className="font-mono text-xs">{paymentReference}</span> • Amount: <span className="font-semibold">{amount} EGP</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 bg-muted/10 relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">{tCommon('loading')}...</p>
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-lg font-semibold mb-2">Initialization Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {iframeUrl && !loading && (
            <div className="flex-1 w-full h-full overflow-hidden">
              <PaymobCheckoutFrame iframeUrl={iframeUrl} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
