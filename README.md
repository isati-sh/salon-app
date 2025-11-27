# Salon App - Production-Ready Hair Salon Management System

A comprehensive web application for managing a hair salon business, built with Next.js 14+, TypeScript, Supabase, and Stripe.

## Features

### Public Website
- **Home Page**: Marketing landing page with service previews
- **Services**: Display all available services with pricing
- **Gallery**: Showcase salon work (placeholder images)
- **Team**: Display employee profiles
- **Reviews**: Public testimonials from customers
- **About**: Information about the salon
- **Contact**: Contact form and location information

### Appointment Booking System
- Multi-step booking flow:
  1. Select service
  2. Choose stylist (or "Any available")
  3. Pick date
  4. View available time slots
  5. Confirm booking
- Real-time availability checking
- Prevents double-booking
- Considers employee shifts and blocked times

### Authentication & Roles
- **Customer**: Book appointments, view history, manage profile
- **Employee**: View schedule, manage availability, mark appointments complete
- **Admin**: Full system management, analytics, promotions

### Payment Integration
- Stripe integration for online payments
- Support for:
  - Pay at salon (cash)
  - Online deposit payments
  - Full online payment
  - Gift card payments
- Webhook handler for payment status updates

### Notifications
- Email notifications (via Resend)
- SMS notifications (via Twilio, optional)
- Types:
  - Appointment confirmations
  - Appointment reminders
  - Promotional emails
  - Birthday offers
  - Announcements

### Promotions & Coupons
- Create and manage promotions
- Coupon system with:
  - Percentage or fixed discounts
  - Usage limits
  - Minimum spend requirements
  - Automatic application at checkout

### Gift Cards
- Purchase gift cards
- Reusable balance system
- Transaction history
- Partial redemption support

### Reviews & Feedback
- Customers can leave reviews after service
- Star ratings (1-5)
- "Would return?" feedback
- Public testimonials display

### Dashboards
- **Admin Dashboard**: Analytics, revenue tracking, employee performance
- **Employee Dashboard**: Schedule view, appointment management
- **Customer Dashboard**: Appointment history, gift cards, profile

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **SMS**: Twilio (optional)

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# SMS (Optional - Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_phone_number
```

### 2. Database Setup

The database schema is defined in `db/db-schema.ts`. You'll need to create the following tables in Supabase:

- `profiles` - User profiles with roles
- `services` - Salon services
- `employee_shifts` - Employee working hours
- `employee_blocked_times` - Blocked time slots
- `appointments` - Customer appointments
- `payments` - Payment records
- `promotions` - Promotional campaigns
- `coupons` - Discount coupons
- `coupon_redemptions` - Coupon usage tracking
- `announcements` - System announcements
- `notifications` - Notification queue
- `reviews` - Customer reviews
- `gift_cards` - Gift card records
- `gift_card_transactions` - Gift card transaction history

Refer to `db/db-schema.ts` for the exact schema structure. You'll also need to set up Row Level Security (RLS) policies in Supabase.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

### Bookings
- `GET /api/bookings/availability` - Get available time slots
- `POST /api/bookings/create` - Create a new appointment

### Payments
- `POST /api/stripe/webhook` - Stripe webhook handler

### Notifications
- `POST /api/notifications/process` - Process queued notifications
- `POST /api/notifications/reminders` - Queue appointment reminders
- `POST /api/notifications/birthdays` - Send birthday notifications

### Reviews
- `POST /api/reviews/create` - Create a review

## Project Structure

```
salon-app/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (public)/        # Public marketing pages
│   ├── (dashboard)/     # Role-based dashboards
│   │   ├── admin/       # Admin dashboard
│   │   ├── employee/    # Employee dashboard
│   │   └── customer/    # Customer dashboard
│   └── api/             # API routes
├── components/
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase/        # Supabase client utilities
│   ├── notifications/  # Email/SMS notification system
│   ├── bookings.ts      # Booking business logic
│   ├── payments.ts      # Stripe integration
│   ├── promotions.ts    # Promotions & coupons
│   └── auth.ts          # Authentication helpers
└── db/
    └── db-schema.ts     # Database type definitions
```

## Key Features Implementation

### Booking System
The booking system uses server-side logic to:
- Calculate available time slots based on service duration
- Check employee shifts
- Respect blocked times
- Prevent double-booking

### Notification System
Notifications are queued in the database and processed asynchronously. The system supports:
- Email notifications (Resend)
- SMS notifications (Twilio, optional)
- Automatic appointment reminders
- Birthday emails
- Promotional campaigns

### Payment Processing
- Stripe Payment Intents for online payments
- Webhook handler for payment status updates
- Gift card payment support
- Multiple payment methods (cash, card, gift card)

## Quick Start

For a step-by-step setup guide, see [QUICKSTART.md](./QUICKSTART.md)

For detailed setup instructions, see [SETUP.md](./SETUP.md)

For troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Next Steps

1. ✅ Set up Supabase database using `supabase/schema.sql`
2. ✅ Configure environment variables in `.env.local` (use `.env.local.example` as template)
3. ✅ Create admin user: `npm run create-admin`
4. ✅ Create employee users: `npm run create-employee`
5. ✅ Set up Stripe webhook endpoint
6. ✅ Configure Resend for email
7. ✅ (Optional) Set up Twilio for SMS
8. ✅ Add seed data for services (see `supabase/seed.sql`)

## Helper Scripts

- `npm run create-admin` - Create an admin user interactively
- `npm run create-employee` - Create an employee user interactively

## Health Check

Visit `/api/health` to check system status and configuration.

## Notes

- The React Compiler is disabled as requested
- All API keys should be stored in environment variables
- The notification system is abstracted to allow easy provider switching
- Gift cards support partial redemption and transaction history
- The booking system prevents double-booking at the database level

## License

Private - All rights reserved
