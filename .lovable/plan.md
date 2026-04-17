

## `/app` Dashboard consistency audit — branding, spacing, polish

Audited the full file. Here's everything off-pattern, grouped by severity.

### 1. Card sizing inconsistency (HIGH — most visible)

**The "Tools" cards (returning user, lines 645-674) are visibly smaller than every other card on the page.**

| Card group | Padding | Icon container | Title | Description | Button |
|---|---|---|---|---|---|
| Start here / Create Video / More tools | `p-6` | `w-10 h-10` | `text-lg font-bold` | `text-sm` | `min-h-[44px]` |
| **Tools (returning)** | `p-5` ⚠️ | `w-9 h-9` ⚠️ | `text-sm font-bold` ⚠️ | `text-xs` ⚠️ | `h-9 text-xs` ⚠️ |

Same content ("Create Product Visuals", "Create with Prompt", "Explore Examples") appears in both first-run and returning views — but with completely different visual weight. Returning users see a shrunken version.

**Fix:** unify Tools cards to the same standard as the other card groups.

### 2. Heading inconsistency in "Recent Jobs" wrapper

Lines 687-792: there's a **double wrapper** — `rounded-2xl border bg-card overflow-hidden shadow-sm` wrapping another `p-5` div. Other sections present content directly in a grid, no card chrome around the heading group. This makes Recent Jobs feel like a different design language.

**Fix:** drop the outer card wrapper; let the table sit directly under the heading like every other section. Or keep the wrapper but use consistent `p-6` padding.

### 3. Returning user welcome block — different from first-run

| | First-run (line 311) | Returning (line 526) |
|---|---|---|
| h1 size | `text-3xl sm:text-4xl` | `text-2xl sm:text-4xl` ⚠️ smaller mobile |
| Subtitle | `text-lg ... mt-2` | `text-sm sm:text-lg ... mt-1 sm:mt-2` ⚠️ smaller mobile |

Returning users get a measurably smaller welcome on mobile. No reason for the divergence.

**Fix:** align returning header to `text-3xl sm:text-4xl` / `text-lg ... mt-2`.

### 4. Button label inconsistency

- All cards say **"Open"** — except Short Films card (line 441) which says **"Explore"**.
- All workflow CTAs use `→` arrow, consistent.

**Fix:** change Short Films to "Open" for consistency. Beta badge already signals it's different.

### 5. Icon stroke weight / sizing variance in Tools section

Lines 647, 657, 667 use `w-4.5 h-4.5` — Tailwind has no `w-4.5` utility. This silently falls back to no class, defaulting to natural icon size. Likely renders inconsistently.

**Fix:** use `w-5 h-5` like the rest, with `w-10 h-10` icon container.

### 6. "Best place to start" / "More creative control" / "Good first look around" microcopy

Lines 355, 373, 391: small grey hint above the button using `text-xs text-muted-foreground/60`. Only appears on first-run "Start here" cards — not on Create Video, More tools, or returning Tools. Inconsistent rhythm; either show it everywhere or nowhere.

**Fix:** remove these three hints. The card title + description already explain the purpose; the hint feels like apologetic copy.

### 7. Section spacing — first-run vs returning

Both wrappers now use `space-y-12 sm:space-y-16` ✅ (good — recently unified).

But the **resolving placeholder** (line 295) still uses `space-y-6 sm:space-y-10`. Minor — only visible for ~200ms during load.

**Fix:** align to `space-y-12 sm:space-y-16`.

### 8. Branding — VOVV.AI

`SEOHead title="Dashboard — VOVV.AI"` ✅ correct. No branding violations found in dashboard copy.

---

### Recommended scope (what I'd ship)

**Tier A — clear wins, low risk:**
1. Resize "Tools" cards (returning) to match the standard card system → biggest visual improvement
2. Align returning-user welcome heading to first-run sizing
3. Fix `w-4.5` invalid Tailwind classes
4. "Short Films" button: "Explore" → "Open"
5. Remove the three microcopy hints under Start-here cards (optional — could also keep & extend everywhere)

**Tier B — structural cleanup:**
6. Unwrap "Recent Jobs" double card chrome
7. Align resolving-state spacing

### Question before I implement

**Microcopy hints ("Best place to start", etc.):**
- **Remove them** — cleaner, lets cards speak for themselves
- **Keep & extend** — add similar hints to all card groups so the rhythm is consistent

