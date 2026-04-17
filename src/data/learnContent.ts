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
    tagline: 'Brand-ready product shots across 1000+ scenes — fully art-directed.',
    readMin: 2,
    tracks: ['start', 'visual-types'],
    level: 'foundational',
    whenToUse:
      'Reach for Product Visuals when you need a small, art-directed set of premium shots for one product — a PDP refresh, a paid ad, a campaign hero.',
    vsAlternatives: [
      {
        label: 'Use Product Visuals when',
        useThisWhen: 'You want full creative control over scene, model, and framing for one product at a time.',
      },
      {
        label: 'Use Catalog Studio instead when',
        useThisWhen: 'You need the same look applied to 10+ SKUs in one go.',
      },
    ],
    whatItDoes:
      'A 6-step wizard that takes one of your products, lets you pick a scene from 1000+ curated environments, optionally a model and brand profile, then generates premium 2K product photography that keeps your real product intact.',
    bestFor: [
      'Refreshing low-res Shopify or Amazon catalog photos before a launch',
      'Single-product hero images for paid Meta and TikTok ads',
      'Editorial campaign assets without booking a studio',
      'Filling gaps when only one packshot exists',
    ],
    whatYouNeed: [
      'A clean front-facing product photo at 1024px or larger — no harsh shadows, no lifestyle background, no watermarks',
      'Optional: a Brand Profile so palette, mood and styling stay locked across runs',
      'Optional: extra angles (back / side / inside / packaging) — uploaded once and reused automatically',
    ],
    whatYouGet: [
      '2K PNG output, lossless, ready for web or print',
      '2–4 variations per generation so you can pick the strongest frame',
      'Aspect ratio per scene (square, portrait, landscape) — not a fixed format',
      "Note: this is not a bulk catalog flow — for that, use Catalog Studio",
    ],
    quickStart: [
      {
        label: 'Add or pick a product',
        detail: 'Step 1: tap "Add Product" and drop your front-on photo. Wait for "Analysis complete" — that means VOVV has read the materials, color and category.',
      },
      {
        label: 'Pick scenes',
        detail: 'Step 2: browse by category. Start with 2–3 scenes max so you can compare cleanly. Filters at the top narrow by aesthetic.',
      },
      {
        label: 'Refine setup',
        detail: 'Step 3: optionally lock a model and brand profile. If you skip both, VOVV picks neutral defaults.',
      },
      {
        label: 'Review and generate',
        detail: 'Step 5: confirm credits, hit Generate. First image typically lands in 25–40s.',
      },
    ],
    tips: [
      { type: 'do', text: 'Use the highest-resolution source you have — VOVV preserves detail it can see, but cannot invent texture from a 400px crop.' },
      { type: 'do', text: 'Lock a Brand Profile in Step 3 before a multi-scene run — switching mid-batch breaks visual consistency.' },
      { type: 'do', text: 'Upload back / side / inside refs once on the product — every future scene reuses them automatically.' },
      { type: 'dont', text: 'Do not upload screenshots, mockups, or photos with watermarks — VOVV will treat them as part of the product.' },
      { type: 'dont', text: 'Do not mix unrelated SKUs in a single generation — split them into separate runs for cleaner output.' },
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
    whenToUse:
      'Reach for Try-On when you have a flat-lay or ghost-mannequin garment and need it shown on a real-feeling model — not just floating in a scene.',
    vsAlternatives: [
      {
        label: 'Use Try-On when',
        useThisWhen: 'The garment must be worn — fit, drape, and pose matter to the sale.',
      },
      {
        label: 'Use Product Visuals instead when',
        useThisWhen: 'You only need the garment styled in a scene, no body required.',
      },
    ],
    whatItDoes:
      'Dresses any AI model with your garment and produces realistic try-on imagery across multiple poses, framings, and backgrounds — keeping the garment’s color, print and silhouette intact.',
    bestFor: [
      'Fashion PDPs that need front / back / detail shots on body',
      'Lookbooks with consistent model identity across an entire collection',
      'Size-inclusive marketing without hiring multiple models',
      'Lifestyle shots when you only have a flat-lay product photo',
    ],
    whatYouNeed: [
      'A flat-lay or ghost-mannequin garment shot — clean, full silhouette visible, no body in frame',
      'A model: pick one from Brand Models or use a built-in',
      'Optional: scene preference (clean studio vs. lifestyle backdrop)',
    ],
    whatYouGet: [
      'A 4–6 shot set with consistent model identity across poses',
      '2K editorial-quality output, lossless',
      "Note: garments already worn in the source photo will not retransfer cleanly — start from flat-lay",
    ],
    quickStart: [
      {
        label: 'Upload your garment',
        detail: 'Step 1: drop a clean flat-lay. Avoid garments already on a model — Try-On expects a free-standing piece.',
      },
      {
        label: 'Pick a model',
        detail: 'Step 2: choose from your Brand Models or the built-in library. Match body type to your real customer.',
      },
      {
        label: 'Generate the set',
        detail: 'Step 4: pick how many shots. A full pose range comes back in one batch — review and save the strongest.',
      },
    ],
    tips: [
      { type: 'do', text: 'Use clean ghost-mannequin or flat-lay shots with the full garment in frame.' },
      { type: 'do', text: 'Test 2–3 different model body types in parallel — fit reads differently on different bodies and conversion follows.' },
      { type: 'dont', text: 'Do not upload garments already worn by another model — VOVV cannot reliably re-dress them.' },
      { type: 'dont', text: 'Do not crop the garment edges — the silhouette is the strongest signal for fit.' },
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
    whenToUse:
      'Use Selfie / UGC when polished studio shots underperform — paid social rewards content that feels real, not produced.',
    whatItDoes:
      'Generates UGC-style imagery that mimics top creators — natural phone-camera lighting, casual framing, authentic feel. Built specifically for paid social where studio shots get scrolled past.',
    bestFor: [
      'TikTok and Reels ad creative that needs to feel native to the feed',
      'Meta paid social where studio shots are underperforming',
      'Influencer-style assets without paying influencers',
      'A/B testing creator faces against your existing studio set',
    ],
    whatYouNeed: [
      'Your product image (any clean angle works)',
      'A model whose vibe matches your target customer — not your aesthetic ideal',
    ],
    whatYouGet: [
      'A set of authentic UGC-style frames with natural lighting',
      'Casual compositions ready for paid placements',
      "Note: don't expect studio polish — the format works *because* it isn't polished",
    ],
    quickStart: [
      { label: 'Pick your product', detail: 'Step 1: any product from your library. The flow expects a clean image, not a styled one.' },
      { label: 'Pick a model that matches your audience', detail: 'Step 2: pick by vibe and demographic, not by who looks "best".' },
      { label: 'Generate UGC variants', detail: 'Step 4: generate 4+ variants and ad-test the top two — UGC performance is highly model-dependent.' },
    ],
    tips: [
      { type: 'do', text: 'Pick a model whose face and styling match your real customer — relatability beats aesthetic perfection in paid social.' },
      { type: 'do', text: 'Test multiple models in parallel — different faces convert very differently for the same product.' },
      { type: 'dont', text: 'Do not over-style the prompt — UGC works because it feels unproduced.' },
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
    whenToUse:
      'Use Flat Lay when the product needs to live alongside props and color — Instagram grids, press kits, editorial spreads.',
    whatItDoes:
      'Creates top-down compositions where your product sits inside a curated arrangement of props, surfaces, and color palette — instead of standing alone.',
    bestFor: [
      'Instagram grid posts that need to sit cohesively next to each other',
      'Editorial layouts and lookbook spreads',
      'Press kit assets where the product needs context',
      'Seasonal campaign moodboards',
    ],
    whatYouNeed: [
      'A clean product photo — top-down or front-facing both work',
      'Optional: a Brand Profile to lock the palette and prop tone',
    ],
    whatYouGet: [
      'Multiple overhead compositions with curated prop pairings',
      'Surface textures and color palette that match the chosen style',
      '2K output in multiple aspect ratios',
    ],
    quickStart: [
      { label: 'Pick your product', detail: 'Step 1: pick from your library or upload a new product.' },
      { label: 'Choose a flat-lay style', detail: 'Step 2: each style has a distinct prop family and palette — pick one that fits your grid.' },
      { label: 'Generate the set', detail: 'Step 4: generate 4+ frames and pick the composition that reads cleanest in a grid.' },
    ],
    tips: [
      { type: 'do', text: 'Pair with a Brand Profile to lock the palette across multiple flat-lay runs — otherwise each batch can drift.' },
      { type: 'do', text: 'Pick the same style across a sequence of posts to build visual continuity in the grid.' },
      { type: 'dont', text: 'Do not request "more props" in the prompt — restraint is what makes the format read editorial.' },
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
    whenToUse:
      'Use Mirror Selfie when you want OOTD-style content that feels native to TikTok and Reels — phone-in-hand, real bedroom, no studio.',
    whatItDoes:
      'Produces phone-in-hand mirror selfie content across diverse rooms and mirror types — the exact format that feels native on TikTok and IG, not produced.',
    bestFor: [
      'TikTok and Reels creative for fashion and accessories',
      'OOTD-style organic content for IG',
      'Lifestyle campaigns where the room matters as much as the product',
    ],
    whatYouNeed: [
      'Your product (worn or held — both work)',
      'A model from Brand Models or the built-in library',
    ],
    whatYouGet: [
      'Realistic mirror selfie compositions across multiple room types',
      'Native-looking smartphone framing with authentic crop and angle',
    ],
    quickStart: [
      { label: 'Pick the product', detail: 'Step 1: choose what gets worn or held in frame.' },
      { label: 'Pick a model', detail: 'Step 2: pick a model whose styling fits the room aesthetic.' },
      { label: 'Generate', detail: 'Step 4: generate 4+ frames — pick the one with the most natural phone framing.' },
    ],
    tips: [
      { type: 'do', text: 'Choose a room style that matches your brand world — rooms read as strongly as styling in this format.' },
      { type: 'dont', text: 'Do not push for studio lighting — the format only works because it looks like a real bedroom.' },
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
    whenToUse:
      'Use Staging when you have a clean photo of an empty room or building exterior and need to show its potential — without altering the architecture.',
    whatItDoes:
      'Transforms empty interiors into professionally staged spaces, or enhances exteriors with curb appeal — preserving the underlying architecture, windows, and proportions exactly.',
    bestFor: [
      'Real estate listings before a launch',
      'Hospitality marketing for new properties',
      'Renovation previews for clients',
    ],
    whatYouNeed: [
      'A clear photo of the empty room or building exterior — landscape orientation, as much of the space visible as possible',
    ],
    whatYouGet: [
      'A fully staged or enhanced version of the original',
      'Architecture, windows, and proportions preserved',
      'Multiple style options to compare',
    ],
    quickStart: [
      { label: 'Upload room or exterior photo', detail: 'Step 1: shoot in landscape, well-lit, with as much of the space visible as possible.' },
      { label: 'Pick a staging style', detail: 'Step 2: each style has a different furniture and palette family.' },
      { label: 'Generate', detail: 'Step 4: review variants and pick the one that best fits the listing tone.' },
    ],
    tips: [
      { type: 'do', text: 'Shoot the source in landscape with a wide angle — the more of the room visible, the cleaner the staging.' },
      { type: 'dont', text: 'Do not use heavily edited or fish-eye source photos — VOVV will preserve the distortion.' },
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
    whenToUse:
      'Use Perspectives when one good hero photo exists but the PDP needs the full angle gallery — back, side, top, close-up — without re-shooting.',
    whatItDoes:
      'Generates a complete visual set from a single hero photo — close-up, back, sides, top, and wide shots — keeping product identity consistent across all 9 angles.',
    bestFor: [
      'Filling angle gaps on existing PDPs',
      'Marketplace listings (Amazon, Etsy) that need a fixed angle set',
      'Catalog gap-filling when only one shot exists per SKU',
    ],
    whatYouNeed: [
      'One sharp hero product photo at 1024px+ — sets the look and material for every angle',
    ],
    whatYouGet: [
      'Up to 9 angle and detail variants from a single source',
      'Consistent product identity across all shots',
      "Note: angles VOVV cannot see directly (e.g. inside of a bag) are inferred — verify before publishing",
    ],
    quickStart: [
      { label: 'Upload your hero shot', detail: 'Step 1: use the cleanest, sharpest photo you have — it sets the tone for every other angle.' },
      { label: 'Pick the angles you want', detail: 'Step 2: select from 9 available — back, side, top, close-up, wide, etc.' },
      { label: 'Generate the full set', detail: 'Step 4: all selected angles come back in one batch.' },
    ],
    tips: [
      { type: 'do', text: 'Use the cleanest, sharpest hero you have — it dictates the quality of every angle that follows.' },
      { type: 'dont', text: 'Do not use reflective product shots with visible backgrounds — reflections will repeat across angles.' },
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
    whenToUse:
      'Use Upscaling on existing assets that look soft, compressed, or pixelated — not for repairing fundamentally broken or tiny source images.',
    whatItDoes:
      'AI-powered upscaling that sharpens detail, recovers textures, and enhances faces. It enhances what is there — it does not invent missing detail.',
    bestFor: [
      'Old catalog images you want to keep using',
      'Press-quality and print-ready exports',
      'Generated images you want to push to 4K before delivery',
    ],
    whatYouNeed: [
      'Any image you want sharpened — works best on already-decent source quality',
    ],
    whatYouGet: [
      '2K or 4K output',
      'Sharper textures, faces, and edges',
      "Note: upscaling enhances, it does not invent — start with the best source you have",
    ],
    quickStart: [
      { label: 'Upload an image', detail: 'Drop the source image — any format works.' },
      { label: 'Pick target resolution', detail: '2K is enough for web; pick 4K only if printing or zooming.' },
      { label: 'Run upscale', detail: 'Output lands in seconds.' },
    ],
    tips: [
      { type: 'do', text: 'Works best on already-decent photos — it enhances what it can see, it cannot invent texture.' },
      { type: 'dont', text: 'Do not expect miracles on heavily compressed or sub-500px images — start cleaner if you can.' },
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
    whenToUse:
      'Use Catalog Studio when you have many SKUs and need the same look applied across all of them — Product Visuals is the wrong tool at that scale.',
    vsAlternatives: [
      {
        label: 'Use Catalog Studio when',
        useThisWhen: 'You have 10+ SKUs and want the same look applied to all — bulk consistency over per-shot control.',
      },
      {
        label: 'Use Product Visuals instead when',
        useThisWhen: 'You need full per-product art direction on one or two SKUs.',
      },
    ],
    whatItDoes:
      'A bulk pipeline that generates a complete catalog-ready set for many products at once — anchor + derivative shots, consistent style across every SKU.',
    bestFor: [
      'Stores with 10+ SKUs that need a consistent shoot',
      'Seasonal drops where everything needs to launch on the same day',
      'Catalog refreshes after a brand redesign',
    ],
    whatYouNeed: [
      'Multiple products already in your library (each with a clean main image)',
      'A Brand Profile — strongly recommended for cohesive output across SKUs',
    ],
    whatYouGet: [
      'A full catalog set per product — anchor shot + derivatives',
      'Consistent style across every SKU in the run',
      'Single-click bulk export when complete',
    ],
    quickStart: [
      { label: 'Open Catalog Studio', detail: 'Tap "New Photoshoot" in the top right.' },
      { label: 'Pick products and a style preset', detail: 'Start with 5–10 products to validate the style before scaling.' },
      { label: 'Run and review', detail: 'Output appears in your Library when the batch completes — typically a few minutes.' },
    ],
    tips: [
      { type: 'do', text: 'Lock a Brand Profile before kicking off — it is the only way to keep look consistent across all SKUs.' },
      { type: 'do', text: 'Start with 5–10 products to validate the style preset before running the full catalog.' },
      { type: 'dont', text: 'Do not mix product categories (e.g. apparel + skincare) in one run — split them into separate batches.' },
    ],
    cta: { label: 'Open Catalog Studio', route: '/app/catalog' },
  },

  // ───────────────────────────────────────────── FREESTYLE ─────────────────────────────────────────────
  {
    slug: 'freestyle-basics',
    section: 'freestyle',
    title: 'Freestyle Studio Basics',
    tagline: 'Free-form prompts plus your image. Maximum creative control.',
    readMin: 3,
    tracks: ['start', 'quality'],
    level: 'core',
    whenToUse:
      'Use Freestyle when no template fits — exploratory shots, custom directions, or quick iteration on a single creative idea.',
    vsAlternatives: [
      {
        label: 'Use Freestyle when',
        useThisWhen: 'You want full prompt control and are exploring a one-off creative idea.',
      },
      {
        label: 'Use Product Visuals instead when',
        useThisWhen: 'You want a curated scene library and a guided wizard, not a blank canvas.',
      },
    ],
    whatItDoes:
      'The open-canvas mode: write a prompt, optionally attach a product, model and scene reference, and the AI builds the image. Best when you want full control or want to explore something the structured workflows cannot do.',
    bestFor: [
      'Exploratory and one-off creative directions',
      'Testing a new look before committing to a template',
      'Custom requests outside the structured workflows',
      'Rapid iteration on a single idea via re-generate or edit-image',
    ],
    whatYouNeed: [
      'A specific prompt — vague prompts return vague results',
      'Optional but strongly recommended: a product image, a model, and a scene reference',
    ],
    whatYouGet: [
      'One image per generation',
      'Full prompt control + edit-image follow-ups',
      "Note: not the right tool for 50 cohesive SKUs — use Catalog Studio for that",
    ],
    quickStart: [
      {
        label: 'Add your product',
        detail: 'Upload or pick from your library. Text-only prompts (no product attached) almost always underperform.',
      },
      {
        label: 'Pick a model and scene',
        detail: 'Optional but strongly improves consistency. Even one reference dramatically tightens the output.',
      },
      {
        label: 'Write the prompt and generate',
        detail: 'Structure: subject → style → camera → light. Example: "Black leather bag, editorial, 35mm, soft north light".',
      },
    ],
    tips: [
      { type: 'do', text: 'Structure prompts as: subject → style → camera → light. ("Black leather bag, editorial, 35mm, soft north light")' },
      { type: 'do', text: 'Always attach a product image — text-only output is consistently weaker.' },
      { type: 'do', text: 'Iterate via re-generate or edit-image instead of starting fresh — VOVV preserves your inputs between runs.' },
      { type: 'dont', text: 'Do not write paragraph-long prompts — concise, layered prompts beat walls of text.' },
      { type: 'dont', text: 'Do not use Freestyle when you need 50 cohesive SKUs — switch to Catalog Studio.' },
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
