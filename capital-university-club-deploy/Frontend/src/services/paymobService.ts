import api from '@/services/axios';

export type PaymobBillingInput = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
};

export type PaymobStartContext = {
  subscription_id?: number;
  booking_id?: string;
  payment_kind?: 'subscription' | 'booking';
  sportName?: string;
  amount?: number;
  currency?: string;
};

export type PaymobStartResponse = {
  paymentReference: string;
  orderId: number;
  iframeUrl: string;
  redirectUrl: string;
};

export type PaymobStatusResponse = {
  paymentReference: string;
  status: string;
  amount: number;
  currency: string;
  completedAt?: string | null;
  metadata?: Record<string, unknown>;
};

export async function startPaymobPayment(args: {
  paymentReference: string;
  returnPath: string;
  context?: PaymobStartContext;
  billingData?: PaymobBillingInput;
}): Promise<PaymobStartResponse> {
  const res = await api.post<{ success: boolean; data: PaymobStartResponse }>('/paymob/start', args);
  if (!res.data?.data?.iframeUrl) {
    throw new Error('Failed to initialize Paymob checkout');
  }
  return res.data.data;
}

export async function getPaymobPaymentStatus(paymentReference: string): Promise<PaymobStatusResponse> {
  const res = await api.get<{ success: boolean; data: PaymobStatusResponse }>(
    `/paymob/status/${encodeURIComponent(paymentReference)}`,
  );
  return res.data.data;
}

export async function waitForPaymobCompletion(
  paymentReference: string,
  opts?: { attempts?: number; intervalMs?: number },
): Promise<PaymobStatusResponse> {
  const attempts = opts?.attempts ?? 30;
  const intervalMs = opts?.intervalMs ?? 2000;

  for (let i = 0; i < attempts; i++) {
    const status = await getPaymobPaymentStatus(paymentReference);
    if (status.status === 'completed') return status;
    if (status.status === 'failed' || status.status === 'cancelled') {
      throw new Error('Payment was not completed');
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Payment confirmation timed out');
}

export function isPaymobReturnSuccess(searchParams: URLSearchParams): boolean {
  return searchParams.get('paymob') === 'success';
}

export function isPaymobReturnFailed(searchParams: URLSearchParams): boolean {
  return searchParams.get('paymob') === 'failed';
}
