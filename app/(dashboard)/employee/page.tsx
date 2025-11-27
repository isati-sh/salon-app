import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function EmployeeDashboard() {
  const user = await requireRole(["employee"]);
  const supabase = await createClient();

  // Get today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      customer:profiles!appointments_customer_id_fkey(full_name),
      service:services(name)
    `
    )
    .eq("employee_id", user.id)
    .gte("start_datetime", today.toISOString())
    .lt("start_datetime", tomorrow.toISOString())
    .in("status", ["pending", "confirmed"])
    .order("start_datetime", { ascending: true });

  // Get upcoming appointments
  const { data: upcomingAppointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      customer:profiles!appointments_customer_id_fkey(full_name),
      service:services(name)
    `
    )
    .eq("employee_id", user.id)
    .gte("start_datetime", tomorrow.toISOString())
    .in("status", ["pending", "confirmed"])
    .order("start_datetime", { ascending: true })
    .limit(5);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Welcome, {user.profile?.full_name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>
              {format(today, "EEEE, MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments && todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map((apt: any) => (
                  <div key={apt.id} className="border-b pb-4 last:border-0">
                    <p className="font-semibold">{apt.service?.name}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(apt.start_datetime), "h:mm a")} -{" "}
                      {format(new Date(apt.end_datetime), "h:mm a")}
                    </p>
                    <p className="text-sm text-gray-600">
                      Customer: {apt.customer?.full_name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No appointments today</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((apt: any) => (
                  <div key={apt.id} className="border-b pb-4 last:border-0">
                    <p className="font-semibold">{apt.service?.name}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(apt.start_datetime), "MMM d, h:mm a")}
                    </p>
                    <p className="text-sm text-gray-600">
                      Customer: {apt.customer?.full_name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

