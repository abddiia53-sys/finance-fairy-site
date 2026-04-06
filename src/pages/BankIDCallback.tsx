import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const BankIDCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");

  useEffect(() => {
    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");
    const savedState = sessionStorage.getItem("tink_bankid_state");

    if (!code) {
      toast.error("Ingen auktoriseringskod från Tink");
      navigate("/auth");
      return;
    }

    if (!returnedState || returnedState !== savedState) {
      toast.error("Ogiltig state-parameter");
      navigate("/auth");
      return;
    }

    sessionStorage.removeItem("tink_bankid_state");

    const processLogin = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("tink-bankid-login", {
          body: { code },
        });

        if (error) throw error;
        if (!data?.session) throw new Error("Ingen session mottagen");

        // Set the session in Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        setStatus("success");

        toast.success("Inloggad via BankID!", {
          description: `${data.accounts || 0} konton och ${data.transactions || 0} transaktioner importerade`,
        });

        setTimeout(() => navigate("/"), 1500);
      } catch (error: any) {
        console.error("BankID login error:", error);
        setStatus("error");
        toast.error("Inloggning misslyckades", { description: error.message });
        setTimeout(() => navigate("/auth"), 3000);
      }
    };

    processLogin();
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
            <h2 className="text-xl font-semibold mb-2">Loggar in via BankID...</h2>
            <p className="text-muted-foreground">Hämtar din bankdata och skapar din profil</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-[hsl(var(--success))] mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Inloggad!</h2>
            <p className="text-muted-foreground">Omdirigerar till din översikt...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-destructive text-xl">✕</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Inloggning misslyckades</h2>
            <p className="text-muted-foreground">Omdirigerar tillbaka...</p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default BankIDCallback;
