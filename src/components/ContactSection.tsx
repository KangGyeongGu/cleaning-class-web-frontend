/**
 * ContactForm 서버 래퍼 컴포넌트
 * ContactForm은 "use client" 컴포넌트이므로 데이터 조회는 이 서버 컴포넌트에서 담당합니다.
 */
import { getSiteConfig } from "@/shared/lib/site-config";
import { ContactForm } from "@/components/ContactForm";

export async function ContactSection() {
  // 전화번호 표시를 위해 사이트 설정 조회 (React cache()로 중복 요청 방지)
  const siteConfig = await getSiteConfig();

  return <ContactForm phone={siteConfig?.phone} />;
}
