## Public Header Nav Refinements

Three small adjustments to `src/components/landing/LandingNav.tsx`:

### 1. Remove "AI Product Photography" from main menu
Delete that entry from the `navLinks` array. The dedicated SEO page at `/ai-product-photography` stays live and reachable via internal links/footer — only the top-nav link is removed.

### 2. Remove the active underline, keep only the active color
The active link currently shows a small underline (the `after:` pseudo-element bar). Replace the active styling with just a color change:
- Active: `text-sidebar-foreground` (full white)
- Inactive: `text-sidebar-foreground/70 hover:text-sidebar-foreground`

No more underline bar.

### 3. Make the header CTA button smaller (but still bigger than original `sm`)
Current: `h-11 px-7 text-[15px]` (44px tall, large).
New: `h-9 px-5 text-sm` — a moderate size between the original `sm` and the oversized version.

No other changes (mobile menu, logo, layout untouched).
