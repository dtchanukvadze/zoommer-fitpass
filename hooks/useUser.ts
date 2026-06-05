// hooks/useUser.ts — მიმდინარე მომხმარებლისა და პროფილის მიღების hook
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database.types";

interface UseUserResult {
  userId: string | null;
  profile: Profile | null;
  fullName: string;
  isHr: boolean;
  loading: boolean;
}

export function useUser(): UseUserResult {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data as Profile);
      setLoading(false);
    };

    load();
  }, []);

  return {
    userId,
    profile,
    fullName: profile
      ? `${profile.first_name_geo} ${profile.last_name_geo}`
      : "",
    isHr: profile?.role === "hr",
    loading,
  };
}