import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  // Get today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count: todayAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .gte("start_datetime", today.toISOString())
    .lt("start_datetime", tomorrow.toISOString())
    .in("status", ["pending", "confirmed"]);

  // Get total revenue (from paid payments)
  const { data: revenueData } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "paid");

  const totalRevenue =
    revenueData?.reduce((sum, p) => sum + p.amount, 0) || 0;

  // Get active employees
  const { count: employeeCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "employee");

  // Get active services
  const { count: serviceCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayAppointments || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{employeeCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{serviceCount || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

