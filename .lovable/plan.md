## Refine `/discover/{slug}` SEO page (Pexels-style hero + cleaner meta)

Tighten the public detail page so the hero image fits the screen on first paint (Pexels behavior), reformat metadata, truncate the long prompt, and use the branded modal CTA style.

### Scope

Single file: `src/components/discover/DiscoverItemSEOView.tsx`. No routing, no DB, no SEO meta/JSON-LD changes (titles, canonical, ImageObject, BreadcrumbList all stay identical so indexing is unaffected).

### Changes

**1. Hero image fits viewport (Pexels-style)**
- Wrap hero in a container constrained to roughly viewport height: `max-h-[calc(100vh-9rem)]` (accounts for top nav + breadcrumbs + H1 above).
- Image becomes `object-contain`, `mx-auto`, `w-auto h-auto max-h-full max-w-full` so portrait shots fit by height and landscape by width — never overflow.
- Center the figure on a soft `bg-muted/30` rounded canvas so letterboxing looks intentional.
- Info sections (chips, prompt, tags, CTA, related) remain below — appear as user scrolls, exactly like Pexels.

**2. Remove Quality pill**
- Drop `{ label: 'Quality', value: preset.quality }` from the chips array.

**3. Humanize Sub-type value**
- Add a small helper `humanize(s)` that converts `beauty-skincare` → `Beauty Skincare` (split on `-`/`_`, capitalize each word).
- Apply to `preset.subcategory` chip value only. Other chips already use display-ready strings.

**4. Truncate long prompt with "Show more"**
- Rename heading from "About this visual" to "Prompt" (matches user's "promt" wording, clearer signal of what the text is).
- Render in a styled muted code-like block (`rounded-lg bg-muted/40 p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap`) to read as a prompt artifact.
- If `prompt.length > 280`, clamp via local `useState` (`expanded`) — show truncated text + "Show more" / "Show less" toggle button styled as a subtle text link.

**5. Branded CTA matching public modal**
- Replace the current outline-card CTA section with the same button used in `PublicDiscoverDetailModal`:
  - Pill button: `h-[3.25rem] rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20`
  - Label logic mirrors modal: authenticated → "Open in Visual Studio", unauthenticated → "Try this for free" (mobile) / "Create account to recreate this" (desktop)
  - Trailing `ArrowRight` icon
  - Constrain width with `max-w-md mx-auto` so it doesn't span full width
- Keep the short caption underneath ("Sign up to access prompts, scenes and generate AI fashion photography" for guests; "Open this style in Visual Studio…" for signed-in users).

### Out of scope (unchanged)
- `<SEOHead>`, JSON-LD (ImageObject + BreadcrumbList), canonical URL, prerender pipeline, sitemap, `/app/discover` noindex.
- Modal flow in `PublicDiscover.tsx`.
- Related visuals grid stays as-is.

### Risk
Low — purely presentational changes inside one component. SEO-critical markup (h1, meta, JSON-LD, hero `<img alt>`, breadcrumbs) untouched.