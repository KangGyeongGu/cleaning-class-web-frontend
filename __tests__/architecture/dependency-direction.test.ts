import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * 재귀적으로 디렉토리 내 모든 .ts/.tsx 파일을 찾는다
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

describe("의존성 방향", () => {
  const projectRoot = process.cwd();

  it("components는 app을 import할 수 없다", () => {
    const componentsDir = join(projectRoot, "src/components");
    const componentFiles = findFiles(componentsDir, /\.(ts|tsx)$/);

    const violations: string[] = [];

    for (const file of componentFiles) {
      const content = readFileSync(file, "utf-8");
      const imports = extractImports(content);

      for (const imp of imports) {
        // @/app 또는 ../app 형태로 app을 import하는지 확인
        if (
          imp.includes("@/app") ||
          imp.includes("../app") ||
          imp.includes("../../app")
        ) {
          violations.push(`${file}: imports "${imp}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("shared는 app/components를 import할 수 없다", () => {
    const sharedDir = join(projectRoot, "src/shared");

    // shared 디렉토리가 아직 없을 수 있으므로 존재 여부 확인
    try {
      statSync(sharedDir);
    } catch {
      // shared 디렉토리가 없으면 테스트 통과
      return;
    }

    const sharedFiles = findFiles(sharedDir, /\.(ts|tsx)$/);
    const violations: string[] = [];

    for (const file of sharedFiles) {
      const content = readFileSync(file, "utf-8");
      const imports = extractImports(content);

      for (const imp of imports) {
        if (
          imp.includes("@/app") ||
          imp.includes("@/components") ||
          imp.includes("../app") ||
          imp.includes("../components") ||
          imp.includes("../../app") ||
          imp.includes("../../components")
        ) {
          violations.push(`${file}: imports "${imp}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
