// components/EditProfileModal.tsx
"use client";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, IdCard, Lock } from "lucide-react";
import { Button } from "./ui/button";

export interface ProfileData {
  first_name_geo: string;
  last_name_geo: string;
  first_name_lat: string;
  last_name_lat: string;
  phone: string;
  email: string;
  dob: string;
  personal_id: string; // read-only
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: Omit<ProfileData, "personal_id">) => Promise<void>;
  initialData: ProfileData | null;
}

export default function EditProfileModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: Props) {
  const [form, setForm] = useState<ProfileData>({
    first_name_geo: "",
    last_name_geo: "",
    first_name_lat: "",
    last_name_lat: "",
    phone: "",
    email: "",
    dob: "",
    personal_id: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setForm(initialData);
      setError("");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.first_name_geo || !form.last_name_geo) {
      setError("გთხოვთ შეავსოთ სახელი და გვარი.");
      return;
    }

    try {
      setLoading(true);
      const { personal_id, ...updateData } = form;
      await onSubmit(updateData);
      onOpenChange(false);
    } catch {
      setError("დაფიქსირდა შეცდომა. სცადეთ თავიდან.");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof ProfileData, value: string) =>
    setForm({ ...form, [key]: value });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-fitpass-dark/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-card-hover sm:p-8"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold text-fitpass-dark">
                      პროფილის რედაქტირება
                    </Dialog.Title>
                    <Dialog.Close
                      className="rounded-full p-1.5 text-gray-400 transition hover:bg-background-gray hover:text-fitpass-dark"
                      aria-label="დახურვა"
                    >
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Personal ID (read-only) */}
                    <div className="flex items-center gap-3 rounded-xl border border-borders bg-amber-50/50 p-3">
                      <Lock className="h-4 w-4 text-amber-600" />
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold uppercase text-amber-700">
                          პირადი ნომერი (ვერ შეიცვლება)
                        </p>
                        <p className="font-mono text-sm font-bold text-fitpass-dark">
                          {form.personal_id || "—"}
                        </p>
                      </div>
                      <IdCard className="h-5 w-5 text-amber-600" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="სახელი (ქართულად)"
                        value={form.first_name_geo}
                        onChange={(v) => update("first_name_geo", v)}
                        placeholder="გიორგი"
                      />
                      <Field
                        label="გვარი (ქართულად)"
                        value={form.last_name_geo}
                        onChange={(v) => update("last_name_geo", v)}
                        placeholder="ბერიძე"
                      />
                      <Field
                        label="სახელი (ლათინურად)"
                        value={form.first_name_lat}
                        onChange={(v) => update("first_name_lat", v)}
                        placeholder="Giorgi"
                      />
                      <Field
                        label="გვარი (ლათინურად)"
                        value={form.last_name_lat}
                        onChange={(v) => update("last_name_lat", v)}
                        placeholder="Beridze"
                      />
                      <Field
                        label="მობილურის ნომერი"
                        value={form.phone}
                        onChange={(v) => update("phone", v)}
                        placeholder="+995 5XX XX XX XX"
                        type="tel"
                      />
                      <Field
                        label="ელ-ფოსტა"
                        value={form.email}
                        onChange={(v) => update("email", v)}
                        placeholder="name@example.com"
                        type="email"
                      />
                      <div className="sm:col-span-2">
                        <Field
                          label="დაბადების თარიღი"
                          value={form.dob}
                          onChange={(v) => update("dob", v)}
                          type="date"
                        />
                      </div>
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
                        {loading ? "მიმდინარეობს..." : "შენახვა"}
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

/* ─── Reusable Field ─── */
function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-fitpass-dark">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-borders bg-background-gray px-4 py-2.5 text-sm text-fitpass-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}