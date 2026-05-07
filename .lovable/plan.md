## Tennis Editorial — Fix Player Direction, Court Position & Camera Angles

### Problems identified in the 5 on-model scenes

1. **Tennis Court Baseline** — Model faces "toward the net" but the prompt doesn't specify which direction the body/camera face relative to the court. A forehand preparation at the baseline means the player faces the net (toward camera or away). The camera should be courtside or slightly behind the baseline shooting across, not from the net end. The model should stand near the center mark or ad/deuce side baseline — not dead center which isn't where baseline play happens.

2. **Clay Court Warm-Up** — Warm-up stretching happens behind the baseline or in the back court area before a match. The prompt doesn't specify where on the court the model stands. Camera should be at court level, shooting from the sideline or slightly diagonal — not elevated above.

3. **Net Approach Portrait** — Model "approaches the net" but doesn't specify direction of movement. A volley approach means the player moves FROM the baseline TOWARD the net — the body should face the net with forward momentum. Camera should be positioned at the net post or slightly past the net shooting back toward the approaching player, or from the side. The model should be inside the service box area, not at the baseline.

4. **Tennis Club Lounge** — No directional issues (seated), but the bench position should specify it's behind the baseline (changeover bench location in real tennis).

5. **Stadium Court Hero** — Model at center T-junction is fine for a campaign hero, but "squared to camera" doesn't specify camera position relative to the court. For a dramatic hero shot, camera should be at one end of the court shooting down the center line, or elevated at the umpire chair angle.

### Fixes per scene (5 updates, skip Flat Lay)

| Scene | Court Position | Body Direction | Camera Angle |
|---|---|---|---|
| **Tennis Court Baseline** | Deuce side (right side) of baseline, 2–3 feet behind baseline | Body facing net, torso coiled for forehand, weight toward net | Camera at sideline level or slightly behind on same baseline end, shooting across the court at ~30° angle. Low angle ~waist height for athletic power. |
| **Clay Court Warm-Up** | Behind the baseline, centered or slightly to ad side | Body facing parallel to net (lateral lunge along baseline direction) | Camera from sideline at court level, shooting diagonally across. Slightly elevated ~15° for warm-up context. |
| **Net Approach Portrait** | Inside the service box, ~8–10 feet from the net | Body moving toward the net, weight on front foot stepping forward | Camera at net post height or just past the net, shooting back toward the player. Or from sideline at net height. |
| **Tennis Club Lounge** | Changeover bench — located at the back of the court behind the baseline, at the midpoint between the two baselines on the sideline | Seated facing courtside | Camera at seated eye level, ~50mm. |
| **Stadium Court Hero** | Center of baseline or just behind center mark | Body facing camera (net behind camera, baseline at feet) | Camera at the opposite end of the court or slightly elevated (broadcast camera angle ~15° above court level), shooting down the length of the court. |

### Scope
- 5 `UPDATE` statements to `prompt_template` via insert tool
- Only rewriting body direction, court position, and camera/composition paragraphs
- Film grading, product dynamics, anti-AI directives, court geometry sections all preserved
- Racket & Gear Flat Lay skipped (no person, no direction)
