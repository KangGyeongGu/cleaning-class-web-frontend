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

  const hasBlogUrl = blogUrl && blogUrl.trim() !== "";
  const hasInstagramUrl = instagramUrl && instagramUrl.trim() !== "";
  const hasDaangnUrl = daangnUrl && daangnUrl.trim() !== "";

  return (
    <footer className="bg-white py-20 text-slate-900">
      <div className="container mx-auto px-4">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
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
                    className="inline-flex min-h-11 items-center transition-colors hover:text-slate-900 md:min-h-0"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex min-h-11 items-center transition-colors hover:text-slate-900 md:min-h-0"
                  >
                    {email}
                  </a>
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
