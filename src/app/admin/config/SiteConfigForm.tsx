"use client";

import { useActionState } from 'react';
import { updateSiteConfig } from '@/shared/actions/site-config';
import { Loader2 } from 'lucide-react';
import type { SiteConfig } from '@/shared/types/database';

interface SiteConfigFormProps {
  config: SiteConfig;
}

export function SiteConfigForm({ config }: SiteConfigFormProps) {
  const [state, formAction, isPending] = useActionState(updateSiteConfig, null);

  return (
    <form action={formAction} className="space-y-8">
      {/* 업체명 */}
      <div>
        <label htmlFor="business_name" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          업체명
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          required
          defaultValue={config.business_name}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="업체명을 입력하세요"
        />
        {state && 'errors' in state && state.errors?.business_name && (
          <p className="text-red-500 text-xs mt-1">{state.errors.business_name[0]}</p>
        )}
      </div>

      {/* 전화번호 */}
      <div>
        <label htmlFor="phone" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          전화번호
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={config.phone}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="010-0000-0000"
        />
        {state && 'errors' in state && state.errors?.phone && (
          <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>
        )}
      </div>

      {/* 이메일 */}
      <div>
        <label htmlFor="email" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={config.email}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="contact@example.com"
        />
        {state && 'errors' in state && state.errors?.email && (
          <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
        )}
      </div>

      {/* 블로그 URL */}
      <div>
        <label htmlFor="blog_url" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          블로그 URL (선택)
        </label>
        <input
          id="blog_url"
          name="blog_url"
          type="url"
          defaultValue={config.blog_url || ''}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="https://blog.naver.com/..."
        />
        {state && 'errors' in state && state.errors?.blog_url && (
          <p className="text-red-500 text-xs mt-1">{state.errors.blog_url[0]}</p>
        )}
      </div>

      {/* 인스타그램 URL */}
      <div>
        <label htmlFor="instagram_url" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          인스타그램 URL (선택)
        </label>
        <input
          id="instagram_url"
          name="instagram_url"
          type="url"
          defaultValue={config.instagram_url || ''}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="https://instagram.com/..."
        />
        {state && 'errors' in state && state.errors?.instagram_url && (
          <p className="text-red-500 text-xs mt-1">{state.errors.instagram_url[0]}</p>
        )}
      </div>

      {/* 사이트 URL */}
      <div>
        <label htmlFor="site_url" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          사이트 URL
        </label>
        <input
          id="site_url"
          name="site_url"
          type="url"
          required
          defaultValue={config.site_url}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="https://example.com"
        />
        {state && 'errors' in state && state.errors?.site_url && (
          <p className="text-red-500 text-xs mt-1">{state.errors.site_url[0]}</p>
        )}
      </div>

      {/* 소개글 */}
      <div>
        <label htmlFor="description" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          소개글 (최대 500자, 선택)
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={500}
          rows={4}
          defaultValue={config.description || ''}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300 resize-none"
          placeholder="업체 소개글을 입력하세요"
        ></textarea>
        {state && 'errors' in state && state.errors?.description && (
          <p className="text-red-500 text-xs mt-1">{state.errors.description[0]}</p>
        )}
      </div>

      {/* 지역 */}
      <div>
        <label htmlFor="address_region" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          지역
        </label>
        <input
          id="address_region"
          name="address_region"
          type="text"
          required
          defaultValue={config.address_region}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="서울특별시"
        />
        {state && 'errors' in state && state.errors?.address_region && (
          <p className="text-red-500 text-xs mt-1">{state.errors.address_region[0]}</p>
        )}
      </div>

      {/* 도시 */}
      <div>
        <label htmlFor="address_locality" className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
          시/군/구
        </label>
        <input
          id="address_locality"
          name="address_locality"
          type="text"
          required
          defaultValue={config.address_locality}
          className="w-full pb-3 bg-transparent border-b border-slate-200 focus:border-slate-900 transition-colors outline-none text-lg font-light placeholder:text-slate-300"
          placeholder="강남구"
        />
        {state && 'errors' in state && state.errors?.address_locality && (
          <p className="text-red-500 text-xs mt-1">{state.errors.address_locality[0]}</p>
        )}
      </div>

      {/* 성공 메시지 */}
      {state && 'message' in state && state.message && (
        <p className="text-green-600 text-sm">{state.message}</p>
      )}

      {/* 에러 메시지 */}
      {state && 'error' in state && state.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      {/* 저장 버튼 */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-4 bg-slate-900 text-white font-bold text-sm tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" /> 저장 중...
            </span>
          ) : (
            '저장'
          )}
        </button>
      </div>
    </form>
  );
}
