

# Improve: Creative Drops Wizard — Details Step UX Overhaul

## What Changes

### File: `src/components/app/CreativeDropWizard.tsx` (Step 0 section, lines 618-686)

**1. Step Headline + Subtitle**
Add a clear heading at the top of the Details step:
- Title: "Name Your Drop" with a Sparkles icon
- Subtitle: "Set up the basics — you'll pick products and workflows next."

**2. Visual Header**
The Sparkles icon (already imported) placed next to the title in a subtle primary-tinted circle.

**3. Rotating Placeholders**
Replace static "Spring Campaign" placeholder with a cycling set of examples: "Summer Vibes 2026", "Black Friday Launch", "New Arrivals — March", "Holiday Collection". Uses a `useMemo` with a random pick on mount.

**4. Theme Preview Chip**
When a seasonal preset is selected, show a small colored preview chip below the theme buttons with the preset's icon + a short mood phrase (e.g., "Fresh pastels, blooming flowers").

**5. Smart Auto-naming**
When a seasonal preset is picked and the name field is still empty, auto-fill the name with e.g., "Summer Drop — March 2026".

**6. Brand Profile Preview Card**
When a brand profile is selected, show a compact inline card below the select with the brand name and a subtle badge. If the profile has colors or a description, show a preview snippet.

**7. Progress Hint / Next Step Nudge**
Add a small muted line at the bottom: "Next: Select products →" to orient the user.

**8. Drop Goal Selector (chips)**
Add optional goal chips above the theme section: "Product Launch", "Social Content", "Seasonal Campaign", "Brand Awareness". Stored in state but purely cosmetic/organizational for now — no backend impact.

**9. Collapsible Brand Profile**
Wrap the Brand Profile section in a Collapsible with a subtle "Brand profile (optional)" trigger, defaulting to collapsed. Opens if a brand is already selected.

**10. Character Counter on Drop Name**
Show a `{name.length}/60` counter below the input, with the counter turning amber at 50+ and red at 60.

## Files
- `src/components/app/CreativeDropWizard.tsx` — all changes in the step 0 render block and minor state additions

