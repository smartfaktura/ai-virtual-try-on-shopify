## Redesign `/app/help` — make it feel like real humans, not AI

The current page has two real problems:

1. **Title is just "Help"** — should be **"Help & Support"**.
2. **Sophia, Kenji & Zara are AI brand-model personas** (defined in `src/data/teamData.ts` as the studio crew) — using them on a support page misrepresents the team. The user is clear: real humans answer support, so the page must reflect that.

### Fixes in `src/pages/AppHelp.tsx`

**1. Title & subtitle**
- `title="Help"` → `title="Help & Support"`
- Subtitle stays warm but specific:
  `"Real people, real answers — typically within a few hours on weekdays"`

**2. Replace the AI-persona avatar strip with a real founder card**
Drop Sophia/Kenji/Zara from this page entirely. Replace the avatar header inside the form card with a single, honest "from the founder" strip using the existing real photo `src/assets/founder-tomas.jpg`:

```
[Tomas photo 36px]   FROM THE TEAM
                     Tomas & the VOVV.AI team — we read every message ourselves
```

Layout: `flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-border bg-muted/30`
- Real circular avatar (`w-9 h-9 rounded-full ring-1 ring-border` using `founder-tomas.jpg`)
- Eyebrow: `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground` → "From the team"
- Line below: `text-[13px] text-foreground` → "Tomas & the VOVV.AI team — we read every message ourselves"

This matches the dashboard eyebrow standard (`tracking-[0.2em]`, per memory) and removes the AI personas from the support context. The same `founder-tomas.jpg` is already used on `/about`, so it's consistent.

**3. Add a tiny "what to expect" reassurance row above the form**
Inside the form card body (above `<ChatContactForm />`), add a slim 3-bullet row of expectations so users feel the human commitment:

- ⏱ **Reply time** — Usually within a few hours, weekdays
- ✉️ **Where it goes** — Straight to the team's inbox
- 🔒 **Privacy** — Your messages stay between us

Render as a `divide-x divide-border` row of three `flex-1` cells, each with a small lucide icon (`Clock`, `Mail`, `Lock`), `text-[11px] uppercase tracking-[0.16em] text-muted-foreground` label, and `text-[13px] font-medium text-foreground` value. Wrapper: `rounded-xl border border-border bg-background mb-5 overflow-hidden`. Stacks vertically on mobile (`flex-col sm:flex-row sm:divide-y-0 divide-y`).

**4. Improve the "Quiet helpers" copy**
Make descriptions less generic and more human:

- **Browse FAQs** → "Quick answers to the things people ask most"
- **Join our Discord** → "Hang out with the team and other creators"
- **Tutorials & guides** → "Short walkthroughs for every Visual Type"

Keep the same card structure / icons.

**5. Footer microcopy**
Add a single human line above the social-links footer:
`text-xs text-muted-foreground` → "Prefer email? Write directly to hello@vovv.ai"

Then the existing `Email · Discord · Twitter · Instagram` row stays beneath it.

### What stays
- Existing `<ChatContactForm variant="spacious" />` — unchanged.
- Card containers, spacing rhythm, soft icon tiles, divider patterns — already match dashboard.
- Social-links footer row.

### Out of scope
- No backend / form-submission changes.
- No changes to `ChatContactForm`, About page, or marketing pages.
- AI brand-model personas (Sophia/Kenji/Zara) remain on the marketing site — they're correct *there*, just not on the support page.

### Files touched
- `src/pages/AppHelp.tsx` (only)
- New imports: `founderImg from '@/assets/founder-tomas.jpg'`, `Clock`, `Mail`, `Lock` from `lucide-react`
- Removed imports: `Avatar*`, the three avatar URL constants, `getOptimizedUrl`, `getLandingAssetUrl` (if unused after change)
