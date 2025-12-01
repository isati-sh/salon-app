import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();
  const { id } = await params;

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      *,
      employee:profiles!appointments_employee_id_fkey(id, full_name),
      service:services(id, name)
    `
    )
    .eq("id", id)
    .eq("customer_id", user.id)
    .single();

  if (!appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ appointment });
}

