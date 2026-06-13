import { Loader2, X } from 'lucide-react';

type PaymobCheckoutFrameProps = {
  iframeUrl: string;
  onClose: () => void;
  title?: string;
};

export function PaymobCheckoutFrame({ iframeUrl, onClose, title = 'Secure Payment' }: PaymobCheckoutFrameProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6">
      <div className="w-full max-w-[600px] h-[750px] max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0 bg-white z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-ds-text-primary">
            <Loader2 className="h-4 w-4 animate-spin text-ds-primary" />
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Close payment window"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 w-full relative bg-gray-50">
          <iframe
            title="Paymob checkout"
            src={iframeUrl}
            className="absolute inset-0 w-full h-full border-0"
            allow="payment *"
          />
        </div>
      </div>
    </div>
  );
}
