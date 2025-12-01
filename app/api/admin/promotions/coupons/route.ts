import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const body = await request.json();
  const {
    code,
    description,
    discount_type,
    discount_value,
    min_spend,
    valid_from,
    valid_to,
    max_uses,
    max_uses_per_customer,
    is_active,
    promotion_id,
  } = body;

  if (!code || !discount_type || discount_value === undefined) {
    return NextResponse.json(
      { error: "Code, discount type, and discount value are required" },
      { status: 400 }
    );
  }

  // Check if code already exists
  const { data: existing } = await supabase
    .from("coupons")
    .select("id")
    .eq("code", code.toUpperCase())
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Coupon code already exists" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: code.toUpperCase(),
      description: description || null,
      discount_type,
      discount_value: parseFloat(discount_value),
      min_spend: min_spend ? parseFloat(min_spend) : null,
      valid_from: valid_from ? new Date(valid_from).toISOString() : null,
      valid_to: valid_to ? new Date(valid_to).toISOString() : null,
      max_uses: max_uses ? parseInt(max_uses) : null,
      max_uses_per_customer: max_uses_per_customer
        ? parseInt(max_uses_per_customer)
        : null,
      is_active: is_active !== false,
      promotion_id: promotion_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}

