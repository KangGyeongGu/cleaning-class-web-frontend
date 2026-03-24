---
globs:
  - "src/app/**/*.ts"
  - "src/app/**/*.tsx"
  - "src/shared/lib/**"
---

# SEO Rules

- `app/robots.ts` and `app/sitemap.ts` must always exist and be correct.
- Generate Schema.org JSON-LD in `src/shared/lib/json-ld.ts`; inject in page or layout via `<script type="application/ld+json">`.
- Use LocalBusiness schema for 청소클라쓰 structured data.
- One `h1` per page. Maintain `h1 → h2 → h3` heading order — never skip levels.
- Never replace heading roles with styled `div` elements.
- Use semantic tags (`section`, `footer`, `nav`, `main`) over generic containers.
- `title.template` pattern: `'%s | 청소클라쓰'`
- Description metadata must be ≤ 150 characters.
- Every page must have Open Graph (`og:title`, `og:description`, `og:image`) and Twitter Card metadata.
