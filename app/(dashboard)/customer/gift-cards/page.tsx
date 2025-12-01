import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CustomerGiftCardsPage() {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();

  const { data: giftCards } = await supabase
    .from("gift_cards")
    .select("*")
    .or(`purchaser_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Gift Cards</h1>
        <Button asChild>
          <Link href="/customer/gift-cards/purchase">Purchase Gift Card</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {giftCards && giftCards.length > 0 ? (
          giftCards.map((gc: any) => (
            <Card key={gc.id}>
              <CardHeader>
                <CardTitle>Gift Card</CardTitle>
                <CardDescription>Code: {gc.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Balance:</strong> ${gc.remaining_amount.toFixed(2)}
                  </p>
                  <p>
                    <strong>Initial Amount:</strong> ${gc.initial_amount.toFixed(2)}
                  </p>
                  {gc.expires_at && (
                    <p>
                      <strong>Expires:</strong>{" "}
                      {new Date(gc.expires_at).toLocaleDateString()}
                    </p>
                  )}
                  {gc.message && (
                    <p className="text-sm text-gray-600 italic">
                      &quot;{gc.message}&quot;
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Status: {gc.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/customer/gift-cards/${gc.id}/transactions`}>
                      View Transactions
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600">
            <p className="mb-4">No gift cards found.</p>
            <Button asChild>
              <Link href="/customer/gift-cards/purchase">Purchase Your First Gift Card</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

