import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminEmployeesPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "employee")
    .order("full_name");

  // Get shifts for each employee
  const employeesWithShifts = await Promise.all(
    (employees || []).map(async (employee: any) => {
      const { data: shifts } = await supabase
        .from("employee_shifts")
        .select("*")
        .eq("employee_id", employee.id);

      return { ...employee, shifts: shifts || [] };
    })
  );

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Employees</h1>
        <Button asChild>
          <Link href="/admin/employees/new">Add New Employee</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employeesWithShifts.length > 0 ? (
          employeesWithShifts.map((employee: any) => (
            <Card key={employee.id}>
              <CardHeader>
                <CardTitle>{employee.full_name}</CardTitle>
                <CardDescription>{employee.email}</CardDescription>
                {employee.phone && (
                  <CardDescription>{employee.phone}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Working Hours:</p>
                    {employee.shifts.length > 0 ? (
                      <div className="space-y-1">
                        {employee.shifts.map((shift: any) => (
                          <p key={shift.id} className="text-sm">
                            {dayNames[shift.day_of_week]}: {shift.start_time} - {shift.end_time}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No shifts configured</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/employees/${employee.id}/shifts`}>Manage Shifts</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/employees/${employee.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">No employees found</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

