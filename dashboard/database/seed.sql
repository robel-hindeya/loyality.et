-- ==============================================================================
-- LOYALTY CARD PLATFORM: SEED SCRIPT (Optional test data for Supabase SQL Editor)
-- ==============================================================================

-- If running in Supabase SQL Editor, you can create sample users in auth.users first,
-- or populate test records directly into public tables.

-- Sample Company
insert into public.companies (id, owner_id, name, slug, description, primary_color, category, address, phone, website)
values 
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Artisan Brew Coffee', 'artisan-brew', 'Specialty craft coffee & bakery roasted daily.', '#4F46E5', 'Coffee & Café', '124 Market Square, Downtown', '+1 (555) 019-2834', 'https://artisanbrew.example.com')
on conflict (id) do nothing;

-- Sample Programs
insert into public.loyalty_programs (id, company_id, title, description, target_stamps, reward_title, reward_description, card_bg_color, card_accent_color, stamp_icon, is_active)
values 
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'VIP Coffee Stamp Card', 'Buy 6 artisan coffees or specialty brews and get your 7th handcrafted drink free!', 6, '1 Free Handcrafted Beverage', 'Redeemable for any coffee, matcha latte, or cold brew of any size.', '#0F172A', '#6366F1', 'coffee', true)
on conflict (id) do nothing;
