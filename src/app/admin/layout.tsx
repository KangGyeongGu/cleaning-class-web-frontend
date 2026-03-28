import { headers } from "next/headers";
import type { Metadata } from "next";
import { AdminSidebar } from "@/app/admin/AdminSidebar";
import { getUser } from "@/shared/lib/supabase/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // 로그인 페이지는 미인증 사용자가 접근해야 하므로 인증 게이트 제외
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isLoginPage = pathname === "/admin/login";

  if (!isLoginPage) {
    await getUser();
  }

  if (isLoginPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar />
      <main className="pt-16 md:ml-64 md:pt-0">{children}</main>
    </div>
  );
}
