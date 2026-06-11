import { Response } from 'express';
import { In } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Payment } from '../entities/Payment';
import { MemberTeam } from '../entities/MemberTeam';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';

export class PaymentController {
  private paymentRepo = AppDataSource.getRepository(Payment);
  private memberTeamRepo = AppDataSource.getRepository(MemberTeam);
  private teamMemberTeamRepo = AppDataSource.getRepository(TeamMemberTeam);

  async listRecent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = Math.min(Number(req.query.limit) || 100, 200);
      const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;

      const qb = this.paymentRepo
        .createQueryBuilder('payment')
        .orderBy('payment.created_at', 'DESC')
        .take(limit);

      if (statusFilter && statusFilter !== 'all') {
        qb.andWhere('payment.status = :status', { status: statusFilter });
      }

      const payments = await qb.getMany();

      res.status(200).json({
        success: true,
        data: payments.map((p) => ({
          id: p.id,
          payment_reference: p.payment_reference,
          payment_type: p.payment_type,
          entity_type: p.entity_type,
          entity_id: p.entity_id,
          amount: Number(p.amount),
          currency: p.currency,
          status: p.status,
          payment_method: p.payment_method,
          gateway_name: p.gateway_name,
          description: p.description,
          completed_at: p.completed_at,
          created_at: p.created_at,
        })),
        count: payments.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payments',
      });
    }
  }

  async subscriptionAlerts(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [memberSubs, teamMemberSubs] = await Promise.all([
        this.memberTeamRepo.find({
          where: { status: In(['active', 'approved']) },
          relations: ['member', 'team'],
        }),
        this.teamMemberTeamRepo.find({
          where: { status: In(['active', 'approved']) },
          relations: ['team_member', 'team'],
        }),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      type AlertRow = {
        memberId: number;
        memberCode: string;
        memberType: 'member' | 'team_member';
        memberNameAr: string;
        memberNameEn: string;
        subscriptionType: string;
        nextRenewalDate: string;
        teamNameAr: string;
        teamNameEn: string;
      };

      const alerts: AlertRow[] = [];

      const pushIfExpiring = (
        endDate: Date | string | null | undefined,
        row: Omit<AlertRow, 'nextRenewalDate'>,
      ) => {
        if (!endDate) return;
        const renewal = new Date(endDate);
        renewal.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 30) return;

        alerts.push({
          ...row,
          nextRenewalDate: renewal.toISOString().slice(0, 10),
        });
      };

      for (const sub of memberSubs) {
        const nationalId = sub.member?.national_id;
        pushIfExpiring(sub.end_date, {
          memberId: sub.member_id,
          memberCode: nationalId ? `MEM-${String(nationalId).slice(-4)}` : `MEM-${sub.member_id}`,
          memberType: 'member',
          memberNameAr: `${sub.member?.first_name_ar || ''} ${sub.member?.last_name_ar || ''}`.trim(),
          memberNameEn: `${sub.member?.first_name_en || ''} ${sub.member?.last_name_en || ''}`.trim(),
          subscriptionType: sub.team?.name_ar || sub.team?.name_en || 'Subscription',
          teamNameAr: sub.team?.name_ar || '',
          teamNameEn: sub.team?.name_en || '',
        });
      }

      for (const sub of teamMemberSubs) {
        const nationalId = sub.team_member?.national_id;
        pushIfExpiring(sub.end_date, {
          memberId: sub.team_member_id,
          memberCode: nationalId ? `TM-${String(nationalId).slice(-4)}` : `TM-${sub.team_member_id}`,
          memberType: 'team_member',
          memberNameAr: `${sub.team_member?.first_name_ar || ''} ${sub.team_member?.last_name_ar || ''}`.trim(),
          memberNameEn: `${sub.team_member?.first_name_en || ''} ${sub.team_member?.last_name_en || ''}`.trim(),
          subscriptionType: sub.team?.name_ar || sub.team?.name_en || 'Subscription',
          teamNameAr: sub.team?.name_ar || '',
          teamNameEn: sub.team?.name_en || '',
        });
      }

      alerts.sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate));

      res.status(200).json({ success: true, data: alerts, count: alerts.length });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscription alerts',
      });
    }
  }
}
