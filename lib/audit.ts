// lib/audit.ts — audit_logs ცხრილში მოქმედებების ჩაწერის ჰელპერი
import { createClient } from "@/lib/supabase/client";

/**
 * ქმნის ჩანაწერს audit_logs ცხრილში
 * @param userId - მოქმედი მომხმარებლის ID
 * @param details - ქართულად აღწერილი მოქმედება
 */
export async function logAction(
  userId: string,
  details: string
): Promise<void> {
  const supabase = createClient();
  await supabase.from("audit_logs").insert({
    user_id: userId,
    action_details: details,
  });
}