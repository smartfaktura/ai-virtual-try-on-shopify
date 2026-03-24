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

  // Filter based on category
  if (['fashion', 'jewelry', 'accessories'].includes(category)) {
    return base; // All options
  }
  if (['food', 'electronics'].includes(category)) {
    return base.filter(o => o.value !== 'worn');
  }
  return base;
}

export function getFramingOptions(category: QuizCategory): { value: FramingType; label: string; description: string }[] {
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

// ——— Prompt fragments ———

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
  faceless: 'Elegant hands',
  'on-surface': 'The product artfully arranged on a natural surface',
  floating: 'The product floating dramatically against the backdrop',
  'flat-lay': 'A carefully curated flat lay arrangement',
};

const INTERACTION_FRAGMENTS: Record<InteractionType, string> = {
  worn: 'wearing the product naturally',
  held: 'holding the product with intention',
  'placed-nearby': 'with the product placed nearby',
  background: 'with the product visible in the scene',
};

const FRAMING_FRAGMENTS: Record<FramingType, string> = {
  'full-body': 'Full body shot, head to toe.',
  'upper-body': 'Upper body framing, waist up.',
  'close-up': 'Close-up detail shot with shallow depth of field.',
  'side-profile': 'Side profile angle for depth and dimension.',
  'hand-focus': 'Tight focus on hands and wrist area.',
};

const MOOD_KEYWORDS: Record<MoodType, string> = {
  luxury: 'Refined lighting, luxurious details, elevated composition.',
  minimal: 'Clean lines, subtle tones, refined simplicity.',
  bold: 'Striking editorial composition with dynamic energy.',
  warm: 'Cozy atmosphere with soft golden light and earth tones.',
  organic: 'Organic textures, muted tones, raw natural beauty.',
};

const CATEGORY_KEYWORDS: Partial<Record<QuizCategory, string>> = {
  fashion: 'Fashion-forward styling.',
  beauty: 'Soft, glowing skin lighting.',
  fragrances: 'Atmospheric mist and subtle reflections.',
  jewelry: 'Sparkling facets with precise lighting.',
  food: 'Appetizing presentation with fresh ingredients.',
  electronics: 'Sleek, modern product angles.',
  home: 'Styled interior vignette.',
};

export function assemblePrompt(answers: QuizAnswers): string {
  const isPerson = ['single-model', 'multiple-models', 'faceless'].includes(answers.subject);
  const mood = MOOD_FRAGMENTS[answers.mood];
  const setting = SETTING_FRAGMENTS[answers.setting];
  const settingLabel = setting ? ` ${setting}` : '';

  let parts: string[] = [];

  // Opening line
  parts.push(`${mood}${settingLabel} product photography.`);

  // Subject
  const subjectFrag = SUBJECT_FRAGMENTS[answers.subject];
  if (isPerson && answers.interaction) {
    parts.push(`${subjectFrag} ${INTERACTION_FRAGMENTS[answers.interaction]}.`);
  } else {
    parts.push(`${subjectFrag}.`);
  }

  // Framing (only for person)
  if (isPerson && answers.framing) {
    parts.push(FRAMING_FRAGMENTS[answers.framing]);
  }

  // Style keywords
  parts.push(MOOD_KEYWORDS[answers.mood]);

  // Category-specific finishing touch
  const catKeyword = CATEGORY_KEYWORDS[answers.category];
  if (catKeyword) parts.push(catKeyword);

  return parts.join(' ');
}
