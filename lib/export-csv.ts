// lib/export-csv.ts — გამოწერების CSV-ად ექსპორტის ჰელპერი (ქართული UTF-8)
import type { Subscription } from "@/types/database.types";

export function exportSubscriptionsToCsv(rows: Subscription[]): void {
  const headers = [
    "სახელი",
    "პირადი ნომერი",
    "ტიპი",
    "სტატუსი",
    "განახლების თარიღი",
  ];

  const lines = rows.map((r) => {
    const name = r.is_family_member
      ? r.member_name_geo ?? ""
      : `${r.profiles?.first_name_geo ?? ""} ${r.profiles?.last_name_geo ?? ""}`;
    const pid = r.is_family_member
      ? r.member_personal_id ?? ""
      : r.profiles?.personal_id ?? "";
    const type = r.is_family_member ? "ოჯახის წევრი" : "თანამშრომელი";
    const status = r.status === "active" ? "აქტიური" : "გაუქმებული";
    const date = new Date(r.updated_at).toLocaleDateString("ka-GE");
    // ველების ციტირება მძიმის უსაფრთხოებისთვის
    return [name, pid, type, status, date]
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(",");
  });

  // \uFEFF = BOM — ქართულის სწორად ჩვენებისთვის Excel-ში
  const csv = "\uFEFF" + [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `fitpass_report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}