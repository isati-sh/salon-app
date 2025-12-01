import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditShiftForm from "./edit-form";

export default async function EditShiftPage({
  params,
}: {
  params: Promise<{ id: string; shiftId: string }>;
}) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id, shiftId } = await params;

  const { data: shift } = await supabase
    .from("employee_shifts")
    .select("*")
    .eq("id", shiftId)
    .eq("employee_id", id)
    .single();

  if (!shift) {
    redirect(`/admin/employees/${id}/shifts`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditShiftForm shift={shift} employeeId={id} />
    </div>
  );
}

