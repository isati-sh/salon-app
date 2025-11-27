import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { appointmentId, rating, wouldReturn, comments } = body;

    if (!appointmentId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get appointment details
    const { data: appointment } = await supabase
      .from("appointments")
      .select("customer_id, employee_id")
      .eq("id", appointmentId)
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

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("appointment_id", appointmentId)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists" },
        { status: 400 }
      );
    }

    // Create review
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        appointment_id: appointmentId,
        customer_id: appointment.customer_id,
        employee_id: appointment.employee_id,
        rating,
        would_return: wouldReturn,
        comments: comments || null,
        visible_publicly: true, // Auto-approve for now
      })
      .select("id")
      .single();

    if (error || !review) {
      return NextResponse.json(
        { error: error?.message || "Failed to create review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reviewId: review.id });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

