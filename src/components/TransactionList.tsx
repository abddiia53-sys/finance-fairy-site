import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

import type { Transaction } from "@/pages/Index";

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-display font-semibold">Senaste transaktioner</h3>
        <p className="text-sm text-muted-foreground mt-1">Dina senaste rörelser</p>
      </div>
      <div className="divide-y divide-border">
        {transactions.map((tx, i) => (
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
