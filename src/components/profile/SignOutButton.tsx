"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { useProfile } from "./ProfileShell";

/**
 * SignOutButton
 *
 * Sign out button with a confirmation modal.
 * Uses the signOut function from ProfileShell context.
 */
export default function SignOutButton() {
  const { signOut } = useProfile();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <>
      {/* Sign Out Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-4 mt-8 mb-8"
      >
        <motion.button
          onClick={() => setShowConfirm(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <LogOut size={18} className="text-white/40" />
          <span className="text-white/50 text-sm font-medium">Sign Out</span>
        </motion.button>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
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
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
                }}
              >
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                  {/* Close button */}
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={16} className="text-white/40" />
                  </button>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.15), rgba(201, 162, 39, 0.05))",
                      border: "1px solid rgba(201, 162, 39, 0.2)",
                    }}
                  >
                    <span className="text-2xl">🌙</span>
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-white font-medium text-lg text-center mb-2">
                    Leaving so soon?
                  </h3>
                  <p className="text-white/50 text-sm text-center">
                    The stars will miss you. Are you sure you want to sign out?
                  </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3">
                  {/* Cancel button */}
                  <motion.button
                    onClick={() => setShowConfirm(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(201, 162, 39, 0.1))",
                      border: "1px solid rgba(201, 162, 39, 0.3)",
                      color: "#E8C547",
                    }}
                  >
                    Stay Connected
                  </motion.button>

                  {/* Sign out button */}
                  <motion.button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    whileHover={{ scale: isSigningOut ? 1 : 1.01 }}
                    whileTap={{ scale: isSigningOut ? 1 : 0.99 }}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    {isSigningOut ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full"
                        />
                        Signing out...
                      </span>
                    ) : (
                      "Sign Out"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
