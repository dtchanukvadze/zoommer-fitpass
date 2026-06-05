-- Members table
create table if not exists public.members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  department text,
  fitpass_tier text default 'standard',
  registered_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.members enable row level security;

create policy "Users can view their own record"
  on public.members for select using (auth.uid() = user_id);

create policy "HR admins can manage all records"
  on public.members for all using (auth.jwt() ->> 'role' = 'hr_admin');
