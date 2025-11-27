import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAppointment } from "@/lib/bookings";
import { createPayment } from "@/lib/payments";
import { queueAppointmentConfirmation } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, employeeId, startDatetime, paymentMethod = "cash" } = body;

    if (!serviceId || !employeeId || !startDatetime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get customer profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Create appointment
    const appointment = await createAppointment({
      customerId: profile.id,
      employeeId,
      serviceId,
      startDatetime: new Date(startDatetime),
    });

    // Get service price
    const { data: service } = await supabase
      .from("services")
      .select("base_price")
      .eq("id", serviceId)
      .single();

    // Create payment record
    await createPayment({
      appointmentId: appointment.id,
      amount: service?.base_price || 0,
      currency: "USD",
      method: paymentMethod === "cash" ? "cash" : "card_online",
      status: paymentMethod === "cash" ? "requires_payment" : "requires_payment",
    });

    // Queue confirmation notification
    await queueAppointmentConfirmation(appointment.id);

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create appointment" },
      { status: 500 }
    );
  }
}

