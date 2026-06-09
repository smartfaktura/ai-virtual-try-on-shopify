## Goal

Two small polish passes across all 7 fashion-welcome emails:
1. Heavier corner rounding on buttons and image/section corners (match the in-app pill-ish feel).
2. Stop alt text from rendering blue + bold when an image fails to load.

## Changes (in `/tmp/build_emails.py`, then regenerate all 7 files)

### 1. Heavier corner radius

Current vs new:

| Element | Now | New |
|---|---|---|
| All CTAs (hero, section, navy-band) | `border-radius: 6px` | **`border-radius: 12px`** |
| Hero image | `border-radius: 8px` | **`border-radius: 16px`** |
| Grid images (3×2) | `border-radius: 6px` | **`border-radius: 12px`** |

This matches the in-app "Build a scene set" pill rounding shown in the reference. Sections themselves (grey grid block, navy band) stay full-bleed inside the 600px frame — no outer rounding, because email clients clip background colors on `<td>` with `border-radius` inconsistently. Only the images and buttons get the heavier radius.

### 2. Alt-text fallback styling

Currently every `<a>` that wraps an `<img>` has `text-decoration:none` but inherits the client's default link color (Gmail/Apple Mail render unstyled anchor text as bright blue + bold). When the image fails to load, the alt text shows that blue.

Fix: set explicit dark, regular-weight, neutral type on both the `<a>` wrapper and the `<img>` itself, so the broken-image alt reads as quiet inline copy.

Apply to every `link_wrap()` anchor and every `img_tag()` / hero image:

```text
color:#0f172b;
font-family: Inter, Arial, sans-serif;
font-size: 13px;
font-weight: 400;
line-height: 1.4;
text-decoration: none;
font-style: normal;
```

That's added inline to the `<a>` (already has display/border/text-decoration) and to the `<img>` style (so Outlook also picks it up). Existing `border:0; outline:none;` stays.

### 3. Mechanics

1. Patch `/tmp/build_emails.py`:
   - `img_tag()` → change `border-radius:6px` to `12px`, add the alt-text style props to the `<img>` style string.
   - `hero_image()` → change `border-radius:8px` to `16px`, add alt-text style props.
   - `link_wrap()` → extend the `<a>` style with the alt-text type props.
   - `primary_cta()`, `section_cta()`, navy-band CTA helper → change `border-radius:6px` to `12px`.
2. Run `python3 /tmp/build_emails.py` to regenerate all 7 emails into `src/emails/fashion-welcome/` and the artifact mirror.
3. Verify with grep: every file has `border-radius:12px` (≥3, for the CTAs), `border-radius:16px` once (hero), grid images use `12px`, and no `border-radius:6px` / `border-radius:8px` remains in the 7 emails.
4. Re-emit artifacts.

No app/runtime code touched; only the 7 static HTML emails change.
