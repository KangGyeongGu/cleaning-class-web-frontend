import type { Metadata } from "next";
import { AdminSidebar } from "@/app/admin/AdminSidebar";
import { getUser } from "@/shared/lib/supabase/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface AdminLayoutProps {
  children: React.ReactNode;
}

/** 관리자 레이아웃 — getUser()로 하위 모든 /admin/* 라우트를 일괄 보호 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  await getUser();

  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar />

      <main className="pt-16 md:ml-64 md:pt-0">{children}</main>
    </div>
  );
}
