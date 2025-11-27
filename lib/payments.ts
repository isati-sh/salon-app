// Stripe payment integration

import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";
import type { PaymentMethod, PaymentStatus } from "@/db/db-schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export interface CreatePaymentIntentOptions {
  appointmentId: number;
  amount: number;
  currency?: string;
  paymentMethod: "deposit" | "full";
}

/**
 * Create a payment record (for pay-at-salon or online payment)
 */
export async function createPayment(data: {
  appointmentId: number;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
}): Promise<{ id: number }> {
  const supabase = createServiceClient();

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      appointment_id: data.appointmentId,
      amount: data.amount,
      currency: data.currency || "USD",
      method: data.method,
      status: data.status,
      stripe_payment_intent_id: data.stripePaymentIntentId || null,
    })
    .select("id")
    .single();

  if (error || !payment) {
    throw new Error(error?.message || "Failed to create payment");
  }

  return payment;
}

/**
 * Create a Stripe Payment Intent for online payment
 */
export async function createPaymentIntent(
  options: CreatePaymentIntentOptions
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  // Get appointment details
  const supabase = createServiceClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("*, service:services(base_price)")
    .eq("id", options.appointmentId)
    .single();

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const service = appointment.service as { base_price: number };
  let amount = options.amount;

  if (options.paymentMethod === "deposit") {
    // Default deposit is 20% or minimum $10
    amount = Math.max(service.base_price * 0.2, 10);
  } else {
    amount = service.base_price;
  }

  // Apply coupon if exists
  if (appointment.coupon_id) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", appointment.coupon_id)
      .single();

    if (coupon && coupon.is_active) {
      if (coupon.discount_type === "percentage") {
        amount = amount * (1 - coupon.discount_value / 100);
      } else {
        amount = Math.max(0, amount - coupon.discount_value);
      }
    }
  }

  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: options.currency || "usd",
    metadata: {
      appointmentId: options.appointmentId.toString(),
      paymentMethod: options.paymentMethod,
    },
  });

  // Create payment record
  await createPayment({
    appointmentId: options.appointmentId,
    amount,
    currency: options.currency?.toUpperCase() || "USD",
    method: "card_online",
    status: "requires_payment",
    stripePaymentIntentId: paymentIntent.id,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Handle Stripe webhook
 */
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<void> {
  const supabase = createServiceClient();

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = parseInt(
      paymentIntent.metadata?.appointmentId || "0"
    );

    if (appointmentId) {
      // Update payment status
      await supabase
        .from("payments")
        .update({
          status: "paid",
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      // Update appointment status
      await supabase
        .from("appointments")
        .update({
          status: "confirmed",
        })
        .eq("id", appointmentId);
    }
  } else if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = parseInt(
      paymentIntent.metadata?.appointmentId || "0"
    );

    if (appointmentId) {
      await supabase
        .from("payments")
        .update({
          status: "failed",
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);
    }
  }
}

/**
 * Process gift card payment
 */
export async function processGiftCardPayment(data: {
  appointmentId: number;
  giftCardCode: string;
  amount: number;
}): Promise<{ success: boolean; remainingBalance: number }> {
  const supabase = createServiceClient();

  // Get gift card
  const { data: giftCard } = await supabase
    .from("gift_cards")
    .select("*")
    .eq("code", data.giftCardCode.toUpperCase())
    .eq("is_active", true)
    .single();

  if (!giftCard) {
    throw new Error("Invalid gift card code");
  }

  if (giftCard.remaining_amount < data.amount) {
    throw new Error("Insufficient gift card balance");
  }

  if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
    throw new Error("Gift card has expired");
  }

  // Update gift card balance
  const newBalance = giftCard.remaining_amount - data.amount;
  await supabase
    .from("gift_cards")
    .update({ remaining_amount: newBalance })
    .eq("id", giftCard.id);

  // Create payment record
  const { data: payment } = await supabase
    .from("payments")
    .insert({
      appointment_id: data.appointmentId,
      amount: data.amount,
      currency: giftCard.currency,
      method: "gift_card",
      status: "paid",
    })
    .select("id")
    .single();

  if (payment) {
    // Create gift card transaction
    await supabase.from("gift_card_transactions").insert({
      gift_card_id: giftCard.id,
      payment_id: payment.id,
      appointment_id: data.appointmentId,
      amount: data.amount,
      direction: "redeemed",
      note: `Payment for appointment #${data.appointmentId}`,
    });
  }

  return {
    success: true,
    remainingBalance: newBalance,
  };
}

