import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default async function CustomerAppointmentsPage() {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();

  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      employee:profiles!appointments_employee_id_fkey(full_name),
      service:services(name, base_price)
    `
    )
    .eq("customer_id", user.id)
    .order("start_datetime", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

      <div className="space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt: any) => (
            <Card key={apt.id}>
              <CardHeader>
                <CardTitle>{apt.service?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Date:</strong>{" "}
                    {format(new Date(apt.start_datetime), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {format(new Date(apt.start_datetime), "h:mm a")}
                  </p>
                  <p>
                    <strong>Stylist:</strong> {apt.employee?.full_name}
                  </p>
                  <p>
                    <strong>Status:</strong> {apt.status}
                  </p>
                  <p>
                    <strong>Price:</strong> ${apt.service?.base_price}
                  </p>
                </div>
                {apt.status === "pending" || apt.status === "confirmed" ? (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button variant="destructive" size="sm">
                      Cancel
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-600">No appointments found</p>
        )}
      </div>
    </div>
  );
}

