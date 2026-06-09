# Fashion Visual Growth Sequence — 7 Email Templates + Preview

Proceeding with the strong defaults you offered (luxury minimal, black CTAs, white bg, soft grey sections, Inter, one-column, founder-led from Tomas, "VOVV" only in visible content).

## What I'll build

### 1. Seven standalone HTML files (copy-paste ready for Resend)
Location: `src/emails/fashion-welcome/` as plain `.html` files so they're fully portable and not bundled.

Files:
- `01-welcome.html` — Subject: *Your next product shoot can start with one photo*
- `02-first-gen.html` — *Try it with your easiest product first*
- `03-more-angles.html` — *One product image rarely sells the full product*
- `04-fashion-scenes.html` — *Your next drop needs more than a product photo*
- `05-product-swap.html` — *One winning scene can sell more than one product*
- `06-brand-look.html` — *Make every visual feel like your brand*
- `07-upgrade.html` — *Ready to create fashion visuals more consistently?*

Each file contains, in this exact order:
1. Top HTML comments: `Subject`, `Preheader`, `From: Tomas from VOVV <tomas@vovv.ai>`, `Reply-To`, `Timing`, `Condition` (where relevant), `Main CTA URL`.
2. Hidden preheader span (`display:none;max-height:0;overflow:hidden;opacity:0`).
3. Shared header: centered **VOVV** wordmark only, ~600px container, 40px top padding.
4. Hero block: H1 headline → 1–2 line value intro → **primary CTA button (black `#0a0a0a`, white text, ~14px padding 16px 32px, full-width on mobile via media query)** → hero image below.
5. Secondary content block (soft grey `#f5f5f4` section, headline + supporting copy).
6. Use-case / feature block (per email — bullet-style rows, no multi-column).
7. Final CTA block (same button, repeated once).
8. Footer: "VOVV" wordmark, "You are receiving this email because you signed up for VOVV." + "Manage your email preferences in your account settings." (no manual unsubscribe — Resend appends).

Email-safe HTML: tables for layout, inline styles, single `<style>` block only for `@media (max-width:600px)` responsive tweaks (full-width buttons, image scaling). No JS, no external CSS, no web fonts beyond Inter via Google Fonts `<link>` with `-apple-system` fallback stack.

### 2. Images
Since I can't pull live URLs from the product-visual-library page reliably for each angle, I'll use **lightweight HTML placeholders** with:
- A grey `<img>` placeholder URL (e.g. `https://vovv.ai/og-fashion-{n}.jpg` — your team can swap)
- An HTML comment above each image stating exactly which type of fashion visual to drop in (per your "Image direction by email" spec).
- Descriptive alt text matching the angle.
- `style="display:block;width:100%;height:auto;max-width:600px;"` for responsiveness.

This makes it trivial to swap in finals from your library before sending.

### 3. Admin preview page
Route: `/admin/email-preview/fashion-welcome`
File: `src/pages/admin/EmailPreviewFashionWelcome.tsx`
Register in `src/App.tsx` under existing admin routes (admin-gated like other admin pages).

The page:
- Lists all 7 emails as cards (Email #, Timing, Condition, Subject, Preheader).
- Renders each email inside a sandboxed `<iframe srcDoc={html}>` at 600px desktop preview.
- "Copy HTML" button per email (uses `navigator.clipboard`).
- Loads the HTML files at build time via Vite's `?raw` import so the rendered preview always matches the file you'll paste into Resend.

### 4. No backend changes
No edge functions, no DB migrations, no Resend API code — you're wiring this in Resend's UI. Pure static HTML + one admin preview page.

## Brand & copy rules applied
- "VOVV" only in visible content; URLs keep `vovv.ai`.
- "Visual Studio" as platform area; no "templates / workflows / presets" wording.
- No emojis, no fake urgency, no revenue promises.
- Founder voice from Tomas, short and sales-focused.
- One CTA per email, repeated max twice (top hero + final block).
- "NEW" small label next to Brand Scenes only in Email 6.

## Out of scope
- Wiring the automation in Resend (you'll do that in their UI using the metadata at the top of each file).
- Fetching/embedding real library image URLs — placeholders + comments instead, per your fallback instruction (#9 of image requirements).

Ready to build on approval.
