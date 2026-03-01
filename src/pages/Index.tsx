import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import OverviewChart from "@/components/OverviewChart";
import TransactionList from "@/components/TransactionList";
import QuickActions from "@/components/QuickActions";
import BankConnectModal from "@/components/BankConnectModal";
import AddTransactionModal from "@/components/AddTransactionModal";
import { toast } from "sonner";

const businessStats = [
  { title: "Total intäkt", value: "476 500 kr", change: "+12.5% mot förra månaden", changeType: "positive" as const, icon: TrendingUp },
  { title: "Totala utgifter", value: "284 600 kr", change: "+3.2% mot förra månaden", changeType: "negative" as const, icon: TrendingDown },
  { title: "Nettoresultat", value: "191 900 kr", change: "+23.1% mot förra månaden", changeType: "positive" as const, icon: Wallet },
  { title: "Sparande", value: "85 000 kr", change: "42% av mål", changeType: "neutral" as const, icon: PiggyBank },
];

const personalStats = [
  { title: "Inkomst", value: "42 000 kr", change: "Lön + extra", changeType: "positive" as const, icon: TrendingUp },
  { title: "Utgifter", value: "28 300 kr", change: "-5.1% mot förra månaden", changeType: "positive" as const, icon: TrendingDown },
  { title: "Saldo", value: "13 700 kr", change: "+18% mot förra månaden", changeType: "positive" as const, icon: Wallet },
  { title: "Sparande", value: "125 000 kr", change: "62% av mål", changeType: "neutral" as const, icon: PiggyBank },
];

const Index = () => {
  const [mode, setMode] = useState<"personal" | "business">("business");
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<"income" | "expense">("expense");
  const stats = mode === "business" ? businessStats : personalStats;

  const handleBankConnected = (bankName: string) => {
    toast.success(`${bankName} kopplad!`, {
      description: "47 transaktioner har importerats till din översikt.",
    });
  };

  const handleAddTransaction = (tx: { description: string; amount: number; category: string; type: "income" | "expense" }) => {
    toast.success(`${tx.type === "income" ? "Intäkt" : "Utgift"} tillagd`, {
      description: `${tx.description} – ${tx.amount.toLocaleString("sv-SE")} kr`,
    });
  };

  const openExpenseModal = () => {
    setTxModalType("expense");
    setTxModalOpen(true);
  };

  const openIncomeModal = () => {
    setTxModalType("income");
    setTxModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar mode={mode} onModeChange={setMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-display font-bold">
            {mode === "business" ? "Företagsöversikt" : "Privatöversikt"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {mode === "business"
              ? "Håll koll på ditt företags ekonomi"
              : "Din personliga ekonomiska överblick"}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <StatCard key={stat.title} {...stat} delay={i * 0.1} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <OverviewChart />
              </div>
              <QuickActions
                onConnectBank={() => setBankModalOpen(true)}
                onAddExpense={openExpenseModal}
                onAddIncome={openIncomeModal}
              />
            </div>

            <TransactionList />
          </motion.div>
        </AnimatePresence>
      </main>

      <BankConnectModal
        open={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        onConnected={handleBankConnected}
      />

      <AddTransactionModal
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onAdd={handleAddTransaction}
        initialType={txModalType}
      />
    </div>
  );
};

export default Index;
