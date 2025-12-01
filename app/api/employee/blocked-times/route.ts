import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await requireRole(["employee"]);
  const supabase = await createClient();

  const body = await request.json();
  const { start_datetime, end_datetime, reason } = body;

  if (!start_datetime || !end_datetime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Convert datetime-local format to ISO string
  const start = new Date(start_datetime).toISOString();
  const end = new Date(end_datetime).toISOString();

  const { data, error } = await supabase
    .from("employee_blocked_times")
    .insert({
      employee_id: user.id,
      start_datetime: start,
      end_datetime: end,
      reason: reason || null,
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

