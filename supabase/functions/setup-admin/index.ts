import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { setupKey } = await req.json();

    // Simple setup key protection (only allow setup once)
    if (setupKey !== "mjdocs-initial-setup-2024") {
      return new Response(
        JSON.stringify({ error: "Invalid setup key" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const adminUsers = [
      { username: "Manoj", email: "manoj@mjdocs.local", password: "mj200710" },
      { username: "ASR", email: "asr@mjdocs.local", password: "asr125490" }
    ];

    const results = [];

    for (const admin of adminUsers) {
      // Check if admin user already exists
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .ilike("username", admin.username)
        .single();

      if (existingProfile) {
        results.push({ username: admin.username, status: "already_exists" });
        continue;
      }

      // Create the admin user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
        user_metadata: {
          username: admin.username,
        },
      });

      if (authError) {
        console.error(`Auth error for ${admin.username}:`, authError);
        results.push({ username: admin.username, status: "auth_error", error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          user_id: userId,
          username: admin.username,
        }, { onConflict: "user_id" });

      if (profileError) {
        console.error(`Profile error for ${admin.username}:`, profileError);
      }

      // Assign admin role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "admin",
        });

      if (roleError) {
        console.error(`Role error for ${admin.username}:`, roleError);
        results.push({ username: admin.username, status: "role_error", error: roleError.message });
        continue;
      }

      results.push({ username: admin.username, status: "created" });
    }

    return new Response(
      JSON.stringify({ 
        message: "Admin setup completed",
        results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
