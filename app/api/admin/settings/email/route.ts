import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const user = await requireRole(["admin"]);
  const supabase = await createClient();

  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Update auth email
  const { error: authError } = await supabase.auth.updateUser({
    email: email,
  });

  if (authError) {
    return NextResponse.json(
      { error: authError.message },
      { status: 500 }
    );
  }

  // Update profile email
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    success: true, 
    message: "Email update initiated. Please check your new email for confirmation." 
  });
}

