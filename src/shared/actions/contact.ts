"use server";

import { contactFormSchema } from "@/shared/lib/schema";

export async function submitContactForm(prevState: unknown, formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    serviceType: formData.get("serviceType"),
    message: formData.get("message"),
  };

  const validationResult = contactFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  // Placeholder: 실제 백엔드 연동은 별도 구현
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    message: "문의가 성공적으로 접수되었습니다.",
  };
}
