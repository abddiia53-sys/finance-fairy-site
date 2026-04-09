import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, HelpCircle, X } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

const explanations: Record<string, string> = {
  "Inkomst": "Totala pengar som kommit in, t.ex. lön, bidrag eller Swish.",
  "Utgifter": "Totala pengar som gått ut, t.ex. hyra, mat och abonnemang.",
  "Saldo": "Skillnaden mellan inkomster och utgifter. Positivt = du har pengar kvar.",
  "Sparande": "Hälften av ditt saldo som föreslås att sparas undan.",
};

const StatCard = ({ title, value, change, changeType = "neutral", icon: Icon, delay = 0 }: StatCardProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-xl p-6 relative overflow-hidden group hover:border-primary/30 transition-colors duration-300 cursor-pointer"
      onClick={() => setShowInfo((v) => !v)}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
            {title}
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50" />
          </p>
          <p className="text-3xl font-bold font-display tracking-tight">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${
              changeType === "positive" ? "stat-positive" : 
              changeType === "negative" ? "stat-negative" : 
              "text-muted-foreground"
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>

      <AnimatePresence>
        {showInfo && explanations[title] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 mt-3 pt-3 border-t border-border"
          >
            <p className="text-xs text-muted-foreground leading-relaxed">{explanations[title]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StatCard;
