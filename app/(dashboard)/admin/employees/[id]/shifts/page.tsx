import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function ManageEmployeeShiftsPage({
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

  const { data: shifts } = await supabase
    .from("employee_shifts")
    .select("*")
    .eq("employee_id", id)
    .order("day_of_week", { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/admin/employees">← Back to Employees</Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Shifts</h1>
          <p className="text-gray-600">{employee.full_name}</p>
        </div>
        <Button asChild>
          <Link href={`/admin/employees/${id}/shifts/new`}>Add Shift</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>Weekly schedule for this employee</CardDescription>
        </CardHeader>
        <CardContent>
          {shifts && shifts.length > 0 ? (
            <div className="space-y-3">
              {shifts.map((shift: any) => (
                <div
                  key={shift.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{dayNames[shift.day_of_week]}</p>
                    <p className="text-sm text-gray-600">
                      {shift.start_time} - {shift.end_time}
                    </p>
                    {shift.location && (
                      <p className="text-xs text-gray-500">{shift.location}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/employees/${id}/shifts/${shift.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <form action={`/admin/employees/${id}/shifts/${shift.id}/delete`} method="POST">
                      <Button type="submit" variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-4">No shifts configured</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

