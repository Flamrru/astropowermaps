"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import "../dashboard/premium-dashboard.css";

export default function LeadsPage() {
  const router = useRouter();

  // For now, redirect to main dashboard which has the leads table
  // This can be expanded into a dedicated leads management page later
  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="premium-dashboard min-h-screen bg-[#0a0a0f]">
      <AdminNavbar />
      <main className="relative z-10 px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    </div>
  );
}
