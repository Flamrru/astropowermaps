"use client";

import { useState, useEffect } from "react";
import {
  X,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  MessageCircle,
  Activity,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  DollarSign,
  Star,
  User,
} from "lucide-react";

interface UserDetail {
  user: {
    user_id: string;
    email: string;
    display_name: string | null;
    payment_type: string;
    subscription_status: string | null;
    created_at: string;
    birth_data: {
      date: string;
      time: string | null;
      location: string | null;
    } | null;
    topics: string[];
    chat_count: number;
    engagement: string;
  };
  stripe: {
    ltv: number;
    paymentCount: number;
    lastPayment: {
      amount: number;
      date: string;
    } | null;
    subscription: {
      status: string;
      currentPeriodEnd: string;
      cancelAtPeriodEnd: boolean;
    } | null;
  } | null;
  activity: Array<{
    date: string;
    event: string;
    category: string;
    details: string;
  }>;
  conversations: Array<{
    date: string;
    topics: string[];
    messages: Array<{
      role: string;
      content: string;
      created_at: string;
    }>;
    preview: string;
  }>;
}

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
}

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<"overview" | "activity" | "conversations">("overview");

  // Fetch user details
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const res = await fetch(`/api/tracking/users?user_id=${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user details");
        }
        const userData = await res.json();
        setData(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId]);

  // Toggle conversation expansion
  const toggleConversation = (date: string) => {
    setExpandedConversations((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get status badge style
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      subscription: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      one_time: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      grandfathered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      none: "bg-white/10 text-white/40 border-white/10",
    };
    return styles[status] || styles.none;
  };

  // Get engagement style
  const getEngagementStyle = (level: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      high: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Power User" },
      medium: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Regular" },
      low: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Light" },
      dormant: { bg: "bg-white/10", text: "text-white/40", label: "Dormant" },
    };
    return styles[level] || styles.dormant;
  };

  // Topic colors
  const topicColors: Record<string, string> = {
    love: "bg-pink-500/20 text-pink-400",
    career: "bg-amber-500/20 text-amber-400",
    saturn_return: "bg-purple-500/20 text-purple-400",
    jupiter: "bg-orange-500/20 text-orange-400",
    timing: "bg-cyan-500/20 text-cyan-400",
    home: "bg-green-500/20 text-green-400",
    growth: "bg-indigo-500/20 text-indigo-400",
    health: "bg-red-500/20 text-red-400",
    general: "bg-white/10 text-white/50",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0a0a10] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-white/10 bg-[#0a0a10]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                ) : (
                  <>
                    <h2 className="font-semibold text-lg">
                      {data?.user.display_name || "Unknown User"}
                    </h2>
                    <p className="text-sm text-white/40">{data?.user.email}</p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Section tabs */}
          {!isLoading && !error && (
            <div className="flex gap-1 mt-4">
              {(["overview", "activity", "conversations"] as const).map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeSection === section
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="mt-3 text-white/40 text-sm">Loading user details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          ) : data ? (
            <>
              {/* Overview Section */}
              {activeSection === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                      icon={<DollarSign className="w-4 h-4" />}
                      label="Lifetime Value"
                      value={`$${data.stripe?.ltv?.toFixed(2) || "0.00"}`}
                      color="emerald"
                    />
                    <StatCard
                      icon={<CreditCard className="w-4 h-4" />}
                      label="Payments"
                      value={data.stripe?.paymentCount || 0}
                      color="teal"
                    />
                    <StatCard
                      icon={<MessageCircle className="w-4 h-4" />}
                      label="Chat Messages"
                      value={data.user.chat_count}
                      color="cyan"
                    />
                    <StatCard
                      icon={<Activity className="w-4 h-4" />}
                      label="Activity Events"
                      value={data.activity.length}
                      color="blue"
                    />
                  </div>

                  {/* User Info */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 space-y-4">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Profile</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow
                        icon={<Mail className="w-4 h-4" />}
                        label="Email"
                        value={data.user.email}
                      />
                      <InfoRow
                        icon={<Calendar className="w-4 h-4" />}
                        label="Joined"
                        value={formatDate(data.user.created_at)}
                      />
                      {data.user.birth_data && (
                        <>
                          <InfoRow
                            icon={<Star className="w-4 h-4" />}
                            label="Birth Date"
                            value={formatDate(data.user.birth_data.date)}
                          />
                          {data.user.birth_data.location && (
                            <InfoRow
                              icon={<MapPin className="w-4 h-4" />}
                              label="Birth Place"
                              value={data.user.birth_data.location}
                            />
                          )}
                        </>
                      )}
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyle(data.user.payment_type)}`}>
                        {data.user.payment_type === "subscription" ? "Subscriber" :
                         data.user.payment_type === "one_time" ? "One-Time" :
                         data.user.payment_type === "grandfathered" ? "Free Access" : "Lead"}
                      </span>
                      {(() => {
                        const eng = getEngagementStyle(data.user.engagement);
                        return (
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${eng.bg} ${eng.text}`}>
                            {eng.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Payment Info */}
                  {data.stripe && (
                    <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 space-y-3">
                      <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Payment History</h3>

                      {data.stripe.lastPayment && (
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                          <span className="text-sm text-white/60">Last Payment</span>
                          <span className="text-sm font-medium">
                            ${data.stripe.lastPayment.amount.toFixed(2)} on {formatDate(data.stripe.lastPayment.date)}
                          </span>
                        </div>
                      )}

                      {data.stripe.subscription && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-white/60">Subscription</span>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              data.stripe.subscription.status === "active" ? "text-emerald-400" : "text-amber-400"
                            }`}>
                              {data.stripe.subscription.status}
                            </span>
                            {data.stripe.subscription.cancelAtPeriodEnd && (
                              <p className="text-xs text-amber-400">Cancels {formatDate(data.stripe.subscription.currentPeriodEnd)}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Topics */}
                  {data.user.topics.length > 0 && (
                    <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4 space-y-3">
                      <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.user.topics.map((topic) => (
                          <span
                            key={topic}
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                              topicColors[topic] || topicColors.general
                            }`}
                          >
                            {topic.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Section */}
              {activeSection === "activity" && (
                <div className="space-y-2 animate-fadeIn">
                  {data.activity.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                      No activity recorded yet
                    </div>
                  ) : (
                    data.activity.map((event, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{event.details}</p>
                          <p className="text-xs text-white/40">{event.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-white/40">{formatDate(event.date)}</p>
                          <p className="text-xs text-white/30">{formatTime(event.date)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Conversations Section */}
              {activeSection === "conversations" && (
                <div className="space-y-3 animate-fadeIn">
                  {data.conversations.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                      No Stella conversations yet
                    </div>
                  ) : (
                    data.conversations.map((convo) => (
                      <div
                        key={convo.date}
                        className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden"
                      >
                        {/* Conversation Header */}
                        <button
                          onClick={() => toggleConversation(convo.date)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{formatDate(convo.date)}</span>
                              <span className="text-xs text-white/40">{convo.messages.length} messages</span>
                            </div>
                            {!expandedConversations.has(convo.date) && (
                              <p className="text-sm text-white/50 truncate">{convo.preview}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Topic pills */}
                            <div className="hidden md:flex gap-1">
                              {convo.topics.slice(0, 2).map((topic) => (
                                <span
                                  key={topic}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                                    topicColors[topic] || topicColors.general
                                  }`}
                                >
                                  {topic.replace("_", " ")}
                                </span>
                              ))}
                            </div>
                            {expandedConversations.has(convo.date) ? (
                              <ChevronDown className="w-4 h-4 text-white/40" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-white/40" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Messages */}
                        {expandedConversations.has(convo.date) && (
                          <div className="border-t border-white/5 p-4 space-y-3 bg-black/20">
                            {convo.messages.map((msg, i) => (
                              <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-xl px-4 py-2 ${
                                    msg.role === "user"
                                      ? "bg-emerald-500/20 text-white"
                                      : "bg-white/5 text-white/80"
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  <p className="text-[10px] text-white/30 mt-1">{formatTime(msg.created_at)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Custom animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Helper Components

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "emerald" | "teal" | "cyan" | "blue";
}) {
  const colors = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    teal: "from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
  };

  return (
    <div className={`rounded-xl bg-gradient-to-br ${colors[color]} border p-3`}>
      <div className={`${colors[color].split(" ").pop()} mb-1`}>{icon}</div>
      <p className="text-lg font-bold font-mono">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
        {icon}
      </div>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
