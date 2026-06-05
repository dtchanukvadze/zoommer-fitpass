// components/Header.tsx
"use client";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";

// Co-branded Logo
function CoBrandedLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Zoommer Logo */}
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
        <span className="text-lg font-black text-white">Z</span>
      </div>
      {/* Divider */}
      <span className="text-borders text-xl font-light select-none">×</span>
      {/* Fitpass Logo */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-end gap-0.5">
          <span className="h-3 w-1 rounded-full bg-fitpass-orange" />
          <span className="h-5 w-1 rounded-full bg-primary" />
          <span className="h-4 w-1 rounded-full bg-secondary" />
        </div>
        <span className="text-base font-extrabold tracking-tight text-fitpass-dark">
          FITPASS
        </span>
      </div>
    </div>
  );
}

export default function Header({ userName }: { userName: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-borders bg-white/80 shadow-header backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <CoBrandedLogo />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background-gray">
              <User className="h-4 w-4 text-fitpass-dark" />
            </div>
            <span className="hidden text-sm font-semibold text-fitpass-dark sm:inline">
              {userName}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            გასვლა
          </Button>
        </div>
      </div>
    </header>
  );
}