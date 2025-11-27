# Troubleshooting Guide

Common issues and solutions for the Salon App.

## Database Issues

### "Missing Supabase environment variables"
**Solution**: Make sure `.env.local` exists and contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### "relation does not exist" or "table not found"
**Solution**: Run the schema SQL file:
1. Go to Supabase SQL Editor
2. Copy and paste `supabase/schema.sql`
3. Execute the script
4. Verify tables were created in the Table Editor

### "new row violates row-level security policy"
**Solution**: RLS policies might be too restrictive. Check:
1. Go to Supabase → Authentication → Policies
2. Verify policies allow your operations
3. For development, you can temporarily disable RLS (NOT recommended for production)

### Profile not created after signup
**Solution**: 
1. Check if auth user was created in Supabase Auth
2. Manually create profile:
```sql
INSERT INTO profiles (id, role, full_name, email)
VALUES ('user-uuid-from-auth', 'customer', 'User Name', 'user@example.com');
```

## Authentication Issues

### Can't log in after signup
**Solution**:
1. Check Supabase Auth → Users to see if user exists
2. Check if email confirmation is required (disable for testing)
3. Verify profile was created in `profiles` table

### "Unauthorized" error on dashboard
**Solution**:
1. Check user's role in `profiles` table
2. Verify middleware is working correctly
3. Check browser console for errors

### Redirect loop on login
**Solution**:
1. Clear browser cookies
2. Check middleware configuration
3. Verify auth session is being created

## Booking Issues

### No available time slots showing
**Solution**:
1. Check if employee shifts are set up:
```sql
SELECT * FROM employee_shifts;
```
2. Verify service duration is set correctly
3. Check for blocked times that might be covering all slots
4. Ensure employee has shifts for the selected day of week

### "Time slot is no longer available" error
**Solution**: This is expected behavior - the slot was booked between selection and confirmation. The booking system prevents double-booking.

### Can't select a date
**Solution**: 
1. Check date picker is working (browser compatibility)
2. Verify date is not in the past
3. Check browser console for JavaScript errors

## Payment Issues

### Stripe payment fails
**Solution**:
1. Verify Stripe keys are correct (test vs live)
2. Check Stripe Dashboard for error logs
3. Use test card: `4242 4242 4242 4242`
4. Verify webhook endpoint is accessible

### Webhook not receiving events
**Solution**:
1. For local dev, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. Check webhook secret matches in `.env.local`
3. Verify endpoint URL in Stripe Dashboard
4. Check server logs for webhook errors

### Payment status not updating
**Solution**:
1. Check webhook is configured correctly
2. Verify webhook handler is processing events
3. Manually trigger webhook test in Stripe Dashboard
4. Check database for payment records

## Email/SMS Issues

### Emails not sending
**Solution**:
1. Verify `RESEND_API_KEY` is set correctly
2. Check `EMAIL_FROM_ADDRESS` is verified in Resend
3. Check Resend dashboard for delivery logs
4. Verify notifications are being queued in database:
```sql
SELECT * FROM notifications WHERE status = 'queued';
```

### SMS not sending
**Solution**:
1. Verify Twilio credentials are set (optional feature)
2. Check Twilio account has credits
3. Verify phone number format is correct
4. SMS will fail gracefully if Twilio is not configured

### Notifications stuck in "queued"
**Solution**:
1. Manually process notifications:
   ```bash
   curl -X POST http://localhost:3000/api/notifications/process
   ```
2. Check notification service logs
3. Verify email/SMS provider credentials

## Build/Deployment Issues

### Build fails with TypeScript errors
**Solution**:
1. Run `npm run lint` to see specific errors
2. Check all imports are correct
3. Verify TypeScript version compatibility
4. Clear `.next` folder and rebuild

### "Module not found" errors
**Solution**:
1. Delete `node_modules` and `.next`
2. Run `npm install`
3. Restart dev server

### Environment variables not working
**Solution**:
1. Verify `.env.local` is in project root
2. Restart dev server after changing env vars
3. For production, set env vars in deployment platform
4. Variables starting with `NEXT_PUBLIC_` are exposed to browser

## Performance Issues

### Slow page loads
**Solution**:
1. Check database query performance
2. Add indexes for frequently queried columns
3. Use Supabase connection pooling
4. Enable Next.js caching where appropriate

### Too many database queries
**Solution**:
1. Review server components for N+1 queries
2. Use Supabase select with joins
3. Implement caching for static data
4. Use React Query for client-side caching

## Getting Help

1. **Check logs**: Browser console and server logs
2. **Health check**: Visit `/api/health` to see system status
3. **Database**: Check Supabase logs in dashboard
4. **Stripe**: Check Stripe Dashboard → Logs
5. **Resend**: Check Resend Dashboard → Logs

## Common SQL Queries for Debugging

```sql
-- Check all users and roles
SELECT id, email, role, full_name FROM profiles;

-- Check appointments
SELECT * FROM appointments ORDER BY start_datetime DESC LIMIT 10;

-- Check payments
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;

-- Check queued notifications
SELECT * FROM notifications WHERE status = 'queued';

-- Check employee shifts
SELECT e.full_name, s.day_of_week, s.start_time, s.end_time
FROM employee_shifts s
JOIN profiles e ON s.employee_id = e.id;

-- Check for overlapping appointments (should be none)
SELECT a1.id, a1.employee_id, a1.start_datetime, a1.end_datetime,
       a2.id, a2.start_datetime, a2.end_datetime
FROM appointments a1
JOIN appointments a2 ON a1.employee_id = a2.employee_id
WHERE a1.id != a2.id
  AND a1.status IN ('pending', 'confirmed')
  AND a2.status IN ('pending', 'confirmed')
  AND a1.start_datetime < a2.end_datetime
  AND a1.end_datetime > a2.start_datetime;
```

