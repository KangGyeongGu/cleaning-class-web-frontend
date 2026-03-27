# 청소클라쓰 프론트엔드

전주 청소업체 청소·이사 업체 청소클라쓰 마케팅 웹사이트

## 기술 스택

- **Framework** — Next.js 16 (App Router), React 19, TypeScript 5
- **Styling** — Tailwind CSS v4
- **BaaS** — Supabase (PostgreSQL, Auth, Storage)
- **Validation** — Zod 3
- **Email** — nodemailer
- **Testing** — Vitest, Playwright
- **Deploy** — AWS LightSail (standalone)

## 설계

### ISR

공개 페이지 ISR(Incremental Static Regeneration) 기반 구현

- Supabase에서 데이터를 가져와 정적으로 빌드하고, 일정 주기마다 백그라운드에서 재생성
- 인증이 필요 없는 읽기 전용 Supabase 클라이언트를 사용하여 `cookies()` 호출 없이 정적 경로 유지

### BaaS

데이터 레이어는 Supabase BaaS 기반 운영

- **데이터베이스** — Supabase PostgreSQL
- **파일 저장소** — Supabase Storage (리뷰 썸네일 이미지)
- **인증** — Supabase Auth (관리자 이메일/비밀번호), 미들웨어에서 세션 확인
- **데이터 변경** — Next.js Server Actions, 모든 입력은 Zod 스키마로 검증

## 라이선스

Private — All rights reserved.
