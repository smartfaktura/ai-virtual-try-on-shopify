

# Fix FreestylePromptCard Hover & Reduce Repetition

## Problems
1. **Hover mismatch**: FreestylePromptCard uses `hover:-translate-y-0.5` (lifts up), while `WorkflowCardCompact` only uses `hover:shadow-lg` (shadow only, no translate). This makes the freestyle card visually "jump" compared to siblings.
2. **"Create with Prompt" appears 3 times** — badge, title, and button all say the same text.
3. **Tagline is plain text** — "Any Product · Any Model · Any Scene · Any Lighting" could be styled as subtle pills for visual interest.

## Changes — `src/components/app/FreestylePromptCard.tsx`

### 1. Fix hover (line 65)
Remove `hover:-translate-y-0.5` to match WorkflowCardCompact behavior (shadow-only hover).

### 2. Restyle tagline as pills (lines 89-92)
Replace the plain `<p>` tagline with four small pill badges:
```
Product · Models · Scenes · Lighting
```
Each as a tiny `rounded-full bg-foreground/[0.05] text-foreground/50 px-2 py-0.5 text-[9px]` chip in a flex row with small gap.

### 3. Reduce repetition — differentiate copy
- **Badge** (line 84-87): Keep as `✦ Freestyle Studio` (brand name, not action)
- **Title** (line 123): Change to `Freestyle Studio`
- **Subtitle** (line 126): Keep `Describe any shot, scene, or style you want.`
- **Button** (line 138): Keep `Create with Prompt →` (the only action CTA)

This way "Freestyle Studio" names the feature, and "Create with Prompt" is the action — no triple repetition.

