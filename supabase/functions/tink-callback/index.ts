import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TINK_CLIENT_ID = "111707427676486fa468b006edd031f0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const TINK_CLIENT_SECRET = Deno.env.get("TINK_CLIENT_SECRET");
    if (!TINK_CLIENT_SECRET) {
      throw new Error("TINK_CLIENT_SECRET is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with user's token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
    ).auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ error: "Missing code parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Exchange authorization code for access token
    const tokenRes = await fetch("https://api.tink.com/api/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: TINK_CLIENT_ID,
        client_secret: TINK_CLIENT_SECRET,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      throw new Error(`Tink token exchange failed [${tokenRes.status}]: ${errBody}`);
    }

    const { access_token } = await tokenRes.json();

    // Step 2: Fetch accounts
    const accountsRes = await fetch("https://api.tink.com/api/v1/accounts/list", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!accountsRes.ok) {
      throw new Error(`Failed to fetch accounts [${accountsRes.status}]`);
    }

    const accountsData = await accountsRes.json();
    const accounts = accountsData.accounts || [];

    // Step 3: Store accounts and create mapping
    const accountIdMap: Record<string, string> = {};

    for (const account of accounts) {
      const balance = account.balances?.booked?.amount?.value?.unscaledValue
        ? Number(account.balances.booked.amount.value.unscaledValue) /
          Math.pow(10, Number(account.balances.booked.amount.value.scale || 0))
        : 0;

      const { data: dbAccount, error: accError } = await supabase
        .from("accounts")
        .upsert({
          user_id: user.id,
          bank_name: account.financialInstitutionId || "Okänd bank",
          account_name: account.name || "Konto",
          balance,
          currency: account.balances?.booked?.amount?.currencyCode || "SEK",
        }, { onConflict: "user_id,bank_name,account_name" })
        .select("id")
        .single();

      if (dbAccount) {
        accountIdMap[account.id] = dbAccount.id;
      }
    }

    // Step 4: Fetch transactions
    const txRes = await fetch("https://api.tink.com/data/v2/transactions?pageSize=100", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!txRes.ok) {
      throw new Error(`Failed to fetch transactions [${txRes.status}]`);
    }

    const txData = await txRes.json();
    const transactions = txData.transactions || [];

    // Step 5: Store transactions
    let imported = 0;
    for (const tx of transactions) {
      const amount = tx.amount?.value?.unscaledValue
        ? Number(tx.amount.value.unscaledValue) /
          Math.pow(10, Number(tx.amount.value.scale || 0))
        : 0;

      const accountDbId = accountIdMap[tx.accountId] || Object.values(accountIdMap)[0];
      if (!accountDbId) continue;

      const type = amount >= 0 ? "income" : "expense";

      await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: accountDbId,
        description: tx.descriptions?.display || tx.descriptions?.original || "Transaktion",
        amount: Math.abs(amount),
        category: tx.categories?.pfm?.name || "Övrigt",
        type,
        date: tx.dates?.booked || new Date().toISOString().split("T")[0],
      });

      imported++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        accounts: accounts.length,
        transactions: imported,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Tink callback error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
