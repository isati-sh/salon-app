import { NextResponse } from "next/server";
import { processQueuedNotifications } from "@/lib/notifications";

// This endpoint can be called manually or by a cron job
export async function POST() {
  try {
    await processQueuedNotifications();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing notifications:", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    );
  }
}

