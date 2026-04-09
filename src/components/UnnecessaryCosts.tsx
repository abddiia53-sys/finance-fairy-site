import { useMemo } from "react";
import { motion } from "framer-motion";
import { Repeat, Layers, TrendingUp, Scissors, Music, Tv, Brain, Monitor, ShoppingCart, Utensils, Car, Home, Heart, Shirt, Shield, Zap, Smartphone, CreditCard } from "lucide-react";
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
  label: string;
  text: string;
  type: "subscription" | "duplicate" | "spike";
  brandColor?: string;
}

const KNOWN_VENDORS = [
  "spotify", "netflix", "adobe", "chatgpt", "openai", "microsoft", "apple",
  "google", "dropbox", "slack", "notion", "figma", "canva", "hbo", "disney",
  "youtube", "linkedin", "github", "heroku", "aws", "azure", "zoom",
  "viaplay", "telia", "comviq", "tele2", "halebop",
];

const AI_TOOLS = ["chatgpt", "openai", "copilot", "claude", "midjourney", "jasper", "gemini"];
const STREAMING = ["spotify", "netflix", "hbo", "disney", "viaplay", "youtube", "apple tv", "apple music"];
const SOFTWARE = ["adobe", "figma", "canva", "notion", "slack", "microsoft 365", "google workspace"];

// Brand icons/emojis and colors for known services
const BRAND_CONFIG: Record<string, { emoji: string; color: string }> = {
  spotify: { emoji: "🎵", color: "#1DB954" },
  netflix: { emoji: "🎬", color: "#E50914" },
  disney: { emoji: "✨", color: "#113CCF" },
  hbo: { emoji: "📺", color: "#8B5CF6" },
  viaplay: { emoji: "📡", color: "#F59E0B" },
  youtube: { emoji: "▶️", color: "#FF0000" },
  chatgpt: { emoji: "🤖", color: "#10A37F" },
  openai: { emoji: "🧠", color: "#10A37F" },
  adobe: { emoji: "🎨", color: "#FF0000" },
  figma: { emoji: "✏️", color: "#A259FF" },
  canva: { emoji: "🖼️", color: "#00C4CC" },
  notion: { emoji: "📝", color: "#000000" },
  slack: { emoji: "💬", color: "#4A154B" },
  microsoft: { emoji: "🪟", color: "#00A4EF" },
  apple: { emoji: "🍎", color: "#A2AAAD" },
  google: { emoji: "🔍", color: "#4285F4" },
  telia: { emoji: "📱", color: "#990AE3" },
  comviq: { emoji: "📱", color: "#FFD200" },
  tele2: { emoji: "📱", color: "#000000" },
  github: { emoji: "🐙", color: "#333" },
  zoom: { emoji: "📹", color: "#2D8CFF" },
};

// Category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Mat": <Utensils className="w-4 h-4" />,
  "Boende": <Home className="w-4 h-4" />,
  "Transport": <Car className="w-4 h-4" />,
  "Nöje": <Tv className="w-4 h-4" />,
  "Hälsa": <Heart className="w-4 h-4" />,
  "Kläder": <Shirt className="w-4 h-4" />,
  "Försäkring": <Shield className="w-4 h-4" />,
  "Abonnemang": <Smartphone className="w-4 h-4" />,
  "Övrigt": <CreditCard className="w-4 h-4" />,
};

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

function getBrandEmoji(vendor: string): string {
  return BRAND_CONFIG[vendor.toLowerCase()]?.emoji || "💳";
}

function getBrandColor(vendor: string): string {
  return BRAND_CONFIG[vendor.toLowerCase()]?.color || "";
}

const CATEGORY_TOOL_ICONS: Record<string, React.ReactNode> = {
  "AI-verktyg": <Brain className="w-4 h-4" />,
  "Streaming": <Tv className="w-4 h-4" />,
  "Programvara": <Monitor className="w-4 h-4" />,
};

const UnnecessaryCosts = ({ transactions }: UnnecessaryCostsProps) => {
  const insights = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense");
    const result: Insight[] = [];
    const fmt = (v: number) => v.toLocaleString("sv-SE") + " kr";

    // 1. Recurring subscriptions
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
      // Add individual subscription cards
      subscriptions.forEach(sub => {
        const vendorLower = sub.vendor.toLowerCase();
        result.push({
          id: `sub-${vendorLower}`,
          icon: <span className="text-base">{getBrandEmoji(vendorLower)}</span>,
          label: sub.vendor,
          text: `${fmt(sub.monthlyAmount)}/mån`,
          type: "subscription",
          brandColor: getBrandColor(vendorLower),
        });
      });
    }

    // 2. Duplicate tools
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
          icon: CATEGORY_TOOL_ICONS[category] || <Layers className="w-4 h-4" />,
          label: `${data.vendors.length}x ${category}`,
          text: `${data.vendors.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(" + ")} – ${fmt(data.total)} totalt`,
          type: "duplicate",
        });
      }
    });

    // 3. Unusually high costs
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
          icon: CATEGORY_ICONS[category] || <TrendingUp className="w-4 h-4" />,
          label: category,
          text: `+${increasePercent}% över snitt (${fmt(latest)} vs ${fmt(Math.round(avg))})`,
          type: "spike",
        });
      }
    });

    return result;
  }, [transactions]);

  if (insights.length === 0) return null;

  const typeColors = {
    subscription: "border-amber-500/20 bg-amber-500/5",
    duplicate: "border-red-500/20 bg-red-500/5",
    spike: "border-orange-500/20 bg-orange-500/5",
  };

  const typeBadge = {
    subscription: { label: "Abonnemang", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    duplicate: { label: "Dubbletter", className: "bg-red-500/10 text-red-600 dark:text-red-400" },
    spike: { label: "Kostnadsökning", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Scissors className="w-5 h-5 text-warning" />
        <h3 className="text-lg font-display font-semibold">Potentiellt onödiga kostnader</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border p-4 transition-all hover:scale-[1.02] hover:shadow-md ${typeColors[insight.type]}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={insight.brandColor ? { backgroundColor: insight.brandColor + "18" } : {}}
              >
                {insight.icon}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{insight.label}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${typeBadge[insight.type].className}`}>
                  {typeBadge[insight.type].label}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UnnecessaryCosts;
