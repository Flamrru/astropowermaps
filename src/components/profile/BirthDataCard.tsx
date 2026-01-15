"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, HelpCircle, Plus, X, Pencil } from "lucide-react";
import LocationSearch from "@/components/astro-map/LocationSearch";
import { BirthLocation } from "@/lib/astro/types";
import { useProfile } from "./ProfileShell";

/**
 * BirthDataCard
 *
 * Displays the user's birth information in an elegant card.
 * Shows date, time (or unknown indicator), and location.
 */
export default function BirthDataCard() {
  const { state } = useProfile();
  const { profile } = state;
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedLocation, setSelectedLocation] = useState<BirthLocation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;

  const handleSaveBirthDate = async () => {
    if (!selectedDate) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate: selectedDate }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "rate_limit") {
          const nextDate = new Date(data.nextUpdateDate);
          throw new Error(`You can only update once every 3 months. Try again on ${nextDate.toLocaleDateString()}`);
        }
        throw new Error(data.error || "Failed to update birth date");
      }

      // Reload to refresh calculations
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSaving(false);
    }
  };

  const handleSaveBirthTime = async () => {
    if (!selectedTime) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthTime: selectedTime }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "rate_limit") {
          const nextDate = new Date(data.nextUpdateDate);
          throw new Error(`You can only update once every 3 months. Try again on ${nextDate.toLocaleDateString()}`);
        }
        throw new Error(data.error || "Failed to update birth time");
      }

      // Reload to refresh Big Three calculation
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSaving(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthPlace: selectedLocation.name,
          birthLat: selectedLocation.lat,
          birthLng: selectedLocation.lng,
          birthTimezone: selectedLocation.timezone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "rate_limit") {
          const nextDate = new Date(data.nextUpdateDate);
          throw new Error(`You can only update once every 3 months. Try again on ${nextDate.toLocaleDateString()}`);
        }
        throw new Error(data.error || "Failed to update location");
      }

      // Reload to refresh map calculations
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSaving(false);
    }
  };

  // Format birth date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format birth time
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const birthItems = [
    {
      icon: Calendar,
      label: "Birth Date",
      value: formatDate(profile.birthDate),
      accent: true,
      editable: true,
      onEdit: () => {
        setSelectedDate(profile.birthDate);
        setShowDateModal(true);
      },
    },
    {
      icon: profile.birthTimeUnknown ? HelpCircle : Clock,
      label: "Birth Time",
      value: profile.birthTimeUnknown
        ? "Unknown"
        : formatTime(profile.birthTime) || "12:00 PM (noon)",
      subtitle: profile.birthTimeUnknown
        ? "Houses unavailable without birth time"
        : null,
      muted: profile.birthTimeUnknown,
      editable: true,
      onEdit: () => setShowTimeModal(true),
    },
    {
      icon: MapPin,
      label: "Birth Place",
      value: profile.birthPlace,
      subtitle: `${profile.birthLat.toFixed(2)}°, ${profile.birthLng.toFixed(2)}°`,
      editable: true,
      onEdit: () => setShowLocationModal(true),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mx-4"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: "linear-gradient(180deg, #E8C547 0%, #C9A227 100%)" }}
        />
        <h2 className="text-white/60 text-xs font-medium uppercase tracking-wider">
          Cosmic Origin
        </h2>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Top accent line */}
        <div
          className="h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.4), transparent)",
          }}
        />

        <div className="p-5 space-y-4">
          {birthItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-4"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: item.muted
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(201, 162, 39, 0.1)",
                  border: `1px solid ${
                    item.muted
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(201, 162, 39, 0.2)"
                  }`,
                }}
              >
                <item.icon
                  size={18}
                  className={item.muted ? "text-white/40" : "text-[#E8C547]"}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">
                  {item.label}
                </div>
                <div
                  className={`text-sm font-medium ${
                    item.muted ? "text-white/50 italic" : "text-white/90"
                  }`}
                >
                  {item.value}
                </div>
                {item.subtitle && (
                  <div className="text-white/30 text-xs mt-0.5">{item.subtitle}</div>
                )}
              </div>

              {/* Edit button */}
              {item.editable && item.onEdit && (
                <button
                  onClick={item.onEdit}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label={`Edit ${item.label.toLowerCase()}`}
                >
                  <Pencil size={14} className="text-white/40 hover:text-[#E8C547]" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add birth time button (only if unknown) */}
        {profile.birthTimeUnknown && (
          <div
            className="px-5 py-3 border-t"
            style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTimeModal(true)}
              className="w-full py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, rgba(201, 162, 39, 0.15), rgba(201, 162, 39, 0.05))",
                border: "1px solid rgba(201, 162, 39, 0.25)",
                color: "#E8C547",
              }}
            >
              <Plus size={14} />
              <span>Add your birth time</span>
            </motion.button>
            <p className="text-white/30 text-[10px] text-center mt-2">
              Unlocks Rising sign and house placements
            </p>
          </div>
        )}

        {/* Hint text about update limit */}
        {!profile.birthTimeUnknown && (
          <div className="px-5 py-3 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}>
            <p className="text-white/30 text-[10px] text-center">
              Each birth detail can be updated once every 3 months
            </p>
          </div>
        )}
      </div>

      {/* Birth Time Modal */}
      <AnimatePresence>
        {showTimeModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTimeModal(false)}
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
                    onClick={() => setShowTimeModal(false)}
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
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(201, 162, 39, 0.05))",
                      border: "1px solid rgba(201, 162, 39, 0.2)",
                    }}
                  >
                    <Clock size={24} className="text-[#E8C547]" />
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-white font-medium text-lg text-center mb-2">
                    Add Your Birth Time
                  </h3>
                  <p className="text-white/50 text-sm text-center">
                    This will unlock your Rising sign and accurate house placements
                  </p>
                </div>

                {/* Time Picker - Native input for better mobile experience */}
                <div className="px-6 pb-4">
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="
                      w-full px-4 py-4 rounded-xl
                      bg-white/10 backdrop-blur-xl
                      border border-white/20
                      text-white text-lg text-center
                      focus:outline-none focus:border-[#C9A227]/50
                      focus:shadow-[0_0_20px_rgba(201,162,39,0.15)]
                      transition-all duration-300
                      [color-scheme:dark]
                    "
                  />

                  {error && (
                    <p className="text-red-400 text-sm text-center mt-4">{error}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveBirthTime}
                    disabled={isSaving}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(201, 162, 39, 0.1))",
                      border: "1px solid rgba(201, 162, 39, 0.3)",
                      color: "#E8C547",
                    }}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-4 h-4 border-2 border-[#E8C547]/30 border-t-[#E8C547] rounded-full"
                        />
                        Saving...
                      </span>
                    ) : (
                      "Save Birth Time"
                    )}
                  </motion.button>

                  <button
                    onClick={() => setShowTimeModal(false)}
                    disabled={isSaving}
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

      {/* Birth Date Modal */}
      <AnimatePresence>
        {showDateModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDateModal(false);
                setError(null);
              }}
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
                    onClick={() => {
                      setShowDateModal(false);
                      setError(null);
                    }}
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
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(201, 162, 39, 0.05))",
                      border: "1px solid rgba(201, 162, 39, 0.2)",
                    }}
                  >
                    <Calendar size={24} className="text-[#E8C547]" />
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-white font-medium text-lg text-center mb-2">
                    Update Birth Date
                  </h3>
                  <p className="text-white/50 text-sm text-center">
                    This will recalculate your entire birth chart
                  </p>
                </div>

                {/* Date Picker */}
                <div className="px-6 pb-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="
                      w-full px-4 py-4 rounded-xl
                      bg-white/10 backdrop-blur-xl
                      border border-white/20
                      text-white text-lg text-center
                      focus:outline-none focus:border-[#C9A227]/50
                      focus:shadow-[0_0_20px_rgba(201,162,39,0.15)]
                      transition-all duration-300
                      [color-scheme:dark]
                    "
                  />

                  {error && (
                    <p className="text-red-400 text-sm text-center mt-4">{error}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveBirthDate}
                    disabled={isSaving || !selectedDate}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(201, 162, 39, 0.1))",
                      border: "1px solid rgba(201, 162, 39, 0.3)",
                      color: "#E8C547",
                    }}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-4 h-4 border-2 border-[#E8C547]/30 border-t-[#E8C547] rounded-full"
                        />
                        Saving...
                      </span>
                    ) : (
                      "Save Birth Date"
                    )}
                  </motion.button>

                  <button
                    onClick={() => {
                      setShowDateModal(false);
                      setError(null);
                    }}
                    disabled={isSaving}
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

      {/* Birth Location Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowLocationModal(false);
                setSelectedLocation(null);
                setError(null);
              }}
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
                    onClick={() => {
                      setShowLocationModal(false);
                      setSelectedLocation(null);
                      setError(null);
                    }}
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
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(201, 162, 39, 0.05))",
                      border: "1px solid rgba(201, 162, 39, 0.2)",
                    }}
                  >
                    <MapPin size={24} className="text-[#E8C547]" />
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-white font-medium text-lg text-center mb-2">
                    Update Birth Location
                  </h3>
                  <p className="text-white/50 text-sm text-center">
                    This will recalculate your astrocartography map
                  </p>
                </div>

                {/* Location Search */}
                <div className="px-6 pb-4">
                  <LocationSearch
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    placeholder="Search for your birth city..."
                  />

                  {error && (
                    <p className="text-red-400 text-sm text-center mt-4">{error}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveLocation}
                    disabled={isSaving || !selectedLocation}
                    className="w-full py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(201, 162, 39, 0.1))",
                      border: "1px solid rgba(201, 162, 39, 0.3)",
                      color: "#E8C547",
                    }}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-4 h-4 border-2 border-[#E8C547]/30 border-t-[#E8C547] rounded-full"
                        />
                        Saving...
                      </span>
                    ) : (
                      "Save Birth Location"
                    )}
                  </motion.button>

                  <button
                    onClick={() => {
                      setShowLocationModal(false);
                      setSelectedLocation(null);
                      setError(null);
                    }}
                    disabled={isSaving}
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
    </motion.div>
  );
}
