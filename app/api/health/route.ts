import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Health check endpoint
 * Useful for monitoring and verifying system status
 */
export async function GET() {
  const checks: Record<string, boolean | string> = {};

  // Check environment variables
  checks.env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    stripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    resendApiKey: !!process.env.RESEND_API_KEY,
    emailFromAddress: !!process.env.EMAIL_FROM_ADDRESS,
  };

  // Check database connection
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("count").limit(1);
    checks.database = !error;
    if (error) checks.databaseError = error.message;
  } catch (error) {
    checks.database = false;
    checks.databaseError = error instanceof Error ? error.message : "Unknown error";
  }

  const allHealthy = Object.values(checks.env).every(Boolean) && checks.database === true;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}

