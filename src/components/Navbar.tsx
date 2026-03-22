"use client";

import { useState } from "react";
import { motion } from "motion/react";
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

  const handleMobileMenuClick = (targetId: string) => {
    setIsOpen(false);
    scrollToSection(targetId);
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-8">
      <div className="max-w-5xl mx-auto px-8 flex justify-between items-center">
        <button
          type="button"
          className="flex items-center gap-2 text-2xl font-black tracking-tighter text-slate-900 z-50 relative bg-transparent border-0 cursor-pointer"
          aria-label="홈으로 이동"
          onClick={scrollToTop}
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={44}
            height={44}
            className="rounded-sm"
          />
          {displayName}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.target}
                type="button"
                className="text-xs font-bold tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-transparent border-0 cursor-pointer"
                onClick={() => scrollToSection(item.target)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {(hasBlogUrl || hasInstagramUrl) && (
            <div className="flex items-center gap-5 ml-2 pl-6 border-l border-slate-200">
              {hasBlogUrl && (
                <a
                  href={blogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                >
                  블로그
                </a>
              )}
              {hasInstagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                >
                  인스타그램
                </a>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          className="md:hidden text-slate-900 z-50 relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8"
          >
            {menuItems.map((item) => (
              <button
                key={item.target}
                type="button"
                className="text-2xl font-black tracking-tighter text-slate-900 bg-transparent border-0 cursor-pointer"
                onClick={() => handleMobileMenuClick(item.target)}
              >
                {item.label}
              </button>
            ))}
            {(hasBlogUrl || hasInstagramUrl) && (
              <div className="flex items-center gap-6 mt-2 pt-6 border-t border-slate-200">
                {hasBlogUrl && (
                  <a
                    href={blogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
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
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold tracking-tight text-slate-500"
                  >
                    인스타그램
                  </a>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
