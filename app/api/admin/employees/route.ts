import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  await requireRole(["admin"]);
  const supabase = await createServiceClient();
  const serverSupabase = await createClient();

  const body = await request.json();
  const { email, password, full_name, phone } = body;

  if (!email || !password || !full_name) {
    return NextResponse.json(
      { error: "Email, password, and full name are required" },
      { status: 400 }
    );
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message || "Failed to create user" },
      { status: 500 }
    );
  }

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      role: "employee",
      full_name,
      email,
      phone: phone || null,
    })
    .select()
    .single();

  if (profileError) {
    // Clean up auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: profile });
}

