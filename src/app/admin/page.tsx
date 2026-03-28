import { redirect } from "next/navigation";

/** /admin 접근 시 /admin/dashboard로 리다이렉트 — 인증은 layout.tsx에서 처리 */
export default async function AdminPage(): Promise<never> {
  redirect("/admin/dashboard");
}
