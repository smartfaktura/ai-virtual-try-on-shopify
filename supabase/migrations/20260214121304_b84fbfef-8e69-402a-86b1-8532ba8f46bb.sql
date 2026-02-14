
UPDATE workflows
SET generation_config = jsonb_set(
  jsonb_set(
    generation_config,
    '{ui_config,lock_aspect_ratio}',
    'false'
  ),
  '{variation_strategy,variations}',
  '[
    {"label":"Bedroom Full-Length","category":"home","aspect_ratio":"4:5","instruction":"Full-length floor mirror leaning against a bedroom wall. Stylish, lived-in bedroom with soft natural daylight filtering through sheer curtains. Warm wood floors or plush carpet. Bed partially visible in background. Cozy, personal atmosphere."},
    {"label":"Bathroom Vanity","category":"home","aspect_ratio":"4:5","instruction":"Large bathroom mirror above a marble or stone vanity countertop. Warm overhead vanity lighting with soft downlights. Clean marble or subway tile walls visible in reflection. Sleek, modern bathroom aesthetic. Slightly steamy, intimate atmosphere."},
    {"label":"Boutique Fitting Room","category":"retail","aspect_ratio":"4:5","instruction":"Full-length fitting room mirror in a high-end clothing boutique. Bright, even, flattering retail lighting. Clean neutral background — white or light gray walls. Minimal distractions. The focus is entirely on the outfit and the person. Professional retail environment."},
    {"label":"Elevator / Lobby","category":"urban","aspect_ratio":"4:5","instruction":"Reflective elevator doors or large lobby mirror in a modern building. Moody, slightly dim ambient lighting with warm elevator ceiling lights. Polished metal or marble surfaces visible. Urban, sophisticated aesthetic. Slight golden reflections from metallic surfaces."},
    {"label":"Gym Mirror","category":"fitness","aspect_ratio":"4:5","instruction":"Full-length gym mirror along a wall. Bright overhead fluorescent or LED lights. Gym equipment subtly visible and blurred in the background — dumbbells, benches, cables. Rubber flooring visible. Energetic, active lifestyle atmosphere."},
    {"label":"Hotel Room","category":"travel","aspect_ratio":"4:5","instruction":"Full-length mirror in a luxury hotel room. Warm ambient lighting from bedside lamps and soft overhead fixtures. Elegant decor — plush bedding, upholstered furniture, tasteful artwork partially visible. Rich textures and muted, sophisticated color palette. Travel-lifestyle aesthetic."},
    {"label":"Walk-in Closet","category":"home","aspect_ratio":"4:5","instruction":"Full-length mirror inside a spacious walk-in closet. Soft warm recessed lighting. Organized clothing racks and shelves visible around the mirror. Neatly arranged shoes and accessories in background. Aspirational, curated wardrobe aesthetic."},
    {"label":"Minimalist Hallway","category":"home","aspect_ratio":"4:5","instruction":"Tall standing mirror or wall-mounted mirror in a clean, minimalist hallway. Natural light from a nearby window or skylight. Hardwood or light concrete floors. White or light-toned walls with minimal decor. Scandinavian or modern minimalist aesthetic. Airy and serene atmosphere."},
    {"label":"Coffee Shop Window","category":"urban","aspect_ratio":"4:5","instruction":"Reflective coffee shop window from inside looking out. Warm interior with exposed brick or wood paneling. Coffee cup and pastry on table nearby. Soft ambient lighting mixed with natural light from outside. Cozy urban cafe atmosphere."},
    {"label":"Car Side Mirror","category":"urban","aspect_ratio":"4:5","instruction":"Car window or side mirror reflection. Subject visible in the car mirror with outdoor scenery behind. Natural daylight, parking lot or street visible. Casual, spontaneous vibe. Urban on-the-go aesthetic."},
    {"label":"Rooftop Terrace","category":"outdoor","aspect_ratio":"4:5","instruction":"Glass door reflection on a rooftop terrace. City skyline visible behind and through the glass. Golden hour or blue hour lighting. Potted plants and outdoor furniture nearby. Aspirational urban lifestyle setting."},
    {"label":"Pool / Resort","category":"travel","aspect_ratio":"4:5","instruction":"Poolside mirror or reflective glass at a tropical resort. Crystal blue pool water visible. Palm trees and lush greenery in background. Golden warm sunlight. Vacation lifestyle, relaxed luxury aesthetic."},
    {"label":"Art Gallery","category":"retail","aspect_ratio":"4:5","instruction":"Large mirror in a contemporary art gallery. Clean white walls with minimal artwork visible. Professional gallery lighting — track lights and spotlights. Polished concrete or hardwood floors. Sophisticated, cultural aesthetic."},
    {"label":"Hair Salon","category":"retail","aspect_ratio":"4:5","instruction":"Salon mirror with styling station visible. Professional ring lights or vanity bulbs around the mirror frame. Hair products and tools on the counter. Clean, professional salon environment. Flattering beauty lighting."},
    {"label":"Vintage Shop","category":"retail","aspect_ratio":"4:5","instruction":"Ornate antique mirror in a vintage or thrift shop. Eclectic decor — vintage clothing racks, retro furniture, warm Edison bulb lighting. Rich textures and colors. Nostalgic, treasure-hunt atmosphere."},
    {"label":"Studio Apartment","category":"home","aspect_ratio":"4:5","instruction":"Full-length mirror in a cozy studio apartment. Warm window light streaming in. Small but well-designed space — plant on windowsill, books stacked nearby, warm textiles. Intimate, personal, authentic living space aesthetic."}
  ]'::jsonb
)
WHERE name = 'Mirror Selfie Set';
