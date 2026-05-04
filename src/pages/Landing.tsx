import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Brain, Shield, Sparkles, PiggyBank, TrendingUp } from "lucide-react";
import logo from "@/assets/finance-fairy-logo.png";

const features = [
  {
    icon: BarChart3,
    title: "Översikt i realtid",
    description: "Se alla inkomster, utgifter och saldo på ett ställe med tydliga grafer och statistik.",
  },
  {
    icon: Brain,
    title: "AI-ekonomiassistent",
    description: "Fairy analyserar dina transaktioner och ger personliga råd för att förbättra din ekonomi.",
  },
  {
    icon: PiggyBank,
    title: "Hitta onödiga kostnader",
    description: "Identifiera dubbletter, oanvända abonnemang och kostnadsökningar automatiskt.",
  },
  {
    icon: Shield,
    title: "Säker bankkoppling",
    description: "Koppla ditt bankkonto via BankID och Tink – PSD2-kompatibelt och krypterat.",
  },
  {
    icon: TrendingUp,
    title: "Ekonomisk hälsa",
    description: "Få en hälsopoäng och konkreta tips för att stärka din ekonomi över tid.",
  },
  {
    icon: Sparkles,
    title: "Smarta insikter",
    description: "Automatiska varningar och trender hjälper dig fatta bättre ekonomiska beslut.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Finance Fairy" className="w-8 h-8 object-contain" />
          <span className="text-xl font-display font-bold">
            <span className="text-foreground">Finance</span>{" "}
            <span className="text-gradient">Fairy</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/auth")}>Logga in</Button>
          <Button onClick={() => navigate("/auth")}>Kom igång</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              AI-driven privatekonomisk rådgivning
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              Håll koll på din{" "}
              <span className="text-gradient">privatekonomi</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Finance Fairy ger dig full överblick över dina utgifter, inkomster och sparande – med en AI-assistent som hjälper dig fatta smartare ekonomiska beslut.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8 gap-2" onClick={() => navigate("/auth")}>
                Skapa gratis konto <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8" onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Se funktioner
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screenshot / Preview */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 -mt-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl border border-border bg-card/50 p-2 shadow-2xl shadow-primary/5"
        >
          <div className="rounded-xl bg-background border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card/80">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">Finance Fairy – Dashboard</span>
            </div>
            <div className="p-6 sm:p-8">
              {/* Mock dashboard preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Inkomst", value: "37 500 kr", color: "text-green-500" },
                  { label: "Utgifter", value: "16 443 kr", color: "text-red-500" },
                  { label: "Saldo", value: "21 057 kr", color: "text-primary" },
                  { label: "Sparande", value: "10 528 kr", color: "text-blue-500" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-card/50 p-3">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`text-sm sm:text-base font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-32 sm:h-40 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border flex items-end p-4 gap-2">
                {[40, 65, 50, 80, 60, 75, 90, 55, 70, 85, 45, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">🧚 Fairy</span>
                <span>"Du sparar mer än genomsnittet – bra jobbat!"</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 sm:px-10 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-3">Allt du behöver för din ekonomi</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Kraftfulla verktyg som gör det enkelt att ha koll på pengarna.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card/50 p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 py-16 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-10"
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">Redo att ta kontroll?</h2>
          <p className="text-muted-foreground mb-6">Skapa ett gratis konto och börja spåra din ekonomi redan idag.</p>
          <Button size="lg" className="text-base px-8 gap-2" onClick={() => navigate("/auth")}>
            Registrera dig gratis <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Finance Fairy. Håll koll på din privatekonomi.</p>
      </footer>
    </div>
  );
};

export default Landing;
