Generate a standalone HTML email newsletter file at `/mnt/documents/brand-scenes-newsletter.html` announcing **Brand Scenes** and **Brand Models** on VOVV.AI.

**Format**
- Email-safe HTML: table-based layout, inline CSS, 600px max-width, system font stack
- Light mode, minimalist luxury aesthetic matching VOVV.AI (off-white background, near-black text, subtle dividers, generous whitespace)
- Mobile-responsive via media query
- Plain image placeholders using `https://vovv.ai/...` style URLs the user can swap

**Content structure**
1. Pre-header (hidden) — "Your brand. Your faces. Your scenes. Reusable across every shoot."
2. Header — small VOVV.AI wordmark
3. Hero — "NEW" eyebrow + headline: *"Build a private creative library that's only yours."* + 1-sentence subtitle
4. Section 1 — **Brand Scenes**: short pitch (custom scenes from any reference, reused on every shoot), 3-thumbnail strip, CTA "Create Brand Scenes →"
5. Section 2 — **Brand Models**: short pitch (private AI faces, perfect consistency across campaigns), 3-thumbnail strip, CTA "Create Brand Models →"
6. Why it matters — 3 bullets (Consistency · Speed · Ownership)
7. Upgrade nudge — pill card: "Included on Growth, Pro, and higher plans" + primary "Upgrade plan" button linking to `/app/billing`
8. Footer — small unsubscribe + brand line

Deliver as a `<presentation-artifact>` so the user can download the file.