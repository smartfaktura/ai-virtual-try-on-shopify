

## Center the Blog Content and Improve Readability

The problem: the TOC sidebar pushes content off-center, leaving a large blank space on the right. The content area is too wide and text feels cramped. 

### Changes

**`src/pages/BlogPost.tsx`**

- **Remove the side-by-side flex layout** — Drop the `flex gap-12` wrapper that creates the sidebar + content split
- **Center the content** in a single `max-w-[720px] mx-auto` column (optimal reading width ~65-75 chars per line)
- **Move TOC inline** — Convert the sidebar TOC into a compact horizontal pill bar or a collapsible section just below the hero, before the content starts (only on desktop, still shows section numbers)
- **Increase prose font size** — Bump body text to `text-lg` (1.125rem) with generous `leading-relaxed` (1.75 line-height)
- **Add more vertical breathing room** — Larger margins between sections (H2 gets `mt-14 mb-6`, paragraphs get `mb-6`)
- **Bigger, bolder H2s** — Increase to `text-2xl sm:text-3xl` with more top margin so sections feel distinct
- **H3 more distinct** — Increase size and add top margin

**`src/index.css`**

- **Increase paragraph font size and spacing** in `.blog-content p` — `font-size: 1.125rem`, `line-height: 1.85`, `margin-bottom: 1.5rem`
- **Larger H2** — `font-size: 1.75rem` with `margin-top: 3.5rem` and `margin-bottom: 1.5rem`
- **H3** — `font-size: 1.375rem` with `margin-top: 2.5rem`
- **List items** — Larger text, more spacing between items
- **Blockquote** — Larger text (`1.125rem`), more padding
- **Drop cap** — Keep but refine sizing

### Files Changed

| File | Change |
|------|--------|
| `src/pages/BlogPost.tsx` | Remove sidebar flex layout, center content in narrow column, move TOC inline above content |
| `src/index.css` | Increase font sizes, line heights, and spacing for better readability |

