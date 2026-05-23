## Changes

### 1. Rename Skip card + restore subtitles (`Step4Cast.tsx`)

Rename **"Skip — auto-cast"** → **"Auto-cast"** (no em-dash) and put a one-line subtitle back on both cards so the choice is self-explanatory:

- **Auto-cast** — "We'll pick cast, scale and interaction for you"
- **Design the look** — "Walk through People, Interaction and Styling"

Cards stay in the same 2-col grid; subtitle is the same muted `text-[11px]` used elsewhere.

### 2. Skip actually auto-picks defaults (`Step4Cast.tsx`)

Today picking Skip only writes `design_specific_look = "skip"` — the user then lands on Essentials with missing cast preset / interaction / scale and the Next button stays disabled. Fix `setMode("skip")` to also seed sensible defaults in the same `onCastChange` / `onScaleChange` call:

- `cast.preset` ← keep current, else `resolved.defaultCast`
- `cast.interaction` ← keep current, else first entry of `visibleInteractions` (already filtered against `forbiddenInter`)
- `scale.preset` ← keep current, else `resolved.scale.default`

These are exactly the three fields `getSubStepDisabledReason("essentials", …)` checks, so after Skip the Essentials step is valid and the wizard can advance immediately. `setMode("yes")` is unchanged.

### 3. Tab-bar spacing (`Step4Cast.tsx`)

Current row uses `gap-1.5` with `px-3.5` pills — active pill has a filled background, inactive labels don't, which makes the gap look uneven (as in screenshot: "Look" pill abuts "Essentials" tightly, "Essentials → People → Interaction → Styling" drift). Switch to a more Typeform-like underline row:

- Container: `flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border/50 pb-3`
- Each tab: text-only button `pb-2 text-[12px] font-medium` with a 2px underline applied via `border-b-2 border-foreground` when active, `border-transparent` otherwise. Remove the filled-pill background entirely.
- Inactive: `text-muted-foreground hover:text-foreground`. Done check stays inline next to the label.
- "Step X of Y" stays right-aligned via `ml-auto`.

Result: even rhythm between tabs, clear active indicator, no jarring pill width difference.

## Out of scope

- No changes to step4Flow logic, validation, prompt, or other sub-steps
- No changes to Environment / Photography (already re-chaptered)