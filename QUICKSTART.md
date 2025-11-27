# Quick Start Checklist

Follow these steps to get your salon app up and running:

## ✅ Initial Setup

- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Create a Supabase project at [supabase.com](https://supabase.com)

## ✅ Database Setup

- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] (Optional) Run `supabase/seed.sql` for sample data
- [ ] Copy Supabase credentials to `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## ✅ Create Admin User

Choose one method:

**Method 1: Using script (recommended)**
```bash
npm run create-admin
```

**Method 2: Manual**
1. Sign up at `/signup` with any email
2. Go to Supabase SQL Editor
3. Run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## ✅ Create Employee Users

**Using script:**
```bash
npm run create-employee
```

**Then set up shifts in Supabase SQL Editor:**
```sql
INSERT INTO employee_shifts (employee_id, day_of_week, start_time, end_time)
VALUES 
  ('employee-id-here', 1, '09:00', '18:00'), -- Monday
  ('employee-id-here', 2, '09:00', '18:00'), -- Tuesday
  ('employee-id-here', 3, '09:00', '18:00'), -- Wednesday
  ('employee-id-here', 4, '09:00', '18:00'), -- Thursday
  ('employee-id-here', 5, '09:00', '18:00'); -- Friday
```

## ✅ Payment Setup (Stripe)

- [ ] Create account at [stripe.com](https://stripe.com)
- [ ] Get API keys from Stripe Dashboard
- [ ] Add to `.env.local`:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] For local development, use Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```
- [ ] Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## ✅ Email Setup (Resend)

- [ ] Create account at [resend.com](https://resend.com)
- [ ] Get API key from Resend dashboard
- [ ] Add to `.env.local`:
  - `RESEND_API_KEY`
  - `EMAIL_FROM_ADDRESS` (use verified email/domain)

## ✅ (Optional) SMS Setup (Twilio)

- [ ] Create account at [twilio.com](https://twilio.com)
- [ ] Get credentials from Twilio Console
- [ ] Add to `.env.local`:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER`

## ✅ Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## ✅ Test Everything

- [ ] Sign up as a customer
- [ ] Book an appointment at `/book`
- [ ] Check customer dashboard at `/customer`
- [ ] Log in as employee, check dashboard at `/employee`
- [ ] Log in as admin, check dashboard at `/admin`
- [ ] Test payment flow (use Stripe test card: 4242 4242 4242 4242)

## 🎉 You're Ready!

Your salon app is now set up and ready to use!

For detailed setup instructions, see [SETUP.md](./SETUP.md)

