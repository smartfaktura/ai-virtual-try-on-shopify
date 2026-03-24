// Prompt Builder Quiz — mechanical conditional prompt assembly

export type QuizCategory =
  | 'fashion' | 'beauty' | 'fragrances' | 'jewelry' | 'accessories'
  | 'home' | 'food' | 'electronics' | 'sports' | 'health' | 'other';

export type SubjectType = 'single-model' | 'multiple-models' | 'faceless' | 'on-surface' | 'floating' | 'flat-lay';
export type InteractionType = 'worn' | 'held' | 'placed-nearby' | 'background';
export type SettingType = 'studio' | 'indoor' | 'outdoor' | 'editorial' | 'ai-decide';
export type MoodType = 'luxury' | 'minimal' | 'bold' | 'warm' | 'organic';
export type FramingType = 'full-body' | 'upper-body' | 'close-up' | 'side-profile' | 'hand-focus';

export interface QuizAnswers {
  category: QuizCategory;
  subject: SubjectType;
  interaction?: InteractionType;
  setting: SettingType;
  mood: MoodType;
  framing?: FramingType;
}

export const CATEGORY_LABELS: Record<QuizCategory, string> = {
  fashion: 'Fashion & Apparel',
  beauty: 'Beauty & Skincare',
  fragrances: 'Fragrances',
  jewelry: 'Jewelry',
  accessories: 'Accessories',
  home: 'Home & Decor',
  food: 'Food & Beverage',
  electronics: 'Electronics',
  sports: 'Sports & Fitness',
  health: 'Health & Supplements',
  other: 'Other Products',
};

export const CATEGORY_ICONS: Record<QuizCategory, string> = {
  fashion: 'Shirt',
  beauty: 'Sparkles',
  fragrances: 'Wind',
  jewelry: 'Gem',
  accessories: 'Watch',
  home: 'Lamp',
  food: 'UtensilsCrossed',
  electronics: 'Smartphone',
  sports: 'Dumbbell',
  health: 'Heart',
  other: 'Package',
};

// Which subject options are available per category
export function getSubjectOptions(category: QuizCategory) {
  const withPerson: { value: SubjectType; label: string; description: string }[] = [
    { value: 'single-model', label: 'Single Model', description: 'One person showcasing the product' },
    { value: 'faceless', label: 'Faceless', description: 'Hands or body only, no face' },
  ];
  // Multiple models only for fashion/beauty/sports
  if (['fashion', 'beauty', 'sports'].includes(category)) {
    withPerson.splice(1, 0, { value: 'multiple-models', label: 'Multiple Models', description: 'Two or more people together' });
  }

  const productOnly: { value: SubjectType; label: string; description: string }[] = [
    { value: 'on-surface', label: 'On Surface', description: 'Product placed on a surface' },
    { value: 'floating', label: 'Floating', description: 'Product levitating, dramatic effect' },
    { value: 'flat-lay', label: 'Flat Lay', description: 'Top-down arrangement' },
  ];

  return { withPerson, productOnly };
}

export function getInteractionOptions(category: QuizCategory): { value: InteractionType; label: string; description: string }[] {
  const base: { value: InteractionType; label: string; description: string }[] = [
    { value: 'worn', label: 'Worn / Used Naturally', description: 'Product is being worn or used' },
    { value: 'held', label: 'Held in Hand', description: 'Model holding the product' },
    { value: 'placed-nearby', label: 'Placed Nearby', description: 'Product visible next to the model' },
    { value: 'background', label: 'In the Background', description: 'Product subtly placed in the scene' },
  ];

  if (['fashion', 'jewelry', 'accessories'].includes(category)) {
    return base;
  }
  if (['food', 'electronics'].includes(category)) {
    return base.filter(o => o.value !== 'worn');
  }
  return base;
}

export function getFramingOptions(category: QuizCategory, subject?: SubjectType): { value: FramingType; label: string; description: string }[] {
  // Faceless subjects should only get close-up and hand-focus options
  if (subject === 'faceless') {
    return [
      { value: 'close-up', label: 'Close-up Detail', description: 'Tight shot on the product' },
      { value: 'hand-focus', label: 'Hand / Wrist Focus', description: 'Emphasis on hands and product' },
    ];
  }
  const options: { value: FramingType; label: string; description: string }[] = [
    { value: 'full-body', label: 'Full Body', description: 'Head to toe, complete look' },
    { value: 'upper-body', label: 'Upper Body', description: 'Waist up, focus on torso' },
    { value: 'close-up', label: 'Close-up Detail', description: 'Tight shot on the product' },
    { value: 'side-profile', label: 'Side Profile', description: 'Angled view for depth' },
    { value: 'hand-focus', label: 'Hand / Wrist Focus', description: 'Emphasis on hands and product' },
  ];

  if (['jewelry', 'accessories'].includes(category)) {
    return options.filter(o => ['close-up', 'hand-focus', 'upper-body'].includes(o.value));
  }
  if (['beauty', 'fragrances'].includes(category)) {
    return options.filter(o => ['close-up', 'upper-body', 'side-profile'].includes(o.value));
  }
  return options;
}

// ——— Enhanced Prompt Fragments with Photography Best Practices ———

const MOOD_FRAGMENTS: Record<MoodType, string> = {
  luxury: 'Premium, sophisticated',
  minimal: 'Clean, minimalist',
  bold: 'Bold, high-contrast',
  warm: 'Warm, inviting',
  organic: 'Natural, earthy',
};

const SETTING_FRAGMENTS: Record<SettingType, string> = {
  studio: 'studio',
  indoor: 'indoor lifestyle',
  outdoor: 'outdoor',
  editorial: 'editorial',
  'ai-decide': '',
};

const SUBJECT_FRAGMENTS: Record<SubjectType, string> = {
  'single-model': 'A single model',
  'multiple-models': 'Two models together',
  faceless: 'A faceless composition featuring elegant hands and partial body',
  'on-surface': 'The product artfully arranged on a styled surface',
  floating: 'The product floating dramatically against the backdrop',
  'flat-lay': 'A carefully curated flat lay arrangement viewed from directly above',
};

const INTERACTION_FRAGMENTS: Record<InteractionType, string> = {
  worn: 'wearing the product naturally, candid movement',
  held: 'holding the product with intention, fingers visible',
  'placed-nearby': 'with the product placed nearby in the frame',
  background: 'with the product visible in the scene composition',
};

const FRAMING_FRAGMENTS: Record<FramingType, string> = {
  'full-body': 'Full body shot, head to toe, rule of thirds placement with negative space.',
  'upper-body': 'Upper body framing from the waist up, centered composition.',
  'close-up': 'Close-up detail shot, shallow depth of field, soft bokeh background.',
  'side-profile': 'Side profile three-quarter angle, adding depth and dimension.',
  'hand-focus': 'Tight macro focus on hands and wrist area, blurred surroundings.',
};

// Camera & lens hints per mood
const CAMERA_HINTS: Record<MoodType, string> = {
  luxury: 'Shot with 85mm f/1.4 portrait lens, shallow depth of field, three-point lighting setup.',
  minimal: 'Even diffused lighting, 50mm prime lens, neutral daylight 5600K white balance.',
  bold: 'Wide-angle 35mm lens, dramatic rim lighting, high contrast color grading.',
  warm: 'Natural light through window, 85mm lens, warm white balance 4500K, soft fill bounce.',
  organic: 'Available light, 50mm f/2 lens, muted color palette, subtle film grain texture.',
};

// Lighting directives per setting
const LIGHTING_HINTS: Record<SettingType, string> = {
  studio: 'Professional three-point lighting, clean seamless backdrop, controlled shadows.',
  indoor: 'Soft window light with fill bounce, ambient interior glow, natural shadow fall.',
  outdoor: 'Golden hour natural sunlight, soft directional light, environmental rim lighting.',
  editorial: 'Creative colored gels, dramatic single-source lighting, intentional hard shadows.',
  'ai-decide': '',
};

const MOOD_KEYWORDS: Record<MoodType, string> = {
  luxury: 'Refined lighting, luxurious details, elevated composition, crisp focus on textures.',
  minimal: 'Clean lines, subtle tones, refined simplicity, precise negative space.',
  bold: 'Striking editorial composition with dynamic energy, saturated color accents.',
  warm: 'Cozy atmosphere with soft golden light, earth tones, gentle vignette.',
  organic: 'Organic textures, muted desaturated tones, raw natural beauty, tactile materials.',
};

// Category-specific surface/texture and finishing touches
const CATEGORY_KEYWORDS: Partial<Record<QuizCategory, string>> = {
  fashion: 'Fashion-forward styling, fabric texture visible, natural body movement.',
  beauty: 'Soft beauty lighting with catch lights, dewy skin texture, luminous finish.',
  fragrances: 'Atmospheric mist, subtle glass reflections, liquid texture visible in bottle.',
  jewelry: 'Sparkling facets with precise point lighting, velvet or reflective surface, micro detail.',
  food: 'Appetizing presentation, fresh ingredients, rustic wood or marble surface, steam or condensation detail.',
  electronics: 'Sleek modern angles, reflective surface highlights, precise product edges.',
  home: 'Styled interior vignette, complementary decor elements, lived-in warmth.',
  sports: 'Dynamic energy, motion blur suggestion, active lifestyle context.',
  health: 'Clean wellness aesthetic, natural ingredients visible, calming composition.',
};

// Composition cues for product-only subjects
const PRODUCT_COMPOSITION: Partial<Record<SubjectType, string>> = {
  'on-surface': 'Slightly elevated camera angle, complementary props, styled surface texture.',
  floating: 'Center-frame floating with dramatic drop shadow, clean gradient background.',
  'flat-lay': 'Perfectly overhead camera angle, balanced grid composition, styled arrangement with props.',
};

export function assemblePrompt(answers: QuizAnswers): string {
  const isPerson = ['single-model', 'multiple-models', 'faceless'].includes(answers.subject);
  const mood = MOOD_FRAGMENTS[answers.mood];
  const setting = SETTING_FRAGMENTS[answers.setting];
  const settingLabel = setting ? ` ${setting}` : '';

  const parts: string[] = [];

  // Opening line
  parts.push(`${mood}${settingLabel} product photography.`);

  // Subject + interaction
  const subjectFrag = SUBJECT_FRAGMENTS[answers.subject];
  if (isPerson && answers.interaction) {
    parts.push(`${subjectFrag} ${INTERACTION_FRAGMENTS[answers.interaction]}.`);
  } else {
    parts.push(`${subjectFrag}.`);
  }

  // Framing (person) or composition cue (product-only)
  if (isPerson && answers.framing) {
    parts.push(FRAMING_FRAGMENTS[answers.framing]);
  } else if (!isPerson) {
    const comp = PRODUCT_COMPOSITION[answers.subject];
    if (comp) parts.push(comp);
  }

  // Camera & lens hint based on mood
  parts.push(CAMERA_HINTS[answers.mood]);

  // Lighting based on setting
  const lightHint = LIGHTING_HINTS[answers.setting];
  if (lightHint) parts.push(lightHint);

  // Style keywords
  parts.push(MOOD_KEYWORDS[answers.mood]);

  // Category-specific finishing touch
  const catKeyword = CATEGORY_KEYWORDS[answers.category];
  if (catKeyword) parts.push(catKeyword);

  return parts.join(' ');
}
