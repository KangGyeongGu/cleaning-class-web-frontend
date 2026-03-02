import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요").regex(/^[0-9-]+$/, "올바른 전화번호 형식이 아닙니다"),
  serviceType: z.string().min(1, "서비스 유형을 선택해주세요"),
  message: z.string().min(1, "문의 내용을 입력해주세요"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
