import { Loader2, X } from 'lucide-react';

type PaymobCheckoutFrameProps = {
  iframeUrl: string;
  onClose: () => void;
  title?: string;
};

export function PaymobCheckoutFrame({ iframeUrl, onClose, title = 'Secure Payment' }: PaymobCheckoutFrameProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close payment window"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <iframe
          title="Paymob checkout"
          src={iframeUrl}
          className="w-full h-[640px] border-0 bg-white"
          allow="payment *"
        />
      </div>
    </div>
  );
}
