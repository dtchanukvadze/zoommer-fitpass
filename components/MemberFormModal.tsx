// components/MemberFormModal.tsx
"use client";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { isValidPersonalId } from "@/lib/utils";

export interface MemberData {
  member_name_geo: string;
  member_name_lat: string;
  member_personal_id: string;
  member_phone: string;
  member_dob: string;
  member_email: string;
}

const fields = [
  { key: "member_name_geo", label: "სახელი და გვარი (ქართულად)", type: "text", placeholder: "გიორგი ბერიძე" },
  { key: "member_name_lat", label: "სახელი და გვარი (ლათინურად)", type: "text", placeholder: "Giorgi Beridze" },
  { key: "member_personal_id", label: "პირადი ნომერი", type: "text", placeholder: "01001001001" },
  { key: "member_phone", label: "მობილურის ნომერი", type: "tel", placeholder: "+995 5XX XX XX XX" },
  { key: "member_dob", label: "დაბადების თარიღი", type: "date", placeholder: "" },
  { key: "member_email", label: "ელ-ფოსტა", type: "email", placeholder: "name@example.com" },
] as const;

const emptyForm: MemberData = {
  member_name_geo: "",
  member_name_lat: "",
  member_personal_id: "",
  member_phone: "",
  member_dob: "",
  member_email: "",
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: MemberData) => Promise<void>;
  mode?: "add" | "edit";
  initialData?: Partial<MemberData> | null;
}

export default function MemberFormModal({
  open,
  onOpenChange,
  onSubmit,
  mode = "add",
  initialData,
}: Props) {
  const [form, setForm] = useState<MemberData>(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = mode === "edit";

  // ✅ Edit mode-ში მონაცემების ჩატვირთვა
  useEffect(() => {
    if (open && initialData) {
      setForm({
        member_name_geo: initialData.member_name_geo ?? "",
        member_name_lat: initialData.member_name_lat ?? "",
        member_personal_id: initialData.member_personal_id ?? "",
        member_phone: initialData.member_phone ?? "",
        member_dob: initialData.member_dob ?? "",
        member_email: initialData.member_email ?? "",
      });
    } else if (open && !initialData) {
      setForm(emptyForm);
    }
    setError("");
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.member_name_geo || !form.member_email) {
      setError("გთხოვთ შეავსოთ ყველა სავალდებულო ველი.");
      return;
    }
    if (!isValidPersonalId(form.member_personal_id)) {
      setError("პირადი ნომერი უნდა შედგებოდეს 11 ციფრისგან.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(form);
      onOpenChange(false);
    } catch {
      setError("დაფიქსირდა შეცდომა. სცადეთ თავიდან.");
    } finally {
      setLoading(false);
    }
  };

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
                      {isEdit ? "წევრის რედაქტირება" : "ახალი წევრის დამატება"}
                    </Dialog.Title>
                    <Dialog.Close
                      className="rounded-full p-1.5 text-gray-400 transition hover:bg-background-gray hover:text-fitpass-dark"
                      aria-label="დახურვა"
                    >
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {fields.map((f) => (
                        <div
                          key={f.key}
                          className={f.key.includes("name") ? "sm:col-span-2" : ""}
                        >
                          <label
                            htmlFor={f.key}
                            className="mb-1.5 block text-xs font-semibold text-fitpass-dark"
                          >
                            {f.label}
                          </label>
                          <input
                            id={f.key}
                            type={f.type}
                            placeholder={f.placeholder}
                            value={form[f.key]}
                            onChange={(e) =>
                              setForm({ ...form, [f.key]: e.target.value })
                            }
                            className="w-full rounded-xl border border-borders bg-background-gray px-4 py-2.5 text-sm text-fitpass-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      ))}
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
                        {loading
                          ? "მიმდინარეობს..."
                          : isEdit
                          ? "შენახვა"
                          : "დამატება"}
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