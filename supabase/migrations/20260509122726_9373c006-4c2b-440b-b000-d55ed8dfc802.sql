
INSERT INTO product_image_scenes (
  scene_id, title, category_collection, sub_category, sort_order, sub_category_sort_order,
  is_active, subject, shot_style, scene_type, requires_extra_reference, use_scene_reference,
  trigger_blocks, filter_tags, setting, mood, suggested_colors, prompt_template, outfit_hint
) VALUES
(
  'activewear-tennis-clay-bench-rest',
  'Clay Court Bench Rest',
  'activewear', 'Tennis Editorial',
  2542, 9,
  true, 'with-model', 'lifestyle', 'lifestyle',
  false, false,
  ARRAY['personDetails']::text[],
  ARRAY['tennis','clay-court','natural','lifestyle']::text[],
  'European red clay court, courtside wooden bench, quiet premium tennis club',
  'candid restful warm',
  null,
  'Use [MODEL IMAGE] as the identity reference and preserve the person''s real facial structure, skin texture with visible pores, body proportions, posture, hand anatomy, hairline, and natural athletic presence.

Use [PRODUCT IMAGE] {{productName}} as the exact garment reference. Keep the garment fully true to the uploaded product image, including fabric texture, color, seams, logo placement, neckline, waistband, panel construction, fit, opacity, and all visible product details.

Create a natural premium tennis lifestyle scene called "Clay Court Bench Rest".

The athlete is captured candidly during a short rest on a wooden courtside bench beside a European red clay court — not posed for the camera. They sit with relaxed posture, one forearm resting on the thigh, a white towel draped loosely over the shoulder, a stainless water bottle held casually in one hand. The performance racket leans against the bench beside them, frame slightly tilted, grip facing up. Faint clay dust marks the shoes and lower legs from the previous set.

The expression is calm, slightly tired but composed — a real in-between moment, not a performance for the lens.

Frame the bench at a natural angle so the red clay surface fills the lower background with realistic granular texture, faint slide marks, and scattered footprints. The background suggests a quiet premium tennis club: soft green windscreens, blurred fencing, distant trees, the corner of an empty court, warm atmospheric depth.

Shoot from a natural eye-level to slightly low chest-height angle from a 3/4 perspective. Frame as a seated 3/4 body lifestyle composition with generous breathing room and realistic proportions — slightly off-axis like a real candid sports photograph.

Use warm late-afternoon natural sunlight from the side, creating soft side-rim light on the hair, shoulders, arms, and garment edges. The red clay bounces subtle terracotta warmth into the lower body and the underside of the garment. Shadows are soft, naturally connected to the bench and ground, slightly elongated.

Render fabric physics realistically: natural seated folds at the waist and thighs, breathable drape, micro-tension where the garment follows the body. Preserve original product structure, seams, and logo placement at all times.

Photograph the scene like a natural luxury sportswear lifestyle frame on a 50mm lens, shallow but believable depth of field, realistic optical bokeh, sharp natural skin detail, visible textile texture, and authentic warm color grading without filters.',
  'OUTFIT STYLING DIRECTION (NATURAL CLAY-COURT TENNIS):

Style the look as quiet luxury tennis training wear — minimal, athletic, premium, and naturally functional. Nothing should visually compete with {{productName}}.

Pair {{productName}} with authentic clay-court tennis shoes in white, cream, off-white, or soft neutral tones, with realistic clay dust around the outsole and a believable clay-court tread pattern (full herringbone). Shoes must look like genuine performance tennis shoes — never running shoes, basketball shoes, chunky fashion sneakers, or lifestyle trainers.

Use clean low-cut or mid-calf athletic tennis socks in white or warm neutral tones with subtle ribbed compression and natural fabric tension at the ankle. No oversized logos, no colorful graphics, no streetwear styling.

Optional accessories — keep minimal and only if they feel natural in the moment:
- a slim performance wristband,
- a clean visor or thin headband,
- a realistic modern performance racket (graphite/carbon-fiber, accurate 16x19 string pattern, properly tensioned strings, branded overgrip in a visible spiral, proportional grip size).

The racket must look genuinely used by an experienced player — not a fashion prop.

Palette: white, cream, ivory, stone, beige, clay terracotta, muted navy, soft grey, or deep forest green.

ABSOLUTELY NO: basketball shoes, running shoes, chunky sneakers, oversized fashion styling, jewelry-heavy looks, lifestyle handbags, headphones, sunglasses, streetwear layering, neon accessories, yoga props, random sports equipment, or any non-tennis objects.

The styling should feel like a real athlete naturally resting between sets at a premium clay-court club — clean, understated, performance-driven.'
),
(
  'activewear-tennis-hard-court-blue-serve-prep',
  'Blue Hard Court Serve Prep',
  'activewear', 'Tennis Editorial',
  2543, 10,
  true, 'with-model', 'lifestyle', 'lifestyle',
  false, false,
  ARRAY['personDetails']::text[],
  ARRAY['tennis','hard-court','blue','natural','lifestyle']::text[],
  'Blue acrylic hard court (US Open style), modern tournament-grade tennis facility',
  'crisp focused modern',
  null,
  'Use [MODEL IMAGE] as the identity reference and preserve the person''s real facial structure, skin texture with visible pores, body proportions, posture, hand anatomy, hairline, and natural athletic presence.

Use [PRODUCT IMAGE] {{productName}} as the exact garment reference. Keep the garment fully true to the uploaded product image, including fabric texture, color, seams, logo placement, neckline, waistband, panel construction, fit, opacity, and all visible product details.

Create a natural premium tennis lifestyle scene called "Blue Hard Court Serve Prep".

The athlete is captured candidly at the baseline of a blue acrylic hard court — not posed for the camera. They stand in a real pre-serve ritual: bouncing the tennis ball on the court surface with the dominant hand, head tilted slightly downward following the ball, the racket held loose at the side with the non-dominant hand, weight shifting subtly between the balls of the feet. Shoulders are relaxed but engaged, breathing is steady, the jaw soft.

The expression is focused, internal, calm — a quiet reset before the serve, not a performance for the lens.

Place the athlete just behind the baseline with the white court line crisply visible at their feet and the saturated blue acrylic surface filling most of the lower and mid frame. The court shows realistic micro-texture of the painted acrylic, subtle scuff marks, and faint shoe streaks. The background suggests a modern tournament-grade tennis facility: dark blue or deep teal back-wall padding, blurred sponsor signage softened to abstract color blocks, faint scoreboard light, clean atmospheric depth.

Shoot from a natural eye-level to slightly low chest-height angle from the doubles sideline, using a believable 3/4 perspective. Frame as a 3/4 body or full-body lifestyle composition with generous breathing room and realistic proportions — slightly off-axis like a real candid sports photograph.

Use crisp directional daylight or even tournament court lighting from above and the side, creating clean rim light on the hair, shoulders, arms, and garment edges. The blue surface bounces a subtle cool tone into the lower body and the underside of the garment. Shadows are crisp but soft, naturally connected to the surface.

Render fabric physics realistically: gentle natural movement from the standing micro-shifts, light folds at the waist and arms, breathable drape, micro-tension where the garment follows the body. Preserve original product structure, seams, and logo placement at all times.

Photograph the scene like a natural luxury sportswear lifestyle frame on a 50mm lens, shallow but believable depth of field, realistic optical bokeh, sharp natural skin detail, visible textile texture, and authentic neutral color grading without filters.',
  'OUTFIT STYLING DIRECTION (BLUE HARD-COURT TENNIS):

Style the look as quiet luxury tournament tennis wear — minimal, athletic, premium, modern, and naturally functional. Nothing should visually compete with {{productName}}.

Pair {{productName}} with authentic modern hard-court tennis shoes featuring a clean herringbone outsole, low-profile silhouette, and crisp white/black or white/grey colorway with subtle cobalt accents allowed. Shoes must look like genuine performance hard-court tennis shoes — never running shoes, basketball shoes, chunky fashion sneakers, or lifestyle trainers.

Use clean low-cut athletic tennis socks in pure white or black with subtle ribbed compression and natural fabric tension at the ankle. No oversized logos, no colorful graphics, no streetwear styling.

Optional accessories — keep minimal and only if they feel natural in the moment:
- a slim performance wristband,
- a clean cap, visor, or thin headband,
- a realistic modern performance racket (graphite/carbon-fiber, accurate 16x19 string pattern, properly tensioned strings, branded overgrip in a visible spiral, proportional grip size).

The racket must look genuinely used by an experienced tournament player — not a fashion prop.

Palette: white, black, charcoal, cool grey, soft cobalt accents, muted navy, or deep teal — a crisp modern hard-court palette.

ABSOLUTELY NO: basketball shoes, running shoes, chunky sneakers, oversized fashion styling, jewelry-heavy looks, lifestyle handbags, headphones, large sunglasses, streetwear layering, neon accessories, yoga props, random sports equipment, or any non-tennis objects.

The styling should feel like a real athlete naturally focused before a serve at a tournament-grade hard court — clean, understated, performance-driven.'
),
(
  'activewear-tennis-grass-court-volley-ready',
  'Grass Court Volley Ready',
  'activewear', 'Tennis Editorial',
  2544, 11,
  true, 'with-model', 'lifestyle', 'lifestyle',
  false, false,
  ARRAY['personDetails']::text[],
  ARRAY['tennis','grass-court','natural','lifestyle']::text[],
  'Manicured grass tennis court, classic Wimbledon-style club, soft morning light',
  'soft classic alert',
  null,
  'Use [MODEL IMAGE] as the identity reference and preserve the person''s real facial structure, skin texture with visible pores, body proportions, posture, hand anatomy, hairline, and natural athletic presence.

Use [PRODUCT IMAGE] {{productName}} as the exact garment reference. Keep the garment fully true to the uploaded product image, including fabric texture, color, seams, logo placement, neckline, waistband, panel construction, fit, opacity, and all visible product details.

Create a natural premium tennis lifestyle scene called "Grass Court Volley Ready".

The athlete is captured candidly at the net of a manicured grass tennis court — not posed for the camera. They hold a believable volley-ready stance: knees softly bent in a slight athletic crouch, weight forward on the balls of the feet, racket raised at chest height with both hands lightly steadying the throat and grip, eyes tracking forward toward an unseen ball. Shoulders are loose but engaged, breathing is calm, the jaw relaxed.

The expression is alert and present, never theatrical — a quiet anticipation, not a performance for the lens.

Place the athlete just behind the net with the white net cord softly visible in the lower foreground and the manicured short grass surface filling most of the lower frame. The grass shows realistic blade texture, subtle mowing lines, faint baseline wear, and natural color variation. The background suggests a classic premium grass-court club: ivy or dark green windscreens, blurred white-painted fencing or low hedges, distant pavilion silhouette, soft atmospheric depth.

Shoot from a natural eye-level to slightly low chest-height angle from a 3/4 perspective near the singles sideline. Frame as a 3/4 body or full-body lifestyle composition with generous breathing room and realistic proportions — slightly off-axis like a real candid sports photograph.

Use soft cool morning natural sunlight from the side, creating gentle rim light on the hair, shoulders, arms, and garment edges. The green surface bounces a subtle soft green tone into the lower body and the underside of the garment. Shadows are soft and slightly long, naturally connected to the grass.

Render fabric physics realistically: natural micro-tension from the athletic stance, light folds at the waist and arms, breathable drape, subtle compression where the garment follows the body. Preserve original product structure, seams, and logo placement at all times.

Photograph the scene like a natural luxury sportswear lifestyle frame on a 50mm lens, shallow but believable depth of field, realistic optical bokeh, sharp natural skin detail, visible textile texture, and authentic soft color grading without filters.',
  'OUTFIT STYLING DIRECTION (CLASSIC GRASS-COURT TENNIS):

Style the look as quiet luxury classic tennis wear — minimal, athletic, premium, and naturally functional with a Wimbledon-classic restraint. Nothing should visually compete with {{productName}}.

Pair {{productName}} with classic white grass-court tennis shoes featuring a smooth or pimple-pattern outsole appropriate for grass, low-profile silhouette, and pristine all-white or white-with-soft-trim colorway. Shoes must look like genuine performance grass-court tennis shoes — never running shoes, basketball shoes, chunky fashion sneakers, or lifestyle trainers.

Use clean pure-white low-cut athletic tennis socks with subtle ribbed compression and natural fabric tension at the ankle. No oversized logos, no colorful graphics, no streetwear styling.

Optional accessories — keep minimal and only if they feel natural in the moment:
- a slim white performance wristband,
- a clean white visor or thin white headband,
- a realistic modern performance racket (graphite/carbon-fiber, accurate 16x19 string pattern, properly tensioned strings, branded overgrip in a visible spiral, proportional grip size).

The racket must look genuinely used by an experienced player — not a fashion prop.

Palette: pure white, cream, ivory, soft green, muted sage, navy trim — a quiet Wimbledon-classic palette.

ABSOLUTELY NO: basketball shoes, running shoes, chunky sneakers, oversized fashion styling, jewelry-heavy looks, lifestyle handbags, headphones, sunglasses, streetwear layering, neon accessories, yoga props, random sports equipment, or any non-tennis objects.

The styling should feel like a real athlete naturally ready at the net of a heritage grass-court club — clean, understated, performance-driven.'
),
(
  'activewear-tennis-clay-walk-off',
  'Clay Court Walk Off',
  'activewear', 'Tennis Editorial',
  2545, 12,
  true, 'with-model', 'lifestyle', 'lifestyle',
  false, false,
  ARRAY['personDetails']::text[],
  ARRAY['tennis','clay-court','natural','lifestyle']::text[],
  'European red clay court, late-afternoon golden light, walking off after the match',
  'candid warm relaxed',
  null,
  'Use [MODEL IMAGE] as the identity reference and preserve the person''s real facial structure, skin texture with visible pores, body proportions, posture, hand anatomy, hairline, and natural athletic presence.

Use [PRODUCT IMAGE] {{productName}} as the exact garment reference. Keep the garment fully true to the uploaded product image, including fabric texture, color, seams, logo placement, neckline, waistband, panel construction, fit, opacity, and all visible product details.

Create a natural premium tennis lifestyle scene called "Clay Court Walk Off".

The athlete is captured candidly walking off a European red clay court after the match — not posed for the camera. They stride toward the camera at a relaxed natural pace, the racket held in a soft racket cover swinging gently in the dominant hand, the non-dominant hand loose at the side or lifting briefly to the back of the neck. Shoulders are eased down, breathing is steady, the jaw is relaxed. There is faint clay dust on the shoes, lower legs, and the lower edge of the garment.

The expression is calm, satisfied, slightly worn from play — an honest after-match moment, not a performance for the lens.

Place the athlete just past the baseline walking toward the side gate, with the white court line softly visible behind underfoot and the red clay surface filling most of the lower and mid frame. The clay shows realistic granular texture, scattered footprints, subtle drag traces, and a few faint slide marks. The background suggests a quiet premium tennis club: soft green windscreens, blurred fencing, distant trees, an empty bench, warm atmospheric depth, the corner of a clubhouse silhouette out of focus.

Shoot from a natural eye-level to slightly low chest-height angle from a forward 3/4 perspective. Frame as a 3/4 body or full-body lifestyle composition with generous breathing room and realistic proportions — slightly off-axis like a real candid sports photograph.

Use warm late-afternoon golden natural sunlight from behind and the side, creating soft rim light on the hair, shoulders, arms, racket cover, and garment edges. The red clay bounces subtle terracotta warmth into the lower body and the underside of the garment. Shadows are long, soft, and naturally connected to the surface.

Render fabric physics realistically: natural movement from walking, light folds at the waist and arms, breathable drape, micro-tension where the garment follows the body, gentle sway where appropriate. Preserve original product structure, seams, and logo placement at all times.

Photograph the scene like a natural luxury sportswear lifestyle frame on a 50mm lens, shallow but believable depth of field, realistic optical bokeh, sharp natural skin detail, visible textile texture, and authentic warm golden-hour color grading without filters.',
  'OUTFIT STYLING DIRECTION (NATURAL CLAY-COURT TENNIS):

Style the look as quiet luxury tennis training wear — minimal, athletic, premium, and naturally functional. Nothing should visually compete with {{productName}}.

Pair {{productName}} with authentic clay-court tennis shoes in white, cream, off-white, or soft neutral tones, with realistic clay dust around the outsole and a believable clay-court tread pattern (full herringbone). Shoes must look like genuine performance tennis shoes — never running shoes, basketball shoes, chunky fashion sneakers, or lifestyle trainers.

Use clean low-cut or mid-calf athletic tennis socks in white or warm neutral tones with subtle ribbed compression and natural fabric tension at the ankle. No oversized logos, no colorful graphics, no streetwear styling.

Optional accessories — keep minimal and only if they feel natural in the moment:
- a slim performance wristband,
- a clean visor or thin headband,
- a soft fabric or neoprene racket cover in a neutral tone holding a realistic modern performance racket (graphite/carbon-fiber, accurate 16x19 string pattern, properly tensioned strings, branded overgrip in a visible spiral, proportional grip size).

The racket must look genuinely used by an experienced player — not a fashion prop.

Palette: white, cream, ivory, stone, beige, clay terracotta, muted navy, soft grey, or deep forest green.

ABSOLUTELY NO: basketball shoes, running shoes, chunky sneakers, oversized fashion styling, jewelry-heavy looks, lifestyle handbags, headphones, sunglasses, streetwear layering, neon accessories, yoga props, random sports equipment, or any non-tennis objects.

The styling should feel like a real athlete naturally walking off the court after the match at a premium clay-court club — clean, understated, performance-driven.'
);
