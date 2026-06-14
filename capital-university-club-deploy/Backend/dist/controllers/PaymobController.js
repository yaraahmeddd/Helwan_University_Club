"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymobController = void 0;
const data_source_1 = require("../database/data-source");
const Payment_1 = require("../entities/Payment");
const PaymobService_1 = require("../services/PaymobService");
const PaymentService_1 = require("../services/PaymentService");
const PaymobFinalizationService_1 = require("../services/PaymobFinalizationService");
class PaymobController {
    constructor() {
        this.paymobService = new PaymobService_1.PaymobService();
        this.paymentService = new PaymentService_1.PaymentService();
        this.finalizationService = new PaymobFinalizationService_1.PaymobFinalizationService();
        this.paymentRepo = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
    }
    getBackendBaseUrl(req) {
        return process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    }
    getFrontendBaseUrl() {
        return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    }
    buildRedirectUrl(payment, success, extra = {}) {
        const meta = (payment.metadata || {});
        const returnPath = (typeof meta.return_path === 'string' && meta.return_path.startsWith('/'))
            ? meta.return_path
            : '/member/payment';
        const params = new URLSearchParams({
            paymob: success ? 'success' : 'failed',
            paymentReference: payment.payment_reference,
            ...extra,
        });
        if (typeof meta.subscription_id === 'number' || typeof meta.subscription_id === 'string') {
            params.set('subscriptionId', String(meta.subscription_id));
        }
        if (typeof meta.booking_id === 'string') {
            params.set('bookingId', meta.booking_id);
            params.set('type', 'booking');
        }
        if (typeof meta.payment_kind === 'string') {
            params.set('type', meta.payment_kind);
        }
        return `${this.getFrontendBaseUrl()}${returnPath}?${params.toString()}`;
    }
    async start(req, res) {
        try {
            const { paymentReference, billingData, returnPath, context } = req.body;
            if (!paymentReference) {
                res.status(400).json({ success: false, error: 'paymentReference is required' });
                return;
            }
            const payment = await this.paymentRepo.findOne({ where: { payment_reference: paymentReference } });
            if (!payment) {
                res.status(404).json({ success: false, error: 'Payment not found' });
                return;
            }
            if (payment.status === 'completed') {
                res.status(400).json({ success: false, error: 'Payment already completed' });
                return;
            }
            const amountCents = Math.round(Number(payment.amount) * 100);
            if (!Number.isFinite(amountCents) || amountCents <= 0) {
                res.status(400).json({ success: false, error: 'Invalid payment amount' });
                return;
            }
            const mergedMetadata = {
                ...(payment.metadata || {}),
                ...(context || {}),
                ...(returnPath ? { return_path: returnPath } : {}),
                gateway: 'paymob',
            };
            payment.metadata = mergedMetadata;
            payment.gateway_name = 'paymob';
            payment.status = 'processing';
            await this.paymentRepo.save(payment);
            const filledBillingData = {
                first_name: billingData?.first_name || 'Test',
                last_name: billingData?.last_name || 'User',
                email: billingData?.email || 'test@example.com',
                phone_number: billingData?.phone_number || '+201000000000',
                apartment: billingData?.apartment || 'NA',
                floor: billingData?.floor || 'NA',
                street: billingData?.street || 'NA',
                building: billingData?.building || 'NA',
                shipping_method: billingData?.shipping_method || 'NA',
                postal_code: billingData?.postal_code || '00000',
                city: billingData?.city || 'Cairo',
                country: billingData?.country || 'EG',
                state: billingData?.state || 'C',
            };
            const merchantOrderId = `${payment.payment_reference}_r${Date.now()}`;
            const authToken = await this.paymobService.authenticate();
            const orderId = await this.paymobService.createOrder({
                authToken,
                amountCents,
                merchantOrderId,
                currency: payment.currency,
            });
            const redirectUrl = `${this.getBackendBaseUrl(req)}/api/paymob/redirect`;
            const paymentKey = await this.paymobService.createPaymentKey({
                authToken,
                amountCents,
                orderId,
                billingData: filledBillingData,
                currency: payment.currency,
                redirectionUrl: redirectUrl,
            });
            const iframeUrl = this.paymobService.buildIframeUrl(paymentKey);
            res.status(200).json({
                success: true,
                data: {
                    paymentReference: payment.payment_reference,
                    orderId,
                    iframeUrl,
                    redirectUrl,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to start Paymob payment',
            });
        }
    }
    async webhook(req, res) {
        try {
            const payload = req.body;
            const obj = (payload?.obj || payload);
            let paymentReference = obj?.order?.merchant_order_id ||
                obj?.merchant_order_id ||
                payload?.merchant_order_id;
            if (!paymentReference) {
                res.status(400).json({ success: false, error: 'Missing merchant_order_id (payment reference)' });
                return;
            }
            if (paymentReference.includes('_r')) {
                paymentReference = paymentReference.split('_r')[0];
            }
            const success = Boolean(obj?.success) ||
                obj?.is_success === true ||
                obj?.data?.success === true ||
                payload?.success === true;
            const transactionId = obj?.id?.toString() ||
                obj?.transaction_id?.toString() ||
                payload?.transaction_id?.toString() ||
                `paymob-${Date.now()}`;
            if (!success) {
                await this.paymentService.failPayment(paymentReference, 'Paymob reported failed payment');
                res.status(200).json({ success: true, status: 'ignored_failed' });
                return;
            }
            const payment = await this.finalizationService.finalizeAfterGatewayPayment(paymentReference, transactionId, JSON.stringify(payload));
            res.status(200).json({ success: true, payment });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to handle Paymob webhook',
            });
        }
    }
    async redirect(req, res) {
        try {
            const query = req.query;
            console.log('======= PAYMOB REDIRECT DEBUG =======');
            console.log('Original req.originalUrl:', req.originalUrl);
            console.log('Parsed req.query:', req.query);
            console.log('=====================================');
            let paymentReference = query.merchant_order_id ||
                query.payment_reference ||
                query.paymentReference ||
                '';
            if (!paymentReference) {
                res.redirect(`${this.getFrontendBaseUrl()}/member/payment?paymob=failed&reason=missing_reference`);
                return;
            }
            if (paymentReference.includes('_r')) {
                paymentReference = paymentReference.split('_r')[0];
            }
            const payment = await this.paymentRepo.findOne({ where: { payment_reference: paymentReference } });
            if (!payment) {
                res.redirect(`${this.getFrontendBaseUrl()}/member/payment?paymob=failed&paymentReference=${encodeURIComponent(paymentReference)}`);
                return;
            }
            const success = query.success === 'true' ||
                query.success === '1' ||
                payment.status === 'completed';
            if (success && payment.status !== 'completed') {
                const transactionId = query.id || query.transaction_id || `paymob-${Date.now()}`;
                await this.finalizationService.finalizeAfterGatewayPayment(paymentReference, String(transactionId), JSON.stringify(query));
            }
            const target = this.buildRedirectUrl(payment, success, query);
            res.redirect(302, target);
        }
        catch (error) {
            console.error('[PaymobController] redirect error:', error);
            res.redirect(`${this.getFrontendBaseUrl()}/member/payment?paymob=failed`);
        }
    }
    async status(req, res) {
        try {
            const paymentReference = req.params.paymentReference;
            if (!paymentReference) {
                res.status(400).json({ success: false, error: 'paymentReference is required' });
                return;
            }
            const payment = await this.paymentService.getPaymentByReference(paymentReference);
            if (!payment) {
                res.status(404).json({ success: false, error: 'Payment not found' });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    paymentReference: payment.payment_reference,
                    status: payment.status,
                    amount: Number(payment.amount),
                    currency: payment.currency,
                    completedAt: payment.completed_at,
                    metadata: payment.metadata,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch payment status',
            });
        }
    }
}
exports.PaymobController = PaymobController;
//# sourceMappingURL=PaymobController.js.map