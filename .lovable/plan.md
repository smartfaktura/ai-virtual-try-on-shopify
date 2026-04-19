
The mobile menu's "Start Free" button uses `size="sm"` which renders at h-8. Other primary CTAs (like the hero "Start Free") are larger. I'll bump it to `size="lg"` (h-11) to match standard CTA sizing on mobile.

File: `src/components/landing/LandingNav.tsx` line ~118 — change `size="sm"` to `size="lg"` on the mobile menu Button.
