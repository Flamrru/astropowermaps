"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Bug,
  HelpCircle,
  ShieldAlert,
  Flag,
  Mail,
  MailOpen,
  Clock,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Inbox,
  MessageSquare,
  Save,
  Loader2,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface FlaggedConversation {
  user_id: string;
  user_email: string;
  total_flagged: number;
  unread_count: number;
  status: "new" | "in_progress" | "resolved" | "snoozed";
  manually_flagged: boolean;
  is_unread: boolean;
  admin_notes: string | null;
  latest_message: {
    content_preview: string;
    primary_topic: string;
    topic_label: string;
    review_reason: string | null;
    created_at: string;
  };
  topics: string[];
  last_flagged_at: string;
  last_read_at: string | null;
  messages: Array<{
    id: string;
    message_id: string;
    content_preview: string;
    primary_topic: string;
    topic_label: string;
    review_reason: string | null;
    created_at: string;
  }>;
}

interface FlaggedInboxProps {
  conversations: FlaggedConversation[];
  totalUnread: number;
  totalInProgress: number;
  onUpdateStatus: (
    userId: string,
    action: string,
    data?: { status?: string; note?: string }
  ) => Promise<void>;
  onViewUser?: (userId: string) => void;
}

// ============================================
// Filter Types
// ============================================

type FilterKey = "all" | "unread" | "in_progress" | "resolved" | "flagged";

const STATUS_OPTIONS = [
  { value: "new", label: "New", icon: <Inbox className="w-3.5 h-3.5" /> },
  { value: "in_progress", label: "In Progress", icon: <Clock className="w-3.5 h-3.5" /> },
  { value: "resolved", label: "Resolved", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { value: "snoozed", label: "Snoozed", icon: <Pause className="w-3.5 h-3.5" /> },
];

// ============================================
// Utility Functions
// ============================================

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMins > 0) return `${diffMins}m`;
  return "now";
}

function getTopicVisuals(topic: string): { icon: React.ReactNode; color: string; bg: string } {
  const visuals: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    support_issue: {
      icon: <Bug className="w-3.5 h-3.5" />,
      color: "text-orange-400",
      bg: "bg-orange-500/20 border-orange-500/30",
    },
    off_topic: {
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      color: "text-amber-400",
      bg: "bg-amber-500/20 border-amber-500/30",
    },
    abuse: {
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      color: "text-red-400",
      bg: "bg-red-500/20 border-red-500/30",
    },
  };
  return visuals[topic] || {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "text-white/50",
    bg: "bg-white/10 border-white/20",
  };
}

// ============================================
// Main Component
// ============================================

export function FlaggedInbox({
  conversations,
  totalUnread,
  totalInProgress,
  onUpdateStatus,
  onViewUser,
}: FlaggedInboxProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  // Optimistic updates
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);
  const [optimisticFlag, setOptimisticFlag] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get selected conversation with optimistic updates applied
  const selectedConversation = useMemo(() => {
    const conv = conversations.find((c) => c.user_id === selectedUserId);
    if (!conv) return undefined;

    // Apply optimistic updates
    return {
      ...conv,
      status: (optimisticStatus as typeof conv.status) || conv.status,
      manually_flagged: optimisticFlag !== null ? optimisticFlag : conv.manually_flagged,
    };
  }, [conversations, selectedUserId, optimisticStatus, optimisticFlag]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    switch (filter) {
      case "unread":
        return conversations.filter((c) => c.is_unread);
      case "in_progress":
        return conversations.filter((c) => c.status === "in_progress");
      case "resolved":
        return conversations.filter((c) => c.status === "resolved");
      case "flagged":
        return conversations.filter((c) => c.manually_flagged);
      default:
        return conversations;
    }
  }, [conversations, filter]);

  // Filter tabs config
  const filterTabs: Array<{ key: FilterKey; label: string; count?: number }> = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread", count: totalUnread },
    { key: "in_progress", label: "In Progress", count: totalInProgress },
    { key: "resolved", label: "Resolved" },
    { key: "flagged", label: "⚑" },
  ];

  // Handle actions with optimistic updates
  const handleAction = async (userId: string, action: string, data?: { status?: string; note?: string }) => {
    setLoadingAction(`${userId}-${action}`);
    setErrorMessage(null);

    // Optimistic updates for immediate feedback
    if (action === "set_status" && data?.status) {
      setOptimisticStatus(data.status);
    } else if (action === "toggle_flag") {
      const currentConv = conversations.find(c => c.user_id === userId);
      setOptimisticFlag(currentConv ? !currentConv.manually_flagged : null);
    }

    try {
      await onUpdateStatus(userId, action, data);
      // Success - clear optimistic state (real data will come from refresh)
      setOptimisticStatus(null);
      setOptimisticFlag(null);
    } catch (error) {
      // Rollback optimistic updates on failure
      setOptimisticStatus(null);
      setOptimisticFlag(null);
      setErrorMessage(error instanceof Error ? error.message : "Failed to update. Please try again.");
      // Auto-clear error after 4 seconds
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedUserId) return;
    setSavingNote(true);
    try {
      await onUpdateStatus(selectedUserId, "add_note", { note: noteText });
    } finally {
      setSavingNote(false);
    }
  };

  // Open conversation detail
  const openConversation = (conversation: FlaggedConversation) => {
    setSelectedUserId(conversation.user_id);
    setNoteText(conversation.admin_notes || "");
    // Auto mark as read when opening
    if (conversation.is_unread) {
      handleAction(conversation.user_id, "mark_read");
    }
  };

  return (
    <div className="relative min-h-[600px] rounded-2xl bg-white/[0.01] border border-white/10 backdrop-blur-sm overflow-hidden">
      {/* ============================================ */}
      {/* List View */}
      {/* ============================================ */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-out ${
          selectedUserId ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Error Toast */}
        {errorMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm shadow-lg backdrop-blur-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Header with Filter Tabs */}
        <div className="sticky top-0 z-10 bg-[#060609]/95 backdrop-blur-sm border-b border-white/5">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-emerald-400" />
                Flagged Conversations
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                {totalUnread > 0 && (
                  <span className="text-emerald-400">{totalUnread} unread</span>
                )}
                {totalUnread > 0 && totalInProgress > 0 && " • "}
                {totalInProgress > 0 && (
                  <span className="text-amber-400">{totalInProgress} in progress</span>
                )}
                {totalUnread === 0 && totalInProgress === 0 && "All caught up"}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-5 pb-3 flex items-center gap-1 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  whitespace-nowrap transition-all duration-200
                  ${
                    filter === tab.key
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                      : "text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`
                      px-1.5 py-0.5 rounded-full text-[10px] font-bold
                      ${filter === tab.key ? "bg-emerald-500/30" : "bg-white/10"}
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="overflow-y-auto h-[calc(100%-120px)] custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/50" />
              </div>
              <p className="text-white/50 text-sm">No conversations to show</p>
              <p className="text-white/30 text-xs mt-1">
                {filter !== "all" ? "Try changing the filter" : "All clear!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredConversations.map((conversation, index) => (
                <ConversationRow
                  key={conversation.user_id}
                  conversation={conversation}
                  index={index}
                  loadingAction={loadingAction}
                  onOpen={() => openConversation(conversation)}
                  onMarkRead={() => handleAction(conversation.user_id, "mark_read")}
                  onMarkUnread={() => handleAction(conversation.user_id, "mark_unread")}
                  onToggleFlag={() => handleAction(conversation.user_id, "toggle_flag")}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* Detail View */}
      {/* ============================================ */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-out ${
          selectedUserId ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedConversation && (
          <ConversationDetail
            conversation={selectedConversation}
            noteText={noteText}
            savingNote={savingNote}
            loadingAction={loadingAction}
            onBack={() => setSelectedUserId(null)}
            onNoteChange={setNoteText}
            onSaveNote={handleSaveNote}
            onSetStatus={(status) =>
              handleAction(selectedConversation.user_id, "set_status", { status })
            }
            onToggleFlag={() => handleAction(selectedConversation.user_id, "toggle_flag")}
            onViewUser={onViewUser}
          />
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
        }
        .unread-indicator {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// ============================================
// Conversation Row Component
// ============================================

function ConversationRow({
  conversation,
  index,
  loadingAction,
  onOpen,
  onMarkRead,
  onMarkUnread,
  onToggleFlag,
}: {
  conversation: FlaggedConversation;
  index: number;
  loadingAction: string | null;
  onOpen: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onToggleFlag: () => void;
}) {
  const topicVisuals = getTopicVisuals(conversation.latest_message.primary_topic);
  const isLoading = loadingAction?.startsWith(conversation.user_id);

  return (
    <div
      className="group relative px-5 py-4 hover:bg-white/[0.02] transition-all duration-200 cursor-pointer"
      onClick={onOpen}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Unread Indicator Track */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-1 transition-all duration-300
          ${conversation.is_unread ? "bg-emerald-500" : "bg-transparent"}
        `}
      />

      <div className="flex items-start gap-4">
        {/* Unread Dot */}
        <div className="flex-shrink-0 pt-1">
          {conversation.is_unread ? (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 unread-indicator" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`
                  text-sm font-medium truncate
                  ${conversation.is_unread ? "text-white" : "text-white/70"}
                `}
              >
                {conversation.user_email}
              </span>

              {/* Manual Flag */}
              {conversation.manually_flagged && (
                <Flag className="w-3 h-3 text-amber-400 flex-shrink-0 fill-amber-400" />
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Topic Badge */}
              <span
                className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border
                  ${topicVisuals.bg} ${topicVisuals.color}
                `}
              >
                {topicVisuals.icon}
                <span className="hidden sm:inline">{conversation.latest_message.topic_label}</span>
              </span>

              {/* Time */}
              <span className="text-xs text-white/30 tabular-nums">
                {formatTimeAgo(conversation.last_flagged_at)}
              </span>
            </div>
          </div>

          {/* Message Preview */}
          <p
            className={`
              text-sm line-clamp-1 mb-2
              ${conversation.is_unread ? "text-white/60" : "text-white/40"}
            `}
          >
            {conversation.latest_message.content_preview || "No preview available"}
          </p>

          {/* Footer Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/30 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {conversation.total_flagged} flagged message{conversation.total_flagged !== 1 ? "s" : ""}
            </span>

            {/* Quick Actions */}
            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mark Read/Unread */}
              <button
                onClick={conversation.is_unread ? onMarkRead : onMarkUnread}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
                title={conversation.is_unread ? "Mark as read" : "Mark as unread"}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : conversation.is_unread ? (
                  <MailOpen className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </button>

              {/* Toggle Flag */}
              <button
                onClick={onToggleFlag}
                disabled={isLoading}
                className={`
                  p-1.5 rounded-lg transition-all
                  ${
                    conversation.manually_flagged
                      ? "text-amber-400 hover:text-amber-300"
                      : "text-white/40 hover:text-amber-400"
                  }
                  hover:bg-white/5
                `}
                title={conversation.manually_flagged ? "Remove flag" : "Flag for later"}
              >
                <Flag
                  className={`w-4 h-4 ${conversation.manually_flagged ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Conversation Detail Component
// ============================================

function ConversationDetail({
  conversation,
  noteText,
  savingNote,
  loadingAction,
  onBack,
  onNoteChange,
  onSaveNote,
  onSetStatus,
  onToggleFlag,
  onViewUser,
}: {
  conversation: FlaggedConversation;
  noteText: string;
  savingNote: boolean;
  loadingAction: string | null;
  onBack: () => void;
  onNoteChange: (text: string) => void;
  onSaveNote: () => void;
  onSetStatus: (status: string) => void;
  onToggleFlag: () => void;
  onViewUser?: (userId: string) => void;
}) {
  const [statusOpen, setStatusOpen] = useState(false);
  const isLoading = loadingAction?.startsWith(conversation.user_id);

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === conversation.status);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#060609]/95 backdrop-blur-sm border-b border-white/5 px-5 py-4">
        <div className="flex items-center justify-between">
          {/* Back & Email */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-semibold text-white">{conversation.user_email}</h3>
              <p className="text-xs text-white/40">
                {conversation.total_flagged} flagged message{conversation.total_flagged !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                disabled={isLoading}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border
                  transition-all duration-200
                  ${
                    conversation.status === "resolved"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : conversation.status === "in_progress"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                  }
                `}
              >
                {currentStatus?.icon}
                {currentStatus?.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {statusOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 py-1 rounded-xl bg-[#0a0a0f] border border-white/10 shadow-xl z-20">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSetStatus(option.value);
                        setStatusOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                        transition-colors
                        ${
                          conversation.status === option.value
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }
                      `}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Flag Toggle */}
            <button
              onClick={onToggleFlag}
              disabled={isLoading}
              className={`
                p-2 rounded-lg border transition-all duration-200
                ${
                  conversation.manually_flagged
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-white/5 text-white/40 border-white/10 hover:text-amber-400 hover:border-amber-500/30"
                }
              `}
              title={conversation.manually_flagged ? "Remove flag" : "Flag for later"}
            >
              <Flag className={`w-4 h-4 ${conversation.manually_flagged ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
        <div className="space-y-3">
          {conversation.messages.map((msg, index) => {
            const visuals = getTopicVisuals(msg.primary_topic);

            return (
              <div
                key={msg.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border
                      ${visuals.bg} ${visuals.color}
                    `}
                  >
                    {visuals.icon}
                    {msg.topic_label}
                  </span>
                  <span className="text-xs text-white/30 tabular-nums">
                    {formatTimeAgo(msg.created_at)}
                  </span>
                </div>

                {/* Message Content */}
                <p className="text-sm text-white/70 leading-relaxed mb-2">
                  {msg.content_preview}
                </p>

                {/* Review Reason */}
                {msg.review_reason && (
                  <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                    <AlertTriangle className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-white/40 italic">{msg.review_reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with Notes & Actions */}
      <div className="border-t border-white/5 px-5 py-4 space-y-4">
        {/* Admin Notes */}
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">
            Admin Notes
          </label>
          <div className="flex gap-2">
            <textarea
              value={noteText}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Add a note about this conversation..."
              className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white/80 placeholder:text-white/30 resize-none focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              rows={2}
            />
            <button
              onClick={onSaveNote}
              disabled={savingNote}
              className="px-4 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {savingNote ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* View Full Chat Button */}
        {onViewUser && (
          <button
            onClick={() => onViewUser(conversation.user_id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:from-emerald-500/20 hover:to-teal-500/20 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            View Full Chat History
          </button>
        )}
      </div>

      {/* Dropdown Backdrop */}
      {statusOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
      )}
    </div>
  );
}
