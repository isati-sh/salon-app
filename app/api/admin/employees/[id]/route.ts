import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id } = await params;

  const body = await request.json();
  const { full_name, email, phone } = body;

  if (!full_name || !email) {
    return NextResponse.json(
      { error: "Full name and email are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name,
      email,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("role", "employee")
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

