-- Seed data for Salon App
-- Run this after creating the schema to populate initial data

-- Insert sample services
INSERT INTO services (name, description, duration_minutes, base_price, is_active) VALUES
  ('Haircut', 'Professional haircut for all hair types', 30, 30.00, TRUE),
  ('Haircut & Style', 'Haircut with styling and blow-dry', 45, 45.00, TRUE),
  ('Hair Color', 'Full hair coloring service', 90, 80.00, TRUE),
  ('Highlights', 'Partial highlights', 120, 100.00, TRUE),
  ('Balayage', 'Hand-painted balayage technique', 150, 120.00, TRUE),
  ('Hair Treatment', 'Deep conditioning treatment', 30, 40.00, TRUE),
  ('Beard Trim', 'Professional beard trimming and shaping', 20, 25.00, TRUE),
  ('Hair Wash & Blow Dry', 'Wash and style service', 30, 35.00, TRUE)
ON CONFLICT DO NOTHING;

-- Note: You'll need to create admin/employee profiles through the signup flow
-- or manually insert them. Here's an example structure:

-- Example: Create an admin profile (after creating auth user)
-- First create the auth user, then:
-- INSERT INTO profiles (id, role, full_name, email) VALUES
--   ('admin-user-uuid', 'admin', 'Admin User', 'admin@salon.com');

-- Example: Create employee profiles
-- INSERT INTO profiles (id, role, full_name, email, phone) VALUES
--   ('employee-1-uuid', 'employee', 'Jane Smith', 'jane@salon.com', '+1234567890'),
--   ('employee-2-uuid', 'employee', 'John Doe', 'john@salon.com', '+1234567891');

-- Example: Set up employee shifts (Monday to Friday, 9 AM - 6 PM)
-- Replace 'employee-1-uuid' with actual employee IDs
-- INSERT INTO employee_shifts (employee_id, day_of_week, start_time, end_time) VALUES
--   ('employee-1-uuid', 1, '09:00', '18:00'), -- Monday
--   ('employee-1-uuid', 2, '09:00', '18:00'), -- Tuesday
--   ('employee-1-uuid', 3, '09:00', '18:00'), -- Wednesday
--   ('employee-1-uuid', 4, '09:00', '18:00'), -- Thursday
--   ('employee-1-uuid', 5, '09:00', '18:00'), -- Friday
--   ('employee-2-uuid', 1, '09:00', '18:00'),
--   ('employee-2-uuid', 2, '09:00', '18:00'),
--   ('employee-2-uuid', 3, '09:00', '18:00'),
--   ('employee-2-uuid', 4, '09:00', '18:00'),
--   ('employee-2-uuid', 5, '09:00', '18:00');

-- Example: Create a sample promotion
INSERT INTO promotions (title, description, is_active, starts_at, ends_at) VALUES
  ('Summer Special', '20% off on all services during summer months', TRUE, 
   CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days')
ON CONFLICT DO NOTHING;

-- Example: Create a sample coupon
INSERT INTO coupons (code, description, discount_type, discount_value, min_spend, is_active, valid_from, valid_to) VALUES
  ('WELCOME10', '10% off for new customers', 'percentage', 10.00, 50.00, TRUE, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
  ('SAVE20', '$20 off on orders over $100', 'fixed_amount', 20.00, 100.00, TRUE, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;

