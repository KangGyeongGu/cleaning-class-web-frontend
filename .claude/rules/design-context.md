## Design Context

### Users
- **Primary**: Korean homeowners (30-60 age range) seeking professional cleaning services
- **Context**: Searching on mobile (70%+) or desktop, often comparing local service providers
- **Job to be done**: Quickly assess credibility, view service offerings, and submit a quote request
- **Tech comfort**: Average — the interface must be immediately clear, no learning curve

### Brand Personality
- **3 words**: Trustworthy, Clean, Professional
- **Emotional goals**: Confidence ("these people are reliable"), Comfort ("this looks legitimate"), Clarity ("I know exactly what to do")
- **Voice**: Direct, warm, unpretentious Korean. No jargon, no hype.

### Aesthetic Direction
- **Visual tone**: Refined minimalism — generous whitespace, monochromatic slate palette, content-first
- **Theme**: Light mode only. White backgrounds, dark text, subtle gray accents
- **Anti-references**: Flashy SaaS landing pages, dark-mode dashboards, gradient-heavy designs, overly playful/toy-like interfaces
- **Photo-centric**: Before/after service images are the primary visual element. Design supports images, not competes with them.

### Design Principles
1. **Trust over novelty** — Every design choice should reinforce credibility. Avoid trendy effects that feel temporary.
2. **Content-first** — Typography and images carry the message. Decorative elements are minimal and purposeful.
3. **Restraint** — Fewer elements, done well. No gradients, no glassmorphism, no heavy shadows. Subtle borders and spacing define structure.
4. **Consistency** — Predictable grid systems, symmetric layouts, uniform spacing scale. Users should never feel lost.
5. **Performance** — CSS-only animations for LCP elements, lazy IntersectionObserver for below-fold. JS motion libraries are allowed when they provide better performance or UX than a pure CSS/IO approach (e.g. scroll-linked animations).

### Technical Constraints (DO NOT CHANGE)
- **Font**: Pretendard Variable via CDN inline (font-display: optional). Do NOT suggest alternative fonts or font pairing. Pretendard is the only font.
- **Colors**: Monochromatic slate palette (slate-900, slate-600, slate-400). No brand accent color. The absence of color IS the brand.
- **Framework**: Next.js 16 App Router + Tailwind CSS v4. All tokens defined in globals.css via `@theme inline`.
- **Images**: next/image only. Grayscale default → color on hover for service cards.
- **Animations**: CSS-only for above-fold (slideUp, fadeInScale). IntersectionObserver for below-fold. No bounce/elastic easing.
- **Layout**: Centered containers (max-w-5xl, max-w-7xl), symmetric padding, predictable grids (2/3/4 cols).
