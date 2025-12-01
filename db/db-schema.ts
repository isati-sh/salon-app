// db/schema.ts
// Generated manually from Supabase SQL schema for the Hair Salon app.
// This file is meant to give your coding agent a clear picture of the database structure.
// It does NOT need to be 100% perfect TypeScript for runtime; it's mainly for types + documentation.

export type Role = 'admin' | 'employee' | 'customer';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus =
  | 'requires_payment'
  | 'paid'
  | 'refunded'
  | 'failed';

export type PaymentMethod =
  | 'cash'
  | 'card_online'
  | 'card_in_store'
  | 'gift_card';

export type DiscountType = 'percentage' | 'fixed_amount';

export type AnnouncementTarget = 'employees' | 'customers' | 'all';

export type NotificationChannel = 'email' | 'sms';

export type NotificationStatus = 'queued' | 'sent' | 'failed';

export interface Profile {
  id: string; // uuid, references auth.users.id
  role: Role;
  full_name: string;
  email: string | null;
  phone: string | null;
  birthday: string | null; // date
  preferred_employee_id: string | null; // uuid, self-reference to profiles.id
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface ServiceCategory {
  id: number; // bigserial
  name: string;
  description: string | null;
  display_order: number | null;
  created_at: string; // timestamptz
}

export interface Service {
  id: number; // bigserial
  name: string;
  description: string | null;
  duration_minutes: number;
  base_price: number;
  is_active: boolean;
  category_id: number | null; // bigint, service_categories.id
  display_order: number | null;
  is_featured: boolean;
  created_at: string; // timestamptz
}

export interface EmployeeShift {
  id: number; // bigserial
  employee_id: string; // uuid, profiles.id
  day_of_week: number; // 0-6, Sunday-Saturday
  start_time: string; // time
  end_time: string; // time
  location: string | null;
  created_at: string; // timestamptz
}

export interface EmployeeBlockedTime {
  id: number; // bigserial
  employee_id: string; // uuid, profiles.id
  start_datetime: string; // timestamptz
  end_datetime: string; // timestamptz
  reason: string | null;
  created_at: string; // timestamptz
}

export interface Promotion {
  id: number; // bigserial
  title: string;
  description: string | null;
  banner_image_url: string | null;
  starts_at: string | null; // timestamptz
  ends_at: string | null; // timestamptz
  is_active: boolean;
  segment: any | null; // jsonb
  created_at: string; // timestamptz
}

export interface Coupon {
  id: number; // bigserial
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_spend: number | null;
  valid_from: string | null; // timestamptz
  valid_to: string | null; // timestamptz
  max_uses: number | null;
  max_uses_per_customer: number | null;
  is_active: boolean;
  promotion_id: number | null; // bigint, promotions.id
  created_at: string; // timestamptz
}

export interface Appointment {
  id: number; // bigserial
  customer_id: string; // uuid, profiles.id
  employee_id: string; // uuid, profiles.id
  service_id: number; // bigint, services.id
  start_datetime: string; // timestamptz
  end_datetime: string; // timestamptz
  status: AppointmentStatus;
  notes: string | null;
  coupon_id: number | null; // bigint, coupons.id (optional)
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface Payment {
  id: number; // bigserial
  appointment_id: number; // bigint, appointments.id
  amount: number;
  currency: string; // char(3), e.g. 'USD'
  status: PaymentStatus;
  method: PaymentMethod;
  stripe_payment_intent_id: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface GiftCard {
  id: number; // bigserial
  code: string;
  purchaser_id: string | null; // uuid, profiles.id
  recipient_id: string | null; // uuid, profiles.id
  recipient_email: string | null;
  recipient_name: string | null;
  initial_amount: number;
  remaining_amount: number;
  currency: string; // char(3)
  is_active: boolean;
  expires_at: string | null; // timestamptz
  message: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface GiftCardTransaction {
  id: number; // bigserial
  gift_card_id: number; // bigint, gift_cards.id
  payment_id: number | null; // bigint, payments.id
  appointment_id: number | null; // bigint, appointments.id
  amount: number;
  direction: 'issued' | 'redeemed' | 'refunded' | 'adjustment';
  note: string | null;
  created_at: string; // timestamptz
}

export interface Announcement {
  id: number; // bigserial
  title: string;
  message: string;
  target_type: 'employees' | 'customers' | 'all';
  visible_from: string | null; // timestamptz
  visible_to: string | null; // timestamptz
  send_email: boolean;
  send_sms: boolean;
  created_by: string | null; // uuid, profiles.id
  created_at: string; // timestamptz
}

export interface Notification {
  id: number; // bigserial
  user_id: string; // uuid, profiles.id
  type: string; // e.g. 'appointment_confirmation', 'promo', etc.
  channel: NotificationChannel;
  payload: any | null; // jsonb
  status: NotificationStatus;
  created_at: string; // timestamptz
  sent_at: string | null; // timestamptz
}

export interface Review {
  id: number; // bigserial
  appointment_id: number; // bigint, appointments.id
  customer_id: string; // uuid, profiles.id
  employee_id: string; // uuid, profiles.id
  rating: number; // 1-5
  would_return: boolean | null;
  comments: string | null;
  visible_publicly: boolean;
  created_at: string; // timestamptz
}

// Views

export interface ViewDailyAppointments {
  day: string; // date as string
  total_appointments: number;
}

export interface ViewDailyRevenue {
  day: string; // date as string
  total_revenue: number;
}

// Optional: Supabase-style Database interface
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile };
      services: { Row: Service };
      employee_shifts: { Row: EmployeeShift };
      employee_blocked_times: { Row: EmployeeBlockedTime };
      promotions: { Row: Promotion };
      coupons: { Row: Coupon };
      appointments: { Row: Appointment };
      payments: { Row: Payment };
      gift_cards: { Row: GiftCard };
      gift_card_transactions: { Row: GiftCardTransaction };
      announcements: { Row: Announcement };
      notifications: { Row: Notification };
      reviews: { Row: Review };
    };
    Views: {
      view_daily_appointments: { Row: ViewDailyAppointments };
      view_daily_revenue: { Row: ViewDailyRevenue };
    };
  };
}
