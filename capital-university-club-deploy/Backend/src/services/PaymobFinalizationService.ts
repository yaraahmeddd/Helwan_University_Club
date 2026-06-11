import { AppDataSource } from '../database/data-source';
import { Payment } from '../entities/Payment';
import { MemberTeam } from '../entities/MemberTeam';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { Booking } from '../entities/Booking';
import { PaymentService } from './PaymentService';
import { BookingService } from './BookingService';

const paymentService = new PaymentService();
const bookingService = new BookingService(AppDataSource);

export class PaymobFinalizationService {
  private memberTeamRepo = AppDataSource.getRepository(MemberTeam);
  private teamMemberTeamRepo = AppDataSource.getRepository(TeamMemberTeam);
  private bookingRepo = AppDataSource.getRepository(Booking);

  async finalizeAfterGatewayPayment(
    paymentReference: string,
    transactionId: string,
    gatewayResponse?: string,
  ): Promise<Payment> {
    const existing = await paymentService.getPaymentByReference(paymentReference);
    if (!existing) {
      throw new Error(`Payment not found with reference: ${paymentReference}`);
    }

    const payment =
      existing.status === 'completed'
        ? existing
        : await paymentService.confirmPayment(paymentReference, {
            transactionId,
            paymentMethod: 'credit_card',
            gatewayResponse: gatewayResponse || 'paymob',
            metadata: { gateway: 'paymob' },
          });

    await this.applyBusinessSideEffects(payment);
    return payment;
  }

  async applyBusinessSideEffects(payment: Payment): Promise<void> {
    const meta = (payment.metadata || {}) as Record<string, unknown>;

    if (payment.payment_type === 'team_subscription') {
      const subscriptionId = Number(meta.subscription_id);
      if (!Number.isFinite(subscriptionId) || subscriptionId <= 0) return;

      if (payment.entity_type === 'member') {
        const subscription = await this.memberTeamRepo.findOne({ where: { id: subscriptionId } });
        if (!subscription) return;
        if (subscription.subscription_status !== 'pending_payment' && subscription.status === 'active') {
          return;
        }
        subscription.payment_id = payment.id;
        subscription.payment_reference = payment.payment_reference;
        subscription.payment_completed_at = payment.completed_at || new Date();
        subscription.subscription_status = 'active';
        subscription.status = 'active';
        await this.memberTeamRepo.save(subscription);
        return;
      }

      if (payment.entity_type === 'team_member') {
        const subscription = await this.teamMemberTeamRepo.findOne({ where: { id: subscriptionId } });
        if (!subscription) return;
        if (subscription.subscription_status !== 'pending_payment' && subscription.status === 'active') {
          return;
        }
        subscription.payment_id = payment.id;
        subscription.payment_reference = payment.payment_reference;
        subscription.payment_completed_at = payment.completed_at || new Date();
        subscription.subscription_status = 'active';
        subscription.status = 'active';
        await this.teamMemberTeamRepo.save(subscription);
      }
      return;
    }

    if (payment.payment_type === 'field_booking') {
      const bookingId =
        (typeof meta.booking_id === 'string' && meta.booking_id) ||
        (payment.related_entity_type === 'field_booking' ? payment.related_entity_id : null);
      if (!bookingId) return;

      const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
      if (!booking || booking.status === 'confirmed') return;

      await bookingService.confirmBooking(bookingId, payment.payment_reference);
    }
  }
}
