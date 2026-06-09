// components/Header.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, Lock, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userName: string;
  userRole?: "hr" | "user";
  onEditProfile?: () => void;
  onChangePassword?: () => void;
}

export default function Header({
  userName,
  userRole = "user",
  onEditProfile,
  onChangePassword,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-borders bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-md">
            <span className="text-lg font-black text-white">Z</span>
          </div>
          <div className="h-6 w-px bg-borders" />
          <span className="text-lg font-black tracking-tight text-fitpass-dark">
            FITPASS
          </span>
        </div>

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-borders bg-white px-3 py-1.5 transition hover:border-primary hover:shadow-sm"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden text-sm font-semibold text-fitpass-dark sm:inline">
              {userName}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-borders bg-white shadow-card-hover"
              >
                <div className="border-b border-borders bg-background-gray px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase text-gray-400">
                    ანგარიში
                  </p>
                  <div className="flex flex-col gap-2 mt-2">
                    <p className="text-sm font-semibold text-fitpass-dark">
                      {userName}
                    </p>
                  </div>
                </div>

                <MenuItem
                  icon={<Settings className="h-4 w-4" />}
                  label="რედაქტირება"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditProfile?.();
                  }}
                />
                <MenuItem
                  icon={<Lock className="h-4 w-4" />}
                  label="პაროლის შეცვლა"
                  onClick={() => {
                    setMenuOpen(false);
                    onChangePassword?.();
                  }}
                />
                <div className="border-t border-borders" />
                <MenuItem
                  icon={<LogOut className="h-4 w-4" />}
                  label="გასვლა"
                  onClick={logout}
                  danger
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition hover:bg-background-gray ${
        danger ? "text-red-600 hover:bg-red-50" : "text-fitpass-dark"
      }`}
    >
      <span className={danger ? "text-red-500" : "text-primary"}>{icon}</span>
      {label}
    </button>
  );
}