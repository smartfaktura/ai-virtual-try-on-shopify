## Goal

Make `/app/help` feel like a genuine personal note from Tomas — backed by a team of pros who handle every reply. Use the freshly uploaded founder portrait, give it more visual presence, soften the copy, and remove the floating chat bubble that competes with the contact form.

---

## Changes

### 1. Add & optimize the new founder photo

- Copy `user-uploads://Tomas.png` into the project.
- Optimize it (resize to 320×320, convert to compressed `.jpg` ~85 quality, strip metadata) — target ~30–50 KB instead of multi-MB.
- Save as `src/assets/founder-tomas.jpg` (overwriting the current asset so existing imports stay valid). No code-side import changes elsewhere.

### 2. Redesign the "From the team" block in `src/pages/AppHelp.tsx`

Make the signature feel like a real introduction rather than a one-line header strip.

New layout (inside the form card, top section):

```text
┌──────────────────────────────────────────────────────────┐
│  ⬤⬤⬤    A NOTE FROM THE FOUNDER                           │
│  ⬤Tom⬤                                                    │
│  ⬤⬤⬤   "Hey — I'm Tomas, founder of VOVV.AI.             │
│         Whatever you send here lands straight with        │
│         our team. We'll get back to you personally,       │
│         usually within a few hours, with a real answer    │
│         — not a canned reply."                            │
│                                                           │
│         — Tomas, founder                                  │
└──────────────────────────────────────────────────────────┘
```

Specifics:
- Larger circular avatar: `w-14 h-14` (was `w-9 h-9`), `ring-1 ring-border`, soft shadow.
- Eyebrow above message: `A NOTE FROM THE FOUNDER` (`text-[11px] uppercase tracking-[0.2em] text-muted-foreground`).
- Personal message in `text-[14px] leading-relaxed text-foreground`, written in first person. No "small team" framing — emphasis on "real answer", "personally", "our team".
- Signature `— Tomas, founder` in `text-[12px] text-muted-foreground italic`.
- `flex items-start gap-4` so the avatar sits beside the paragraph.
- Bump header band padding to `py-5 sm:py-6`.

### 3. Update page subtitle

Tweak the `PageHeader` subtitle to match the warmer tone (no "small team"):

> "A real team of pros behind every reply — usually within a few hours on weekdays"

(No terminal period, per brand voice.)

### 4. Polish the "What to expect" expectations row

- `Where it goes` → `Straight to our team`
- Keep `Reply time` → `A few hours, weekdays`
- Keep `Privacy` → `Stays between us`

### 5. Hide the floating StudioChat widget on `/app/help`

The global `StudioChat` floating bubble currently shows on every `/app/*` page including Help, conflicting with "do not show live customer support icon". In `src/components/app/StudioChat.tsx`, extend the existing early-return logic so it returns `null` whenever `location.pathname === '/app/help'` — on every viewport, not just mobile.

This is the cleanest fix and avoids adding `data-hide-studio-chat` plumbing to the Help page.

---

## Files touched

- `src/assets/founder-tomas.jpg` — replaced with optimized version of the new upload
- `src/pages/AppHelp.tsx` — signature block redesign + subtitle + expectation copy
- `src/components/app/StudioChat.tsx` — hide on `/app/help`

## Out of scope

- No changes to the contact form, FAQs row, footer links, or routing.
- No changes to other pages that use `founder-tomas.jpg` (image is overwritten in place).
