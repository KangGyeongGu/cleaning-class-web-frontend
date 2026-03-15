"use server";

import { contactFormSchema } from "@/shared/lib/schema";
import { sendContactEmail } from "@/shared/lib/mail";

const MAX_IMAGE_COUNT = 15;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function submitContactForm(
  prevState: unknown,
  formData: FormData,
) {
  const rawData = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    serviceType: formData.get("serviceType"),
    region: formData.get("region"),
    message: formData.get("message"),
  };

  const validationResult = contactFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  // 다중 이미지 첨부 처리 (병렬 버퍼 변환)
  const imageFiles = formData.getAll("images") as File[];
  const filteredImageFiles = imageFiles.filter((file) => file && file.size > 0);

  if (filteredImageFiles.length > MAX_IMAGE_COUNT) {
    return {
      success: false,
      error: `이미지는 최대 ${MAX_IMAGE_COUNT}장까지 첨부할 수 있습니다.`,
    };
  }

  for (const file of filteredImageFiles) {
    if (file.size > MAX_IMAGE_SIZE) {
      return {
        success: false,
        error: `개별 이미지 크기는 10MB를 초과할 수 없습니다. (${file.name})`,
      };
    }
  }

  try {
    const imageAttachments = await Promise.all(
      filteredImageFiles.map(async (file) => {
        const bytes = await file.arrayBuffer();
        return { filename: file.name, content: Buffer.from(bytes) };
      }),
    );

    // 이메일 전송
    await sendContactEmail({
      name: validationResult.data.name,
      phone: validationResult.data.phone,
      serviceType: validationResult.data.serviceType,
      region: validationResult.data.region,
      message: validationResult.data.message,
      images: imageAttachments.length > 0 ? imageAttachments : undefined,
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
