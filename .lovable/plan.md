## Goal

The current Padel Editorial prompts read flat — daylight-even, neutral grade, generic blue-court repetition. Rewrite the 8 scenes in `product_image_scenes` (sub_category = `Padel Editorial`) so every shot has a distinct light recipe, color story, and cinematic atmosphere, while keeping the existing prompt skeleton (identity reference → product reference → scene → styling → environment → camera → light → fabric → photo treatment).

## Per-scene changes

1. **Padel Glass Wall Hero** — `activewear-padel-glass-wall-hero` — **REPLACE COMPLETELY**.
   New concept: "Cage Silhouette at Dusk". Athlete shot through the chain-link cage from outside the court, partial cage-mesh foreground bokeh, racket resting on the shoulder behind the head, low hero stance. Twilight blue-hour exterior club, single hard tungsten spot from a court floodlight carving a warm amber rim across the cheekbone, jaw, and shoulder; cool teal ambient fill from the dusk sky. Title stays "Padel Glass Wall Hero".

2. **Padel Net Volley Ready** — Re-grade: drop the "even daylight" direction; switch to a single hard side-key from a high arena light creating a clean shoulder-to-hip light/shadow split, deep court-blue shadow side, magenta/cyan LED bounce on the cage wires behind. Add foreground net rope soft-bokeh in the lower third.

3. **Back Glass Recovery** — Push the existing motion idea. Add hard backlight from a court floodlight rim-lighting the racket trail and flying hair, hazy air with a subtle volumetric beam through the cage, deep cyan shadow on the glass plus a warm sodium spill from off-court. Strengthen 1/60 motion blur on the racket only.

4. **Padel Club Bench Rest** — **Remove towel** entirely (drop "neatly folded towel" prop). Keep racket leaning, water bottle. Re-grade to late golden-hour with long warm raking light through cage wires casting a striped shadow pattern across the bench, athlete, and floor; cool blue shade behind. Add a single dust-mote ray.

5. **Blue Court Warm-Up** — **Remove racket** entirely (drop "padel racket leans against the leg"). Pure stretch moment, hands free. Upgrade light from "warm golden-hour sunlight" to a more directional low-sun shaft entering from the side door of the cage, creating a hard light-stripe across the body and a deep cool shadow on the rest, classic two-zone cinematic split (warm amber / teal court).

6. **Court Walk Entrance** — Keep "walking through side door" but lean harder into the interior/exterior contrast: cool overcast outside vs. tungsten-warm inside, athlete framed in the doorway as a half-silhouette transitioning into key light, cinematic chiaroscuro. Keep towel on shoulder (it works here as motion).

7. **Serve Prep at Baseline** — **REWRITE** for a more editorial moment. New direction: 85mm tight 3/4 portrait with the back glass wall behind, single hard top-key creating a forehead/cheek/collarbone highlight while body falls into soft court-shadow, slow-shutter feel, atmosphere of suspended breath. Court tones desaturated, skin warm. Ball cradled at the hip not chest height for a more grounded posture.

8. **Post-Match Glass Lean** — **Remove towel** entirely (drop "towel drapes over the neck"). Keep glass lean, racket loose at hip, head tilted back. Upgrade light: single warm side-spill from one floodlight catching the throat, jaw, and condensation on the glass behind; rest of the frame in cool deep-court shade. Subtle steam/breath in the air.

## Cross-scene quality lift (apply to all 8)

Each prompt's **lighting**, **environment**, and **photo treatment** paragraphs get rewritten to include:

- A **named light recipe** (e.g. "single hard floodlight key + cool ambient fill", "twilight rim + tungsten spill", "raking golden-hour through cage wires"). No more "bright even overhead daylight".
- An **editorial color story** per scene (twilight teal/amber, sodium-orange + cyan, desaturated court + warm skin, golden raking + blue shade, etc.) — no two scenes share the same grade.
- **Atmosphere cue**: dust motes, breath haze, faint volumetric beam, condensation on glass, or motion blur on a single element — chosen per scene.
- **Negative space + shadow**: explicit deep shadow zones on at least one side of the frame to break flatness.
- **Grain + grade**: "subtle 35mm film grain, low-contrast filmic grade lifted blacks, slightly desaturated greens" added to every photo treatment paragraph.
- **Lens consistency**: keep existing 35/50/85mm assignments.

The prompt skeleton (identity ref, product ref, fabric physics, "preserve original product structure, color, and logo placement", saugikliai) stays intact — only the creative lighting, color, atmosphere, and prop lines change.

## Technical execution

Single SQL migration that `UPDATE`s `product_image_scenes` rows by `scene_id` for all 8 padel scenes — new `prompt_template` for each, no schema changes, no other columns touched (titles, sub_category, sort order, outfit_hint, suggested_colors all preserved). Glass Wall Hero gets a fully new prompt body under the same `scene_id` and same title.

No frontend changes. No other backend changes.
