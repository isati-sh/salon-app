import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const user = await requireRole(["admin"]);
  const supabase = await createClient();

  const body = await request.json();
  const { current_password, new_password } = body;

  if (!current_password || !new_password) {
    return NextResponse.json(
      { error: "Current password and new password are required" },
      { status: 400 }
    );
  }

  if (new_password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Verify current password by attempting to sign in
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser?.email) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authUser.email,
    password: current_password,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 }
    );
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: new_password,
  });

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

