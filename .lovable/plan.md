

# Redesign FreestylePromptCard — Clean, Premium Layout

## Problem
The current card is cluttered with cycling chips, mini avatars, and a ratio badge that overflow on smaller viewports. The user wants a cleaner, more premium design matching the reference copy.

## New Design

The card visual area will have:
1. **Top badge**: "CREATE WITH PROMPT" (uppercase, small)
2. **Tagline**: "Any Product · Any Model · Any Scene · Any Lighting" — a single static line replacing all the animated chips
3. **Typing prompt composer**: Keep the existing typing animation but in a cleaner box
4. **Bottom hint**: "Describe any visual you want" below the prompt box

The content area below keeps:
- Title: "Create with Prompt"
- Subtitle: "Describe any shot, scene, or style you want."
- Button: "Create with Prompt" with arrow

## Changes — `src/components/app/FreestylePromptCard.tsx`

### Remove
- `CyclingChip` component and `CHIP_DATA` constant
- `MiniAvatars` component
- The entire animated chips row (lines 149-160) and the ratio chip
- Imports: `Package`, `User`, `Mountain`, `RatioIcon`

### Replace visual area content (lines 141-185)
Replace with a simpler stack:
1. Badge: `CREATE WITH PROMPT` (keep existing style)
2. Static tagline: `Any Product · Any Model · Any Scene · Any Lighting` — `text-[10px] text-foreground/50 tracking-wide`
3. Prompt composer box (keep typing animation, same style)
4. Hint text: `Describe any visual you want` — small muted text below the box

### Update content area (lines 189-209)
- Title: "Create with Prompt" (fix typo "Promt")
- Subtitle: "Describe any shot, scene, or style you want."
- Button label: "Create with Prompt"

### Also fix the typo in Dashboard
- Line 538: "Create with Promt" → "Create with Prompt"
- Line 145 badge: same fix

Single file primary edit + typo fix in Dashboard.

