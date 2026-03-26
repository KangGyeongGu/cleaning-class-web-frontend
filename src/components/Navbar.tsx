"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  businessName?: string;
  blogUrl?: string;
  instagramUrl?: string;
}

type MenuItem =
  | { kind: "scroll"; label: string; target: string }
  | { kind: "link"; label: string; href: string };

const menuItems: MenuItem[] = [
  { kind: "scroll", label: "서비스", target: "services" },
  { kind: "scroll", label: "작업후기", target: "reviews" },
  { kind: "scroll", label: "견적문의", target: "contact" },
  { kind: "link", label: "자주묻는질문", href: "/help" },
];

/**
 * 청소클라쓰 로고 인라인 SVG 컴포넌트
 * PNG 비트맵 원본을 SVG <image> 요소로 래핑하여 next/image 의존 없이 36×36 크기 제공
 */
function LogoIcon(): React.JSX.Element {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="rounded-sm"
    >
      <image
        href="/images/logo-small.png"
        x="0"
        y="0"
        width="36"
        height="36"
      />
    </svg>
  );
}

function scrollToSection(targetId: string) {
  const element = document.getElementById(targetId);
  element?.scrollIntoView({ behavior: "smooth" });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Navbar({ businessName, blogUrl, instagramUrl }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const displayName = businessName ?? "청소클라쓰";
  const isHome = pathname === "/";

  const hasBlogUrl = blogUrl && blogUrl.trim() !== "";
  const hasInstagramUrl = instagramUrl && instagramUrl.trim() !== "";

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /** 로고 클릭 — 홈이면 스크롤 top, 다른 페이지면 홈으로 이동 */
  const handleLogoClick = (): void => {
    if (isHome) {
      scrollToTop();
    } else {
      router.push("/");
    }
  };

  /** 메뉴 클릭 — scroll 타입은 홈이면 스크롤, 다른 페이지면 해시 네비게이션 */
  const handleMenuClick = (item: MenuItem): void => {
    if (item.kind === "link") {
      router.push(item.href);
    } else if (isHome) {
      scrollToSection(item.target);
    } else {
      window.location.assign(`/#${item.target}`);
    }
  };

  const handleMobileMenuClick = (item: MenuItem): void => {
    setIsOpen(false);
    handleMenuClick(item);
  };

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!overlayRef.current) return [];
    return Array.from(
      overlayRef.current.querySelectorAll<HTMLElement>(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute("disabled"));
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const focusables = getFocusableElements();
    if (focusables.length > 0) {
      focusables[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, getFocusableElements]);

  const hasOpenedRef = useRef(false);
  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
    } else if (hasOpenedRef.current) {
      hamburgerRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <>
      <nav className="sticky top-0 right-0 left-0 z-[60] bg-white/80 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <button
            type="button"
            className="relative flex min-h-10 cursor-pointer items-center gap-2 border-0 bg-transparent text-xl font-black tracking-tighter text-slate-900"
            aria-label="청소클라쓰 홈으로 이동"
            onClick={handleLogoClick}
          >
            <LogoIcon />
            {displayName}
          </button>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-8">
              {menuItems.map((item) =>
                item.kind === "link" ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-xs font-bold tracking-widest text-slate-500 transition-colors hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    className="cursor-pointer border-0 bg-transparent text-xs font-bold tracking-widest text-slate-500 transition-colors hover:text-slate-900"
                    onClick={() => handleMenuClick(item)}
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>
            {(hasBlogUrl || hasInstagramUrl) && (
              <div className="ml-2 flex items-center gap-5 border-l border-slate-200 pl-6">
                {hasBlogUrl && (
                  <a
                    href={blogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold tracking-widest text-slate-500 transition-colors hover:text-slate-900"
                  >
                    블로그
                  </a>
                )}
                {hasInstagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold tracking-widest text-slate-500 transition-colors hover:text-slate-900"
                  >
                    인스타그램
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={hamburgerRef}
            type="button"
            aria-label="메뉴 열기/닫기"
            aria-expanded={isOpen}
            className="relative flex h-12 w-12 items-center justify-center text-slate-900 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 오버레이 — nav 외부에 배치하여 backdrop-blur 스태킹 컨텍스트 회피 */}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="내비게이션 메뉴"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-white transition-opacity duration-200 md:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {menuItems.map((item) =>
          item.kind === "link" ? (
            <Link
              key={item.label}
              href={item.href}
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-black tracking-tighter text-slate-900"
            >
              {item.label}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              tabIndex={isOpen ? 0 : -1}
              className="cursor-pointer border-0 bg-transparent text-2xl font-black tracking-tighter text-slate-900"
              onClick={() => handleMobileMenuClick(item)}
            >
              {item.label}
            </button>
          ),
        )}
        {(hasBlogUrl || hasInstagramUrl) && (
          <div className="mt-2 flex items-center gap-6 border-t border-slate-200 pt-6">
            {hasBlogUrl && (
              <a
                href={blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold tracking-tight text-slate-500"
              >
                블로그
              </a>
            )}
            {hasInstagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold tracking-tight text-slate-500"
              >
                인스타그램
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}
