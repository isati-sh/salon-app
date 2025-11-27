import { NextRequest, NextResponse } from "next/server";
import { getAvailableTimeSlots } from "@/lib/bookings";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const serviceId = parseInt(searchParams.get("serviceId") || "0");
    const dateStr = searchParams.get("date");
    const employeeId = searchParams.get("employeeId") || undefined;

    if (!serviceId || !dateStr) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    const slots = await getAvailableTimeSlots({
      serviceId,
      date,
      employeeId,
    });

    return NextResponse.json({
      slots: slots.map((slot) => slot.start.toISOString()),
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

