import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { queueAppointmentReminder } from "@/lib/notifications";

// Queue reminders for appointments happening in the next X hours
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const hoursAhead = body.hoursAhead || 24;

    const supabase = createServiceClient();
    const now = new Date();
    const reminderTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    // Find appointments happening around the reminder time
    const { data: appointments } = await supabase
      .from("appointments")
      .select("id")
      .gte("start_datetime", now.toISOString())
      .lte("start_datetime", reminderTime.toISOString())
      .in("status", ["pending", "confirmed"]);

    if (!appointments) {
      return NextResponse.json({ processed: 0 });
    }

    let processed = 0;
    for (const appointment of appointments) {
      try {
        await queueAppointmentReminder(appointment.id);
        processed++;
      } catch (error) {
        console.error(`Failed to queue reminder for appointment ${appointment.id}:`, error);
      }
    }

    return NextResponse.json({ processed });
  } catch (error) {
    console.error("Error processing reminders:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}

