import type { Metadata } from "next";
import { AdminSidebar } from "@/app/admin/AdminSidebar";
import { getUser } from "@/shared/lib/supabase/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await getUser();

  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar />

      <main className="pt-16 md:ml-64 md:pt-0">{children}</main>
    </div>
  );
}
