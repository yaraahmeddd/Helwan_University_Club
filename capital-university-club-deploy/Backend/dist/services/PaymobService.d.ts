export type PaymobAuthResponse = {
    token: string;
};
export type PaymobCreateOrderResponse = {
    id: number;
};
export type PaymobPaymentKeyResponse = {
    token: string;
};
export type PaymobBillingData = {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    apartment: string;
    floor: string;
    street: string;
    building: string;
    shipping_method: string;
    postal_code: string;
    city: string;
    country: string;
    state: string;
};
export declare class PaymobService {
    private apiBase;
    private readEnv;
    private getApiKey;
    private getIntegrationId;
    private getIframeId;
    authenticate(): Promise<string>;
    createOrder(params: {
        authToken: string;
        amountCents: number;
        merchantOrderId: string;
        currency?: string;
    }): Promise<number>;
    createPaymentKey(params: {
        authToken: string;
        amountCents: number;
        orderId: number;
        billingData: PaymobBillingData;
        currency?: string;
        redirectionUrl?: string;
    }): Promise<string>;
    buildIframeUrl(paymentKey: string): string;
}
//# sourceMappingURL=PaymobService.d.ts.map