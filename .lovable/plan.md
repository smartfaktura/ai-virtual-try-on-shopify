## Make header CTA button bigger

Single change in `src/components/landing/LandingNav.tsx` (desktop CTA, lines 153–161):

- Drop `size="sm"`.
- Set explicit `h-11 px-7 text-[15px]` so the "Sign In" / "Start Free" / "My Dashboard" button is taller (~44px) and more substantial — matches the visual weight of the nav and the dark pill better.
- Keep rounded-full, color, and click behavior identical.

Mobile CTA (full-width inside the drawer) already uses `size="lg"` — no change needed.
