"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-8">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <button type="button" className="text-2xl font-black tracking-tighter text-slate-900 z-50 relative bg-transparent border-0 cursor-pointer" aria-label="홈으로 이동">
          청소클라쓰
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-12">
          {['HOME', 'SERVICE', 'REVIEW'].map((item) => (
            <button key={item} type="button" className="text-xs font-bold tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-transparent border-0 cursor-pointer">
              {item}
            </button>
          ))}
          <button type="button" className="px-6 py-2 border border-slate-900 text-slate-900 text-xs font-bold tracking-widest hover:bg-slate-900 hover:text-white transition-colors">
            CONTACT
          </button>
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
                {['HOME', 'SERVICE', 'REVIEW'].map((item) => (
                    <button key={item} type="button" className="text-2xl font-black tracking-tighter text-slate-900 bg-transparent border-0 cursor-pointer" onClick={() => setIsOpen(false)}>
                        {item}
                    </button>
                ))}
                <button type="button" className="px-8 py-3 border border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
                    CONTACT
                </button>
            </motion.div>
        )}
      </div>
    </nav>
  );
}
