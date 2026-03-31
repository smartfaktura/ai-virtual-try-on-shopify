import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TONE_DESCRIPTIONS: Record<string, string> = {
  luxury: "premium, sophisticated, elegant with refined details",
  clean: "minimalist, uncluttered, modern and professional",
  bold: "striking, high-contrast, attention-grabbing",
  minimal: "extremely simple, lots of negative space, zen-like",
  playful: "vibrant, energetic, fun with dynamic composition",
};

interface GenerationConfig {
  prompt_template: string;
  system_instructions: string;
  fixed_settings: {
    aspect_ratios?: string[];
    quality?: string;
    composition_rules?: string;
  };
  variation_strategy: {
    type: string;
    variations: VariationItem[];
  };
  ui_config: Record<string, unknown>;
  negative_prompt_additions?: string;
}

interface VariationItem {
  label: string;
  instruction: string;
  aspect_ratio?: string;
  category?: string;
  scope?: string;
  preview_url?: string;
  prompt_only?: boolean;
  use_scene_reference?: boolean;
}

// Room Type Descriptions for Interior Design workflow
const ROOM_TYPE_DESCRIPTIONS: Record<string, string> = {
  'Living Room': 'a spacious living room with comfortable seating, coffee table, entertainment area, and ambient lighting',
  'Bedroom (Master)': 'a master bedroom with king/queen bed, nightstands, dresser, and serene sleeping environment',
  'Bedroom (Guest)': 'a welcoming guest bedroom with queen/double bed, simple nightstand, and hospitality touches',
  'Kids Room (Girl)': 'a girls bedroom with age-appropriate bed, study desk, storage, and playful feminine touches',
  'Kids Room (Boy)': 'a boys bedroom with age-appropriate bed, study desk, storage, and playful masculine touches',
  'Kids Room (Twins/Shared)': 'a shared kids room with twin beds or bunk beds, shared storage, individual study spaces, and balanced design',
  'Baby Nursery (Girl)': 'a baby girl nursery with crib, changing table, rocking chair, soft lighting, and gentle feminine palette',
  'Baby Nursery (Boy)': 'a baby boy nursery with crib, changing table, rocking chair, soft lighting, and gentle masculine palette',
  'Kitchen': 'a functional kitchen with countertops, appliance awareness, dining prep area, and organized storage',
  'Dining Room': 'a dining room with dining table and chairs, sideboard, centerpiece, and ambient dining lighting',
  'Bathroom (Master)': 'a master bathroom with vanity styling, towel arrangement, accessories, and spa-like atmosphere',
  'Bathroom (Guest)': 'a guest bathroom with clean vanity styling, fresh towels, and welcoming accessories',
  'Home Office / Work Room': 'a home office with desk, ergonomic chair, shelving, task lighting, and productive atmosphere',
  'Walk-in Closet': 'a walk-in closet with organized shelving, hanging space, accessories display, and soft lighting',
  'Hallway / Entryway': 'an entryway/hallway with console table, mirror, coat hooks, shoe storage, and welcoming decor',
  'Patio / Outdoor Living': 'an outdoor patio with weather-appropriate seating, dining area, planters, and outdoor lighting',
  'Balcony / Terrace': 'a balcony/terrace with compact seating, planters, small table, and cozy outdoor atmosphere',
  'Laundry Room': 'a laundry room with organized storage, folding area, baskets, and functional bright lighting',
  'Storage Room / Utility': 'a utility/storage room with organized shelving, labeled containers, and efficient use of space',
  'Garage': 'a garage with organized tool storage, workbench, floor coating, and efficient wall-mounted solutions',
  'Basement / Rec Room': 'a basement recreation room with comfortable seating, entertainment area, and warm lighting',
  'Exterior / Facade': 'building exterior with landscaping, outdoor lighting, pathway, and curb appeal elements',
  // Exterior types
  'Front Facade': 'the front face of a building with landscaping, outdoor lighting, pathway, and strong curb appeal',
  'Backyard': 'a backyard space with patio seating, lawn area, garden beds, and outdoor entertaining features',
  'Garden': 'a landscaped garden with flower beds, pathways, water features, and decorative plantings',
  'Pool Area': 'a swimming pool area with lounge chairs, poolside landscaping, and outdoor lighting',
  'Driveway': 'the driveway and front approach with pavers or concrete, bordering plants, and outdoor lighting',
  'Rooftop Terrace': 'a rooftop terrace with weather-resistant seating, planters, privacy screens, and ambient lighting',
  'Entrance / Porch': 'a welcoming entrance/porch with seating, potted plants, lighting fixtures, and decorative elements',
};

// UGC Product Interaction Mapping
const PRODUCT_INTERACTIONS: Record<string, string> = {
  'skincare': 'applying to their skin or showing the product texture on the back of their hand',
  'beauty': 'applying the product or holding it up near their face showing the shade/color',
  'makeup': 'applying the product or holding it up near their face showing the shade/color',
  'clothing': 'wearing the item naturally as part of their outfit',
  'apparel': 'wearing the item naturally as part of their outfit',
  'shoes': 'showing the shoes on their feet or holding them up excitedly',
  'bags': 'wearing the bag naturally on their shoulder or holding it',
  'jewelry': 'wearing the jewelry piece (on finger, wrist, neck, or ear) and showing it off',
  'rings': 'wearing the ring on their finger and holding their hand up to show it',
  'watches': 'wearing the watch on their wrist and casually showing it',
  'food': 'holding the food/drink package or tasting/sipping the product',
  'drink': 'sipping or holding the drink toward the camera',
  'tech': 'using or demonstrating the device naturally',
  'fragrance': 'holding the bottle near their neck/wrist as if just applied',
  'haircare': 'running fingers through their hair or holding the product near their hair',
};

const UGC_MOOD_DESCRIPTIONS: Record<string, string> = {
  'excited': 'Genuine excitement and enthusiasm. Wide natural smile, bright eyes, "OMG I love this" energy. The kind of face you make when showing your best friend something amazing.',
  'chill': 'Relaxed and casual. Soft natural smile, effortless cool vibe. Everyday comfort energy, as if casually mentioning a product they use daily.',
  'confident': 'Self-assured and knowing. Subtle confident smile, direct eye contact with the camera. "I know what works for me" energy.',
  'surprised': 'Genuine surprise and wonder. Slightly raised eyebrows, open expression, "wait this actually works?!" reaction face.',
  'focused': 'Demonstrating and explaining. Friendly but concentrated expression, tutorial-mode energy. Looking at the product or showing how to use it.',
};

function getProductInteraction(productType: string): string {
  const type = productType.toLowerCase().trim();
  for (const [key, value] of Object.entries(PRODUCT_INTERACTIONS)) {
    if (type.includes(key)) return value;
  }
  return 'holding the product naturally near their face or chest';
}

interface WorkflowRequest {
  workflow_id: string;
  product: {
    title: string;
    productType: string;
    description: string;
    dimensions?: string;
    imageUrl: string;
  };
  additional_products?: Array<{
    title: string;
    productType: string;
    description: string;
    imageUrl: string;
  }>;
  styling_notes?: string;
  prop_style?: 'clean' | 'decorated';
  ugc_mood?: string;
  // Interior Design fields
  room_type?: string;
  wall_color?: string;
  flooring_preference?: string;
  interior_type?: 'interior' | 'exterior';
  furniture_style?: string;
  lighting_mood?: string;
  furniture_handling?: string;
  room_size?: string;
  key_pieces?: string[];
  design_notes?: string;
  color_palette_preference?: string;
  time_of_day?: string;
  staging_purpose?: string;
  is_empty_room?: boolean;
  ceiling_height?: string;
  room_dimensions?: string;
  exact_ceiling_height?: string;
  model?: {
    name: string;
    gender: string;
    ethnicity: string;
    bodyType: string;
    ageRange: string;
    imageUrl: string;
  };
  brand_profile?: {
    tone?: string;
    background_style?: string;
    lighting_style?: string;
    color_temperature?: string;
    brand_keywords?: string[];
    color_palette?: string[];
    target_audience?: string;
    do_not_rules?: string[];
    composition_bias?: string;
    preferred_scenes?: string[];
    photography_reference?: string;
  };
  selected_variations?: number[];
  product_angles?: 'front' | 'front-side' | 'front-back' | 'all';
  quality?: string;
  image_count?: number;
  // Creative Drops fields
  theme?: string;
  theme_notes?: string;
}

function buildVariationPrompt(
  config: GenerationConfig,
  variation: VariationItem,
  product: WorkflowRequest["product"],
  brandProfile: WorkflowRequest["brand_profile"],
  variationIndex: number,
  totalVariations: number,
  model?: WorkflowRequest["model"],
  additionalProducts?: WorkflowRequest["additional_products"],
  stylingNotes?: string,
  propStyle?: 'clean' | 'decorated',
  ugcMood?: string,
  theme?: string,
  themeNotes?: string,
  aspectRatio?: string,
): string {
  const brandLines: string[] = [];
  if (brandProfile) {
    const toneDesc =
      TONE_DESCRIPTIONS[brandProfile.tone || "clean"] ||
      TONE_DESCRIPTIONS.clean;
    brandLines.push(`   - Tone: ${toneDesc}`);
    if (brandProfile.brand_keywords?.length) {
      brandLines.push(
        `   - Brand DNA: ${brandProfile.brand_keywords.join(", ")}`
      );
    }
    if (brandProfile.color_palette?.length) {
      brandLines.push(
        `   - Brand accent colors: ${brandProfile.color_palette.join(", ")}`
      );
    }
    if (brandProfile.target_audience) {
      brandLines.push(
        `   - Target audience: ${brandProfile.target_audience}`
      );
    }
    if (brandProfile.lighting_style) {
      brandLines.push(`   - Lighting: ${brandProfile.lighting_style}`);
    }
    if (brandProfile.photography_reference) {
      brandLines.push(
        `   - Style reference: ${brandProfile.photography_reference}`
      );
    }
  }

  const compositionRules =
    config.fixed_settings.composition_rules || "";

  // Identity-preservation block when a model reference is provided
  const modelBlock = model
    ? `\nMODEL IDENTITY (CRITICAL):
The person in this image MUST be the EXACT same person shown in [MODEL IMAGE].
- Preserve: face shape, skin tone, eye color, hair color/texture/length, facial features, distinguishing marks
- Gender: ${model.gender}, Body type: ${model.bodyType}, Age range: ${model.ageRange}, Ethnicity: ${model.ethnicity}
- The face must be unmistakably recognizable as the same individual
- Do NOT alter, idealize, or change any facial features from the reference\n`
    : "";

  // Additional products block for flat lay multi-product
  const totalProductCount = 1 + (additionalProducts?.length || 0);
  const additionalProductsBlock = (additionalProducts && additionalProducts.length > 0)
    ? `\nADDITIONAL PRODUCTS IN COMPOSITION (${totalProductCount} TOTAL PRODUCTS — ALL MUST APPEAR):
- Product 1 (PRIMARY): ${product.title} (${product.productType}) — see [PRODUCT IMAGE 1]
${additionalProducts.map((p, idx) => `- Product ${idx + 2}: ${p.title} (${p.productType})${p.description ? ` — ${p.description}` : ''} — see [PRODUCT IMAGE ${idx + 2}]`).join('\n')}

This flat lay MUST contain EXACTLY ${totalProductCount} distinct products. Each product must be clearly visible, separately identifiable, and occupy meaningful space in the composition. Do NOT omit any product. Missing any product is a generation failure.\n`
    : "";

  // Styling notes for flat lay aesthetics
  const stylingBlock = stylingNotes
    ? `\nSTYLING & PROPS: ${stylingNotes}\nIncorporate these styling elements naturally into the flat lay composition.\n`
    : "";

  // Prop style control for flat lay — prevents AI from adding extra commercial products
  let propStyleBlock = "";
  if (propStyle === 'clean' || (!propStyle && additionalProducts !== undefined)) {
    propStyleBlock = `\nCRITICAL COMPOSITION RULE (OVERRIDE ALL OTHER INSTRUCTIONS):
Show ONLY the selected products on the surface — NOTHING ELSE.
IGNORE any mention of props, accents, flowers, botanicals, accessories, decorative items, or styling elements in the variation description above.
The surface must contain ONLY the provided products. Zero additional items. No gold accents, no flowers, no ceramics, no leaves, no ribbons, no hardware, no decorative objects of any kind.
This overrides everything — the variation description is for the SURFACE STYLE only, not for props.\n`;
  } else if (propStyle === 'decorated') {
    propStyleBlock = `\nCOMPOSITION RULE: You may add ONLY abstract/decorative styling elements around the products: natural textures, dried flowers, fabric swatches, paper, abstract shapes, ribbons. NEVER add extra commercial products like watches, cameras, electronics, earbuds, bags, or any item that could be mistaken for the user's own product.\n`;
  }

  // UGC mood and product interaction injection
  let ugcBlock = "";
  if (ugcMood) {
    const moodDesc = UGC_MOOD_DESCRIPTIONS[ugcMood] || UGC_MOOD_DESCRIPTIONS['excited'];
    const interaction = getProductInteraction(product.productType);
    ugcBlock = `\nEXPRESSION & ENERGY:\n${moodDesc}\n\nPRODUCT INTERACTION:\nThe subject must be naturally ${interaction} with the EXACT product from [PRODUCT IMAGE]. The product must be clearly visible and recognizable in the frame.\n`;
  }

  // Interior Design block — room type, wall color, flooring overrides
  let interiorBlock = "";
  const isInteriorWorkflow = config.ui_config && (config.ui_config as Record<string, unknown>).show_room_type_picker === true;
  if (isInteriorWorkflow) {
    const roomTypeKey = (product as unknown as Record<string, unknown>).room_type as string ||
      ((config.ui_config as Record<string, unknown>).room_type as string) || '';
    const wallColor = (product as unknown as Record<string, unknown>).wall_color as string || '';
    const flooring = (product as unknown as Record<string, unknown>).flooring_preference as string || '';
    const furnitureStyle = (product as unknown as Record<string, unknown>).furniture_style as string || '';
    const lightingMood = (product as unknown as Record<string, unknown>).lighting_mood as string || '';
    const furnitureHandling = (product as unknown as Record<string, unknown>).furniture_handling as string || 'Replace All';
    const stagingType = (product as unknown as Record<string, unknown>).interior_type as string || 'interior';
    const isExterior = stagingType === 'exterior';
    const roomSize = (product as unknown as Record<string, unknown>).room_size as string || 'Medium';
    const keyPieces = (product as unknown as Record<string, unknown>).key_pieces as string[] || [];
    const designNotes = (product as unknown as Record<string, unknown>).design_notes as string || '';
    const colorPalettePreference = (product as unknown as Record<string, unknown>).color_palette_preference as string || '';
    const timeOfDay = (product as unknown as Record<string, unknown>).time_of_day as string || '';
    const stagingPurpose = (product as unknown as Record<string, unknown>).staging_purpose as string || '';
    const isEmptyRoom = (product as unknown as Record<string, unknown>).is_empty_room as boolean || false;
    const ceilingHeight = (product as unknown as Record<string, unknown>).ceiling_height as string || '';
    const roomDimensions = (product as unknown as Record<string, unknown>).room_dimensions as string || '';
    const exactCeilingHeight = (product as unknown as Record<string, unknown>).exact_ceiling_height as string || '';
    const fullRoomDesc = ROOM_TYPE_DESCRIPTIONS[roomTypeKey] || 'a residential room with appropriate furniture';
    // When key_pieces are specified (ANY mode), strip furniture-specific suggestions to avoid conflict
    const isKeepMode = furnitureHandling === 'Keep & Restyle' || furnitureHandling === 'Keep Layout, Swap Style';
    const roomDesc = (isKeepMode || hasKeyPieces)
      ? (roomTypeKey ? `a ${roomTypeKey.toLowerCase()} space` : 'a residential room')
      : fullRoomDesc;

    // Build furniture handling instructions
    let furnitureHandlingBlock = '';
    if (furnitureHandling === 'Keep & Restyle') {
      furnitureHandlingBlock = `\nFURNITURE HANDLING (CRITICAL): ANALYZE the uploaded photo carefully. Identify EVERY piece of furniture visible (e.g., sofa bed, desk, shelf, chair, wardrobe). Each piece MUST remain the SAME TYPE — a sofa bed stays a sofa bed, a desk stays a desk, a single bed stays a single bed. Do NOT upgrade, resize, or substitute furniture types (e.g., do NOT replace a sofa bed with a double bed). KEEP all furniture in their EXACT positions and sizes. ONLY update their styling: change upholstery fabrics, wood finishes, colors, and textures to match the "${variation.label}" design style. Add appropriate decor accessories around the existing furniture.`;
    } else if (furnitureHandling === 'Keep Layout, Swap Style') {
      furnitureHandlingBlock = `\nFURNITURE HANDLING (CRITICAL): ANALYZE the uploaded photo. Identify each furniture piece and its EXACT type. Replace with a same-TYPE piece in the "${variation.label}" style — a sofa bed becomes a styled sofa bed (NOT a double bed), a desk stays a desk, a compact chair stays a compact chair. Do NOT upgrade furniture categories. Maintain the same spatial arrangement and traffic flow.`;
    } else {
      // Replace All mode — explicit removal instruction
      furnitureHandlingBlock = `\nFURNITURE HANDLING (CRITICAL): COMPLETELY REMOVE every single piece of existing furniture visible in the uploaded photo. Remove ALL tables, chairs, sofas, beds, shelves, desks, cabinets, rugs, lamps, and any other furnishings currently in the room. The room should first be treated as EMPTY — bare walls and floor only. Then stage it from scratch with entirely NEW furniture appropriate for this room type and the "${variation.label}" design style. NOTHING from the original photo's furniture should remain. If you can still see the original table, sofa, or any piece — you have failed this instruction.`;
    }

    // Universal furniture realism constraint for ALL modes
    const furnitureRealismBlock = `\nFURNITURE REALISM (CRITICAL): All furniture MUST be realistically proportioned for the visible room dimensions. Analyze the room's actual walls, floor area, and ceiling height from the photo. Never place furniture that would physically not fit through the door or in the available floor space. Furniture scale must match the room — small rooms get compact pieces, not oversized ones.`;

    // Build room size constraint
    let roomSizeBlock = '';
    if (roomSize === 'Small') {
      roomSizeBlock = `\nROOM SIZE (CRITICAL): This is a SMALL room (under 10 sqm / 100 sqft). Use ONLY compact, space-saving furniture. NO king or queen beds, NO large sectionals, NO oversized pieces. A single bed, small desk, or compact chair is the maximum. Leave ample walking space between pieces. Every piece must look proportionally realistic for a tiny room.`;
    } else if (roomSize === 'Medium') {
      roomSizeBlock = `\nROOM SIZE: This is a MEDIUM-sized room (10–20 sqm). Use appropriately scaled furniture. Double bed maximum for bedrooms. Avoid oversized or bulky pieces. Furniture should leave comfortable walking paths.`;
    } else if (roomSize === 'Large') {
      roomSizeBlock = `\nROOM SIZE: This is a LARGE room (20–40 sqm). Standard to generous furniture sizing is appropriate. Ensure the room doesn't look empty — use area rugs, accent chairs, or decor to fill the space naturally.`;
    }
    // Exact room dimensions override
    if (roomDimensions) {
      roomSizeBlock += `\nEXACT ROOM DIMENSIONS: ${roomDimensions}. Scale ALL furniture precisely to these real-world measurements. This overrides the approximate room size above.`;
    }
    // 'Very Large' = no constraint needed

    // Ceiling height constraint — interior only (skip for exterior to prevent stale values)
    let ceilingHeightBlock = '';
    if (!isExterior) {
      if (ceilingHeight === 'Low') {
        ceilingHeightBlock = `\nCEILING HEIGHT (CRITICAL): This room has LOW ceilings (under 2.4m / 8ft). Use ONLY low-profile furniture: platform beds instead of four-poster, low-back sofas, no tall bookcases or armoires. Avoid anything that would visually crowd the vertical space. Horizontal lines preferred over vertical.`;
      } else if (ceilingHeight === 'High') {
        ceilingHeightBlock = `\nCEILING HEIGHT: This room has HIGH ceilings (2.7m+ / 9ft+). Furniture can be taller and more substantial. Consider floor-to-ceiling curtains, tall shelving, and vertical decor to utilize the height naturally.`;
      } else if (ceilingHeight === 'Double Height') {
        ceilingHeightBlock = `\nCEILING HEIGHT: This room has DOUBLE-HEIGHT ceilings (5m+ / 16ft+). Scale furniture generously. Use oversized art, dramatic pendant lights, and tall plants. The space should feel grand, not empty.`;
      }
      // Exact ceiling height override
      if (exactCeilingHeight) {
        ceilingHeightBlock += `\nEXACT CEILING HEIGHT: ${exactCeilingHeight}. Scale vertical elements (curtains, shelving, art placement) to this precise height. This overrides the approximate ceiling height above.`;
      }
    }

    // Empty room instruction
    const emptyRoomBlock = isEmptyRoom
      ? `\nEMPTY ROOM (CRITICAL): This room is CURRENTLY COMPLETELY EMPTY — there is NO existing furniture at all. Stage it entirely from scratch with appropriate furniture for this room type and design style. Fill the space naturally without overcrowding.`
      : '';

    // Staging purpose instruction
    let stagingPurposeBlock = '';
    if (stagingPurpose === 'real-estate') {
      stagingPurposeBlock = isExterior
        ? `\nSTAGING PURPOSE: Real estate listing. Maximize curb appeal — clean pathways, manicured landscaping, warm lighting, and an inviting entrance. Make the property look aspirational and move-in ready from the outside.`
        : `\nSTAGING PURPOSE: Real estate listing. Bright, clean, spacious feel. Decluttered. Neutral staging to appeal to broadest audience. Make the space look move-in ready and aspirational.`;
    } else if (stagingPurpose === 'design-portfolio') {
      stagingPurposeBlock = `\nSTAGING PURPOSE: Interior design portfolio. Showcase design details, textures, and curated accessories. Editorial quality. Emphasize material choices, layering, and visual storytelling.`;
    } else if (stagingPurpose === 'airbnb') {
      stagingPurposeBlock = isExterior
        ? `\nSTAGING PURPOSE: Airbnb/rental listing. Welcoming outdoor entertaining space. Show outdoor dining, cozy seating, string lights, and lifestyle amenities. Make guests envision relaxing outside.`
        : `\nSTAGING PURPOSE: Airbnb/rental listing. Warm, welcoming, lived-in feel. Show amenities clearly (towels, pillows, books, coffee setup). Make guests feel at home.`;
    }

    // Color palette preference — expanded descriptions
    const COLOR_PALETTE_EXPANSIONS: Record<string, string> = {
      'Neutral / Earth Tones': 'Neutral / Earth Tones (beige, taupe, warm brown, soft cream, terracotta accents, muted olive)',
      'Cool & Calming': 'Cool & Calming (soft blue-gray, pale sage, dusty lavender, cool white, silver accents)',
      'Warm & Inviting': 'Warm & Inviting (golden amber, burnt sienna, warm copper, rich caramel, deep rust accents)',
      'Bold & Vibrant': 'Bold & Vibrant (deep navy, emerald green, mustard yellow, coral, rich burgundy)',
      'Monochrome': 'Monochrome (pure black, charcoal, mid-gray, light gray, crisp white — single-tone palette)',
      'Pastel': 'Pastel (blush pink, baby blue, mint green, soft peach, light lilac)',
    };
    const expandedPalette = colorPalettePreference
      ? (COLOR_PALETTE_EXPANSIONS[colorPalettePreference] || colorPalettePreference)
      : '';
    const colorPaletteBlock = expandedPalette
      ? `\nCOLOR PALETTE: Use a ${expandedPalette} color scheme throughout the ${isExterior ? 'outdoor furniture, planters, textiles, and landscaping elements' : "room's furniture, textiles, and decor accessories"}.`
      : '';

    // Time of day / natural light — context-aware for interior vs exterior
    let timeOfDayBlock = '';
    if (timeOfDay && timeOfDay !== 'As Photographed') {
      if (isExterior) {
        const exteriorTimeDescriptions: Record<string, string> = {
          'Morning Light': 'Render as early morning: soft golden light from a low east angle, long gentle shadows, dewy freshness on surfaces.',
          'Midday': 'Render at midday: bright overhead sun, minimal shadows, vivid colors, clear blue sky.',
          'Golden Hour Glow': 'Render at golden hour: warm amber sunlight hitting the facade from a low angle, long dramatic shadows, warm sky gradient from gold to soft pink.',
          'Dramatic Twilight': 'Render at twilight/blue hour: deep blue-purple sky, warm interior lights glowing through windows, exterior accent lighting visible, atmospheric and moody.',
          'Night / Uplighting': 'Render at night: dark sky, architectural uplighting illuminating the facade and landscaping, warm pathway lights, dramatic pool/garden lighting if present.',
          'Overcast': 'Render under overcast sky: soft diffused light, no harsh shadows, even illumination across all surfaces, muted sky.',
        };
        timeOfDayBlock = `\nNATURAL LIGHT: ${exteriorTimeDescriptions[timeOfDay] || `Render the exterior as if photographed during ${timeOfDay}. Adjust sun position, shadow angles, and sky accordingly.`}`;
      } else {
        timeOfDayBlock = `\nNATURAL LIGHT: Render the scene as if photographed during ${timeOfDay}. Adjust window light direction, shadow angles, and ambient light color accordingly.`;
      }
    }

    // Designer notes
    const designNotesBlock = designNotes
      ? `\nDESIGNER NOTES: ${designNotes}`
      : '';

    // Key furniture pieces constraint
    const keyPiecesBlock = keyPieces.length > 0
      ? `\nREQUIRED FURNITURE (CRITICAL): This room MUST contain EXACTLY these pieces: ${keyPieces.join(', ')}. Do NOT add major furniture items beyond this list. Minor decor accessories (pillows, plants, small lamps) are allowed, but no additional large furniture.`
      : '';

    // Expanded outdoor style descriptions
    const OUTDOOR_STYLE_EXPANSIONS: Record<string, string> = {
      'Tropical': 'Tropical outdoor furniture and design elements: rattan, teak, palm-inspired planters, lush greenery, vibrant cushion fabrics, woven textures',
      'Mediterranean': 'Mediterranean outdoor furniture and design elements: terracotta pots, wrought iron, olive trees, warm stone, mosaic tile accents, arched trellises',
      'Desert / Arid': 'Desert/Arid outdoor design: drought-resistant succulents, sandstone pavers, weathered wood, earth-tone ceramics, gravel pathways, shade structures',
      'Coastal': 'Coastal outdoor design: whitewashed wood, nautical blue accents, rope details, driftwood, linen cushions, sea grass planters',
      'Modern': 'Modern outdoor design: clean-lined furniture, concrete planters, minimalist metal frames, neutral tones, geometric shapes',
      'Rustic': 'Rustic outdoor design: reclaimed wood, stone elements, wildflower plantings, lantern lighting, natural untreated materials',
    };

    interiorBlock = isExterior
      ? `\nEXTERIOR CONTEXT:
This is ${roomDesc}.
Enhance this exterior with landscaping, outdoor furniture, lighting, and curb appeal elements appropriate for the "${variation.label}" design style.
${furnitureStyle && furnitureStyle !== 'Match Design Style' ? `\nFURNITURE STYLE: Use ${OUTDOOR_STYLE_EXPANSIONS[furnitureStyle] || `${furnitureStyle} outdoor furniture and design elements`}.` : ''}
${lightingMood && lightingMood !== 'Keep Original' ? `\nLIGHTING MOOD: Apply ${lightingMood} lighting throughout the exterior scene.` : ''}
${roomSizeBlock}
${keyPiecesBlock}
${furnitureRealismBlock}
${stagingPurposeBlock}${colorPaletteBlock}${timeOfDayBlock}${designNotesBlock}
\nIMPORTANT: The [PRODUCT IMAGE] is the BUILDING/EXTERIOR PHOTO to transform. Do NOT treat it as a product to place — instead, enhance the exterior scene while preserving its architecture, structure, and angles.\n`
      : `\nROOM CONTEXT:
This is ${roomDesc}.
Stage this room with furniture, decor, and accessories appropriate for this room type and the "${variation.label}" design style.
${emptyRoomBlock}
${furnitureHandlingBlock}
${roomSizeBlock}
${ceilingHeightBlock}
${keyPiecesBlock}
${furnitureRealismBlock}
${wallColor && wallColor !== 'Keep Original' ? `\nWALL COLOR OVERRIDE: Paint/change the walls to ${wallColor}. Apply this color consistently to all visible wall surfaces.` : '\nWALL COLOR: Keep the original wall color/finish as shown in the photo.'}
${flooring && flooring !== 'Keep Original' ? `\nFLOORING OVERRIDE: Change the flooring to ${flooring}. Apply this consistently across the entire visible floor area.` : '\nFLOORING: Keep the original flooring as shown in the photo.'}
${furnitureHandling !== 'Keep & Restyle' && furnitureStyle && furnitureStyle !== 'Match Design Style' ? `\nFURNITURE STYLE: Use ${furnitureStyle} furniture pieces and decor items, regardless of the overall design style variation.` : ''}
${lightingMood && lightingMood !== 'Keep Original' ? `\nLIGHTING MOOD: Apply ${lightingMood} lighting throughout the room. Adjust light sources, shadows, and ambiance accordingly.` : ''}
${stagingPurposeBlock}${colorPaletteBlock}${timeOfDayBlock}${designNotesBlock}
\nIMPORTANT: The [PRODUCT IMAGE] is the ROOM PHOTO to transform. Do NOT treat it as a product to place — instead, transform the entire room scene while preserving its architecture.\n`;
  }

  // Replace {PRODUCT_INTERACTION} and {MOOD_DESCRIPTION} placeholders in prompt template
  let processedTemplate = config.prompt_template;
  if (ugcMood) {
    const moodDesc = UGC_MOOD_DESCRIPTIONS[ugcMood] || UGC_MOOD_DESCRIPTIONS['excited'];
    const interaction = getProductInteraction(product.productType);
    processedTemplate = processedTemplate
      .replace('{PRODUCT_INTERACTION}', interaction)
      .replace('{MOOD_DESCRIPTION}', moodDesc);
  }

  // Issue 1: Seasonal/theme direction block
  const themeBlock = theme && theme !== 'custom'
    ? `\nSEASONAL DIRECTION: ${theme}
Generate imagery with a ${theme} aesthetic and mood.
${themeNotes ? `Additional direction: ${themeNotes}` : ""}\n`
    : themeNotes
      ? `\nSEASONAL DIRECTION: ${themeNotes}. You MUST incorporate this seasonal mood, color palette, and atmosphere into the scene, lighting, and overall feel.\n`
      : "";

  // Issue 6: Merge brand do_not_rules into negative prompts
  const allNegatives = [
    config.negative_prompt_additions,
    ...(brandProfile?.do_not_rules || []),
  ].filter(Boolean).join('. ');

  // For interior design workflow, replace the product-centric prompt with room-centric one
  const prompt = isInteriorWorkflow
    ? `${processedTemplate}
${interiorBlock}
VARIATION ${variationIndex + 1} of ${totalVariations}: "${variation.label}"
${variation.instruction}

${compositionRules ? `COMPOSITION RULES:\n${compositionRules}` : ""}

${brandLines.length > 0 ? `BRAND GUIDELINES:\n${brandLines.join("\n")}` : ""}

CRITICAL REQUIREMENTS:
1. The room architecture MUST remain EXACTLY as shown in [PRODUCT IMAGE] — same windows, doors, walls, angles, perspective.
2. The camera viewpoint must NOT change at all.
3. Ultra high resolution, photorealistic quality, no AI artifacts, proper shadows and lighting.
4. This specific variation must clearly match the "${variation.label}" interior design style described above.
5. All furniture must have correct perspective and scale for the room.
6. NEVER block doorways, hallways, corridors, or room entrances with furniture. All passage areas must remain fully clear and walkable.
7. Do NOT place furniture in front of windows, radiators, air vents, electrical panels, or fire exits.
8. Maintain realistic traffic flow — leave clear walking paths between furniture groupings (minimum ~60 cm / 2 ft clearance).
9. Do NOT mirror or flip the room horizontally — left wall stays left, right wall stays right.
10. Do NOT change the size, shape, or position of ANY window, door, or architectural opening.
11. Do NOT add or remove walls, columns, beams, or structural elements.
12. The perspective vanishing point must remain identical to the source photo — no rotation, no tilt correction.

${allNegatives ? `AVOID: furniture blocking doorways, blocked hallways, obstructed entrances, furniture in front of windows, unrealistic furniture placement. ${allNegatives}` : "AVOID: furniture blocking doorways, blocked hallways, obstructed entrances, furniture in front of windows, unrealistic furniture placement."}`
    : `${processedTemplate}
${themeBlock}
PRODUCT DETAILS:
- Product: ${product.title}
- Type: ${product.productType}
${product.dimensions ? `- Dimensions: ${product.dimensions} -- render at realistic scale` : ""}
${product.description ? `- Description: ${product.description}` : ""}
${modelBlock}${additionalProductsBlock}${stylingBlock}${propStyleBlock}${ugcBlock}
VARIATION ${variationIndex + 1} of ${totalVariations}: "${variation.label}"
${propStyle === 'clean' ? variation.instruction.split('||PROPS||')[0].replace(/\.\s*Product (arranged |displayed )?with[\s\S]*$/i, '.').replace(/with\s+([\w\s,]+(?:accents|props|accessories|elements|objects|botanicals|flowers|leaves|textile|ceramics?|hardware|palms|ribbon))[\w\s,—–\-]*/gi, '').trim() : variation.instruction.split('||PROPS||').join(' ')}

${compositionRules ? `COMPOSITION RULES:\n${compositionRules}` : ""}

${brandLines.length > 0 ? `BRAND GUIDELINES:\n${brandLines.join("\n")}` : ""}

CRITICAL REQUIREMENTS:
1. The output image MUST be ${aspectRatio} aspect ratio. Do NOT inherit or match the reference image dimensions — this is a hard constraint.
2. The product MUST look EXACTLY like [PRODUCT IMAGE${additionalProducts?.length ? ' 1' : ''}] — preserve 100% accurate packaging, labels, colors, branding, shape, and materials.${additionalProducts?.length ? `\n${additionalProducts.map((_, idx) => `${idx + 4}. Product ${idx + 2} MUST look EXACTLY like [PRODUCT IMAGE ${idx + 2}] — same packaging, shape, colors, and branding.`).join('\n')}\n${additionalProducts.length + 4}. The final image MUST show exactly ${1 + additionalProducts.length} distinct products. Count them before finalizing. Missing any product is a failure.` : ''}
3. All text on packaging must be perfectly legible.
4. Ultra high resolution, professional quality, no AI artifacts.
5. This specific variation must clearly match the "${variation.label}" direction described above.
${model ? `6. The person MUST match [MODEL IMAGE] exactly — same face, same identity. This is non-negotiable.` : ""}

${allNegatives ? `AVOID: ${allNegatives}` : ""}`;

  return prompt;
}

function getAspectRatioForVariation(
  config: GenerationConfig,
  variation: VariationItem
): string {
  // Multi-ratio strategies have per-variation aspect ratios
  if (variation.aspect_ratio) return variation.aspect_ratio;
  // Otherwise use the first fixed aspect ratio
  if (config.fixed_settings.aspect_ratios?.length) {
    return config.fixed_settings.aspect_ratios[0];
  }
  return "1:1";
}

function getModelForQuality(quality: string): string {
  return quality === "high"
    ? "google/gemini-3-pro-image-preview"
    : "google/gemini-3.1-flash-image-preview";
}

// ── Seedream ARK image generation (fallback for product-only workflows) ────────
function seedreamAspectRatio(appRatio: string): string {
  const map: Record<string, string> = {
    "1:1": "1:1", "16:9": "16:9", "9:16": "9:16",
    "4:3": "4:3", "3:4": "3:4", "4:5": "3:4",
    "5:4": "4:3", "3:2": "3:2", "2:3": "2:3", "21:9": "21:9",
  };
  return map[appRatio] || "1:1";
}

const SEEDREAM_MODERATION_CODES = [1301, 1302, 1303, 1304, 1305, 1024];

async function generateImageSeedream(
  prompt: string,
  imageUrls: string[],
  model: string,
  apiKey: string,
  aspectRatio = "1:1",
): Promise<{ ok: boolean; imageUrl?: string; error?: string }> {
  const ARK_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";
  const seedreamRatio = seedreamAspectRatio(aspectRatio);
  const timeoutMs = 90_000;

  try {
    const body: Record<string, unknown> = {
      model, prompt, size: "2K",
      aspect_ratio: seedreamRatio,
      response_format: "url",
      watermark: false,
      sequential_image_generation: "disabled",
    };
    if (imageUrls.length === 1) {
      body.image = imageUrls[0];
    } else if (imageUrls.length > 1) {
      body.image = imageUrls;
    }

    const response = await fetch(ARK_BASE, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      let errorText = "";
      try { errorText = await response.text(); } catch (_) { /* ignore */ }
      try {
        const errJson = JSON.parse(errorText);
        const errCode = errJson?.error?.code || errJson?.code;
        if (errCode && SEEDREAM_MODERATION_CODES.includes(Number(errCode))) {
          return { ok: false, error: `Content moderated: ${errJson?.error?.message || errJson?.message}` };
        }
      } catch (_) { /* not JSON */ }
      return { ok: false, error: `ARK API error ${response.status}: ${errorText.slice(0, 200)}` };
    }

    const data = await response.json();
    const respCode = data?.error?.code || data?.code;
    if (respCode && SEEDREAM_MODERATION_CODES.includes(Number(respCode))) {
      return { ok: false, error: `Content moderated: ${data?.error?.message || data?.message}` };
    }

    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) {
      return { ok: false, error: "No URL in Seedream response" };
    }
    return { ok: true, imageUrl };
  } catch (error: unknown) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    return { ok: false, error: isTimeout ? "Seedream request timed out (90s)" : (error instanceof Error ? error.message : "Unknown error") };
  }
}

async function generateImage(
  prompt: string,
  referenceImages: Array<{ url: string; label: string }>,
  aiModel: string,
  apiKey: string,
  aspectRatio?: string
): Promise<string | null> {
  const maxRetries = 1; // 2 attempts total (primary + 1 retry)
  const PER_IMAGE_TIMEOUT = 75_000; // 75s per image — leaves room for Seedream fallback

  // Build content array: text prompt + all reference images
  const contentParts: Array<Record<string, unknown>> = [
    { type: "text", text: aspectRatio ? `MANDATORY OUTPUT FORMAT: Generate this image at EXACTLY ${aspectRatio} aspect ratio. This is a hard constraint — do NOT match the reference image dimensions.\n\n${prompt}` : prompt },
  ];
  for (const img of referenceImages) {
    contentParts.push({
      type: "image_url",
      image_url: { url: img.url },
    });
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: aiModel,
            messages: [
              {
                role: "user",
                content: contentParts,
              },
            ],
            modalities: ["image", "text"],
            max_tokens: 8192,
            image_config: { ...(aspectRatio ? { aspect_ratio: aspectRatio } : {}), image_size: '2K' },
          }),
          signal: AbortSignal.timeout(PER_IMAGE_TIMEOUT),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`AI Gateway 429 (attempt ${attempt + 1}/${maxRetries + 1}) — backing off`);
          if (attempt < maxRetries) {
            const jitter = Math.random() * 3000;
            await new Promise((r) => setTimeout(r, 3000 * (attempt + 1) + jitter));
            continue;
          }
          throw { status: 429, message: "Rate limit exceeded. Please wait and try again." };
        }
        if (response.status === 402) {
          throw {
            status: 402,
            message: "Payment required - please add credits",
          };
        }
        const errorText = await response.text();
        console.error(
          `AI Gateway error (attempt ${attempt + 1}):`,
          response.status,
          errorText
        );
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        console.error(`[generate-workflow] All retries exhausted for gateway error ${response.status}, returning null for fallback`);
        return null;
      }

      let data: Record<string, unknown>;
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error(`[generate-workflow] JSON parse failed (attempt ${attempt + 1}):`, jsonErr);
        if (attempt < maxRetries) { await new Promise((r) => setTimeout(r, 1000)); continue; }
        return null;
      }
      const imageUrl =
        data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.error(
          "No image in response:",
          JSON.stringify(data).slice(0, 500)
        );
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        return null;
      }

      return imageUrl;
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error
      ) {
        throw error;
      }
      const isTimeout = error instanceof DOMException && error.name === 'TimeoutError';
      console.error(`Generation attempt ${attempt + 1} failed${isTimeout ? ' (timeout)' : ''}:`, error);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (isTimeout) return null; // Return null on timeout to trigger Seedream fallback
      throw error;
    }
  }

  return null;
}

/** Helper: update generation_queue and handle credits when called from the queue */
async function completeQueueJob(
  jobId: string,
  userId: string,
  creditsReserved: number,
  images: string[],
  requestedCount: number,
  errors: string[],
  payload: Record<string, unknown>,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  // Guard: if user already cancelled, skip completion to preserve refund
  const { data: currentJob } = await supabase
    .from("generation_queue")
    .select("status")
    .eq("id", jobId)
    .single();

  if (currentJob?.status === "cancelled") {
    console.log(`[generate-workflow] Job ${jobId} was cancelled — skipping completion`);
    return;
  }

  const generatedCount = images.length;

  if (generatedCount === 0) {
    await supabase.from("generation_queue").update({
      status: "failed",
      error_message: errors.join("; ") || "Failed to generate any images",
      completed_at: new Date().toISOString(),
    }).eq("id", jobId);
    await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: creditsReserved });
    console.log(`[generate-workflow] Refunded ${creditsReserved} credits for failed job ${jobId}`);

    // Fire-and-forget: send generation failed email if user opted in
    try {
      const { data: profile } = await supabase.from("profiles").select("email, display_name, settings").eq("user_id", userId).single();
      const settings = (profile?.settings as Record<string, unknown>) || {};
      if (profile?.email && settings.emailOnFailed !== false) {
        fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ type: "generation_failed", to: profile.email, data: { jobType: "workflow", errorMessage: errors.join("; "), displayName: profile.display_name, workflowName: (payload.workflow_name as string) || undefined, productName: (payload.product_title as string) || undefined, prompt: (payload.prompt as string) || undefined } }),
        }).catch((e) => console.warn("[generate-workflow] Failed email send failed:", e.message));
      }
    } catch (e) { console.warn("[generate-workflow] Failed email lookup failed:", e); }
    // Fire-and-forget: check if creative drop is complete (even on failure)
    if (payload.creative_drop_id) {
      fetch(`${supabaseUrl}/functions/v1/complete-creative-drop`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ creative_drop_id: payload.creative_drop_id }),
      }).catch((e) => console.warn("[generate-workflow] Drop completion check failed:", e.message));
    }
    return;
  }

  const result = { images, generatedCount, requestedCount, errors: errors.length > 0 ? errors : undefined };

  await supabase.from("generation_queue").update({
    status: "completed",
    result,
    completed_at: new Date().toISOString(),
  }).eq("id", jobId);

  await supabase.from("generation_jobs").insert({
    user_id: userId,
    results: images,
    status: "completed",
    completed_at: new Date().toISOString(),
    product_id: payload.product_id || null,
    workflow_id: payload.workflow_id || null,
    brand_profile_id: payload.brand_profile_id || null,
    ratio: payload.aspectRatio || "1:1",
    quality: payload.quality || "standard",
    requested_count: requestedCount,
    credits_used: creditsReserved,
    creative_drop_id: payload.creative_drop_id || null,
    prompt_final: payload.prompt || null,
    scene_name: payload.pose?.name || payload.scene_name || null,
    model_name: payload.model?.name || payload.model_name || null,
    scene_image_url: payload.pose?.originalImageUrl || null,
    model_image_url: payload.model?.originalImageUrl || null,
    workflow_slug: payload.workflow_slug || null,
    product_name: payload.product_name || null,
    product_image_url: payload.product_image_url || null,
  });

  if (generatedCount < requestedCount) {
    const perImageCost = Math.floor(creditsReserved / requestedCount);
    const refundAmount = perImageCost * (requestedCount - generatedCount);
    if (refundAmount > 0) {
      await supabase.rpc("refund_credits", { p_user_id: userId, p_amount: refundAmount });
      console.log(`[generate-workflow] Partial: refunded ${refundAmount} credits for job ${jobId}`);
    }
  }

  console.log(`[generate-workflow] ✓ Queue job ${jobId} completed (${generatedCount} images)`);

  // Fire-and-forget: check if creative drop is complete
  if (payload.creative_drop_id) {
    fetch(`${supabaseUrl}/functions/v1/complete-creative-drop`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ creative_drop_id: payload.creative_drop_id }),
    }).catch((e) => console.warn("[generate-workflow] Drop completion check failed:", e.message));
  }

  // Fire-and-forget: send generation complete email (only if user opted in)
  try {
    const { data: profile } = await supabase.from("profiles").select("email, display_name, settings").eq("user_id", userId).single();
    const settings = (profile?.settings as Record<string, unknown>) || {};
    if (profile?.email && settings.emailOnComplete === true) {
      fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generation_complete", to: profile.email, data: { imageCount: generatedCount, jobType: "workflow", displayName: profile.display_name } }),
      }).catch((e) => console.warn("[generate-workflow] Email send failed:", e.message));
    }
  } catch (e) { console.warn("[generate-workflow] Email lookup failed:", e); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeaderRaw = req.headers.get("authorization");
  const isQueueInternal = req.headers.get("x-queue-internal") === "true"
    && authHeaderRaw === `Bearer ${serviceRoleKey}`;

  const FUNCTION_START = Date.now();
  const MAX_WALL_CLOCK_MS = 140_000; // 140s — leave 10s buffer before platform kills us

  try {
    // SECURITY: Only allow internal queue calls — reject direct access
    if (!isQueueInternal) {
      return new Response(
        JSON.stringify({ error: "Direct access not allowed. Use the generation queue." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: WorkflowRequest & { user_id?: string; job_id?: string; credits_reserved?: number } = await req.json();

    if (!body.workflow_id || !body.product) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: workflow_id and product",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: workflow, error: wfError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", body.workflow_id)
      .single();

    if (wfError || !workflow) {
      return new Response(
        JSON.stringify({ error: "Workflow not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const config = workflow.generation_config as GenerationConfig | null;
    if (!config) {
      return new Response(
        JSON.stringify({
          error:
            "This workflow does not have a generation config yet. Use the standard generation flow.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[generate-workflow] Workflow: ${workflow.name}, Strategy: ${config.variation_strategy.type}`
    );

    const allVariations = config.variation_strategy.variations;
    // Support extra_variations sent from frontend (dynamic Freestyle scenes)
    const extraVariations: VariationItem[] = Array.isArray(body.extra_variations) ? body.extra_variations : [];
    // Normalize: ensure every variation has a non-empty instruction
    const normalizeInstruction = (v: VariationItem): VariationItem => {
      if (v.instruction?.trim()) return v;
      const fallback = v.label
        ? `Place the product in a ${v.label} environment, styled as ${v.category || 'product'} photography`
        : 'A high-quality product photograph in a professional setting';
      return { ...v, instruction: fallback };
    };
    const combinedVariations = [...allVariations, ...extraVariations].map(normalizeInstruction);
    let variationsToGenerate: VariationItem[];

    if (body.selected_variations?.length) {
      variationsToGenerate = body.selected_variations
        .filter((i: number) => i >= 0 && i < combinedVariations.length)
        .map((i: number) => combinedVariations[i]);
    } else {
      variationsToGenerate = allVariations;
    }

    const maxImages = 4; // max 4 images per job; frontend splits larger requests into batches
    variationsToGenerate = variationsToGenerate.slice(0, maxImages);

    // Determine angle variations
    const angleOption = body.product_angles || 'front';
    const angleInstructions: Array<{ suffix: string; label: string }> = [
      { suffix: '', label: 'Front' },
    ];
    if (angleOption === 'front-side' || angleOption === 'all') {
      angleInstructions.push({ suffix: '\n\nANGLE: Show the product from a 45-degree side angle, revealing the side profile and depth of the product.', label: 'Side' });
    }
    if (angleOption === 'front-back' || angleOption === 'all') {
      angleInstructions.push({ suffix: '\n\nANGLE: Show the back/rear of the product, revealing the back panel, ingredients list, or back design.', label: 'Back' });
    }

    const quality =
      body.quality || config.fixed_settings.quality || "standard";
    let model = getModelForQuality(quality);
    // Force Pro model when a person/model reference image is present (e.g. Selfie/UGC Set)
    if (body.model?.imageUrl) model = "google/gemini-3-pro-image-preview";
    // Force Pro model for interior design (architectural preservation needs highest fidelity)
    const isInterior = (config.ui_config as Record<string, unknown>)?.show_room_type_picker === true;
    if (isInterior) model = "google/gemini-3-pro-image-preview";
    // Force Pro model for multi-product flat lay (multiple reference images need highest fidelity)
    if (body.additional_products?.length) model = "google/gemini-3-pro-image-preview";

    // Inject interior design fields into the product object so buildVariationPrompt can access them
    const productWithExtras = {
      ...body.product,
      room_type: body.room_type,
      wall_color: body.wall_color,
      flooring_preference: body.flooring_preference,
      interior_type: body.interior_type,
      furniture_style: body.furniture_style,
      lighting_mood: body.lighting_mood,
      furniture_handling: body.furniture_handling,
      room_size: body.room_size,
      key_pieces: body.key_pieces,
      design_notes: body.design_notes,
      color_palette_preference: body.color_palette_preference,
      time_of_day: body.time_of_day,
      staging_purpose: body.staging_purpose,
      is_empty_room: body.is_empty_room,
      ceiling_height: body.ceiling_height,
      room_dimensions: body.room_dimensions,
      exact_ceiling_height: body.exact_ceiling_height,
    };

    const totalToGenerate = variationsToGenerate.length * angleInstructions.length;
    console.log(
      `[generate-workflow] Generating ${variationsToGenerate.length} variations × ${angleInstructions.length} angles = ${totalToGenerate} images using ${model}`
    );

    const images: Array<{
      url: string;
      label: string;
      aspect_ratio: string;
    }> = [];
    const errors: string[] = [];

    let wallClockBreak = false;

    for (let i = 0; i < variationsToGenerate.length && !wallClockBreak; i++) {
      const variation = variationsToGenerate[i];
      const aspectRatio = (body as Record<string, unknown>).aspectRatio as string || getAspectRatioForVariation(config, variation);

      for (let a = 0; a < angleInstructions.length; a++) {
        const angle = angleInstructions[a];

        // Wall-clock guard: break early if we're running out of time
        if (Date.now() - FUNCTION_START > MAX_WALL_CLOCK_MS) {
          console.warn(`[generate-workflow] Wall-clock limit approaching (${Math.round((Date.now() - FUNCTION_START) / 1000)}s), breaking after ${images.length}/${totalToGenerate} images`);
          wallClockBreak = true;
          break;
        }

        try {
          // Build variation with angle instruction appended
          const angleVariation: VariationItem = {
            ...variation,
            instruction: variation.instruction + angle.suffix,
          };
          const imageLabel = angleInstructions.length > 1 ? `${variation.label} (${angle.label})` : variation.label;

          const prompt = buildVariationPrompt(
            config,
            angleVariation,
            productWithExtras as WorkflowRequest["product"],
            body.brand_profile,
            i,
            variationsToGenerate.length,
            body.model,
            body.additional_products,
            body.styling_notes,
            body.prop_style,
            body.ugc_mood,
            body.theme,
            body.theme_notes,
            aspectRatio,
          );

          console.log(
            `[generate-workflow] Variation ${i + 1}/${variationsToGenerate.length} [${angle.label}]: "${variation.label}" (${aspectRatio})${body.model ? ` [with model: ${body.model.name}]` : ""}`
          );

          const referenceImages: Array<{ url: string; label: string }> = [
            { url: body.product.imageUrl, label: "product" },
          ];
          // Add additional product images as AI references for flat lay multi-product
          if (body.additional_products?.length) {
            for (const [idx, ap] of body.additional_products.entries()) {
              if (ap.imageUrl) {
                referenceImages.push({ url: ap.imageUrl, label: `product_${idx + 2}` });
              }
            }
          }
          if (body.model?.imageUrl) {
            referenceImages.push({ url: body.model.imageUrl, label: "model" });
          }
          // Add scene reference image when available and not prompt-only
          if (variation.use_scene_reference && variation.preview_url && !variation.prompt_only) {
            referenceImages.push({ url: variation.preview_url, label: "scene_reference" });
            console.log(`[generate-workflow] Adding scene reference image for "${variation.label}"`);
          }

          let imageUrl = await generateImage(
            prompt,
            referenceImages,
            model,
            LOVABLE_API_KEY,
            aspectRatio
          );

          // Seedream fallback: only for product-only (no model reference — Seedream can't preserve identity)
          if (imageUrl === null && !body.model?.imageUrl) {
            const arkApiKey = Deno.env.get("BYTEPLUS_ARK_API_KEY");
            if (arkApiKey) {
              console.warn(`[generate-workflow] Gemini returned null — falling back to Seedream 4.5 for "${variation.label}"`);
              const refImageUrls = referenceImages.map(r => r.url);
              const seedreamResult = await generateImageSeedream(
                prompt, refImageUrls, "seedream-4-5-251128", arkApiKey, aspectRatio || "1:1"
              );
              if (seedreamResult.ok && seedreamResult.imageUrl) {
                imageUrl = seedreamResult.imageUrl;
                console.log(`[generate-workflow] Seedream fallback succeeded for "${variation.label}"`);
              } else {
                console.warn(`[generate-workflow] Seedream fallback failed:`, seedreamResult.error);
              }
            }
          }

          // Flash fallback: last resort for product-only if Seedream also failed
          if (imageUrl === null && !body.model?.imageUrl) {
            console.warn(`[generate-workflow] Seedream also failed — trying Flash fallback for "${variation.label}"`);
            imageUrl = await generateImage(
              prompt,
              referenceImages,
              "google/gemini-3.1-flash-image-preview",
              LOVABLE_API_KEY,
              aspectRatio
            );
            if (imageUrl) {
              console.log(`[generate-workflow] Flash fallback succeeded for "${variation.label}"`);
            }
          }

          if (imageUrl) {
            // Upload base64 to storage to avoid bloating the database
            let finalUrl = imageUrl;
            if (imageUrl.startsWith("data:")) {
              try {
                const [meta, base64Data] = imageUrl.split(",");
                const ext = "png";

                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let k = 0; k < binaryString.length; k++) {
                  bytes[k] = binaryString.charCodeAt(k);
                }

                const userId = body.user_id || "anonymous";
                const jobId = body.job_id || crypto.randomUUID();
                const storagePath = `${userId}/${jobId}/${i}-${a}.${ext}`;

                const { error: uploadError } = await supabase.storage
                  .from("workflow-previews")
                  .upload(storagePath, bytes, {
                    contentType: "image/png",
                    cacheControl: "3600",
                  });

                if (!uploadError) {
                  const { data: publicUrlData } = supabase.storage
                    .from("workflow-previews")
                    .getPublicUrl(storagePath);
                  finalUrl = publicUrlData.publicUrl;
                  console.log(`[generate-workflow] Uploaded to storage: ${storagePath}`);
                } else {
                  console.error("[generate-workflow] Storage upload failed, keeping base64:", uploadError.message);
                }
              } catch (uploadErr) {
                console.error("[generate-workflow] Storage upload error:", uploadErr);
              }
            }

            images.push({
              url: finalUrl,
              label: imageLabel,
              aspect_ratio: aspectRatio,
            });
            console.log(
              `[generate-workflow] ✓ "${imageLabel}" generated (${images.length}/${totalToGenerate})`
            );

            // Write progress to queue row so UI can show x/y and refresh heartbeat
            if (isQueueInternal && body.job_id) {
              try {
                const progressSupabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
                await progressSupabase.from("generation_queue").update({
                  result: {
                    generatedCount: images.length,
                    requestedCount: totalToGenerate,
                    currentLabel: imageLabel,
                    // Persist images so cleanup_stale_jobs can recover partial results
                    images: images.map((img) => img.url),
                  },
                  timeout_at: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 min heartbeat
                }).eq("id", body.job_id);
              } catch (progressErr) {
                console.warn("[generate-workflow] Progress update failed:", progressErr);
              }
            }
          } else {
            errors.push(`"${imageLabel}" failed to generate`);
          }
        } catch (error: unknown) {
          if (
            typeof error === "object" &&
            error !== null &&
            "status" in error
          ) {
            const statusError = error as { status: number; message: string };
            if (isQueueInternal && body.job_id) {
              await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, [], totalToGenerate, [statusError.message], { ...body, workflow_name: workflow.name, product_title: body.product?.title } as unknown as Record<string, unknown>);
            }
            return new Response(
              JSON.stringify({ error: statusError.message }),
              {
                status: statusError.status,
                headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json",
                },
              }
            );
          }
          const imageLabel = angleInstructions.length > 1 ? `${variation.label} (${angle.label})` : variation.label;
          errors.push(
            `"${imageLabel}": ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }

        // Delay between generations
        if (a < angleInstructions.length - 1 || i < variationsToGenerate.length - 1) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    const imageUrls = images.map((img) => img.url);

    // Queue self-completion
    if (isQueueInternal && body.job_id) {
      await completeQueueJob(body.job_id, body.user_id!, body.credits_reserved!, imageUrls, totalToGenerate, errors, { ...body, workflow_name: workflow.name, product_title: body.product?.title } as unknown as Record<string, unknown>);
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate any images",
          details: errors,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        images: imageUrls,
        variations: images.map((img) => ({
          label: img.label,
          aspect_ratio: img.aspect_ratio,
        })),
        generatedCount: images.length,
        requestedCount: totalToGenerate,
        partialSuccess: images.length < totalToGenerate,
        workflow_name: workflow.name,
        strategy_type: config.variation_strategy.type,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (isQueueInternal && body.job_id) {
        await completeQueueJob(body.job_id, body.user_id, body.credits_reserved, [], 1, [error instanceof Error ? error.message : "Unknown error"], body);
      }
    } catch { /* best effort */ }
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
