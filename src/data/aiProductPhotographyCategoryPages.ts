/**
 * Single source of truth for the 10 SEO category hub pages under
 * /ai-product-photography/{slug}. The dynamic page template
 * (src/pages/seo/AIProductPhotographyCategory.tsx) renders every page from
 * this data — do not hand-roll per-category pages.
 *
 * All `imageId` values come from the live `product_image_scenes` catalog
 * (the same data backing /product-visual-library), so previews are exactly
 * on-topic for each page.
 */

export type IconKey =
  | 'shopping-bag'
  | 'sparkles'
  | 'instagram'
  | 'megaphone'
  | 'camera'
  | 'zoom-in'
  | 'layout-template'
  | 'rocket'
  | 'mail'
  | 'calendar'
  | 'layout-grid'
  | 'image';

export interface VisualOutput {
  title: string;
  text: string;
  icon: IconKey;
}

export interface UseCase {
  title: string;
  text: string;
  icon: IconKey;
}

/**
 * A scene example pulled from the live scene library.
 * `collectionLabel` + `subCategory` are used by the
 * "Built for every category" chip selector to render labels like:
 *   "Clothing & Apparel · Creative Shots".
 */
export interface SceneExample {
  label: string;
  category: string;
  imageId: string;
  alt: string;
  collectionLabel: string;
  subCategory: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface CategoryPage {
  slug: string;
  url: string;
  groupName: string;
  seoTitle: string;
  metaDescription: string;
  h1Lead: string;
  h1Highlight: string;
  heroEyebrow: string;
  heroSubheadline: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[];
  subcategories: string[];
  painPoints: string[];
  visualOutputs: VisualOutput[];
  sceneExamples: SceneExample[];
  useCases: UseCase[];
  faqs: FAQ[];
  relatedCategories: string[];
  heroImageId: string;
  heroAlt: string;
  /** Singular noun for the "One {noun} · Every shot" eyebrow on the BuiltFor section. */
  heroNoun?: string;
  /** Optional 4-image collage for multi-subcategory hero pages. */
  heroCollage?: { subCategory: string; imageId: string; alt: string }[];
}

export const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const BASE = '/ai-product-photography';

export const aiProductPhotographyCategoryPages: CategoryPage[] = [
  // ─────────────────────────────────────── 1. FASHION
  {
    slug: 'fashion',
    url: `${BASE}/fashion`,
    groupName: 'Fashion',
    seoTitle: 'AI Fashion Product Photography for Clothing Brands | VOVV.AI',
    metaDescription:
      'Create AI fashion product photography for clothing brands. Upload one apparel photo and generate product page images, flatlays, on-model style visuals, lifestyle scenes, ads, and campaign content.',
    h1Lead: 'AI Fashion Product Photography',
    h1Highlight: 'for Clothing Brands',
    heroEyebrow: 'Fashion · Apparel',
    heroSubheadline:
      'Turn one clothing product photo into product page images, flatlays, lifestyle visuals, on-model style shots, and fashion campaign content.',
    primaryKeyword: 'AI fashion product photography',
    secondaryKeywords: [
      'AI fashion photography',
      'clothing product photography',
      'apparel product photography',
      'on-model product photography',
      'fashion ecommerce photography',
    ],
    longTailKeywords: [
      'AI product photography for clothing brands',
      'AI fashion product photos for Shopify',
      'turn clothing photos into lifestyle images',
      'AI on-model images for apparel',
    ],
    subcategories: [
      'Clothing & Apparel', 'Dresses', 'Hoodies', 'Jeans', 'Jackets',
      'Activewear', 'Swimwear', 'Lingerie',
    ],
    painPoints: [
      'Fashion brands need many visuals per product — product page, ads, social, lookbook, and campaign.',
      'Clothing has to feel real: fabric texture, color, logo, print, silhouette, and fit must hold up under zoom.',
      'Traditional fashion shoots are expensive — models, locations, stylists, lighting, and retouching add up fast.',
      'Brands need a faster way to test multiple visual directions for every launch and ad concept.',
    ],
    visualOutputs: [
      { title: 'Clean product page images',  text: 'Hero shots ready for Shopify, Amazon, and PDPs.',              icon: 'shopping-bag' },
      { title: 'Flatlays',                    text: 'Crisp top-down apparel layouts with brand styling.',          icon: 'layout-grid' },
      { title: 'Lifestyle fashion visuals',   text: 'Editorial scenes that show clothing in real moments.',        icon: 'sparkles' },
      { title: 'On-model style shots',        text: 'Garments shown on model-style figures in your aesthetic.',    icon: 'image' },
      { title: 'Editorial campaign images',   text: 'Story-driven campaign visuals for lookbooks and PR.',         icon: 'camera' },
      { title: 'Social ad creatives',         text: 'High-CTR variants for Meta, TikTok, and Pinterest.',          icon: 'instagram' },
      { title: 'Lookbook visuals',            text: 'Cohesive seasonal lookbook spreads for new drops.',           icon: 'layout-template' },
      { title: 'Website banners',             text: 'Hero banners and collection covers built around your brand.', icon: 'rocket' },
    ],
    sceneExamples: [
      { label: 'Sunlit Tailoring Studio',   category: 'Editorial Studio Looks',   imageId: '1776664933175-rjlbn6', collectionLabel: 'Clothing & Apparel', subCategory: 'Editorial Studio Looks',   alt: 'AI fashion product photography example: editorial studio look in sunlit tailoring scene.' },
      { label: 'Greenhouse Elegance',       category: 'Creative Shots',           imageId: '1776840733386-n4bc6x', collectionLabel: 'Clothing & Apparel', subCategory: 'Creative Shots',           alt: 'AI fashion product photography example: creative greenhouse elegance shot.' },
      { label: 'Side Profile Street Study', category: 'Elevated Location Editorial', imageId: '1776664732243-2tc8uy', collectionLabel: 'Clothing & Apparel', subCategory: 'Elevated Location Editorial', alt: 'AI fashion product photography example: elevated location editorial street study.' },
      { label: 'Super Editorial Campaign',  category: 'Campaign Statement Images', imageId: '1776606017719-zzhgy7', collectionLabel: 'Clothing & Apparel', subCategory: 'Campaign Statement Images', alt: 'AI fashion product photography example: super editorial campaign visual.' },
      { label: 'Ghost Mannequin Shot',      category: 'Essential Shots',          imageId: '1776841027943-vetumj', collectionLabel: 'Clothing & Apparel', subCategory: 'Essential Shots',          alt: 'AI fashion product photography example: clean ghost mannequin product page shot.' },
      { label: 'Editorial Floor Stretch',   category: 'Editorial Sport Poses',    imageId: '1776192312181-3v0u0t', collectionLabel: 'Activewear',         subCategory: 'Editorial Sport Poses',    alt: 'AI fashion product photography example: activewear editorial floor stretch pose.' },
      { label: 'Sunlit Arch Swim Editorial', category: 'Editorial Resort Poses',  imageId: '1776522810241-oh3lyd', collectionLabel: 'Swimwear',           subCategory: 'Editorial Resort Poses',   alt: 'AI fashion product photography example: swimwear editorial resort pose.' },
      { label: 'Sunlit Tailored Chair Pose', category: 'Editorial Outerwear Portraits', imageId: '1776691912818-yiu2uq', collectionLabel: 'Jackets',     subCategory: 'Editorial Outerwear Portraits', alt: 'AI fashion product photography example: jacket editorial outerwear portrait.' },
    ],
    useCases: [
      { title: 'Shopify product pages',     text: 'Hero shots, alternates, and lifestyle scenes for every PDP.', icon: 'shopping-bag' },
      { title: 'Meta and Google Ads',       text: 'High-CTR creative variations for performance testing.',        icon: 'megaphone' },
      { title: 'Instagram and TikTok',      text: 'Always-on social content without booking another shoot.',      icon: 'instagram' },
      { title: 'Email campaign banners',    text: 'On-brand hero imagery for newsletters and promos.',            icon: 'mail' },
      { title: 'Seasonal drops',            text: 'Refresh visuals for every season and capsule collection.',     icon: 'calendar' },
      { title: 'Lookbook & PR',             text: 'Editorial spreads ready for press and showroom.',              icon: 'layout-template' },
    ],
    faqs: [
      { q: 'Can AI create product photos for clothing brands?',                  a: 'Yes. Upload one apparel photo and VOVV.AI creates product page images, flatlays, lifestyle visuals, on-model style shots, and campaign content for fashion brands.' },
      { q: 'Can VOVV.AI create on-model style fashion visuals?',                 a: 'Yes. The system can place your garment on model-style figures in editorial, streetwear, swimwear, and lifestyle contexts that match your brand aesthetic.' },
      { q: 'Can AI preserve fabric texture, color, and logo details?',           a: 'VOVV.AI is built to keep the product as the hero — fabric texture, color, prints, and logos are preserved as faithfully as possible. We always recommend reviewing final visuals before publishing.' },
      { q: 'Can I create Shopify clothing product photos with VOVV.AI?',         a: 'Yes. The output is sized and styled for Shopify product detail pages, collection covers, and homepage banners.' },
      { q: 'Can I create campaign visuals for new clothing drops?',              a: 'Yes. Generate multiple seasonal directions in minutes — perfect for testing campaign concepts before a launch.' },
    ],
    relatedCategories: ['footwear', 'bags-accessories', 'jewelry', 'beauty-skincare'],
    heroImageId: '1776606017719-zzhgy7',
    heroAlt: 'AI fashion product photography example showing a super editorial clothing campaign visual.',
    heroNoun: 'garment',
    heroCollage: [
      { subCategory: 'Apparel',    imageId: '1776664933175-rjlbn6', alt: 'AI fashion editorial studio look.' },
      { subCategory: 'Activewear', imageId: '1776192312181-3v0u0t', alt: 'AI activewear editorial floor stretch.' },
      { subCategory: 'Swimwear',   imageId: '1776522810241-oh3lyd', alt: 'AI swimwear editorial resort pose.' },
      { subCategory: 'Jackets',    imageId: '1776691912818-yiu2uq', alt: 'AI jacket editorial outerwear portrait.' },
    ],
  },

  // ─────────────────────────────────────── 2. FOOTWEAR
  {
    slug: 'footwear',
    url: `${BASE}/footwear`,
    groupName: 'Footwear',
    seoTitle: 'AI Product Photography for Footwear Brands | VOVV.AI',
    metaDescription:
      'Create footwear product photography with AI. Upload one shoe image and generate product page visuals, sneaker campaigns, boot scenes, high heel imagery, ads, and lifestyle content.',
    h1Lead: 'AI Product Photography',
    h1Highlight: 'for Footwear Brands',
    heroEyebrow: 'Footwear · Sneakers · Boots',
    heroSubheadline:
      'Upload one shoe photo and create product page images, lifestyle visuals, sneaker launch scenes, boot campaigns, high heel imagery, and ad-ready footwear content.',
    primaryKeyword: 'AI footwear product photography',
    secondaryKeywords: [
      'footwear product photography',
      'shoe product photography',
      'sneaker product photography',
      'AI shoe product photography',
      'ecommerce footwear photography',
    ],
    longTailKeywords: [
      'AI product photography for shoe brands',
      'AI shoe product photos for Shopify',
      'generate sneaker lifestyle photos from one image',
      'sneaker campaign visuals with AI',
    ],
    subcategories: ['Shoes', 'Sneakers', 'Boots', 'High Heels'],
    painPoints: [
      'Footwear visuals need accurate shape, sole design, material texture, stitching, and silhouette.',
      'Footwear brands need multiple angles and campaign visuals for every drop.',
      'Sneakers, boots, and high heels each need a different visual mood.',
      'Launch campaigns need fast testing across ads, social, and product pages.',
    ],
    visualOutputs: [
      { title: 'Clean studio shoe images',     text: 'Crisp e-commerce angles on neutral backgrounds.',           icon: 'shopping-bag' },
      { title: 'Sneaker streetwear scenes',    text: 'Urban scenes that match your sneaker drop story.',          icon: 'sparkles' },
      { title: 'Boot outdoor lifestyle',       text: 'Rugged or refined boot scenes for seasonal campaigns.',     icon: 'camera' },
      { title: 'High heel editorial',          text: 'Luxury close-ups with controlled light and shadow.',        icon: 'image' },
      { title: 'Sole detail shots',            text: 'Macro tread and outsole detail visuals.',                   icon: 'zoom-in' },
      { title: 'Side profile product pages',   text: 'Clean side angles ready for PDP grids.',                    icon: 'layout-grid' },
      { title: 'Social ad creatives',          text: 'Variations tuned for Meta, TikTok, and Pinterest.',         icon: 'instagram' },
      { title: 'Launch banners',               text: 'Hero banners and collection covers for new drops.',         icon: 'rocket' },
    ],
    sceneExamples: [
      { label: 'Geometric Grid Minimal', category: 'Trending Editorial',   imageId: '1776770345914-cg8uyy',                    collectionLabel: 'Sneakers', subCategory: 'Trending Editorial',   alt: 'AI footwear product photography example: trending editorial sneaker shot.' },
      { label: 'Hard Shadow Hero',       category: 'Concept Shots',        imageId: 'hard-shadow-shoes-sneakers-1776008136691', collectionLabel: 'Sneakers', subCategory: 'Concept Shots',        alt: 'AI footwear product photography example: hard shadow concept sneaker shot.' },
      { label: 'Night Curb',             category: 'Flash Editorial',      imageId: 'night-curb-flash-1776011807130',           collectionLabel: 'Sneakers', subCategory: 'Flash Editorial',      alt: 'AI footwear product photography example: night curb flash editorial sneaker.' },
      { label: 'Café Sneaker Moment',    category: 'UGC Style Content',    imageId: '1776770529252-2efq00',                    collectionLabel: 'Sneakers', subCategory: 'UGC Style Content',    alt: 'AI footwear product photography example: UGC café sneaker moment.' },
      { label: 'Tulle Legs',             category: 'Fashion Editorial',    imageId: '1776845513298-afa4ht',                    collectionLabel: 'Shoes',    subCategory: 'Fashion Editorial',    alt: 'AI footwear product photography example: fashion editorial shoe shot.' },
      { label: 'Hero Stance',            category: 'Power Looks',          imageId: '1776240691300-bk7f4s',                    collectionLabel: 'Boots',    subCategory: 'Power Looks',          alt: 'AI footwear product photography example: power-look boot hero stance.' },
      { label: 'Trouser Drop',           category: 'Quiet Luxury Editorial', imageId: '1776240737684-bw95ch',                  collectionLabel: 'Boots',    subCategory: 'Quiet Luxury Editorial', alt: 'AI footwear product photography example: quiet luxury boot editorial.' },
      { label: 'Seated Heel Studio',     category: 'Editorial Heel Studio', imageId: '1776755942377-gtu4o0',                   collectionLabel: 'High Heels', subCategory: 'Editorial Heel Studio', alt: 'AI footwear product photography example: editorial heel studio shot.' },
    ],
    useCases: [
      { title: 'Shopify product pages',  text: 'Hero shots and alternates for every shoe SKU.',                icon: 'shopping-bag' },
      { title: 'Sneaker launch campaigns', text: 'Drop-day creative ready before the inventory lands.',         icon: 'rocket' },
      { title: 'Meta and TikTok ads',    text: 'High-CTR variations for performance testing.',                 icon: 'megaphone' },
      { title: 'Lookbooks',              text: 'Editorial spreads for collection storytelling.',               icon: 'layout-template' },
      { title: 'Email banners',          text: 'On-brand drop announcements for newsletters.',                 icon: 'mail' },
      { title: 'Catalog consistency',    text: 'A unified look across hundreds of footwear SKUs.',             icon: 'layout-grid' },
    ],
    faqs: [
      { q: 'What is AI footwear product photography?',               a: 'AI footwear product photography uses AI to create shoe images, sneaker scenes, boot lifestyle visuals, and high heel editorial shots from a single product photo — without a traditional shoot.' },
      { q: 'Can VOVV.AI create product photos for shoes and sneakers?', a: 'Yes. Upload one shoe photo and VOVV.AI generates clean PDP shots, lifestyle scenes, ads, and launch campaign visuals.' },
      { q: 'Can AI preserve the shape, sole, and material details?', a: 'VOVV.AI is built to preserve silhouette, sole geometry, stitching, and material accuracy. Always review final visuals before publishing.' },
      { q: 'Can I create sneaker campaign visuals with AI?',         a: 'Yes. Generate streetwear, athletic, and editorial campaign concepts from a single product image.' },
      { q: 'Can I create footwear images for Shopify?',              a: 'Yes. The output is sized for Shopify PDPs, collection grids, banners, and ads.' },
    ],
    relatedCategories: ['fashion', 'bags-accessories', 'jewelry'],
    heroImageId: 'night-curb-flash-1776011807130',
    heroAlt: 'AI footwear product photography example showing a sneaker in a night curb flash editorial.',
    heroNoun: 'shoe',
    heroCollage: [
      { subCategory: 'Sneakers',   imageId: 'night-curb-flash-1776011807130', alt: 'AI sneaker night curb flash editorial.' },
      { subCategory: 'Shoes',      imageId: '1776845513298-afa4ht',           alt: 'AI shoe fashion editorial.' },
      { subCategory: 'Boots',      imageId: '1776240737684-bw95ch',           alt: 'AI boot quiet luxury editorial.' },
      { subCategory: 'High Heels', imageId: '1776755942377-gtu4o0',           alt: 'AI heel editorial studio shot.' },
    ],
  },

  // ─────────────────────────────────────── 3. BEAUTY & SKINCARE
  {
    slug: 'beauty-skincare',
    url: `${BASE}/beauty-skincare`,
    groupName: 'Beauty & Skincare',
    seoTitle: 'AI Product Photography for Beauty & Skincare Brands | VOVV.AI',
    metaDescription:
      'Create AI product photography for beauty and skincare brands. Generate clean skincare product images, cosmetic visuals, makeup scenes, spa-style lifestyle photos, ads, and campaign content.',
    h1Lead: 'AI Product Photography',
    h1Highlight: 'for Beauty & Skincare Brands',
    heroEyebrow: 'Beauty · Skincare · Cosmetics',
    heroSubheadline:
      'Create skincare product images, cosmetic visuals, makeup scenes, spa-style lifestyle photos, and campaign-ready beauty content from one product photo.',
    primaryKeyword: 'AI skincare product photography',
    secondaryKeywords: [
      'skincare product photography',
      'beauty product photography',
      'cosmetic product photography',
      'makeup product photography',
      'AI beauty product photos',
    ],
    longTailKeywords: [
      'AI product photography for skincare brands',
      'beauty product photos for Shopify',
      'AI cosmetic product photography',
      'skincare lifestyle product photography',
    ],
    subcategories: ['Skincare', 'Cosmetics', 'Makeup', 'Lipsticks', 'Serums', 'Creams', 'Jars', 'Tubes'],
    painPoints: [
      'Beauty visuals need clean labels, realistic packaging, glass, caps, pumps, jars, and texture.',
      'Skincare and cosmetics require trust, cleanliness, and premium visual consistency.',
      'Brands need product page images, lifestyle visuals, ads, social content, and seasonal campaigns.',
      'Transparent bottles, metallic caps, and cream textures are difficult to shoot consistently.',
    ],
    visualOutputs: [
      { title: 'Clean studio skincare',      text: 'Crisp PDP-ready images on neutral or branded backgrounds.', icon: 'shopping-bag' },
      { title: 'Spa-style lifestyle',        text: 'Calm, premium scenes that build trust.',                    icon: 'sparkles' },
      { title: 'Bathroom shelf scenes',      text: 'Realistic in-context scenes for routine storytelling.',     icon: 'image' },
      { title: 'Cosmetic flatlays',          text: 'Curated top-down beauty layouts.',                          icon: 'layout-grid' },
      { title: 'Makeup texture shots',       text: 'Macro swatches and texture details.',                       icon: 'zoom-in' },
      { title: 'Lipstick campaign visuals',  text: 'Editorial close-ups with bold styling.',                    icon: 'camera' },
      { title: 'Social ad creatives',        text: 'High-CTR variations for Meta and TikTok.',                  icon: 'instagram' },
      { title: 'Website banners',            text: 'Hero banners for collection launches.',                     icon: 'rocket' },
    ],
    sceneExamples: [
      { label: 'Shadow Surface Hero',       category: 'Editorial Skincare Product Studio', imageId: '1776239826550-uaopmt', collectionLabel: 'Beauty & Skincare', subCategory: 'Editorial Skincare Product Studio', alt: 'AI skincare product photography example: editorial studio shadow surface hero.' },
      { label: 'Sunny Shadows',             category: 'Creative Shots',                    imageId: '1776843788569-i1s066', collectionLabel: 'Beauty & Skincare', subCategory: 'Creative Shots',                    alt: 'AI skincare product photography example: sunny shadows creative shot.' },
      { label: 'Color Surface Skincare Still', category: 'Aesthetic Color Skincare Stories', imageId: '1776843772252-pv4pt8', collectionLabel: 'Beauty & Skincare', subCategory: 'Aesthetic Color Skincare Stories', alt: 'AI skincare product photography example: aesthetic color surface still.' },
      { label: 'Vanity Mirror Routine',     category: 'Daily Routine / Vanity UGC',         imageId: '1776843790436-teib3k', collectionLabel: 'Beauty & Skincare', subCategory: 'Daily Routine / Vanity UGC',         alt: 'AI skincare product photography example: vanity mirror routine UGC.' },
      { label: 'Cheek Application Editorial', category: 'On-Skin Editorial Rituals',        imageId: '1776239798302-zux4q2', collectionLabel: 'Beauty & Skincare', subCategory: 'On-Skin Editorial Rituals',         alt: 'AI skincare product photography example: on-skin cheek application editorial.' },
      { label: 'Front View',                category: 'Essential Shots',                   imageId: '1776239813791-r7ih97', collectionLabel: 'Beauty & Skincare', subCategory: 'Essential Shots',                   alt: 'AI skincare product photography example: clean essential PDP front view.' },
      { label: 'Gloss Touch Detail',        category: 'Editorial Beauty Product Studio',   imageId: '1776755066377-ttt1by', collectionLabel: 'Makeup & Lipsticks', subCategory: 'Editorial Beauty Product Studio',  alt: 'AI cosmetic product photography example: editorial gloss touch detail.' },
      { label: 'Lip Closeup Editorial',     category: 'On-Face / In-Hand Beauty Editorial', imageId: '1776243670920-7gzb3b', collectionLabel: 'Makeup & Lipsticks', subCategory: 'On-Face / In-Hand Beauty Editorial', alt: 'AI cosmetic product photography example: on-face lip closeup editorial.' },
    ],
    useCases: [
      { title: 'Shopify product pages',   text: 'PDP-ready hero shots and alternates.',                  icon: 'shopping-bag' },
      { title: 'Meta and TikTok ads',     text: 'High-CTR creative for performance campaigns.',          icon: 'megaphone' },
      { title: 'Routine social content',  text: 'Always-on Instagram and TikTok storytelling.',          icon: 'instagram' },
      { title: 'Email & loyalty banners', text: 'Premium hero imagery for CRM flows.',                   icon: 'mail' },
      { title: 'Seasonal beauty drops',   text: 'Refresh visuals for every collection.',                 icon: 'calendar' },
      { title: 'Catalog consistency',     text: 'A unified beauty system across SKUs.',                  icon: 'layout-grid' },
    ],
    faqs: [
      { q: 'Can AI create realistic skincare product photos?',          a: 'Yes. VOVV.AI generates skincare product images that hold up on PDPs, ads, and lifestyle channels.' },
      { q: 'Can VOVV.AI preserve skincare labels and packaging?',       a: 'VOVV.AI is built to preserve label artwork, bottle shape, and packaging materials. Always review final visuals before publishing.' },
      { q: 'Can I create product photos for serums, creams, and jars?', a: 'Yes — including dropper bottles, airless pumps, jars, tubes, and ampoules.' },
      { q: 'Can AI create makeup and lipstick visuals?',                a: 'Yes. Generate editorial close-ups, swatch macros, and lifestyle scenes for makeup and lip products.' },
      { q: 'Can I use these visuals for beauty ads and Shopify pages?', a: 'Yes. Output is sized for Shopify PDPs, ad placements, and email banners.' },
    ],
    relatedCategories: ['fragrance', 'supplements-wellness', 'jewelry'],
    heroImageId: '1776239826550-uaopmt',
    heroAlt: 'AI skincare product photography example showing a skincare bottle in an editorial studio scene.',
    heroNoun: 'product',
  },

  // ─────────────────────────────────────── 4. FRAGRANCE
  {
    slug: 'fragrance',
    url: `${BASE}/fragrance`,
    groupName: 'Fragrance',
    seoTitle: 'AI Product Photography for Perfume & Fragrance Brands | VOVV.AI',
    metaDescription:
      'Create AI perfume product photography for fragrance brands. Generate luxury bottle visuals, fragrance campaign scenes, product page images, gift set content, ads, and social visuals.',
    h1Lead: 'AI Product Photography',
    h1Highlight: 'for Perfume & Fragrance Brands',
    heroEyebrow: 'Fragrance · Perfume',
    heroSubheadline:
      'Create luxury perfume visuals, fragrance bottle photography, product page images, gift set scenes, and campaign-ready scent stories from one bottle photo.',
    primaryKeyword: 'AI perfume product photography',
    secondaryKeywords: [
      'perfume product photography',
      'fragrance product photography',
      'perfume bottle photography',
      'luxury perfume photography',
      'AI fragrance product photos',
    ],
    longTailKeywords: [
      'AI product photography for perfume brands',
      'luxury fragrance product photography AI',
      'perfume campaign visuals with AI',
      'AI perfume ad generator',
    ],
    subcategories: ['Perfume Bottles', 'Fragrance Boxes', 'Gift Sets', 'Glass Bottles', 'Caps', 'Atomizers', 'Seasonal Campaigns'],
    painPoints: [
      'Fragrance visuals need luxury mood, reflection control, glass realism, liquid color, and packaging accuracy.',
      'Perfume campaigns often need seasonal stories, hero visuals, gifting scenes, and social content.',
      'Glass, reflections, liquid, and metallic caps are notoriously hard to shoot.',
      'Brands need premium output across PDP, ads, social, and gifting moments.',
    ],
    visualOutputs: [
      { title: 'Luxury bottle hero',     text: 'Premium hero visuals with controlled reflections.',     icon: 'sparkles' },
      { title: 'Product page photos',    text: 'Crisp PDP-ready angles for every SKU.',                 icon: 'shopping-bag' },
      { title: 'Gift set visuals',       text: 'Holiday and seasonal gifting compositions.',            icon: 'rocket' },
      { title: 'Seasonal campaigns',     text: 'Story-driven visuals for every fragrance drop.',        icon: 'calendar' },
      { title: 'Editorial scent stories', text: 'Mood-driven editorial scenes that sell the feeling.',  icon: 'camera' },
      { title: 'Glass bottle close-ups', text: 'Macro details on glass, caps, and labels.',             icon: 'zoom-in' },
      { title: 'Social ad creatives',    text: 'Performance-ready ad variants.',                        icon: 'instagram' },
      { title: 'Website banners',        text: 'Hero banners and collection covers.',                   icon: 'layout-template' },
    ],
    sceneExamples: [
      { label: 'Eclipse Shadow',        category: 'Conceptual Editorial', imageId: '1776842387930-h6xw7w',                  collectionLabel: 'Fragrance', subCategory: 'Conceptual Editorial', alt: 'AI perfume product photography example: conceptual eclipse shadow editorial.' },
      { label: 'Sheer Motion',          category: 'Dream Editorial',      imageId: '1776842418986-69fvli',                  collectionLabel: 'Fragrance', subCategory: 'Dream Editorial',      alt: 'AI perfume product photography example: dream editorial sheer motion.' },
      { label: 'Volcanic Sunset',       category: 'Editorial',            imageId: '1776018039712-1hifzr',                  collectionLabel: 'Fragrance', subCategory: 'Editorial',            alt: 'AI perfume product photography example: editorial volcanic sunset bottle.' },
      { label: 'Clean Packshot',        category: 'Essential Shots',      imageId: 'clean-packshot-fragrance-1776013150532', collectionLabel: 'Fragrance', subCategory: 'Essential Shots',      alt: 'AI perfume product photography example: clean essential packshot.' },
      { label: 'Near Face Hold',        category: 'Editorial',            imageId: 'near-face-hold-fragrance-1776013185169', collectionLabel: 'Fragrance', subCategory: 'Editorial',            alt: 'AI perfume product photography example: near-face hold editorial.' },
      { label: 'Repeated Shadow Grid',  category: 'Conceptual Editorial', imageId: 'repeated-shadow-grid-fragrance-1776013389735', collectionLabel: 'Fragrance', subCategory: 'Conceptual Editorial', alt: 'AI perfume product photography example: repeated shadow grid concept.' },
      { label: 'Golden Hour Bottle',    category: 'Editorial',            imageId: '1776574228066-oyklfz',                  collectionLabel: 'Fragrance', subCategory: 'Editorial',            alt: 'AI perfume product photography example: golden hour fragrance editorial.' },
      { label: 'Dark Luxury Bottle',    category: 'Editorial',            imageId: '1776018038709-gmt0eg',                  collectionLabel: 'Fragrance', subCategory: 'Editorial',            alt: 'AI perfume product photography example: dark luxury fragrance editorial.' },
    ],
    useCases: [
      { title: 'Shopify product pages',   text: 'PDP hero shots and alternates.',                       icon: 'shopping-bag' },
      { title: 'Holiday gifting campaigns', text: 'Seasonal gift set visuals ready in minutes.',         icon: 'calendar' },
      { title: 'Meta and Pinterest ads',  text: 'High-CTR creative for performance.',                    icon: 'megaphone' },
      { title: 'Email banners',           text: 'Luxury email hero imagery.',                            icon: 'mail' },
      { title: 'Launch campaigns',        text: 'Drop-day creative for new fragrances.',                 icon: 'rocket' },
      { title: 'Editorial PR',            text: 'Mood-rich press visuals.',                              icon: 'camera' },
    ],
    faqs: [
      { q: 'Can AI create luxury perfume product photos?',                  a: 'Yes. VOVV.AI generates premium fragrance visuals with controlled lighting, reflections, and luxury styling.' },
      { q: 'Can VOVV.AI preserve perfume bottle shape and labels?',         a: 'VOVV.AI is built to preserve bottle silhouette, cap geometry, and label artwork as faithfully as possible.' },
      { q: 'Can AI handle glass bottles and reflections?',                  a: 'Yes — glass realism, liquid color, and reflection control are core to the fragrance output.' },
      { q: 'Can I create fragrance campaign visuals from one bottle image?',a: 'Yes. Generate seasonal, editorial, and campaign concepts from a single bottle photo.' },
      { q: 'Can I create perfume gift set images?',                         a: 'Yes — including holiday gifting scenes, boxed sets, and PR-ready compositions.' },
    ],
    relatedCategories: ['beauty-skincare', 'jewelry', 'home-furniture'],
    heroImageId: '1776842387930-h6xw7w',
    heroAlt: 'AI perfume product photography example showing a fragrance bottle in a conceptual editorial scene.',
    heroNoun: 'bottle',
  },

  // ─────────────────────────────────────── 5. JEWELRY
  {
    slug: 'jewelry',
    url: `${BASE}/jewelry`,
    groupName: 'Jewelry',
    seoTitle: 'AI Product Photography for Jewelry Brands | VOVV.AI',
    metaDescription:
      'Create AI jewelry product photography for rings, necklaces, earrings, and bracelets. Generate macro detail shots, model-style visuals, luxury campaign images, and ecommerce photos.',
    h1Lead: 'AI Product Photography',
    h1Highlight: 'for Jewelry Brands',
    heroEyebrow: 'Jewelry · Fine & Fashion',
    heroSubheadline:
      'Create elegant jewelry product photos, macro detail shots, model-style visuals, and luxury campaign images for rings, necklaces, earrings, and bracelets.',
    primaryKeyword: 'AI jewelry product photography',
    secondaryKeywords: [
      'jewelry product photography',
      'jewellery product photography',
      'ring product photography',
      'necklace product photography',
      'luxury jewelry photography',
    ],
    longTailKeywords: [
      'AI product photography for jewelry brands',
      'AI jewelry model photos',
      'luxury jewelry product photography AI',
      'AI ring product photography',
    ],
    subcategories: ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Macro Details', 'On-Hand Visuals', 'On-Body Visuals', 'Luxury Scenes'],
    painPoints: [
      'Jewelry needs sharp macro detail, realistic reflections, gemstone clarity, metal shine, and premium styling.',
      'Rings, earrings, necklaces, and bracelets each need a different display context.',
      'Jewelry brands need PDP photos, model-style visuals, close-ups, campaigns, and social content.',
      'Small product details must feel desirable and accurate.',
    ],
    visualOutputs: [
      { title: 'Macro product details',   text: 'Sharp macro shots that show craftsmanship.',           icon: 'zoom-in' },
      { title: 'Ring-on-hand visuals',    text: 'On-hand styling that builds desire.',                  icon: 'sparkles' },
      { title: 'Necklace model-style',    text: 'On-neck visuals for true scale.',                      icon: 'image' },
      { title: 'Earring close-ups',       text: 'Refined ear-level editorial details.',                 icon: 'camera' },
      { title: 'Bracelet wrist visuals',  text: 'Wrist styling shots for lifestyle context.',           icon: 'shopping-bag' },
      { title: 'Luxury campaign scenes',  text: 'Mood-rich campaign imagery.',                          icon: 'layout-template' },
      { title: 'Clean PDP images',        text: 'E-commerce-ready product photos.',                     icon: 'layout-grid' },
      { title: 'Social ad creatives',     text: 'Ad variants for Meta and Pinterest.',                  icon: 'instagram' },
    ],
    sceneExamples: [
      { label: 'Floating Ring Studio',         category: 'Editorial Product Studio', imageId: '1776244136599-8gw62e', collectionLabel: 'Rings',     subCategory: 'Editorial Product Studio', alt: 'AI jewelry product photography example: editorial floating ring studio.' },
      { label: 'Natural Hand Diamond Portrait',category: 'On-Hand Editorial',        imageId: '1776667135186-jxx6bj', collectionLabel: 'Rings',     subCategory: 'On-Hand Editorial',       alt: 'AI jewelry product photography example: on-hand diamond portrait.' },
      { label: 'Editorial Neck Portrait',      category: 'Editorial Neck Studio',    imageId: '1776243905045-8aw72b', collectionLabel: 'Necklaces', subCategory: 'Editorial Neck Studio',   alt: 'AI jewelry product photography example: editorial neck necklace portrait.' },
      { label: 'Dark Campaign Necklace',       category: 'Campaign Necklace Statements', imageId: '1776243903909-thrg8i', collectionLabel: 'Necklaces', subCategory: 'Campaign Necklace Statements', alt: 'AI jewelry product photography example: dark campaign necklace statement.' },
      { label: 'Side Profile Earrings',        category: 'On-Ear Editorial',         imageId: '1776753261985-yi93vf', collectionLabel: 'Earrings',  subCategory: 'On-Ear Editorial',        alt: 'AI jewelry product photography example: side profile on-ear editorial.' },
      { label: 'Clean Wrist Portrait',         category: 'On-Wrist Editorial',       imageId: '1776241050316-4p0d88', collectionLabel: 'Bracelets', subCategory: 'On-Wrist Editorial',      alt: 'AI jewelry product photography example: clean on-wrist bracelet portrait.' },
      { label: 'Stone Slab Still',             category: 'Jewelry Still Life',       imageId: '1776244160114-g0zd4e', collectionLabel: 'Rings',     subCategory: 'Jewelry Still Life',      alt: 'AI jewelry product photography example: stone slab ring still life.' },
      { label: 'Color Stone Story',            category: 'Color Ring Stories',       imageId: '1776244131598-oe5699', collectionLabel: 'Rings',     subCategory: 'Color Ring Stories',      alt: 'AI jewelry product photography example: aesthetic color ring story.' },
    ],
    useCases: [
      { title: 'Shopify product pages',  text: 'PDP shots and alternates for every SKU.',           icon: 'shopping-bag' },
      { title: 'Meta and Pinterest ads', text: 'High-CTR creative for performance.',                icon: 'megaphone' },
      { title: 'Editorial PR',           text: 'Press-ready luxury imagery.',                       icon: 'camera' },
      { title: 'Email & loyalty',        text: 'Premium hero imagery for CRM.',                     icon: 'mail' },
      { title: 'Seasonal campaigns',     text: 'Refresh visuals for every drop.',                   icon: 'calendar' },
      { title: 'Catalog consistency',    text: 'Unified look across the collection.',               icon: 'layout-grid' },
    ],
    faqs: [
      { q: 'Can AI create jewelry product photos?',                  a: 'Yes. VOVV.AI generates macro details, model-style visuals, lifestyle shots, and luxury campaign imagery.' },
      { q: 'Can VOVV.AI create model-style visuals for jewelry?',    a: 'Yes — on-hand, on-neck, on-ear, and on-wrist style scenes built around your brand aesthetic.' },
      { q: 'Can AI preserve metal, gemstone, and detail accuracy?',  a: 'VOVV.AI is built to preserve metal finish, gemstone clarity, and craftsmanship details. Always review final visuals before publishing.' },
      { q: 'Can I create ring, necklace, and earring visuals?',      a: 'Yes — including bracelets, anklets, and fine accessories.' },
      { q: 'Can I create luxury jewelry campaign images?',           a: 'Yes. Generate mood-rich campaign visuals from a single product photo.' },
    ],
    relatedCategories: ['bags-accessories', 'fashion', 'fragrance'],
    heroImageId: '1776244136599-8gw62e',
    heroAlt: 'AI jewelry product photography example showing an editorial floating ring studio shot.',
    heroNoun: 'piece',
  },

  // ─────────────────────────────────────── 6. BAGS & ACCESSORIES
  {
    slug: 'bags-accessories',
    url: `${BASE}/bags-accessories`,
    groupName: 'Bags & Accessories',
    seoTitle: 'AI Product Photography for Bags & Accessories Brands | VOVV.AI',
    metaDescription:
      'Create AI product photography for bags, handbags, backpacks, wallets, belts, scarves, hats, eyewear, and watches. Generate lifestyle scenes, product photos, and campaign visuals.',
    h1Lead: 'AI Product Photography',
    h1Highlight: 'for Bags & Accessories Brands',
    heroEyebrow: 'Bags · Accessories · Eyewear · Watches',
    heroSubheadline:
      'Create handbag visuals, accessory product photos, lifestyle scenes, detail shots, and luxury campaign content for fashion accessory brands.',
    primaryKeyword: 'AI bag product photography',
    secondaryKeywords: [
      'bag product photography',
      'handbag product photography',
      'fashion accessory product photography',
      'AI handbag photos',
      'accessory product photography',
    ],
    longTailKeywords: [
      'AI product photography for handbag brands',
      'luxury bag campaign visuals',
      'bag product photos for Shopify',
      'generate lifestyle handbag photos from one image',
    ],
    subcategories: ['Bags', 'Handbags', 'Backpacks', 'Wallets & Cardholders', 'Belts', 'Scarves', 'Hats & Headwear', 'Eyewear', 'Watches'],
    painPoints: [
      'Accessories need material accuracy, hardware detail, stitching, straps, and premium styling.',
      'Bags often need lifestyle context to communicate scale and desirability.',
      'Many small categories are too thin for separate SEO pages, so they live inside a strong parent hub.',
      'Brands need fast visuals across PDP, ads, social, and luxury campaigns.',
    ],
    visualOutputs: [
      { title: 'Handbag product photos',   text: 'Crisp PDP-ready angles.',                              icon: 'shopping-bag' },
      { title: 'Luxury bag campaigns',     text: 'Mood-rich editorial visuals.',                         icon: 'sparkles' },
      { title: 'Backpack lifestyle',       text: 'Travel and city lifestyle scenes.',                    icon: 'image' },
      { title: 'Wallet detail shots',      text: 'Macro leather, stitching, and hardware.',              icon: 'zoom-in' },
      { title: 'Eyewear lifestyle',        text: 'Sun-soaked editorial and city scenes.',                icon: 'camera' },
      { title: 'Watch detail visuals',     text: 'Wrist shots and macro dial details.',                  icon: 'layout-grid' },
      { title: 'Accessory flatlays',       text: 'Curated top-down compositions.',                       icon: 'layout-template' },
      { title: 'Social ad creatives',      text: 'Ad variations for Meta, TikTok, and Pinterest.',       icon: 'instagram' },
    ],
    sceneExamples: [
      { label: 'Sculptural Bag Studio Hero',     category: 'Editorial Product Studio',  imageId: '1776239449949-ygljai',                          collectionLabel: 'Bags',     subCategory: 'Editorial Product Studio',  alt: 'AI bag product photography example: editorial sculptural bag studio hero.' },
      { label: 'Wind Shoulder Editorial',        category: 'Campaign Bag Statements',   imageId: '1776749559127-ra3hur',                          collectionLabel: 'Bags',     subCategory: 'Campaign Bag Statements',   alt: 'AI bag product photography example: campaign wind shoulder editorial.' },
      { label: 'Architectural On-Body Editorial', category: 'On-Body Editorial & Location', imageId: '1776239415973-p3m8bq',                       collectionLabel: 'Bags',     subCategory: 'On-Body Editorial & Location', alt: 'AI bag product photography example: architectural on-body editorial.' },
      { label: 'One Shoulder Carry',             category: 'On-Body Editorial Carry',   imageId: '1776231546156-0g25eq',                          collectionLabel: 'Backpacks', subCategory: 'On-Body Editorial Carry',   alt: 'AI backpack product photography example: editorial one-shoulder carry.' },
      { label: 'One-Hand Hero Hold',             category: 'In-Hand Editorial Detail',  imageId: '1776695123556-xfq8ak',                          collectionLabel: 'Wallets',  subCategory: 'In-Hand Editorial Detail',  alt: 'AI wallet product photography example: in-hand editorial hero hold.' },
      { label: 'Beauty Closeup',                 category: 'Editorial Eyewear Portraits', imageId: 'beauty-closeup-oversized-eyewear-1776150210659', collectionLabel: 'Eyewear', subCategory: 'Editorial Eyewear Portraits', alt: 'AI eyewear product photography example: editorial beauty closeup portrait.' },
      { label: 'Wrist Beauty Portrait',          category: 'On-Wrist Editorial Portraits', imageId: '1776596675195-dlyony',                       collectionLabel: 'Watches',  subCategory: 'On-Wrist Editorial Portraits', alt: 'AI watch product photography example: on-wrist editorial portrait.' },
      { label: 'Tailored Full-Body Belt Editorial', category: 'On-Body Waist Editorial', imageId: '1776240060436-0k532h',                          collectionLabel: 'Belts',    subCategory: 'On-Body Waist Editorial',   alt: 'AI belt product photography example: on-body waist editorial.' },
    ],
    useCases: [
      { title: 'Shopify product pages',  text: 'PDP visuals and alternates.',                           icon: 'shopping-bag' },
      { title: 'Meta and TikTok ads',    text: 'Ad variants for performance testing.',                  icon: 'megaphone' },
      { title: 'Lookbooks',              text: 'Editorial spreads for collections.',                    icon: 'layout-template' },
      { title: 'Email banners',          text: 'Premium imagery for CRM flows.',                        icon: 'mail' },
      { title: 'Seasonal drops',         text: 'Refresh creatives for every season.',                   icon: 'calendar' },
      { title: 'Catalog consistency',    text: 'Unified look across hundreds of SKUs.',                 icon: 'layout-grid' },
    ],
    faqs: [
      { q: 'Can AI create handbag product photos?',                a: 'Yes. Generate PDP shots, lifestyle scenes, and luxury campaign visuals from one bag photo.' },
      { q: 'Can VOVV.AI preserve leather texture and hardware?',   a: 'VOVV.AI is built to preserve leather grain, hardware detail, and stitching. Always review final visuals.' },
      { q: 'Can I create visuals for wallets, backpacks, eyewear, and watches?', a: 'Yes — bags and accessories share a unified hub so all related products are supported.' },
      { q: 'Can I create luxury accessory campaign images?',       a: 'Yes. Mood-rich editorial visuals are core to the accessories output.' },
      { q: 'Can AI generate lifestyle photos for bags and accessories?', a: 'Yes — travel, city, editorial, and seasonal lifestyle scenes are all available.' },
    ],
    relatedCategories: ['fashion', 'jewelry', 'footwear'],
    heroImageId: '1776239449949-ygljai',
    heroAlt: 'AI handbag product photography example showing a sculptural bag in an editorial studio scene.',
    heroNoun: 'accessory',
    heroCollage: [
      { subCategory: 'Bags',        imageId: '1776239449949-ygljai', alt: 'AI handbag editorial studio scene.' },
      { subCategory: 'Accessories', imageId: '1776239826550-uaopmt', alt: 'AI accessory editorial.' },
      { subCategory: 'Eyewear',     imageId: '1776102176417-iih747', alt: 'AI eyewear candy flash editorial.' },
      { subCategory: 'Watches',     imageId: '1776664933175-rjlbn6', alt: 'AI watch editorial.' },
    ],
  },

  // ─────────────────────────────────────── 7. HOME & FURNITURE
  {
    slug: 'home-furniture',
    url: `${BASE}/home-furniture`,
    groupName: 'Home & Furniture',
    seoTitle: 'AI Product Photography for Home Decor & Furniture Brands | VOVV.AI',
    metaDescription:
      'Create AI product photography for home decor and furniture brands. Generate styled interiors, room scenes, catalog visuals, lifestyle images, and product page photos.',
    h1Lead: 'AI Product Photography',
    h1Highlight: 'for Home Decor & Furniture Brands',
    heroEyebrow: 'Home · Furniture · Decor',
    heroSubheadline:
      'Place home decor and furniture products into realistic interiors, styled rooms, lifestyle scenes, catalog visuals, and product page images.',
    primaryKeyword: 'AI home decor product photography',
    secondaryKeywords: [
      'home decor product photography',
      'furniture product photography',
      'homeware product photography',
      'interior product photography',
      'AI furniture product photography',
    ],
    longTailKeywords: [
      'AI product photography for home decor brands',
      'AI furniture lifestyle photos',
      'generate interior product photos with AI',
      'product photos for candles vases and decor',
    ],
    subcategories: ['Home Decor', 'Furniture', 'Vases', 'Candles', 'Lighting', 'Tables', 'Chairs', 'Sofas', 'Styled Interiors'],
    painPoints: [
      'Home products need scale, material realism, interior context, and atmosphere.',
      'Furniture and decor often sell better in styled rooms, not isolated product shots.',
      'Brands need PDP photos, lifestyle inspiration, Pinterest-style visuals, ads, and catalog consistency.',
      'Producing in-context interior photography traditionally requires set design and location budgets.',
    ],
    visualOutputs: [
      { title: 'Styled interior scenes', text: 'Real-feeling interiors that show product in context.',  icon: 'sparkles' },
      { title: 'Home decor lifestyle',   text: 'Inspiration-led lifestyle visuals.',                    icon: 'image' },
      { title: 'Furniture room shots',   text: 'Living, dining, and bedroom scenes.',                   icon: 'layout-template' },
      { title: 'Catalog product photos', text: 'Crisp catalog-ready PDP images.',                       icon: 'shopping-bag' },
      { title: 'Pinterest-style images', text: 'Vertical inspiration imagery.',                         icon: 'instagram' },
      { title: 'Detail texture shots',   text: 'Macro material and finish details.',                    icon: 'zoom-in' },
      { title: 'Website banners',        text: 'Hero banners and collection covers.',                   icon: 'rocket' },
      { title: 'Seasonal home campaigns', text: 'Visuals tuned for every season.',                      icon: 'calendar' },
    ],
    sceneExamples: [
      { label: 'Front Object Hero',          category: 'Editorial Object Studio',          imageId: '1776588678988-75liue', collectionLabel: 'Home Decor', subCategory: 'Editorial Object Studio',          alt: 'AI home decor product photography example: editorial front object hero.' },
      { label: 'Console Placement Story',    category: 'Console / Table / Shelf Lifestyle', imageId: '1776588674825-uxohrz', collectionLabel: 'Home Decor', subCategory: 'Console / Table / Shelf Lifestyle', alt: 'AI home decor product photography example: console placement lifestyle story.' },
      { label: 'Color Wall Decor Hero',      category: 'Aesthetic Color Decor Stories',    imageId: '1776588673759-kwlh8f', collectionLabel: 'Home Decor', subCategory: 'Aesthetic Color Decor Stories',    alt: 'AI home decor product photography example: aesthetic color wall decor hero.' },
      { label: 'Paired Objects Composition', category: 'Grouped Styling Still Life',       imageId: '1776588689035-qt6ivw', collectionLabel: 'Home Decor', subCategory: 'Grouped Styling Still Life',       alt: 'AI home decor product photography example: grouped styling still life.' },
      { label: 'Color Wall Room Hero',       category: 'Aesthetic Color Furniture Stories', imageId: '1776250517893-zqvyrr', collectionLabel: 'Furniture', subCategory: 'Aesthetic Color Furniture Stories', alt: 'AI furniture product photography example: aesthetic color wall room hero.' },
      { label: 'Front Room Hero',            category: 'Editorial Room Heroes',            imageId: '1776250523409-wvjm1w', collectionLabel: 'Furniture', subCategory: 'Editorial Room Heroes',            alt: 'AI furniture product photography example: editorial front room hero.' },
      { label: 'Lived-In Room Story',        category: 'Lived-In Interior Lifestyle',      imageId: '1776250524299-apb70u', collectionLabel: 'Furniture', subCategory: 'Lived-In Interior Lifestyle',      alt: 'AI furniture product photography example: lived-in interior room story.' },
      { label: 'Sunny Shadows',              category: 'Creative Shots',                   imageId: '1776857945899-t4cmfo', collectionLabel: 'Furniture', subCategory: 'Creative Shots',                   alt: 'AI furniture product photography example: sunny shadows creative shot.' },
    ],
    useCases: [
      { title: 'Shopify product pages',   text: 'PDP-ready in-context visuals.',                       icon: 'shopping-bag' },
      { title: 'Pinterest content',       text: 'Inspiration-led vertical imagery.',                   icon: 'instagram' },
      { title: 'Meta and Google Ads',     text: 'Ad variants for performance testing.',                icon: 'megaphone' },
      { title: 'Catalog consistency',     text: 'Unified look across hundreds of SKUs.',               icon: 'layout-grid' },
      { title: 'Seasonal home campaigns', text: 'Refresh visuals for every season.',                   icon: 'calendar' },
      { title: 'Email banners',           text: 'Hero imagery for CRM flows.',                         icon: 'mail' },
    ],
    faqs: [
      { q: 'Can AI create home decor product photos?',              a: 'Yes. Generate PDP shots, styled interiors, and lifestyle visuals for decor and furniture brands.' },
      { q: 'Can VOVV.AI place furniture into realistic interiors?', a: 'Yes — modern, minimal, Japandi, and a wide range of interior moods are supported.' },
      { q: 'Can I create styled room scenes for home products?',    a: 'Yes. Living, dining, bedroom, and outdoor scenes are all available.' },
      { q: 'Can AI preserve materials like wood, fabric, ceramic, and metal?', a: 'VOVV.AI is built to preserve material finish and texture. Always review final visuals.' },
      { q: 'Can I create Pinterest-style visuals for home decor?',  a: 'Yes — vertical inspiration imagery is a core output for this category.' },
    ],
    relatedCategories: ['fragrance', 'food-beverage', 'electronics-gadgets'],
    heroImageId: '1776250523409-wvjm1w',
    heroAlt: 'AI home decor product photography example showing furniture in an editorial front room hero scene.',
    heroNoun: 'piece',
  },

  // ─────────────────────────────────────── 8. FOOD & BEVERAGE
  {
    slug: 'food-beverage',
    url: `${BASE}/food-beverage`,
    groupName: 'Food & Beverage',
    seoTitle: 'AI Product Photography for Food & Beverage Brands | VOVV.AI',
    metaDescription:
      'Create AI food and beverage product photography. Generate packaged food visuals, snack scenes, bottle photos, can visuals, CPG campaign content, ads, and ecommerce images.',
    h1Lead: 'AI Product Photography',
    h1Highlight: 'for Food & Beverage Brands',
    heroEyebrow: 'Food · Beverage · CPG',
    heroSubheadline:
      'Create packaged food visuals, beverage product photos, snack scenes, bottle images, can visuals, and CPG campaign content from one product photo.',
    primaryKeyword: 'AI food product photography',
    secondaryKeywords: [
      'food product photography',
      'beverage product photography',
      'packaged food photography',
      'CPG product photography',
      'bottle product photography',
      'can product photography',
    ],
    longTailKeywords: [
      'AI product photography for food brands',
      'snack product photography for ecommerce',
      'AI packaged food product photos',
      'beverage product photos for ecommerce',
    ],
    subcategories: ['Food', 'Snacks', 'Beverages', 'Bottles', 'Cans', 'Jars', 'Packaged Food', 'Ingredient Props', 'Splash & Ice'],
    painPoints: [
      'Food and beverage visuals need packaging accuracy, appetizing styling, label readability, and channel consistency.',
      'Bottles and cans need condensation, splash, ice, reflections, and clean labels.',
      'CPG brands need fast visuals across seasonal launches, ads, and social.',
      'Production for splash, ice, and ingredient styling is hard to schedule and expensive to repeat.',
    ],
    visualOutputs: [
      { title: 'Packaged food images',     text: 'Crisp PDP-ready packaging visuals.',          icon: 'shopping-bag' },
      { title: 'Snack lifestyle',          text: 'In-the-moment snack scenes.',                 icon: 'sparkles' },
      { title: 'Beverage bottle photos',   text: 'Premium bottle hero visuals.',                icon: 'image' },
      { title: 'Can with condensation',    text: 'Cold can scenes with realistic frost.',       icon: 'zoom-in' },
      { title: 'Ingredient prop scenes',   text: 'Hero ingredients styled around the product.', icon: 'layout-template' },
      { title: 'Kitchen lifestyle',        text: 'In-context kitchen storytelling.',            icon: 'camera' },
      { title: 'Social ad creatives',      text: 'Performance-ready ad variants.',              icon: 'instagram' },
      { title: 'CPG campaigns',            text: 'Seasonal and launch campaign visuals.',       icon: 'rocket' },
    ],
    sceneExamples: [
      { label: 'Citrus Impact Packshot',     category: 'Editorial Drink Studio',           imageId: '1776758447403-iisf5e', collectionLabel: 'Beverages', subCategory: 'Editorial Drink Studio',           alt: 'AI beverage product photography example: editorial citrus impact packshot.' },
      { label: 'Solar Tangerine Wall Hero',  category: 'Aesthetic Color Beverage Stories', imageId: '1776240349610-59fbt7', collectionLabel: 'Beverages', subCategory: 'Aesthetic Color Beverage Stories', alt: 'AI beverage product photography example: aesthetic color wall hero.' },
      { label: 'Fruit Bed Product Still',    category: 'Fruit / Pour / Surface Still Life', imageId: '1776240326687-r572bp', collectionLabel: 'Beverages', subCategory: 'Fruit / Pour / Surface Still Life', alt: 'AI beverage product photography example: fruit bed surface still life.' },
      { label: 'Sunlit Street Sip',          category: 'Social Lifestyle / Sport / Party UGC', imageId: '1776758468455-vbo4m1', collectionLabel: 'Beverages', subCategory: 'Social Lifestyle / Sport / Party UGC', alt: 'AI beverage product photography example: social lifestyle sunlit street sip.' },
      { label: 'Front Hero Snack Portrait',  category: 'Editorial Snack Product Studio',   imageId: '1776246644962-e8u3sy', collectionLabel: 'Snacks',    subCategory: 'Editorial Snack Product Studio',   alt: 'AI food product photography example: editorial front hero snack portrait.' },
      { label: 'Color Surface Snack Still',  category: 'Aesthetic Color Snack Stories',    imageId: '1776246637687-58l7js', collectionLabel: 'Snacks',    subCategory: 'Aesthetic Color Snack Stories',    alt: 'AI food product photography example: aesthetic color snack still.' },
      { label: 'Handheld Snack Hero',        category: 'Handheld / Eating Editorial',      imageId: '1776246646982-zm058p', collectionLabel: 'Snacks',    subCategory: 'Handheld / Eating Editorial',      alt: 'AI food product photography example: handheld eating editorial.' },
      { label: 'Daily Tabletop Snack Story', category: 'Tabletop / Pantry / Daily UGC',    imageId: '1776246639634-bta8qj', collectionLabel: 'Snacks',    subCategory: 'Tabletop / Pantry / Daily UGC',    alt: 'AI food product photography example: daily tabletop snack story.' },
    ],
    useCases: [
      { title: 'Shopify product pages',  text: 'PDP-ready packaging shots.',                          icon: 'shopping-bag' },
      { title: 'Amazon listings',        text: 'Marketplace-ready creative.',                         icon: 'layout-grid' },
      { title: 'Meta and TikTok ads',    text: 'High-CTR variants for CPG performance.',              icon: 'megaphone' },
      { title: 'Email banners',          text: 'Promo hero imagery.',                                 icon: 'mail' },
      { title: 'Seasonal campaigns',     text: 'Refresh visuals for every drop and season.',          icon: 'calendar' },
      { title: 'Trade and PR',           text: 'Press-ready hero visuals.',                           icon: 'camera' },
    ],
    faqs: [
      { q: 'Can AI create food product photos?',                            a: 'Yes. Generate packaged food visuals, snack scenes, kitchen lifestyles, and CPG campaign imagery.' },
      { q: 'Can VOVV.AI preserve food packaging and labels?',               a: 'VOVV.AI is built to preserve label artwork, packaging shape, and material finish. Always review final visuals.' },
      { q: 'Can I create beverage photos with ice, splash, and condensation?', a: 'Yes — beverage realism including frost, ice, and splash is core to the output.' },
      { q: 'Can AI create CPG product campaign visuals?',                   a: 'Yes. Generate seasonal launches, hero banners, and ad variants in minutes.' },
      { q: 'Can I create ecommerce images for snacks, bottles, and cans?',  a: 'Yes — sized for Shopify, Amazon, and DTC marketplaces.' },
    ],
    relatedCategories: ['supplements-wellness', 'home-furniture', 'beauty-skincare'],
    heroImageId: '1776758447403-iisf5e',
    heroAlt: 'AI food and beverage product photography example showing an editorial citrus drink packshot.',
    heroNoun: 'product',
  },

  // ─────────────────────────────────────── 9. SUPPLEMENTS & WELLNESS
  {
    slug: 'supplements-wellness',
    url: `${BASE}/supplements-wellness`,
    groupName: 'Supplements & Wellness',
    seoTitle: 'AI Product Photography for Supplement & Wellness Brands | VOVV.AI',
    metaDescription:
      'Create AI product photography for supplement and wellness brands. Generate vitamin bottle images, protein tub photos, wellness lifestyle scenes, fitness visuals, ads, and ecommerce content.',
    h1Lead: 'AI Product Photography',
    h1Highlight: 'for Supplement & Wellness Brands',
    heroEyebrow: 'Supplements · Wellness · Fitness',
    heroSubheadline:
      'Create supplement product photos, wellness lifestyle scenes, vitamin imagery, protein visuals, fitness content, and clean ecommerce images from one product photo.',
    primaryKeyword: 'AI supplement product photography',
    secondaryKeywords: [
      'supplement product photography',
      'wellness product photography',
      'vitamin product photography',
      'protein product photography',
      'health product photography',
    ],
    longTailKeywords: [
      'AI product photography for supplement brands',
      'AI vitamin product photos',
      'wellness product photos for Shopify',
      'protein powder product photography AI',
    ],
    subcategories: ['Supplements', 'Vitamins', 'Protein Tubs', 'Wellness Products', 'Capsules', 'Powders', 'Pouches', 'Fitness Scenes'],
    painPoints: [
      'Supplements need clean, trustworthy, health-focused visuals.',
      'Packaging labels, bottles, tubs, pouches, capsules, powders, and claims must be reviewed carefully.',
      'Brands need PDP photos, lifestyle scenes, fitness content, wellness routines, ads, and email visuals.',
      'Repeating product shoots for every flavor, SKU, and size adds up fast.',
    ],
    visualOutputs: [
      { title: 'Vitamin bottle images',  text: 'Crisp PDP-ready bottle visuals.',                    icon: 'shopping-bag' },
      { title: 'Protein tub visuals',    text: 'Hero shots for tubs and pouches.',                   icon: 'image' },
      { title: 'Wellness lifestyle',     text: 'Calm, premium routine scenes.',                      icon: 'sparkles' },
      { title: 'Fitness campaigns',      text: 'High-energy training scenes.',                       icon: 'rocket' },
      { title: 'Kitchen routine',        text: 'Morning routine and prep moments.',                  icon: 'camera' },
      { title: 'Capsule & powder detail', text: 'Macro detail of supplement form.',                  icon: 'zoom-in' },
      { title: 'Clean PDP images',       text: 'E-commerce-ready product photos.',                   icon: 'layout-grid' },
      { title: 'Social ad creatives',    text: 'Performance-ready ad variants.',                     icon: 'instagram' },
    ],
    sceneExamples: [
      { label: 'Front View',                category: 'Essential Shots',                imageId: '1776247484304-xpwv5f', collectionLabel: 'Supplements & Wellness', subCategory: 'Essential Shots',                alt: 'AI supplement product photography example: clean essential PDP front view.' },
      { label: 'Morning Counter Ritual',    category: 'Editorial Wellness Routine',     imageId: '1776247491181-ox42m3', collectionLabel: 'Supplements & Wellness', subCategory: 'Editorial Wellness Routine',     alt: 'AI supplement product photography example: editorial morning counter ritual.' },
      { label: 'Color Counter Ritual',      category: 'Aesthetic Color Wellness Stories', imageId: '1776247477107-2sx6jy', collectionLabel: 'Supplements & Wellness', subCategory: 'Aesthetic Color Wellness Stories', alt: 'AI supplement product photography example: aesthetic color counter ritual.' },
      { label: 'Powder and Scoop Still',    category: 'Ingredient / Capsule Still Life', imageId: '1776247494837-xnpgly', collectionLabel: 'Supplements & Wellness', subCategory: 'Ingredient / Capsule Still Life', alt: 'AI supplement product photography example: powder and scoop still life.' },
      { label: 'Kitchen Counter Daily Use', category: 'Kitchen / Gym / Daily UGC',      imageId: '1776247488148-hdz2kj', collectionLabel: 'Supplements & Wellness', subCategory: 'Kitchen / Gym / Daily UGC',      alt: 'AI supplement product photography example: kitchen counter daily use UGC.' },
      { label: 'Warm Neutral Studio',       category: 'Creative Shots',                 imageId: '1776856589768-ldrmt8', collectionLabel: 'Supplements & Wellness', subCategory: 'Creative Shots',                 alt: 'AI supplement product photography example: warm neutral studio creative shot.' },
      { label: 'Editorial Routine Hero',    category: 'Editorial Wellness Routine',     imageId: '1776247491181-ox42m3', collectionLabel: 'Supplements & Wellness', subCategory: 'Editorial Wellness Routine',     alt: 'AI supplement product photography example: editorial wellness routine hero.' },
      { label: 'Capsule Still Life',        category: 'Ingredient / Capsule Still Life', imageId: '1776247494837-xnpgly', collectionLabel: 'Supplements & Wellness', subCategory: 'Ingredient / Capsule Still Life', alt: 'AI supplement product photography example: capsule still life detail.' },
    ],
    useCases: [
      { title: 'Shopify product pages',   text: 'PDP shots and alternates.',                       icon: 'shopping-bag' },
      { title: 'Meta and TikTok ads',     text: 'High-CTR creative for performance.',              icon: 'megaphone' },
      { title: 'Subscription CRM',        text: 'On-brand banners for renewal flows.',             icon: 'mail' },
      { title: 'Fitness content',         text: 'Always-on training and routine content.',         icon: 'instagram' },
      { title: 'Seasonal launches',       text: 'Refresh visuals for new flavors and SKUs.',       icon: 'calendar' },
      { title: 'Catalog consistency',     text: 'Unified look across the supplement line.',        icon: 'layout-grid' },
    ],
    faqs: [
      { q: 'Can AI create supplement product photos?',           a: 'Yes. Generate clean PDP shots, lifestyle visuals, fitness scenes, and ad-ready imagery for supplement brands.' },
      { q: 'Can VOVV.AI preserve supplement labels?',            a: 'VOVV.AI is built to preserve label artwork and packaging shape. Always review final visuals before publishing.' },
      { q: 'Can I create wellness lifestyle visuals?',           a: 'Yes — calm routine scenes, kitchen prep, and wellness storytelling are all supported.' },
      { q: 'Can I create product photos for vitamins and protein tubs?', a: 'Yes — bottles, tubs, pouches, capsules, and powders are all supported.' },
      { q: 'Can I use AI visuals for supplement ads and ecommerce?', a: 'Yes. Output is sized for Shopify PDPs, ad placements, and CRM banners.' },
    ],
    relatedCategories: ['food-beverage', 'beauty-skincare', 'home-furniture'],
    heroImageId: '1776247491181-ox42m3',
    heroAlt: 'AI supplement product photography example showing an editorial morning wellness routine.',
    heroNoun: 'product',
  },

  // ─────────────────────────────────────── 10. ELECTRONICS & GADGETS
  {
    slug: 'electronics-gadgets',
    url: `${BASE}/electronics-gadgets`,
    groupName: 'Electronics & Gadgets',
    seoTitle: 'AI Product Photography for Electronics & Gadget Brands | VOVV.AI',
    metaDescription:
      'Create AI product photography for electronics, gadgets, tech devices, phone cases, headphones, and smart products. Generate launch visuals, desk setups, ads, and ecommerce images.',
    h1Lead: 'AI Product Photography',
    h1Highlight: 'for Electronics & Gadget Brands',
    heroEyebrow: 'Electronics · Gadgets · Tech',
    heroSubheadline:
      'Create tech product photos, gadget visuals, device launch content, desk setups, clean ecommerce images, and ad-ready visuals from one product photo.',
    primaryKeyword: 'AI electronics product photography',
    secondaryKeywords: [
      'electronics product photography',
      'gadget product photography',
      'tech product photography',
      'device product photography',
      'AI gadget product photography',
    ],
    longTailKeywords: [
      'AI product photography for tech brands',
      'electronics product photography for ecommerce',
      'device product photos for Shopify',
      'tech accessory product photography AI',
    ],
    subcategories: ['Electronics', 'Gadgets', 'Tech Devices', 'Phone Cases', 'Headphones', 'Smart Devices', 'Desk Setups', 'Launch Visuals'],
    painPoints: [
      'Tech visuals need clean surfaces, sharp edges, reflections, screens, and premium launch styling.',
      'Gadgets often need desk setups, lifestyle use cases, and clean PDP shots.',
      'Tech brands need launch creative, social ads, banners, and catalog consistency.',
      'Hard surfaces, glass, and screens are difficult to light and retouch consistently.',
    ],
    visualOutputs: [
      { title: 'Clean tech images',       text: 'Crisp PDP-ready angles for every SKU.',          icon: 'shopping-bag' },
      { title: 'Gadget desk setups',      text: 'Lifestyle desk scenes that show context.',       icon: 'image' },
      { title: 'Device launch hero',      text: 'Premium hero visuals for new launches.',         icon: 'rocket' },
      { title: 'Headphone lifestyle',     text: 'On-ear and lifestyle scenes.',                   icon: 'sparkles' },
      { title: 'Phone case product page', text: 'Clean PDP visuals for cases and accessories.',   icon: 'layout-grid' },
      { title: 'Smart device campaigns',  text: 'Story-driven smart product imagery.',            icon: 'camera' },
      { title: 'Detail close-ups',        text: 'Macro shots of edges, ports, and finishes.',     icon: 'zoom-in' },
      { title: 'Social ad creatives',     text: 'Performance-ready ad variations.',               icon: 'instagram' },
    ],
    sceneExamples: [
      { label: 'Front Tech Hero',          category: 'Editorial Tech Studio',           imageId: '1776250225810-gdcnka', collectionLabel: 'Tech / Devices', subCategory: 'Editorial Tech Studio',           alt: 'AI electronics product photography example: editorial front tech hero.' },
      { label: 'Color Wall Tech Hero',     category: 'Aesthetic Color Tech Stories',    imageId: '1776590052780-j2ahu2', collectionLabel: 'Tech / Devices', subCategory: 'Aesthetic Color Tech Stories',    alt: 'AI electronics product photography example: aesthetic color wall tech hero.' },
      { label: 'In-Hand Tech Hero',        category: 'Desk / Hand / Daily Use UGC',     imageId: '1776590053673-96gw3b', collectionLabel: 'Tech / Devices', subCategory: 'Desk / Hand / Daily Use UGC',     alt: 'AI electronics product photography example: in-hand tech hero UGC.' },
      { label: 'Desk Surface Tech Still',  category: 'Surface / Setup / Product Still Life', imageId: '1776250220160-yzxngj', collectionLabel: 'Tech / Devices', subCategory: 'Surface / Setup / Product Still Life', alt: 'AI electronics product photography example: desk surface tech still life.' },
      { label: 'Front View',               category: 'Essential Shots',                 imageId: '1776250227186-ipm40h', collectionLabel: 'Tech / Devices', subCategory: 'Essential Shots',                 alt: 'AI electronics product photography example: clean essential PDP front view.' },
      { label: 'Tech Studio Hero',         category: 'Editorial Tech Studio',           imageId: '1776250225810-gdcnka', collectionLabel: 'Tech / Devices', subCategory: 'Editorial Tech Studio',           alt: 'AI electronics product photography example: editorial tech studio hero.' },
      { label: 'Daily Use Setup',          category: 'Desk / Hand / Daily Use UGC',     imageId: '1776590053673-96gw3b', collectionLabel: 'Tech / Devices', subCategory: 'Desk / Hand / Daily Use UGC',     alt: 'AI electronics product photography example: daily use desk setup.' },
      { label: 'Color Story Tech',         category: 'Aesthetic Color Tech Stories',    imageId: '1776590052780-j2ahu2', collectionLabel: 'Tech / Devices', subCategory: 'Aesthetic Color Tech Stories',    alt: 'AI electronics product photography example: aesthetic color story tech.' },
    ],
    useCases: [
      { title: 'Shopify product pages', text: 'PDP visuals and alternates.',                          icon: 'shopping-bag' },
      { title: 'Meta and Google Ads',   text: 'High-CTR creative for performance.',                   icon: 'megaphone' },
      { title: 'Launch campaigns',      text: 'Drop-day creative for new devices.',                   icon: 'rocket' },
      { title: 'Email banners',         text: 'On-brand hero imagery for CRM.',                       icon: 'mail' },
      { title: 'Catalog consistency',   text: 'Unified look across hundreds of SKUs.',                icon: 'layout-grid' },
      { title: 'Trade & PR',            text: 'Press-ready hero visuals.',                            icon: 'camera' },
    ],
    faqs: [
      { q: 'Can AI create electronics product photos?',           a: 'Yes. Generate clean PDP visuals, desk setups, launch heroes, and ad-ready creative from one product photo.' },
      { q: 'Can VOVV.AI create gadget launch visuals?',           a: 'Yes. Premium launch hero imagery is core to the electronics output.' },
      { q: 'Can AI preserve device shape, edges, and details?',   a: 'VOVV.AI is built to preserve hard-surface geometry, edges, and finishes. Always review final visuals.' },
      { q: 'Can I create desk setup scenes for tech products?',   a: 'Yes — desk lifestyle scenes are a primary output for this category.' },
      { q: 'Can I create ecommerce images for phone cases, headphones, and devices?', a: 'Yes — all common tech accessories are supported.' },
    ],
    relatedCategories: ['home-furniture', 'bags-accessories', 'food-beverage'],
    heroImageId: '1776250225810-gdcnka',
    heroAlt: 'AI electronics product photography example showing an editorial tech studio hero shot.',
    heroNoun: 'device',
  },
];

export function getCategoryPage(slug: string): CategoryPage | undefined {
  return aiProductPhotographyCategoryPages.find((p) => p.slug === slug);
}

export function getRelatedPages(slugs: string[]): CategoryPage[] {
  return slugs
    .map((s) => aiProductPhotographyCategoryPages.find((p) => p.slug === s))
    .filter((p): p is CategoryPage => Boolean(p));
}
