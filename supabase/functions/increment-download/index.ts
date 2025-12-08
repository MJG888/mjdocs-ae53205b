import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (per document per IP)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();

    // Validate documentId format (UUID)
    if (!documentId || typeof documentId !== "string") {
      return new Response(
        JSON.stringify({ error: "Document ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(documentId)) {
      return new Response(
        JSON.stringify({ error: "Invalid document ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting check
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const rateLimitKey = `${clientIP}:${documentId}`;
    const now = Date.now();
    const lastRequest = rateLimitMap.get(rateLimitKey) || 0;

    if (now - lastRequest < RATE_LIMIT_WINDOW / MAX_REQUESTS_PER_WINDOW) {
      console.log(`Rate limit hit for ${rateLimitKey}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    rateLimitMap.set(rateLimitKey, now);

    // Clean up old rate limit entries periodically
    if (rateLimitMap.size > 1000) {
      const cutoff = now - RATE_LIMIT_WINDOW;
      for (const [key, timestamp] of rateLimitMap.entries()) {
        if (timestamp < cutoff) {
          rateLimitMap.delete(key);
        }
      }
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get current download count and verify document exists and is active
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("download_count, status")
      .eq("id", documentId)
      .single();

    if (fetchError || !doc) {
      console.error("Document not found:", documentId);
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only allow downloads for active documents
    if (doc.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Document is not available" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment download count
    const { error: updateError } = await supabase
      .from("documents")
      .update({ download_count: (doc.download_count || 0) + 1 })
      .eq("id", documentId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, newCount: (doc.download_count || 0) + 1 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error incrementing download count:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
