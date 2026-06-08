# Improve perceived loading on `/app/generate/product-images`

**Scope:** frontend only — one file: `src/components/app/product-images/ProductImagesStep5Generating.tsx`. No backend, no edge function, no queue logic touched. Real completion still gates the final 100% — we only reshape the *perceived* progress curve and tune the estimate copy.

## Problems

1. **Bar feels stuck.** Today `displayPct` advances roughly linearly with elapsed time (`(elapsed / totalEstSeconds) * 15` floor) and only jumps when real jobs finish. First 30s users see 2–6%.
2. **Estimate is scary.** Copy uses `10–15 s/image`, so 10 visuals → "Estimated ~2–3 min", 20 → "~4–5 min". Real average is ~1–2 min for 5–20 visuals.

## Changes (single file)

### 1. New eased progress curve — fast start, slow finish

Replace the `displayPct` block (lines ~87–92) with a curve that:

- **0 → 70%** in the first ~40% of the time budget (fast ramp the user immediately sees moving).
- **70 → 90%** over the next ~40% of time (visibly slower).
- **90 → 95%** asymptotic crawl (eases toward but never hits 95% on time alone).
- **Real `pct`** (from actual completed jobs) always wins if higher — so the bar still jumps forward when scenes complete.
- **100%** only when `completedJobs >= effectiveTotal` (unchanged truth gate).

Pseudo:
```ts
const t = Math.min(elapsed / totalEstSeconds, 1.5); // can exceed 1 if slow
let timeCurve: number;
if (t < 0.4)       timeCurve = (t / 0.4) * 70;              // 0 → 70
else if (t < 0.8)  timeCurve = 70 + ((t - 0.4) / 0.4) * 20; // 70 → 90
else               timeCurve = 90 + (1 - Math.exp(-(t - 0.8) * 3)) * 5; // 90 → ~95 asymptote

const ceiling = completedJobs >= effectiveTotal ? 100 : 95;
const displayPct = Math.min(ceiling, Math.max(Math.round(timeCurve), pct, 2));
```

Queuing phase keeps its existing 2–10% mapping (untouched).

### 2. Tighter per-image budget for estimate + curve

Tune two constants to match observed reality (~1–2 min for 5–20 visuals):

- `estimatePerImage`: **8 → 5** seconds (drives the curve's time budget).
- Estimate copy formula (lines ~122–123):
  - `lowMin`: `(effectiveTotal * 10) / 60` → `(effectiveTotal * 5) / 60`
  - `highMin`: `(effectiveTotal * 15) / 60` → `(effectiveTotal * 8) / 60`

Result examples:
| Visuals | Old copy | New copy |
|---|---|---|
| 5  | ~1–2 min   | ~1 min     |
| 10 | ~2–3 min   | ~1–2 min   |
| 20 | ~4–5 min   | ~2–3 min   |

Floor stays `Math.max(1, …)` so we never show "0 min".

### 3. Phase threshold nudge (small)

`phase === 'finishing'` currently triggers at real `pct >= 80`. Keep that — it's still tied to real completions, so "Finishing touches" headline only appears when most jobs truly finished. No change needed here; the perceived curve sitting at ~90% while real `pct` is 60% will still show "Generating your visuals" headline, which is correct.

## Why this works

- User sees the bar climb past 50% in the first ~20–25 s → feels responsive.
- The deliberate slowdown after 70% sets expectation that "almost done" takes a beat — and when real jobs actually complete, the bar jumps forward, which feels like *acceleration* (a positive surprise) rather than catching up.
- Bar physically cannot reach 100% before results are ready — no false promises.
- Estimate copy aligns with reality, so users don't bail expecting 5 min when it's 90 s.

## Risk / reversibility

- Single component, ~15 lines changed. Trivial to revert.
- No state, API, schema, or queue impact.
- If a generation actually does run slow (3+ min), the existing `showSlowWarning` (≥180 s) and `displayPct` capped at 95% keep the user informed honestly.

## Validation

- Eyeball 1-visual, 5-visual, 10-visual, 20-visual runs in preview.
- Confirm bar reaches ~70% within ~30 s on a 10-visual job, sits in the 85–95% band while last 2–3 finish, then snaps to 100% on real completion.
- Confirm "Estimated" copy reads ~1–2 min for 10 visuals.
