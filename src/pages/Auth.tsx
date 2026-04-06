import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Smartphone } from "lucide-react";
import logo from "@/assets/finance-fairy-logo.png";
import { openTinkBankIDLogin } from "@/lib/tink";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"bankid" | "email">("bankid");
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Inloggad!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Konto skapat!", {
          description: "Kontrollera din e-post för att verifiera kontot.",
        });
      }
    } catch (error: any) {
      toast.error(isLogin ? "Inloggning misslyckades" : "Registrering misslyckades", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankIDLogin = () => {
    openTinkBankIDLogin();
  };

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 flex flex-col items-center gap-3">
            <img src={logo} alt="Finance Fairy" className="w-16 h-16 object-contain" />
            <h1 className="text-3xl font-display font-bold">
              <span className="text-foreground">Finance</span>{" "}
              <span className="text-gradient">Fairy</span>
            </h1>
            <p className="text-muted-foreground">Din ekonomiska överblick</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {authMode === "bankid" ? "Logga in med BankID" : isLogin ? "Logga in" : "Skapa konto"}
              </CardTitle>
              <CardDescription>
                {authMode === "bankid"
                  ? "Identifiera dig säkert med BankID"
                  : isLogin
                    ? "Ange dina uppgifter för att logga in"
                    : "Registrera dig för att komma igång"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authMode === "bankid" ? (
                <div className="space-y-4">
                  <Button
                    onClick={handleBankIDLogin}
                    className="w-full h-14 text-base gap-3"
                    disabled={loading}
                  >
                    <Smartphone className="w-5 h-5" />
                    {loading ? "Laddar..." : "Öppna BankID"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Starta BankID-appen på din mobil eller dator
                  </p>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-3 text-muted-foreground">eller</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAuthMode("email")}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    Logga in med e-post & lösenord
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-post</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="din@email.se"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Lösenord</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Minst 6 tecken"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Laddar..." : isLogin ? "Logga in" : "Skapa konto"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                  <div className="mt-4 text-center space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isLogin
                        ? "Har du inget konto? Registrera dig"
                        : "Har du redan ett konto? Logga in"}
                    </button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-card px-3 text-muted-foreground">eller</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAuthMode("bankid")}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      Logga in med BankID
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Auth;
