## Phase 7o — Subfamily-coverage audit & gap closure

Audited every subfamily across the 4 places the wizard is supposed to be category-aware. Listing findings by severity, then proposing a focused fix.

### How the wizard is supposed to know about subfamilies

| Registry | Purpose | What I checked |
|---|---|---|
| `registry/settingsBySubfamily.ts` (`POOLS`) | Per-scene-type setting suggestions | One entry per `module/sub_family` |
| `registry/storytellingBySubfamily.ts` (`MOMENTS`) | Storytelling moments pill list | Same key shape |
| `registry/categoryPresets.ts` (`PRESETS.sub`) | Bundles: lens, depth, mood, interaction, cast, body_part_focus | Per-subfamily override map |
| `constants/extras.ts` `subFamilyOnly` / `subFamilyExcept` | Hide/show specific extras pill blocks | Field-level gating |

**Subfamily inventory** — 37 slugs across 12 families:
```
fashion (9):    garments, hoodies, dresses, jeans, jackets, activewear, swimwear, lingerie, streetwear
footwear (4):   shoes, sneakers, boots, high-heels
bags-acc (5):   bags-accessories, backpacks, wallets-cardholders, belts, scarves
hats (3):       caps, hats, beanies
watches (1):    watches
eyewear (1):    eyewear
jewelry (4):    rings, necklaces, earrings, bracelets
beauty (3):     beauty-skincare, makeup-lipsticks, fragrance
home (2):       home-decor, furniture
tech (1):       tech-devices
food-drink (3): food, beverages, snacks-food
wellness (1):   supplements-wellness
```

### Findings — severity ranked

**HIGH-1 · `hats-caps-beanies` has zero subfamily overrides.**
`PRESETS["hats-caps-beanies"]` exists but has **no `sub` block** and no `settings` array on the parent either. Caps (sport/skate), hats (editorial/formal), beanies (cold-weather) all render with identical pickers. Settings pool registry is fine, but Step3 mood/lens/interaction presets are family-wide only.

**HIGH-2 · Footwear is the most diverse family — only 3 of 4 subs have overrides.**
`PRESETS.footwear.sub` covers high-heels, sneakers, boots — but **`shoes`** (loafers, oxfords, dress shoes) falls through to the family default which leans casual (`["Urban street","Studio cyclorama","Tabletop surface","Nature","Architectural interior"]`). Dress shoes want indoor lifestyle / architectural emphasis, narrower lens (`["portrait","tele"]`), no Nature.

**HIGH-3 · Fashion has 9 subs, only 4 have overrides.**
Missing `sub` entries for **streetwear, jackets, hoodies, jeans, garments**. Streetwear in particular needs the same `moods: ["Energetic","Confident","Cinematic"]` treatment activewear gets — currently inherits generic fashion mood. Jackets/jeans are mostly fine via settings pool, but streetwear is a real gap.

**MED-1 · No subfamily-specific extras fields outside swimwear / lingerie.**
Today `swim_styling`, `wetness`, `lingerie_layer` are the only `subFamilyOnly` extras. Several subfamilies have product-defining attributes the user can't currently express:

| Subfamily | Missing extras pill |
|---|---|
| watches | Strap material (leather / metal mesh / rubber / NATO), Dial time (10:10 convention vs. live) |
| eyewear | Lens tint (clear / smoke / mirror / gradient / colored), Frame material (acetate / metal / titanium) |
| jewelry (all 4) | Metal tone (yellow gold / white gold / rose gold / silver / platinum), Stone presence (no stone / single / pavé) |
| footwear (sneakers, boots) | Lacing state (laced / unlaced / kicked-off), Sole emphasis (sole visible / hidden) |
| activewear | Sweat finish (dry / pre-workout / mid-workout glow / post-shower) |
| beauty-skincare | Texture state (closed jar / open jar / dollop on hand / on-skin) |
| beverages | Liquid state (still / pour mid-air / fizz rising / condensation beads) |
| supplements-wellness | Packaging state (label-front / cap-off / pills-out / tray pour) |

Some overlap exists in `STUDIO_FX` and `MOTION_ENERGY` (pour, splash, steam) but they're scene-level and not subfamily-gated.

**MED-2 · Several `MOMENTS` lists are thin (3 entries).**
Earrings, bracelets, belts have only 3 moments while peers have 4–5. Storytelling pickers feel anemic on those subs.

**LOW-1 · `bags-accessories/bags-accessories` parent slug has no `sub` entry.**
Falls through to family default, which is reasonable but leaves the umbrella "bags" picker undifferentiated from belts/scarves at the bundle layer.

**LOW-2 · Tech/wellness/food single-sub families have no fine-grained gates.**
Acceptable — these can be addressed via MED-1 extras instead of new bundles.

### Proposed fix — three commits, all additive

**7o-A · Bundle gaps** (`registry/categoryPresets.ts` only):
- Add `hats-caps-beanies.sub = { caps, hats, beanies }` with distinct settings + interactions + body_part_focus + moods.
- Add `hats-caps-beanies.settings` family default.
- Add `fashion.sub.streetwear` (mood: Confident/Cinematic/Bold, interactions: wearing/hero, default cast: solo).
- Add `fashion.sub.jackets`, `.hoodies`, `.jeans`, `.garments` minimal overrides — lens/moods only; settings already perfect via POOLS.
- Add `footwear.sub.shoes` (settings: indoor lifestyle + architectural + studio; lens: portrait/tele; no "feet" body-part-focus emphasis).
- Add `bags-accessories.sub["bags-accessories"]` umbrella defaults.

**7o-B · Subfamily-gated extras** (`constants/extras.ts`):
Add 8 new fields with `subFamilyOnly` gates from the MED-1 table above. Each follows the existing `ExtrasField` shape (label / prefix / presets / scope / castOnly where appropriate). Wired into `applicableFields` automatically — no Step3/Step4 changes needed.

**7o-C · Storytelling top-up** (`registry/storytellingBySubfamily.ts`):
Pad earrings (3→5), bracelets (3→5), belts (3→5), and any other ≤3-entry list to 5 moments. Pure data add.

### Tests

New `wizard-polish-7o.test.ts` verifies:
- `resolvePresets("hats-caps-beanies","caps")` returns a different settings + interactions array than `("hats-caps-beanies","beanies")`.
- `resolvePresets("footwear","shoes")` excludes "Nature" and "Tabletop surface".
- `applicableFields` returns `strap_material` for `watches/watches` and **not** for `eyewear/eyewear`.
- `applicableFields` returns `metal_tone` for all 4 jewelry subs.
- `assembleSceneDirective` emits `Strap material: leather.` when the watch extra is set.
- `getStorytellingMoments("jewelry","jewellery-earrings")` returns ≥ 5 entries.

### Files
- **Edited**: `registry/categoryPresets.ts`, `constants/extras.ts`, `registry/storytellingBySubfamily.ts`.
- **New**: `__tests__/wizard-polish-7o.test.ts`.

No DB / schema / type-contract changes. Everything resolves via existing cascade — old saved scenes keep loading because all new fields are optional and the resolver already falls through to family defaults.

### Out of scope (worth flagging, not doing now)

- Per-subfamily prompt-architecture nudges (e.g. "boots: emphasize ground texture") — better handled in `assembleSceneDirective` aesthetic block in a later phase.
- New subfamilies (e.g. splitting "jackets" into puffer/leather/blazer) — taxonomy decision outside the wizard.
- Localised label translations for new pills — current wizard is English-only.