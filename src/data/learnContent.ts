// Learn / Tutorials content config — single source of truth.
// Add a new guide by appending an object to LEARN_GUIDES.

export type LearnSection = 'visual-studio' | 'freestyle';
export type LearnTrack = 'start' | 'visual-types' | 'quality' | 'advanced';
export type LearnLevel = 'foundational' | 'core' | 'advanced';

export interface LearnGuide {
  /** URL slug (per section). For visual-studio guides this matches the workflow slug when possible. */
  slug: string;
  section: LearnSection;
  /** Hub-card title */
  title: string;
  /** One-line tagline (hub card + hero) */
  tagline: string;
  /** Reading time in minutes */
  readMin: number;
  /** Hero image (Supabase storage URL or static asset). Optional — falls back to gradient. */
  heroImage?: string;
  /** Intent tracks this guide belongs to (1–2). */
  tracks: LearnTrack[];
  /** Difficulty / progression level. */
  level: LearnLevel;
  /** One-liner answering: "When should I pick THIS workflow?" */
  whenToUse?: string;
  /** Side-by-side comparisons against the most-confused alternatives. */
  vsAlternatives?: { label: string; useThisWhen: string }[];
  /** Section blocks */
  whatItDoes: string;
  bestFor: string[];
  whatYouNeed: string[];
  whatYouGet: string[];
  quickStart: { label: string; detail?: string }[];
  tips: { type: 'do' | 'dont'; text: string }[];
  /** Visual examples — 3 image URLs */
  examples?: string[];
  /** Primary CTA */
  cta: { label: string; route: string };
  /** Optional secondary CTA */
  secondaryCta?: { label: string; route: string };
}

const PREVIEW_BASE =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public';

export const LEARN_GUIDES: LearnGuide[] = [
  // ───────────────────────────────────────────── VISUAL STUDIO ─────────────────────────────────────────────
  {
    slug: 'product-images',
    section: 'visual-studio',
    title: 'Product Visuals',
    tagline: 'Pick a product, pick a scene, get studio-grade shots.',
    readMin: 2,
    tracks: ['start', 'visual-types'],
    level: 'foundational',
    whenToUse: 'When you want art-directed shots — alone or in batches — across many scenes.',
    vsAlternatives: [
      { label: 'Use it for', useThisWhen: 'Editorial shots with full control over scene, model, and framing.' },
      { label: 'Skip it if', useThisWhen: 'You only need plain white-bg ecom shots — use Catalog Studio.' },
    ],
    whatItDoes: 'A 4-step wizard: pick a product, pick scenes, set it up, generate. 2K shots that keep your real product intact.',
    bestFor: [
      'Refreshing catalog photos',
      'Hero shots for ads',
      'Editorial campaign frames',
    ],
    whatYouNeed: [
      'One sharp product photo',
      'Optional: a Brand Profile',
    ],
    whatYouGet: [
      '2K PNGs, web and print ready',
      '2–4 variations per scene',
      'Per-scene aspect ratios',
    ],
    quickStart: [
      { label: 'Product', detail: 'Add or pick a product. Wait for analysis.' },
      { label: 'Shots', detail: 'Browse 1600+ scenes. Start with 2–3.' },
      { label: 'Setup', detail: 'Pick models, colors, fine-tune the scene.' },
      { label: 'Generate', detail: 'Run a batch across products and scenes.' },
    ],
    tips: [
      { type: 'do', text: 'Use the highest-res source you have.' },
      { type: 'do', text: 'Lock a Brand Profile for multi-scene runs.' },
      { type: 'dont', text: 'Don’t upload screenshots or watermarked photos.' },
      { type: 'dont', text: 'Don’t mix unrelated SKUs in one run.' },
    ],
    cta: { label: 'Open Product Visuals', route: '/app/generate/product-images' },
    secondaryCta: { label: 'See examples in Explore', route: '/app/discover' },
  },
  {
    slug: 'virtual-try-on-set',
    section: 'visual-studio',
    title: 'Virtual Try-On Set',
    tagline: 'Put your clothing on diverse AI models.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    heroImage: `${PREVIEW_BASE}/workflow-previews/021146a4-47a4-4d13-8ce9-8d54e45cc8fc.png`,
    whenToUse: 'When the garment needs to be worn — fit, drape and pose matter.',
    vsAlternatives: [
      { label: 'Use it for', useThisWhen: 'Garments that need to be shown on a real-feeling body.' },
      { label: 'Skip it if', useThisWhen: 'You only need the garment styled in a scene, no body.' },
    ],
    whatItDoes: 'Dresses an AI model in your garment across poses and backgrounds — color, print and silhouette stay intact.',
    bestFor: [
      'Fashion PDPs on body',
      'Lookbooks with one model',
      'Size-inclusive marketing',
    ],
    whatYouNeed: [
      'A clean flat-lay or ghost-mannequin shot',
      'A model from your library',
    ],
    whatYouGet: [
      '4–6 shot set, same model identity',
      '2K editorial-quality output',
    ],
    quickStart: [
      { label: 'Upload your garment', detail: 'Drop a clean flat-lay — not one already worn.' },
      { label: 'Pick a model', detail: 'Match body type to your real customer.' },
      { label: 'Generate the set', detail: 'A full pose range comes back in one batch.' },
    ],
    tips: [
      { type: 'do', text: 'Use clean flat-lay or ghost-mannequin shots.' },
      { type: 'do', text: 'Test 2–3 body types — fit reads differently.' },
      { type: 'dont', text: 'Don’t upload garments already on a model.' },
      { type: 'dont', text: 'Don’t crop the garment edges.' },
    ],
    cta: { label: 'Open Virtual Try-On', route: '/app/generate/virtual-try-on-set' },
  },
  {
    slug: 'selfie-ugc-set',
    section: 'visual-studio',
    title: 'Selfie / UGC Set',
    tagline: 'Creator-style content that feels native to the feed.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    whenToUse: 'When studio shots are getting scrolled past in paid social.',
    whatItDoes: 'UGC-style imagery that mimics real creators — phone-camera lighting, casual framing, no studio polish.',
    bestFor: [
      'TikTok and Reels ads',
      'Meta paid social tests',
      'Influencer-style assets',
    ],
    whatYouNeed: [
      'Your product image',
      'A model that matches your customer',
    ],
    whatYouGet: [
      'Authentic UGC-style frames',
      'Casual compositions for paid ads',
    ],
    quickStart: [
      { label: 'Pick your product', detail: 'Any clean product image works.' },
      { label: 'Pick a model', detail: 'Pick by vibe, not by who looks "best".' },
      { label: 'Generate', detail: 'Make 4+ variants and ad-test the top two.' },
    ],
    tips: [
      { type: 'do', text: 'Pick a model that matches your real customer.' },
      { type: 'do', text: 'Test multiple models in parallel.' },
      { type: 'dont', text: 'Don’t over-style — UGC works because it isn’t polished.' },
    ],
    cta: { label: 'Open Selfie / UGC', route: '/app/generate/selfie-ugc-set' },
  },
  {
    slug: 'flat-lay-set',
    section: 'visual-studio',
    title: 'Flat Lay Set',
    tagline: 'Styled overhead shots with curated props.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    whenToUse: 'When the product needs to live alongside props and color.',
    whatItDoes: 'Top-down compositions where your product sits inside a curated arrangement of props, surfaces and palette.',
    bestFor: [
      'Instagram grid posts',
      'Lookbook spreads',
      'Press kit assets',
    ],
    whatYouNeed: [
      'A clean product photo',
      'Optional: a Brand Profile',
    ],
    whatYouGet: [
      'Multiple overhead compositions',
      'Surfaces and palette that match the style',
      '2K in multiple aspect ratios',
    ],
    quickStart: [
      { label: 'Pick your product', detail: 'From your library or upload new.' },
      { label: 'Choose a style', detail: 'Each style has its own props and palette.' },
      { label: 'Generate', detail: 'Make 4+ frames and pick what reads cleanest.' },
    ],
    tips: [
      { type: 'do', text: 'Pair with a Brand Profile to lock the palette.' },
      { type: 'do', text: 'Reuse one style across a sequence of posts.' },
      { type: 'dont', text: 'Don’t ask for "more props" — restraint reads editorial.' },
    ],
    cta: { label: 'Open Flat Lay', route: '/app/generate/flat-lay-set' },
  },
  {
    slug: 'mirror-selfie-set',
    section: 'visual-studio',
    title: 'Mirror Selfie Set',
    tagline: 'OOTD-style mirror shots in real-feeling rooms.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    heroImage: `${PREVIEW_BASE}/workflow-previews/7a203c7e-0367-4fc3-8eb2-2e4d181fa158_mirror_selfie_v2.png`,
    whenToUse: 'When you want phone-in-hand content that feels native to TikTok and Reels.',
    whatItDoes: 'Phone-in-hand mirror selfies across diverse rooms and mirror types — no studio in sight.',
    bestFor: [
      'TikTok and Reels for fashion',
      'OOTD-style organic content',
      'Lifestyle campaigns',
    ],
    whatYouNeed: [
      'Your product (worn or held)',
      'A model from your library',
    ],
    whatYouGet: [
      'Realistic mirror selfies, multiple rooms',
      'Native-looking phone framing',
    ],
    quickStart: [
      { label: 'Pick the product', detail: 'What gets worn or held in frame.' },
      { label: 'Pick a model', detail: 'Match styling to the room aesthetic.' },
      { label: 'Generate', detail: 'Make 4+ frames, pick the most natural one.' },
    ],
    tips: [
      { type: 'do', text: 'Pick a room style that matches your brand world.' },
      { type: 'dont', text: 'Don’t push for studio lighting — kills the format.' },
    ],
    cta: { label: 'Open Mirror Selfie', route: '/app/generate/mirror-selfie-set' },
  },
  {
    slug: 'interior-exterior-staging',
    section: 'visual-studio',
    title: 'Interior / Exterior Staging',
    tagline: 'Stage empty rooms or boost curb appeal.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    whenToUse: 'When you have an empty room or building and need to show its potential.',
    whatItDoes: 'Furnishes empty interiors or enhances exteriors — architecture, windows and proportions stay exactly as shot.',
    bestFor: [
      'Real estate listings',
      'Hospitality marketing',
      'Renovation previews',
    ],
    whatYouNeed: [
      'A clear photo of the empty space',
    ],
    whatYouGet: [
      'A fully staged version of the original',
      'Architecture preserved',
      'Multiple style options to compare',
    ],
    quickStart: [
      { label: 'Upload the photo', detail: 'Landscape, well-lit, as much space visible as possible.' },
      { label: 'Pick a style', detail: 'Each has its own furniture and palette.' },
      { label: 'Generate', detail: 'Compare variants, pick the best fit.' },
    ],
    tips: [
      { type: 'do', text: 'Shoot the source landscape and wide — more space, cleaner staging.' },
      { type: 'dont', text: 'Don’t use heavily edited or fish-eye photos.' },
    ],
    cta: { label: 'Open Staging', route: '/app/generate/interior-exterior-staging' },
  },
  {
    slug: 'picture-perspectives',
    section: 'visual-studio',
    title: 'Picture Perspectives',
    tagline: 'One photo → close-ups, back, side, wide angles.',
    readMin: 2,
    tracks: ['visual-types', 'advanced'],
    level: 'advanced',
    whenToUse: 'When one good hero exists and the PDP needs the rest of the angles.',
    whatItDoes: 'Generates a complete angle set from one hero photo — close-up, back, sides, top, wide. Identity stays consistent.',
    bestFor: [
      'Filling angle gaps on PDPs',
      'Marketplace listings (Amazon, Etsy)',
      'Catalog gap-filling',
    ],
    whatYouNeed: [
      'One sharp hero product photo',
    ],
    whatYouGet: [
      'Up to 9 angles from one source',
      'Consistent identity across all shots',
    ],
    quickStart: [
      { label: 'Upload your hero', detail: 'Use the cleanest photo you have.' },
      { label: 'Pick the angles', detail: 'Choose from 9 — back, side, top, close-up, wide.' },
      { label: 'Generate', detail: 'All angles come back in one batch.' },
    ],
    tips: [
      { type: 'do', text: 'Use the cleanest, sharpest hero you have.' },
      { type: 'dont', text: 'Don’t use shots with reflections — they’ll repeat.' },
    ],
    cta: { label: 'Open Perspectives', route: '/app/perspectives' },
  },
  {
    slug: 'image-upscaling',
    section: 'visual-studio',
    title: 'Image Upscaling',
    tagline: 'Sharpen any image to 2K or 4K.',
    readMin: 1,
    tracks: ['quality', 'advanced'],
    level: 'advanced',
    whenToUse: 'When existing assets look soft, compressed or pixelated.',
    whatItDoes: 'Sharpens detail, recovers textures, enhances faces. It enhances what’s there — it doesn’t invent new detail.',
    bestFor: [
      'Old catalog images',
      'Press / print exports',
      'Pushing generated images to 4K',
    ],
    whatYouNeed: [
      'Any image you want sharpened',
    ],
    whatYouGet: [
      '2K or 4K output',
      'Sharper textures, faces, edges',
    ],
    quickStart: [
      { label: 'Upload an image', detail: 'Any format works.' },
      { label: 'Pick resolution', detail: '2K for web, 4K for print.' },
      { label: 'Run upscale', detail: 'Output lands in seconds.' },
    ],
    tips: [
      { type: 'do', text: 'Works best on already-decent photos.' },
      { type: 'dont', text: 'Don’t expect miracles on tiny or heavily compressed sources.' },
    ],
    cta: { label: 'Open Image Upscaling', route: '/app/generate/image-upscaling' },
  },
  {
    slug: 'catalog-shot-set',
    section: 'visual-studio',
    title: 'Catalog Studio (Bulk)',
    tagline: 'Bulk-generate catalog visuals for many SKUs at once.',
    readMin: 2,
    tracks: ['start', 'advanced'],
    level: 'advanced',
    whenToUse: 'When many SKUs need the same look applied across all of them.',
    vsAlternatives: [
      { label: 'Use it for', useThisWhen: '10+ SKUs that need the same consistent look across the catalog.' },
      { label: 'Skip it if', useThisWhen: 'You want full per-product art direction — use Product Visuals.' },
    ],
    whatItDoes: 'A bulk pipeline: anchor + derivative shots for many products in one run, with consistent style.',
    bestFor: [
      'Stores with 10+ SKUs',
      'Seasonal drops',
      'Catalog refreshes after a redesign',
    ],
    whatYouNeed: [
      'Multiple products in your library',
      'A Brand Profile (recommended)',
    ],
    whatYouGet: [
      'Anchor + derivative shots per product',
      'Consistent style across SKUs',
      'Single-click bulk export',
    ],
    quickStart: [
      { label: 'Open Catalog Studio', detail: 'Tap "New Photoshoot".' },
      { label: 'Pick products + style', detail: 'Start with 5–10 to validate the style.' },
      { label: 'Run and review', detail: 'Output appears in your Library.' },
    ],
    tips: [
      { type: 'do', text: 'Lock a Brand Profile before kicking off.' },
      { type: 'do', text: 'Validate with 5–10 products first.' },
      { type: 'dont', text: 'Don’t mix categories (apparel + skincare) in one run.' },
    ],
    cta: { label: 'Open Catalog Studio', route: '/app/catalog' },
  },

  // ───────────────────────────────────────────── FREESTYLE ─────────────────────────────────────────────
  {
    slug: 'freestyle-basics',
    section: 'freestyle',
    title: 'Freestyle Studio Basics',
    tagline: 'Free-form prompts plus your image. Maximum control.',
    readMin: 2,
    tracks: ['start', 'quality'],
    level: 'core',
    whenToUse: 'When no template fits — exploratory or one-off creative ideas.',
    vsAlternatives: [
      { label: 'Use it for', useThisWhen: 'A blank canvas with full prompt control for a one-off idea.' },
      { label: 'Skip it if', useThisWhen: 'You want a guided wizard with curated scenes — use Product Visuals.' },
    ],
    whatItDoes: 'Open canvas: write a prompt, attach a product / model / scene reference, the AI builds the image.',
    bestFor: [
      'Exploratory creative directions',
      'Testing a look before committing',
      'Rapid iteration on one idea',
    ],
    whatYouNeed: [
      'A specific prompt',
      'Optional: product, model, or scene ref',
    ],
    whatYouGet: [
      'One image per generation',
      'Full prompt control + edit follow-ups',
    ],
    quickStart: [
      { label: 'Add your product', detail: 'Text-only prompts almost always underperform.' },
      { label: 'Pick a model and scene', detail: 'Even one reference tightens the output.' },
      { label: 'Write the prompt', detail: 'Subject → style → camera → light. Then generate.' },
    ],
    tips: [
      { type: 'do', text: 'Structure: subject → style → camera → light.' },
      { type: 'do', text: 'Always attach a product image.' },
      { type: 'dont', text: 'Don’t write paragraph-long prompts.' },
      { type: 'dont', text: 'Don’t use Freestyle for 50 cohesive SKUs — use Catalog Studio.' },
    ],
    cta: { label: 'Open Freestyle Studio', route: '/app/freestyle' },
    secondaryCta: { label: 'See examples in Explore', route: '/app/discover' },
  },
];

export const LEARN_SECTIONS: { id: LearnSection; label: string; description: string }[] = [
  {
    id: 'visual-studio',
    label: 'Visual Studio',
    description: 'Structured, scalable workflows for every product photography need.',
  },
  {
    id: 'freestyle',
    label: 'Freestyle Studio',
    description: 'Open-canvas mode for exploratory, prompt-driven creation.',
  },
];

export const LEARN_TRACKS: { id: LearnTrack; label: string; description: string }[] = [
  { id: 'start', label: 'Start here', description: 'First-run essentials — pick one and go.' },
  { id: 'visual-types', label: 'Visual Types', description: 'Reference for every workflow.' },
  { id: 'quality', label: 'Improve quality', description: 'Prompting, refs, brand profiles.' },
  { id: 'advanced', label: 'Advanced & bulk', description: 'Power flows for scale.' },
];

export const LEARN_COMING_SOON: { label: string; reason: string }[] = [
  { label: 'Video', reason: 'Short Film & product motion — coming soon' },
  { label: 'Brand Models', reason: 'Train custom AI models — coming soon' },
  { label: 'Brand Profiles', reason: 'Lock palette, tone, and look — coming soon' },
];

export function getGuide(section: LearnSection, slug: string): LearnGuide | undefined {
  return LEARN_GUIDES.find((g) => g.section === section && g.slug === slug);
}

export function getGuidesBySection(section: LearnSection): LearnGuide[] {
  return LEARN_GUIDES.filter((g) => g.section === section);
}

export function getGuidesByTrack(track: LearnTrack): LearnGuide[] {
  return LEARN_GUIDES.filter((g) => g.tracks.includes(track));
}

/** Returns the first unread guide in a preferred-track order. */
export function getRecommendedGuide(isRead: (section: string, slug: string) => boolean): LearnGuide {
  const trackOrder: LearnTrack[] = ['start', 'visual-types', 'quality', 'advanced'];
  for (const t of trackOrder) {
    const found = getGuidesByTrack(t).find((g) => !isRead(g.section, g.slug));
    if (found) return found;
  }
  return LEARN_GUIDES[0];
}

export function levelLabel(level: LearnLevel): string {
  if (level === 'foundational') return 'Foundational';
  if (level === 'core') return 'Core';
  return 'Advanced';
}
