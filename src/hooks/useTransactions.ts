import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DbTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: string;
  account_id: string;
}

export function useTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []) as DbTransaction[];
    },
    enabled: !!user,
  });
}

export function useBankConnected() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["accounts", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (error) throw error;
      return (data || []).length > 0;
    },
    enabled: !!user,
  });
}
