

# Freestyle Studio Card — Brand New React-Driven Approach

## Why previous attempts failed
The CSS-only approach is fundamentally broken: `animation-fill-mode: forwards` (typewriter plays once) conflicts with `animation-iteration-count: infinite` (loop wrapper). The `max-width: ch` technique also doesn't work reliably in narrow card containers with `white-space: nowrap`. No amount of CSS tweaking will fix this — it needs a different architecture.

## New approach: React state machine + CSS transitions

Replace all CSS keyframe animations with a simple React `useEffect` interval that drives a phase state machine. The typewriter becomes `text.substring(0, charIndex)` — guaranteed to work at any width. CSS handles only transitions (opacity, transform), not sequencing.

**File: `src/components/app/FreestylePromptCard.tsx` — Full rewrite**

### Structure (matches WorkflowCardCompact exactly)
- Same `Card` wrapper, same classes
- `aspect-[3/4]` thumbnail area (or `aspect-[2/3]` on mobileCompact)
- Content area: same padding, font sizes, filled primary CTA button (not outline)

### Animation state machine (React-driven)
```
Phase 0: Empty prompt bar, cursor blinking
Phase 1: Typewriter — charIndex increments every 60ms via setInterval
Phase 2: Send button pulses briefly  
Phase 3: Pills fade in (staggered 200ms each)
Phase 4: Hold for 2s
Phase 5: Everything fades out, reset to Phase 0
```

Total loop: ~8s. All sequencing via `setTimeout` chains in a single `useEffect`. IntersectionObserver pauses/resumes when card is off-screen.

### Typewriter implementation
- `const visibleText = PROMPT_TEXT.substring(0, charIndex)`
- Rendered as regular `<span>` — no `white-space: nowrap`, no `overflow: hidden`, no `max-width`
- Text wraps naturally within the prompt bar — looks like real typing
- Blinking cursor: a `<span>` after the text with CSS `opacity` toggle via `animate-pulse`

### Visual details
- Prompt bar: `rounded-xl bg-muted/40 border border-border/40 p-3`
- Pills use CSS `transition: opacity 0.4s, transform 0.4s` triggered by state boolean
- Send icon transitions `opacity` and `scale` via inline style
- Ambient glow: simple static radial gradient (no animation needed)

### Content area
- Title: "Freestyle Studio" — `text-sm font-bold` (matches other cards)
- Description: "Type anything. Get styled visuals." — `text-xs text-muted-foreground`
- CTA: filled primary `Button` with "Start Creating" — same as WorkflowCardCompact

