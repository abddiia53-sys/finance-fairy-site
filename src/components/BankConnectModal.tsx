import { motion, AnimatePresence } from "framer-motion";
import { Link2, Shield, X, ExternalLink } from "lucide-react";
import { openTinkLink } from "@/lib/tink";
import { Button } from "@/components/ui/button";

interface BankConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: (bankName: string) => void;
}

const BankConnectModal = ({ open, onClose }: BankConnectModalProps) => {
  if (!open) return null;

  const handleConnect = () => {
    openTinkLink();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-md glass-card rounded-2xl overflow-hidden glow-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Koppla bankkonto</h3>
                <p className="text-xs text-muted-foreground">Säker koppling via Tink & BankID</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Du kommer att skickas till Tink där du loggar in med BankID för att koppla ditt bankkonto säkert.
            </p>
            <Button onClick={handleConnect} className="w-full gap-2">
              <ExternalLink className="w-4 h-4" />
              Öppna Tink Link
            </Button>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span>Krypterad anslutning · PSD2-kompatibel · BankID</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BankConnectModal;
