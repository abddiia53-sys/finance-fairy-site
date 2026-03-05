import { motion } from "framer-motion";
import { Building2, ArrowRight, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openTinkLink } from "@/lib/tink";

interface OnboardingBankConnectProps {
  onComplete: () => void;
}

const OnboardingBankConnect = ({ onComplete }: OnboardingBankConnectProps) => {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 flex flex-col items-center text-center"
          >
            <div className="p-4 rounded-2xl bg-primary/10 mb-6">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Välkommen!</h2>
            <p className="text-muted-foreground mb-2">
              Koppla ditt bankkonto via Tink och BankID för att automatiskt importera transaktioner och få en komplett ekonomisk överblick.
            </p>
            <p className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Säker koppling via Tink · PSD2-kompatibel · BankID
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button onClick={() => openTinkLink()} className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Koppla bankkonto via BankID
              </Button>
              <button
                onClick={onComplete}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Hoppa över för nu
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingBankConnect;
