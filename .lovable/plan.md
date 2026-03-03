

## Update AI Creative Pick Card to Brand Colors

The AI Creative Pick card currently uses violet/fuchsia/amber gradient (`from-violet-500 via-fuchsia-500 to-amber-400`). The VOVV brand palette is deep navy (`hsl(222, 30%, 25%)` / `#0f172a` / `#1e293b`) with warm stone accents.

### Change — `src/pages/Generate.tsx` (line 2527)

Replace the gradient on the AI Creative Pick card background:

**Before:** `bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400`

**After:** `bg-gradient-to-br from-slate-800 via-slate-700 to-slate-500`

This uses the brand's deep navy tones — sophisticated, dark, and aligned with the studio-infrastructure aesthetic. The white sparkle icon and "AI PICKS" text will have strong contrast against the dark background, maintaining readability.

### Files changed — 1
- `src/pages/Generate.tsx` — Update gradient colors on AI Creative Pick card (1 line)

