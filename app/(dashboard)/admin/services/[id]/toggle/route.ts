import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id } = await params;

  // Get current service status
  const { data: service } = await supabase
    .from("services")
    .select("is_active")
    .eq("id", id)
    .single();

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("services")
    .update({ is_active: !service.is_active })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL("/admin/services", request.url));
}

