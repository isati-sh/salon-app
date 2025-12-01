import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { isSlotAvailable } from "@/lib/bookings";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();
  const { id } = await params;

  const body = await request.json();
  const { startDatetime } = body;

  if (!startDatetime) {
    return NextResponse.json(
      { error: "Start datetime is required" },
      { status: 400 }
    );
  }

  // Get appointment details
  const { data: appointment } = await supabase
    .from("appointments")
    .select("employee_id, service_id, customer_id, status")
    .eq("id", id)
    .single();

  if (!appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    );
  }

  if (appointment.customer_id !== user.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  if (appointment.status === "cancelled" || appointment.status === "completed") {
    return NextResponse.json(
      { error: "Cannot reschedule cancelled or completed appointments" },
      { status: 400 }
    );
  }

  // Check if new slot is available
  const available = await isSlotAvailable(
    appointment.employee_id,
    appointment.service_id,
    new Date(startDatetime)
  );

  if (!available) {
    return NextResponse.json(
      { error: "Selected time slot is not available" },
      { status: 400 }
    );
  }

  // Get service duration
  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", appointment.service_id)
    .single();

  if (!service) {
    return NextResponse.json(
      { error: "Service not found" },
      { status: 404 }
    );
  }

  const endDatetime = new Date(startDatetime);
  endDatetime.setMinutes(endDatetime.getMinutes() + service.duration_minutes);

  // Update appointment
  const { error } = await supabase
    .from("appointments")
    .update({
      start_datetime: new Date(startDatetime).toISOString(),
      end_datetime: endDatetime.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

