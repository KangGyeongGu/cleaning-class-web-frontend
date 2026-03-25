"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  businessName?: string;
  blogUrl?: string;
  instagramUrl?: string;
}

const menuItems = [
  { label: "서비스", target: "services" },
  { label: "후기", target: "reviews" },
  { label: "견적의뢰", target: "contact" },
];

function scrollToSection(targetId: string) {
  const element = document.getElementById(targetId);
  element?.scrollIntoView({ behavior: "smooth" });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Navbar({ businessName, blogUrl, instagramUrl }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayName = businessName ?? "청소클라쓰";

  const hasBlogUrl = blogUrl && blogUrl.trim() !== "";
  const hasInstagramUrl = instagramUrl && instagramUrl.trim() !== "";

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMobileMenuClick = (targetId: string) => {
    setIsOpen(false);
    scrollToSection(targetId);
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
    <nav className="absolute top-0 right-0 left-0 z-50 py-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-8">
        <button
          type="button"
          className="relative z-50 flex min-h-12 cursor-pointer items-center gap-2 border-0 bg-transparent text-2xl font-black tracking-tighter text-slate-900"
          aria-label="청소클라쓰 홈으로 이동"
          onClick={scrollToTop}
        >
          <Image
            src="/images/logo-small.png"
            alt=""
            width={44}
            height={44}
            sizes="44px"
            className="rounded-sm"
          />
          {displayName}
        </button>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.target}
                type="button"
                className="cursor-pointer border-0 bg-transparent text-xs font-bold tracking-widest text-slate-500 transition-colors hover:text-slate-900"
                onClick={() => scrollToSection(item.target)}
              >
                {item.label}
              </button>
            ))}
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
          className="relative z-50 flex h-12 w-12 items-center justify-center text-slate-900 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu Overlay */}
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="내비게이션 메뉴"
          aria-hidden={!isOpen}
          className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-white transition-opacity duration-200 ${
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          {menuItems.map((item) => (
            <button
              key={item.target}
              type="button"
              tabIndex={isOpen ? 0 : -1}
              className="cursor-pointer border-0 bg-transparent text-2xl font-black tracking-tighter text-slate-900"
              onClick={() => handleMobileMenuClick(item.target)}
            >
              {item.label}
            </button>
          ))}
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
      </div>
    </nav>
  );
}
