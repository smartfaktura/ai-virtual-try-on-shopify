

# Hide Value Chips on Mobile, Show Full Subtitle

## Change
In `PostGenerationUpgradeCard.tsx`:
1. Hide the value chips (More Looks, Better Value, Faster Launches) on mobile — add `hidden sm:flex` to the chips container (line 91)
2. Remove `line-clamp-1` from the subtitle on mobile so it displays fully — change to `sm:line-clamp-1` (line 86)

### File
- `src/components/app/PostGenerationUpgradeCard.tsx` — 2 class changes

