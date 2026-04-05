import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, CheckCircle2, Loader2, ScanLine, BarChart3 } from "lucide-react";

type Status = "waiting" | "scanning" | "signing" | "success" | "bank_scanning" | "analyzing" | "done";

interface BankIDSimulatorProps {
  onComplete: () => void;
  onCancel: () => void;
}

const STATUS_CONFIG: Record<Status, { label: string; sublabel: string; duration: number }> = {
  waiting: { label: "Öppna BankID", sublabel: "Starta BankID-appen på din mobil", duration: 2500 },
  scanning: { label: "Identifierar...", sublabel: "Skriv in din säkerhetskod i BankID-appen", duration: 2000 },
  signing: { label: "Signerar...", sublabel: "Bekräftar din identitet", duration: 1800 },
  success: { label: "Identifierad!", sublabel: "Ansluter till din bank...", duration: 1500 },
  bank_scanning: { label: "Hämtar transaktioner", sublabel: "Skannar dina konton och transaktioner...", duration: 3000 },
  analyzing: { label: "Analyserar ekonomin", sublabel: "Beräknar inkomst, utgifter och sparande...", duration: 2500 },
  done: { label: "Klart!", sublabel: "Din ekonomi är redo att visas", duration: 1200 },
};

const STEPS: Status[] = ["waiting", "scanning", "signing", "success", "bank_scanning", "analyzing", "done"];

const BankIDSimulator = ({ onComplete, onCancel }: BankIDSimulatorProps) => {
  const [status, setStatus] = useState<Status>("waiting");
  const [transactionCount, setTransactionCount] = useState(0);

  useEffect(() => {
    const currentIndex = STEPS.indexOf(status);
    if (currentIndex < STEPS.length - 1) {
      const timer = setTimeout(() => {
        setStatus(STEPS[currentIndex + 1]);
      }, STATUS_CONFIG[status].duration);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, STATUS_CONFIG[status].duration);
      return () => clearTimeout(timer);
    }
  }, [status, onComplete]);

  // Animate transaction counter during bank_scanning
  useEffect(() => {
    if (status === "bank_scanning") {
      setTransactionCount(0);
      const interval = setInterval(() => {
        setTransactionCount(prev => {
          if (prev >= 16) { clearInterval(interval); return 16; }
          return prev + 1;
        });
      }, 170);
      return () => clearInterval(interval);
    }
  }, [status]);

  const config = STATUS_CONFIG[status];
  const isBankPhase = ["bank_scanning", "analyzing", "done"].includes(status);
  const isDone = status === "done";
  const isSuccess = status === "success";

  const getIcon = () => {
    if (isDone) return <CheckCircle2 className="w-8 h-8 text-[hsl(var(--success))]" />;
    if (status === "analyzing") return <BarChart3 className="w-8 h-8 text-[hsl(270,70%,60%)] animate-pulse" />;
    if (status === "bank_scanning") return <ScanLine className="w-8 h-8 text-[hsl(210,80%,55%)] animate-pulse" />;
    if (isSuccess) return <CheckCircle2 className="w-8 h-8 text-[hsl(var(--success))]" />;
    if (status === "waiting") return <Smartphone className="w-8 h-8 text-[hsl(210,80%,55%)]" />;
    return <Loader2 className="w-8 h-8 text-[hsl(210,80%,55%)] animate-spin" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm mx-4 rounded-2xl bg-card border border-border overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-[hsl(220,20%,10%)] px-6 py-4 flex items-center gap-3 border-b border-border">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isBankPhase ? "bg-[hsl(270,70%,55%)]" : "bg-[hsl(210,80%,55%)]"
          }`}>
            <span className="text-white font-bold text-xs">{isBankPhase ? "FF" : "B"}</span>
          </div>
          <span className="font-semibold text-foreground text-sm">
            {isBankPhase ? "Finance Fairy" : "BankID Säkerhetsapp"}
          </span>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${
                isDone ? "bg-[hsl(var(--success)/0.15)]"
                  : isBankPhase ? "bg-[hsl(270,70%,55%,0.12)]"
                  : isSuccess ? "bg-[hsl(var(--success)/0.15)]"
                  : "bg-[hsl(210,80%,55%,0.12)]"
              }`}>
                {getIcon()}
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-1">{config.label}</h3>
              <p className="text-sm text-muted-foreground">{config.sublabel}</p>

              {status === "bank_scanning" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground mt-3 tabular-nums"
                >
                  {transactionCount} transaktioner hittade
                </motion.p>
              )}

              {status === "analyzing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 space-y-1 text-xs text-muted-foreground"
                >
                  <p>✓ 16 transaktioner importerade</p>
                  <p>✓ Inkomst & utgifter beräknade</p>
                  <p className="animate-pulse">⟳ Analyserar sparpotential...</p>
                </motion.div>
              )}

              {isDone && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 space-y-1 text-xs text-muted-foreground"
                >
                  <p>✓ 16 transaktioner</p>
                  <p>✓ Inkomst & utgifter analyserade</p>
                  <p>✓ Sparpotential identifierad</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-8">
            {STEPS.map((step, i) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= STEPS.indexOf(status)
                    ? `w-4 ${isBankPhase ? "bg-[hsl(270,70%,55%)]" : "bg-[hsl(210,80%,55%)]"}`
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Cancel - only show in BankID phase */}
        {!isSuccess && !isBankPhase && (
          <div className="px-6 pb-6">
            <button
              onClick={onCancel}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Avbryt
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BankIDSimulator;
