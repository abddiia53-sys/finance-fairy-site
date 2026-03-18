import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, CheckCircle2, Loader2 } from "lucide-react";

type Status = "waiting" | "scanning" | "signing" | "success";

interface BankIDSimulatorProps {
  onComplete: () => void;
  onCancel: () => void;
}

const STATUS_CONFIG: Record<Status, { label: string; sublabel: string; duration: number }> = {
  waiting: { label: "Öppna BankID", sublabel: "Starta BankID-appen på din mobil", duration: 3000 },
  scanning: { label: "Identifierar...", sublabel: "Skriv in din säkerhetskod i BankID-appen", duration: 2500 },
  signing: { label: "Signerar...", sublabel: "Bekräftar din identitet", duration: 2000 },
  success: { label: "Identifierad!", sublabel: "Du loggas in...", duration: 1200 },
};

const STEPS: Status[] = ["waiting", "scanning", "signing", "success"];

const BankIDSimulator = ({ onComplete, onCancel }: BankIDSimulatorProps) => {
  const [status, setStatus] = useState<Status>("waiting");

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

  const config = STATUS_CONFIG[status];
  const isSuccess = status === "success";

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
        {/* BankID header */}
        <div className="bg-[hsl(220,20%,10%)] px-6 py-4 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-[hsl(210,80%,55%)] flex items-center justify-center">
            <span className="text-white font-bold text-xs">B</span>
          </div>
          <span className="font-semibold text-foreground text-sm">BankID Säkerhetsapp</span>
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
                isSuccess ? "bg-[hsl(var(--success)/0.15)]" : "bg-[hsl(210,80%,55%,0.12)]"
              }`}>
                {isSuccess ? (
                  <CheckCircle2 className="w-8 h-8 text-[hsl(var(--success))]" />
                ) : status === "waiting" ? (
                  <Smartphone className="w-8 h-8 text-[hsl(210,80%,55%)]" />
                ) : (
                  <Loader2 className="w-8 h-8 text-[hsl(210,80%,55%)] animate-spin" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-1">{config.label}</h3>
              <p className="text-sm text-muted-foreground">{config.sublabel}</p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex gap-2 mt-8">
            {STEPS.map((step, i) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= STEPS.indexOf(status)
                    ? "w-6 bg-[hsl(210,80%,55%)]"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Cancel */}
        {!isSuccess && (
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
