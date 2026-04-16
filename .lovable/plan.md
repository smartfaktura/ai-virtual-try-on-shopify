

# Inline Upgrade Card — Admin Preview Width + Mobile Responsive Fix

## Two problems

1. **Admin preview is too narrow** — Desktop preview uses `max-w-[600px]`, which squeezes the card and truncates the headline ("Your first f..."). In real usage, Freestyle/Product Images containers are much wider. Should remove the max-width constraint on desktop so it stretches realistically.

2. **Mobile preview doesn't actually trigger responsive breakpoints** — The admin page wraps the card in `max-w-[375px]` to simulate mobile, but the viewport is still desktop-width. So `md:flex` (chips), `md:truncate` (headline), and `md:flex-row` all still fire at desktop width. The card looks broken on "mobile" preview because chips show + headline gets pushed out. Fix: use container queries (`@container`) on the card so layout responds to the card's own width, not the viewport.

## Changes

### `PostGenerationUpgradeCard.tsx`
- Wrap the card in a container query context (`@container`)
- Replace all `md:` breakpoints with `@md:` (container query variants) so the card responds to its own width, not the viewport
- This means: when the card is placed in a 375px wrapper (admin mobile preview) OR on an actual phone, chips hide and layout stacks — correctly

Tailwind CSS v3 supports container queries via `@tailwindcss/container-queries` plugin. Check if it's already installed; if not, use a simpler approach: pass a `compact` prop from the admin preview and use that to toggle classes.

**Simpler approach (no plugin dependency):** Add an optional `compact` prop. When the admin page selects "mobile", pass `compact={true}`. The card uses `compact` to conditionally hide chips and stack layout. For real mobile usage, keep `md:` breakpoints as-is — they work on actual phones.

### `AdminConversion.tsx`
- Desktop: remove `max-w-[600px]`, let the card stretch to full container width (realistic)
- Mobile: keep `max-w-[375px]`, pass `compact` prop to the card

### Layout per mode:

```text
Desktop (no compact):
[accent] [avatar] [headline ————————————————] [chip · chip · chip] [See Plans] [×]

Mobile / compact:
[accent] [avatar] [headline wraps to 2 lines]
                              [See Plans] [×]
```

## Single concern
Two files: `PostGenerationUpgradeCard.tsx` (add `compact` prop) and `AdminConversion.tsx` (remove max-width, pass prop).

