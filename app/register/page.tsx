'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Phone, Mail, Calendar, IdCard,
  Loader2, CheckCircle2, AlertCircle, Eye, EyeOff,
} from 'lucide-react'

interface FormData {
  firstNameGeo: string
  lastNameGeo: string
  firstNameLat: string
  lastNameLat: string
  personalId: string
  phone: string
  dob: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState<FormData>({
    firstNameGeo: '',
    lastNameGeo: '',
    firstNameLat: '',
    lastNameLat: '',
    personalId: '',
    phone: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // პირადი ნომერი - მხოლოდ ციფრები, მაქს 11
    if (name === 'personalId') {
      setForm({ ...form, [name]: value.replace(/\D/g, '').slice(0, 11) })
      return
    }
    setForm({ ...form, [name]: value })
  }

  const validate = (): string | null => {
    if (!form.firstNameGeo.trim() || !form.lastNameGeo.trim())
      return 'გთხოვთ შეავსოთ სახელი და გვარი ქართულად'
    if (form.personalId.length !== 11)
      return 'პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს'
    if (!/^[0-9]{9,}$/.test(form.phone.replace(/\D/g, '')))
      return 'გთხოვთ შეიყვანოთ სწორი მობილურის ნომერი'
    if (!form.dob)
      return 'გთხოვთ მიუთითოთ დაბადების თარიღი'
    if (form.password.length < 6)
      return 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს'
    if (form.password !== form.confirmPassword)
      return 'პაროლები არ ემთხვევა'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        // პირადი ნომერი → ფარული email ფორმატი
        email: `${form.personalId}@zoommer.ge`,
        password: form.password,
        options: {
          data: {
            personal_id: form.personalId,
            first_name_geo: form.firstNameGeo,
            last_name_geo: form.lastNameGeo,
            first_name_lat: form.firstNameLat,
            last_name_lat: form.lastNameLat,
            phone: form.phone,
            dob: form.dob,
            // role default = 'user' (DB-ში default-ად ისედაც user-ია)
            role: 'user',
          },
        },
      })

      if (signUpError) {
        // ხშირი შეცდომების ქართული თარგმანი
        if (signUpError.message.includes('already registered'))
          setError('ეს პირადი ნომერი უკვე რეგისტრირებულია')
        else
          setError('რეგისტრაცია ვერ მოხერხდა. სცადეთ თავიდან')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch {
      setError('დაფიქსირდა მოულოდნელი შეცდომა')
      setLoading(false)
    }
  }

  // წარმატების ეკრანი
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-gray px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <CheckCircle2 className="w-20 h-20 text-green-500" strokeWidth={1.5} />
          </motion.div>
          <h2 className="text-2xl font-bold text-fitpass-dark mb-2">
            რეგისტრაცია წარმატებულია! 🎉
          </h2>
          <p className="text-gray-500">
            გადამისამართდებით ავტორიზაციის გვერდზე...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-gray flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-black">Z</span>
          </div>
          <div className="w-px h-8 bg-borders" />
          <span className="text-fitpass-dark text-2xl font-black tracking-tight">
            FITPASS
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-borders p-8 md:p-10">
          <h1 className="text-2xl font-bold text-fitpass-dark mb-1">
            რეგისტრაცია
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            შეავსეთ ფორმა ZOOMMER × FITPASS პორტალზე დასარეგისტრირებლად
          </p>

          {/* Error alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                icon={<User className="w-4 h-4" />}
                label="სახელი (ქართულად)"
                name="firstNameGeo"
                value={form.firstNameGeo}
                onChange={handleChange}
                placeholder="გიორგი"
              />
              <Input
                icon={<User className="w-4 h-4" />}
                label="გვარი (ქართულად)"
                name="lastNameGeo"
                value={form.lastNameGeo}
                onChange={handleChange}
                placeholder="გელაშვილი"
              />
              <Input
                icon={<User className="w-4 h-4" />}
                label="სახელი (ლათინურად)"
                name="firstNameLat"
                value={form.firstNameLat}
                onChange={handleChange}
                placeholder="Giorgi"
              />
              <Input
                icon={<User className="w-4 h-4" />}
                label="გვარი (ლათინურად)"
                name="lastNameLat"
                value={form.lastNameLat}
                onChange={handleChange}
                placeholder="Gelashvili"
              />
              <Input
                icon={<IdCard className="w-4 h-4" />}
                label="პირადი ნომერი"
                name="personalId"
                value={form.personalId}
                onChange={handleChange}
                placeholder="01010101010"
                hint={`${form.personalId.length}/11`}
              />
              <Input
                icon={<Phone className="w-4 h-4" />}
                label="მობილურის ნომერი"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="555 12 34 56"
              />
              <Input
                icon={<Calendar className="w-4 h-4" />}
                label="დაბადების თარიღი"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
              />
              <Input
                icon={<Mail className="w-4 h-4" />}
                label="ელ-ფოსტა"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@mail.com"
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Input
                  icon={<Lock className="w-4 h-4" />}
                  label="პაროლი"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Input
                icon={<Lock className="w-4 h-4" />}
                label="გაიმეორეთ პაროლი"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  მიმდინარეობს რეგისტრაცია...
                </>
              ) : (
                'რეგისტრაცია'
              )}
            </motion.button>

            <p className="text-center text-sm text-gray-500">
              უკვე გაქვთ ანგარიში?{' '}
              <a href="/login" className="text-primary font-semibold hover:underline">
                შესვლა
              </a>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

/* ──────── Reusable Input Component ──────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: React.ReactNode
  hint?: string
}

function Input({ label, icon, hint, ...props }: InputProps) {
  return (
    <div className="flex flex-col">
      <label className="flex items-center justify-between text-sm font-medium text-fitpass-dark mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="text-primary">{icon}</span>
          {label}
        </span>
        {hint && <span className="text-xs text-gray-400 font-normal">{hint}</span>}
      </label>
      <input
        {...props}
        className="w-full px-4 py-2.5 rounded-xl border border-borders bg-background-gray/50 text-fitpass-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
      />
    </div>
  )
}