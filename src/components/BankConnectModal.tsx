import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Check, ChevronRight, Link2, Loader2, Shield, X } from "lucide-react";

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

type Step = "select" | "connecting" | "success";

interface BankConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: (bankName: string) => void;
}

const BankConnectModal = ({ open, onClose, onConnected }: BankConnectModalProps) => {
  const [step, setStep] = useState<Step>("select");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setStep("connecting");

    // Simulate connection
    setTimeout(() => {
      setStep("success");
    }, 2500);
  };

  const handleDone = () => {
    if (selectedBank) onConnected(selectedBank.name);
    setStep("select");
    setSelectedBank(null);
    onClose();
  };

  const handleClose = () => {
    setStep("select");
    setSelectedBank(null);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-md glass-card rounded-2xl overflow-hidden glow-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Koppla bankkonto</h3>
                <p className="text-xs text-muted-foreground">Säker koppling via Tink</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === "select" && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <p className="text-sm text-muted-foreground mb-4">Välj din bank för att importera transaktioner automatiskt.</p>
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
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Krypterad anslutning · PSD2-kompatibel</span>
                  </div>
                </motion.div>
              )}

              {step === "connecting" && selectedBank && (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center py-8"
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
                  className="flex flex-col items-center py-8"
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
                  <button
                    onClick={handleDone}
                    className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    Klar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BankConnectModal;
