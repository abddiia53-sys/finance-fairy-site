import { useMemo } from "react";
import { motion } from "framer-motion";
import { Repeat, Layers, TrendingUp, Scissors } from "lucide-react";
import type { Transaction } from "@/pages/Index";

interface UnnecessaryCostsProps {
  transactions: Transaction[];
}

interface Subscription {
  vendor: string;
  monthlyAmount: number;
  count: number;
}

interface Insight {
  id: string;
  icon: React.ReactNode;
  text: string;
  type: "subscription" | "duplicate" | "spike";
}

// Known subscription vendors to match against
const KNOWN_VENDORS = [
  "spotify", "netflix", "adobe", "chatgpt", "openai", "microsoft", "apple",
  "google", "dropbox", "slack", "notion", "figma", "canva", "hbo", "disney",
  "youtube", "linkedin", "github", "heroku", "aws", "azure", "zoom",
  "viaplay", "telia", "comviq", "tele2", "halebop",
];

const AI_TOOLS = ["chatgpt", "openai", "copilot", "claude", "midjourney", "jasper", "gemini"];
const STREAMING = ["spotify", "netflix", "hbo", "disney", "viaplay", "youtube", "apple tv", "apple music"];
const SOFTWARE = ["adobe", "figma", "canva", "notion", "slack", "microsoft 365", "google workspace"];

function matchesVendor(description: string, vendors: string[]): string | null {
  const lower = description.toLowerCase();
  return vendors.find(v => lower.includes(v)) || null;
}

function categorizeTools(desc: string): string | null {
  const lower = desc.toLowerCase();
  if (AI_TOOLS.some(t => lower.includes(t))) return "AI-verktyg";
  if (STREAMING.some(t => lower.includes(t))) return "Streaming";
  if (SOFTWARE.some(t => lower.includes(t))) return "Programvara";
  return null;
}

const UnnecessaryCosts = ({ transactions }: UnnecessaryCostsProps) => {
  const insights = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense");
    const result: Insight[] = [];
    const fmt = (v: number) => v.toLocaleString("sv-SE") + " kr";

    // 1. Recurring subscriptions – find expenses from known vendors
    const vendorMap = new Map<string, { total: number; count: number }>();
    expenses.forEach(t => {
      const vendor = matchesVendor(t.description, KNOWN_VENDORS);
      if (vendor) {
        const existing = vendorMap.get(vendor) || { total: 0, count: 0 };
        existing.total += Math.abs(t.amount);
        existing.count += 1;
        vendorMap.set(vendor, existing);
      }
    });

    const subscriptions: Subscription[] = [];
    vendorMap.forEach((data, vendor) => {
      if (data.count >= 1) {
        subscriptions.push({
          vendor: vendor.charAt(0).toUpperCase() + vendor.slice(1),
          monthlyAmount: Math.round(data.total / Math.max(1, data.count)),
          count: data.count,
        });
      }
    });

    if (subscriptions.length > 0) {
      const totalMonthly = subscriptions.reduce((s, sub) => s + sub.monthlyAmount, 0);
      result.push({
        id: "subs-total",
        icon: <Repeat className="w-4 h-4" />,
        text: `Du har ${subscriptions.length} återkommande abonnemang som kostar totalt ${fmt(totalMonthly)}/mån: ${subscriptions.map(s => `${s.vendor} (${fmt(s.monthlyAmount)})`).join(", ")}.`,
        type: "subscription",
      });
    }

    // 2. Duplicate tools – multiple services in same category
    const toolCategoryMap = new Map<string, { vendors: string[]; total: number }>();
    expenses.forEach(t => {
      const category = categorizeTools(t.description);
      if (category) {
        const vendor = matchesVendor(t.description, [...AI_TOOLS, ...STREAMING, ...SOFTWARE]);
        if (vendor) {
          const existing = toolCategoryMap.get(category) || { vendors: [], total: 0 };
          if (!existing.vendors.includes(vendor)) {
            existing.vendors.push(vendor);
          }
          existing.total += Math.abs(t.amount);
          toolCategoryMap.set(category, existing);
        }
      }
    });

    toolCategoryMap.forEach((data, category) => {
      if (data.vendors.length >= 2) {
        result.push({
          id: `dup-${category}`,
          icon: <Layers className="w-4 h-4" />,
          text: `Du betalar för ${data.vendors.length} olika ${category.toLowerCase()}-tjänster (${data.vendors.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(", ")}) som tillsammans kostar ${fmt(data.total)}.`,
          type: "duplicate",
        });
      }
    });

    // 3. Unusually high costs – compare category averages
    const categoryTotals = new Map<string, number[]>();
    expenses.forEach(t => {
      const arr = categoryTotals.get(t.category) || [];
      arr.push(Math.abs(t.amount));
      categoryTotals.set(t.category, arr);
    });

    categoryTotals.forEach((amounts, category) => {
      if (amounts.length < 2) return;
      const sorted = [...amounts].sort((a, b) => a - b);
      const withoutLast = sorted.slice(0, -1);
      const avg = withoutLast.reduce((s, v) => s + v, 0) / withoutLast.length;
      const latest = sorted[sorted.length - 1];
      if (avg > 0 && latest > avg * 1.4) {
        const increasePercent = Math.round(((latest - avg) / avg) * 100);
        result.push({
          id: `spike-${category}`,
          icon: <TrendingUp className="w-4 h-4" />,
          text: `Din kostnad för "${category}" ökade med ${increasePercent}% jämfört med genomsnittet (${fmt(latest)} vs snitt ${fmt(Math.round(avg))}).`,
          type: "spike",
        });
      }
    });

    return result;
  }, [transactions]);

  if (insights.length === 0) return null;

  const typeStyles = {
    subscription: "text-warning",
    duplicate: "text-destructive",
    spike: "text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Scissors className="w-5 h-5 text-warning" />
        <h3 className="text-lg font-display font-semibold">Potentiellt onödiga kostnader</h3>
      </div>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <motion.li
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 text-sm"
          >
            <span className={`mt-0.5 shrink-0 ${typeStyles[insight.type]}`}>{insight.icon}</span>
            <span className="text-muted-foreground">{insight.text}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default UnnecessaryCosts;
