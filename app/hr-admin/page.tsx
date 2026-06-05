// app/hr-admin/page.tsx
"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Download, Bell, ArrowUpDown, CheckCircle2,
  XCircle, LayoutGrid, History,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getMonthStart } from "@/lib/deadline";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Row {
  id: string;
  user_id: string;
  is_family_member: boolean;
  member_name_geo: string | null;
  member_personal_id: string | null;
  status: "active" | "cancelled";
  updated_at: string;
  created_at: string;
  profiles?: { first_name_geo: string; last_name_geo: string; personal_id: string };
}

interface Log {
  id: string;
  action_details: string;
  created_at: string;
  profiles?: { first_name_geo: string; last_name_geo: string };
}

type StatusFilter = "all" | "active" | "cancelled";

export default function HrAdminPage() {
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tab, setTab] = useState<"table" | "audit">("table");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [changesOnly, setChangesOnly] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: p } = await supabase
        .from("profiles").select("first_name_geo, last_name_geo")
        .eq("id", user.id).single();
      if (p) setUserName(`${p.first_name_geo} ${p.last_name_geo}`);
    }

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("*, profiles(first_name_geo, last_name_geo, personal_id)");
    if (subs) setRows(subs as Row[]);

    const { data: logData } = await supabase
      .from("audit_logs")
      .select("*, profiles(first_name_geo, last_name_geo)")
      .order("created_at", { ascending: false });
    if (logData) setLogs(logData as Log[]);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // მეტრიკები
  const metrics = useMemo(() => {
    const active = rows.filter((r) => r.status === "active").length;
    const cancelled = rows.filter((r) => r.status === "cancelled").length;
    return { active, cancelled, total: rows.length };
  }, [rows]);

  // ფილტრაცია
  const filtered = useMemo(() => {
    const monthStart = getMonthStart().getTime();
    let data = [...rows];

    if (statusFilter !== "all") data = data.filter((r) => r.status === statusFilter);

    if (changesOnly) {
      data = data.filter((r) => new Date(r.updated_at).getTime() >= monthStart);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) => {
        const name = r.is_family_member
          ? r.member_name_geo
          : `${r.profiles?.first_name_geo} ${r.profiles?.last_name_geo}`;
        const pid = r.is_family_member ? r.member_personal_id : r.profiles?.personal_id;
        return (name?.toLowerCase().includes(q) || pid?.includes(q)) ?? false;
      });
    }

    data.sort((a, b) => {
      const t = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return sortAsc ? t : -t;
    });
    return data;
  }, [rows, statusFilter, search, changesOnly, sortAsc]);

  // CSV ექსპორტი
  const exportCsv = () => {
    const headers = ["სახელი", "პირადი ნომერი", "ტიპი", "სტატუსი", "განახლების თარიღი"];
    const lines = filtered.map((r) => {
      const name = r.is_family_member
        ? r.member_name_geo
        : `${r.profiles?.first_name_geo} ${r.profiles?.last_name_geo}`;
      const pid = r.is_family_member ? r.member_personal_id : r.profiles?.personal_id;
      const type = r.is_family_member ? "ოჯახის წევრი" : "თანამშრომელი";
      const status = r.status === "active" ? "აქტიური" : "გაუქმებული";
      return [name, pid, type, status, new Date(r.updated_at).toLocaleDateString("ka-GE")].join(",");
    });
    const csv = "\uFEFF" + [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitpass_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const metricCards = [
    { label: "სულ გამოწერა", value: metrics.total, icon: LayoutGrid, color: "text-fitpass-dark" },
    { label: "აქტიური", value: metrics.active, icon: CheckCircle2, color: "text-green-600" },
    { label: "გაუქმებული", value: metrics.cancelled, icon: XCircle, color: "text-gray-500" },
  ];

  return (
    <div className="min-h-screen bg-background-gray">
      <Header userName={userName || "HR"} />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-fitpass-dark">HR პანელი</h1>
          <p className="text-sm text-gray-500">გამოწერების მართვა და ანგარიშგება</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {metricCards.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border-2 border-fitpass-dark/10 bg-white p-6 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">{m.label}</span>
                <m.icon className={cn("h-5 w-5", m.color)} />
              </div>
              <p className="mt-2 text-3xl font-black text-primary">{m.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-borders">
          {[
            { key: "table", label: "ცხრილი", icon: LayoutGrid },
            { key: "audit", label: "ცვლილებების ისტორია", icon: History },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as "table" | "audit")}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition",
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-fitpass-dark"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "table" ? (
          <div className="space-y-5">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ძებნა სახელით ან პირადი ნომრით..."
                  className="w-full rounded-xl border border-borders bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="rounded-xl border border-borders bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="all">ყველა</option>
                <option value="active">აქტიური</option>
                <option value="cancelled">გაუქმებული</option>
              </select>

              {/* Changes Only with pulse */}
              <button
                onClick={() => setChangesOnly(!changesOnly)}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                  changesOnly
                    ? "bg-primary text-white animate-pulse-orange"
                    : "border border-borders bg-white text-fitpass-dark hover:bg-background-gray"
                )}
              >
                <Bell className="h-4 w-4" />
                მხოლოდ ცვლილებები
                {changesOnly && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-fitpass-orange ring-2 ring-white" />
                )}
              </button>

              <Button variant="primary" size="md" onClick={exportCsv}>
                <Download className="h-4 w-4" />
                ექსპორტი
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-borders bg-white shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-background-gray text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">სახელი</th>
                      <th className="px-6 py-4 font-semibold">პირადი ნომერი</th>
                      <th className="px-6 py-4 font-semibold">ტიპი</th>
                      <th className="px-6 py-4 font-semibold">სტატუსი</th>
                      <th className="px-6 py-4 font-semibold">
                        <button
                          onClick={() => setSortAsc(!sortAsc)}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          განახლდა <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borders">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          ჩანაწერები ვერ მოიძებნა
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => (
                        <tr key={r.id} className="transition hover:bg-background-gray">
                          <td className="px-6 py-4 font-medium text-fitpass-dark">
                            {r.is_family_member
                              ? r.member_name_geo
                              : `${r.profiles?.first_name_geo} ${r.profiles?.last_name_geo}`}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {r.is_family_member ? r.member_personal_id : r.profiles?.personal_id}
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-background-gray px-2.5 py-1 text-xs font-medium text-gray-600">
                              {r.is_family_member ? "ოჯახის წევრი" : "თანამშრომელი"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge status={r.status} />
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(r.updated_at).toLocaleDateString("ka-GE")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Audit Log */
          <div className="overflow-hidden rounded-2xl border border-borders bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background-gray text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">ვინ</th>
                    <th className="px-6 py-4 font-semibold">მოქმედება</th>
                    <th className="px-6 py-4 font-semibold">თარიღი / დრო</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borders">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                        ისტორია ცარიელია
                      </td>
                    </tr>
                  ) : (
                    logs.map((l) => (
                      <tr key={l.id} className="transition hover:bg-background-gray">
                        <td className="px-6 py-4 font-medium text-fitpass-dark">
                          {l.profiles
                            ? `${l.profiles.first_name_geo} ${l.profiles.last_name_geo}`
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{l.action_details}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(l.created_at).toLocaleString("ka-GE")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}