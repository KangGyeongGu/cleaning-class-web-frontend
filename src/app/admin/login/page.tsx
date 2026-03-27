import type { Metadata } from "next";
import { LoginForm } from "@/app/admin/login/LoginForm.client";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
