"use client";

import { useActionState } from 'react';
import { motion } from 'motion/react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { submitContactForm } from '@/shared/actions/contact';

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, null);

  const isSuccess = state?.success === true;

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">CONTACT</h2>
            <p className="text-slate-500 font-light">
                공간에 대한 고민, 청소클라쓰가 해결해드립니다.
            </p>
        </motion.div>

        <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            action={formAction}
            className="space-y-12"
        >
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                        <label htmlFor="name" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
                            placeholder="이름을 입력하세요"
                        />
                        {state?.errors?.name && (
                            <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
                        )}
                    </div>
                    <div className="group">
                        <label htmlFor="phone" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Phone</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
                            placeholder="010-0000-0000"
                        />
                        {state?.errors?.phone && (
                            <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>
                        )}
                    </div>
                </div>

                <div className="group">
                    <label htmlFor="serviceType" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Service Type</label>
                    <div className="relative">
                         <select
                            id="serviceType"
                            name="serviceType"
                            className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light appearance-none rounded-none cursor-pointer"
                        >
                            <option>입주 청소</option>
                            <option>이사 청소</option>
                            <option>거주 청소</option>
                            <option>사무실/상가 청소</option>
                            <option>에어컨/가전 청소</option>
                            <option>기타 문의</option>
                        </select>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ArrowDown size={16} className="text-slate-400" />
                        </div>
                    </div>
                    {state?.errors?.serviceType && (
                        <p className="text-red-500 text-xs mt-1">{state.errors.serviceType[0]}</p>
                    )}
                </div>

                <div className="group">
                    <label htmlFor="message" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        rows={1}
                        className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300 resize-none overflow-hidden"
                        placeholder="문의 내용을 자유롭게 작성해주세요"
                        onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                        }}
                    ></textarea>
                    {state?.errors?.message && (
                        <p className="text-red-500 text-xs mt-1">{state.errors.message[0]}</p>
                    )}
                    
                    {/* Minimalist File Attachment */}
                    <div className="mt-8">
                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                            <div className="w-12 h-12 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-slate-900 group-hover:text-slate-900 transition-colors">
                                <Plus size={20} />
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                                이미지 첨부 (선택)
                            </span>
                            <input type="file" className="hidden" accept="image/*" multiple />
                        </label>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-12 py-4 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <span className="flex items-center gap-2 justify-center">
                            <Loader2 className="animate-spin w-4 h-4" /> SENDING...
                        </span>
                    ) : isSuccess ? (
                        <span className="flex items-center gap-2 justify-center">
                            <Check className="w-4 h-4" /> SENT
                        </span>
                    ) : (
                        'SEND MESSAGE'
                    )}
                </button>
                {state?.message && (
                    <p className="text-green-600 text-sm mt-4">{state.message}</p>
                )}
            </div>
        </motion.form>
      </div>
    </section>
  );
}

function ArrowDown({ size, className }: { size?: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m6 9 6 6 6-6"/>
        </svg>
    )
}
