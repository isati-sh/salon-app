import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await requireRole(["employee"]);
  const supabase = await createClient();

  const body = await request.json();
  const { day_of_week, start_time, end_time, location } = body;

  if (day_of_week === undefined || !start_time || !end_time) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("employee_shifts")
    .insert({
      employee_id: user.id,
      day_of_week: parseInt(day_of_week),
      start_time,
      end_time,
      location: location || null,
    })
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

