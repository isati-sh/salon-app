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

  const formData = await request.formData();
  const status = formData.get("status") as string;

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  // Verify the appointment belongs to this employee
  const { data: appointment } = await supabase
    .from("appointments")
    .select("employee_id")
    .eq("id", id)
    .single();

  if (!appointment || appointment.employee_id !== user.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL("/employee/appointments", request.url));
}

