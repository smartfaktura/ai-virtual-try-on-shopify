# Blog Post — Editorial Aesthetic Refinement

The article container (`/blog/:slug`) currently mixes the new cream hero with **legacy blue-accented prose** (blue drop cap, blue numbered H2 underline, blue pill H3, blue blockquote, blue callouts, blue table headers, blue list markers). It looks loud and inconsistent with the rest of the site's "luxury restraint" cream/charcoal aesthetic.

This plan tunes the in-article typography and small UI moments so the reading experience feels like a premium magazine — quiet, confident, content-first.

## Scope

Files to edit:
- `src/index.css` — `.blog-content` / `.blog-h2-numbered` / `.blog-h3-pill` / `.blog-blockquote` / `.blog-callout` / `.blog-table-wrapper` and friends
- `src/pages/BlogPost.tsx` — hero polish, TOC chrome, related cards, mobile spacing
- `src/components/app/BlogMarkdownImage.tsx` — caption support + softer frame

## Design changes

### 1. Body typography (calmer, more editorial)
- Body paragraph: `1.0625rem` (was 1.125), line-height `1.8`, color `foreground/80`. Tighter rhythm, less "blog template".
- Drop cap: switch from primary blue to **charcoal foreground**, lighter weight (700), slightly smaller (3rem), serif-ish via tighter tracking. Reads as editorial, not Medium.
- Lists: bullet/number markers in `foreground/40` (no blue). List items at body size.
- `strong`: keep dark, weight 600 (down from 700) — looks less shouty.
- Links: underline offset `4px`, `text-decoration-thickness: 1px`, color `foreground` with `foreground/30` underline that darkens on hover. No primary blue.

### 2. Headings
- **H2**: drop the bottom border + gradient bar. Use a small neutral number prefix (`01 ·` in `foreground/40`, mono) inline with the title. Title weight 600, tracking `-0.025em`, size `1.875rem`. Generous top margin (`4rem`), shorter bottom (`1rem`). Gives clear section breaks without being decorative.
- **H3**: remove pill background. Plain `1.25rem` weight 600 with a 2px charcoal left accent bar (`border-l-2 border-foreground/20 pl-3`). Quieter, more print-like.

### 3. Blockquote
- Remove blue gradient + blue border. New style: oversized hanging quote glyph in `foreground/15`, italic `1.25rem` text in `foreground/85`, no border, just generous left padding and top/bottom margins. Pure typography moment.

### 4. Callouts (Key takeaway)
- Replace blue tint with **cream `#FAFAF8` card on white**, `1px solid #f0efed`, lightbulb icon in `foreground/60`. Same restraint as the dark-CTA-adjacent sections elsewhere on the site. Bold "Key takeaway" label in foreground, body in muted-foreground.

### 5. Tables
- Header background: `foreground/[0.04]` with `foreground` text (was solid primary blue with white text). Row hover `foreground/[0.02]`. Border `#f0efed`. Looks like a real editorial data table.

### 6. Inline code
- Background `foreground/[0.06]`, color `foreground` (not primary). Mono.

### 7. Hero header polish (`BlogPost.tsx`)
- Tighten headline to `text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem]` (slightly smaller — feels more refined; today's `3.5rem` is too big next to a small excerpt).
- Add a thin separator dot row between author chip / date / read time on desktop using `text-foreground/30` `·` separators instead of three loose pills — cleaner.
- Mobile: reduce `pt-28` → `pt-24`, headline tracking `-0.025em` (current `-0.03em` is too aggressive at small sizes).

### 8. Hero image
- Wrap in a softer cream frame (`bg-[#f5f4f1]` already correct), but constrain `max-h-[56vh]` and add a tiny caption slot below (uses `post.coverImageCaption` if present — falls back to nothing). Adds editorial credibility.

### 9. Inline images (`BlogMarkdownImage.tsx`)
- Add optional caption support from markdown alt text — render `<figcaption>` with small uppercase tracked label in `text-muted-foreground text-[11px]` below image, when alt is non-empty. Wrap rounded `1rem` (was `xl=0.75rem`) and add `border border-[#f0efed]`. Matches hero treatment.

### 10. TOC card refinement
- Switch from white card to a plain inline list (no card chrome) when reading on desktop — feels more print-magazine, less SaaS. Keep BookOpen eyebrow. Active item gets a 2px charcoal left rule instead of background fill.
- On mobile (<sm), keep the current collapsed card pattern but reduce padding.

### 11. Related posts
- Remove category badge background tint (use plain uppercase eyebrow text). Title weight 500, slightly larger (`text-[15px]`). Card hover: lift shadow only, no border color change. Adds restraint.

### 12. Dark CTA at bottom
- Already aligned with site pattern. Minor: reduce top margin from `mt-14` → `mt-20` for breathing room after Topics section, and unify rounded corner to `rounded-[28px]` matching landing CTA.

## Mobile considerations (440px viewport user is on)
- Confirm headline doesn't overflow at `2rem`.
- Reduce blockquote font to `1.0625rem` on mobile.
- Numbered H2: stack number above title on `<sm` so long titles don't squeeze.
- TOC: keep card variant on mobile (current behavior).
- Dark CTA: already `w-full` button on mobile via the matching pattern — verify after edits.

## What stays the same
- Page structure, routing, SEO, JsonLd, reading progress bar, breadcrumb, tags row, related posts data flow, dark CTA copy.
- Cream `#FAFAF8` background, `#f0efed` borders, white surface cards — fully preserved.

## Out of scope
- No changes to `src/pages/Blog.tsx` (the listing page).
- No changes to blog post content/data.
- No new dependencies.

After approval I'll implement these in `src/index.css`, `src/pages/BlogPost.tsx`, and `src/components/app/BlogMarkdownImage.tsx`.
