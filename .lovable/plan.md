## Scope — `src/pages/video/AnimateVideo.tsx` only

Pre-upload screen polish. Global "You're out of credits" banner is NOT touched.

### 1. Remove the avatar-stack "VOVV.AI Studio" banner
Lines 773–794. The whole `<div>` with `TIPS_TEAM` avatars + "We detect category, scene type, and motion opportunities…" — delete it. The copy is already covered by the upload-card subtitle and by the right-rail "VOVV detects context" row, and the cartoon-avatar pattern doesn't appear anywhere else in the app.

### 2. Batch Mode header — drop the avatar for free users
Lines 594–604. Use the same `Images` icon tile both states currently share for paid users:
```
<div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
  <Images className="h-3.5 w-3.5 text-primary" />
</div>
```
Keeps the row visually consistent and removes the second cartoon avatar from the page.

### 3. Right rail — unify eyebrow labels
"How it works" (line ~672, title case) becomes an uppercase eyebrow that matches "BEST RESULTS" and the sidebar (`WORKSPACE`, `ASSETS`):
```
<p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">How it works</p>
```
No structural change — same card, same items.

### 4. Tighten header rhythm
Line 563: outer container `space-y-6 sm:space-y-8` → `space-y-5 sm:space-y-6`. Brings the upload card up about 8px on desktop without crowding mobile.

### 5. Empty upload zone — quiet polish
The big dashed dropzone reads placeholder-y. Two small moves on the dropzone wrapper:
- Swap the dashed border for a subtle solid `border-border/60` with a faint inset gradient `bg-gradient-to-b from-muted/20 to-transparent`.
- The icon stays, but bump the upload glyph to `text-foreground/70` (currently muted) so it reads as "ready", not "disabled".

No behavior, no copy changes beyond removing the banner block.

## Out of scope
- Top "You're out of credits" global banner (untouched, per request)
- Right rail card structure
- Mid-flow VOVV.AI Studio messages at lines 1154 and 1410 (those appear during analysis/results — different context, kept)