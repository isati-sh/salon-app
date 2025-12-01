import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();
  const { id } = await params;

  // Verify the appointment belongs to this customer
  const { data: appointment } = await supabase
    .from("appointments")
    .select("customer_id, status")
    .eq("id", id)
    .single();

  if (!appointment || appointment.customer_id !== user.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  if (appointment.status === "cancelled") {
    return NextResponse.json(
      { error: "Appointment is already cancelled" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("appointments")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL("/customer/appointments", request.url));
}

