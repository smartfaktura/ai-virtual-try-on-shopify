UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 200cm sofa in a 7m-wide room occupies roughly 2/7 (~29%) of the wall — never more. HUMAN SCALE ANCHOR: Imagine a 175cm adult standing beside the product — the product must look dimensionally correct. ARCHITECTURAL CALIBRATION: The standard interior door (210cm × 90cm) is your ruler. Ceiling height (~2.7m) and floor tiles (~60cm) are secondary references. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior image placing {{productName}} in a luminous double-height living room (approximately 7m × 6m, 5m ceiling) with white Calacatta marble flooring featuring soft gray veining. Floor-to-ceiling windows (4.5m tall) along two walls flooding the space with warm natural daylight. Smooth white plaster walls with subtle architectural reveals.

The room should feel naturally styled — not over-decorated. Keep the space clean and airy with only essential complementary elements: a soft off-white wool area rug anchoring the furniture, sheer white voile curtains, and minimal accent pieces that support the furniture without competing. No random objects, no clutter.

The furniture must remain the absolute visual hero, correctly scaled and grounded on the floor. Room palette: pure white, warm cream, soft gray marble veining, brushed brass accents. Bright and inviting.

Lighting: bright, even natural daylight from multiple window walls. Warm golden tone. Soft diffused light, no harsh shadows.

Shot with 28mm lens, eye-level perspective, wide composition. Clean luxury living — Architectural Digest 2026 aesthetic. Photorealistic, editorial quality. No text.'
WHERE scene_id = 'furniture-lifestyle-sunlit-marble-atrium';

UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 200cm sofa in a 6.5m-wide room occupies roughly 2/6.5 (~31%) of the wall — never more. HUMAN SCALE ANCHOR: Imagine a 175cm adult standing beside the product — the product must look dimensionally correct. ARCHITECTURAL CALIBRATION: The standard interior door (210cm × 90cm) is your ruler. Sliding glass doors (280cm tall) are secondary references. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior image placing {{productName}} in a bright, breezy coastal living room (approximately 6.5m × 5.5m, 3m ceiling) with wide-plank whitewashed European oak flooring. Large sliding glass doors (2.8m tall) fully open to a sun-drenched terrace with calm turquoise ocean visible beyond. Smooth white lime-washed walls. Ceiling with exposed whitewashed timber beams. Sheer linen curtains in natural off-white billowing gently.

The room should feel naturally coastal — not staged. Keep styling minimal: a natural jute rug under the furniture, one simple ceramic vase with greenery, and clean open space. Let the ocean view and architecture do the work. No random decorative objects.

The furniture must remain visually dominant and correctly scaled. Color palette: bright white, soft sky blue, bleached wood, natural linen, warm sand. Sun-washed and real.

Lighting: brilliant Mediterranean midday sun streaming through open doors. Bright, clean, even illumination with soft warm shadows from beams.

Shot with 35mm lens, eye-level, slightly off-center composition with ocean visible. Coastal luxury editorial — Côté Maison aesthetic. Photorealistic. No text.'
WHERE scene_id = 'furniture-lifestyle-coastal-breeze-salon';

UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 200cm sofa in an 8m-wide room occupies roughly 2/8 (25%) of the wall — never more. HUMAN SCALE ANCHOR: Imagine a 175cm adult standing beside the product — the product must look dimensionally correct. ARCHITECTURAL CALIBRATION: The standard interior door (210cm × 90cm) is your ruler. Ceiling height 3.2m and floor tiles are secondary references. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior image placing {{productName}} in an ultra-clean gallery-inspired living space (approximately 8m × 6m, 3.2m ceiling) with polished light terrazzo flooring in white and pale gray. Pure matte white walls. Recessed LED strip lighting along the ceiling perimeter. One large-format abstract artwork (150cm × 120cm) in muted tones on the main wall. Bright natural light from a large skylight.

The room should feel like a curated gallery residence — spacious, precise, minimal. Only the artwork, the furniture, and clean architectural surfaces. No decorative objects, no rugs unless the furniture needs grounding. Let negative space and light define the room.

The furniture must remain the absolute visual hero. Color palette: pure white, pale gray, warm white. Absolute visual cleanliness.

Lighting: perfectly even, bright ambient light from recessed fixtures and skylight. Clean, gallery-quality illumination with slight warmth.

Shot with 35mm lens, eye-level, symmetrical centered composition. Gallery-meets-home minimalism — Wallpaper* Magazine aesthetic. Photorealistic. No text.'
WHERE scene_id = 'furniture-lifestyle-cloud-white-gallery';

UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 200cm sofa in a 7m-wide room occupies roughly 2/7 (~29%) of the wall — never more. HUMAN SCALE ANCHOR: Imagine a 175cm adult standing beside the product — the product must look dimensionally correct. ARCHITECTURAL CALIBRATION: The standard interior door (210cm × 90cm) is your ruler. Retracted glass walls (300cm tall) are secondary references. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior image placing {{productName}} in a bright indoor-outdoor living room (approximately 7m × 5.5m, 3m ceiling) with fully retracted floor-to-ceiling glass walls (3m tall) seamlessly connecting to a sunlit terrace. Honed cream travertine flooring flowing continuously from interior to exterior. Clean white plaster ceiling. Mature olive trees in white planters visible on the terrace. A clean white parapet wall with rolling green hills or distant sea beyond.

The room should feel like a luxury resort residence — open, warm, effortless. Keep interior styling minimal: a soft area rug and clean architectural surfaces. Let the indoor-outdoor flow, travertine, and golden light create the atmosphere. No scattered objects.

The furniture must remain visually dominant and correctly scaled. Color palette: warm cream travertine, bright white, soft olive green, warm linen. Bright and warm but not overexposed.

Lighting: warm golden hour afternoon sunlight streaming in from the west. Long gentle shadows. Interior bright and sun-filled.

Shot with 28mm lens, eye-level, wide composition capturing indoor-outdoor flow. Resort luxury living — AD España aesthetic. Photorealistic. No text.'
WHERE scene_id = 'furniture-lifestyle-golden-terrace-lounge';

UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 200cm sofa in a 6m-wide room occupies roughly 2/6 (~33%) of the wall — never more. HUMAN SCALE ANCHOR: Imagine a 175cm adult standing beside the product — the product must look dimensionally correct. ARCHITECTURAL CALIBRATION: The standard interior door (210cm × 90cm) is your ruler. Windows (250cm tall) and fireplace (130cm wide) are secondary references. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior image placing {{productName}} in a refined bright living room (approximately 6m × 5m, 3m ceiling) with pale honed limestone feature wall and smooth white venetian plaster on remaining walls. Wide-plank bleached white oak flooring. Tall windows (2.5m) with elegant Roman shades in natural linen, half-raised. A fluted limestone fireplace surround (130cm wide) with clean lines. Subtle cove lighting around the ceiling perimeter.

The room should feel quietly luxurious — not over-styled. Keep complementary elements to a minimum: a soft neutral rug, simple window treatments, and the fireplace as an architectural anchor. No scattered decorative items. Let material quality (limestone, venetian plaster, oak) speak for itself.

The furniture must remain the clear visual hero. Color palette: pale limestone, warm white, champagne, natural linen. Bright, tonal, quietly opulent.

Lighting: bright soft diffused daylight from large windows. Warm cove lighting supplement. Even, luminous, no dark corners.

Shot with 35mm lens, eye-level, balanced composition. Quiet luxury residential — Milk Decoration aesthetic. Photorealistic. No text.'
WHERE scene_id = 'furniture-lifestyle-silk-stone-residence';

UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 200cm sofa in a 6m-wide room occupies roughly 2/6 (~33%) of the wall — never more. HUMAN SCALE ANCHOR: Imagine a 175cm adult standing beside the product — the product must look dimensionally correct. ARCHITECTURAL CALIBRATION: The standard interior door (210cm × 90cm) is your ruler. Shoji panels (220cm tall) are secondary references. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior image placing {{productName}} in a serene Japandi-inspired living room (approximately 6m × 5m, 2.8m ceiling) with light hinoki-toned wide-plank timber flooring. White limewash walls with subtle chalky texture. Shoji-inspired sliding panels (2.2m tall) in pale ash wood and translucent washi paper filtering soft light. Clean geometric lines throughout.

The room should feel serene and intentional — every element purposeful. Keep styling extremely minimal: a pale flat-weave rug, one recessed wall niche with a single ceramic vessel, and a round paper pendant light overhead. Nothing more. Let the architecture, light, and natural materials create the atmosphere.

The furniture must remain visually dominant and correctly scaled. Color palette: warm white, pale ash, soft warm gray. Absolute serenity — no visual noise.

Lighting: abundant soft natural light filtering through washi panels and a large east-facing window (2m × 1.5m). Even, diffused, bright. Cool-neutral with gentle warmth from timber.

Shot with 35mm lens, eye-level, centered symmetrical composition. Japandi living — Kinfolk meets Casa Brutus aesthetic. Photorealistic. No text.'
WHERE scene_id = 'furniture-lifestyle-luminous-japandi-suite';