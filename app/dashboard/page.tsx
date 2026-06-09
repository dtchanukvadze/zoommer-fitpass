// app/dashboard/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  UserPlus,
  Users,
  CreditCard,
  ShieldCheck,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isPortalLocked } from "@/lib/deadline";
import Header from "@/components/Header";
import CountdownBanner from "@/components/CountdownBanner";
import MemberFormModal, { MemberData } from "@/components/MemberFormModal";
import EditProfileModal, { ProfileData } from "@/components/EditProfileModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessAnimation from "@/components/SuccessAnimation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Subscription {
  id: string;
  user_id: string;
  is_family_member: boolean;
  member_name_geo: string | null;
  member_personal_id?: string | null;
  status: "active" | "cancelled";
  member_email?: string | null;
}

const MAX_FAMILY = 3;

export default function DashboardPage() {
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState<"hr" | "user">("user"); // დამატებული როლის state
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [personal, setPersonal] = useState<Subscription | null>(null);
  const [family, setFamily] = useState<Subscription[]>([]);

  // Modal states
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Subscription | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const locked = isPortalLocked();

  const fetchData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // დამატებულია "role" select-ში
    const { data: prof } = await supabase
      .from("profiles")
      .select(
        "first_name_geo, last_name_geo, first_name_lat, last_name_lat, phone, email, dob, personal_id, role"
      )
      .eq("id", user.id)
      .single();
      
    if (prof) {
      setProfile(prof as ProfileData);
      setUserName(`${prof.first_name_geo} ${prof.last_name_geo}`);
      if (prof.role === "hr") {
        setUserRole("hr");
      }
    }

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id);

    if (subs) {
      setPersonal(subs.find((s) => !s.is_family_member) ?? null);
      setFamily(subs.filter((s) => s.is_family_member));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2200);
  };

  const logAction = async (details: string) => {
    await supabase
      .from("audit_logs")
      .insert({ user_id: userId, action_details: details });
  };

  /* ─── Personal subscription toggle ─── */
  const togglePersonal = async () => {
    if (locked) return;
    if (!personal) {
      const { data } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          is_family_member: false,
          status: "active",
        })
        .select()
        .single();
      if (data) {
        setPersonal(data);
        await logAction("გაააქტიურა პირადი გამოწერა");
        triggerSuccess();
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
        setPersonal(data);
        await logAction(
          newStatus === "active"
            ? "გაააქტიურა პირადი გამოწერა"
            : "გააუქმა პირადი გამოწერა"
        );
        triggerSuccess();
      }
    }
  };

  /* ─── Add / Edit Member ─── */
  const handleMemberSubmit = async (data: MemberData) => {
    if (editingMember) {
      const { data: updated } = await supabase
        .from("subscriptions")
        .update(data)
        .eq("id", editingMember.id)
        .select()
        .single();
      if (updated) {
        setFamily((prev) =>
          prev.map((m) => (m.id === editingMember.id ? updated : m))
        );
        await logAction(`განაახლა წევრის ინფორმაცია: ${data.member_name_geo}`);
        triggerSuccess();
      }
    } else {
      if (family.length >= MAX_FAMILY) return;
      const { data: created } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          is_family_member: true,
          status: "active",
          ...data,
        })
        .select()
        .single();
      if (created) {
        setFamily((prev) => [...prev, created]);
        await logAction(`დაამატა ოჯახის წევრი: ${data.member_name_geo}`);
        triggerSuccess();
      }
    }
    setEditingMember(null);
  };

  /* ─── Cancel Member (status → cancelled) ─── */
  const cancelMember = async (id: string, name: string | null) => {
    if (locked) return;
    const { data } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();
    if (data) {
      setFamily((prev) => prev.map((m) => (m.id === id ? data : m)));
      await logAction(`გააუქმა ოჯახის წევრის გამოწერა: ${name ?? ""}`);
      triggerSuccess();
    }
  };

  /* ─── Delete Member (სრულად ბაზიდან) ─── */
  const deleteMember = async () => {
    if (!deleteTarget || locked) return;
    setDeleteLoading(true);

    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      const name = deleteTarget.member_name_geo ?? "";
      setFamily((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      await logAction(`წაშალა ოჯახის წევრი: ${name}`);
      triggerSuccess();
      setDeleteTarget(null);
    }
    setDeleteLoading(false);
  };

  /* ─── Update Profile ─── */
  const updateProfile = async (data: Omit<ProfileData, "personal_id">) => {
    const { data: updated } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId)
      .select()
      .single();
    if (updated) {
      setProfile(updated);
      setUserName(`${updated.first_name_geo} ${updated.last_name_geo}`);
      await logAction("განაახლა პირადი ინფორმაცია");
      triggerSuccess();
    }
  };

  const openEditMember = (member: Subscription) => {
    setEditingMember(member);
    setMemberModalOpen(true);
  };

  const openAddMember = () => {
    setEditingMember(null);
    setMemberModalOpen(true);
  };

  const activeFamilyCount = family.filter((m) => m.status === "active").length;

  return (
    <div className="min-h-screen bg-background-gray">
      <Header
        userName={userName || "მომხმარებელი"}
        userRole={userRole} // გადავცემთ როლს Header-ს
        onEditProfile={() => setProfileModalOpen(true)}
        onChangePassword={() => setPasswordModalOpen(true)}
      />
      <SuccessAnimation show={success} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        
        {/* გამოჩნდება მწვანედ მხოლოდ მაშინ, თუ role არის hr */}
        {userRole === "hr" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center"
          >
            <Link 
              href="/hr-admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3.5 py-1.5 text-sm font-bold text-green-700 shadow-sm border border-green-200 hover:bg-green-200 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              HR გვერდზე გადასვლა ➤
            </Link>
          </motion.div>
        )}

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
                <h2 className="text-lg font-bold text-fitpass-dark">
                  ჩემი გამოწერა
                </h2>
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
                  onClick={openAddMember}
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
                      className="flex flex-col gap-3 rounded-2xl border border-borders bg-background-gray p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-semibold text-fitpass-dark">
                            {m.member_name_geo}
                          </span>
                          {m.member_personal_id && (
                            <span className="truncate text-xs text-gray-400">
                              {m.member_personal_id}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                        <Badge status={m.status} />

                        {m.status === "active" && (
                          <>
                            {/* Edit */}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={locked}
                              onClick={() => openEditMember(m)}
                              title="რედაქტირება"
                              className="!px-2.5"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            {/* Cancel */}
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={locked}
                              onClick={() =>
                                cancelMember(m.id, m.member_name_geo)
                              }
                            >
                              გაუქმება
                            </Button>
                          </>
                        )}

                        {/* Delete */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={locked}
                          onClick={() => setDeleteTarget(m)}
                          title="წაშლა"
                          className="!px-2.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>
        )}
      </main>

      {/* ─── Modals ─── */}
      <MemberFormModal
        open={memberModalOpen}
        onOpenChange={(v: boolean) => {
          setMemberModalOpen(v);
          if (!v) setEditingMember(null);
        }}
        onSubmit={handleMemberSubmit}
        mode={editingMember ? "edit" : "add"}
        initialData={editingMember ? (editingMember as any) : undefined}
      />

      <EditProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        onSubmit={updateProfile}
        initialData={profile}
      />

      <ChangePasswordModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
        onSuccess={triggerSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v: boolean) => !v && setDeleteTarget(null)}
        onConfirm={deleteMember}
        title="წევრის წაშლა"
        description={
          deleteTarget
            ? `დარწმუნებული ხართ, რომ გსურთ "${deleteTarget.member_name_geo}"-ის სრულად წაშლა? ეს მოქმედება შეუქცევადია.`
            : ""
        }
        confirmText="წაშლა"
        cancelText="გაუქმება"
        loading={deleteLoading}
      />
    </div>
  );
}