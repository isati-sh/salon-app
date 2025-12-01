import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EmployeeSchedulePage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const user = await requireRole(["employee"]);
  const supabase = await createClient();

  // Get current week or specified week
  const weekStart = searchParams.week
    ? startOfWeek(new Date(searchParams.week))
    : startOfWeek(new Date());
  const weekEnd = endOfWeek(weekStart);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get appointments for the week
  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      customer:profiles!appointments_customer_id_fkey(full_name, phone),
      service:services(name, duration_minutes)
    `
    )
    .eq("employee_id", user.id)
    .gte("start_datetime", weekStart.toISOString())
    .lte("start_datetime", weekEnd.toISOString())
    .in("status", ["pending", "confirmed", "completed"])
    .order("start_datetime", { ascending: true });

  // Get employee shifts for the week
  const { data: shifts } = await supabase
    .from("employee_shifts")
    .select("*")
    .eq("employee_id", user.id);

  // Get blocked times for the week
  const { data: blockedTimes } = await supabase
    .from("employee_blocked_times")
    .select("*")
    .eq("employee_id", user.id)
    .gte("start_datetime", weekStart.toISOString())
    .lte("end_datetime", weekEnd.toISOString());

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Group appointments by day
  const appointmentsByDay = new Map();
  appointments?.forEach((apt: any) => {
    const day = format(new Date(apt.start_datetime), "yyyy-MM-dd");
    if (!appointmentsByDay.has(day)) {
      appointmentsByDay.set(day, []);
    }
    appointmentsByDay.get(day).push(apt);
  });

  // Get shifts for each day
  const shiftsByDay = new Map();
  shifts?.forEach((shift: any) => {
    if (!shiftsByDay.has(shift.day_of_week)) {
      shiftsByDay.set(shift.day_of_week, []);
    }
    shiftsByDay.get(shift.day_of_week).push(shift);
  });

  const prevWeek = format(addDays(weekStart, -7), "yyyy-MM-dd");
  const nextWeek = format(addDays(weekStart, 7), "yyyy-MM-dd");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Schedule</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/employee/schedule?week=${prevWeek}`}>Previous Week</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/employee/schedule?week=${nextWeek}`}>Next Week</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/employee/schedule">This Week</Link>
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Week of {format(weekStart, "MMMM d, yyyy")} - {format(weekEnd, "MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayAppointments = appointmentsByDay.get(dayKey) || [];
          const dayShifts = shiftsByDay.get(day.getDay()) || [];
          const isToday = isSameDay(day, new Date());

          return (
            <Card key={dayKey} className={isToday ? "border-2 border-primary" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {dayNames[day.getDay()]}
                </CardTitle>
                <p className="text-xs text-gray-600">{format(day, "MMM d")}</p>
              </CardHeader>
              <CardContent className="pt-2">
                {dayShifts.length > 0 && (
                  <div className="mb-2 pb-2 border-b">
                    <p className="text-xs font-semibold text-gray-600">Available:</p>
                    {dayShifts.map((shift: any) => (
                      <p key={shift.id} className="text-xs text-gray-500">
                        {shift.start_time} - {shift.end_time}
                      </p>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  {dayAppointments.map((apt: any) => (
                    <div
                      key={apt.id}
                      className={`p-2 rounded text-xs ${
                        apt.status === "completed"
                          ? "bg-green-50 border border-green-200"
                          : apt.status === "cancelled"
                          ? "bg-red-50 border border-red-200"
                          : "bg-blue-50 border border-blue-200"
                      }`}
                    >
                      <p className="font-semibold">{apt.service?.name}</p>
                      <p className="text-gray-600">
                        {format(new Date(apt.start_datetime), "h:mm a")}
                      </p>
                      <p className="text-gray-600">{apt.customer?.full_name}</p>
                      <Link
                        href={`/employee/appointments/${apt.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                  {dayAppointments.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No appointments</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {blockedTimes && blockedTimes.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Blocked Times This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blockedTimes.map((blocked: any) => (
                <div key={blocked.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-semibold">
                      {format(new Date(blocked.start_datetime), "MMM d, h:mm a")} -{" "}
                      {format(new Date(blocked.end_datetime), "h:mm a")}
                    </p>
                    {blocked.reason && (
                      <p className="text-xs text-gray-600">{blocked.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

