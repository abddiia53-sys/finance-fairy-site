import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Sep", intäkter: 62000, utgifter: 41000 },
  { month: "Okt", intäkter: 78000, utgifter: 48000 },
  { month: "Nov", intäkter: 55000, utgifter: 39000 },
  { month: "Dec", intäkter: 91000, utgifter: 52000 },
  { month: "Jan", intäkter: 84000, utgifter: 45000 },
  { month: "Feb", intäkter: 106500, utgifter: 59600 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 border border-border">
        <p className="text-sm font-display font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString("sv-SE")} kr
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface OverviewChartProps {
  onMonthClick?: (month: string) => void;
}

const OverviewChart = ({ onMonthClick }: OverviewChartProps) => {
  const handleClick = (data: any) => {
    if (data?.activeLabel && onMonthClick) {
      onMonthClick(data.activeLabel);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold">Översikt</h3>
        <p className="text-sm text-muted-foreground mt-1">Intäkter vs utgifter, 6 månader</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} onClick={handleClick} style={{ cursor: "pointer" }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(155, 60%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(155, 60%, 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 65%, 52%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(0, 65%, 52%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
            <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(215, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="intäkter" name="Intäkter" stroke="hsl(155, 60%, 48%)" fill="url(#incomeGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="utgifter" name="Utgifter" stroke="hsl(0, 65%, 52%)" fill="url(#expenseGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default OverviewChart;
