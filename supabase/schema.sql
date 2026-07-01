-- Users (extends Supabase auth)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'landlord' check (role in ('landlord', 'accountant')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive' check (subscription_status in ('active', 'trialing', 'inactive')),
  created_at timestamptz default now()
);

-- Properties
create table public.properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  address text not null,
  property_type text not null default 'uk_property' check (property_type in ('uk_property', 'furnished_holiday_let', 'foreign_property')),
  ownership_percentage numeric not null default 100 check (ownership_percentage > 0 and ownership_percentage <= 100),
  created_at timestamptz default now()
);

-- Xero connections
create table public.xero_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  tenant_id text not null,
  tenant_name text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- HMRC connections
create table public.hmrc_connections (
  id uuid references public.users(id) on delete cascade primary key,
  nino text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Transactions
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  xero_transaction_id text,
  date date not null,
  description text,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text not null check (category in (
    'rental_income', 'repairs_maintenance', 'insurance',
    'agent_fees', 'mortgage_interest', 'council_tax',
    'utilities', 'legal_professional', 'other_allowable', 'non_allowable'
  )),
  is_mortgage_interest boolean default false,
  created_at timestamptz default now()
);

-- Obligations (from HMRC)
create table public.obligations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  hmrc_obligation_id text,
  period_start date not null,
  period_end date not null,
  due_date date not null,
  status text not null default 'open' check (status in ('open', 'fulfilled', 'overdue')),
  created_at timestamptz default now()
);

-- Submissions
create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  obligation_id uuid references public.obligations(id) not null,
  period_start date not null,
  period_end date not null,
  total_income numeric not null default 0,
  total_expenses numeric not null default 0,
  net_profit numeric not null default 0,
  mortgage_interest numeric not null default 0,
  section24_relief numeric not null default 0,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'accepted', 'rejected')),
  hmrc_submission_id text,
  submitted_at timestamptz,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.xero_connections enable row level security;
alter table public.hmrc_connections enable row level security;
alter table public.transactions enable row level security;
alter table public.obligations enable row level security;
alter table public.submissions enable row level security;

-- RLS Policies (users only see their own data)
create policy "users_own" on public.users for all using (auth.uid() = id);
create policy "properties_own" on public.properties for all using (auth.uid() = user_id);
create policy "xero_own" on public.xero_connections for all using (auth.uid() = user_id);
create policy "hmrc_own" on public.hmrc_connections for all using (auth.uid() = id);
create policy "transactions_own" on public.transactions for all using (auth.uid() = user_id);
create policy "obligations_own" on public.obligations for all using (auth.uid() = user_id);
create policy "submissions_own" on public.submissions for all using (auth.uid() = user_id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
