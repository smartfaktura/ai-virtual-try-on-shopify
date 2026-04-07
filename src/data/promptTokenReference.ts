export interface TokenEntry {
  name: string;
  desc: string;
  example: string;
  usage: string;
}

export interface TokenGroup {
  id: string;
  label: string;
  color: string;
  tokens: TokenEntry[];
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    id: 'system',
    label: '🎨 System Directives',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    tokens: [
      { name: 'productName', desc: 'Product title from catalog', example: 'Chanel N°5 Eau de Parfum', usage: 'A luxurious close-up of {{productName}} on a velvet surface' },
      { name: 'productType', desc: 'Product type / category slug', example: 'fragrance', usage: 'Studio shot of a {{productType}} product with soft rim lighting' },
      { name: 'materialTexture', desc: 'Resolved material + finish description', example: 'smooth glass with gold accents', usage: 'Highlight the {{materialTexture}} under directional light' },
      { name: 'background', desc: 'Full background directive from user selection', example: 'soft gradient cream-to-white backdrop', usage: '{{background}}. Product centered in frame.' },
      { name: 'lightingDirective', desc: 'Lighting sentence built from settings', example: 'Soft diffused window light from the left', usage: '{{lightingDirective}}. Gentle highlights on the cap.' },
      { name: 'shadowDirective', desc: 'Shadow sentence', example: 'Subtle contact shadow, no harsh edges', usage: '{{shadowDirective}}. Clean, commercial feel.' },
      { name: 'moodDirective', desc: 'Styling direction', example: 'Elegant and minimal', usage: '{{moodDirective}} aesthetic throughout the scene.' },
      { name: 'surfaceDirective', desc: 'Surface type sentence', example: 'Placed on polished white marble', usage: '{{surfaceDirective}} with soft reflections.' },
      { name: 'environmentDirective', desc: 'Environment sentence', example: 'Indoor studio environment', usage: '{{environmentDirective}}. No distracting elements.' },
      { name: 'consistencyDirective', desc: 'Cross-shot consistency instruction', example: 'Maintain identical lighting and color grading across all shots', usage: '{{consistencyDirective}}.' },
      { name: 'cameraDirective', desc: 'Camera/lens specification', example: '85mm f/1.8, shallow depth of field', usage: 'Shot with {{cameraDirective}}. Crisp product, blurred background.' },
      { name: 'personDirective', desc: 'Full person description for on-model shots', example: 'Female model, mid-20s, warm skin tone', usage: '{{personDirective}}, looking away from camera, natural pose.' },
      { name: 'outfitDirective', desc: 'Outfit lock directive for on-model', example: 'Wearing a black silk slip dress, no substitutions', usage: '{{outfitDirective}}. CRITICAL: exact outfit as described.' },
      { name: 'handStyle', desc: 'Hand description for hand-held shots', example: 'Elegant female hand with natural nails', usage: '{{handStyle}} delicately holding the product.' },
      { name: 'nailDirective', desc: 'Nail style', example: 'Short natural nails, nude polish', usage: '{{nailDirective}}. Clean, well-groomed fingers.' },
      { name: 'actionDirective', desc: 'Action type + intensity', example: 'Gentle spray mist in mid-air', usage: '{{actionDirective}}, frozen in time, backlit.' },
      { name: 'focusArea', desc: 'What to focus on', example: 'The embossed logo on the cap', usage: 'Sharp focus on {{focusArea}}, rest softly blurred.' },
      { name: 'cropDirective', desc: 'Crop intensity', example: 'Tight crop, product fills 80% of frame', usage: '{{cropDirective}}. Minimal negative space.' },
      { name: 'brandingDirective', desc: 'Branding visibility', example: 'Logo clearly visible and legible', usage: '{{brandingDirective}}. Brand name facing camera.' },
      { name: 'packagingDirective', desc: 'Packaging details', example: 'Include the outer box partially open behind the bottle', usage: '{{packagingDirective}}, adding depth to composition.' },
      { name: 'accentDirective', desc: 'Accent color directive', example: 'Gold accents echoed in background elements', usage: '{{accentDirective}} to create color harmony.' },
      { name: 'stylingDirective', desc: 'Styling direction', example: 'Minimalist Scandinavian styling', usage: '{{stylingDirective}}. Less is more.' },
      { name: 'productProminenceDirective', desc: 'Product prominence level', example: 'Product is the hero, occupying center frame', usage: '{{productProminenceDirective}}.' },
      { name: 'sceneIntensityDirective', desc: 'Scene mood/intensity', example: 'Calm, serene, understated luxury', usage: '{{sceneIntensityDirective}}. No visual clutter.' },
      { name: 'compositionDirective', desc: 'Composition framing', example: 'Rule of thirds, product on right intersection', usage: '{{compositionDirective}} with breathing room on the left.' },
      { name: 'negativeSpaceDirective', desc: 'Negative space usage', example: 'Generous negative space on top for text overlay', usage: '{{negativeSpaceDirective}}. Ready for ad copy placement.' },
      { name: 'categoryPackshotDirective', desc: 'Category-specific packshot rules', example: 'Bottle upright, cap on, label facing camera', usage: '{{categoryPackshotDirective}}. Standard e-commerce ready.' },
      { name: 'bodyFramingDirective', desc: 'Body framing for on-model', example: 'Mid-body crop from waist to chest', usage: '{{bodyFramingDirective}}, product held at chest height.' },
      { name: 'modelDirective', desc: 'Model reference directive', example: 'Use the selected AI model reference image', usage: '{{modelDirective}}. Consistent model across all shots.' },
    ],
  },
  {
    id: 'visual',
    label: '🔍 Global Visual',
    color: 'bg-purple-500/10 text-purple-700 border-purple-200',
    tokens: [
      { name: 'productCategory', desc: 'Auto-detected product category', example: 'fragrance', usage: 'A premium {{productCategory}} product shot in studio conditions' },
      { name: 'productSubcategory', desc: 'Sub-category within the main category', example: 'eau de parfum', usage: 'This {{productSubcategory}} presented in its full elegance' },
      { name: 'productForm', desc: 'Physical form of the product', example: 'glass bottle with spray top', usage: 'The {{productForm}} catching light from the right' },
      { name: 'productSilhouette', desc: 'Outline shape description', example: 'tall rectangular with rounded shoulders', usage: 'The distinctive {{productSilhouette}} silhouette creates visual interest' },
      { name: 'productMainHex', desc: 'Dominant product color as hex', example: '#C4A265', usage: 'Background complementing the product\'s {{productMainHex}} tone' },
      { name: 'productSecondaryHex', desc: 'Secondary product color hex', example: '#1A1A1A', usage: 'Accent elements matching {{productSecondaryHex}}' },
      { name: 'productAccentHex', desc: 'Accent/highlight color hex', example: '#D4AF37', usage: 'Metallic details echoing {{productAccentHex}}' },
      { name: 'backgroundBaseHex', desc: 'AI-suggested background color', example: '#F5F0EB', usage: 'Seamless backdrop in {{backgroundBaseHex}}' },
      { name: 'backgroundSecondaryHex', desc: 'Secondary background color', example: '#E8E0D5', usage: 'Gradient transitioning to {{backgroundSecondaryHex}}' },
      { name: 'shadowToneHex', desc: 'Ideal shadow tone', example: '#8B7355', usage: 'Warm shadow cast in {{shadowToneHex}} tones' },
      { name: 'productFinishType', desc: 'Surface finish type', example: 'glossy', usage: 'The {{productFinishType}} surface reflecting ambient light' },
      { name: 'materialPrimary', desc: 'Main material', example: 'glass', usage: 'Close-up revealing the {{materialPrimary}} texture and quality' },
      { name: 'materialSecondary', desc: 'Secondary material', example: 'brushed gold metal', usage: 'Details in {{materialSecondary}} adding contrast' },
      { name: 'textureType', desc: 'Surface texture description', example: 'smooth with micro-etched pattern', usage: 'The {{textureType}} surface creates subtle light play' },
      { name: 'transparencyType', desc: 'Transparency level', example: 'translucent amber', usage: 'Light passing through the {{transparencyType}} body' },
      { name: 'metalTone', desc: 'Metal tone if applicable', example: 'rose gold', usage: 'Hardware in {{metalTone}}, warm and luxurious' },
      { name: 'heroFeature', desc: 'Most photogenic feature', example: 'the faceted crystal cap', usage: 'Hero angle showcasing {{heroFeature}}' },
      { name: 'detailFocusAreas', desc: 'Areas worth macro close-ups', example: 'cap texture, logo engraving, spray mechanism', usage: 'Macro detail of {{detailFocusAreas}}' },
      { name: 'scaleType', desc: 'Size scale reference', example: 'palm-sized', usage: 'The {{scaleType}} product held gracefully in one hand' },
      { name: 'wearabilityMode', desc: 'How the product is used', example: 'sprayed on skin', usage: 'Showing the product being {{wearabilityMode}}' },
      { name: 'bodyPlacementSuggested', desc: 'Where on body it goes', example: 'wrist and neck', usage: 'Applied to {{bodyPlacementSuggested}}, lifestyle moment' },
    ],
  },
  {
    id: 'semantic',
    label: '🌿 Global Semantic',
    color: 'bg-green-500/10 text-green-700 border-green-200',
    tokens: [
      { name: 'ingredientFamilyPrimary', desc: 'Primary ingredient family', example: 'floral', usage: 'Surrounded by fresh {{ingredientFamilyPrimary}} elements' },
      { name: 'ingredientFamilySecondary', desc: 'Secondary ingredient family', example: 'woody', usage: 'With subtle {{ingredientFamilySecondary}} props in background' },
      { name: 'fruitsRelated', desc: 'Related fruits for styling props', example: 'bergamot, blood orange, fig', usage: 'Artfully arranged {{fruitsRelated}} slices beside the product' },
      { name: 'flowersRelated', desc: 'Related flowers for styling', example: 'white rose, jasmine, peony', usage: 'Scattered fresh {{flowersRelated}} petals on the surface' },
      { name: 'botanicalsRelated', desc: 'Related botanicals/herbs', example: 'lavender sprigs, eucalyptus', usage: 'Delicate {{botanicalsRelated}} framing the composition' },
      { name: 'woodsRelated', desc: 'Related wood types', example: 'sandalwood, cedar bark', usage: 'Raw {{woodsRelated}} pieces as natural props' },
      { name: 'spicesRelated', desc: 'Related spices', example: 'vanilla pods, cinnamon sticks', usage: 'Warm {{spicesRelated}} scattered naturally around the base' },
      { name: 'greensRelated', desc: 'Related greenery/leaves', example: 'monstera leaf, fern fronds', usage: 'Lush {{greensRelated}} creating a tropical backdrop' },
      { name: 'materialsRelated', desc: 'Related styling materials', example: 'raw silk fabric, linen', usage: 'Draped {{materialsRelated}} as textural background' },
      { name: 'regionRelated', desc: 'Geographic/cultural association', example: 'Mediterranean, Southern France', usage: '{{regionRelated}}-inspired setting with warm sunlight' },
      { name: 'landscapeRelated', desc: 'Landscape association', example: 'coastal cliffs, lavender fields', usage: 'Evoking {{landscapeRelated}} through color and mood' },
    ],
  },
  {
    id: 'fashion',
    label: '👗 Fashion & Apparel',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'garmentType', desc: 'Type of garment', example: 'blazer', usage: 'The {{garmentType}} draped over a wooden chair, editorial style' },
      { name: 'fitType', desc: 'Fit style', example: 'oversized', usage: 'Model wearing the {{fitType}} fit, relaxed confident pose' },
      { name: 'fabricType', desc: 'Fabric type', example: 'Italian wool', usage: 'Close-up showing the luxurious {{fabricType}} weave' },
      { name: 'fabricWeight', desc: 'Fabric weight', example: 'mid-weight', usage: 'The {{fabricWeight}} fabric holding its shape beautifully' },
      { name: 'drapeBehavior', desc: 'How fabric drapes', example: 'structured with soft shoulders', usage: 'Natural {{drapeBehavior}} visible in three-quarter angle' },
    ],
  },
  {
    id: 'beauty',
    label: '✨ Beauty & Skincare',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'packagingType', desc: 'Packaging type', example: 'frosted glass dropper bottle', usage: 'The {{packagingType}} on a clean white surface' },
      { name: 'formulaType', desc: 'Formula type', example: 'hydrating serum', usage: 'A drop of the {{formulaType}} on fingertip, glistening' },
      { name: 'formulaTexture', desc: 'Formula texture', example: 'lightweight gel', usage: 'Swatch of {{formulaTexture}} on glass, showing consistency' },
      { name: 'applicationMode', desc: 'How applied', example: 'dropper to palm', usage: 'Action shot of {{applicationMode}}, natural hand' },
      { name: 'skinAreaSuggested', desc: 'Target skin area', example: 'under-eye and cheekbones', usage: 'Applied to {{skinAreaSuggested}}, dewy finish' },
    ],
  },
  {
    id: 'fragrance',
    label: '🌸 Fragrances',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'fragranceFamily', desc: 'Scent family classification', example: 'floral-oriental', usage: 'The {{fragranceFamily}} character reflected through warm-toned props' },
      { name: 'bottleType', desc: 'Bottle shape/type', example: 'faceted rectangular', usage: 'The distinctive {{bottleType}} bottle catching prismatic light' },
      { name: 'capStyle', desc: 'Cap/topper style', example: 'heavy magnetic cap with gold rim', usage: 'Detail shot of the {{capStyle}}, precision craftsmanship' },
      { name: 'liquidColorHex', desc: 'Liquid color as hex', example: '#E8C97A', usage: 'The amber liquid in {{liquidColorHex}} glowing with backlight' },
      { name: 'glassTintType', desc: 'Glass tint', example: 'clear with slight amber tint', usage: 'The {{glassTintType}} glass revealing the juice within' },
      { name: 'noteObjectsPrimary', desc: 'Primary scent note objects', example: 'Turkish rose, oud chips', usage: 'Surrounded by {{noteObjectsPrimary}}, raw and beautiful' },
      { name: 'noteObjectsSecondary', desc: 'Secondary note objects', example: 'vanilla pods, amber resin', usage: 'With {{noteObjectsSecondary}} artfully placed behind' },
      { name: 'scentWorld', desc: 'Scent atmosphere description', example: 'warm evening in a Moroccan garden', usage: 'Evoking the world of {{scentWorld}} through styling' },
    ],
  },
  {
    id: 'jewelry',
    label: '💎 Jewelry',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'jewelryType', desc: 'Type of jewelry', example: 'statement ring', usage: 'The {{jewelryType}} resting on a stone surface, dramatic shadow' },
      { name: 'gemType', desc: 'Gemstone type', example: 'emerald-cut diamond', usage: 'Light refracting through the {{gemType}}, brilliant sparkle' },
      { name: 'gemColorHex', desc: 'Gem color hex', example: '#50C878', usage: 'The {{gemColorHex}} stone radiating against dark velvet' },
      { name: 'metalPrimary', desc: 'Primary metal', example: '18k yellow gold', usage: 'The warm glow of {{metalPrimary}} under soft lighting' },
      { name: 'metalFinish', desc: 'Metal finish', example: 'polished mirror finish', usage: 'The {{metalFinish}} creating sharp reflections' },
      { name: 'wearPlacement', desc: 'Where worn', example: 'ring finger, right hand', usage: 'Worn on {{wearPlacement}}, elegant hand pose' },
      { name: 'sparkleLevel', desc: 'Sparkle intensity', example: 'high brilliance', usage: 'Capturing the {{sparkleLevel}} with point-source lighting' },
    ],
  },
  {
    id: 'accessories',
    label: '👜 Accessories',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'accessoryType', desc: 'Type of accessory', example: 'structured tote bag', usage: 'The {{accessoryType}} styled flat-lay with daily essentials' },
      { name: 'carryMode', desc: 'How carried', example: 'shoulder carry', usage: 'Model demonstrating {{carryMode}}, walking pose' },
      { name: 'strapType', desc: 'Strap type', example: 'adjustable chain strap', usage: 'Detail of the {{strapType}} hardware and attachment' },
      { name: 'hardwareType', desc: 'Hardware type', example: 'turn-lock clasp', usage: 'Macro of the {{hardwareType}}, precision engineering' },
      { name: 'hardwareFinish', desc: 'Hardware finish', example: 'brushed gold', usage: 'The {{hardwareFinish}} hardware catching warm light' },
      { name: 'structureType', desc: 'Structure type', example: 'rigid structured', usage: 'The {{structureType}} silhouette holding its form perfectly' },
      { name: 'signatureDetail', desc: 'Signature design detail', example: 'quilted diamond pattern', usage: 'Close-up of the iconic {{signatureDetail}}' },
    ],
  },
  {
    id: 'home',
    label: '🏠 Home & Decor',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'decorType', desc: 'Type of decor item', example: 'scented candle in ceramic vessel', usage: 'The {{decorType}} in a styled living space vignette' },
      { name: 'placementType', desc: 'Where it sits', example: 'coffee table', usage: 'Placed on a {{placementType}}, curated styling around it' },
      { name: 'objectScale', desc: 'Scale reference', example: 'tabletop, 15cm tall', usage: 'The {{objectScale}} object proportioned within the scene' },
      { name: 'baseMaterial', desc: 'Base material', example: 'hand-thrown ceramic', usage: 'The organic {{baseMaterial}} texture in soft focus' },
      { name: 'surfaceFinish', desc: 'Surface finish', example: 'matte speckled glaze', usage: 'The {{surfaceFinish}} catching subtle light variations' },
      { name: 'roomContextSuggested', desc: 'Suggested room context', example: 'modern minimalist living room', usage: 'Set within a {{roomContextSuggested}} environment' },
      { name: 'stylingCompanions', desc: 'Companion objects', example: 'coffee table book, dried flowers', usage: 'Styled alongside {{stylingCompanions}} for context' },
    ],
  },
  {
    id: 'food',
    label: '🍽️ Food & Beverage',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'foodType', desc: 'Type of food/beverage', example: 'artisan dark chocolate bar', usage: 'The {{foodType}} broken to reveal cross-section' },
      { name: 'servingMode', desc: 'How it\'s served', example: 'plated on ceramic dish', usage: '{{servingMode}} with casual elegance' },
      { name: 'ingredientObjectsPrimary', desc: 'Primary ingredient props', example: 'cacao nibs, vanilla bean', usage: 'Scattered {{ingredientObjectsPrimary}} around the product' },
      { name: 'ingredientObjectsSecondary', desc: 'Secondary ingredient props', example: 'sea salt flakes, hazelnuts', usage: '{{ingredientObjectsSecondary}} adding visual interest in background' },
      { name: 'textureCue', desc: 'Visual texture cue', example: 'snap-crunch, glossy tempered surface', usage: 'The {{textureCue}} visible in the macro shot' },
      { name: 'temperatureCue', desc: 'Temperature suggestion', example: 'room temperature, slightly melting', usage: '{{temperatureCue}} — showing the perfect moment' },
      { name: 'consumptionContext', desc: 'Consumption setting', example: 'afternoon indulgence moment', usage: 'Set in a {{consumptionContext}} lifestyle scenario' },
    ],
  },
  {
    id: 'electronics',
    label: '📱 Electronics',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'deviceType', desc: 'Device type', example: 'wireless earbuds with charging case', usage: 'The {{deviceType}} on a clean desk setup' },
      { name: 'interfaceType', desc: 'Interface type', example: 'touch-sensitive surface', usage: 'Finger approaching the {{interfaceType}}' },
      { name: 'screenPresence', desc: 'Screen visibility', example: 'screen on, showing UI', usage: '{{screenPresence}} with realistic on-screen content' },
      { name: 'screenStateSuggested', desc: 'Suggested screen state', example: 'music player interface', usage: 'Screen displaying {{screenStateSuggested}}' },
      { name: 'finishMaterialPrimary', desc: 'Primary finish material', example: 'matte aluminum', usage: 'The {{finishMaterialPrimary}} body in cool studio light' },
      { name: 'industrialStyle', desc: 'Industrial design style', example: 'minimal Scandinavian', usage: 'The {{industrialStyle}} design language on display' },
      { name: 'portDetail', desc: 'Port details', example: 'USB-C port, LED indicator', usage: 'Detail showing {{portDetail}} with precision' },
      { name: 'buttonDetail', desc: 'Button details', example: 'single tactile button with embossed logo', usage: 'Macro of {{buttonDetail}}' },
    ],
  },
  {
    id: 'sports',
    label: '⚽ Sports & Fitness',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'sportType', desc: 'Sport type', example: 'running', usage: 'Gear styled for {{sportType}}, dynamic energy' },
      { name: 'gearType', desc: 'Gear type', example: 'performance running shoe', usage: 'The {{gearType}} shot from low angle, powerful presence' },
      { name: 'performanceMaterial', desc: 'Performance material', example: 'breathable mesh with TPU cage', usage: 'Close-up of {{performanceMaterial}} technology' },
      { name: 'gripTexture', desc: 'Grip texture', example: 'rubber waffle outsole', usage: 'The {{gripTexture}} pattern in detailed macro' },
      { name: 'motionCue', desc: 'Motion cue for dynamic shots', example: 'mid-stride impact freeze', usage: '{{motionCue}} — capturing peak action' },
      { name: 'usageContext', desc: 'Usage context', example: 'urban morning run', usage: 'Set in a {{usageContext}} environment' },
      { name: 'surfaceContext', desc: 'Surface context', example: 'wet asphalt, puddle reflections', usage: 'On {{surfaceContext}}, adding drama and texture' },
    ],
  },
  {
    id: 'health',
    label: '💊 Health & Supplements',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    tokens: [
      { name: 'supplementType', desc: 'Supplement type', example: 'plant-based protein powder', usage: 'The {{supplementType}} container with scooped serving' },
      { name: 'dosageForm', desc: 'Dosage form', example: 'fine powder', usage: 'The {{dosageForm}} captured mid-pour, freeze frame' },
      { name: 'mixingMode', desc: 'Mixing mode', example: 'blended into smoothie', usage: 'Action shot of {{mixingMode}}, vibrant colors' },
      { name: 'wellnessIngredientObjects', desc: 'Wellness ingredient props', example: 'spirulina, chia seeds, fresh berries', usage: 'Raw {{wellnessIngredientObjects}} arranged beside the product' },
      { name: 'containerType', desc: 'Container type', example: 'matte black tub with screw lid', usage: 'The {{containerType}} front-facing, label visible' },
      { name: 'clinicalCleanlinessLevel', desc: 'Clinical cleanliness feel', example: 'lab-clean, scientific', usage: '{{clinicalCleanlinessLevel}} backdrop, trust-building aesthetic' },
      { name: 'routineContext', desc: 'Routine context', example: 'post-workout recovery', usage: 'Styled in a {{routineContext}} lifestyle moment' },
    ],
  },
];

/** Flat list of all tokens with group metadata */
export const ALL_TOKENS = TOKEN_GROUPS.flatMap(g =>
  g.tokens.map(t => ({ ...t, groupId: g.id, groupLabel: g.label }))
);

/** Compact token reference string for AI system prompts */
export function buildTokenReferenceForAI(): string {
  return TOKEN_GROUPS.map(g => {
    const tokenLines = g.tokens.map(t => `  - {{${t.name}}} — ${t.desc}`).join('\n');
    return `[${g.label}]\n${tokenLines}`;
  }).join('\n\n');
}
