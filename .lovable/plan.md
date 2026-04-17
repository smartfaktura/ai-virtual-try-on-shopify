

## Polish Brand Models upgrade gate

### Issues (screenshot)
1. **Subtitle too long**: "Create and manage your custom AI models for consistent brand imagery" — repeats what the title already says, and wraps to two lines.
2. **Hero feels off-center** vs the left-aligned `PageHeader` above it. The `UpgradeHero` is `max-w-2xl mx-auto` inside the page content (which itself is offset by the sidebar), so visually the title sits left while the hero card sits centered — creating tension.
3. **In-hero copy duplicates the page title** ("Brand Models" appears in both the page header and in the hero `<h2>`).

### Fix — `src/pages/BrandModels.tsx`

**A. Trim PageHeader subtitle (line 841):**
- From: `Create and manage your custom AI models for consistent brand imagery`
- To: `Custom AI models that match your brand.`

**B. Hide the PageHeader entirely when user is on the upgrade gate** (cleanest fix to the centering issue):
- Wrap `PageHeader` in `{isPaid && (...)}` so non-paid users see ONLY the centered hero (no left-aligned title competing with it).
- Paid users keep the standard left-aligned header as today.

This naturally re-centers the hero in the viewport (no header above pulling the eye left) and removes the duplicate "Brand Models" title.

**C. Tighten `UpgradeHero` copy & rhythm (lines 32–69):**
- Subtitle (line 41–43): replace the long em-dash sentence with two tighter lines:
  - `Unlimited custom AI models — any gender, age, ethnicity, or body type.`
  - `Built to match your brand identity.`
- Reduce vertical gap from `gap-10` → `gap-8` and `py-20` → `py-16` so the block feels more compact and visually centered on shorter screens.
- Keep the 4 benefit cards and CTA exactly as-is (they're already well-balanced).

**D. Locked models section** (when downgraded user still has models, lines 849–887):
- Add a slim section heading above it so it doesn't appear orphaned now that the page header is hidden. Reuse the existing `<h3>My Brand Models</h3>` block — already present, just ensure spacing (`mt-12`) so it sits clearly below the hero.

### Out of scope
- Paid-user view (active models grid), modals, generation flow, backend.
- Locked card visuals.

### Acceptance
- Page subtitle reads: "Custom AI models that match your brand." (one line on desktop).
- On the upgrade gate, no left-aligned page header is visible — only the centered hero with badge → title → 2-line subtitle → 2×2 benefit grid → CTA, all visually centered in the viewport.
- "Brand Models" title appears only once on the page.
- Paid users see the existing layout unchanged.

