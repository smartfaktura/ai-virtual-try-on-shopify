

# Inline Upgrade Card — Add Subline + Show Chips on All Viewports

## Changes — `PostGenerationUpgradeCard.tsx`

1. **Add subline below headline** — Render `copy.subline` as `text-xs text-muted-foreground` on its own row beneath the headline. Wrap headline + subline in a vertical `flex-col` container so they stack naturally.

2. **Show chips on all viewports** — Remove `hidden md:flex` and `!compact` gates. Always render chips with `flex-wrap` so they wrap gracefully on narrow screens.

3. **Layout structure after fix:**

```text
Desktop:
[accent] [avatar] [headline                    ] [chip · chip · chip] [See Plans] [×]
                  [subline — muted, text-xs     ]

Mobile / compact:
[accent] [avatar] [headline wraps if needed]
                  [subline — muted]
                  [chip · chip · chip]  [See Plans] [×]
```

Single file change: `PostGenerationUpgradeCard.tsx`

