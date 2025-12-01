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
  const { name, description, duration_minutes, base_price, is_active } = body;

  if (!name || !duration_minutes || !base_price) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("services")
    .update({
      name,
      description: description || null,
      duration_minutes: parseInt(duration_minutes),
      base_price: parseFloat(base_price),
      is_active: is_active !== false,
    })
    .eq("id", id)
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

