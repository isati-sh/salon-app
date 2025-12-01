import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; shiftId: string }> }
) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id, shiftId } = await params;

  const body = await request.json();
  const { day_of_week, start_time, end_time, location } = body;

  if (day_of_week === undefined || !start_time || !end_time) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Verify shift belongs to employee
  const { data: shift } = await supabase
    .from("employee_shifts")
    .select("employee_id")
    .eq("id", shiftId)
    .eq("employee_id", id)
    .single();

  if (!shift) {
    return NextResponse.json(
      { error: "Shift not found" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("employee_shifts")
    .update({
      day_of_week: parseInt(day_of_week),
      start_time,
      end_time,
      location: location || null,
    })
    .eq("id", shiftId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}

