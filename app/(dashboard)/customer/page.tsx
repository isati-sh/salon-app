import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default async function CustomerDashboard() {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();

  // Get upcoming appointments
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
    .gte("start_datetime", new Date().toISOString())
    .in("status", ["pending", "confirmed"])
    .order("start_datetime", { ascending: true })
    .limit(5);

  // Get gift cards
  const { data: giftCards } = await supabase
    .from("gift_cards")
    .select("*")
    .or(`purchaser_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user.profile?.full_name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your next visits</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((apt: any) => (
                  <div key={apt.id} className="border-b pb-4 last:border-0">
                    <p className="font-semibold">{apt.service?.name}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(apt.start_datetime), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    <p className="text-sm text-gray-600">
                      with {apt.employee?.full_name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No upcoming appointments</p>
            )}
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/customer/appointments">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gift Cards</CardTitle>
            <CardDescription>Your gift card balances</CardDescription>
          </CardHeader>
          <CardContent>
            {giftCards && giftCards.length > 0 ? (
              <div className="space-y-4">
                {giftCards.map((gc: any) => (
                  <div key={gc.id} className="border-b pb-4 last:border-0">
                    <p className="font-semibold">Code: {gc.code}</p>
                    <p className="text-sm text-gray-600">
                      Balance: ${gc.remaining_amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No gift cards</p>
            )}
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/customer/gift-cards">View All</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button asChild size="lg">
          <Link href="/book">Book New Appointment</Link>
        </Button>
      </div>
    </div>
  );
}

