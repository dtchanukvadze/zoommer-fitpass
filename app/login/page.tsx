// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, IdCard, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { isValidPersonalId, personalIdToEmail } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [personalId, setPersonalId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidPersonalId(personalId)) {
      setError("პირადი ნომერი უნდა შედგებოდეს 11 ციფრისგან.");
      return;
    }

    setLoading(true);
    // პირადი ნომერი → კორპორატიული email (ფარულად)
    const email = personalIdToEmail(personalId);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("არასწორი პირადი ნომერი ან პაროლი.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-gray px-4">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-mesh-gradient" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-borders bg-white p-8 shadow-card-hover sm:p-10"
      >
        {/* Co-branded logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-sm">
              <span className="text-xl font-black text-white">Z</span>
            </div>
            <span className="text-2xl font-light text-borders">×</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-0.5">
                <span className="h-3.5 w-1.5 rounded-full bg-fitpass-orange" />
                <span className="h-6 w-1.5 rounded-full bg-primary" />
                <span className="h-5 w-1.5 rounded-full bg-secondary" />
              </div>
              <span className="text-lg font-extrabold text-fitpass-dark">FITPASS</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">კორპორატიული გამოწერების პორტალი | </p>
          <p className="text-sm text-gray-200">hr- 91919191919 | admin123</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Personal ID */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-fitpass-dark">
              პირადი ნომერი
            </label>
            <div className="relative">
              <IdCard className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={personalId}
                onChange={(e) =>
                  setPersonalId(e.target.value.replace(/\D/g, ""))
                }
                placeholder="00000000000"
                className="w-full rounded-xl border border-borders bg-background-gray py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-fitpass-dark">
              პაროლი
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-borders bg-background-gray py-3 pl-11 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fitpass-dark"
              >
                {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                მიმდინარეობს...
              </>
            ) : (
              "შესვლა"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}