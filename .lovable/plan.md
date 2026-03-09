

## Make Blog Articles Visually Rich and Engaging

The blog pages currently render as plain text walls with minimal visual hierarchy. Here's the plan to make them look polished and magazine-quality.

---

### Changes

**1. `src/pages/BlogPost.tsx` — Visual overhaul of the article page**

- **Hero header with gradient background** — Full-width colored header band behind title/meta with a subtle gradient (using the primary color palette), giving each article a strong visual opening
- **Author avatar area** — Add a styled author chip with a small VOVV logo icon and "VOVV AI Team" text in a pill shape
- **Estimated reading progress bar** — A thin colored bar at the top of the page that fills as you scroll, adding interactivity
- **Enhanced prose styling** — Custom styles for the markdown content:
  - Styled blockquotes with a colored left border and background
  - "Key takeaway" sections (bold text starting with "Key takeaway:") get a highlighted card treatment
  - Tables get alternating row colors and rounded corners
  - H2 headings get a subtle left accent border
  - Links styled in primary color with underline on hover
  - FAQ section at the bottom gets accordion-style visual treatment
- **Floating share/bookmark sidebar** — Small sticky icons on the left (visible on desktop) for visual polish
- **Better related posts** — Cards with category badge, gradient hover effect, and proper spacing instead of simple rows
- **Upgraded CTA section** — Gradient background instead of flat color, with a subtle pattern or glow effect

**2. `src/pages/Blog.tsx` — Visual overhaul of the listing page**

- **Featured first post** — The newest post gets a larger hero-style card with a gradient background and bigger typography
- **Category filter chips** — Row of clickable category badges at the top to filter posts (client-side, using state)
- **Card visual upgrade** — Add a colored accent strip on the left edge of each card, subtle gradient on hover, and a numbered post indicator
- **Newsletter CTA** — Add a styled banner between posts encouraging readers to "Start Free" 

**3. `src/index.css` — Custom prose/blog styles**

- Add custom CSS for blog-specific styling:
  - `.blog-content blockquote` — Colored left border, muted background
  - `.blog-content h2` — Left accent border  
  - `.blog-content table` — Rounded, alternating rows
  - `.blog-content strong` containing "Key takeaway" — Highlight card
  - Reading progress bar styles

---

### Files Changed

| File | Change |
|------|--------|
| `src/pages/BlogPost.tsx` | Hero header, reading progress bar, enhanced prose wrapper, better related posts, upgraded CTA |
| `src/pages/Blog.tsx` | Featured first post, category filters, visual card upgrade, mid-page CTA |
| `src/index.css` | Blog-specific prose styles for blockquotes, tables, headings, key takeaways |

