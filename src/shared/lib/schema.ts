import { z } from "zod";

// 견적문의 폼 스키마
export const contactFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "연락처를 입력해주세요").regex(/^[0-9-]+$/, "올바른 전화번호 형식이 아닙니다"),
  serviceType: z.string().min(1, "서비스 유형을 선택해주세요"),
  message: z.string().min(1, "문의 내용을 입력해주세요"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// 관리자 로그인 폼 스키마
export const loginFormSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// 리뷰 폼 스키마
export const reviewFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 100자 이하여야 합니다"),
  summary: z.string().min(1, "소개글을 입력해주세요").max(200, "소개글은 200자 이하여야 합니다"),
  tags: z.array(z.string()).min(1, "최소 1개 이상의 태그를 입력해주세요"),
  sort_order: z.number().int("정렬 순서는 정수여야 합니다").min(0, "정렬 순서는 0 이상이어야 합니다"),
  is_published: z.boolean(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

// 업체 정보 폼 스키마
export const siteConfigFormSchema = z.object({
  business_name: z.string().min(1, "업체명을 입력해주세요"),
  phone: z.string().min(1, "전화번호를 입력해주세요"),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  blog_url: z.string().url("올바른 URL 형식이 아닙니다").or(z.literal("")),
  instagram_url: z.string().url("올바른 URL 형식이 아닙니다").or(z.literal("")),
  site_url: z.string().url("올바른 URL 형식이 아닙니다"),
  description: z.string().max(500, "설명은 500자 이하여야 합니다").optional(),
  address_region: z.string().min(1, "지역을 입력해주세요"),
  address_locality: z.string().min(1, "시/군/구를 입력해주세요"),
});

export type SiteConfigFormData = z.infer<typeof siteConfigFormSchema>;
