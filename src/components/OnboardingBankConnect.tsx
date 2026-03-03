import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Check, ChevronRight, Link2, Loader2, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Bank {
  id: string;
  name: string;
  color: string;
}

const banks: Bank[] = [
  { id: "nordea", name: "Nordea", color: "hsl(210, 80%, 45%)" },
  { id: "seb", name: "SEB", color: "hsl(145, 60%, 35%)" },
  { id: "handelsbanken", name: "Handelsbanken", color: "hsl(210, 70%, 35%)" },
  { id: "swedbank", name: "Swedbank", color: "hsl(25, 90%, 50%)" },
  { id: "danske", name: "Danske Bank", color: "hsl(205, 75%, 40%)" },
  { id: "lansforsakringar", name: "Länsförsäkringar", color: "hsl(210, 60%, 50%)" },
];

type Step = "welcome" | "select" | "connecting" | "success";

interface OnboardingBankConnectProps {
  onComplete: () => void;
}

const OnboardingBankConnect = ({ onComplete }: OnboardingBankConnectProps) => {
  const [step, setStep] = useState<Step>("welcome");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setStep("connecting");
    setTimeout(() => setStep("success"), 2500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold">
            <span className="text-gradient">26</span>
            <span className="text-muted-foreground">.io</span>
          </h1>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden glow-border">
          <AnimatePresence mode="wait">
            {step === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 flex flex-col items-center text-center"
              >
                <div className="p-4 rounded-2xl bg-primary/10 mb-6">
                  <Building2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-2">Välkommen!</h2>
                <p className="text-muted-foreground mb-2">
                  Koppla ditt bankkonto för att automatiskt importera transaktioner och få en komplett ekonomisk överblick.
                </p>
                <p className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Säker koppling via Tink · PSD2-kompatibel
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <Button onClick={() => setStep("select")} className="w-full">
                    Koppla bankkonto
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <button
                    onClick={onComplete}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hoppa över för nu
                  </button>
                </div>
              </motion.div>
            )}

            {step === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">Välj din bank</h3>
                    <p className="text-xs text-muted-foreground">Importera transaktioner automatiskt</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => handleSelectBank(bank)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: bank.color + "22", color: bank.color }}
                        >
                          {bank.name.charAt(0)}
                        </div>
                        <span className="font-medium text-sm">{bank.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={onComplete}
                  className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                >
                  Hoppa över
                </button>
              </motion.div>
            )}

            {step === "connecting" && selectedBank && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 flex flex-col items-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6"
                  style={{ backgroundColor: selectedBank.color + "22", color: selectedBank.color }}
                >
                  {selectedBank.name.charAt(0)}
                </div>
                <Loader2 className="w-6 h-6 text-primary animate-spin mb-4" />
                <p className="font-display font-semibold">Ansluter till {selectedBank.name}...</p>
                <p className="text-sm text-muted-foreground mt-1">Hämtar dina transaktioner</p>
              </motion.div>
            )}

            {step === "success" && selectedBank && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6"
                >
                  <Check className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="font-display font-semibold text-lg">Ansluten!</p>
                <p className="text-sm text-muted-foreground mt-1 mb-2">
                  {selectedBank.name} är nu kopplad
                </p>
                <div className="bg-secondary/50 rounded-lg px-4 py-3 text-center mt-2">
                  <p className="text-2xl font-display font-bold text-primary">47</p>
                  <p className="text-xs text-muted-foreground">transaktioner importerade</p>
                </div>
                <Button onClick={onComplete} className="mt-6 w-full">
                  Gå till dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingBankConnect;
