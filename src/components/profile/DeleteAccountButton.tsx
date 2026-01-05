"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfile } from "./ProfileShell";

/**
 * DeleteAccountButton
 *
 * Destructive action to permanently delete user account.
 * Requires typing "DELETE" to confirm.
 */
export default function DeleteAccountButton() {
  const router = useRouter();
  const { state } = useProfile();
  const { profile } = state;
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;

  const hasActiveSubscription =
    profile.subscriptionStatus === "active" ||
    profile.subscriptionStatus === "trialing";

  const canDelete = confirmText.toUpperCase() === "DELETE";

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Redirect to login
      router.push("/login?deleted=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Account Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mx-4 mt-4 mb-2 text-center"
      >
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-white/20 hover:text-red-400/60 transition-colors"
        >
          Delete Account
        </button>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
            >
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "rgba(20, 20, 35, 0.98)",
                  backdropFilter: "blur(30px)",
                  WebkitBackdropFilter: "blur(30px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                }}
              >
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                  {/* Close button */}
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={16} className="text-white/40" />
                  </button>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(248, 113, 113, 0.05))",
                      border: "1px solid rgba(248, 113, 113, 0.2)",
                    }}
                  >
                    <Trash2 size={24} className="text-red-400" />
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-white font-medium text-lg text-center mb-2">
                    Delete Your Account
                  </h3>
                  <p className="text-white/50 text-sm text-center">
                    This action is permanent and cannot be undone. All your data will be deleted.
                  </p>
                </div>

                {/* Warning for active subscription */}
                {hasActiveSubscription && (
                  <div className="mx-6 mb-4 p-3 rounded-xl flex items-start gap-3"
                    style={{
                      background: "rgba(251, 191, 36, 0.1)",
                      border: "1px solid rgba(251, 191, 36, 0.2)",
                    }}
                  >
                    <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-200/80 text-xs">
                      Your active subscription will be cancelled immediately. No refunds will be issued.
                    </p>
                  </div>
                )}

                {/* Confirmation Input */}
                <div className="px-6 pb-4">
                  <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    disabled={isDeleting}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-red-400/50 disabled:opacity-50"
                  />

                  {error && (
                    <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: canDelete && !isDeleting ? 1.02 : 1 }}
                    whileTap={{ scale: canDelete && !isDeleting ? 0.98 : 1 }}
                    onClick={handleDelete}
                    disabled={!canDelete || isDeleting}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: canDelete
                        ? "rgba(248, 113, 113, 0.2)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${
                        canDelete
                          ? "rgba(248, 113, 113, 0.3)"
                          : "rgba(255, 255, 255, 0.06)"
                      }`,
                      color: canDelete ? "#F87171" : "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    {isDeleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full"
                        />
                        Deleting Account...
                      </span>
                    ) : (
                      "Permanently Delete Account"
                    )}
                  </motion.button>

                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isDeleting}
                    className="w-full py-3 text-white/40 text-sm hover:text-white/60 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
