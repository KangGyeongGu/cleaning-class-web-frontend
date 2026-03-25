import Link from "next/link";
import { Instagram } from "lucide-react";
import { CopyEmailButton } from "@/components/CopyEmailButton";
import type { SiteConfig } from "@/shared/types/database";

// 네이버블로그 아이콘 (lucide-react에 없으므로 직접 구현)
function NaverBlogIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845Z" />
    </svg>
  );
}

interface FooterProps {
  siteConfig: SiteConfig | null;
}

export function Footer({ siteConfig }: FooterProps) {
  const businessName = siteConfig?.business_name ?? "청소클라쓰";
  const phone = siteConfig?.phone ?? "";
  const email = siteConfig?.email ?? "";
  const blogUrl = siteConfig?.blog_url;
  const instagramUrl = siteConfig?.instagram_url;
  const businessRegistrationNumber = siteConfig?.business_registration_number ?? "";
  const representative = siteConfig?.representative ?? "";
  const address = siteConfig?.address ?? "";

  const hasBlogUrl = blogUrl && blogUrl.trim() !== "";
  const hasInstagramUrl = instagramUrl && instagramUrl.trim() !== "";

  return (
    <footer className="bg-white py-20 text-slate-900">
      <div className="container mx-auto px-4">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            {/* SEO-003: h2 → p 전환 (시각적 스타일 유지) */}
            <p className="mb-4 text-3xl font-black tracking-tighter">
              {businessName}
            </p>
            <ul className="space-y-1 text-sm font-light text-slate-600">
              {representative && <li>대표 {representative}</li>}
              {businessRegistrationNumber && (
                <li>사업자등록번호 {businessRegistrationNumber}</li>
              )}
              {address && <li>{address}</li>}
            </ul>
          </div>

          <div>
            <p className="mb-6 text-xs font-bold tracking-widest uppercase">
              Contact
            </p>
            <ul className="space-y-4 text-sm font-light text-slate-600">
              {phone && (
                <li>
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex min-h-11 items-center transition-colors hover:text-slate-900"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <CopyEmailButton email={email} />
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className="mb-6 text-xs font-bold tracking-widest uppercase">
              Social
            </p>
            <ul className="space-y-4 text-sm font-light text-slate-600">
              {hasBlogUrl && (
                <li>
                  <a
                    href={blogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-slate-900"
                  >
                    <NaverBlogIcon size={14} />
                    Naver Blog
                  </a>
                </li>
              )}
              {hasInstagramUrl && (
                <li>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-slate-900"
                  >
                    <Instagram size={15} />
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* 하단 링크 바: 저작권 + 개인정보처리방침 + 고객센터 중앙 정렬 */}
        <div className="flex items-center justify-center gap-0 pt-8 text-xs font-light text-slate-400">
          <span>&copy; 청소클라쓰</span>
          <span className="mx-3 select-none">|</span>
          <Link
            href="/privacy-policy"
            className="transition-colors hover:text-slate-700"
          >
            개인정보처리방침
          </Link>
          <span className="mx-3 select-none">|</span>
          <Link
            href="/contact"
            className="transition-colors hover:text-slate-700"
          >
            고객센터
          </Link>
        </div>
      </div>
    </footer>
  );
}
