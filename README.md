# 청소클라쓰 프론트엔드

전주 청소업체 **청소클라쓰** 웹사이트 프론트엔드 프로젝트입니다.

## 기술 스택

| 분류 | 기술 | 설명 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | SSR/ISR/정적 생성, 라우팅 |
| UI | React 19 | 컴포넌트 기반 화면 구성 |
| 언어 | TypeScript 5 | 정적 타입 검사 |
| 스타일링 | Tailwind CSS v4 | 유틸리티 기반 CSS, `@theme` 토큰 |
| 검증 | Zod 3 | 폼 입력 검증 (클라이언트/서버 공용) |
| 애니메이션 | motion 12 | 섹션 전환 및 인터랙션 |
| 슬라이더 | react-slick | 후기 카드 캐러셀 |
| 아이콘 | lucide-react | SVG 아이콘 라이브러리 |
| 데이터베이스 | Supabase PostgreSQL | 업체 정보, 리뷰, 문의 데이터 (서울 리전) |
| 파일 저장소 | Supabase Storage | 리뷰 썸네일 이미지 |
| 인증 | Supabase Auth | 관리자 이메일/비밀번호 인증 |
| 호스팅 | AWS LightSail | 프로덕션 배포 |

## 제공 기능

| 사용자 | 기능 | 설명 |
|--------|------|------|
| 방문자 | 히어로 | 업체 소개 메시지 및 문의 CTA |
| 방문자 | 서비스 소개 | 5개 청소 서비스 카드 (거주, 정기, 특수, 쓰레기집, 상가) |
| 방문자 | 시공 후기 | 리뷰 카드 캐러셀 슬라이더, 네이버 블로그 연결 |
| 방문자 | 문의 폼 | 이름, 연락처, 서비스 유형, 메시지 입력 (Zod 검증 + Server Action) |
| 방문자 | SEO | robots.ts, sitemap.ts, Schema.org JSON-LD (LocalBusiness) |
| 관리자 | 업체 정보 수정 | 전화번호, 이메일, 블로그/인스타그램 URL 등 |
| 관리자 | 리뷰 CRUD | 썸네일 이미지, 제목, 소개글, 서비스 분류 태그 |
| 관리자 | 문의 조회 | 방문자 문의 목록, 읽음/안읽음 관리 |

## 디렉토리 구조

```text
src/
├── app/
│   ├── layout.tsx                  # 루트 레이아웃, 메타데이터, JSON-LD 주입
│   ├── page.tsx                    # 메인 페이지 (DB 데이터 패칭, ISR)
│   ├── globals.css                 # 전역 스타일, Tailwind @theme 토큰
│   ├── robots.ts                   # 검색엔진 크롤링 정책
│   ├── sitemap.ts                  # 사이트맵 생성
│   ├── error.tsx                   # 에러 바운더리 페이지
│   ├── not-found.tsx               # 404 페이지
│   │
│   ├── admin/                      # 관리자 영역
│   │   ├── layout.tsx              # 관리자 레이아웃 (사이드바, 한국어 UI)
│   │   ├── page.tsx                # 대시보드 (문의 요약, 리뷰 수)
│   │   ├── login/
│   │   │   └── page.tsx            # 로그인 페이지
│   │   ├── reviews/
│   │   │   ├── page.tsx            # 리뷰 목록 (Server Component)
│   │   │   ├── ReviewListClient.tsx  # 리뷰 목록 Client Component (드래그앤드롭)
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # 리뷰 등록
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           ├── page.tsx    # 리뷰 수정 (Server Component)
│   │   │           └── EditReviewForm.tsx  # 리뷰 수정 Client Component
│   │   └── config/
│   │       ├── page.tsx            # 업체 정보 수정 (Server Component)
│   │       └── SiteConfigForm.tsx  # 업체 정보 Client Component
│   │
│   └── auth/
│       └── callback/
│           └── route.ts            # Supabase Auth 콜백
│
├── components/
│   ├── Navbar.tsx                  # 상단 네비게이션, 모바일 메뉴
│   ├── Hero.tsx                    # 히어로 섹션
│   ├── Services.tsx                # 서비스 소개 카드 섹션
│   ├── BlogReviews.tsx             # 후기 캐러셀 슬라이더 섹션
│   ├── ContactForm.tsx             # 문의 폼 섹션
│   └── Footer.tsx                  # 푸터 섹션
│
├── shared/
│   ├── actions/
│   │   ├── contact.ts              # 문의 폼 Server Action
│   │   ├── review.ts               # 리뷰 CRUD Server Actions
│   │   ├── site-config.ts          # 업체 정보 수정 Server Action
│   │   └── auth.ts                 # 로그인/로그아웃 Server Actions
│   ├── lib/
│   │   ├── json-ld.ts              # Schema.org JSON-LD 생성
│   │   ├── schema.ts               # Zod 검증 스키마
│   │   ├── mail.ts                 # 이메일 전송 유틸리티
│   │   └── supabase/
│   │       ├── server.ts           # Server Component/Action용 클라이언트
│   │       ├── client.ts           # Client Component용 클라이언트
│   │       ├── middleware.ts       # 미들웨어 전용 클라이언트
│   │       └── storage.ts          # Supabase Storage 유틸리티
│   └── types/
│       └── database.ts             # Supabase DB 타입 정의
│
├── middleware.ts                    # /admin 경로 인증 보호
│
└── __tests__/
    ├── architecture/               # 의존성 방향 구조 테스트
    ├── seo/                        # 헤딩 계층 구조 테스트
    └── image/                      # next/image 정책 테스트

public/
└── images/
    ├── services/                   # 서비스 섹션 이미지
    └── reviews/                    # 후기 섹션 이미지
```

## 실행 방법

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm start          # 프로덕션 서버
```

## 검증 명령

```bash
npx tsc --noEmit       # 타입체크
npx eslint .           # 린트
npx vitest run         # 단위/구조 테스트
npx playwright test    # E2E 테스트
```
