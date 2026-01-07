"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange as DayPickerRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar, ChevronDown, Check } from "lucide-react";

// Subscription launch date (Jan 7, 2026 Swiss time)
const SUBSCRIPTION_LAUNCH = new Date("2026-01-07T00:00:00+01:00");

type DatePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_14_days"
  | "last_30_days"
  | "last_90_days"
  | "this_month"
  | "last_month"
  | "since_launch"
  | "custom";

interface DateRange {
  from: Date;
  to: Date;
  preset: DatePreset;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS: { key: DatePreset; label: string; getRange: () => { from: Date; to: Date } }[] = [
  {
    key: "today",
    label: "Today",
    getRange: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return { from: today, to: new Date() };
    },
  },
  {
    key: "yesterday",
    label: "Yesterday",
    getRange: () => {
      const yesterday = subDays(new Date(), 1);
      yesterday.setHours(0, 0, 0, 0);
      const end = new Date(yesterday);
      end.setHours(23, 59, 59, 999);
      return { from: yesterday, to: end };
    },
  },
  {
    key: "last_7_days",
    label: "Last 7 days",
    getRange: () => {
      const from = subDays(new Date(), 7);
      from.setHours(0, 0, 0, 0);
      return { from, to: new Date() };
    },
  },
  {
    key: "last_14_days",
    label: "Last 14 days",
    getRange: () => {
      const from = subDays(new Date(), 14);
      from.setHours(0, 0, 0, 0);
      return { from, to: new Date() };
    },
  },
  {
    key: "last_30_days",
    label: "Last 30 days",
    getRange: () => {
      const from = subDays(new Date(), 30);
      from.setHours(0, 0, 0, 0);
      return { from, to: new Date() };
    },
  },
  {
    key: "last_90_days",
    label: "Last 90 days",
    getRange: () => {
      const from = subDays(new Date(), 90);
      from.setHours(0, 0, 0, 0);
      return { from, to: new Date() };
    },
  },
  {
    key: "this_month",
    label: "This month",
    getRange: () => {
      const now = new Date();
      return { from: startOfMonth(now), to: now };
    },
  },
  {
    key: "last_month",
    label: "Last month",
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    },
  },
  {
    key: "since_launch",
    label: "Since Subscription Launch",
    getRange: () => {
      return { from: SUBSCRIPTION_LAUNCH, to: new Date() };
    },
  },
];

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempRange, setTempRange] = useState<DayPickerRange | undefined>({
    from: value.from,
    to: value.to,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (preset: (typeof PRESETS)[number]) => {
    const range = preset.getRange();
    onChange({ ...range, preset: preset.key });
    setIsOpen(false);
    setShowCalendar(false);
  };

  const handleCustomClick = () => {
    setShowCalendar(true);
  };

  const handleCalendarSelect = (range: DayPickerRange | undefined) => {
    setTempRange(range);
  };

  const handleApplyCustomRange = () => {
    if (tempRange?.from && tempRange?.to) {
      onChange({
        from: tempRange.from,
        to: tempRange.to,
        preset: "custom",
      });
      setIsOpen(false);
      setShowCalendar(false);
    }
  };

  const getDisplayLabel = () => {
    if (value.preset === "custom") {
      return `${format(value.from, "MMM d")} - ${format(value.to, "MMM d, yyyy")}`;
    }
    const preset = PRESETS.find((p) => p.key === value.preset);
    return preset?.label || "Select date range";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-[var(--gold-main)] text-black hover:bg-[var(--gold-bright)]"
      >
        <Calendar className="w-4 h-4" />
        <span>{getDisplayLabel()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-xl overflow-hidden z-50"
          style={{
            background: "rgba(20, 20, 40, 0.98)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(20px)",
          }}
        >
          {!showCalendar ? (
            <>
              {/* Presets List */}
              <div className="p-2">
                {PRESETS.slice(0, 6).map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-white/10 transition-colors"
                  >
                    <span className={value.preset === preset.key ? "text-[var(--gold-main)]" : "text-white"}>
                      {preset.label}
                    </span>
                    {value.preset === preset.key && <Check className="w-4 h-4 text-[var(--gold-main)]" />}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 mx-2" />

              {/* Month presets */}
              <div className="p-2">
                {PRESETS.slice(6, 8).map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-white/10 transition-colors"
                  >
                    <span className={value.preset === preset.key ? "text-[var(--gold-main)]" : "text-white"}>
                      {preset.label}
                    </span>
                    {value.preset === preset.key && <Check className="w-4 h-4 text-[var(--gold-main)]" />}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 mx-2" />

              {/* Special presets */}
              <div className="p-2">
                {PRESETS.slice(8).map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-white/10 transition-colors"
                  >
                    <span className={value.preset === preset.key ? "text-[var(--gold-main)]" : "text-white"}>
                      {preset.label}
                    </span>
                    {value.preset === preset.key && <Check className="w-4 h-4 text-[var(--gold-main)]" />}
                  </button>
                ))}

                {/* Custom range option */}
                <button
                  onClick={handleCustomClick}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-white/10 transition-colors"
                >
                  <span className={value.preset === "custom" ? "text-[var(--gold-main)]" : "text-white"}>
                    Custom range...
                  </span>
                  {value.preset === "custom" && <Check className="w-4 h-4 text-[var(--gold-main)]" />}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Calendar Picker */}
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="text-sm text-white/60 hover:text-white"
                  >
                    ← Back to presets
                  </button>
                </div>

                <style jsx global>{`
                  .rdp {
                    --rdp-cell-size: 36px;
                    --rdp-accent-color: var(--gold-main);
                    --rdp-background-color: rgba(232, 197, 71, 0.2);
                    margin: 0;
                  }
                  .rdp-months {
                    justify-content: center;
                  }
                  .rdp-month {
                    background: transparent;
                  }
                  .rdp-caption_label {
                    color: white;
                    font-size: 14px;
                  }
                  .rdp-head_cell {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    font-weight: 500;
                  }
                  .rdp-day {
                    color: white;
                    font-size: 13px;
                  }
                  .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
                    background: rgba(255, 255, 255, 0.1);
                  }
                  .rdp-day_selected {
                    background: var(--gold-main) !important;
                    color: black !important;
                  }
                  .rdp-day_range_middle {
                    background: rgba(232, 197, 71, 0.2) !important;
                    color: white !important;
                  }
                  .rdp-button:hover:not([disabled]) {
                    background: rgba(255, 255, 255, 0.1);
                  }
                  .rdp-nav_button {
                    color: white;
                  }
                `}</style>

                <DayPicker
                  mode="range"
                  selected={tempRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={1}
                  disabled={{ after: new Date() }}
                />

                {/* Selected range display */}
                {tempRange?.from && (
                  <div className="mt-3 text-sm text-center text-white/60">
                    {tempRange.from && format(tempRange.from, "MMM d, yyyy")}
                    {tempRange.to && ` - ${format(tempRange.to, "MMM d, yyyy")}`}
                  </div>
                )}

                {/* Apply button */}
                <button
                  onClick={handleApplyCustomRange}
                  disabled={!tempRange?.from || !tempRange?.to}
                  className="w-full mt-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--gold-main)",
                    color: "black",
                  }}
                >
                  Apply Range
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
