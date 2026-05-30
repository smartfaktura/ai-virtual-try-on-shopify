## Items

### 2. Multi-camera-motion upsell opens upgrade modal instead of /pricing
`src/components/app/video/MotionRefinementPanel.tsx` lines 98–109 use `<a href="/pricing">Upgrade</a>`. Change to a button that calls a new optional `onUpgrade?: () => void` prop. In `src/pages/video/AnimateVideo.tsx`, pass `onUpgrade={() => openBuyModal('animate_multi_motion-gate')}` to `<MotionRefinementPanel ...>`. The `-gate` suffix forces `GlobalUpgradeModal` into upgrade variant (not topup), correct for free-plan feature unlocks. Drop the `Sparkles` icon next to the word "Upgrade".

### 3. Insufficient-credits messaging on `/app/video/start-end`
`/app/video/animate` already has `notEnoughCredits` branch that swaps the CTA to "Get credits" via `openBuyModal('animate_video_cta')`, but no inline message line. `/app/video/start-end` has nothing — `canGenerate` ignores balance, button just looks grey when other gates fail, and click silently opens `NoCreditsModal`.

Standardize both:
- Compute `notEnoughCredits = creditsBalance < creditCost` (already exists in Animate; add to StartEnd).
- When true, render a minimal inline hint above/left of the CTA: `"Not enough credits — you need X, you have Y"` (text-xs, muted-foreground, no icon).
- Swap the primary CTA to a "Get credits" button that calls `openBuyModal('start_end_video_cta')` on StartEnd / `openBuyModal('animate_video_cta')` on Animate (Animate already does this — just add the hint line).
- StartEnd: switch from local `NoCreditsModal` open state to `openBuyModal`. Remove `noCreditsOpen` state + `<NoCreditsModal>` mount to avoid two upgrade modals (`GlobalUpgradeModal` is mounted globally).

### 4. Remove Sparkles from CTAs
- `src/pages/video/StartEndVideo.tsx` line 407: drop `<Sparkles className="h-4 w-4" />` before "Generate Video".
- `src/pages/video/AnimateVideo.tsx` line 1363: drop `<Sparkles>` before "Get credits".
- Leave the Sparkles on the main "Generate Video" CTA in Animate (line 1373) untouched — user only asked about Start-End's Generate and Animate's Get credits.

### 5. Aspect Ratio info styling in Animate Settings
`src/pages/video/AnimateVideo.tsx` lines 1275–1284. Current:
```
<label>Aspect Ratio</label> <InfoTooltip ... />
[Eye icon] Output matches your source image ratio
```
Replace with a cleaner readout — no eye icon, no awkward gray microcopy. Render the aspect ratio as a static pill next to the label, e.g.:
```
Aspect Ratio  [ Auto · matches source ]
```
Pill = `rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground`. Keep the `InfoTooltip` for full explanation. Remove the `Eye` import if unused elsewhere on the page.

## Files
- `src/components/app/video/MotionRefinementPanel.tsx`
- `src/pages/video/AnimateVideo.tsx`
- `src/pages/video/StartEndVideo.tsx`

No backend, schema, or edge function changes.