"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Lead {
  id: string;
  email: string;
  quiz_q1: string | null;
  quiz_q2: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  session_id: string;
  created_at: string;
}

interface Stats {
  total: number;
  today: number;
}

// Q1 and Q2 answer options for analytics
const Q1_OPTIONS = ["Yes, definitely", "Maybe once or twice", "Not sure"];
const Q2_OPTIONS = [
  "Career / business growth",
  "Creativity / new ideas",
  "Love / relationships",
  "Clarity / finding direction",
  "Adventure / feeling alive",
];

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  // Fetch leads function (reusable for refresh)
  const fetchLeads = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch("/api/admin/leads");
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch leads");

      const data = await res.json();
      setLeads(data.leads || []);
      setStats(data.stats || { total: 0, today: 0 });
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Fetch on mount
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeads(false); // Don't show loading spinner on auto-refresh
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  // Analytics calculations
  const analytics = useMemo(() => {
    // Q1 distribution
    const q1Counts = Q1_OPTIONS.map((opt) => ({
      label: opt,
      count: leads.filter((l) => l.quiz_q1 === opt).length,
    }));
    const q1Total = leads.filter((l) => l.quiz_q1).length;

    // Q2 distribution (multi-select)
    const q2Counts = Q2_OPTIONS.map((opt) => {
      const count = leads.filter((lead) => {
        if (!lead.quiz_q2) return false;
        try {
          const arr = JSON.parse(lead.quiz_q2);
          return Array.isArray(arr) && arr.includes(opt);
        } catch {
          return false;
        }
      }).length;
      return { label: opt, count };
    });
    const q2Respondents = leads.filter((l) => l.quiz_q2).length;

    return { q1Counts, q1Total, q2Counts, q2Respondents };
  }, [leads]);

  // Filter leads by search query
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const query = searchQuery.toLowerCase();
    return leads.filter((lead) =>
      lead.email.toLowerCase().includes(query)
    );
  }, [leads, searchQuery]);

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Email",
      "Quiz Q1",
      "Quiz Q2",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Session ID",
      "Created At",
    ];

    const rows = filteredLeads.map((lead) => [
      lead.email,
      lead.quiz_q1 || "",
      formatQ2(lead.quiz_q2),
      lead.utm_source || "",
      lead.utm_medium || "",
      lead.utm_campaign || "",
      lead.session_id,
      formatDate(lead.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format Q2 array
  const formatQ2 = (q2: string | null): string => {
    if (!q2) return "-";
    try {
      const arr = JSON.parse(q2);
      if (Array.isArray(arr)) return arr.join(", ");
      return q2;
    } catch {
      return q2;
    }
  };

  // Format time ago for last updated
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return "1 min ago";
    if (minutes < 60) return `${minutes} mins ago`;
    return formatDate(date.toISOString());
  };

  if (isLoading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="stars-layer" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--gold-main)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-muted)]">Loading celestial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cosmic-bg min-h-screen">
      <div className="stars-layer" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold-bright)]/20 to-[var(--gold-dark)]/20 border border-[var(--gold-main)]/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--gold-main)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                </svg>
              </div>
              <span className="font-semibold text-white">Power Map Admin</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-[var(--text-faint)] hidden sm:block">
                  Updated {formatTimeAgo(lastUpdated)}
                </span>
              )}
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Leads"
            value={stats.total}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            accent
          />
          <StatCard
            label="Today's Leads"
            value={stats.today}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Conversion Sources"
            value={new Set(leads.filter(l => l.utm_source).map(l => l.utm_source)).size}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          />
          <StatCard
            label="This Week"
            value={leads.filter(l => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(l.created_at) >= weekAgo;
            }).length}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* Analytics Section */}
        {leads.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart
              title="Q1: Have you visited a place that felt right?"
              data={analytics.q1Counts}
              total={analytics.q1Total}
              note={`${analytics.q1Total} responses`}
            />
            <BarChart
              title="Q2: What do you want 2026 to be about?"
              data={analytics.q2Counts}
              total={analytics.q2Respondents}
              note={`${analytics.q2Respondents} respondents (multi-select)`}
            />
          </div>
        )}

        {/* Search and table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Lead Database</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"} found
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-glass pl-10 pr-4 py-2.5 rounded-xl text-sm w-full sm:w-72"
                />
              </div>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="p-6 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!error && filteredLeads.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/5">
                <svg className="w-8 h-8 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-[var(--text-muted)]">
                {searchQuery ? "No leads match your search" : "No leads captured yet"}
              </p>
            </div>
          )}

          {/* Table */}
          {!error && filteredLeads.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">
                      Q1 Answer
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">
                      Q2 Answer
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">
                      Source
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead, idx) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-white/5 transition-colors"
                      style={{ animationDelay: `${idx * 20}ms` }}
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold-main)]/20 to-[var(--gold-dark)]/20 border border-[var(--gold-main)]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-[var(--gold-main)]">
                              {lead.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-white truncate max-w-[200px]">
                            {lead.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        {lead.quiz_q1 ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-[var(--text-soft)] border border-white/10">
                            {lead.quiz_q1}
                          </span>
                        ) : (
                          <span className="text-[var(--text-faint)]">-</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                          {(() => {
                            if (!lead.quiz_q2) return <span className="text-[var(--text-faint)]">-</span>;
                            try {
                              const arr = JSON.parse(lead.quiz_q2);
                              if (!Array.isArray(arr) || arr.length === 0) {
                                return <span className="text-[var(--text-faint)]">-</span>;
                              }
                              return arr.map((answer: string, i: number) => (
                                <span
                                  key={i}
                                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--gold-main)]/10 text-[var(--gold-bright)] border border-[var(--gold-main)]/20"
                                >
                                  {answer.split(" / ")[0]}
                                </span>
                              ));
                            } catch {
                              return <span className="text-[var(--text-faint)]">-</span>;
                            }
                          })()}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        {lead.utm_source ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--gold-main)]/10 text-[var(--gold-bright)] border border-[var(--gold-main)]/20">
                            {lead.utm_source}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--text-faint)]">Direct</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
                          {formatDate(lead.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Stat card component
function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass-card rounded-xl p-5 ${
        accent ? "border-[var(--gold-main)]/30" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-1">{label}</p>
          <p
            className={`text-3xl font-bold ${
              accent ? "text-[var(--gold-bright)]" : "text-white"
            }`}
          >
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className={`p-2.5 rounded-lg ${
            accent
              ? "bg-[var(--gold-main)]/10 text-[var(--gold-main)]"
              : "bg-white/5 text-[var(--text-muted)]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Bar chart component for analytics
function BarChart({
  title,
  data,
  total,
  note,
}: {
  title: string;
  data: { label: string; count: number }[];
  total: number;
  note?: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      {note && (
        <p className="text-xs text-[var(--text-faint)] mb-5">{note}</p>
      )}

      <div className="space-y-4">
        {data.map((item, idx) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

          return (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-sm text-[var(--text-soft)] truncate pr-2">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-[var(--gold-bright)] whitespace-nowrap">
                  {item.count}
                  <span className="text-[var(--text-muted)] ml-1">
                    ({percentage.toFixed(0)}%)
                  </span>
                </span>
              </div>
              {/* Bar container */}
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                {/* Animated bar fill */}
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    background:
                      "linear-gradient(90deg, var(--gold-dark), var(--gold-main), var(--gold-bright))",
                    boxShadow: "0 0 8px rgba(201, 162, 39, 0.4)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
