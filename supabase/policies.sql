-- supabase/policies.sql — Row Level Security პოლიტიკები
-- (გაუშვი schema.sql-ის შემდეგ თუ ცალკე გინდა მართვა)

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

-- ჰელპერი: არის თუ არა მიმდინარე მომხმარებელი HR
create or replace function public.is_hr()
returns boolean language sql security definer stable as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'hr'
  );
$$;

-- ============ profiles ============
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_hr());
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ============ subscriptions ============
create policy "Users read own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_hr());
create policy "Users insert own subscriptions" on public.subscriptions
  for insert with check (auth.uid() = user_id);
create policy "Users update own subscriptions" on public.subscriptions
  for update using (auth.uid() = user_id);

-- ============ audit_logs ============
create policy "Users read own logs" on public.audit_logs
  for select using (auth.uid() = user_id or public.is_hr());
create policy "Users insert own logs" on public.audit_logs
  for insert with check (auth.uid() = user_id);