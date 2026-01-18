"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  LogOut,
  Download,
} from "lucide-react";

interface NavTab {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const TABS: NavTab[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "ab-testing",
    label: "A/B Testing",
    href: "/admin/ab-testing",
    icon: <FlaskConical className="w-4 h-4" />,
  },
  {
    id: "leads",
    label: "Leads",
    href: "/admin/leads",
    icon: <Users className="w-4 h-4" />,
  },
];

interface AdminNavbarProps {
  onExportCSV?: () => void;
  showExport?: boolean;
}

export default function AdminNavbar({ onExportCSV, showExport = false }: AdminNavbarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin";
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.98) 0%, rgba(10, 10, 15, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Top gold accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(232,197,71,0.3) 30%, rgba(232,197,71,0.5) 50%, rgba(232,197,71,0.3) 70%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#E8C547]/20"
            style={{
              background: 'linear-gradient(135deg, rgba(232,197,71,0.12) 0%, rgba(232,197,71,0.04) 100%)',
            }}
          >
            <svg className="w-4 h-4 text-[#E8C547]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-[15px] tracking-tight leading-tight">AstroPower</span>
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Admin</span>
          </div>
        </div>

        {/* Center: Navigation */}
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href ||
              (tab.href !== "/admin/dashboard" && pathname?.startsWith(tab.href));

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'text-white bg-white/[0.08] shadow-sm'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }
                `}
              >
                <span className={`transition-colors duration-200 ${isActive ? 'text-[#E8C547]' : ''}`}>
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E8C547]"
                    style={{ boxShadow: '0 0 8px rgba(232,197,71,0.6)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {showExport && onExportCSV && (
            <button
              onClick={onExportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-400/80 hover:text-emerald-400 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12] border border-emerald-500/20 hover:border-emerald-500/30 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 bg-white/[0.03] hover:bg-red-500/[0.08] border border-white/[0.06] hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
