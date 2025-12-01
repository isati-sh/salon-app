import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditCouponForm from "./edit-form";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id } = await params;

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();

  if (!coupon) {
    redirect("/admin/promotions");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditCouponForm coupon={coupon} />
    </div>
  );
}

