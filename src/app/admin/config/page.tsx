import type { Metadata } from "next";
import { getSiteConfig } from "@/shared/lib/site-config";
import { SiteConfigForm } from "@/app/admin/config/SiteConfigForm";

export const metadata: Metadata = {
  title: "업체 정보",
  robots: { index: false, follow: false },
};

export default async function SiteConfigPage() {
  const config = await getSiteConfig();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">업체 정보</h1>
      {!config ? (
        <div className="border border-slate-200 p-12 text-center">
          <p className="text-slate-500 font-light">
            업체 정보를 불러올 수 없습니다.
          </p>
        </div>
      ) : (
        <SiteConfigForm config={config} />
      )}
    </div>
  );
}
