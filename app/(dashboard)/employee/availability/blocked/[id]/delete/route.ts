import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["employee"]);
  const supabase = await createClient();
  const { id } = await params;

  // Verify the blocked time belongs to this employee
  const { data: blockedTime } = await supabase
    .from("employee_blocked_times")
    .select("employee_id")
    .eq("id", id)
    .single();

  if (!blockedTime || blockedTime.employee_id !== user.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("employee_blocked_times")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL("/employee/availability", request.url));
}

