import type { Metadata } from "next";
import CalendarShell from "@/components/calendar/CalendarShell";
import CalendarView from "@/components/calendar/CalendarView";

export const metadata: Metadata = {
  title: "Cosmic Calendar | Stella+",
  description: "Track power days, moon phases, and cosmic events",
};

/**
 * Dashboard Calendar Page
 *
 * Monthly calendar view showing:
 * - Power days personalized to user's chart
 * - Moon phases (new moon, full moon)
 * - Rest days and cosmic events
 * - 2026 Report tab
 * - Life Transits tab
 */
export default function DashboardCalendarPage() {
  return (
    <CalendarShell>
      <div className="max-w-md mx-auto">
        <CalendarView />
      </div>
    </CalendarShell>
  );
}
