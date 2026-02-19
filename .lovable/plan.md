

## Fix: Credit Banner Colors, Button States, and Mobile Text

### Issues Found

1. **"Out of credits" banner** uses `bg-primary` (dark navy) -- same color as the sidebar/navigation. Looks like part of the nav, not a warning. Needs a distinct color.
2. **"Buy Credits" button in prompt panel** uses orange styling -- user wants it grey/neutral instead.
3. **Mobile text shows truncated "+4 cred"** -- the shortfall message `+{creditCost - balance} credits` is getting cut off on small screens. Needs rewording.
4. **Disabled Generate button** uses lowered opacity which looks bad on desktop -- needs a clean muted style without opacity tricks.

### Changes

#### 1. LowCreditsBanner -- New Color Scheme
**File: `src/components/app/LowCreditsBanner.tsx`**

Replace `bg-primary text-primary-foreground` with a soft warm/amber warning style that stands apart from the dark navy navigation:
- Light: `bg-amber-50 text-amber-900 border border-amber-200`
- "Buy Credits" button: `bg-amber-600 text-white hover:bg-amber-700` (warm, distinct from nav)
- Sparkles icon: amber tinted
- Works across mobile/tablet/desktop

#### 2. Generate Button -- Grey "Buy Credits" State
**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**

Replace the orange "Buy Credits" button with a neutral/grey style:
- `bg-muted text-foreground border border-border` -- clearly different from the active blue, but not alarming orange
- No lowered opacity on the disabled state -- use explicit `bg-muted text-muted-foreground` colors instead

#### 3. Fix Mobile Shortfall Text
Replace `+{creditCost - balance} credits` (which truncates to "+4 cred") with a clearer short message:
- Mobile: `"Not enough credits"` (no numbers, no truncation)
- Desktop: `"Need {X} more credits"` (unchanged)

### Technical Summary

| File | What Changes |
|------|-------------|
| `LowCreditsBanner.tsx` | Banner bg from dark navy to amber/warning. Button color to amber. |
| `FreestylePromptPanel.tsx` | "Buy Credits" button from orange to grey/neutral. Mobile shortfall text fixed. Disabled button uses explicit muted colors (no opacity). |

