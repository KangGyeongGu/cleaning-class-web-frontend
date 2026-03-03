"use server";

import { contactFormSchema } from "@/shared/lib/schema";
import { sendContactEmail } from "@/shared/lib/mail";

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

  try {
    // 이메일 전송
    await sendContactEmail({
      name: validationResult.data.name,
      phone: validationResult.data.phone,
      serviceType: validationResult.data.serviceType,
      message: validationResult.data.message,
    });

    return {
      success: true,
      message: "문의가 성공적으로 접수되었습니다.",
    };
  } catch (error) {
    console.error("Contact email send error:", error);
    return {
      success: false,
      error: "문의 접수에 실패했습니다. 전화로 연락해주세요.",
    };
  }
}
