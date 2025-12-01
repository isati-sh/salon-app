import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GiftCardTransactionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();
  const { id } = await params;

  // Get gift card
  const { data: giftCard } = await supabase
    .from("gift_cards")
    .select("*")
    .eq("id", id)
    .or(`purchaser_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .single();

  if (!giftCard) {
    redirect("/customer/gift-cards");
  }

  // Get transactions
  const { data: transactions } = await supabase
    .from("gift_card_transactions")
    .select(
      `
      *,
      appointment:appointments(id, start_datetime, service:services(name))
    `
    )
    .eq("gift_card_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/customer/gift-cards">← Back to Gift Cards</Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gift Card: {giftCard.code}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Initial Amount</p>
              <p className="text-2xl font-bold">${giftCard.initial_amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining Balance</p>
              <p className="text-2xl font-bold text-green-600">
                ${giftCard.remaining_amount.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((txn: any) => (
                <div
                  key={txn.id}
                  className="flex justify-between items-start p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold capitalize">{txn.direction}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(txn.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {txn.note && (
                      <p className="text-sm text-gray-600 mt-1">{txn.note}</p>
                    )}
                    {txn.appointment && (
                      <p className="text-sm text-gray-600 mt-1">
                        Appointment: {txn.appointment.service?.name} on{" "}
                        {format(
                          new Date(txn.appointment.start_datetime),
                          "MMM d, yyyy"
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        txn.direction === "redeemed" ||
                        txn.direction === "refunded"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {txn.direction === "redeemed" ||
                      txn.direction === "refunded"
                        ? "-"
                        : "+"}
                      ${Math.abs(txn.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-4">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

