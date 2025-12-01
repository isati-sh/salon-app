import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export default async function AdminAnalyticsPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  // Revenue analytics
  const { data: allPayments } = await supabase
    .from("payments")
    .select("amount, status, created_at")
    .eq("status", "paid");

  const totalRevenue = allPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  // Last 7 days revenue
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentPayments = allPayments?.filter(
    (p) => new Date(p.created_at) >= sevenDaysAgo
  ) || [];
  const recentRevenue = recentPayments.reduce((sum, p) => sum + p.amount, 0);

  // Today's revenue
  const today = new Date();
  const todayPayments = allPayments?.filter(
    (p) =>
      new Date(p.created_at) >= startOfDay(today) &&
      new Date(p.created_at) <= endOfDay(today)
  ) || [];
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Appointments analytics
  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true });

  const { count: completedAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  // Employee performance
  const { data: employeeStats } = await supabase
    .from("appointments")
    .select(
      `
      employee_id,
      employee:profiles!appointments_employee_id_fkey(full_name),
      payments(amount)
    `
    )
    .eq("status", "completed");

  const employeePerformance = new Map();
  employeeStats?.forEach((apt: any) => {
    const employeeId = apt.employee_id;
    const employeeName = apt.employee?.full_name || "Unknown";
    if (!employeePerformance.has(employeeId)) {
      employeePerformance.set(employeeId, {
        name: employeeName,
        appointments: 0,
        revenue: 0,
      });
    }
    const stats = employeePerformance.get(employeeId);
    stats.appointments += 1;
    if (apt.payments && Array.isArray(apt.payments)) {
      stats.revenue += apt.payments.reduce(
        (sum: number, p: any) => sum + (p.amount || 0),
        0
      );
    }
  });

  // Service popularity
  const { data: serviceStats } = await supabase
    .from("appointments")
    .select(
      `
      service_id,
      service:services(name),
      payments(amount)
    `
    )
    .eq("status", "completed");

  const servicePopularity = new Map();
  serviceStats?.forEach((apt: any) => {
    const serviceId = apt.service_id;
    const serviceName = apt.service?.name || "Unknown";
    if (!servicePopularity.has(serviceId)) {
      servicePopularity.set(serviceId, {
        name: serviceName,
        count: 0,
        revenue: 0,
      });
    }
    const stats = servicePopularity.get(serviceId);
    stats.count += 1;
    if (apt.payments && Array.isArray(apt.payments)) {
      stats.revenue += apt.payments.reduce(
        (sum: number, p: any) => sum + (p.amount || 0),
        0
      );
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days</CardTitle>
            <CardDescription>Recent revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${recentRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>Today's revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${todayRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalAppointments || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedAppointments || 0}</p>
            <p className="text-sm text-gray-600 mt-2">
              {totalAppointments
                ? ((completedAppointments || 0) / totalAppointments * 100).toFixed(1)
                : 0}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Employee Performance</CardTitle>
          <CardDescription>Revenue and appointments by employee</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(employeePerformance.values())
              .sort((a, b) => b.revenue - a.revenue)
              .map((emp: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center border-b pb-4 last:border-0">
                  <div>
                    <p className="font-semibold">{emp.name}</p>
                    <p className="text-sm text-gray-600">
                      {emp.appointments} appointments
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${emp.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            {employeePerformance.size === 0 && (
              <p className="text-center text-gray-600">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Popularity */}
      <Card>
        <CardHeader>
          <CardTitle>Service Popularity</CardTitle>
          <CardDescription>Most booked services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(servicePopularity.values())
              .sort((a, b) => b.count - a.count)
              .map((service: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center border-b pb-4 last:border-0">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-gray-600">
                      {service.count} bookings
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${service.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            {servicePopularity.size === 0 && (
              <p className="text-center text-gray-600">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

