import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EmployeeAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["employee"]);
  const supabase = await createClient();
  const { id } = await params;

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      *,
      customer:profiles!appointments_customer_id_fkey(id, full_name, email, phone, birthday),
      service:services(name, base_price, duration_minutes, description),
      payment:payments(amount, status, method)
    `
    )
    .eq("id", id)
    .eq("employee_id", user.id)
    .single();

  if (!appointment) {
    redirect("/employee/appointments");
  }

  const apt = appointment as any;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/employee/appointments">← Back to Appointments</Link>
        </Button>
      </div>

      <Card>
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
          <div className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-semibold">{apt.customer?.full_name}</p>
                <p className="text-sm text-gray-600">Email: {apt.customer?.email}</p>
                {apt.customer?.phone && (
                  <p className="text-sm text-gray-600">Phone: {apt.customer.phone}</p>
                )}
                {apt.customer?.birthday && (
                  <p className="text-sm text-gray-600">
                    Birthday: {format(new Date(apt.customer.birthday), "MMMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Service Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-semibold">Service:</span> {apt.service?.name}</p>
                {apt.service?.description && (
                  <p><span className="font-semibold">Description:</span> {apt.service.description}</p>
                )}
                <p><span className="font-semibold">Duration:</span> {apt.service?.duration_minutes} minutes</p>
                <p><span className="font-semibold">Price:</span> ${apt.service?.base_price}</p>
              </div>
            </div>

            {/* Payment Information */}
            {apt.payment && Array.isArray(apt.payment) && apt.payment.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {apt.payment.map((payment: any, idx: number) => (
                    <div key={idx}>
                      <p><span className="font-semibold">Amount:</span> ${payment.amount}</p>
                      <p><span className="font-semibold">Status:</span> {payment.status}</p>
                      <p><span className="font-semibold">Method:</span> {payment.method}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {apt.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{apt.notes}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            {(apt.status === "pending" || apt.status === "confirmed") && (
              <div className="flex gap-2 pt-4 border-t">
                <form action={`/employee/appointments/${apt.id}/update-status`} method="POST">
                  <input type="hidden" name="status" value="completed" />
                  <Button type="submit">Mark Complete</Button>
                </form>
                <form action={`/employee/appointments/${apt.id}/update-status`} method="POST">
                  <input type="hidden" name="status" value="no_show" />
                  <Button type="submit" variant="destructive">Mark No-Show</Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

