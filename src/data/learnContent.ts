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
    tagline: 'Brand-ready product shots across 1000+ scenes — fully art-directed.',
    readMin: 2,
    tracks: ['start', 'visual-types'],
    level: 'foundational',
    whatItDoes:
      'Generates premium, on-brand product photography in any scene you can imagine — studio, editorial, lifestyle — using your real product as the reference.',
    bestFor: ['PDP hero images', 'Paid social ads', 'Editorial campaigns', 'Brand refreshes'],
    whatYouNeed: [
      'One sharp product photo (clean background preferred)',
      'Optional: a Brand Profile for cohesive look across runs',
      'Optional: a model from Brand Models for on-body shots',
    ],
    whatYouGet: [
      '2K resolution PNG output',
      'Choice of aspect ratio per scene',
      'Multiple variations per generation',
    ],
    quickStart: [
      { label: 'Pick a product', detail: 'From your Products library or upload a new one.' },
      { label: 'Choose a scene', detail: 'Browse 1000+ curated scenes by category.' },
      { label: 'Generate', detail: 'Review variants, then save to Library.' },
    ],
    tips: [
      { type: 'do', text: 'Use the highest-resolution source image you have.' },
      { type: 'do', text: 'Pair with a Brand Profile so every run feels cohesive.' },
      { type: 'do', text: 'Add side / back / packaging refs for richer composition.' },
      { type: 'dont', text: 'Don’t upload screenshots, watermarked images, or low-res pics.' },
      { type: 'dont', text: 'Don’t mix unrelated products in a single generation.' },
    ],
    cta: { label: 'Open Product Visuals', route: '/app/generate/product-images' },
    secondaryCta: { label: 'See examples in Explore', route: '/app/discover' },
  },
  {
    slug: 'virtual-try-on-set',
    section: 'visual-studio',
    title: 'Virtual Try-On Set',
    tagline: 'Put your clothing on diverse AI models in any pose or setting.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    heroImage: `${PREVIEW_BASE}/workflow-previews/021146a4-47a4-4d13-8ce9-8d54e45cc8fc.png`,
    whatItDoes:
      'Dresses any AI model with your garment and produces realistic try-on imagery across multiple poses, framings, and backgrounds.',
    bestFor: ['Fashion PDPs', 'Lookbooks', 'Lifestyle campaigns', 'Size-inclusive marketing'],
    whatYouNeed: [
      'A flat-lay or ghost-mannequin garment image',
      'A model from Brand Models (or pick a built-in)',
      'Optional: scene preference (studio vs. lifestyle)',
    ],
    whatYouGet: [
      'Try-on shots in multiple poses',
      'Consistent model identity across the full set',
      '2K editorial-quality output',
    ],
    quickStart: [
      { label: 'Upload your garment', detail: 'Flat-lay works best — clean fabric details.' },
      { label: 'Pick a model', detail: 'Choose from Brand Models or built-in library.' },
      { label: 'Generate the set', detail: 'Get a full pose range in one run.' },
    ],
    tips: [
      { type: 'do', text: 'Use clean flat-lay shots with the full garment visible.' },
      { type: 'do', text: 'Match the model body type to your target customer.' },
      { type: 'dont', text: 'Don’t upload garments already worn by another model.' },
      { type: 'dont', text: 'Don’t crop the garment — full silhouette gives best fit.' },
    ],
    cta: { label: 'Open Virtual Try-On', route: '/app/generate/virtual-try-on-set' },
  },
  {
    slug: 'selfie-ugc-set',
    section: 'visual-studio',
    title: 'Selfie / UGC Set',
    tagline: 'Authentic creator-style content pairing your product with a real-feeling model.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    whatItDoes:
      'Generates UGC-style imagery that mimics top creators — natural lighting, casual framing, authentic feel. Perfect for paid social.',
    bestFor: ['TikTok ads', 'Meta paid social', 'Influencer-style assets', 'Native feed content'],
    whatYouNeed: ['Your product image', 'A model (built-in or Brand Models)'],
    whatYouGet: [
      'Multiple authentic UGC-style shots',
      'Natural lighting and casual compositions',
      '2K output ready for paid placements',
    ],
    quickStart: [
      { label: 'Pick your product' },
      { label: 'Pick a model that matches your audience' },
      { label: 'Generate UGC variants' },
    ],
    tips: [
      { type: 'do', text: 'Pick a model whose vibe matches your customer.' },
      { type: 'do', text: 'Test multiple models — different faces convert differently.' },
      { type: 'dont', text: 'Don’t over-style — UGC works because it feels real.' },
    ],
    cta: { label: 'Open Selfie / UGC', route: '/app/generate/selfie-ugc-set' },
  },
  {
    slug: 'flat-lay-set',
    section: 'visual-studio',
    title: 'Flat Lay Set',
    tagline: 'Styled overhead arrangements with curated props — built for Instagram and editorial.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    whatItDoes:
      'Creates top-down product compositions with thoughtfully chosen props, surfaces, and color palettes.',
    bestFor: ['Instagram grid', 'Editorial layouts', 'Lookbook spreads', 'Press kit assets'],
    whatYouNeed: ['One product image (top-down or front-facing both work)'],
    whatYouGet: [
      'Multiple overhead compositions',
      'Curated prop pairings and surface textures',
      '2K output, multiple aspect ratios',
    ],
    quickStart: [
      { label: 'Pick your product' },
      { label: 'Choose a flat-lay style' },
      { label: 'Generate the set' },
    ],
    tips: [
      { type: 'do', text: 'Pair with a Brand Profile to lock palette and mood.' },
      { type: 'dont', text: 'Don’t overload — a few thoughtful props beat many.' },
    ],
    cta: { label: 'Open Flat Lay', route: '/app/generate/flat-lay-set' },
  },
  {
    slug: 'mirror-selfie-set',
    section: 'visual-studio',
    title: 'Mirror Selfie Set',
    tagline: 'Authentic mirror selfies of your product, worn or held in real-feeling rooms.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    heroImage: `${PREVIEW_BASE}/workflow-previews/7a203c7e-0367-4fc3-8eb2-2e4d181fa158_mirror_selfie_v2.png`,
    whatItDoes:
      'Produces phone-in-hand mirror selfie content across diverse rooms and mirror types — feels native to TikTok and IG.',
    bestFor: ['TikTok / Reels', 'Lifestyle campaigns', 'Outfit-of-the-day style content'],
    whatYouNeed: ['Your product (worn or held)', 'A model'],
    whatYouGet: [
      'Realistic mirror selfie compositions',
      'Variety of room and mirror styles',
      'Native-looking smartphone framing',
    ],
    quickStart: [{ label: 'Pick product' }, { label: 'Pick model' }, { label: 'Generate' }],
    tips: [
      { type: 'do', text: 'Choose a room style that matches your brand world.' },
      { type: 'dont', text: 'Don’t expect studio lighting — that defeats the format.' },
    ],
    cta: { label: 'Open Mirror Selfie', route: '/app/generate/mirror-selfie-set' },
  },
  {
    slug: 'interior-exterior-staging',
    section: 'visual-studio',
    title: 'Interior / Exterior Staging',
    tagline: 'Stage empty rooms or boost curb appeal — original architecture stays intact.',
    readMin: 2,
    tracks: ['visual-types'],
    level: 'core',
    whatItDoes:
      'Transforms empty interiors into professionally staged spaces, or enhances exteriors with curb appeal — without altering the underlying architecture.',
    bestFor: ['Real estate listings', 'Hospitality marketing', 'Renovation previews'],
    whatYouNeed: ['A clear photo of the empty room or building exterior'],
    whatYouGet: [
      'Fully staged or enhanced version',
      'Architecture and proportions preserved',
      'Multiple style options',
    ],
    quickStart: [
      { label: 'Upload room or exterior photo' },
      { label: 'Pick a staging style' },
      { label: 'Generate' },
    ],
    tips: [
      { type: 'do', text: 'Shoot in landscape with as much room visible as possible.' },
      { type: 'dont', text: 'Don’t use heavily edited or fish-eye source photos.' },
    ],
    cta: { label: 'Open Staging', route: '/app/generate/interior-exterior-staging' },
  },
  {
    slug: 'picture-perspectives',
    section: 'visual-studio',
    title: 'Picture Perspectives',
    tagline: 'Turn one product photo into close-ups, back, side, and wide-angle shots.',
    readMin: 2,
    tracks: ['visual-types', 'advanced'],
    level: 'advanced',
    whatItDoes:
      'Generates a complete visual set from a single hero photo — close-up, back, sides, top, and wide shots — for full PDP coverage.',
    bestFor: ['PDP completeness', 'Marketplace listings', 'Catalog gap-filling'],
    whatYouNeed: ['One sharp hero product photo'],
    whatYouGet: ['Up to 9 angle and detail variants', 'Consistent product identity across all shots'],
    quickStart: [
      { label: 'Upload your hero shot' },
      { label: 'Pick the angles you want' },
      { label: 'Generate the full set' },
    ],
    tips: [
      { type: 'do', text: 'Use the cleanest, sharpest hero you have — it sets the tone.' },
      { type: 'dont', text: 'Don’t use reflective product shots with visible backgrounds.' },
    ],
    cta: { label: 'Open Perspectives', route: '/app/perspectives' },
  },
  {
    slug: 'image-upscaling',
    section: 'visual-studio',
    title: 'Image Upscaling',
    tagline: 'Sharpen any image to 2K or 4K — recovers textures, faces, and fine detail.',
    readMin: 1,
    tracks: ['quality', 'advanced'],
    level: 'advanced',
    whatItDoes:
      'AI-powered upscaling that sharpens detail, recovers textures, and enhances faces — perfect for upgrading legacy assets.',
    bestFor: ['Old catalog images', 'Press-quality exports', 'Print-ready assets'],
    whatYouNeed: ['Any image you want sharpened'],
    whatYouGet: ['2K or 4K output', 'Sharper textures, faces, and edges'],
    quickStart: [
      { label: 'Upload an image' },
      { label: 'Pick target resolution' },
      { label: 'Run upscale' },
    ],
    tips: [
      { type: 'do', text: 'Works best on already-decent photos — it enhances, not invents.' },
      { type: 'dont', text: 'Don’t expect miracles on heavily compressed or tiny images.' },
    ],
    cta: { label: 'Open Image Upscaling', route: '/app/generate/image-upscaling' },
  },
  {
    slug: 'catalog-shot-set',
    section: 'visual-studio',
    title: 'Catalog Studio (Bulk)',
    tagline: 'Bulk-generate catalog-ready visuals for any product, in one run.',
    readMin: 2,
    tracks: ['start', 'advanced'],
    level: 'advanced',
    whatItDoes:
      'A bulk-photoshoot pipeline that generates a complete catalog-ready set for many products at once — anchor + derivative shots, consistent across SKUs.',
    bestFor: ['Stores with many SKUs', 'Seasonal drops', 'Catalog refreshes'],
    whatYouNeed: ['Multiple products in your library', 'Optional: Brand Profile for cohesion'],
    whatYouGet: ['A full catalog set per product', 'Consistent style across all SKUs', 'Single-click bulk export'],
    quickStart: [
      { label: 'Open Catalog Studio', detail: 'New Photoshoot button in the top right.' },
      { label: 'Pick products and a style preset' },
      { label: 'Run — review when complete' },
    ],
    tips: [
      { type: 'do', text: 'Lock a Brand Profile first so all SKUs share a look.' },
      { type: 'do', text: 'Start with 5–10 products to validate the style.' },
      { type: 'dont', text: 'Don’t mix product categories in one run — split them.' },
    ],
    cta: { label: 'Open Catalog Studio', route: '/app/catalog' },
  },

  // ───────────────────────────────────────────── FREESTYLE ─────────────────────────────────────────────
  {
    slug: 'freestyle-basics',
    section: 'freestyle',
    title: 'Freestyle Studio Basics',
    tagline: 'Free-form prompts + your image. Maximum creative control.',
    readMin: 3,
    tracks: ['start', 'quality'],
    level: 'core',
    whatItDoes:
      'Freestyle is the open-canvas mode: you write a prompt, optionally attach a product, model, and scene, and the AI builds the image. Use it when you want full control or want to explore something Catalog Studio can’t do.',
    bestFor: [
      'Exploratory / one-off shots',
      'Testing creative directions',
      'Custom requests outside the templates',
      'Rapid iteration on a single idea',
    ],
    whatYouNeed: [
      'A prompt (the more specific, the better)',
      'Optional: a product image, model, scene reference',
    ],
    whatYouGet: ['One image per generation', 'Full prompt control', 'Edit-image follow-ups available'],
    quickStart: [
      { label: 'Add your product', detail: 'Upload or pick from your library.' },
      { label: 'Pick a model and scene', detail: 'Optional but improves consistency a lot.' },
      { label: 'Write the prompt + Generate', detail: 'Be specific about subject, style, camera, light.' },
    ],
    tips: [
      { type: 'do', text: 'Structure prompts: subject → style → camera → light. ("Black leather bag, editorial, 35mm, soft north light")' },
      { type: 'do', text: 'Attach a product image — text-only is always weaker.' },
      { type: 'do', text: 'Iterate: regenerate or edit the image instead of starting fresh.' },
      { type: 'dont', text: 'Don’t write essays — concise, layered prompts beat walls of text.' },
      { type: 'dont', text: 'Don’t use Freestyle when you need 50 cohesive SKUs — use Catalog Studio.' },
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
