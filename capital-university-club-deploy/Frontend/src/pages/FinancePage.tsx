import { motion } from "framer-motion";
import { DollarSign, AlertCircle } from "lucide-react";
import { StatCard } from "../components/StaffPagesComponents/StatCard";
import { mockPayments } from "../data/mockData";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
import { useLocalizedTranslation } from "../hooks/useLocalizedTranslation";
import { useLanguage } from "../hooks/useLanguage";

export default function FinancePage() {
  const { t } = useLocalizedTranslation("finance");
  const { language, isRTL } = useLanguage();
  const dateLocale = language === "en" ? "en-US" : "ar-EG";

  const totalRevenue = mockPayments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = mockPayments.filter((p) => p.status === "unpaid").reduce((sum, p) => sum + p.amount, 0);
  const currency = t("subscriptions.currency");

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold">{t("financePage.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title={t("financePage.totalRevenue")} value={`${totalRevenue.toLocaleString(dateLocale)} ${currency}`} icon={DollarSign} />
        <StatCard title={t("financePage.pendingPayments")} value={`${pendingAmount.toLocaleString(dateLocale)} ${currency}`} icon={AlertCircle} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-card shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("financePage.table.member")}</TableHead>
              <TableHead>{t("financePage.table.sport")}</TableHead>
              <TableHead>{t("financePage.table.amount")}</TableHead>
              <TableHead>{t("financePage.table.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPayments.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{payment.member}</TableCell>
                <TableCell>{payment.sport}</TableCell>
                <TableCell className="font-poppins">{payment.amount}</TableCell>
                <TableCell>
                  <Badge className={payment.status === "paid" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                    {payment.status === "paid"
                      ? t("financePage.paymentStatus.paid")
                      : t("financePage.paymentStatus.unpaid")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
