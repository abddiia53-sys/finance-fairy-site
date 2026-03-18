import { useMemo } from "react";
import { motion } from "framer-motion";
import { HeartPulse, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Transaction } from "@/pages/Index";

interface FinancialHealthProps {
  transactions: Transaction[];
  mode: "personal" | "business";
}

function computeHealthScore(transactions: Transaction[]): {
  score: number;
  factors: { label: string; impact: "positive" | "negative" | "neutral"; detail: string }[];
} {
  if (transactions.length === 0) return { score: 50, factors: [] };

  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + Math.abs(t.amount), 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);

  const factors: { label: string; impact: "positive" | "negative" | "neutral"; detail: string }[] = [];
  let score = 50; // Start neutral

  // 1. Savings ratio (income vs expenses) — up to ±25 points
  const savingsRatio = income > 0 ? (income - expenses) / income : 0;
  if (savingsRatio >= 0.3) {
    score += 25;
    factors.push({ label: "Sparkvot", impact: "positive", detail: `${Math.round(savingsRatio * 100)}% av inkomsten sparas` });
  } else if (savingsRatio >= 0.1) {
    score += 15;
    factors.push({ label: "Sparkvot", impact: "positive", detail: `${Math.round(savingsRatio * 100)}% sparas – bra men kan bli bättre` });
  } else if (savingsRatio >= 0) {
    score += 5;
    factors.push({ label: "Sparkvot", impact: "neutral", detail: `Bara ${Math.round(savingsRatio * 100)}% sparas` });
  } else {
    score -= 20;
    factors.push({ label: "Underskott", impact: "negative", detail: `Utgifterna överstiger inkomsterna med ${Math.round(Math.abs(savingsRatio) * 100)}%` });
  }

  // 2. Expense diversity — up to ±15 points
  const categories = new Set(transactions.filter(t => t.type === "expense").map(t => t.category));
  if (categories.size >= 3) {
    score += 10;
    factors.push({ label: "Diversifiering", impact: "positive", detail: `Utgifter spridda över ${categories.size} kategorier` });
  } else if (categories.size <= 1) {
    score -= 5;
    factors.push({ label: "Diversifiering", impact: "neutral", detail: "Alla utgifter i samma kategori" });
  }

  // 3. Income stability — up to ±10 points
  const incomeCount = transactions.filter(t => t.type === "income").length;
  if (incomeCount >= 2) {
    score += 10;
    factors.push({ label: "Inkomststabilitet", impact: "positive", detail: `${incomeCount} inkomstkällor` });
  } else if (incomeCount === 1) {
    score += 5;
    factors.push({ label: "Inkomststabilitet", impact: "neutral", detail: "En inkomstkälla" });
  } else {
    score -= 10;
    factors.push({ label: "Ingen inkomst", impact: "negative", detail: "Inga inkomster registrerade" });
  }

  // Clamp
  score = Math.max(1, Math.min(100, score));

  return { score, factors };
}

function getScoreColor(score: number): string {
  if (score >= 90) return "hsl(var(--success))";
  if (score >= 70) return "hsl(155, 60%, 48%)";
  if (score >= 50) return "hsl(45, 80%, 55%)";
  return "hsl(var(--destructive))";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Utmärkt";
  if (score >= 70) return "Bra";
  if (score >= 50) return "Okej";
  if (score >= 30) return "Behöver förbättras";
  return "Kritiskt";
}

const FinancialHealth = ({ transactions, mode }: FinancialHealthProps) => {
  const { score, factors } = useMemo(() => computeHealthScore(transactions), [transactions]);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // SVG gauge
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const impactIcon = {
    positive: <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--success))]" />,
    negative: <TrendingDown className="w-3.5 h-3.5 text-destructive" />,
    neutral: <Minus className="w-3.5 h-3.5 text-muted-foreground" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <HeartPulse className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-semibold">
          {mode === "personal" ? "Ekonomisk hälsa" : "Företagets hälsa"}
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Gauge */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            <motion.circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-display font-bold"
              style={{ color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        </div>

        {/* Factors */}
        <div className="flex-1 space-y-3 w-full">
          {score < 90 && (
            <p className="text-xs text-muted-foreground mb-3">
              Mål: 90+ poäng för optimal ekonomisk hälsa
            </p>
          )}
          {factors.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              {impactIcon[f.impact]}
              <div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialHealth;
