import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { StatCard } from '@/components/StaffPagesComponents/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/StaffPagesComponents/ui/table';
import { Badge } from '@/components/StaffPagesComponents/ui/badge';
import { Button } from '@/components/StaffPagesComponents/ui/button';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import api from '@/services/axios';

type ApiPayment = {
  id: number;
  payment_reference: string;
  payment_type: string;
  entity_type?: string;
  entity_id?: number;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  description?: string;
  completed_at?: string | null;
  created_at: string;
};

export default function FinancePage() {
  const { t } = useLocalizedTranslation("finance");
  const { language, isRTL } = useLanguage();
  const dateLocale = language === "en" ? "en-US" : "ar-EG";

  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: ApiPayment[] }>("/payments/recent", {
        params: { limit: 100 },
      });
      setPayments(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  const totalRevenue = useMemo(
    () => payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  const pendingAmount = useMemo(
    () => payments.filter((p) => p.status === "pending" || p.status === "processing").reduce((sum, p) => sum + p.amount, 0),
    [payments],
  );

  const currency = t("subscriptions.currency");

  const statusLabel = (status: string) => {
    if (status === "completed") return t("financePage.paymentStatus.paid");
    if (status === "failed" || status === "cancelled") return status;
    return t("financePage.paymentStatus.unpaid");
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("financePage.title")}</h1>
        <Button variant="outline" size="sm" onClick={() => void fetchPayments()} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t("subscriptions.refresh")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title={t("financePage.totalRevenue")} value={`${totalRevenue.toLocaleString(dateLocale)} ${currency}`} icon={DollarSign} />
        <StatCard title={t("financePage.pendingPayments")} value={`${pendingAmount.toLocaleString(dateLocale)} ${currency}`} icon={AlertCircle} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-card shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("financePage.table.reference")}</TableHead>
              <TableHead>{t("financePage.table.type")}</TableHead>
              <TableHead>{t("financePage.table.amount")}</TableHead>
              <TableHead>{t("financePage.table.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                  {t("subscriptions.refresh")}
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                  {t("subscriptions.empty.none")}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">{payment.payment_reference}</TableCell>
                  <TableCell>{payment.payment_type}</TableCell>
                  <TableCell className="font-poppins">{payment.amount.toLocaleString(dateLocale)} {payment.currency}</TableCell>
                  <TableCell>
                    <Badge className={payment.status === "completed" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                      {statusLabel(payment.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
