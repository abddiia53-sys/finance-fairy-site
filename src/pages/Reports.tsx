import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Wallet, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Navbar from "@/components/Navbar";
import { useState } from "react";

const monthlyData = [
  { month: "Sep", intäkter: 62000, utgifter: 41000 },
  { month: "Okt", intäkter: 78000, utgifter: 48000 },
  { month: "Nov", intäkter: 55000, utgifter: 39000 },
  { month: "Dec", intäkter: 91000, utgifter: 52000 },
  { month: "Jan", intäkter: 84000, utgifter: 45000 },
  { month: "Feb", intäkter: 106500, utgifter: 59600 },
];

const categoryData = [
  { name: "Lokal", value: 12500, color: "hsl(155, 60%, 48%)" },
  { name: "Personal", value: 35000, color: "hsl(210, 80%, 55%)" },
  { name: "IT", value: 2243, color: "hsl(280, 60%, 55%)" },
  { name: "Marknadsföring", value: 21400, color: "hsl(45, 80%, 55%)" },
  { name: "Mat", value: 4200, color: "hsl(0, 65%, 52%)" },
  { name: "Boende", value: 9500, color: "hsl(30, 70%, 50%)" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 border border-border">
        <p className="text-sm font-display font-semibold mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString("sv-SE")} kr
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const navigate = useNavigate();
  

  const summaryStats = useMemo(() => {
    const totalIncome = monthlyData.reduce((s, m) => s + m.intäkter, 0);
    const totalExpense = monthlyData.reduce((s, m) => s + m.utgifter, 0);
    const net = totalIncome - totalExpense;
    const avgIncome = Math.round(totalIncome / monthlyData.length);
    const avgExpense = Math.round(totalExpense / monthlyData.length);
    return { totalIncome, totalExpense, net, avgIncome, avgExpense };
  }, []);

  const fmt = (v: number) => v.toLocaleString("sv-SE") + " kr";

  const netData = monthlyData.map(m => ({
    month: m.month,
    netto: m.intäkter - m.utgifter,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Tillbaka
          </button>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            <div>
              <h2 className="text-3xl font-display font-bold">Rapporter</h2>
              <p className="text-muted-foreground mt-1">Detaljerad ekonomisk statistik över 6 månader</p>
            </div>
          </div>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total intäkt", value: fmt(summaryStats.totalIncome), icon: TrendingUp, cls: "text-[hsl(var(--success))]" },
            { label: "Totala utgifter", value: fmt(summaryStats.totalExpense), icon: TrendingDown, cls: "text-destructive" },
            { label: "Nettoresultat", value: fmt(summaryStats.net), icon: Wallet, cls: summaryStats.net >= 0 ? "text-[hsl(var(--success))]" : "text-destructive" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className={`w-5 h-5 ${card.cls}`} />
              </div>
              <p className="text-2xl font-display font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">Senaste 6 mån</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue vs Expenses */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-display font-semibold mb-4">Intäkter vs Utgifter</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rIncGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(155, 60%, 48%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(155, 60%, 48%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rExpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 65%, 52%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(0, 65%, 52%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="intäkter" name="Intäkter" stroke="hsl(155, 60%, 48%)" fill="url(#rIncGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="utgifter" name="Utgifter" stroke="hsl(0, 65%, 52%)" fill="url(#rExpGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Net result bar chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-display font-semibold mb-4">Nettoresultat per månad</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={netData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 12%, 50%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="netto" name="Netto" fill="hsl(155, 60%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Category breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-display font-semibold mb-4">Utgifter per kategori</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="h-64 w-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => fmt(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3 w-full">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-foreground">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{fmt(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Monthly averages */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-xl p-6 mt-6">
          <h3 className="text-lg font-display font-semibold mb-4">Månadssnitt</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Snittintäkt / mån</p>
              <p className="text-xl font-display font-bold text-[hsl(var(--success))]">{fmt(summaryStats.avgIncome)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Snittutgift / mån</p>
              <p className="text-xl font-display font-bold text-destructive">{fmt(summaryStats.avgExpense)}</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Reports;
