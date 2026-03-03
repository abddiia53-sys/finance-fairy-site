import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import OverviewChart from "@/components/OverviewChart";
import TransactionList from "@/components/TransactionList";
import QuickActions from "@/components/QuickActions";
import BankConnectModal from "@/components/BankConnectModal";
import AddTransactionModal from "@/components/AddTransactionModal";
import FinancialInsights from "@/components/FinancialInsights";
import OnboardingBankConnect from "@/components/OnboardingBankConnect";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

const initialBusinessTx: Transaction[] = [
  { id: "1", description: "Kundbetalning - Webbprojekt", amount: 45000, category: "Intäkt", date: "2026-02-28", type: "income" },
  { id: "2", description: "Kontorshyra", amount: -12500, category: "Lokal", date: "2026-02-27", type: "expense" },
  { id: "3", description: "Konsultarvode", amount: 28000, category: "Intäkt", date: "2026-02-25", type: "income" },
  { id: "4", description: "Programvarulicenser", amount: -3200, category: "IT", date: "2026-02-24", type: "expense" },
  { id: "5", description: "Lön", amount: -35000, category: "Personal", date: "2026-02-23", type: "expense" },
  { id: "6", description: "Försäljning produkter", amount: 18500, category: "Intäkt", date: "2026-02-22", type: "income" },
  { id: "7", description: "Marknadsföring", amount: -8900, category: "Marknadsföring", date: "2026-02-20", type: "expense" },
  { id: "8", description: "Freelanceuppdrag", amount: 15000, category: "Intäkt", date: "2026-02-19", type: "income" },
];

const initialPersonalTx: Transaction[] = [
  { id: "p1", description: "Lön", amount: 42000, category: "Lön", date: "2026-02-25", type: "income" },
  { id: "p2", description: "Hyra", amount: -9500, category: "Boende", date: "2026-02-27", type: "expense" },
  { id: "p3", description: "Matinköp", amount: -4200, category: "Mat", date: "2026-02-26", type: "expense" },
  { id: "p4", description: "Elräkning", amount: -1800, category: "Räkningar", date: "2026-02-24", type: "expense" },
  { id: "p5", description: "Sidoinkomst", amount: 5000, category: "Extra", date: "2026-02-20", type: "income" },
];

function computeStats(transactions: Transaction[], mode: "business" | "personal") {
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = totalIncome - totalExpense;

  const fmt = (v: number) => v.toLocaleString("sv-SE") + " kr";

  if (mode === "business") {
    return [
      { title: "Total intäkt", value: fmt(totalIncome), change: `${transactions.filter(t => t.type === "income").length} poster`, changeType: "positive" as const, icon: TrendingUp },
      { title: "Totala utgifter", value: fmt(totalExpense), change: `${transactions.filter(t => t.type === "expense").length} poster`, changeType: "negative" as const, icon: TrendingDown },
      { title: "Nettoresultat", value: fmt(net), change: net >= 0 ? "Positivt" : "Negativt", changeType: net >= 0 ? "positive" as const : "negative" as const, icon: Wallet },
      { title: "Sparande", value: fmt(Math.max(0, Math.round(net * 0.4))), change: "40% av netto", changeType: "neutral" as const, icon: PiggyBank },
    ];
  }
  return [
    { title: "Inkomst", value: fmt(totalIncome), change: `${transactions.filter(t => t.type === "income").length} poster`, changeType: "positive" as const, icon: TrendingUp },
    { title: "Utgifter", value: fmt(totalExpense), change: `${transactions.filter(t => t.type === "expense").length} poster`, changeType: "positive" as const, icon: TrendingDown },
    { title: "Saldo", value: fmt(net), change: net >= 0 ? "Positivt" : "Negativt", changeType: net >= 0 ? "positive" as const : "negative" as const, icon: Wallet },
    { title: "Sparande", value: fmt(Math.max(0, Math.round(net * 0.5))), change: "50% av saldo", changeType: "neutral" as const, icon: PiggyBank },
  ];
}

const Index = () => {
  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem("26io_onboarded") === "true";
  });
  const [mode, setMode] = useState<"personal" | "business">("business");
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<"income" | "expense">("expense");

  const [businessTx, setBusinessTx] = useState<Transaction[]>(initialBusinessTx);
  const [personalTx, setPersonalTx] = useState<Transaction[]>(initialPersonalTx);

  const transactions = mode === "business" ? businessTx : personalTx;
  const setTransactions = mode === "business" ? setBusinessTx : setPersonalTx;

  const stats = useMemo(() => computeStats(transactions, mode), [transactions, mode]);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions]
  );

  const handleBankConnected = (bankName: string) => {
    toast.success(`${bankName} kopplad!`, {
      description: "47 transaktioner har importerats till din översikt.",
    });
  };

  const handleAddTransaction = (tx: { description: string; amount: number; category: string; type: "income" | "expense"; date?: string }) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      description: tx.description,
      amount: tx.type === "expense" ? -tx.amount : tx.amount,
      category: tx.category,
      date: tx.date || new Date().toISOString().split("T")[0],
      type: tx.type,
    };
    setTransactions(prev => [newTx, ...prev]);
    toast.success(`${tx.type === "income" ? "Intäkt" : "Utgift"} tillagd`, {
      description: `${tx.description} – ${tx.amount.toLocaleString("sv-SE")} kr`,
    });
  };

  const openExpenseModal = () => { setTxModalType("expense"); setTxModalOpen(true); };
  const openIncomeModal = () => { setTxModalType("income"); setTxModalOpen(true); };

  const handleOnboardingComplete = () => {
    localStorage.setItem("26io_onboarded", "true");
    setOnboarded(true);
  };

  if (!onboarded) {
    return <OnboardingBankConnect onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode={mode} onModeChange={setMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mb-8">
          <h2 className="text-3xl font-display font-bold">
            {mode === "business" ? "Företagsöversikt" : "Privatöversikt"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {mode === "business" ? "Håll koll på ditt företags ekonomi" : "Din personliga ekonomiska överblick"}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <StatCard key={stat.title} {...stat} delay={i * 0.1} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <OverviewChart />
              </div>
              <QuickActions onConnectBank={() => setBankModalOpen(true)} onAddExpense={openExpenseModal} onAddIncome={openIncomeModal} />
            </div>

            <FinancialInsights transactions={transactions} mode={mode} />

            <div className="mt-8">
              <TransactionList transactions={sortedTransactions} />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <BankConnectModal open={bankModalOpen} onClose={() => setBankModalOpen(false)} onConnected={handleBankConnected} />
      <AddTransactionModal open={txModalOpen} onClose={() => setTxModalOpen(false)} onAdd={handleAddTransaction} initialType={txModalType} />
    </div>
  );
};

export default Index;
