"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  LayoutDashboard,
  Layers,
  Image,
  Settings,
  LogOut,
  ExternalLink,
  HelpCircle,
  Star,
} from "lucide-react";
import { logout } from "@/shared/actions/auth";

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/services", label: "서비스 관리", icon: Layers },
  { href: "/admin/reviews", label: "리뷰 관리", icon: Image },
  { href: "/admin/customer-reviews", label: "고객리뷰 관리", icon: Star },
  { href: "/admin/faq", label: "FAQ 관리", icon: HelpCircle },
  { href: "/admin/config", label: "업체 정보", icon: Settings },
];

const navItemBase =
  "flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest transition-colors";
const navItemActive = "bg-slate-100 text-slate-900";
const navItemInactive = "text-slate-500 hover:bg-slate-50 hover:text-slate-900";

export function AdminSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-40 border-b border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="text-xl font-black text-slate-900">
            청소클라쓰 관리자
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-900"
            aria-label={isSidebarOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <aside className="fixed top-0 left-0 hidden h-screen w-64 border-r border-slate-200 bg-white md:block">
        <div className="p-8">
          <div className="mb-12 text-2xl font-black text-slate-900">
            청소클라쓰
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${navItemBase} ${isActive ? navItemActive : navItemInactive}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-8 space-y-1 border-t border-slate-200 pt-4">
              <Link
                href="/"
                target="_blank"
                className={`${navItemBase} ${navItemInactive}`}
              >
                <ExternalLink size={18} />
                홈페이지
              </Link>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className={`w-full ${navItemBase} ${navItemInactive}`}
                >
                  <LogOut size={18} />
                  로그아웃
                </button>
              </form>
            </div>
          </nav>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-white md:hidden">
          <nav className="space-y-2 px-4 pt-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`${navItemBase} ${isActive ? navItemActive : navItemInactive}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-8 space-y-1 border-t border-slate-200 pt-4">
              <Link
                href="/"
                target="_blank"
                onClick={() => setIsSidebarOpen(false)}
                className={`${navItemBase} ${navItemInactive}`}
              >
                <ExternalLink size={18} />
                홈페이지
              </Link>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className={`w-full ${navItemBase} ${navItemInactive}`}
                >
                  <LogOut size={18} />
                  로그아웃
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
