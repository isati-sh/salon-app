import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/service";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await requireRole(["customer"]);
  const supabase = createClient();

  const body = await request.json();
  const { amount, recipient_name, recipient_email, message, expires_at } = body;

  if (!amount || parseFloat(amount) < 10) {
    return NextResponse.json(
      { error: "Amount must be at least $10" },
      { status: 400 }
    );
  }

  // Generate unique gift card code
  const code = `GC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Check if recipient exists (if email provided)
  let recipientId = null;
  if (recipient_email) {
    const serverSupabase = await createServerClient();
    const { data: recipient } = await serverSupabase
      .from("profiles")
      .select("id")
      .eq("email", recipient_email)
      .eq("role", "customer")
      .single();

    if (recipient) {
      recipientId = recipient.id;
    }
  }

  // Create gift card
  const { data: giftCard, error } = await supabase
    .from("gift_cards")
    .insert({
      code,
      purchaser_id: user.id,
      recipient_id: recipientId,
      recipient_email: recipient_email || null,
      recipient_name: recipient_name || null,
      initial_amount: parseFloat(amount),
      remaining_amount: parseFloat(amount),
      currency: "USD",
      is_active: true,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      message: message || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // Create transaction record
  await supabase.from("gift_card_transactions").insert({
    gift_card_id: giftCard.id,
    amount: parseFloat(amount),
    direction: "issued",
    note: "Gift card purchased",
  });

  // TODO: Process payment via Stripe
  // For now, we'll just create the gift card record
  // In production, you'd want to charge the customer first

  return NextResponse.json({ success: true, giftCard });
}

