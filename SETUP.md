# Setup Guide - Salon App

This guide will walk you through setting up the Salon App from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Stripe account (for payments)
- A Resend account (for emails)
- (Optional) A Twilio account (for SMS)

## Step 1: Clone and Install

```bash
# Install dependencies
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

### 2.2 Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script
5. Verify all tables were created successfully

### 2.3 Get Your Supabase Credentials

1. Go to Project Settings → API
2. Copy the following:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 2.4 Set Up Authentication

1. Go to Authentication → Providers in Supabase
2. Enable Email provider (should be enabled by default)
3. (Optional) Enable OAuth providers (Google, Apple, etc.)

### 2.5 Seed Initial Data (Optional)

1. Go to SQL Editor in Supabase
2. Copy and paste the contents of `supabase/seed.sql`
3. Modify the seed data to match your needs
4. Run the script

**Important**: You'll need to create admin and employee users manually:
- Create users through the signup flow, or
- Use Supabase Auth to create users, then update their profiles with the correct role

## Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in all the values in `.env.local`:
   - Add your Supabase credentials
   - Add your Stripe keys
   - Add your Resend API key
   - (Optional) Add Twilio credentials

## Step 4: Set Up Stripe

### 4.1 Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Developers → API keys
3. Copy your:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 4.2 Set Up Webhook

1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   This will give you a webhook signing secret → `STRIPE_WEBHOOK_SECRET`

4. For production:
   - Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret

## Step 5: Set Up Resend (Email)

1. Go to [Resend](https://resend.com) and create an account
2. Navigate to API Keys
3. Create a new API key → `RESEND_API_KEY`
4. Set up your domain (or use the default domain for testing)
5. Set `EMAIL_FROM_ADDRESS` to your verified email or domain

## Step 6: (Optional) Set Up Twilio (SMS)

1. Go to [Twilio Console](https://console.twilio.com)
2. Get your Account SID → `TWILIO_ACCOUNT_SID`
3. Get your Auth Token → `TWILIO_AUTH_TOKEN`
4. Get a phone number → `TWILIO_FROM_NUMBER`

## Step 7: Create Initial Users

### Option A: Through the App

1. Start the development server: `npm run dev`
2. Go to `/signup` and create a customer account
3. To create an admin/employee, you'll need to manually update the database

### Option B: Through Supabase Dashboard

1. Go to Authentication → Users in Supabase
2. Create a new user manually
3. Go to SQL Editor and run:
   ```sql
   INSERT INTO profiles (id, role, full_name, email)
   VALUES ('user-uuid-here', 'admin', 'Admin Name', 'admin@example.com');
   ```
   Replace `user-uuid-here` with the actual user ID from auth.users

## Step 8: Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Step 9: Set Up Employee Shifts

After creating employee profiles, set up their working hours:

1. Go to SQL Editor in Supabase
2. Run queries like:
   ```sql
   INSERT INTO employee_shifts (employee_id, day_of_week, start_time, end_time)
   VALUES 
     ('employee-id', 1, '09:00', '18:00'), -- Monday
     ('employee-id', 2, '09:00', '18:00'), -- Tuesday
     ('employee-id', 3, '09:00', '18:00'), -- Wednesday
     ('employee-id', 4, '09:00', '18:00'), -- Thursday
     ('employee-id', 5, '09:00', '18:00'); -- Friday
   ```

## Step 10: Test the System

1. **Test Booking Flow**:
   - Go to `/book`
   - Complete the booking process
   - Verify appointment appears in customer dashboard

2. **Test Payments**:
   - Use Stripe test cards: `4242 4242 4242 4242`
   - Any future expiry date, any CVC

3. **Test Notifications**:
   - Create an appointment
   - Check that confirmation email is sent
   - Manually trigger reminder: `POST /api/notifications/reminders`

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Check that RLS policies allow your operations
- Ensure all tables were created successfully

### Authentication Issues
- Verify Supabase Auth is enabled
- Check that profiles are created for auth users
- Ensure RLS policies allow profile reads

### Payment Issues
- Verify Stripe keys are correct
- Check webhook endpoint is accessible
- Use Stripe test mode for development

### Email Issues
- Verify Resend API key is correct
- Check email domain is verified in Resend
- Check spam folder for test emails

## Production Deployment

1. **Deploy to Vercel** (recommended):
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables**:
   - Add all environment variables in Vercel dashboard
   - Use production Stripe keys
   - Update webhook URL in Stripe

3. **Update Supabase RLS Policies**:
   - Review and tighten RLS policies for production
   - Test all user flows

4. **Set Up Cron Jobs** (optional):
   - Use Vercel Cron or external service
   - Schedule: `/api/notifications/reminders` (daily)
   - Schedule: `/api/notifications/birthdays` (daily)
   - Schedule: `/api/notifications/process` (every 15 minutes)

## Next Steps

- Customize the UI to match your brand
- Add more services and employees
- Set up analytics tracking
- Configure backup and monitoring
- Set up error tracking (Sentry, etc.)

