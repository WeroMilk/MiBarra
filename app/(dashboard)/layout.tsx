"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/Auth/AuthGuard";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import DashboardFooter from "@/components/Dashboard/DashboardFooter";
import { notificationsService } from "@/lib/movements";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notificationsService.getUnreadCount());
    const handler = () => setUnreadCount(notificationsService.getUnreadCount());
    window.addEventListener("mibarra-notifications-update", handler);
    return () => window.removeEventListener("mibarra-notifications-update", handler);
  }, []);

  return (
    <AuthGuard>
      <div className="h-screen bg-apple-bg flex flex-col overflow-hidden">
        <DashboardHeader notificationsCount={unreadCount} />
        <main className="flex-1 min-h-0 overflow-hidden">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </AuthGuard>
  );
}
