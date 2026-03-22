import type { Metadata } from "next";
import { AdminSidebar } from "@/app/admin/AdminSidebar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar />

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0">{children}</main>
    </div>
  );
}
