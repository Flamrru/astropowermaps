"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  LogOut,
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

export default function AdminNavbar() {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin";
  };

  return (
    <nav className="admin-navbar">
      {/* Logo / Brand */}
      <div className="navbar-brand">
        <div className="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path
              d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="brand-text">AstroPower</span>
        <span className="brand-badge">Admin</span>
      </div>

      {/* Tab Navigation */}
      <div className="navbar-tabs">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href ||
            (tab.href !== "/admin/dashboard" && pathname?.startsWith(tab.href));

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`navbar-tab ${isActive ? "active" : ""}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {isActive && <span className="tab-indicator" />}
            </Link>
          );
        })}
      </div>

      {/* Actions */}
      <div className="navbar-actions">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <style jsx>{`
        .admin-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 64px;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%);
          backdrop-filter: blur(20px) saturate(150%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .admin-navbar::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(232, 197, 71, 0.3) 20%,
            rgba(232, 197, 71, 0.5) 50%,
            rgba(232, 197, 71, 0.3) 80%,
            transparent 100%
          );
        }

        /* Brand */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(232, 197, 71, 0.2) 0%, rgba(232, 197, 71, 0.05) 100%);
          border: 1px solid rgba(232, 197, 71, 0.3);
          border-radius: 8px;
          color: #E8C547;
        }

        .brand-text {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: white;
          letter-spacing: -0.02em;
        }

        .brand-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 3px 6px;
          background: rgba(168, 85, 247, 0.2);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 4px;
          color: #A855F7;
        }

        /* Tabs */
        .navbar-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
        }

        .navbar-tab {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .navbar-tab:hover {
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.05);
        }

        .navbar-tab.active {
          color: white;
          background: rgba(255, 255, 255, 0.08);
        }

        .tab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .navbar-tab.active .tab-icon {
          opacity: 1;
          color: #E8C547;
        }

        .tab-indicator {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #E8C547, transparent);
          border-radius: 1px;
        }

        /* Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(239, 68, 68, 0.8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #EF4444;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-navbar {
            padding: 0 16px;
          }

          .brand-text,
          .brand-badge {
            display: none;
          }

          .tab-label {
            display: none;
          }

          .navbar-tab {
            padding: 10px 12px;
          }

          .logout-btn span {
            display: none;
          }

          .logout-btn {
            padding: 10px;
          }
        }
      `}</style>
    </nav>
  );
}
