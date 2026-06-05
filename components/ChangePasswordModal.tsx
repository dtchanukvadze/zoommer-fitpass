// components/ChangePasswordModal.tsx
"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

export default function ChangePasswordModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setShow(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("პაროლები არ ემთხვევა.");
      return;
    }

    try {
      setLoading(true);
      const { error: err } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (err) {
        setError("შეცდომა პაროლის შეცვლისას.");
        return;
      }
      reset();
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-fitpass-dark/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-card-hover sm:p-8"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-4 w-4 text-primary" />
                      </div>
                      <Dialog.Title className="text-xl font-bold text-fitpass-dark">
                        პაროლის შეცვლა
                      </Dialog.Title>
                    </div>
                    <Dialog.Close
                      className="rounded-full p-1.5 text-gray-400 transition hover:bg-background-gray hover:text-fitpass-dark"
                      aria-label="დახურვა"
                    >
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-fitpass-dark">
                        ახალი პაროლი
                      </label>
                      <div className="relative">
                        <input
                          type={show ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="მინიმუმ 6 სიმბოლო"
                          className="w-full rounded-xl border border-borders bg-background-gray px-4 py-2.5 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShow(!show)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                        >
                          {show ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-fitpass-dark">
                        გაიმეორეთ ახალი პაროლი
                      </label>
                      <input
                        type={show ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-borders bg-background-gray px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {error && (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                        {error}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                      >
                        გაუქმება
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? "მიმდინარეობს..." : "შეცვლა"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}