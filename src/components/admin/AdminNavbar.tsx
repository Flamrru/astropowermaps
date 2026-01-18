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
    <nav className="sticky top-0 z-50 bg-[#08080c] border-b border-[#1a1a24]">
      {/* Top accent line */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, #E8C547 20%, #F4D76B 50%, #E8C547 80%, transparent)',
          opacity: 0.4,
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">

          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #1a1a24, #0d0d12)',
                border: '1px solid #E8C547',
                boxShadow: '0 0 20px rgba(232,197,71,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <svg className="w-5 h-5 text-[#E8C547]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-semibold text-base tracking-tight">AstroPower</div>
              <div className="text-[10px] text-[#E8C547]/60 uppercase tracking-[0.2em] font-medium">Admin</div>
            </div>
          </div>

          {/* Center: Navigation */}
          <div
            className="flex items-center gap-1 px-1.5 py-1.5 rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, #0f0f14 0%, #0a0a0f 100%)',
              border: '1px solid #1f1f2a',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {TABS.map((tab) => {
              const isActive = pathname === tab.href ||
                (tab.href !== "/admin/dashboard" && pathname?.startsWith(tab.href));

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                  style={isActive ? {
                    background: 'linear-gradient(180deg, #1a1a24 0%, #141419 100%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                    color: '#fff',
                  } : {
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  <span
                    className="transition-colors duration-300"
                    style={{ color: isActive ? '#E8C547' : 'inherit' }}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>

                  {/* Active indicator bar */}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, #E8C547, transparent)',
                        boxShadow: '0 0 10px rgba(232,197,71,0.5)',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {showExport && onExportCSV && (
              <button
                onClick={onExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                style={{
                  background: 'linear-gradient(180deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.08) 100%)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10B981',
                  boxShadow: '0 0 15px rgba(16,185,129,0.1)',
                }}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
              style={{
                background: 'linear-gradient(180deg, #141419 0%, #0f0f14 100%)',
                border: '1px solid #1f1f2a',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
