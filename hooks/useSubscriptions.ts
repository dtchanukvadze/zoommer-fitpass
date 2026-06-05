// hooks/useSubscriptions.ts — გამოწერების მართვის hook (CRUD + audit logging)
"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logAction } from "@/lib/audit";
import type { Subscription, MemberInput } from "@/types/database.types";

export function useSubscriptions(userId: string | null) {
  const supabase = createClient();
  const [personal, setPersonal] = useState<Subscription | null>(null);
  const [family, setFamily] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // მონაცემების წამოღება
  const refetch = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (data) {
      const subs = data as Subscription[];
      setPersonal(subs.find((s) => !s.is_family_member) ?? null);
      setFamily(subs.filter((s) => s.is_family_member));
    }
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // პირადი გამოწერის toggle
  const togglePersonal = useCallback(async () => {
    if (!userId) return false;

    if (!personal) {
      const { data } = await supabase
        .from("subscriptions")
        .insert({ user_id: userId, is_family_member: false, status: "active" })
        .select()
        .single();
      if (data) {
        setPersonal(data as Subscription);
        await logAction(userId, "გაააქტიურა პირადი გამოწერა");
        return true;
      }
    } else {
      const newStatus = personal.status === "active" ? "cancelled" : "active";
      const { data } = await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("id", personal.id)
        .select()
        .single();
      if (data) {
        setPersonal(data as Subscription);
        await logAction(
          userId,
          newStatus === "active"
            ? "გაააქტიურა პირადი გამოწერა"
            : "გააუქმა პირადი გამოწერა"
        );
        return true;
      }
    }
    return false;
  }, [userId, personal, supabase]);

  // ოჯახის წევრის დამატება
  const addMember = useCallback(
    async (member: MemberInput) => {
      if (!userId) return false;
      const { data } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          is_family_member: true,
          status: "active",
          ...member,
        })
        .select()
        .single();
      if (data) {
        setFamily((prev) => [...prev, data as Subscription]);
        await logAction(
          userId,
          `დაამატა ოჯახის წევრი: ${member.member_name_geo}`
        );
        return true;
      }
      return false;
    },
    [userId, supabase]
  );

  // ოჯახის წევრის გაუქმება
  const cancelMember = useCallback(
    async (id: string, name: string | null) => {
      if (!userId) return false;
      const { data } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("id", id)
        .select()
        .single();
      if (data) {
        setFamily((prev) =>
          prev.map((m) => (m.id === id ? (data as Subscription) : m))
        );
        await logAction(
          userId,
          `გააუქმა ოჯახის წევრის გამოწერა: ${name ?? ""}`
        );
        return true;
      }
      return false;
    },
    [userId, supabase]
  );

  const activeFamilyCount = family.filter((m) => m.status === "active").length;

  return {
    personal,
    family,
    loading,
    activeFamilyCount,
    togglePersonal,
    addMember,
    cancelMember,
    refetch,
  };
}