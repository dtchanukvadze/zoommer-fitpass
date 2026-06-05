# ZOOMMER × FITPASS 🧡

კორპორატიული FITPASS გამოწერების მართვის ვებ-აპლიკაცია ZOOMMER-ის თანამშრომლებისთვის.

## 🛠 ტექნოლოგიები

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — სტილიზაცია
- **Supabase** — ავტენტიფიკაცია + მონაცემთა ბაზა
- **Framer Motion** — ანიმაციები
- **Lucide React** — აიკონები
- **Lottie React** — მდიდარი ანიმაციები
- **Radix UI** — ხელმისაწვდომი კომპონენტები

## 🎨 ბრენდის ფერები

| ფერი | HEX | გამოყენება |
|------|-----|-----------|
| primary | `#FF6B00` | CTA, ბეჯები, აქტიური მდგომარეობა |
| primary-hover | `#E05E00` | hover ეფექტი |
| secondary | `#FF8533` | გრადიენტები |
| fitpass-dark | `#111111` | ტექსტი, ჰედერები |
| fitpass-orange | `#E35125` | სტატუსის ინდიკატორები |
| background-gray | `#F8F9FA` | ფონი |
| borders | `#E5E7EB` | გამყოფი ხაზები |

## 🚀 გაშვება

```bash
# 1. დამოკიდებულებების ინსტალაცია
npm install

# 2. გარემოს ცვლადები
cp .env.local.example .env.local
# შეავსე NEXT_PUBLIC_SUPABASE_URL და NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. მონაცემთა ბაზის მომზადება (Supabase SQL Editor-ში)
#    გაუშვი თანმიმდევრობით:
#    - supabase/schema.sql
#    - supabase/policies.sql
#    - supabase/triggers.sql
#    - supabase/seed.sql (არასავალდებულო, ტესტ მონაცემები)

# 4. დეველოპმენტ სერვერის გაშვება
npm run dev