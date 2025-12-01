import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; shiftId: string }> }
) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id, shiftId } = await params;

  const { error } = await supabase
    .from("employee_shifts")
    .delete()
    .eq("id", shiftId)
    .eq("employee_id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    new URL(`/admin/employees/${id}/shifts`, request.url)
  );
}

