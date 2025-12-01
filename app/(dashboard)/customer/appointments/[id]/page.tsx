import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CustomerAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();
  const { id } = await params;

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      *,
      employee:profiles!appointments_employee_id_fkey(id, full_name, email, phone),
      service:services(name, base_price, duration_minutes, description),
      payment:payments(amount, status, method, created_at),
      coupon:coupons(code, discount_type, discount_value)
    `
    )
    .eq("id", id)
    .eq("customer_id", user.id)
    .single();

  if (!appointment) {
    redirect("/customer/appointments");
  }

  const apt = appointment as any;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/customer/appointments">← Back to Appointments</Link>
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
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {apt.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Service Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Service Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-semibold">Service:</span> {apt.service?.name}</p>
                {apt.service?.description && (
                  <p><span className="font-semibold">Description:</span> {apt.service.description}</p>
                )}
                <p><span className="font-semibold">Duration:</span> {apt.service?.duration_minutes} minutes</p>
                <p><span className="font-semibold">Price:</span> ${apt.service?.base_price}</p>
              </div>
            </div>

            {/* Employee Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Stylist</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">{apt.employee?.full_name}</p>
                {apt.employee?.phone && (
                  <p className="text-sm text-gray-600">Phone: {apt.employee.phone}</p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            {apt.payment && Array.isArray(apt.payment) && apt.payment.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {apt.payment.map((payment: any, idx: number) => (
                    <div key={idx} className="border-b pb-2 last:border-0">
                      <p><span className="font-semibold">Amount:</span> ${payment.amount}</p>
                      <p><span className="font-semibold">Status:</span> {payment.status}</p>
                      <p><span className="font-semibold">Method:</span> {payment.method}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(payment.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coupon Information */}
            {apt.coupon && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Coupon Applied</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-semibold">Code:</span> {apt.coupon.code}</p>
                  <p>
                    <span className="font-semibold">Discount:</span>{" "}
                    {apt.coupon.discount_type === "percentage"
                      ? `${apt.coupon.discount_value}%`
                      : `$${apt.coupon.discount_value}`}
                  </p>
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
                <Button asChild variant="outline">
                  <Link href={`/customer/appointments/${apt.id}/reschedule`}>
                    Reschedule
                  </Link>
                </Button>
                <form action={`/customer/appointments/${apt.id}/cancel`} method="POST">
                  <Button type="submit" variant="destructive">
                    Cancel Appointment
                  </Button>
                </form>
              </div>
            )}

            {/* Review Link */}
            {apt.status === "completed" && (
              <div className="pt-4 border-t">
                <Button asChild>
                  <Link href={`/customer/reviews/${apt.id}/create`}>
                    Leave a Review
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

