import { redirect } from "next/navigation";
import { getUser } from "@/shared/lib/supabase/auth";

/** /admin 접근 시 /admin/dashboard로 리다이렉트 */
export default async function AdminPage(): Promise<never> {
  await getUser();
  redirect("/admin/dashboard");
}
