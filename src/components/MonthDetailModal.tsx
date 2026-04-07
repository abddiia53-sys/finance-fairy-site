import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Transaction } from "@/pages/Index";

interface MonthDetailModalProps {
  open: boolean;
  onClose: () => void;
  month: string | null;
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Boende: "hsl(210, 80%, 55%)",
  Mat: "hsl(155, 60%, 48%)",
  Transport: "hsl(45, 80%, 55%)",
  Nöje: "hsl(280, 60%, 55%)",
  Abonnemang: "hsl(0, 65%, 52%)",
  Hälsa: "hsl(30, 70%, 50%)",
  Kläder: "hsl(340, 60%, 55%)",
  Försäkring: "hsl(180, 50%, 45%)",
  Lön: "hsl(155, 60%, 48%)",
  Extrainkomst: "hsl(120, 50%, 45%)",
  Övrigt: "hsl(215, 12%, 50%)",
};

const fmt = (v: number) => v.toLocaleString("sv-SE") + " kr";

const MonthDetailModal = ({ open, onClose, month, transactions }: MonthDetailModalProps) => {
  const monthTransactions = useMemo(() => {
    if (!month) return [];
    return transactions.filter((t) => {
      const d = new Date(t.date);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
      return monthNames[d.getMonth()] === month;
    });
  }, [month, transactions]);

  const stats = useMemo(() => {
    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expenses, net: income - expenses };
  }, [monthTransactions]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + Math.abs(t.amount));
      });
    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || "hsl(215, 12%, 50%)",
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions]);

  const sorted = useMemo(
    () => [...monthTransactions].sort((a, b) => b.date.localeCompare(a.date)),
    [monthTransactions]
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold">
            {month} – Månadsöversikt
          </DialogTitle>
        </DialogHeader>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: "Inkomst", value: stats.income, icon: TrendingUp, cls: "text-primary" },
            { label: "Utgifter", value: stats.expenses, icon: TrendingDown, cls: "text-destructive" },
            { label: "Saldo", value: stats.net, icon: Wallet, cls: stats.net >= 0 ? "text-primary" : "text-destructive" },
          ].map((card) => (
            <div key={card.label} className="rounded-lg bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.cls}`} />
              </div>
              <p className="text-lg font-display font-bold">{fmt(card.value)}</p>
            </div>
          ))}
        </div>

        {/* Category pie chart */}
        {categoryBreakdown.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Utgifter per kategori</h4>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-48 w-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => fmt(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-foreground">{cat.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{fmt(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transaction list */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            Transaktioner ({sorted.length} st)
          </h4>
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {sorted.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">Inga transaktioner denna månad</p>
            )}
            {sorted.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${tx.type === "income" ? "bg-primary/10" : "bg-destructive/10"}`}>
                    {tx.type === "income" ? (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.category} · {tx.date}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold tabular-nums ${tx.type === "income" ? "text-primary" : "text-destructive"}`}>
                  {tx.type === "income" ? "+" : ""}{tx.amount.toLocaleString("sv-SE")} kr
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonthDetailModal;
