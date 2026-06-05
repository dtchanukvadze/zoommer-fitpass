-- supabase/triggers.sql — ავტომატური ტრიგერები

-- updated_at-ის ავტომატური განახლება subscriptions ცხრილში
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.subscriptions;
create trigger set_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ⚙️ ალტერნატივა: audit_log-ის ავტომატური ჩაწერა DB-ში
-- (თუ გინდა API-ს logAction()-ის ნაცვლად ბაზაში გაკეთება)
create or replace function public.auto_audit_subscription()
returns trigger language plpgsql security definer as $$
declare
  msg text;
begin
  if (TG_OP = 'INSERT') then
    if new.is_family_member then
      msg := 'დაამატა ოჯახის წევრი: ' || coalesce(new.member_name_geo, '');
    else
      msg := 'გაააქტიურა პირადი გამოწერა';
    end if;
  elsif (TG_OP = 'UPDATE' and old.status is distinct from new.status) then
    if new.status = 'active' then
      msg := 'გაააქტიურა გამოწერა';
    else
      msg := 'გააუქმა გამოწერა';
    end if;
  else
    return new;
  end if;

  insert into public.audit_logs (user_id, action_details)
  values (new.user_id, msg);
  return new;
end;
$$;

-- ⚠️ ჩართე ეს მხოლოდ თუ NOT იყენებ lib/audit.ts-ს (დუბლირების თავიდან აცილება)
-- drop trigger if exists audit_subscription on public.subscriptions;
-- create trigger audit_subscription
--   after insert or update on public.subscriptions
--   for each row execute function public.auto_audit_subscription();