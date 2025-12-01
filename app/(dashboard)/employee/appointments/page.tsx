import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default async function EmployeeAppointmentsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await requireRole(["employee"]);
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select(
      `
      *,
      customer:profiles!appointments_customer_id_fkey(id, full_name, email, phone),
      service:services(name, base_price, duration_minutes)
    `
    )
    .eq("employee_id", user.id)
    .order("start_datetime", { ascending: false });

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: appointments } = await query;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <div className="flex gap-2">
          <Button asChild variant={!searchParams.status ? "default" : "outline"}>
            <a href="/employee/appointments">All</a>
          </Button>
          <Button asChild variant={searchParams.status === "pending" ? "default" : "outline"}>
            <a href="/employee/appointments?status=pending">Pending</a>
          </Button>
          <Button asChild variant={searchParams.status === "confirmed" ? "default" : "outline"}>
            <a href="/employee/appointments?status=confirmed">Confirmed</a>
          </Button>
          <Button asChild variant={searchParams.status === "completed" ? "default" : "outline"}>
            <a href="/employee/appointments?status=completed">Completed</a>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt: any) => (
            <Card key={apt.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{apt.service?.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(apt.start_datetime), "EEEE, MMMM d, yyyy 'at' h:mm a")} -{" "}
                      {format(new Date(apt.end_datetime), "h:mm a")}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      apt.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : apt.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : apt.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : apt.status === "no_show"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Customer Information</p>
                    <p className="font-semibold">{apt.customer?.full_name}</p>
                    <p className="text-sm text-gray-600">{apt.customer?.email}</p>
                    {apt.customer?.phone && (
                      <p className="text-sm text-gray-600">{apt.customer.phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Service Details</p>
                    <p>Duration: {apt.service?.duration_minutes} minutes</p>
                    <p>Price: ${apt.service?.base_price}</p>
                    {apt.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-600">Notes:</p>
                        <p className="text-sm">{apt.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                {(apt.status === "pending" || apt.status === "confirmed") && (
                  <div className="mt-4 flex gap-2">
                    <form action={`/employee/appointments/${apt.id}/update-status`} method="POST">
                      <input type="hidden" name="status" value="completed" />
                      <Button type="submit" size="sm">
                        Mark Complete
                      </Button>
                    </form>
                    <form action={`/employee/appointments/${apt.id}/update-status`} method="POST">
                      <input type="hidden" name="status" value="no_show" />
                      <Button type="submit" size="sm" variant="destructive">
                        Mark No-Show
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No appointments found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

