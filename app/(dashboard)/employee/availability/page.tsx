import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default async function EmployeeAvailabilityPage() {
  const user = await requireRole(["employee"]);
  const supabase = await createClient();

  // Get employee shifts
  const { data: shifts } = await supabase
    .from("employee_shifts")
    .select("*")
    .eq("employee_id", user.id)
    .order("day_of_week", { ascending: true });

  // Get upcoming blocked times
  const { data: blockedTimes } = await supabase
    .from("employee_blocked_times")
    .select("*")
    .eq("employee_id", user.id)
    .gte("end_datetime", new Date().toISOString())
    .order("start_datetime", { ascending: true });

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Availability</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/employee/availability/shifts/new">Add Shift</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/employee/availability/block-time">Block Time</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regular Shifts */}
        <Card>
          <CardHeader>
            <CardTitle>Regular Working Hours</CardTitle>
            <CardDescription>Your weekly schedule</CardDescription>
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
                    <form action={`/employee/availability/shifts/${shift.id}/delete`} method="POST">
                      <Button type="submit" variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-4">
                No shifts configured. Add your working hours to start receiving appointments.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Blocked Times */}
        <Card>
          <CardHeader>
            <CardTitle>Blocked Times</CardTitle>
            <CardDescription>Times when you're unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            {blockedTimes && blockedTimes.length > 0 ? (
              <div className="space-y-3">
                {blockedTimes.map((blocked: any) => (
                  <div
                    key={blocked.id}
                    className="flex justify-between items-start p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div>
                      <p className="font-semibold">
                        {format(new Date(blocked.start_datetime), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(blocked.start_datetime), "h:mm a")} -{" "}
                        {format(new Date(blocked.end_datetime), "h:mm a")}
                      </p>
                      {blocked.reason && (
                        <p className="text-xs text-gray-500 mt-1">{blocked.reason}</p>
                      )}
                    </div>
                    <form action={`/employee/availability/blocked/${blocked.id}/delete`} method="POST">
                      <Button type="submit" variant="destructive" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-4">No blocked times</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

