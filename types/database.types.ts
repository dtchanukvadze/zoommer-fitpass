// types/database.types.ts — Supabase მონაცემთა ბაზის TypeScript ტიპები

export type UserRole = "user" | "hr";
export type SubscriptionStatus = "active" | "cancelled";

// profiles ცხრილი
export interface Profile {
  id: string;
  role: UserRole;
  first_name_geo: string;
  last_name_geo: string;
  first_name_lat: string;
  last_name_lat: string;
  personal_id: string;
  phone: string;
  dob: string;
  email: string;
  created_at: string;
}

// subscriptions ცხრილი
export interface Subscription {
  id: string;
  user_id: string;
  is_family_member: boolean;
  member_name_geo: string | null;
  member_name_lat: string | null;
  member_personal_id: string | null;
  member_phone: string | null;
  member_dob: string | null;
  member_email: string | null;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  // HR join-ისთვის
  profiles?: Pick<
    Profile,
    "first_name_geo" | "last_name_geo" | "personal_id"
  >;
}

// audit_logs ცხრილი
export interface AuditLog {
  id: string;
  user_id: string | null;
  action_details: string;
  created_at: string;
  profiles?: Pick<Profile, "first_name_geo" | "last_name_geo">;
}

// ფორმის ინპუტი ახალი წევრისთვის
export interface MemberInput {
  member_name_geo: string;
  member_name_lat: string;
  member_personal_id: string;
  member_phone: string;
  member_dob: string;
  member_email: string;
}