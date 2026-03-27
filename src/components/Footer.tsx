import Link from "next/link";

import type { SiteConfig } from "@/shared/types/database";
import {
  NaverBlogIcon,
  InstagramIcon,
  DaangnIcon,
} from "@/components/icons/SocialIcons";

interface FooterProps {
  siteConfig: SiteConfig | null;
}

export function Footer({ siteConfig }: FooterProps) {
  const businessName = siteConfig?.business_name ?? "청소클라쓰";
  const phone = siteConfig?.phone ?? "";
  const email = siteConfig?.email ?? "";
  const blogUrl = siteConfig?.blog_url;
  const instagramUrl = siteConfig?.instagram_url;
  const daangnUrl = siteConfig?.daangn_url;
  const businessRegistrationNumber =
    siteConfig?.business_registration_number ?? "";
  const representative = siteConfig?.representative ?? "";
  const address = siteConfig?.address ?? "";

  // moving_representative 존재 여부로 이사 섹션 표시 결정
  const movingRepresentative = siteConfig?.moving_representative ?? "";
  const movingPhone = siteConfig?.moving_phone ?? "";
  const movingBusinessRegistrationNumber =
    siteConfig?.moving_business_registration_number ?? "";
  const movingAddress = siteConfig?.moving_address ?? "";
  const hasMovingInfo = movingRepresentative.trim() !== "";

  const hasBlogUrl = blogUrl && blogUrl.trim() !== "";
  const hasInstagramUrl = instagramUrl && instagramUrl.trim() !== "";
  const hasDaangnUrl = daangnUrl && daangnUrl.trim() !== "";

  return (
    <footer className="bg-white py-20 text-slate-900">
      <div className="container mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-[2fr_3fr_2fr]">
          <div>
            <p className="text-heading-1 tracking-tighter">{businessName}</p>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-8">
            <p className="text-label text-slate-900">Contact</p>
            <div>
              <div className="mb-5">
                <p className="mb-1.5 text-sm font-bold text-slate-900">청소</p>
                <ul className="space-y-0.5 text-sm font-light text-slate-600">
                  {representative && <li>대표 {representative}</li>}
                  {businessRegistrationNumber && (
                    <li>사업자등록번호 {businessRegistrationNumber}</li>
                  )}
                  {phone && (
                    <li>
                      <a
                        href={`tel:${phone}`}
                        className="transition-colors hover:text-slate-900"
                      >
                        {phone}
                      </a>
                    </li>
                  )}
                  {email && (
                    <li>
                      <a
                        href={`mailto:${email}`}
                        className="transition-colors hover:text-slate-900"
                      >
                        {email}
                      </a>
                    </li>
                  )}
                  {address && <li>{address}</li>}
                </ul>
              </div>

              {hasMovingInfo && (
                <div>
                  <p className="mb-1.5 text-sm font-bold text-slate-900">
                    이사
                  </p>
                  <ul className="space-y-0.5 text-sm font-light text-slate-600">
                    <li>대표 {movingRepresentative}</li>
                    {movingBusinessRegistrationNumber && (
                      <li>사업자등록번호 {movingBusinessRegistrationNumber}</li>
                    )}
                    {movingPhone && (
                      <li>
                        <a
                          href={`tel:${movingPhone}`}
                          className="transition-colors hover:text-slate-900"
                        >
                          {movingPhone}
                        </a>
                      </li>
                    )}
                    {movingAddress && <li>{movingAddress}</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-x-8">
            <p className="text-label text-slate-900">Social</p>
            <ul className="space-y-3 text-sm font-light text-slate-600">
              {hasBlogUrl && (
                <li>
                  <a
                    href={blogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-slate-900 md:min-h-0"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      <NaverBlogIcon size={16} />
                    </span>
                    블로그
                  </a>
                </li>
              )}
              {hasInstagramUrl && (
                <li>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-slate-900 md:min-h-0"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      <InstagramIcon size={16} />
                    </span>
                    인스타그램
                  </a>
                </li>
              )}
              {hasDaangnUrl && (
                <li>
                  <a
                    href={daangnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-slate-900 md:min-h-0"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      <DaangnIcon size={16} />
                    </span>
                    당근
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center gap-0 pt-8 text-xs font-light text-slate-400">
          <span>&copy; 청소클라쓰</span>
          <span className="mx-3 select-none">|</span>
          <Link
            href="/policy/privacy"
            className="transition-colors hover:text-slate-700"
          >
            개인정보처리방침
          </Link>
          <span className="mx-3 select-none">|</span>
          <Link
            href="/policy/terms"
            className="transition-colors hover:text-slate-700"
          >
            이용약관
          </Link>
          <span className="mx-3 select-none">|</span>
          <Link href="/help" className="transition-colors hover:text-slate-700">
            고객센터
          </Link>
        </div>
      </div>
    </footer>
  );
}
