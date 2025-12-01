import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const user = await requireRole(["admin"]);
  const supabase = await createClient();

  const body = await request.json();
  const { full_name, phone } = body;

  if (!full_name) {
    return NextResponse.json(
      { error: "Full name is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}

