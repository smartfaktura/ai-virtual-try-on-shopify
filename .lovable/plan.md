Align two section headers in `src/pages/Settings.tsx` to match the standard used by Notifications / Current Plan sections.

**Standard** (already used by Notifications, Current Plan):
- Title: `text-base font-semibold`
- Subtitle: `text-sm text-muted-foreground mt-0.5`

**Fix 1 — Choose Your Plan (line 530)**
Subtitle "Built for ongoing brand-ready visual production": `text-xs` → `text-sm`. Title already correct.

**Fix 2 — Content Preferences (lines 177–180)**
- Title `<h3>` "Content Preferences": `text-sm font-semibold` → `text-base font-semibold`
- Subtitle `<p>`: `text-xs text-muted-foreground` → `text-sm text-muted-foreground mt-0.5`

Pure presentation tweak, no behavior or layout changes.
