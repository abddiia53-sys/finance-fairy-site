import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing code parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
      console.error("Tink token exchange failed:", errBody);
      throw new Error(`Tink token exchange failed [${tokenRes.status}]`);
    }

    const { access_token } = await tokenRes.json();

    // Step 2: Get user identity from Tink
    const identityRes = await fetch(
      "https://api.tink.com/api/v1/user/identity",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    let userIdentity: { name?: string; ssn?: string } = {};
    if (identityRes.ok) {
      const identityData = await identityRes.json();
      userIdentity = {
        name: identityData.fullName || identityData.firstName,
        ssn: identityData.nationalId,
      };
    } else {
      console.warn("Could not fetch identity, continuing with account info");
    }

    // Step 3: Fetch accounts to get basic info
    const accountsRes = await fetch(
      "https://api.tink.com/api/v1/accounts/list",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const accountsData = accountsRes.ok ? await accountsRes.json() : { accounts: [] };
    const accounts = accountsData.accounts || [];

    // Step 4: Create or sign in user in Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Use SSN or a Tink-derived identifier as stable email
    const identifier = userIdentity.ssn || `tink-${Date.now()}`;
    const email = `bankid-${identifier}@financefairy.app`;
    const password = `BankID-${identifier}-SecureAutoGen!`;

    // Try to find existing user by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: userIdentity.name || "BankID-användare",
            auth_method: "bankid",
          },
        });

      if (createError || !newUser.user) {
        throw new Error(
          `Failed to create user: ${createError?.message || "Unknown error"}`
        );
      }

      userId = newUser.user.id;
    }

    // Generate a session for the user
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (sessionError) {
      throw new Error(`Failed to generate session: ${sessionError.message}`);
    }

    // Sign in the user directly using admin
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    // Use signInWithPassword as fallback for immediate session
    // First update password to ensure we can sign in
    await supabaseAdmin.auth.admin.updateUser(userId, { password });

    // Now sign in with the known credentials to get a real session
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
    );

    const { data: authData, error: authError } =
      await userClient.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.session) {
      throw new Error(
        `Failed to create session: ${authError?.message || "No session"}`
      );
    }

    // Step 5: Store accounts
    for (const account of accounts) {
      const balance = account.balances?.booked?.amount?.value?.unscaledValue
        ? Number(account.balances.booked.amount.value.unscaledValue) /
          Math.pow(
            10,
            Number(account.balances.booked.amount.value.scale || 0)
          )
        : 0;

      await supabaseAdmin.from("accounts").upsert(
        {
          user_id: userId,
          bank_name: account.financialInstitutionId || "Okänd bank",
          account_name: account.name || "Konto",
          balance,
          currency:
            account.balances?.booked?.amount?.currencyCode || "SEK",
        },
        { onConflict: "user_id,bank_name,account_name" }
      );
    }

    // Step 6: Fetch and store transactions
    const txRes = await fetch(
      "https://api.tink.com/data/v2/transactions?pageSize=100",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    let importedTx = 0;
    if (txRes.ok) {
      const txData = await txRes.json();
      const transactions = txData.transactions || [];

      // Get account ID mapping
      const { data: dbAccounts } = await supabaseAdmin
        .from("accounts")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      const defaultAccountId = dbAccounts?.[0]?.id;

      for (const tx of transactions) {
        const amount = tx.amount?.value?.unscaledValue
          ? Number(tx.amount.value.unscaledValue) /
            Math.pow(10, Number(tx.amount.value.scale || 0))
          : 0;

        if (!defaultAccountId) continue;

        await supabaseAdmin.from("transactions").insert({
          user_id: userId,
          account_id: defaultAccountId,
          description:
            tx.descriptions?.display ||
            tx.descriptions?.original ||
            "Transaktion",
          amount: Math.abs(amount),
          category: tx.categories?.pfm?.name || "Övrigt",
          type: amount >= 0 ? "income" : "expense",
          date: tx.dates?.booked || new Date().toISOString().split("T")[0],
        });

        importedTx++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        },
        user: {
          id: userId,
          name: userIdentity.name || "BankID-användare",
        },
        accounts: accounts.length,
        transactions: importedTx,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("BankID login error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
