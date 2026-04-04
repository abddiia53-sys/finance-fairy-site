import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import OverviewChart from "@/components/OverviewChart";
import TransactionList from "@/components/TransactionList";
import QuickActions from "@/components/QuickActions";
import BankConnectModal from "@/components/BankConnectModal";
import AddTransactionModal from "@/components/AddTransactionModal";
import FinancialInsights from "@/components/FinancialInsights";
import FinancialHealth from "@/components/FinancialHealth";
import UnnecessaryCosts from "@/components/UnnecessaryCosts";
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

const initialPersonalTx: Transaction[] = [
  { id: "1", description: "Lön", amount: 32000, category: "Lön", date: "2026-02-25", type: "income" },
  { id: "2", description: "Hyra", amount: -9500, category: "Boende", date: "2026-02-27", type: "expense" },
  { id: "3", description: "ICA Maxi", amount: -1850, category: "Mat", date: "2026-02-26", type: "expense" },
  { id: "4", description: "Spotify Premium Family", amount: -189, category: "Nöje", date: "2026-02-24", type: "expense" },
  { id: "5", description: "Netflix Standard", amount: -139, category: "Nöje", date: "2026-02-23", type: "expense" },
  { id: "6", description: "Swish från Marcus", amount: 500, category: "Övrigt", date: "2026-02-22", type: "income" },
  { id: "7", description: "SL Månadskort", amount: -970, category: "Transport", date: "2026-02-20", type: "expense" },
  { id: "8", description: "Coop Konsum", amount: -620, category: "Mat", date: "2026-02-19", type: "expense" },
  { id: "9", description: "Gymkort SATS", amount: -449, category: "Hälsa", date: "2026-02-18", type: "expense" },
  { id: "10", description: "Telia mobilabonnemang", amount: -349, category: "Abonnemang", date: "2026-02-15", type: "expense" },
  { id: "11", description: "ChatGPT Plus", amount: -249, category: "Abonnemang", date: "2026-02-14", type: "expense" },
  { id: "12", description: "H&M Online", amount: -799, category: "Kläder", date: "2026-02-13", type: "expense" },
  { id: "13", description: "Hemförsäkring Länsförsäkringar", amount: -320, category: "Försäkring", date: "2026-02-10", type: "expense" },
  { id: "14", description: "Frilansuppdrag", amount: 5000, category: "Extrainkomst", date: "2026-02-08", type: "income" },
  { id: "15", description: "Disney+", amount: -119, category: "Nöje", date: "2026-02-07", type: "expense" },
  { id: "16", description: "Elräkning Vattenfall", amount: -890, category: "Boende", date: "2026-02-05", type: "expense" },
];

function computeStats(transactions: Transaction[]) {
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = totalIncome - totalExpense;
  const fmt = (v: number) => v.toLocaleString("sv-SE") + " kr";

  return [
    { title: "Inkomst", value: fmt(totalIncome), change: `${transactions.filter(t => t.type === "income").length} poster`, changeType: "positive" as const, icon: TrendingUp },
    { title: "Utgifter", value: fmt(totalExpense), change: `${transactions.filter(t => t.type === "expense").length} poster`, changeType: "negative" as const, icon: TrendingDown },
    { title: "Saldo", value: fmt(net), change: net >= 0 ? "Positivt" : "Negativt", changeType: net >= 0 ? "positive" as const : "negative" as const, icon: Wallet },
    { title: "Sparande", value: fmt(Math.max(0, Math.round(net * 0.5))), change: "50% av saldo", changeType: "neutral" as const, icon: PiggyBank },
  ];
}

const Index = () => {
  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem("26io_onboarded") === "true";
  });
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<"income" | "expense">("expense");

  const [transactions, setTransactions] = useState<Transaction[]>(initialPersonalTx);

  const stats = useMemo(() => computeStats(transactions), [transactions]);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions]
  );

  const handleBankConnected = (bankName: string) => {
    toast.success(`${bankName} kopplad!`, {
      description: "Transaktioner har importerats till din översikt.",
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
    toast.success(`${tx.type === "income" ? "Inkomst" : "Utgift"} tillagd`, {
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
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mb-8">
          <h2 className="text-3xl font-display font-bold">Min ekonomi</h2>
          <p className="text-muted-foreground mt-1">Håll koll på din privatekonomi</p>
        </motion.div>

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

        <FinancialInsights transactions={transactions} mode="personal" />

        <div className="mt-6">
          <UnnecessaryCosts transactions={transactions} />
        </div>

        <div className="mt-6">
          <FinancialHealth transactions={transactions} mode="personal" />
        </div>

        <div className="mt-8">
          <TransactionList transactions={sortedTransactions} />
        </div>
      </main>

      <BankConnectModal open={bankModalOpen} onClose={() => setBankModalOpen(false)} onConnected={handleBankConnected} />
      <AddTransactionModal open={txModalOpen} onClose={() => setTxModalOpen(false)} onAdd={handleAddTransaction} initialType={txModalType} />
    </div>
  );
};

export default Index;
