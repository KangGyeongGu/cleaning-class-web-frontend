"use client";

import { useActionState } from "react";
import { updateSiteConfig } from "@/shared/actions/site-config";
import { Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/shared/lib/format";
import type { SiteConfig } from "@/shared/types/database";

interface SiteConfigFormProps {
  config: SiteConfig;
}

export function SiteConfigForm({ config }: SiteConfigFormProps) {
  const [state, formAction, isPending] = useActionState(updateSiteConfig, null);

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label
          htmlFor="business_name"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          업체명
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          required
          defaultValue={config.business_name}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="업체명을 입력하세요"
        />
        {state && "errors" in state && state.errors?.business_name && (
          <p className="mt-1 text-xs text-red-500">
            {state.errors.business_name[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="representative"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          대표자명 (선택)
        </label>
        <input
          id="representative"
          name="representative"
          type="text"
          defaultValue={config.representative ?? ""}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="대표자명을 입력하세요"
        />
        {state && "errors" in state && state.errors?.representative && (
          <p className="mt-1 text-xs text-red-500">
            {state.errors.representative[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="business_registration_number"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          사업자번호 (선택)
        </label>
        <input
          id="business_registration_number"
          name="business_registration_number"
          type="text"
          defaultValue={config.business_registration_number || ""}
          onInput={(e) => {
            const input = e.currentTarget;
            const digits = input.value.replace(/\D/g, "").slice(0, 10);
            if (digits.length <= 3) {
              input.value = digits;
            } else if (digits.length <= 5) {
              input.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
            } else {
              input.value = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
            }
          }}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="000-00-00000"
        />
        {state &&
          "errors" in state &&
          state.errors?.business_registration_number && (
            <p className="mt-1 text-xs text-red-500">
              {state.errors.business_registration_number[0]}
            </p>
          )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          전화번호
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={config.phone}
          onInput={(e) => {
            const input = e.currentTarget;
            input.value = formatPhoneNumber(input.value);
          }}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="000-0000-0000 또는 0000-0000-0000"
        />
        {state && "errors" in state && state.errors?.phone && (
          <p className="mt-1 text-xs text-red-500">{state.errors.phone[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={config.email}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="contact@example.com"
        />
        {state && "errors" in state && state.errors?.email && (
          <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="blog_url"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          블로그 URL (선택)
        </label>
        <input
          id="blog_url"
          name="blog_url"
          type="url"
          defaultValue={config.blog_url || ""}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="https://blog.naver.com/..."
        />
        {state && "errors" in state && state.errors?.blog_url && (
          <p className="mt-1 text-xs text-red-500">
            {state.errors.blog_url[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="instagram_url"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          인스타그램 URL (선택)
        </label>
        <input
          id="instagram_url"
          name="instagram_url"
          type="url"
          defaultValue={config.instagram_url || ""}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="https://instagram.com/..."
        />
        {state && "errors" in state && state.errors?.instagram_url && (
          <p className="mt-1 text-xs text-red-500">
            {state.errors.instagram_url[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="daangn_url"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          당근마켓 URL (선택)
        </label>
        <input
          id="daangn_url"
          name="daangn_url"
          type="url"
          defaultValue={config.daangn_url || ""}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="https://www.daangn.com/..."
        />
        {state && "errors" in state && state.errors?.daangn_url && (
          <p className="mt-1 text-xs text-red-500">
            {state.errors.daangn_url[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          소개글 (최대 500자, 선택)
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={500}
          rows={4}
          defaultValue={config.description || ""}
          className="w-full resize-none border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="업체 소개글을 입력하세요"
        ></textarea>
        {state && "errors" in state && state.errors?.description && (
          <p className="mt-1 text-xs text-red-500">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-3 block text-xs font-bold tracking-widest text-slate-900 uppercase"
        >
          주소 (선택)
        </label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={config.address || ""}
          className="w-full border-b border-slate-200 bg-transparent pb-3 text-lg font-light transition-colors outline-none placeholder:text-slate-300 focus:border-slate-900"
          placeholder="전북특별자치도 전주시 완산구 ..."
        />
        {state && "errors" in state && state.errors?.address && (
          <p className="mt-1 text-xs text-red-500">{state.errors.address[0]}</p>
        )}
      </div>

      {state && "message" in state && state.message && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      {state && "error" in state && state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-slate-900 px-8 py-4 text-sm font-bold tracking-widest text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 저장 중...
            </span>
          ) : (
            "저장"
          )}
        </button>
      </div>
    </form>
  );
}
