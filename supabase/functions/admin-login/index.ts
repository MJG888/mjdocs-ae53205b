import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting for admin login (stricter than regular endpoints)
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { allowed: true };
  }

  // Check if still blocked
  if (record.blockedUntil > now) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((record.blockedUntil - now) / 1000) 
    };
  }

  // Reset if window expired
  if (now - record.blockedUntil > ATTEMPT_WINDOW) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    loginAttempts.set(ip, { count: 1, blockedUntil: 0 });
    return;
  }

  record.count++;
  
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION;
    console.log(`IP ${ip} blocked for 15 minutes due to too many failed attempts`);
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// Cleanup old entries periodically
function cleanupOldEntries(): void {
  const now = Date.now();
  if (loginAttempts.size > 500) {
    for (const [ip, record] of loginAttempts.entries()) {
      if (now - record.blockedUntil > ATTEMPT_WINDOW * 2) {
        loginAttempts.delete(ip);
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("cf-connecting-ip") 
    || "unknown";

  try {
    // Check rate limit first
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Too many login attempts. Please try again later.",
          retryAfter: rateCheck.retryAfter
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfter)
          } 
        }
      );
    }

    const { username, password } = await req.json();

    // Input validation
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const sanitizedUsername = String(username).trim().slice(0, 100);
    const sanitizedPassword = String(password).slice(0, 200);

    if (sanitizedUsername.length < 1 || sanitizedPassword.length < 6) {
      recordFailedAttempt(clientIP);
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role for lookups
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create anon client for authentication (returns proper tokens)
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Look up user by username in profiles table (case-insensitive)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .ilike("username", sanitizedUsername)
      .single();

    if (profileError || !profile) {
      recordFailedAttempt(clientIP);
      // Use same error message to prevent username enumeration
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      profile.user_id
    );

    if (userError || !userData?.user?.email) {
      recordFailedAttempt(clientIP);
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.user_id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      recordFailedAttempt(clientIP);
      // Log this specifically as it could be an attack
      console.log(`Non-admin login attempt for user: ${sanitizedUsername} from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Access denied. Admin privileges required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Attempt to sign in with the anon client (returns proper JWT tokens)
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: userData.user.email,
      password: sanitizedPassword,
    });

    if (authError) {
      recordFailedAttempt(clientIP);
      return new Response(
        JSON.stringify({ error: "Invalid username or password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success! Clear failed attempts
    clearAttempts(clientIP);
    cleanupOldEntries();
    
    console.log(`Admin login successful for: ${sanitizedUsername}`);
    
    return new Response(
      JSON.stringify({
        session: authData.session,
        user: authData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Login error:", error);
    recordFailedAttempt(clientIP);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
