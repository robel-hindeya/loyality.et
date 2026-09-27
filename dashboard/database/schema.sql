-- ==============================================================================
-- LOYALTY CARD PLATFORM: SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Custom Enums
do $$ begin
  create type user_role as enum ('company', 'cashier', 'user');
exception
  when duplicate_object then null;
end $$;

-- 3. Profiles Table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  role user_role not null default 'user',
  company_id uuid, -- For cashiers or company staff
  qr_code_token text unique not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for quick lookup during cashier QR scan
create index if not exists idx_profiles_qr_token on public.profiles(qr_code_token);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_company_id on public.profiles(company_id);

-- 4. Companies Table
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  banner_url text,
  primary_color text not null default '#4F46E5',
  category text default 'Retail & Services',
  address text,
  phone text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add foreign key constraint for profiles.company_id -> companies.id if not already present
do $$ begin
  alter table public.profiles
    add constraint fk_profiles_company
    foreign key (company_id)
    references public.companies(id)
    on delete set null;
exception
  when duplicate_object then null;
end $$;

-- 5. Loyalty Programs Table
create table if not exists public.loyalty_programs (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  title text not null,
  description text,
  target_stamps integer not null default 6 check (target_stamps >= 2 and target_stamps <= 50),
  reward_title text not null default '1 Free Service / Product',
  reward_description text,
  card_bg_color text not null default '#0F172A',
  card_accent_color text not null default '#6366F1',
  stamp_icon text not null default 'star', -- 'star', 'coffee', 'gift', 'award', 'sparkles', 'heart'
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_loyalty_programs_company on public.loyalty_programs(company_id);

-- 6. Loyalty Cards Table (User membership in a program)
create table if not exists public.loyalty_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  program_id uuid references public.loyalty_programs(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  current_stamps integer not null default 0 check (current_stamps >= 0),
  lifetime_stamps integer not null default 0 check (lifetime_stamps >= 0),
  rewards_earned integer not null default 0 check (rewards_earned >= 0),
  rewards_redeemed integer not null default 0 check (rewards_redeemed >= 0),
  status text not null default 'active', -- 'active', 'reward_ready'
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_program unique (user_id, program_id)
);

create index if not exists idx_cards_user on public.loyalty_cards(user_id);
create index if not exists idx_cards_program on public.loyalty_cards(program_id);
create index if not exists idx_cards_company on public.loyalty_cards(company_id);

-- 7. Stamp / Visit Logs
create table if not exists public.stamp_logs (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references public.loyalty_cards(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  cashier_id uuid references public.profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete cascade not null,
  program_id uuid references public.loyalty_programs(id) on delete cascade not null,
  stamps_added integer not null default 1,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_stamp_logs_card on public.stamp_logs(card_id);
create index if not exists idx_stamp_logs_company on public.stamp_logs(company_id);
create index if not exists idx_stamp_logs_cashier on public.stamp_logs(cashier_id);
create index if not exists idx_stamp_logs_created on public.stamp_logs(created_at desc);

-- 8. Reward Redemptions Table
create table if not exists public.reward_redemptions (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references public.loyalty_cards(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  cashier_id uuid references public.profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete cascade not null,
  program_id uuid references public.loyalty_programs(id) on delete cascade not null,
  reward_title text not null,
  redemption_code text not null,
  stamps_spent integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_redemptions_card on public.reward_redemptions(card_id);
create index if not exists idx_redemptions_company on public.reward_redemptions(company_id);
create index if not exists idx_redemptions_user on public.reward_redemptions(user_id);

-- 9. Orders Table (Company orders placed by customers)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  program_id uuid references public.loyalty_programs(id) on delete set null,
  card_id uuid references public.loyalty_cards(id) on delete set null,
  order_number text unique not null,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(10,2) not null default 0.00,
  stamps_earned integer not null default 1,
  status text not null default 'pending', -- 'pending', 'preparing', 'ready', 'completed', 'cancelled'
  pickup_type text not null default 'in_store', -- 'in_store', 'curbside', 'dine_in'
  special_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_company on public.orders(company_id);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- 10. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.loyalty_programs enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.stamp_logs enable row level security;
alter table public.reward_redemptions enable row level security;
alter table public.orders enable row level security;

-- PROFILES POLICIES
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Company and Cashiers can view customer profile by QR token"
  on public.profiles for select
  using (
    auth.uid() = id or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('company', 'cashier')
    )
  );

-- COMPANIES POLICIES
create policy "Public can view company info"
  on public.companies for select
  using (true);

create policy "Company owners can manage company"
  on public.companies for all
  using (auth.uid() = owner_id);

-- LOYALTY PROGRAMS POLICIES
create policy "Public can view active loyalty programs"
  on public.loyalty_programs for select
  using (is_active = true or exists (
    select 1 from public.companies
    where companies.id = loyalty_programs.company_id and companies.owner_id = auth.uid()
  ));

create policy "Company owner can manage loyalty programs"
  on public.loyalty_programs for all
  using (exists (
    select 1 from public.companies
    where companies.id = loyalty_programs.company_id and companies.owner_id = auth.uid()
  ));

-- LOYALTY CARDS POLICIES
create policy "Users can view own cards"
  on public.loyalty_cards for select
  using (auth.uid() = user_id);

create policy "Company staff can view customer cards for their company"
  on public.loyalty_cards for select
  using (
    exists (
      select 1 from public.companies
      where companies.id = loyalty_cards.company_id and companies.owner_id = auth.uid()
    )
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.company_id = loyalty_cards.company_id and profiles.role = 'cashier'
    )
  );

create policy "Company staff can update customer cards for their company"
  on public.loyalty_cards for update
  using (
    exists (
      select 1 from public.companies
      where companies.id = loyalty_cards.company_id and companies.owner_id = auth.uid()
    )
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.company_id = loyalty_cards.company_id and profiles.role = 'cashier'
    )
  );

create policy "Allow inserting loyalty cards"
  on public.loyalty_cards for insert
  with check (auth.uid() = user_id or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role in ('company', 'cashier')
  ));

-- STAMP LOGS POLICIES
create policy "Users can view their stamp logs"
  on public.stamp_logs for select
  using (auth.uid() = user_id);

create policy "Company and Cashiers can view their company logs"
  on public.stamp_logs for select
  using (
    exists (
      select 1 from public.companies
      where companies.id = stamp_logs.company_id and companies.owner_id = auth.uid()
    )
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.company_id = stamp_logs.company_id
    )
  );

create policy "Cashiers and Companies can insert stamp logs"
  on public.stamp_logs for insert
  with check (
    exists (
      select 1 from public.companies
      where companies.id = stamp_logs.company_id and companies.owner_id = auth.uid()
    )
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.company_id = stamp_logs.company_id
    )
  );

-- REWARD REDEMPTIONS POLICIES
create policy "Users can view their reward redemptions"
  on public.reward_redemptions for select
  using (auth.uid() = user_id);

create policy "Company and Cashiers can view company redemptions"
  on public.reward_redemptions for select
  using (
    exists (
      select 1 from public.companies
      where companies.id = reward_redemptions.company_id and companies.owner_id = auth.uid()
    )
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.company_id = reward_redemptions.company_id
    )
  );

create policy "Cashiers and Companies can insert redemptions"
  on public.reward_redemptions for insert
  with check (
    exists (
      select 1 from public.companies
      where companies.id = reward_redemptions.company_id and companies.owner_id = auth.uid()
    )
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.company_id = reward_redemptions.company_id
    )
  );

-- 10. Automated Auth Trigger for User Profiles
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role user_role := 'user';
  v_company_id uuid := null;
  v_token text;
  v_name text;
begin
  -- Extract metadata if passed during supabase signUp
  if new.raw_user_meta_data->>'role' is not null then
    v_role := (new.raw_user_meta_data->>'role')::user_role;
  end if;

  if new.raw_user_meta_data->>'company_id' is not null then
    v_company_id := (new.raw_user_meta_data->>'company_id')::uuid;
  end if;

  v_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  
  -- Generate unique QR token: LC-[RANDOM 4 CHARS]-[RANDOM 4 CHARS]
  v_token := 'LC-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 4)) || '-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 5, 4));

  insert into public.profiles (id, email, full_name, role, company_id, qr_code_token, avatar_url)
  values (
    new.id,
    new.email,
    v_name,
    v_role,
    v_company_id,
    v_token,
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
