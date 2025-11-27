import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CustomerReviewsPage() {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();

  // Get completed appointments that don't have reviews yet
  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      employee:profiles!appointments_employee_id_fkey(full_name),
      service:services(name),
      review:reviews!reviews_appointment_id_fkey(id)
    `
    )
    .eq("customer_id", user.id)
    .eq("status", "completed")
    .order("start_datetime", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Leave a Review</h1>

      <div className="space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt: any) => (
            <Card key={apt.id}>
              <CardHeader>
                <CardTitle>{apt.service?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Stylist: {apt.employee?.full_name}
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  {new Date(apt.start_datetime).toLocaleDateString()}
                </p>
                {apt.review ? (
                  <p className="text-green-600">Review submitted</p>
                ) : (
                  <Button asChild>
                    <a href={`/customer/reviews/${apt.id}/create`}>
                      Leave Review
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-600">
            No completed appointments to review.
          </p>
        )}
      </div>
    </div>
  );
}

