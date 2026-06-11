import { useCallback, useEffect, useState } from 'react';
import api from '@/services/axios';
import {
  computePaymentStatus,
  getDaysUntilRenewal,
  type MemberPayment,
} from '@/data/paymentsData';

export type PaymentAlertRow = MemberPayment & {
  memberNameAr?: string;
  memberNameEn?: string;
  teamNameAr?: string;
  teamNameEn?: string;
};

export function usePaymentAlerts(enabled = true) {
  const [alerts, setAlerts] = useState<PaymentAlertRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!enabled) {
      setAlerts([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Array<Record<string, unknown>> }>(
        '/payments/subscription-alerts',
      );
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];

      const mapped: PaymentAlertRow[] = rows.map((row) => ({
        memberId: Number(row.memberId),
        memberCode: String(row.memberCode || ''),
        memberType: row.memberType === 'team_member' ? 'team_member' : 'member',
        lastPaymentDate: '',
        lastPaymentAmount: 0,
        nextRenewalDate: String(row.nextRenewalDate || ''),
        subscriptionType: String(row.subscriptionType || ''),
        paymentStatus: computePaymentStatus(String(row.nextRenewalDate || '')),
        memberNameAr: String(row.memberNameAr || ''),
        memberNameEn: String(row.memberNameEn || ''),
        teamNameAr: String(row.teamNameAr || ''),
        teamNameEn: String(row.teamNameEn || ''),
      }));

      mapped.sort((a, b) => {
        const sa = computePaymentStatus(a.nextRenewalDate);
        const sb = computePaymentStatus(b.nextRenewalDate);
        if (sa === 'overdue' && sb !== 'overdue') return -1;
        if (sb === 'overdue' && sa !== 'overdue') return 1;
        return getDaysUntilRenewal(a.nextRenewalDate) - getDaysUntilRenewal(b.nextRenewalDate);
      });

      setAlerts(mapped);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, loading, refresh: fetchAlerts };
}
