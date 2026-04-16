

## Goal

Explore better visual treatments for the credits indicator in the sidebar — specifically the icon — and remove the "Your credits" label since the icon + number already communicate the meaning.

## Current state

In `src/components/app/CreditIndicator.tsx`:
- Tiny uppercase label "YOUR CREDITS"
- A 28×28 rounded square with `Coins` icon inside
- Balance number + `/ max`
- Plus button to buy
- Progress bar

Removing the label gives more breathing room and lets the icon + number do the talking.

## Icon options

Here are concrete directions for the credits icon:

### Option A — Coin stack (Layers / Coins icon, refined)
Keep `Coins` but make it feel more premium: monochrome, no colored background tile, just the icon at slightly larger size next to the number. Minimalist, matches the "luxury restraint" aesthetic.

### Option B — Sparkles / Spark
Use `Sparkles` (lucide). Reads as "AI credits / generations" rather than money. Fits a creative AI tool better than a coin metaphor.

### Option C — Zap / Bolt
Use `Zap`. Reads as "energy / power to generate". Common pattern in AI tools (Midjourney "fast hours", Vercel credits, etc.). Feels modern and active.

### Option D — Gem / Diamond
Use `Gem`. Premium feel, treats credits as a precious resource. Great for a luxury-positioned product.

### Option E — Circular progress ring around the number (no icon at all)
Replace the icon tile entirely with a small circular progress ring wrapping the balance number. The ring itself becomes the visual — shows usage % at a glance. Most information-dense, very "premium dashboard".

## My recommendation

**Option C (Zap)** or **Option B (Sparkles)** — both map to "AI generation fuel" much better than `Coins`, which implies money. Combined with removing the label, it becomes a cleaner, more product-native indicator.

If we want to go further, **Option E (progress ring)** is the most elegant but a bit more work.

## Proposed change (pending your pick)

In `src/components/app/CreditIndicator.tsx`:

1. Remove the "YOUR CREDITS" label row entirely (keep "Upgrade" pill, move it to align right with the balance row).
2. Swap the `Coins` icon for the chosen icon (`Zap`, `Sparkles`, `Gem`, or progress ring).
3. Slightly tighten vertical spacing now that the label is gone.

Layout after change:

```text
[icon]  1,240 / 1,500           [Upgrade]  [+]
─────────── progress bar ───────────
```

No logic changes, styling only.

## Question for you

Which icon direction do you want?
- A: refined Coins (no tile)
- B: Sparkles
- C: Zap (recommended)
- D: Gem
- E: circular progress ring (no icon)

Once you pick, I'll apply it together with removing the "Your credits" label.

