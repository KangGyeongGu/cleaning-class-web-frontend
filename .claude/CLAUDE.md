# 청소클라쓰 프론트엔드

## 기술 스택
- Next.js 16 App Router, TypeScript strict, Tailwind CSS v4
- Supabase (@supabase/ssr), Zod, nodemailer
- Vitest + MSW, Playwright (E2E)

## 프로젝트 구조
- `src/app/` — 라우팅 & 페이지 조합 전용
- `src/components/` — 렌더링 로직 (홈페이지 섹션 등)
- `src/app/admin/` — 관리자 CRUD 페이지
- `src/shared/` — 유틸, server actions, 타입, 스키마, Supabase 클라이언트

## 검증 명령
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npx eslint .` — 린트
- `npx tsc --noEmit` — 타입체크
- `npx vitest run` — 단위/구조 테스트
- `npx playwright test` — E2E 테스트 (수동)

## 워크플로우
- 항상 한국어로 응답
- 계획 수립: `/w-plan`
- 구현 실행: `/w-develop`
- 감사: `/w-audit`
- 기계적 검증만: `/w-verify`
- 에이전트 시스템 상세: `agent-system.md`

## Git 컨벤션
- 형식: `<type>(<scope>): <subject>` (Conventional Commits)
- subject: 한국어, 50자 이하, 마침표 없음
- Co-Authored-By 라인 포함 금지
- 예: `feat(hero): 히어로 섹션 next/image 전환 및 LCP 최적화`

## 코딩 규칙
- `any` 타입 사용 금지 — `unknown` + 타입 가드 사용
- `@/` 절대 경로 alias 강제
- 폼 검증은 Zod 스키마 + server actions 조합
- `use client` 범위는 최소 단위로 유지
- `next/image` 사용 강제 (`<img>` 태그 금지)
