"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymobService = void 0;
const https_1 = __importDefault(require("https"));
function postJson(url, body) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const data = JSON.stringify(body);
        const req = https_1.default.request({
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        }, (res) => {
            let raw = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => (raw += chunk));
            res.on('end', () => {
                const statusCode = res.statusCode ?? 0;
                if (statusCode < 200 || statusCode >= 300) {
                    reject(new Error(`Paymob request failed (${statusCode}): ${raw}`));
                    return;
                }
                try {
                    resolve(JSON.parse(raw));
                }
                catch {
                    reject(new Error(`Failed to parse Paymob response: ${raw}`));
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}
class PaymobService {
    constructor() {
        this.apiBase = 'https://accept.paymob.com/api';
    }
    readEnv(name) {
        const value = process.env[name]?.trim();
        if (!value) {
            throw new Error(`Missing ${name}. Add it to Backend/.env, then restart the backend server.`);
        }
        return value;
    }
    getApiKey() {
        return this.readEnv('PAYMOB_API_KEY');
    }
    getIntegrationId() {
        const v = this.readEnv('PAYMOB_INTEGRATION_ID');
        const n = Number(v);
        if (!Number.isFinite(n))
            throw new Error('Invalid PAYMOB_INTEGRATION_ID');
        return n;
    }
    getIframeId() {
        const v = this.readEnv('PAYMOB_IFRAME_ID');
        const n = Number(v);
        if (!Number.isFinite(n))
            throw new Error('Invalid PAYMOB_IFRAME_ID');
        return n;
    }
    async authenticate() {
        const res = await postJson(`${this.apiBase}/auth/tokens`, {
            api_key: this.getApiKey(),
        });
        return res.token;
    }
    async createOrder(params) {
        const res = await postJson(`${this.apiBase}/ecommerce/orders`, {
            auth_token: params.authToken,
            delivery_needed: false,
            amount_cents: String(params.amountCents),
            currency: params.currency || 'EGP',
            merchant_order_id: params.merchantOrderId,
            items: [],
        });
        return res.id;
    }
    async createPaymentKey(params) {
        const body = {
            auth_token: params.authToken,
            amount_cents: String(params.amountCents),
            expiration: 3600,
            order_id: params.orderId,
            billing_data: params.billingData,
            currency: params.currency || 'EGP',
            integration_id: this.getIntegrationId(),
            lock_order_when_paid: false,
        };
        if (params.redirectionUrl) {
            body.redirection_url = params.redirectionUrl;
        }
        const res = await postJson(`${this.apiBase}/acceptance/payment_keys`, body);
        return res.token;
    }
    buildIframeUrl(paymentKey) {
        const iframeId = this.getIframeId();
        return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${encodeURIComponent(paymentKey)}`;
    }
}
exports.PaymobService = PaymobService;
//# sourceMappingURL=PaymobService.js.map