

## Upgrade Blog Article Layout — Rich, Readable, Magazine-Style

The current layout renders markdown as a plain text wall with minimal visual differentiation. The screenshots show: tables render as raw pipe characters, headings blend into body text, blockquotes are barely distinct, and FAQ sections have no structure. Here's the fix:

---

### Changes

**1. `src/pages/BlogPost.tsx` — Layout & typography upgrades**

- **Larger, more dramatic hero** — Increase padding, add a decorative abstract shape/gradient orb behind the header for visual interest
- **Excerpt/subtitle** under the title — Pull `post.excerpt` into the hero as a subtitle for context
- **Table of contents sidebar** — On desktop, add a sticky left sidebar showing H2 headings extracted from content (gives visual structure and navigation)
- **Drop cap on first paragraph** — CSS class for the first `<p>` to use a large drop cap letter
- **Better ReactMarkdown components** — Use the `components` prop to override rendering of:
  - `h2` → Rendered with an emoji/icon accent, larger size, more spacing
  - `h3` → Subtle background pill or underline treatment
  - `blockquote` → Card-style with a gradient left border and icon
  - `table` → Wrapped in a styled overflow container with proper borders
  - `strong` containing "Key takeaway" → Rendered as a highlighted callout card with an icon
  - `p` containing FAQ questions (bold text ending with `?`) → Rendered as collapsible accordion items
- **Numbered section indicators** — H2s get auto-numbered (01, 02, 03...) for visual hierarchy
- **Pull quote styling** — Blockquotes get larger italic text treatment

**2. `src/index.css` — Enhanced blog styles**

- **Drop cap**: `.blog-content > p:first-of-type::first-letter` with large font size, float left, primary color
- **H2 upgrades**: Larger font, numbered counter, gradient underline instead of just left border
- **H3 upgrades**: Inline background highlight or bottom border accent
- **Blockquote upgrade**: Larger padding, gradient left border (3px → 4px gradient), slightly larger italic text, quotation mark decorative element
- **Table wrapper**: Shadow, proper rounded corners with overflow hidden, header row with primary background
- **Key takeaway cards**: Icon, colored left border, distinct background, rounded corners
- **FAQ section**: Style questions as bold with hover effect, answers with subtle indentation
- **Paragraph spacing**: More generous line-height and paragraph margins for readability
- **Code/highlight blocks**: If any inline code appears, give it a distinct pill background

**3. `src/data/blogPosts.ts` — No changes needed**

Content stays the same — the visual improvements come from better rendering and CSS.

---

### Files Changed

| File | Change |
|------|--------|
| `src/pages/BlogPost.tsx` | Custom ReactMarkdown components for h2/h3/blockquote/table/strong, drop cap class, excerpt in hero, numbered sections |
| `src/index.css` | Drop cap, enhanced h2/h3/blockquote/table/callout/FAQ styles, better spacing and typography |

