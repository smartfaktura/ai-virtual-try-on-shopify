## Tennis Editorial — 6 Scene Prompt Accuracy Fix

Update `prompt_template` (and `outfit_hint` where needed) for these 6 scenes in `product_image_scenes`:

### Problems to fix across all 6

1. **Court lines are vague** — "crisp white lines" without specifying real tennis geometry (baseline 36ft, service boxes 21ft deep, center mark, singles sidelines, doubles alleys 4.5ft, net at 36" center/42" posts)
2. **Racket handling is generic** — "holding a racket naturally" produces random grips. Must specify real tennis grips (continental for volleys, semi-western for forehands) and correct racket-face angles
3. **Body mechanics lack tennis specificity** — need real footwork (split-step, open/closed stance, unit turn, recovery shuffle)
4. **Props feel decorative** — towel, ball, wristband placement must match real tennis behavior (racket strings-up on bench, towel tucked in waistband during changeover)

### Per-scene fixes

| Scene | ID | Fixes |
|---|---|---|
| **Tennis Court Baseline** | `fa0a39df` | Explicit service box T-junction and center mark at feet. Semi-western forehand grip with racket face closed ~15°. Split-step loading pattern. |
| **Clay Court Warm-Up** | `18ae7b74` | Clay lines = recessed white tape (not painted). Add slide marks and loose granule scatter. Racket across shoulders = grip in dominant hand, head on opposite shoulder. |
| **Net Approach Portrait** | `2c0751b6` | Continental volley grip, racket head above wrist at ~45°. Net white band and cable visible at correct height. Service box T-junction in mid-ground. |
| **Tennis Club Lounge** | `0e7fcb55` | Racket resting strings-up leaning on bench or held by throat. Court visible through terrace must show correct baseline/sideline geometry. |
| **Racket & Gear Flat Lay** | `f547ef0d` | String pattern 16×19 visible. Grip overwrap spiral direction correct. Tennis ball seam = continuous S-curve (not random lines). |
| **Stadium Court Hero** | `471d0334` | Center court T-junction visible at model's feet. Doubles alley lines flanking. Ready position with continental grip, racket at waist, strings facing forward. |

### Scope
- 6 `UPDATE` statements via insert tool (data changes only)
- Film grading, product dynamics, anti-AI directives all preserved
- Only court geometry, racket mechanics, body positions, and prop placement rewritten
