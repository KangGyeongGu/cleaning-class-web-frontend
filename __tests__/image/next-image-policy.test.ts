import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * 재귀적으로 디렉토리 내 모든 .tsx 파일을 찾는다
 */
function findTsxFiles(dir: string): string[] {
  const results: string[] = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...findTsxFiles(fullPath));
    } else if (fullPath.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }

  return results;
}

describe("next/image 정책", () => {
  const projectRoot = process.cwd();
  const componentsDir = join(projectRoot, "src/components");

  it("src/components 내 모든 tsx 파일에서 native <img> 태그를 사용하지 않는다", () => {
    const tsxFiles = findTsxFiles(componentsDir);
    const violations: string[] = [];

    for (const file of tsxFiles) {
      const content = readFileSync(file, "utf-8");

      // <img 태그 검출 (단, next/image의 Image 컴포넌트는 제외)
      // eslint-disable 주석으로 허용된 <img>는 예외 (blob URL 미리보기 등)
      const lines = content.split("\n");
      let hasViolation = false;

      for (let i = 0; i < lines.length; i++) {
        if (/<img\s+[^>]*>/.test(lines[i])) {
          // 바로 윗줄에 eslint-disable 주석이 있으면 허용
          const prevLine = i > 0 ? lines[i - 1] : "";
          if (!prevLine.includes("eslint-disable")) {
            hasViolation = true;
            break;
          }
        }
      }

      if (hasViolation) {
        violations.push(`${file}: native <img> 태그 사용 감지`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("next/image의 fill 사용 시 sizes 속성이 필수로 지정된다", () => {
    const tsxFiles = findTsxFiles(componentsDir);
    const violations: string[] = [];

    for (const file of tsxFiles) {
      const content = readFileSync(file, "utf-8");

      // <Image ... fill ...> 패턴에서 sizes가 있는지 확인
      // fill과 sizes를 모두 포함하는 Image 태그를 찾는다
      const imageWithFillRegex = /<Image[^>]*\bfill\b[^>]*>/g;
      const matches = content.match(imageWithFillRegex);

      if (matches) {
        for (const match of matches) {
          // sizes 속성이 없으면 위반
          if (!match.includes("sizes=")) {
            violations.push(`${file}: <Image fill> 사용 시 sizes 속성 누락`);
            break; // 파일당 한 번만 기록
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("unsplash.com URL이 코드 내에 존재하지 않는다", () => {
    const tsxFiles = findTsxFiles(componentsDir);
    const violations: string[] = [];

    for (const file of tsxFiles) {
      const content = readFileSync(file, "utf-8");

      if (content.includes("unsplash.com")) {
        violations.push(`${file}: unsplash.com URL 사용 감지`);
      }
    }

    expect(violations).toEqual([]);
  });
});
