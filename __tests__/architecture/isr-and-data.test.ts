import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * 재귀적으로 디렉토리 내 특정 패턴의 파일을 찾는다
 */
function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * 파일 내용에서 import 문을 추출하여 import 경로 목록을 반환
 */
function extractImports(content: string): string[] {
  const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * (public) 디렉토리의 직계 하위 page.tsx 파일만 반환한다.
 * 동적 라우트([param])를 포함한 중첩 디렉토리는 제외한다.
 */
function findDirectPublicPages(publicDir: string): string[] {
  const results: string[] = [];

  // 루트 page.tsx
  const rootPage = join(publicDir, "page.tsx");
  try {
    statSync(rootPage);
    results.push(rootPage);
  } catch {
    // 없으면 무시
  }

  // 직계 하위 디렉토리의 page.tsx (동적 세그먼트 제외)
  const items = readdirSync(publicDir);
  for (const item of items) {
    const fullPath = join(publicDir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith("[")) {
      const pagePath = join(fullPath, "page.tsx");
      try {
        statSync(pagePath);
        results.push(pagePath);
      } catch {
        // page.tsx 없으면 무시
      }
    }
  }

  return results;
}

describe("ISR 및 데이터 패턴", () => {
  const projectRoot = process.cwd();

  it("공개 페이지는 revalidate를 export해야 한다", () => {
    const publicDir = join(projectRoot, "src/app/(public)");
    // 직계 하위 page.tsx만 수집 (동적 라우트 제외)
    const pages = findDirectPublicPages(publicDir);

    // review/[token]/page.tsx는 dynamic export를 사용하므로 제외
    const excluded = [join(publicDir, "review", "[token]", "page.tsx")];
    const targetPages = pages.filter(
      (p) => !excluded.some((ex) => p === ex)
    );

    const violations: string[] = [];

    for (const page of targetPages) {
      const content = readFileSync(page, "utf-8");
      if (!content.includes("export const revalidate")) {
        violations.push(`${page}: missing export const revalidate`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("동적 페이지는 dynamic export를 가져야 한다", () => {
    const tokenPage = join(
      projectRoot,
      "src/app/(public)/review/[token]/page.tsx"
    );

    const violations: string[] = [];

    try {
      const content = readFileSync(tokenPage, "utf-8");
      if (!content.includes("export const dynamic")) {
        violations.push(`${tokenPage}: missing export const dynamic`);
      }
    } catch {
      violations.push(`${tokenPage}: 파일을 찾을 수 없음`);
    }

    expect(violations).toEqual([]);
  });

  it("server action은 중앙화된 revalidation 패턴을 사용해야 한다", () => {
    const actionsDir = join(projectRoot, "src/shared/actions");
    const actionFiles = findFiles(actionsDir, /\.ts$/);

    const violations: string[] = [];

    for (const file of actionFiles) {
      const content = readFileSync(file, "utf-8");

      // revalidatePath 호출이 없는 파일은 검사 대상 제외
      if (!content.includes("revalidatePath(")) {
        continue;
      }

      // REVALIDATE_PATHS 상수 또는 revalidate...Paths 헬퍼 함수 패턴 확인
      const hasCentralizedPattern =
        content.includes("REVALIDATE_PATHS") ||
        /function\s+revalidate\w*Paths/.test(content);

      if (!hasCentralizedPattern) {
        violations.push(
          `${file}: revalidatePath 호출이 있으나 REVALIDATE_PATHS 상수 패턴 미사용`
        );
      }
    }

    expect(violations).toEqual([]);
  });

  it("공개 페이지에서 supabase/server를 직접 임포트하면 안 된다", () => {
    const publicDir = join(projectRoot, "src/app/(public)");
    const pages = findFiles(publicDir, /page\.tsx$/);

    const violations: string[] = [];

    for (const page of pages) {
      const content = readFileSync(page, "utf-8");
      const imports = extractImports(content);

      for (const imp of imports) {
        if (imp.includes("@/shared/lib/supabase/server")) {
          violations.push(`${page}: imports "${imp}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("(public)/layout.tsx는 revalidate를 export해야 한다", () => {
    const layoutPath = join(projectRoot, "src/app/(public)/layout.tsx");

    const violations: string[] = [];

    try {
      const content = readFileSync(layoutPath, "utf-8");
      if (!content.includes("export const revalidate")) {
        violations.push(`${layoutPath}: missing export const revalidate`);
      }
    } catch {
      violations.push(`${layoutPath}: 파일을 찾을 수 없음`);
    }

    expect(violations).toEqual([]);
  });
});
