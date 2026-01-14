"use client";

import { useState } from "react";
import {
  Brain,
  AlertTriangle,
  MessageSquareWarning,
  Target,
  Play,
  Loader2,
  Filter,
  Bug,
  HelpCircle,
  ShieldAlert,
  ExternalLink,
  Quote,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface TopicBreakdownItem {
  topic: string;
  count: number;
  percentage: number;
  label: string;
  color: string;
  flagged?: boolean;
}

interface FlaggedMessage {
  id: string;
  message_id: string;
  user_id: string;
  user_email: string;
  content_preview: string;
  primary_topic: string;
  topic_label: string;
  review_reason: string | null;
  classified_at: string;
  message_created_at: string;
}

interface PainPointItem {
  category: string;
  label: string;
  topic: string;
  count: number;
  percentage: number;
  examples: string[];
}

interface LastJob {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  messagesAnalyzed: number;
  messagesClassified: number;
  errors: number;
}

interface ChatAnalysisData {
  summary: {
    totalClassified: number;
    totalUnclassified: number;
    flaggedForReview: number;
    totalPainPoints: number;
  };
  topicBreakdown: TopicBreakdownItem[];
  flaggedMessages: FlaggedMessage[];
  painPoints: PainPointItem[];
  lastJob: LastJob | null;
}

interface ChatAnalysisTabProps {
  data: ChatAnalysisData | null;
  onRunAnalysis: () => Promise<void>;
  onViewUser?: (userId: string) => void;
}

// ============================================
// Filter Types
// ============================================

type FlagFilter = "all" | "support_issue" | "off_topic" | "abuse";

const FLAG_FILTERS: Array<{ key: FlagFilter; label: string; icon: React.ReactNode }> = [
  { key: "all", label: "All", icon: <Filter className="w-3.5 h-3.5" /> },
  { key: "support_issue", label: "Support", icon: <Bug className="w-3.5 h-3.5" /> },
  { key: "off_topic", label: "Off-topic", icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { key: "abuse", label: "Abuse", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
];

// ============================================
// Main Component
// ============================================

export function ChatAnalysisTab({ data, onRunAnalysis, onViewUser }: ChatAnalysisTabProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [flagFilter, setFlagFilter] = useState<FlagFilter>("all");
  const [analysisResult, setAnalysisResult] = useState<{
    status: string;
    messagesClassified?: number;
  } | null>(null);

  // Handle run analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      await onRunAnalysis();
      // The parent will refetch data, but we show a brief success state
      setAnalysisResult({ status: "completed" });
    } catch {
      setAnalysisResult({ status: "error" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filter flagged messages
  const filteredFlagged =
    flagFilter === "all"
      ? data?.flaggedMessages || []
      : (data?.flaggedMessages || []).filter((m) => m.primary_topic === flagFilter);

  // Format relative time
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "just now";
  };

  // Get topic icon and color
  const getTopicVisuals = (topic: string) => {
    const visuals: Record<string, { icon: React.ReactNode; color: string }> = {
      support_issue: { icon: <Bug className="w-4 h-4" />, color: "text-orange-400" },
      off_topic: { icon: <HelpCircle className="w-4 h-4" />, color: "text-amber-400" },
      abuse: { icon: <ShieldAlert className="w-4 h-4" />, color: "text-red-400" },
    };
    return visuals[topic] || { icon: <MessageSquareWarning className="w-4 h-4" />, color: "text-white/60" };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Analysis Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            AI Chat Analysis
          </h2>
          {data?.lastJob && (
            <p className="text-xs text-white/40 mt-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Last run: {formatTimeAgo(data.lastJob.completedAt || data.lastJob.startedAt)}
              {data.lastJob.status === "completed" && (
                <span className="text-emerald-400">
                  ({data.lastJob.messagesClassified} classified)
                </span>
              )}
            </p>
          )}
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-300 group
            ${
              isAnalyzing
                ? "bg-emerald-500/20 text-emerald-400 cursor-wait"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]"
            }
          `}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Run Analysis
            </>
          )}
        </button>
      </div>

      {/* Analysis Result Toast */}
      {analysisResult && (
        <div
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border animate-slideIn
            ${
              analysisResult.status === "completed"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }
          `}
        >
          {analysisResult.status === "completed" ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Analysis complete! Data has been refreshed.</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5" />
              <span>Analysis failed. Please try again.</span>
            </>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Analyzed"
          value={data?.summary.totalClassified || 0}
          icon={<Brain className="w-5 h-5" />}
          color="emerald"
          subtitle={
            data?.summary.totalUnclassified
              ? `${data.summary.totalUnclassified} pending`
              : undefined
          }
        />
        <MetricCard
          label="Flagged"
          value={data?.summary.flaggedForReview || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
        <MetricCard
          label="Support Issues"
          value={
            data?.topicBreakdown.find((t) => t.topic === "support_issue")?.count || 0
          }
          icon={<Bug className="w-5 h-5" />}
          color="orange"
        />
        <MetricCard
          label="Pain Points"
          value={data?.summary.totalPainPoints || 0}
          icon={<Target className="w-5 h-5" />}
          color="teal"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <GlassCard title="Topic Breakdown" subtitle="AI-classified message categories">
          <TopicBreakdownChart topics={data?.topicBreakdown || []} />
        </GlassCard>

        {/* Pain Points Insights */}
        <GlassCard
          title="Pain Points"
          subtitle="User needs extracted for ad targeting"
          headerAction={
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ad Insights</span>
            </div>
          }
        >
          <PainPointsList painPoints={data?.painPoints || []} />
        </GlassCard>
      </div>

      {/* Flagged Messages Panel */}
      <GlassCard
        title="Flagged for Review"
        subtitle={`${filteredFlagged.length} messages need attention`}
        headerAction={
          <div className="flex items-center gap-1">
            {FLAG_FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFlagFilter(filter.key)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                  transition-all duration-200
                  ${
                    flagFilter === filter.key
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-white/40 hover:text-white/60 hover:bg-white/5"
                  }
                `}
              >
                {filter.icon}
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            ))}
          </div>
        }
      >
        <FlaggedMessagesList
          messages={filteredFlagged}
          getTopicVisuals={getTopicVisuals}
          formatTimeAgo={formatTimeAgo}
          onViewUser={onViewUser}
        />
      </GlassCard>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function MetricCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: "emerald" | "teal" | "cyan" | "blue" | "amber" | "orange";
  subtitle?: string;
}) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    teal: "from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClasses[color]} border p-4 transition-all duration-300 hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40 mb-1">{label}</p>
          <p className="text-2xl font-bold font-mono">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/30 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-white/5 ${colorClasses[color].split(" ").pop()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function GlassCard({
  title,
  subtitle,
  headerAction,
  children,
}: {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {headerAction}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TopicBreakdownChart({ topics }: { topics: TopicBreakdownItem[] }) {
  if (topics.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No classifications yet</p>
        <p className="text-white/30 text-xs mt-1">Run analysis to classify messages</p>
      </div>
    );
  }

  const max = Math.max(...topics.map((t) => t.count));

  return (
    <div className="space-y-3">
      {topics.slice(0, 10).map((topic, i) => (
        <div
          key={topic.topic}
          className="flex items-center gap-3 group"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="w-28 flex items-center gap-2">
            {topic.flagged && (
              <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
            )}
            <span className="text-sm text-white/60 truncate">{topic.label}</span>
          </div>
          <div className="flex-1 h-7 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
              style={{
                width: `${(topic.count / max) * 100}%`,
                backgroundColor: topic.color,
                opacity: 0.8,
              }}
            />
          </div>
          <div className="w-16 text-right">
            <span className="text-sm font-mono font-medium">{topic.count}</span>
            <span className="text-xs text-white/30 ml-1">({topic.percentage}%)</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PainPointsList({ painPoints }: { painPoints: PainPointItem[] }) {
  if (painPoints.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No pain points extracted yet</p>
        <p className="text-white/30 text-xs mt-1">Pain points help identify ad opportunities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {painPoints.slice(0, 6).map((pp, i) => (
        <div
          key={pp.category}
          className="group"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
              <span className="text-sm font-medium text-white/80">{pp.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">{pp.count} users</span>
              <span className="text-xs font-mono text-emerald-400">{pp.percentage}%</span>
            </div>
          </div>

          {/* Example Quote */}
          {pp.examples[0] && (
            <div className="flex items-start gap-2 pl-4">
              <Quote className="w-3 h-3 text-white/20 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/40 italic line-clamp-2">
                &ldquo;{pp.examples[0]}&rdquo;
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Ad Insight CTA */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">Ad Targeting Insight</span>
        </div>
        <p className="text-xs text-white/50">
          {painPoints.length > 0
            ? `Top concern: "${painPoints[0].label}" - Use this language in ad copy for resonance.`
            : "Analyze more chats to discover ad targeting opportunities."}
        </p>
      </div>
    </div>
  );
}

function FlaggedMessagesList({
  messages,
  getTopicVisuals,
  formatTimeAgo,
  onViewUser,
}: {
  messages: FlaggedMessage[];
  getTopicVisuals: (topic: string) => { icon: React.ReactNode; color: string };
  formatTimeAgo: (date: string) => string;
  onViewUser?: (userId: string) => void;
}) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-10 h-10 text-emerald-400/50 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No flagged messages</p>
        <p className="text-white/30 text-xs mt-1">All clear! No issues detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {messages.map((msg, i) => {
        const visuals = getTopicVisuals(msg.primary_topic);

        return (
          <div
            key={msg.id}
            className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg bg-white/5 ${visuals.color}`}>
                  {visuals.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">
                    {msg.user_email}
                  </p>
                  <p className="text-xs text-white/30">
                    {formatTimeAgo(msg.message_created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`
                    px-2 py-0.5 rounded-md text-xs font-medium border
                    ${
                      msg.primary_topic === "support_issue"
                        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        : msg.primary_topic === "abuse"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }
                  `}
                >
                  {msg.topic_label}
                </span>
              </div>
            </div>

            {/* Message Preview */}
            <p className="text-sm text-white/50 line-clamp-2 mb-3">
              {msg.content_preview || "No preview available"}
            </p>

            {/* Review Reason */}
            {msg.review_reason && (
              <p className="text-xs text-white/30 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" />
                {msg.review_reason}
              </p>
            )}

            {/* Action */}
            {onViewUser && (
              <button
                onClick={() => onViewUser(msg.user_id)}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ExternalLink className="w-3 h-3" />
                View User Chat
              </button>
            )}
          </div>
        );
      })}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
