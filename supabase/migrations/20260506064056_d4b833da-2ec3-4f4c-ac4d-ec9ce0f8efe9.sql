
UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — COMPLETE INTERIOR COMPOSITION: This is a full room interior photograph of a CHILD''S ROOM, NOT a product-only shot. The product from the reference image must be placed naturally inside a fully furnished, realistic children''s bedroom. If the product is a bed or crib, show it as the centerpiece with a small bookshelf nearby holding a few children''s books, a woven toy basket on the floor with a couple of soft toys visible, and a cozy area rug beneath. If the product is a desk or table, show it with a child-sized chair, a few colored pencils in a cup, and a sketchbook. If the product is a shelf or storage unit, show it in a room that also contains a bed, a soft rug, and a reading nook corner. The scene must look like a real child''s bedroom — warm, lived-in, and age-appropriate — never an isolated product in an empty adult room.

KIDS ROOM IDENTITY: The room must clearly read as a child''s space. Include these subtle cues: a soft knitted throw or blanket draped on the bed, one or two plush stuffed animals (a bunny or bear), a small stack of illustrated children''s books, a woven storage basket with soft toys peeking out, and child-scale wall art or a simple mobile. These items should feel curated and tasteful — not chaotic or overly colorful. The room should feel like it belongs to a child while maintaining the luxury aesthetic.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 120cm crib in a 4m-wide room occupies roughly 30% of the wall. A 60cm bedside table spans 15% of a 4m wall. Use these proportions strictly. HUMAN SCALE ANCHOR: Imagine a child (~120cm tall, age 6-8) standing beside the product — the product must look dimensionally correct relative to that invisible child. Standard crib height is ~90cm. Toddler bed height is ~50cm from floor. Child desk height is 55-60cm. Child chair seat height is 30-35cm. ARCHITECTURAL CALIBRATION: The standard interior door (210cm x 90cm) is your ruler. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior photograph placing {{productName}} in a warm Scandinavian nursery (approximately 4m x 3.5m, 2.7m ceiling) with wide-plank honey oak flooring in a natural matte finish. Walls in smooth hand-applied cream plaster with subtle trowel texture. One large arched window (1.8m x 2m) with slim oak frame, letting in soft golden morning light. Sheer linen curtains in warm white, gently pooling on the floor.

The room should feel serene, warm, and unmistakably a child''s space. A soft wool area rug in oatmeal tone anchors the room. Include a small wooden bookshelf with children''s books, a woven basket with a knitted blanket draped over the edge, and one plush animal on the bed or nearby surface. Room palette: honey oak, warm cream, soft oatmeal, natural linen. Cozy, refined, Nordic warmth.

Lighting: soft golden morning light from the arched window. Warm, even illumination with gentle directional shadows. No harsh highlights.

Shot with 35mm lens, eye-level, balanced composition showing the full furnished room. Architectural nursery — Kinfolk Magazine aesthetic. Photorealistic. No text.'
WHERE scene_id = 'child-warm-oak-nursery';


UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — COMPLETE INTERIOR COMPOSITION: This is a full room interior photograph of a CHILD''S ROOM, NOT a product-only shot. The product from the reference image must be placed naturally inside a fully furnished, realistic children''s bedroom. If the product is a bed or crib, show it as the centerpiece with a small bookshelf nearby holding a few children''s books, a woven toy basket on the floor with a couple of soft toys visible, and a cozy area rug beneath. If the product is a desk or table, show it with a child-sized chair, a few colored pencils in a cup, and a sketchbook. If the product is a shelf or storage unit, show it in a room that also contains a bed, a soft rug, and a reading nook corner. The scene must look like a real child''s bedroom — warm, lived-in, and age-appropriate — never an isolated product in an empty adult room.

KIDS ROOM IDENTITY: The room must clearly read as a child''s space. Include these subtle cues: a soft knitted throw or blanket draped on the bed, one or two plush stuffed animals (a bunny or bear), a small stack of illustrated children''s books, a woven storage basket with soft toys peeking out, and a child-height coat hook or small canvas art print on the wall. These items should feel curated and tasteful — not chaotic or overly colorful. The room should feel like it belongs to a child while maintaining the luxury aesthetic.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 120cm crib in a 4m-wide room occupies roughly 30% of the wall. A 60cm bedside table spans 15% of a 4m wall. Use these proportions strictly. HUMAN SCALE ANCHOR: Imagine a child (~120cm tall, age 6-8) standing beside the product — the product must look dimensionally correct relative to that invisible child. Standard crib height is ~90cm. Toddler bed height is ~50cm from floor. Child desk height is 55-60cm. Child chair seat height is 30-35cm. ARCHITECTURAL CALIBRATION: The standard interior door (210cm x 90cm) is your ruler. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior photograph placing {{productName}} in a modern children''s room (approximately 4m x 3.5m, 2.7m ceiling) with light oak herringbone parquet flooring. Feature wall in matte sage green (muted, earthy — not bright). Remaining walls in smooth warm white plaster. One tall rectangular window (1.6m x 2m) with minimal white frame, flooding the room with soft diffused daylight.

The room should feel grounding, calm, and clearly a child''s space. A flat-weave cotton rug in natural ecru grounds the furniture area. Include a low wooden toy shelf with a few items, a linen floor cushion for reading, a small woven basket with books, and a soft plush animal on the bed. Sheer linen curtains in off-white frame the window. Room palette: sage green, warm white, natural oak, ecru cotton. Earthy, serene, contemporary.

Lighting: soft diffused daylight from the window. Even, gentle illumination. Subtle warm tone. No dramatic shadows.

Shot with 35mm lens, slightly above eye-level, balanced composition showing the full furnished room with sage wall. Modern children''s interior — Elle Decoration aesthetic. Photorealistic. No text.'
WHERE scene_id = 'child-sage-plaster-playroom';


UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — COMPLETE INTERIOR COMPOSITION: This is a full room interior photograph of a CHILD''S ROOM, NOT a product-only shot. The product from the reference image must be placed naturally inside a fully furnished, realistic children''s bedroom. If the product is a bed, show it with a modern low bookshelf nearby, a chunky knit throw, and a small reading lamp. If the product is a desk or table, show it with a child-sized chair and creative supplies. If the product is a shelf or storage unit, show it in a room that also contains a bed, a play area rug, and age-appropriate accessories. The scene must look like a real child''s urban loft bedroom — never an isolated product in an empty room.

KIDS ROOM IDENTITY: The room must clearly read as a child''s space despite the industrial aesthetic. Include these cues: a chunky knit blanket on the bed, a canvas teepee or reading tent in one corner, a couple of wooden toys on the floor, a small stack of picture books, and one plush animal. The industrial materials should be softened by these warm, child-friendly elements. Curated and tasteful — not cluttered.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 120cm crib in a 4m-wide room occupies roughly 30% of the wall. A 60cm bedside table spans 15% of a 4m wall. Use these proportions strictly. HUMAN SCALE ANCHOR: Imagine a child (~120cm tall, age 6-8) standing beside the product — the product must look dimensionally correct relative to that invisible child. Standard crib height is ~90cm. Toddler bed height is ~50cm from floor. Child desk height is 55-60cm. Child chair seat height is 30-35cm. ARCHITECTURAL CALIBRATION: The standard interior door (210cm x 90cm) is your ruler. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior photograph placing {{productName}} in an architectural children''s loft room (approximately 4m x 3.5m, 3m ceiling) with polished micro-cement flooring in warm light gray. Feature wall in raw board-formed concrete with subtle wood-grain imprint texture. Remaining walls in smooth warm white plaster. One large steel-framed window (2m x 1.8m) with slim black mullions, letting in bright natural light.

The room should feel urban and architectural, but clearly a child''s space — softened with warmth. A chunky cream wool area rug anchors the furniture. Include a low modern bookshelf with colorful children''s books, a canvas play tent or reading nook, wooden building blocks on the rug, and a soft knit throw on the bed. Room palette: warm gray concrete, white plaster, black steel, cream wool, pops of muted color from books and toys. Modern, industrial-soft, playful.

Lighting: bright natural daylight from the steel-framed window. Clean, even illumination with soft directional shadows from the window frame mullions.

Shot with 35mm lens, eye-level, balanced composition showing the full furnished room. Architectural children''s room — Cereal Magazine aesthetic. Photorealistic. No text.'
WHERE scene_id = 'child-concrete-loft';


UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — COMPLETE INTERIOR COMPOSITION: This is a full room interior photograph of a CHILD''S ROOM, NOT a product-only shot. The product from the reference image must be placed naturally inside a fully furnished, realistic children''s bedroom. If the product is a bed, show it with a rattan side table, a woven toy basket, and a soft throw. If the product is a desk, show it with a child-sized chair and art supplies. If the product is storage, show it in a room with a bed and play area visible. The scene must look like a real Mediterranean-inspired child''s bedroom — never an isolated product in an empty room.

KIDS ROOM IDENTITY: The room must clearly read as a child''s space with Mediterranean warmth. Include these cues: a handwoven throw on the bed, a small rattan or wicker toy basket with a stuffed animal and soft blocks, a low wooden stool with a stack of picture books, and a simple macramé or woven wall hanging at child height. Natural materials throughout — linen, jute, rattan, cotton. Curated and warm — not cluttered.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 120cm crib in a 4m-wide room occupies roughly 30% of the wall. A 60cm bedside table spans 15% of a 4m wall. Use these proportions strictly. HUMAN SCALE ANCHOR: Imagine a child (~120cm tall, age 6-8) standing beside the product — the product must look dimensionally correct relative to that invisible child. Standard crib height is ~90cm. Toddler bed height is ~50cm from floor. Child desk height is 55-60cm. Child chair seat height is 30-35cm. ARCHITECTURAL CALIBRATION: The standard interior door (210cm x 90cm) is your ruler. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior photograph placing {{productName}} in a Mediterranean-inspired children''s room (approximately 4m x 3.5m, 2.7m ceiling) with wide-plank bleached oak flooring in a pale warm tone. Feature wall clad in honed travertine panels with natural veining and filled pores — warm ivory and sand tones. Remaining walls in smooth lime-washed plaster in warm white. One arched window (1.6m x 2m) with deep reveals, dressed in floor-length washed linen curtains in natural flax tone.

The room should feel warm, tactile, and clearly a child''s space — like a coastal villa nursery. A handwoven jute rug anchors the room. Include a small rattan bookshelf with children''s books, a wicker toy basket, a linen floor cushion, and a soft cotton throw on the bed with one plush animal. Room palette: travertine ivory, bleached oak, warm white plaster, natural linen, rattan accents. Mediterranean warmth, quiet luxury.

Lighting: warm golden afternoon light from the arched window. Soft, enveloping glow with gentle shadows cast through the linen curtains.

Shot with 35mm lens, eye-level, balanced composition showing the full furnished room with travertine veining. Mediterranean children''s interior — Architectural Digest aesthetic. Photorealistic. No text.'
WHERE scene_id = 'child-travertine-linen';


UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — COMPLETE INTERIOR COMPOSITION: This is a full room interior photograph of a CHILD''S ROOM, NOT a product-only shot. The product from the reference image must be placed naturally inside a fully furnished, realistic children''s nursery. If the product is a bed or crib, show it with a small white bookshelf, a soft play mat, and gentle nursery accessories. If the product is a desk, show it with a child-sized chair and drawing supplies. If the product is storage, show it in a room with a bed and play corner visible. The scene must look like a real pristine modern nursery — never an isolated product in an empty room.

KIDS ROOM IDENTITY: The room must clearly read as a child''s space despite the all-white palette. Include these cues: a soft cream knitted blanket folded on the bed, a white wooden toy box or basket with a few soft toys visible, a small sheepskin rug beside the bed, a simple white shelf with 3-4 picture books and a small potted plant, and one minimalist mobile or wall-mounted cloud shelf. All items in white, cream, and pale wood tones to maintain the gallery feel. Curated and serene — not empty.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 120cm crib in a 4m-wide room occupies roughly 30% of the wall. A 60cm bedside table spans 15% of a 4m wall. Use these proportions strictly. HUMAN SCALE ANCHOR: Imagine a child (~120cm tall, age 6-8) standing beside the product — the product must look dimensionally correct relative to that invisible child. Standard crib height is ~90cm. Toddler bed height is ~50cm from floor. Child desk height is 55-60cm. Child chair seat height is 30-35cm. ARCHITECTURAL CALIBRATION: The standard interior door (210cm x 90cm) is your ruler. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior photograph placing {{productName}} in a pristine modern nursery (approximately 4m x 3.5m, 2.7m ceiling) with pale ash timber flooring in a cool-warm blonde tone. All walls in smooth matte white plaster — no accent walls, no wallpaper, no color. One large floor-to-ceiling window (2m x 2.4m) with minimal white frame, filling the room with clean, bright, diffused daylight. Sheer white curtains softening the light.

The room should feel gallery-like yet clearly a nursery — the furniture is the hero but surrounded by gentle nursery context. A soft off-white wool rug grounds the space. Include a white toy basket, a small shelf with children''s books in muted tones, a cream knit throw, and a subtle mobile or garland. Room palette: pure white, pale ash, soft off-white wool, cream accents. Clean, serene, modern nursery gallery.

Lighting: bright, clean, even daylight from the large window. Neutral white light. Soft, shadowless illumination creating a calm atmosphere.

Shot with 35mm lens, eye-level, centered composition showing the full furnished nursery. Minimal white nursery — Norm Architects aesthetic. Photorealistic. No text.'
WHERE scene_id = 'child-cloud-white-nursery';


UPDATE product_image_scenes SET prompt_template = 'Use [PRODUCT IMAGE] as the exact source of truth for {{productName}}, preserving exact structure, scale, finish, proportions, and all product details.

CRITICAL — COMPLETE INTERIOR COMPOSITION: This is a full room interior photograph of a CHILD''S ROOM, NOT a product-only shot. The product from the reference image must be placed naturally inside a fully furnished, realistic children''s bedroom. If the product is a bed, show it with a dark wood side table, a reading lamp, and cozy textiles. If the product is a desk, show it with a child-sized chair and creative supplies. If the product is storage, show it in a room with a bed and reading corner visible. The scene must look like a real cozy child''s retreat — never an isolated product in an empty room.

KIDS ROOM IDENTITY: The room must clearly read as a child''s space despite the moody palette. Include these cues: a deep-toned velvet or wool throw on the bed, a leather or canvas toy basket with wooden toys and a stuffed bear, a small dark wood shelf with illustrated children''s books, a warm-toned reading lamp at child height, and a deep-pile rug inviting floor play. The moody materials should feel like a warm cocoon for a child — cozy, not intimidating. Curated and sophisticated — not cluttered.

CRITICAL — PROPORTIONAL SCALE RULE: Calculate the product''s real-world size as a fraction of the room width. A 120cm crib in a 4m-wide room occupies roughly 30% of the wall. A 60cm bedside table spans 15% of a 4m wall. Use these proportions strictly. HUMAN SCALE ANCHOR: Imagine a child (~120cm tall, age 6-8) standing beside the product — the product must look dimensionally correct relative to that invisible child. Standard crib height is ~90cm. Toddler bed height is ~50cm from floor. Child desk height is 55-60cm. Child chair seat height is 30-35cm. ARCHITECTURAL CALIBRATION: The standard interior door (210cm x 90cm) is your ruler. NEVER let the product fill more than 40% of the visible wall unless its real dimensions require it.

Create a premium lifestyle interior photograph placing {{productName}} in a sophisticated children''s retreat (approximately 4m x 3.5m, 2.7m ceiling) with dark stained oak flooring in a deep espresso tone. Feature wall in vertical-grain walnut wood paneling with a rich, warm satin finish. Remaining walls in hand-applied terracotta-tinted plaster — a muted, earthy burnt sienna tone with subtle trowel marks. One tall window (1.4m x 2m) with dark walnut frame, dressed in heavy linen curtains in a deep clay tone.

The room should feel cozy, enveloping, and clearly a child''s sanctuary — like a warm cocoon. A deep-pile wool rug in charcoal or warm brown anchors the space. Include a leather toy basket with wooden toys, a dark wood shelf with children''s picture books, a warm reading lamp, a velvet throw on the bed, and one stuffed animal. Room palette: walnut brown, terracotta plaster, deep espresso, warm clay linen, leather accents. Moody, warm, refined.

Lighting: warm late-afternoon golden light filtering through the heavy linen curtains. Rich, amber-toned. Deep, cozy atmosphere with soft shadows.

Shot with 35mm lens, eye-level, balanced composition showing the full furnished room with walnut grain and plaster texture. Moody children''s retreat — Residence Magazine aesthetic. Photorealistic. No text.'
WHERE scene_id = 'child-walnut-terracotta';
