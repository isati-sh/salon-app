import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditEmployeeForm from "./edit-form";

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id } = await params;

  const { data: employee } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "employee")
    .single();

  if (!employee) {
    redirect("/admin/employees");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditEmployeeForm employee={employee} />
    </div>
  );
}

