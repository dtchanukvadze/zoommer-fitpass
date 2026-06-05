// app/dashboard/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, UserPlus, Users, CreditCard, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isPortalLocked } from "@/lib/deadline";
import Header from "@/components/Header";
import CountdownBanner from "@/components/CountdownBanner";
import MemberFormModal, { MemberData } from "@/components/MemberFormModal";
import SuccessAnimation from "@/components/SuccessAnimation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Subscription {
  id: string;
  is_family_member: boolean;
  member_name_geo: string | null;
  status: "active" | "cancelled";
}

const MAX_FAMILY = 3;

export default function DashboardPage() {
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [personal, setPersonal] = useState<Subscription | null>(null);
  const [family, setFamily] = useState<Subscription[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const locked = isPortalLocked();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name_geo, last_name_geo")
      .eq("id", user.id)
      .single();
    if (profile) setUserName(`${profile.first_name_geo} ${profile.last_name_geo}`);

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("id, is_family_member, member_name_geo, status")
      .eq("user_id", user.id);

    if (subs) {
      setPersonal(subs.find((s) => !s.is_family_member) ?? null);
      setFamily(subs.filter((s) => s.is_family_member));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const triggerSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2200);
  };

  const logAction = async (details: string) => {
    await supabase.from("audit_logs").insert({ user_id: userId, action_details: details });
  };

  // პირადი გამოწერის ჩართვა/გამორთვა
  const togglePersonal = async () => {
    if (locked) return;
    if (!personal) {
      const { data } = await supabase
        .from("subscriptions")
        .insert({ user_id: userId, is_family_member: false, status: "active" })
        .select().single();
      if (data) { setPersonal(data); await logAction("გაააქტიურა პირადი გამოწერა"); triggerSuccess(); }
    } else {
      const newStatus = personal.status === "active" ? "cancelled" : "active";
      const { data } = await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("id", personal.id).select().single();
      if (data) {
        setPersonal(data);
        await logAction(newStatus === "active" ? "გაააქტიურა პირადი გამოწერა" : "გააუქმა პირადი გამოწერა");
        triggerSuccess();
      }
    }
  };

  // ოჯახის წევრის დამატება
  const addMember = async (member: MemberData) => {
    const { data } = await supabase
      .from("subscriptions")
      .insert({ user_id: userId, is_family_member: true, status: "active", ...member })
      .select().single();
    if (data) {
      setFamily((prev) => [...prev, data]);
      await logAction(`დაამატა ოჯახის წევრი: ${member.member_name_geo}`);
      triggerSuccess();
    }
  };

  // ოჯახის წევრის გაუქმება
  const cancelMember = async (id: string, name: string | null) => {
    if (locked) return;
    const { data } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", id).select().single();
    if (data) {
      setFamily((prev) => prev.map((m) => (m.id === id ? data : m)));
      await logAction(`გააუქმა ოჯახის წევრის გამოწერა: ${name ?? ""}`);
      triggerSuccess();
    }
  };

  const activeFamilyCount = family.filter((m) => m.status === "active").length;

  return (
    <div className="min-h-screen bg-background-gray">
      <Header userName={userName || "მომხმარებელი"} />
      <SuccessAnimation show={success} />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <CountdownBanner locked={locked} />

        {loading ? (
          <div className="py-20 text-center text-gray-400">იტვირთება...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* My Subscription */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-borders bg-white p-6 shadow-card"
            >
              <div className="mb-5 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-fitpass-dark">ჩემი გამოწერა</h2>
              </div>
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-background-gray p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <Badge status={personal?.status ?? "cancelled"} />
                <Button
                  variant={personal?.status === "active" ? "danger" : "primary"}
                  className="w-full"
                  disabled={locked}
                  onClick={togglePersonal}
                >
                  {personal?.status === "active" ? "გაუქმება" : "გააქტიურება"}
                </Button>
              </div>
            </motion.section>

            {/* Family / Friends */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-borders bg-white p-6 shadow-card lg:col-span-2"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-fitpass-dark">
                    ოჯახის წევრები / მეგობრები
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {activeFamilyCount}/{MAX_FAMILY}
                  </span>
                </div>
                <Button
                  variant="soft"
                  size="sm"
                  disabled={locked || activeFamilyCount >= MAX_FAMILY}
                  onClick={() => setModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  დამატება
                </Button>
              </div>

              {family.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-borders py-12 text-center">
                  <UserPlus className="h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    ჯერ არ გყავთ დამატებული წევრები
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {family.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between rounded-2xl border border-borders bg-background-gray p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-semibold text-fitpass-dark">
                          {m.member_name_geo}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge status={m.status} />
                        {m.status === "active" && (
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={locked}
                            onClick={() => cancelMember(m.id, m.member_name_geo)}
                          >
                            გაუქმება
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>
        )}
      </main>

      <MemberFormModal open={modalOpen} onOpenChange={setModalOpen} onSubmit={addMember} />
    </div>
  );
}