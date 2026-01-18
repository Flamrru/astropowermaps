"use client";

import AdminNavbar from "@/components/admin/AdminNavbar";
import "../dashboard/premium-dashboard.css";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LeadsPage() {
  return (
    <div className="premium-dashboard min-h-screen bg-[#0a0a0f]">
      <AdminNavbar />
      <main className="relative z-10 px-6 py-16 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-white/40" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Leads Management</h1>
          <p className="text-white/50 mb-8 max-w-md">
            View and manage all leads from the main dashboard. The leads table shows email captures, conversion status, and purchase history.
          </p>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8C547]/10 border border-[#E8C547]/20 text-[#E8C547] font-medium hover:bg-[#E8C547]/15 hover:border-[#E8C547]/30 transition-all"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
