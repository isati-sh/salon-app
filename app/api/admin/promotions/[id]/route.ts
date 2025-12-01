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
  const { title, description, banner_image_url, starts_at, ends_at, is_active, show_on_website } = body;

  if (!title) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  // Store show_on_website in segment JSONB field
  const segment = show_on_website ? { show_on_website: true } : null;

  const { data, error } = await supabase
    .from("promotions")
    .update({
      title,
      description: description || null,
      banner_image_url: banner_image_url || null,
      starts_at: starts_at ? new Date(starts_at).toISOString() : null,
      ends_at: ends_at ? new Date(ends_at).toISOString() : null,
      is_active: is_active !== false,
      segment,
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

