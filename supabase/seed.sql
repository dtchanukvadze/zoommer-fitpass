-- supabase/seed.sql — ტესტ მონაცემები განვითარებისთვის
-- ⚠️ ჯერ შექმენი მომხმარებლები Supabase Auth-ში, შემდეგ გაუშვი ეს ფაილი.
-- შეცვალე ქვემოთ მოცემული UUID-ები რეალური auth.users.id-ებით.

-- ============ HR მომხმარებლის პროფილი ============
-- Email: 11111111111@zoommer.ge
insert into public.profiles
  (id, role, first_name_geo, last_name_geo, first_name_lat, last_name_lat, personal_id, phone, dob, email)
values
  ('00000000-0000-0000-0000-000000000001', 'hr', 'ნინო', 'ხარაძე', 'Nino', 'Kharadze',
   '11111111111', '+995599000001', '1990-05-15', '11111111111@zoommer.ge')
on conflict (id) do nothing;

-- ============ ჩვეულებრივი თანამშრომელი ============
-- Email: 01001001001@zoommer.ge
insert into public.profiles
  (id, role, first_name_geo, last_name_geo, first_name_lat, last_name_lat, personal_id, phone, dob, email)
values
  ('00000000-0000-0000-0000-000000000002', 'user', 'გიორგი', 'ბერიძე', 'Giorgi', 'Beridze',
   '01001001001', '+995599000002', '1995-08-20', '01001001001@zoommer.ge')
on conflict (id) do nothing;

-- ============ ნიმუშის გამოწერები ============
-- გიორგის პირადი აქტიური გამოწერა
insert into public.subscriptions
  (user_id, is_family_member, status)
values
  ('00000000-0000-0000-0000-000000000002', false, 'active');

-- გიორგის ოჯახის წევრი
insert into public.subscriptions
  (user_id, is_family_member, member_name_geo, member_name_lat, member_personal_id, member_phone, member_dob, member_email, status)
values
  ('00000000-0000-0000-0000-000000000002', true, 'ანა ბერიძე', 'Ana Beridze',
   '02002002002', '+995599000003', '2000-01-10', 'ana@example.com', 'active');

-- ============ ნიმუშის audit ლოგი ============
insert into public.audit_logs (user_id, action_details)
values
  ('00000000-0000-0000-0000-000000000002', 'გაააქტიურა პირადი გამოწერა'),
  ('00000000-0000-0000-0000-000000000002', 'დაამატა ოჯახის წევრი: ანა ბერიძე');