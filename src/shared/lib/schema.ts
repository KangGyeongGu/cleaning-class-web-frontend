import { z } from "zod";

// 견적문의 폼 스키마
export const contactFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z
    .string()
    .min(1, "연락처를 입력해주세요")
    .regex(/^[0-9-]+$/, "올바른 전화번호 형식이 아닙니다"),
  serviceType: z.string().min(1, "서비스 유형을 선택해주세요"),
  region: z.string().min(1, "지역을 선택해주세요"),
  message: z
    .string()
    .min(1, "문의 내용을 입력해주세요")
    .max(1000, "문의 내용은 1000자 이하로 작성해주세요"),
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
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 100자 이하여야 합니다"),
  summary: z
    .string()
    .min(1, "소개글을 입력해주세요")
    .max(500, "소개글은 500자 이하여야 합니다"),
  tags: z.array(z.string()).min(1, "최소 1개 이상의 태그를 입력해주세요"),
  link_url: z
    .string()
    .url("올바른 URL 형식이 아닙니다")
    .refine((url) => /^https?:\/\//i.test(url), {
      message: "URL은 http:// 또는 https://로 시작해야 합니다",
    })
    .or(z.literal(""))
    .optional(),
  sort_order: z
    .number()
    .int("정렬 순서는 정수여야 합니다")
    .min(0, "정렬 순서는 0 이상이어야 합니다"),
  is_published: z.boolean(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

// 한국 전화번호 형식 정규식
// 허용 패턴: 02-XXXX-XXXX, 010-XXXX-XXXX, 031-XXX-XXXX, 0504-XXXX-XXXX 등
const PHONE_REGEX =
  /^(02|01[016-9]|0[3-9]\d{1,2})-\d{3,4}-\d{4}$|^0[5-9]0[4-9]-\d{4}-\d{4}$/;

// 업체 정보 폼 스키마
const BUSINESS_NUMBER_REGEX = /^\d{3}-\d{2}-\d{5}$/;

export const siteConfigFormSchema = z.object({
  business_name: z.string().min(1, "업체명을 입력해주세요"),
  representative: z
    .string()
    .max(50, "대표자명은 50자 이하여야 합니다")
    .optional()
    .default(""),
  business_registration_number: z
    .string()
    .optional()
    .default("")
    .refine((v) => v === "" || BUSINESS_NUMBER_REGEX.test(v), {
      message: "올바른 사업자번호 형식이 아닙니다 (예: 000-00-00000)",
    }),
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요")
    .regex(
      PHONE_REGEX,
      "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678, 02-1234-5678)",
    ),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  blog_url: z
    .string()
    .url("올바른 URL 형식이 아닙니다")
    .refine((url) => /^https?:\/\//i.test(url), {
      message: "URL은 http:// 또는 https://로 시작해야 합니다",
    })
    .or(z.literal("")),
  instagram_url: z
    .string()
    .url("올바른 URL 형식이 아닙니다")
    .refine((url) => /^https?:\/\//i.test(url), {
      message: "URL은 http:// 또는 https://로 시작해야 합니다",
    })
    .or(z.literal("")),
  daangn_url: z
    .string()
    .url("올바른 URL 형식이 아닙니다")
    .refine((url) => /^https?:\/\//i.test(url), {
      message: "URL은 http:// 또는 https://로 시작해야 합니다",
    })
    .or(z.literal("")),
  site_url: z
    .string()
    .url("올바른 URL 형식이 아닙니다")
    .refine((url) => /^https?:\/\//i.test(url), {
      message: "URL은 http:// 또는 https://로 시작해야 합니다",
    }),
  description: z.string().max(500, "설명은 500자 이하여야 합니다").optional(),
  address_region: z.string().optional().default(""),
  address_locality: z.string().optional().default(""),
  address: z.string().max(200, "주소는 200자 이하여야 합니다").optional(),
});

export type SiteConfigFormData = z.infer<typeof siteConfigFormSchema>;

// 서비스 폼 스키마
export const serviceFormSchema = z.object({
  title: z
    .string()
    .min(1, "서비스명을 입력해주세요")
    .max(50, "서비스명은 50자 이하여야 합니다"),
  // description 대신 tags 배열로 전환: 서비스 특성 태그 최소 1개 필요
  tags: z.array(z.string()).min(1, "최소 1개 이상의 태그를 입력해주세요"),
  sort_order: z
    .number()
    .int("정렬 순서는 정수여야 합니다")
    .min(0, "정렬 순서는 0 이상이어야 합니다"),
  is_published: z.boolean(),
  image_focal_x: z.number().int().min(0).max(100).default(50),
  image_focal_y: z.number().int().min(0).max(100).default(50),
  image_after_focal_x: z.number().int().min(0).max(100).default(50),
  image_after_focal_y: z.number().int().min(0).max(100).default(50),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;

// FAQ 폼 스키마
export const faqFormSchema = z.object({
  question: z
    .string()
    .min(1, "질문을 입력해주세요")
    .max(300, "질문은 300자 이하여야 합니다"),
  answer: z
    .string()
    .min(1, "답변을 입력해주세요")
    .max(2000, "답변은 2000자 이하여야 합니다"),
  display_order: z
    .number()
    .int("표시 순서는 정수여야 합니다")
    .min(0, "표시 순서는 0 이상이어야 합니다"),
  is_active: z.boolean(),
});

export type FaqFormData = z.infer<typeof faqFormSchema>;
