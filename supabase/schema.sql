-- Salon App Database Schema
-- Run this in your Supabase SQL editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";


-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'customer')),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birthday DATE,
  preferred_employee_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  category_id bigint references public.service_categories(id) on delete restrict,
  display_order integer,
  is_featured boolean not null default false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee shifts table
CREATE TABLE IF NOT EXISTS employee_shifts (
  id BIGSERIAL PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee blocked times table
CREATE TABLE IF NOT EXISTS employee_blocked_times (
  id BIGSERIAL PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- EMPLOYEE ↔ SERVICE LINK
-- =========================================

create table if not exists public.employee_services (
    id bigserial primary key,
    employee_id uuid not null references public.profiles(id) on delete cascade,
    service_id bigint not null references public.services(id) on delete cascade,
    -- Optional overrides per stylist:
    price_override numeric(10,2) check (price_override is null or price_override >= 0),
    duration_override integer check (duration_override is null or duration_override > 0),
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    unique (employee_id, service_id)
);

create index if not exists idx_employee_services_employee_id
    on public.employee_services(employee_id);

create index if not exists idx_employee_services_service_id
    on public.employee_services(service_id);

create index if not exists idx_employee_services_is_active
    on public.employee_services(is_active);


-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  segment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_spend DECIMAL(10, 2),
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  max_uses INTEGER,
  max_uses_per_customer INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  promotion_id BIGINT REFERENCES promotions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES services(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  coupon_id BIGINT REFERENCES coupons(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_overlapping_appointments EXCLUDE USING gist (
    employee_id WITH =,
    tstzrange(start_datetime, end_datetime) WITH &&
  ) WHERE (status IN ('pending', 'confirmed'))
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'requires_payment' CHECK (status IN ('requires_payment', 'paid', 'refunded', 'failed')),
  method TEXT NOT NULL CHECK (method IN ('cash', 'card_online', 'card_in_store', 'gift_card')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift cards table
CREATE TABLE IF NOT EXISTS gift_cards (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  purchaser_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  recipient_email TEXT,
  recipient_name TEXT,
  initial_amount DECIMAL(10, 2) NOT NULL,
  remaining_amount DECIMAL(10, 2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (remaining_amount >= 0)
);

-- Gift card transactions table
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id BIGSERIAL PRIMARY KEY,
  gift_card_id BIGINT NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  payment_id BIGINT REFERENCES payments(id),
  appointment_id BIGINT REFERENCES appointments(id),
  amount DECIMAL(10, 2) NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('issued', 'redeemed', 'refunded', 'adjustment')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon redemptions table
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id BIGSERIAL PRIMARY KEY,
  coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id BIGINT REFERENCES appointments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('employees', 'customers', 'all')),
  visible_from TIMESTAMPTZ,
  visible_to TIMESTAMPTZ,
  send_email BOOLEAN DEFAULT FALSE,
  send_sms BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  would_return BOOLEAN,
  comments TEXT,
  visible_publicly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appointment_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_employee ON appointments(employee_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_datetime ON appointments(start_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_payments_appointment ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser ON gift_cards(purchaser_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient ON gift_cards(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(visible_publicly) WHERE visible_publicly = TRUE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_cards_updated_at BEFORE UPDATE ON gift_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE employee_shifts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE employee_blocked_times ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (customize based on your needs)
-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- CREATE POLICY "Admins can view all profiles" ON profiles
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- Services: Public read access
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (is_active = TRUE);

-- Appointments: Users can view their own appointments
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (
    customer_id = auth.uid() OR
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add more RLS policies as needed for your security requirements

