

## Freestyle Studio -- Light Apple-Style Redesign

Transform the Freestyle Studio from a dark-themed interface to a clean, light grey/white Apple-inspired aesthetic with improved UX affordances.

---

### Changes Overview

**1. Light Apple-style prompt bar and page background**

The current dark `bg-sidebar/95` prompt bar will be replaced with a clean white card using soft shadows and rounded corners, matching the app's existing warm-stone light theme. The page background stays the default `bg-background` (warm off-white). The prompt bar becomes a floating card with `rounded-2xl`, subtle border, and soft shadow -- similar to Apple's floating search bars.

**2. "Upload image" label next to the + button**

Currently the + button is unlabeled. A small "Upload image" text label will appear next to it so users immediately understand its purpose.

**3. Quality chip with hover tooltip**

The "Standard" button currently toggles to "High" with no explanation. It will get a tooltip on hover explaining the difference:
- Standard: "Fast generation at standard resolution. 1 credit per image."
- High: "Higher detail and resolution output. 2 credits per image."

**4. Polish toggle with hover tooltip**

The "Polish" chip will get a tooltip explaining: "AI automatically refines your prompt with professional photography techniques for better results."

**5. More prominent CTA (Generate button)**

The Generate button will be larger with stronger visual weight -- a filled primary button with bigger padding, slightly larger text, and a subtle shadow to make it stand out as the clear primary action.

**6. Rounded corners on the prompt container**

The entire bottom bar container will use `rounded-2xl` (or `rounded-t-2xl` if anchored to bottom) with proper shadow and border for a polished, modern card feel.

---

### Technical Details

**Files to modify:**

**`src/pages/Freestyle.tsx`**
- Change the outer prompt bar wrapper from `bg-sidebar/95 backdrop-blur-xl border-t border-white/[0.06]` to a light-themed style: `bg-white/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg` with some margin from the edges
- Add margin/padding so the prompt bar floats as a card within the page rather than being edge-to-edge
- Change the + button from dark-themed colors (`bg-white/[0.03]`, `text-sidebar-foreground/40`) to light Apple-style (`bg-muted hover:bg-muted-foreground/10 text-muted-foreground`)
- Add "Upload image" text label next to the + button
- Change textarea text/placeholder colors from `text-sidebar-foreground` to `text-foreground` / `text-muted-foreground`
- Make the Generate button larger: increase padding, add stronger shadow, use `size="lg"` with `h-12 px-8` and `text-sm font-semibold`
- Change the progress bar colors to match light theme
- Wrap the attached image preview in light-themed styling (white ring instead of white/10)

**`src/components/app/freestyle/FreestyleSettingsChips.tsx`**
- Change all chip colors from dark-themed (`border-white/[0.08]`, `bg-white/[0.04]`, `text-sidebar-foreground/80`) to light Apple-style (`border-border bg-muted/50 text-foreground/70 hover:bg-muted`)
- Wrap the Quality chip in a Tooltip showing the standard vs high explanation
- Wrap the Polish chip in a Tooltip explaining what prompt polishing does
- Import `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` from `@/components/ui/tooltip`

**`src/components/app/freestyle/FreestyleGallery.tsx`**
- Change empty state icon container from `bg-white/[0.03] border-white/[0.06]` to `bg-muted/50 border-border/50` (light theme)
- Adjust text colors to use `text-foreground` and `text-muted-foreground`

**`src/components/app/freestyle/ModelSelectorChip.tsx`**
- Change trigger button from dark chip colors to light Apple-style chip colors

**`src/components/app/freestyle/SceneSelectorChip.tsx`**
- Change trigger button from dark chip colors to light Apple-style chip colors

**No backend changes needed.**

