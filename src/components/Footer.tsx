import type { SiteConfig } from '@/shared/types/database';

interface FooterProps {
  siteConfig: SiteConfig | null;
}

export function Footer({ siteConfig }: FooterProps) {
  const businessName = siteConfig?.business_name ?? '청소클라쓰';
  const phone = siteConfig?.phone ?? '';
  const email = siteConfig?.email ?? '';
  const blogUrl = siteConfig?.blog_url;
  const instagramUrl = siteConfig?.instagram_url;

  const hasBlogUrl = blogUrl && blogUrl.trim() !== '';
  const hasInstagramUrl = instagramUrl && instagramUrl.trim() !== '';

  return (
    <footer className="bg-white text-slate-900 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <p className="text-3xl font-black tracking-tighter mb-6">{businessName}</p>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-light">
              우리는 단순한 청소를 넘어 공간의 가치를 회복시킵니다.
              보이지 않는 곳의 디테일이 완벽한 공간을 만듭니다.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-6">Contact</p>
            <ul className="space-y-4 text-sm font-light text-slate-600">
              {phone && <li>{phone}</li>}
              {email && <li>{email}</li>}
              <li>전북 전 지역 출장 가능</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-6">Social</p>
            <ul className="space-y-4 text-sm font-light text-slate-600">
              {hasBlogUrl && (
                <li>
                  <a href={blogUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                    Naver Blog
                  </a>
                </li>
              )}
              {hasInstagramUrl && (
                <li>
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-medium">
          <p>&copy; {new Date().getFullYear()} {businessName.toUpperCase()}. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Premium Cleaning Service</p>
        </div>
      </div>
    </footer>
  );
}
