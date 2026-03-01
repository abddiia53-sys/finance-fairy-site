import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

const mockTransactions: Transaction[] = [
  { id: "1", description: "Kundbetalning - Webbprojekt", amount: 45000, category: "Intäkt", date: "2026-02-28", type: "income" },
  { id: "2", description: "Kontorshyra", amount: -12500, category: "Lokal", date: "2026-02-27", type: "expense" },
  { id: "3", description: "Konsultarvode", amount: 28000, category: "Intäkt", date: "2026-02-25", type: "income" },
  { id: "4", description: "Programvarulicenser", amount: -3200, category: "IT", date: "2026-02-24", type: "expense" },
  { id: "5", description: "Lön", amount: -35000, category: "Personal", date: "2026-02-23", type: "expense" },
  { id: "6", description: "Försäljning produkter", amount: 18500, category: "Intäkt", date: "2026-02-22", type: "income" },
  { id: "7", description: "Marknadsföring", amount: -8900, category: "Marknadsföring", date: "2026-02-20", type: "expense" },
  { id: "8", description: "Freelanceuppdrag", amount: 15000, category: "Intäkt", date: "2026-02-19", type: "income" },
];

const TransactionList = () => {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-display font-semibold">Senaste transaktioner</h3>
        <p className="text-sm text-muted-foreground mt-1">Dina senaste rörelser</p>
      </div>
      <div className="divide-y divide-border">
        {mockTransactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center justify-between px-6 py-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${tx.type === "income" ? "bg-primary/10" : "bg-destructive/10"}`}>
                {tx.type === "income" ? (
                  <ArrowDownLeft className="w-4 h-4 text-primary" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{tx.category} · {tx.date}</p>
              </div>
            </div>
            <p className={`text-sm font-semibold tabular-nums ${
              tx.type === "income" ? "stat-positive" : "stat-negative"
            }`}>
              {tx.type === "income" ? "+" : ""}{tx.amount.toLocaleString("sv-SE")} kr
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
