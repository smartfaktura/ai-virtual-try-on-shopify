

# Light Grey Badges + Smaller Bullet Text in NoCreditsModal

## Changes in `src/components/app/NoCreditsModal.tsx`

### 1. Badge color → light grey
Change the inline badges (SAVE %, NEW) from `bg-primary text-primary-foreground` to `bg-muted text-muted-foreground` on:
- **Line 179** — FreePlanSection bullet badges
- **Line 316** — UpgradeCard feature badges

### 2. Bullet text 1px smaller
- **Line 176** — Change `text-sm` → `text-[13px]` on the bullet `<span>` wrapper

Two lines of badge color + one line of font size. No logic changes.

