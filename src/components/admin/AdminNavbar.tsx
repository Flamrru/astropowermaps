"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  LogOut,
  Sparkles,
} from "lucide-react";

interface NavTab {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: NavTab[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    description: "Dashboard & metrics",
  },
  {
    id: "ab-testing",
    label: "A/B Testing",
    href: "/admin/ab-testing",
    icon: <FlaskConical className="w-4 h-4" />,
    description: "Price experiments",
  },
  {
    id: "leads",
    label: "Leads",
    href: "/admin/leads",
    icon: <Users className="w-4 h-4" />,
    description: "Customer data",
  },
];

interface AdminNavbarProps {
  onExportCSV?: () => void;
  showExport?: boolean;
}

export default function AdminNavbar({ onExportCSV, showExport = false }: AdminNavbarProps) {
  const pathname = usePathname();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleLogout = () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin";
  };

  return (
    <>
      <nav className="admin-nav">
        {/* Ambient glow effect */}
        <div className="nav-glow" />

        {/* Main navbar content */}
        <div className="nav-content">
          {/* Left: Brand */}
          <div className="nav-brand">
            <div className="brand-mark">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="brand-text">
              <span className="brand-name">AstroPower</span>
              <span className="brand-context">Admin Console</span>
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <div className="nav-tabs">
            {TABS.map((tab) => {
              const isActive = pathname === tab.href ||
                (tab.href !== "/admin/dashboard" && pathname?.startsWith(tab.href));
              const isHovered = hoveredTab === tab.id;

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`nav-tab ${isActive ? "active" : ""}`}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <span className="tab-active-indicator" />
                  )}

                  {/* Hover glow */}
                  {(isHovered || isActive) && (
                    <span className="tab-glow" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="nav-actions">
            {showExport && onExportCSV && (
              <button onClick={onExportCSV} className="action-btn export-btn">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
              </button>
            )}
            <button onClick={handleLogout} className="action-btn logout-btn">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Bottom border with gradient */}
        <div className="nav-border" />
      </nav>

      <style jsx>{`
        .admin-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 72px;
          background: linear-gradient(180deg,
            rgba(8, 8, 12, 0.98) 0%,
            rgba(12, 12, 18, 0.95) 100%
          );
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
        }

        /* Ambient glow at the top */
        .nav-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(232, 197, 71, 0.4) 30%,
            rgba(232, 197, 71, 0.6) 50%,
            rgba(232, 197, 71, 0.4) 70%,
            transparent 100%
          );
          filter: blur(1px);
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
        }

        /* Brand styling */
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-mark {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg,
            rgba(232, 197, 71, 0.15) 0%,
            rgba(232, 197, 71, 0.05) 100%
          );
          border: 1px solid rgba(232, 197, 71, 0.25);
          border-radius: 12px;
          color: #E8C547;
          transition: all 0.3s ease;
        }

        .brand-mark:hover {
          border-color: rgba(232, 197, 71, 0.4);
          box-shadow: 0 0 20px rgba(232, 197, 71, 0.15);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .brand-name {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 17px;
          color: white;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .brand-context {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.35);
        }

        /* Navigation tabs */
        .nav-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-tab {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.45);
          text-decoration: none;
          transition: all 0.25s ease;
          overflow: hidden;
        }

        .nav-tab:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        .nav-tab.active {
          color: white;
        }

        .tab-icon {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }

        .nav-tab:hover .tab-icon,
        .nav-tab.active .tab-icon {
          color: #E8C547;
        }

        .tab-label {
          position: relative;
          z-index: 2;
        }

        .tab-active-indicator {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 2px;
          background: linear-gradient(90deg,
            transparent,
            #E8C547 30%,
            #F4D76B 50%,
            #E8C547 70%,
            transparent
          );
          border-radius: 2px;
          animation: indicator-pulse 2s ease-in-out infinite;
        }

        @keyframes indicator-pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .tab-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 80% 100% at 50% 100%,
            rgba(232, 197, 71, 0.08) 0%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .nav-tab:hover .tab-glow,
        .nav-tab.active .tab-glow {
          opacity: 1;
        }

        /* Action buttons */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1px solid transparent;
        }

        .export-btn {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.2);
          color: rgba(16, 185, 129, 0.85);
        }

        .export-btn:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.35);
          color: #10B981;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
        }

        .logout-btn {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.5);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.25);
          color: #EF4444;
        }

        /* Bottom border */
        .nav-border {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.06) 20%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.06) 80%,
            transparent 100%
          );
        }

        /* Responsive */
        @media (max-width: 900px) {
          .nav-content {
            padding: 0 20px;
          }

          .brand-text {
            display: none;
          }

          .nav-tab {
            padding: 10px 14px;
          }

          .tab-label {
            display: none;
          }

          .action-btn span {
            display: none;
          }

          .action-btn {
            padding: 10px;
          }
        }

        @media (max-width: 600px) {
          .admin-nav {
            height: 64px;
          }

          .nav-tabs {
            gap: 4px;
          }

          .nav-tab {
            padding: 8px 12px;
          }

          .nav-actions {
            gap: 6px;
          }
        }
      `}</style>
    </>
  );
}
