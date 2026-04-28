## Polish Earn Credits modal typography & sizing

The modal aesthetic is right, but the type scale and a few elements drift from the `/app` dashboard standard. The most jarring issue is the **caption box rendering in monospace** (because it uses a `<code>` element with no font override), which is why "Made with @VOVV.AI" looks like a different typeface than everything else. Other text is also slightly oversized relative to dashboard cards (which use `text-sm` / `text-xs`, not arbitrary `[14px]`).

### Fixes in `src/components/app/EarnCreditsModal.tsx`

**1. Caption box (the obvious mismatch)**
- Replace `<code class="text-[13px] font-semibold">` with `<span class="text-sm font-medium font-sans">` so it renders in Inter, matching the rest of the UI.
- Reduce weight from `semibold` → `medium` (codeblocks shouldn't shout).
- Bump padding to `px-3 py-2.5` to match dashboard input height rhythm.

**2. Step body text — align to dashboard scale**
- Step title: `text-[14px]` → `text-sm font-semibold` (same as Settings section titles).
- Step description: keep on the same line but as `text-sm text-muted-foreground` (currently mixed inline at 14px). Consider stacking title above description like Settings rows for cleaner rhythm:
  - Title row: `text-sm font-semibold text-foreground`
  - Description row: `text-xs text-muted-foreground mt-0.5`
- Removes the awkward "—" inline separator and matches the divided-row pattern used in BugBounty's "How it works".

**3. Heading & subtitle**
- Headline: `text-xl sm:text-2xl` → `text-lg sm:text-xl font-semibold tracking-tight` (matches dashboard modal/card headers).
- Subtitle: `text-[13px] leading-relaxed` → `text-sm text-muted-foreground` (drop `leading-relaxed` on a one-liner; it adds dead space).
- No terminal period on subtitle (already correct, per memory rule).

**4. Step number tiles**
- `w-7 h-7 rounded-xl text-[12px]` → `w-6 h-6 rounded-lg text-[11px]` to feel proportional to `text-sm` body copy and match the smaller numerical tiles used in BugBounty.

**5. Header icon tile**
- `w-10 h-10` → `w-9 h-9` and icon `w-5 h-5` → `w-[18px] h-[18px]` (dashboard soft tiles are typically 36px, not 40px).
- Reduce bottom margin `mb-4` → `mb-3.5`.

**6. Fine print**
- `text-[11px] text-muted-foreground/70 text-center` → `text-xs text-muted-foreground text-center` (dashboard uses standard `text-xs`; the `/70` opacity makes it look washed compared to other muted copy).

**7. Close button — kill the blue focus ring**
- Add `focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0` so it doesn't render the default browser blue ring visible in the screenshot. Or simply `focus:outline-none focus-visible:ring-1 focus-visible:ring-border`.
- Swap the icon container to `w-7 h-7` for a properly clickable hit area.

**8. CTA button**
- Already uses `<Button size="pill" h-11>` — keep, but ensure `text-sm font-medium` is inherited (it is by default via the Button component). No change needed unless audit reveals a size override.

**9. Spacing rhythm**
- Header padding `pt-7 pb-5` → `pt-6 pb-4` (tighter, matches Settings card `p-5 sm:p-6`).
- CTA wrapper `pt-5 pb-3` → `pt-4 pb-2` for better vertical balance with reduced fine-print spacing.

### What stays
- Left-aligned layout, `rounded-2xl border bg-card divide-y` steps card, `bg-primary/10` soft tiles, modal width `440px`, `shadow-xl` — all already on-brand.
- `Reward` eyebrow with `tracking-[0.2em]` — confirmed as the dashboard standard.

### Out of scope
- No changes to logic, copy strings, or the mailto flow.
- No changes to other pages — only the modal.

### Files touched
- `src/components/app/EarnCreditsModal.tsx` (only)
