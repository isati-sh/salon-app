import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id } = await params;

  const body = await request.json();
  const { day_of_week, start_time, end_time, location } = body;

  if (day_of_week === undefined || !start_time || !end_time) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Verify employee exists
  const { data: employee } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .eq("role", "employee")
    .single();

  if (!employee) {
    return NextResponse.json(
      { error: "Employee not found" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("employee_shifts")
    .insert({
      employee_id: id,
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

