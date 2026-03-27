import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";
import eslintReact from "@eslint-react/eslint-plugin";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import vitestPlugin from "@vitest/eslint-plugin";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "legacy/**",
    "next-env.d.ts",
  ]),
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*", mode: "folder" },
        { type: "components", pattern: "src/components/*" },
        { type: "shared", pattern: "src/shared/*" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["components", "shared"] },
            { from: "components", allow: ["shared"] },
            { from: "shared", allow: ["shared"], disallow: ["app", "components"] },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          fixToUnknown: true,
          ignoreRestArgs: false,
        },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/label-has-associated-control": "error",
    },
  },
  {
    files: ["**/*.tsx"],
    ...eslintReact.configs["recommended-typescript"],
  },
  {
    files: ["__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    plugins: { vitest: vitestPlugin },
    rules: {
      "vitest/expect-expect": "error",
      "vitest/no-conditional-expect": "error",
      "vitest/no-identical-title": "error",
      "vitest/no-disabled-tests": "warn",
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/app/globals.css",
        // globals.css @layer base / @theme에 직접 정의된 커스텀 클래스
        ignore: ["scrollbar-hide", "max-w-8xl"],
      },
    },
    rules: {
      "better-tailwindcss/no-conflicting-classes": "warn",
      "better-tailwindcss/no-duplicate-classes": "warn",
      "better-tailwindcss/no-unnecessary-whitespace": "warn",
      "better-tailwindcss/no-unknown-classes": "warn",
    },
  },
  {
    plugins: { "no-relative-import-paths": noRelativeImportPaths },
    rules: {
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        {
          allowSameFolder: false,
          rootDir: "src",
          prefix: "@",
        },
      ],
    },
  },
  // 컴포넌트에서 서버 Supabase 클라이언트 직접 임포트 금지
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{
          name: "@/shared/lib/supabase/server",
          message: "컴포넌트에서 서버 Supabase 클라이언트 직접 임포트 금지 — queries/ 또는 home.ts 경유",
        }],
      }],
    },
  },
  // 클라이언트 컴포넌트에서 서버 전용 모듈 임포트 금지
  {
    files: ["**/*.client.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{
          name: "@/shared/lib/supabase/server",
          message: "클라이언트 컴포넌트에서 서버 전용 모듈 임포트 금지",
        }],
      }],
    },
  },
  // 공개 페이지에서 Supabase 직접 호출 금지 (admin 제외)
  {
    files: ["src/app/**/page.tsx"],
    ignores: ["src/app/admin/**"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{
          name: "@/shared/lib/supabase/server",
          message: "공개 페이지에서 Supabase 직접 호출 금지 — queries/ 또는 home.ts 경유",
        }],
      }],
    },
  },
]);

export default eslintConfig;
