"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  ChevronDown,
  TrendingUp,
  Star,
  Zap,
  Moon,
  User,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface AgeGroup {
  group: string;
  count: number;
  percentage: number;
}

interface SunSign {
  sign: string;
  count: number;
  percentage: number;
}

interface BehaviorTier {
  tier: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface DemographicsData {
  totalUsers: number;
  ageDistribution: AgeGroup[];
  sunSignDistribution: SunSign[];
  behaviorTiers: BehaviorTier[];
  tierFeaturePreferences: Record<string, Array<{ category: string; count: number }>>;
  generatedAt: string;
}

interface UserData {
  user_id: string;
  email: string;
  display_name: string | null;
  payment_type: string;
  subscription_status: string | null;
  ltv: number;
  session_count: number;
  chat_count: number;
  last_active: string | null;
  topics: string[];
  engagement: string;
  created_at: string;
}

interface UsersListData {
  users: UserData[];
  total: number;
}

interface UsersTabProps {
  onSelectUser: (userId: string) => void;
}

// Sun sign emojis
const SIGN_EMOJIS: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

// ============================================
// Main Component
// ============================================

export function UsersTab({ onSelectUser }: UsersTabProps) {
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [usersData, setUsersData] = useState<UsersListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [engagementFilter, setEngagementFilter] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both demographics and users list in parallel
      const [demoRes, usersRes] = await Promise.all([
        fetch("/api/tracking/demographics"),
        fetch(`/api/tracking/users?limit=100${engagementFilter ? `&engagement=${engagementFilter}` : ""}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`),
      ]);

      if (demoRes.ok) {
        const demoData = await demoRes.json();
        setDemographics(demoData);
      }

      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsersData(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [engagementFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery !== "") {
        fetchData();
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  if (isLoading && !demographics) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
        <p className="text-white/40 text-sm">Loading user analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="w-12 h-12 text-red-400/50 mb-4" />
        <p className="text-red-400 mb-2">{error}</p>
        <button
          onClick={fetchData}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">Users & Demographics</h2>
            <p className="text-xs text-white/40">
              {demographics?.totalUsers || 0} total users
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-white/60 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Behavior Tiers */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Behavior Tiers
          </h3>
          <div className="space-y-3">
            {demographics?.behaviorTiers.map((tier) => (
              <div key={tier.tier} className="group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">{tier.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{tier.count}</span>
                    <span className="text-xs text-white/40">({tier.percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${tier.percentage}%`, backgroundColor: tier.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Age Distribution
          </h3>
          <div className="space-y-2">
            {demographics?.ageDistribution.map((age) => (
              <div key={age.group} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{age.group}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${age.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40 w-8 text-right">{age.percentage}%</span>
                </div>
              </div>
            ))}
            {(!demographics?.ageDistribution || demographics.ageDistribution.length === 0) && (
              <p className="text-white/30 text-sm">No age data available</p>
            )}
          </div>
        </div>

        {/* Sun Sign Distribution */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Sun Signs
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {demographics?.sunSignDistribution.slice(0, 8).map((sign) => (
              <div
                key={sign.sign}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
              >
                <span className="text-lg">{SIGN_EMOJIS[sign.sign] || "✨"}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/70 truncate">{sign.sign}</div>
                  <div className="text-xs text-white/40">{sign.count} ({sign.percentage}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Directory */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-white">User Directory</h3>
            <p className="text-sm text-white/40">{usersData?.total || 0} users found</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 w-48 sm:w-64"
              />
            </div>

            {/* Engagement Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <span className="text-white/60">
                  {engagementFilter ? engagementFilter.charAt(0).toUpperCase() + engagementFilter.slice(1) : "All"}
                </span>
                <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-36 py-1 rounded-xl bg-[#0c0c12] border border-white/10 shadow-2xl z-50">
                  <button
                    onClick={() => { setEngagementFilter(null); setShowFilterDropdown(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${!engagementFilter ? "text-emerald-400" : "text-white/70"}`}
                  >
                    All
                  </button>
                  {["high", "medium", "low", "dormant"].map((level) => (
                    <button
                      key={level}
                      onClick={() => { setEngagementFilter(level); setShowFilterDropdown(false); }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors capitalize ${engagementFilter === level ? "text-emerald-400" : "text-white/70"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-6 text-xs font-medium text-white/40 uppercase tracking-wider">User</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Sessions</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Chats</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Engagement</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.users.map((user, i) => (
                <tr
                  key={user.user_id}
                  onClick={() => onSelectUser(user.user_id)}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <td className="py-3 px-6">
                    <div>
                      <div className="text-sm font-medium text-white">{user.display_name || "—"}</div>
                      <div className="text-xs text-white/40">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={user.payment_type} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-mono text-white">{user.session_count}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-mono text-white">{user.chat_count}</span>
                  </td>
                  <td className="py-3 px-4">
                    <EngagementBadge level={user.engagement} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-white/40">
                      {user.last_active ? formatTimeAgo(new Date(user.last_active)) : "Never"}
                    </span>
                  </td>
                </tr>
              ))}
              {(!usersData?.users || usersData.users.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/40 text-sm">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    subscription: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    one_time: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    grandfathered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    none: "bg-white/10 text-white/40 border-white/10",
  };

  const labels: Record<string, string> = {
    subscription: "Subscriber",
    one_time: "One-Time",
    grandfathered: "Free",
    none: "Lead",
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status] || styles.none}`}>
      {labels[status] || status}
    </span>
  );
}

function EngagementBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    high: "text-emerald-400",
    medium: "text-blue-400",
    low: "text-amber-400",
    dormant: "text-white/30",
  };

  const labels: Record<string, string> = {
    high: "Power User",
    medium: "Regular",
    low: "Light",
    dormant: "Dormant",
  };

  return <span className={`text-xs font-medium ${styles[level] || styles.dormant}`}>{labels[level] || level}</span>;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "just now";
}
