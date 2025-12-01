import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminPromotionsPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Promotions & Coupons</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/promotions/new">New Promotion</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/promotions/coupons/new">New Coupon</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Promotions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions && promotions.length > 0 ? (
              promotions.map((promo: any) => (
                <Card key={promo.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{promo.title}</CardTitle>
                        <CardDescription>{promo.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            promo.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {promo.is_active ? "Active" : "Inactive"}
                        </span>
                        {promo.segment && (() => {
                          const segment = typeof promo.segment === 'string' ? JSON.parse(promo.segment) : promo.segment;
                          return segment?.show_on_website ? (
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                              On Website
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {promo.starts_at && (
                        <p>
                          <span className="font-semibold">Starts:</span>{" "}
                          {format(new Date(promo.starts_at), "MMM d, yyyy")}
                        </p>
                      )}
                      {promo.ends_at && (
                        <p>
                          <span className="font-semibold">Ends:</span>{" "}
                          {format(new Date(promo.ends_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/promotions/${promo.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-600">No promotions found</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Coupons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons && coupons.length > 0 ? (
              coupons.map((coupon: any) => (
                <Card key={coupon.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-mono">{coupon.code}</CardTitle>
                        <CardDescription>{coupon.description}</CardDescription>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          coupon.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">Discount:</span>{" "}
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `$${coupon.discount_value}`}
                      </p>
                      {coupon.min_spend && (
                        <p>
                          <span className="font-semibold">Min Spend:</span> ${coupon.min_spend}
                        </p>
                      )}
                      {coupon.valid_from && (
                        <p>
                          <span className="font-semibold">Valid From:</span>{" "}
                          {format(new Date(coupon.valid_from), "MMM d, yyyy")}
                        </p>
                      )}
                      {coupon.valid_to && (
                        <p>
                          <span className="font-semibold">Valid To:</span>{" "}
                          {format(new Date(coupon.valid_to), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/promotions/coupons/${coupon.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-600">No coupons found</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

