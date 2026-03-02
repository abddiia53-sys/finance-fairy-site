import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Info, TrendingUp, TrendingDown, Scale, Receipt } from "lucide-react";
import type { Transaction } from "@/pages/Index";

interface FinancialInsightsProps {
  transactions: Transaction[];
  mode: "personal" | "business";
}

interface Warning {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  level: "warning" | "info" | "danger";
}

const FinancialInsights = ({ transactions, mode }: FinancialInsightsProps) => {
  const analysis = useMemo(() => {
    const income = transactions.filter(t => t.type === "income");
    const expenses = transactions.filter(t => t.type === "expense");
    const totalIncome = income.reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalExpense = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);
    const balance = totalIncome - totalExpense;
    const marginPercent = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

    // Category breakdown
    const categoryMap = new Map<string, number>();
    expenses.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + Math.abs(t.amount));
    });
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percent: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Warnings
    const warnings: Warning[] = [];

    // Check if a single category dominates
    const topCategory = categoryBreakdown[0];
    if (topCategory && topCategory.percent > 40) {
      warnings.push({
        id: "high-category",
        icon: <AlertTriangle className="w-4 h-4" />,
        title: "Hög koncentration",
        message: `${topCategory.category} står för ${topCategory.percent}% av dina utgifter (${topCategory.amount.toLocaleString("sv-SE")} kr). Överväg att diversifiera.`,
        level: "warning",
      });
    }

    // Low margin
    if (marginPercent < 20 && totalIncome > 0) {
      warnings.push({
        id: "low-margin",
        icon: <TrendingDown className="w-4 h-4" />,
        title: "Låg marginal",
        message: `Din marginal är bara ${marginPercent}%. ${mode === "business" ? "Sikta på minst 20% för en hälsosam affär." : "Försök minska utgifterna."}`,
        level: "danger",
      });
    }

    // Negative balance
    if (balance < 0) {
      warnings.push({
        id: "negative-balance",
        icon: <AlertTriangle className="w-4 h-4" />,
        title: "Negativt saldo",
        message: `Du spenderar ${Math.abs(balance).toLocaleString("sv-SE")} kr mer än du tjänar. Åtgärda detta omedelbart.`,
        level: "danger",
      });
    }

    // VAT reminder (business mode)
    if (mode === "business") {
      const now = new Date();
      const dayOfMonth = now.getDate();
      const momsDeadline = 12;
      if (dayOfMonth >= 1 && dayOfMonth <= momsDeadline) {
        warnings.push({
          id: "vat-reminder",
          icon: <Receipt className="w-4 h-4" />,
          title: "Moms snart",
          message: `Momsdeklaration ska vara inne senast den ${momsDeadline}:e. Se till att allt stämmer i tid.`,
          level: "info",
        });
      }

      if (totalIncome > 0 && marginPercent >= 20) {
        warnings.push({
          id: "healthy",
          icon: <TrendingUp className="w-4 h-4" />,
          title: "Bra marginal",
          message: `Din vinstmarginal på ${marginPercent}% ser hälsosam ut. Fortsätt så!`,
          level: "info",
        });
      }
    }

    // Expensive single transaction
    const avgExpense = totalExpense / (expenses.length || 1);
    const expensiveTx = expenses.filter(t => Math.abs(t.amount) > avgExpense * 2.5);
    if (expensiveTx.length > 0) {
      const biggest = expensiveTx.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];
      warnings.push({
        id: "expensive-tx",
        icon: <AlertTriangle className="w-4 h-4" />,
        title: "Detta ser dyrt ut",
        message: `"${biggest.description}" (${Math.abs(biggest.amount).toLocaleString("sv-SE")} kr) är ${Math.round(Math.abs(biggest.amount) / avgExpense)}× ditt genomsnitt.`,
        level: "warning",
      });
    }

    return { totalIncome, totalExpense, balance, marginPercent, categoryBreakdown, warnings };
  }, [transactions, mode]);

  const fmt = (v: number) => v.toLocaleString("sv-SE") + " kr";

  const levelStyles = {
    warning: "border-l-warning bg-warning/5",
    danger: "border-l-destructive bg-destructive/5",
    info: "border-l-primary bg-primary/5",
  };
  const levelIconColor = {
    warning: "text-warning",
    danger: "text-destructive",
    info: "text-primary",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Balance Summary */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display font-semibold">Ekonomisk sammanfattning</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {mode === "business"
            ? `Ditt företag har hittills genererat ${fmt(analysis.totalIncome)} i intäkter och lagt ut ${fmt(analysis.totalExpense)} i utgifter. Det ger ett nettoresultat på ${fmt(analysis.balance)}, vilket motsvarar en marginal på ${analysis.marginPercent}%.`
            : `Du har fått in ${fmt(analysis.totalIncome)} och spenderat ${fmt(analysis.totalExpense)}. Ditt saldo är ${fmt(analysis.balance)}. ${analysis.balance >= 0 ? "Du har pengar kvar att spara eller investera." : "Du behöver se över dina utgifter."}`}
        </p>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 text-center">
            <p className="text-xs text-muted-foreground mb-1">Inkomster</p>
            <p className="text-lg font-bold font-display stat-positive">{fmt(analysis.totalIncome)}</p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 text-center">
            <p className="text-xs text-muted-foreground mb-1">Utgifter</p>
            <p className="text-lg font-bold font-display stat-negative">{fmt(analysis.totalExpense)}</p>
          </div>
          <div className={`p-4 rounded-lg text-center ${analysis.balance >= 0 ? "bg-primary/10" : "bg-destructive/10"}`}>
            <p className="text-xs text-muted-foreground mb-1">Saldo</p>
            <p className={`text-lg font-bold font-display ${analysis.balance >= 0 ? "stat-positive" : "stat-negative"}`}>
              {fmt(analysis.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-display font-semibold">Varningar & insikter</h3>
          </div>
          <div className="space-y-3">
            {analysis.warnings.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`border-l-4 rounded-r-lg p-4 ${levelStyles[w.level]}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 ${levelIconColor[w.level]}`}>{w.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{w.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{w.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Category Table */}
      {analysis.categoryBreakdown.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-display font-semibold">Utgifter per kategori</h3>
            <p className="text-sm text-muted-foreground mt-1">Översikt av var pengarna går</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Kategori</th>
                  <th className="text-right px-6 py-3 text-muted-foreground font-medium">Belopp</th>
                  <th className="text-right px-6 py-3 text-muted-foreground font-medium">Andel</th>
                  <th className="px-6 py-3 text-muted-foreground font-medium text-left">Fördelning</th>
                </tr>
              </thead>
              <tbody>
                {analysis.categoryBreakdown.map((cat, i) => (
                  <motion.tr
                    key={cat.category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium">{cat.category}</td>
                    <td className="px-6 py-3 text-right tabular-nums stat-negative">{fmt(cat.amount)}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{cat.percent}%</td>
                    <td className="px-6 py-3">
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percent}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          className="h-full rounded-full bg-destructive/70"
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FinancialInsights;
