# Blog Posts — Content Audit & Reading-Quality Fix

## What I found

I scanned all **7 blog posts** in `src/data/blogPosts.ts`. The screenshot you sent (a long run-on paragraph starting with `| Parameter | Options | Example |`) is not a content typo — it's a **rendering bug** that affects every table in every post.

### Root cause: missing `remark-gfm` plugin

`src/pages/BlogPost.tsx` renders content with `<ReactMarkdown components={...}>` but does **not** pass `remarkPlugins={[remarkGfm]}`. Vanilla `react-markdown` follows CommonMark, which has **no table syntax** — so any `| col | col |` line is treated as plain inline text and collapses into the previous paragraph. The custom `table` component in `markdownComponents` is wired up but never receives any nodes, because the parser never produces them.

This silently breaks **45 lines of table content across the posts** — exactly what you saw.

GFM also unlocks: `~~strikethrough~~`, task lists `- [ ]`, and bare URL autolinks. Currently all silently inert.

### Where tables actually appear (all currently rendering as gibberish)
1. **brand-consistency-ai-generated-visuals** — "What you define" parameter table (the one in your screenshot), plus a Brand Profile checklist.
2. **automated-product-listing-images-at-scale** — comparison/options tables.
3. **ecommerce-visual-content-strategy-2026** — strategy comparison tables.
4. **virtual-try-on-technology-fashion-brands** — return-rate/metrics table.
5. **ai-model-photography-diverse-representation** — diversity/conversion table.
6. **ai-product-photography-for-ecommerce** — cost/time comparison table.
7. **ai-product-photography-examples-gallery** — uses lists, no critical table.

### Secondary content issues (real but minor)

7 spots where a list starts immediately after a bold line ("Days 1–30: Foundation", "You have three options:", etc.) without a blank line between. CommonMark is forgiving here but react-markdown sometimes glues them into one paragraph. Fixing them improves rhythm and is trivial.

| Post | Lines |
|---|---|
| ecommerce-visual-content-strategy-2026 | 17, 89, 95, 100 |
| automated-product-listing-images-at-scale | 30 |
| brand-consistency-ai-generated-visuals | 62, 79 |

### Things I checked and did **not** find
- No stray H1s inside content (the page renders the title separately — good).
- No unbalanced code fences.
- No raw HTML tags injected into markdown.
- No broken image URLs.
- No oversized image alt text.
- No "key takeaway" callouts misformatted.

## Plan

### Step 1 — Fix the table rendering (root cause, 1 install + 2 lines of code)
- Install `remark-gfm`.
- In `src/pages/BlogPost.tsx`:
  - `import remarkGfm from 'remark-gfm';`
  - Pass it to ReactMarkdown: `<ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>`
- This single change makes **all 45 broken table lines render correctly** using the editorial table styles I already shipped (`.blog-table-wrapper`, foreground/[0.04] header, etc.). No content edits needed.

### Step 2 — Tidy the 7 list-spacing snags
Add a single blank line before each affected list in `src/data/blogPosts.ts`. Quick, safe, no copy changes.

### Step 3 — Visual QA pass on all 7 posts
After Steps 1 & 2 ship, walk through each post in the preview:
- Confirm every table renders with the editorial styling (header, rows, hover).
- Confirm headings, callouts, blockquotes, images, and lists flow correctly.
- Mobile (≤440px) check: tables scroll horizontally inside `.blog-table-wrapper` (already handled with `overflow: hidden` + the wrapper — will verify it's actually `overflow-x: auto` on mobile and patch if needed).

### Step 4 — One small CSS hardening
The current `.blog-table-wrapper` uses `overflow: hidden`, which can clip wide tables on mobile. Change to `overflow-x: auto` so wide tables scroll instead of clipping. Matches the editorial pattern and prevents future content from breaking the layout.

## Files to change

- `package.json` (add `remark-gfm` dependency)
- `src/pages/BlogPost.tsx` (1 import + 1 prop)
- `src/data/blogPosts.ts` (insert 7 blank lines)
- `src/index.css` (one-line change: `overflow: hidden` → `overflow-x: auto` on `.blog-table-wrapper`)

## Out of scope
- Rewriting any post copy, restructuring sections, adding new posts, or changing SEO meta. The audit didn't surface editorial issues — only rendering bugs. The content itself is solid.
