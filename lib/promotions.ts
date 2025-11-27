// Promotion and coupon utilities

import { createServiceClient } from "@/lib/supabase/service";
import type { Coupon } from "@/db/db-schema";

/**
 * Find active promotions for a customer
 */
export async function getActivePromotionsForCustomer(
  customerId: string
): Promise<any[]> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`);

  if (!promotions) {
    return [];
  }

  // Filter by segment if needed (simplified for now)
  return promotions;
}

/**
 * Get applicable coupons for a customer
 */
export async function getApplicableCoupons(
  customerId: string,
  amount: number
): Promise<Coupon[]> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Get active coupons
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .or(`valid_from.is.null,valid_from.lte.${now}`)
    .or(`valid_to.is.null,valid_to.gte.${now}`);

  if (!coupons) {
    return [];
  }

  // Filter by eligibility
  const applicableCoupons: Coupon[] = [];

  for (const coupon of coupons) {
    // Check min spend
    if (coupon.min_spend && amount < coupon.min_spend) {
      continue;
    }

    // Check max uses
    if (coupon.max_uses) {
      const { count } = await supabase
        .from("coupon_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("coupon_id", coupon.id);
      if (count && count >= coupon.max_uses) {
        continue;
      }
    }

    // Check max uses per customer
    if (coupon.max_uses_per_customer) {
      const { count } = await supabase
        .from("coupon_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("coupon_id", coupon.id)
        .eq("customer_id", customerId);
      if (count && count >= coupon.max_uses_per_customer) {
        continue;
      }
    }

    applicableCoupons.push(coupon);
  }

  return applicableCoupons;
}

/**
 * Apply coupon to an amount
 */
export function applyCoupon(amount: number, coupon: Coupon): number {
  if (coupon.discount_type === "percentage") {
    return amount * (1 - coupon.discount_value / 100);
  } else {
    return Math.max(0, amount - coupon.discount_value);
  }
}

/**
 * Find customers with birthdays this week
 */
export async function getCustomersWithBirthdaysThisWeek(): Promise<any[]> {
  const supabase = createServiceClient();
  const today = new Date();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  // This is a simplified version - in production, you'd want to query by month/day
  const { data: customers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .not("birthday", "is", null);

  if (!customers) {
    return [];
  }

  // Filter by birthday in the next 7 days
  return customers.filter((customer) => {
    if (!customer.birthday) return false;
    const birthday = new Date(customer.birthday);
    const thisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    const diffDays = Math.floor((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });
}

/**
 * Find inactive customers (no visit in N days)
 */
export async function getInactiveCustomers(days: number = 90): Promise<any[]> {
  const supabase = createServiceClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Get all customers
  const { data: customers } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "customer");

  if (!customers) {
    return [];
  }

  const inactiveCustomers: any[] = [];

  for (const customer of customers) {
    // Check for recent appointments
    const { data: recentAppointments } = await supabase
      .from("appointments")
      .select("id")
      .eq("customer_id", customer.id)
      .gte("start_datetime", cutoffDate.toISOString())
      .limit(1);

    if (!recentAppointments || recentAppointments.length === 0) {
      // Get full customer profile
      const { data: fullProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customer.id)
        .single();
      if (fullProfile) {
        inactiveCustomers.push(fullProfile);
      }
    }
  }

  return inactiveCustomers;
}

