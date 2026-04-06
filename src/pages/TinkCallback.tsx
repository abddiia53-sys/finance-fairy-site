import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const TinkCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [stats, setStats] = useState<{ accounts: number; transactions: number } | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");
    const savedState = sessionStorage.getItem("tink_oauth_state");

    if (!code) {
      toast.error("Ingen auktoriseringskod från Tink");
      navigate("/");
      return;
    }

    if (!returnedState || returnedState !== savedState) {
      toast.error("Ogiltig state-parameter – möjlig CSRF-attack");
      navigate("/");
      return;
    }

    sessionStorage.removeItem("tink_oauth_state");

    const processCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Du måste vara inloggad");
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase.functions.invoke("tink-callback", {
          body: { code },
        });

        if (error) throw error;

        setStats({ accounts: data.accounts, transactions: data.transactions });
        setStatus("success");

        localStorage.setItem("26io_onboarded", "true");
        localStorage.setItem("26io_bank_connected", "true");

        toast.success("Bankkonto kopplat!", {
          description: `${data.accounts} konton och ${data.transactions} transaktioner importerade`,
        });

        setTimeout(() => navigate("/"), 2000);
      } catch (error: any) {
        console.error("Tink callback error:", error);
        setStatus("error");
        toast.error("Kunde inte hämta bankdata", { description: error.message });
        setTimeout(() => navigate("/"), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {status === "processing" && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Importerar bankdata...</h2>
            <p className="text-muted-foreground">Hämtar konton och transaktioner från din bank</p>
          </>
        )}
        {status === "success" && stats && (
          <>
            <CheckCircle2 className="w-12 h-12 text-[hsl(var(--success))] mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Klart!</h2>
            <p className="text-muted-foreground">
              {stats.accounts} konton och {stats.transactions} transaktioner importerade
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-destructive text-xl">✕</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Något gick fel</h2>
            <p className="text-muted-foreground">Omdirigerar till startsidan...</p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TinkCallback;
