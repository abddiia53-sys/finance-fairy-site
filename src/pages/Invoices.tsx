import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowLeft, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
}

const demoInvoices: Invoice[] = [
  { id: "1", number: "F-2026-001", client: "Webbyrå AB", amount: 45000, date: "2026-02-01", dueDate: "2026-03-01", status: "paid" },
  { id: "2", number: "F-2026-002", client: "Tech Solutions", amount: 28000, date: "2026-02-10", dueDate: "2026-03-10", status: "paid" },
  { id: "3", number: "F-2026-003", client: "Design Studio", amount: 15000, date: "2026-02-15", dueDate: "2026-03-15", status: "pending" },
  { id: "4", number: "F-2026-004", client: "Startup Inc", amount: 18500, date: "2026-02-20", dueDate: "2026-03-20", status: "pending" },
  { id: "5", number: "F-2025-045", client: "Konsult Partner", amount: 32000, date: "2026-01-05", dueDate: "2026-02-05", status: "overdue" },
  { id: "6", number: "F-2025-044", client: "E-handel AB", amount: 22500, date: "2026-01-15", dueDate: "2026-02-15", status: "overdue" },
];

const statusConfig = {
  paid: { label: "Betald", icon: CheckCircle2, variant: "default" as const, cls: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]" },
  pending: { label: "Väntar", icon: Clock, variant: "secondary" as const, cls: "bg-[hsl(45,80%,55%,0.15)] text-[hsl(45,80%,55%)] border-[hsl(45,80%,55%,0.3)]" },
  overdue: { label: "Förfallen", icon: AlertCircle, variant: "destructive" as const, cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

const Invoices = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"personal" | "business">("business");

  const fmt = (v: number) => v.toLocaleString("sv-SE") + " kr";

  const totalPaid = demoInvoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = demoInvoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = demoInvoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode={mode} onModeChange={setMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Tillbaka
          </button>
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary" />
            <div>
              <h2 className="text-3xl font-display font-bold">Fakturor</h2>
              <p className="text-muted-foreground mt-1">Översikt av alla fakturor</p>
            </div>
          </div>
        </motion.div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Betalda", value: fmt(totalPaid), count: demoInvoices.filter(i => i.status === "paid").length, cls: "text-[hsl(var(--success))]" },
            { label: "Väntande", value: fmt(totalPending), count: demoInvoices.filter(i => i.status === "pending").length, cls: "text-[hsl(45,80%,55%)]" },
            { label: "Förfallna", value: fmt(totalOverdue), count: demoInvoices.filter(i => i.status === "overdue").length, cls: "text-destructive" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-5"
            >
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              <p className={`text-2xl font-display font-bold ${card.cls}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.count} fakturor</p>
            </motion.div>
          ))}
        </div>

        {/* Invoice list */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-display font-semibold">Alla fakturor</h3>
          </div>
          <div className="divide-y divide-border">
            {demoInvoices.map((invoice, i) => {
              const sc = statusConfig[invoice.status];
              return (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-10 h-10 rounded-lg bg-muted/30 items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{invoice.number}</p>
                      <p className="text-xs text-muted-foreground">{invoice.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">Förfaller</p>
                      <p className="text-xs text-foreground">{invoice.dueDate}</p>
                    </div>
                    <p className="text-sm font-display font-semibold text-foreground w-24 text-right">{fmt(invoice.amount)}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${sc.cls}`}>
                      <sc.icon className="w-3 h-3" />
                      {sc.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Invoices;
