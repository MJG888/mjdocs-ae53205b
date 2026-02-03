import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting for signed URL generation
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

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
    const now = Date.now();
    const rateLimit = rateLimitMap.get(clientIP);

    if (rateLimit) {
      if (now < rateLimit.resetAt) {
        if (rateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
          return new Response(
            JSON.stringify({ error: "Too many requests. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        rateLimit.count++;
      } else {
        rateLimitMap.set(clientIP, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitMap.set(clientIP, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    }

    // Clean up old entries periodically
    if (rateLimitMap.size > 1000) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetAt) {
          rateLimitMap.delete(key);
        }
      }
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify document exists and is active
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("id, file_path, file_name, status")
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

    // Generate signed URL with 5-minute expiry
    const { data: signedData, error: signedError } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 300); // 5 minutes

    if (signedError || !signedData?.signedUrl) {
      console.error("Error generating signed URL:", signedError);
      return new Response(
        JSON.stringify({ error: "Failed to generate download link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        signedUrl: signedData.signedUrl,
        fileName: doc.file_name,
        expiresIn: 300
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating signed URL:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
