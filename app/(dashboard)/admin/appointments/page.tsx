import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string }>;
}) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const params = await searchParams;

  let query = supabase
    .from("appointments")
    .select(
      `
      *,
      customer:profiles!appointments_customer_id_fkey(id, full_name, email, phone),
      employee:profiles!appointments_employee_id_fkey(id, full_name),
      service:services(name, base_price)
    `
    )
    .order("start_datetime", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.date) {
    const date = new Date(params.date);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query = query
      .gte("start_datetime", startOfDay.toISOString())
      .lte("start_datetime", endOfDay.toISOString());
  }

  const { data: appointments } = await query;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <div className="flex gap-2">
          <Link href="/admin/appointments?status=pending">
            <Button variant="outline">Pending</Button>
          </Link>
          <Link href="/admin/appointments?status=confirmed">
            <Button variant="outline">Confirmed</Button>
          </Link>
          <Link href="/admin/appointments?status=completed">
            <Button variant="outline">Completed</Button>
          </Link>
          <Link href="/admin/appointments">
            <Button variant="outline">All</Button>
          </Link>
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
                      {format(new Date(apt.start_datetime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
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
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Customer</p>
                    <p>{apt.customer?.full_name}</p>
                    <p className="text-sm text-gray-600">{apt.customer?.email}</p>
                    {apt.customer?.phone && (
                      <p className="text-sm text-gray-600">{apt.customer.phone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Employee</p>
                    <p>{apt.employee?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Price</p>
                    <p>${apt.service?.base_price}</p>
                    {apt.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-600">Notes</p>
                        <p className="text-sm">{apt.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <form action={`/admin/appointments/${apt.id}/update-status`} method="POST">
                    <input type="hidden" name="status" value="confirmed" />
                    <Button type="submit" size="sm" variant="outline" disabled={apt.status === "confirmed"}>
                      Confirm
                    </Button>
                  </form>
                  <form action={`/admin/appointments/${apt.id}/update-status`} method="POST">
                    <input type="hidden" name="status" value="completed" />
                    <Button type="submit" size="sm" variant="outline" disabled={apt.status === "completed"}>
                      Mark Complete
                    </Button>
                  </form>
                  <form action={`/admin/appointments/${apt.id}/update-status`} method="POST">
                    <input type="hidden" name="status" value="cancelled" />
                    <Button type="submit" size="sm" variant="destructive" disabled={apt.status === "cancelled"}>
                      Cancel
                    </Button>
                  </form>
                </div>
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

