/**
 * Single source of truth for the 10 SEO category hub pages under
 * /ai-product-photography/{slug}. The dynamic page template
 * (src/pages/seo/AIProductPhotographyCategory.tsx) renders every page from
 * this data — do not hand-roll per-category pages.
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

export interface SceneExample {
  label: string;
  category: string;
  imageId: string;
  alt: string;
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
  h1Lead: string;        // smaller, dark line
  h1Highlight: string;   // larger, slate accent line (matches PhotographyHero pattern)
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
  relatedCategories: string[]; // slugs
  heroImageId: string;
  heroAlt: string;
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
      'Activewear & Sportswear', 'Swimwear', 'Lingerie',
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
      { label: 'Minimal Studio Flatlay',     category: 'Studio',     imageId: '1776691909999-ra3rym',  alt: 'AI fashion product photography example: minimal studio flatlay for a clothing brand.' },
      { label: 'Editorial Campaign',         category: 'Editorial',  imageId: '1776691906436-3fe7l9',  alt: 'AI fashion product photography example: editorial model-style campaign image.' },
      { label: 'Streetwear Hoodie Scene',    category: 'Streetwear', imageId: '1776691907477-77vt46',  alt: 'AI fashion product photography example: streetwear hoodie in an urban scene.' },
      { label: 'Denim Lifestyle',            category: 'Lifestyle',  imageId: '1776691911049-gsxycu',  alt: 'AI fashion product photography example: denim styled in a lifestyle visual.' },
      { label: 'Activewear Fitness',         category: 'Activewear', imageId: '1776690212460-cq4xnb',  alt: 'AI fashion product photography example: activewear in a fitness scene.' },
      { label: 'Summer Swimwear Campaign',   category: 'Seasonal',   imageId: '1776524131703-gvh4bb',  alt: 'AI fashion product photography example: summer swimwear campaign visual.' },
      { label: 'Jacket Outdoor Scene',       category: 'Outdoor',    imageId: '1776574208384-fmg2u3',  alt: 'AI fashion product photography example: jacket in an outdoor lifestyle scene.' },
      { label: 'Fabric Detail Close-up',     category: 'Detail',     imageId: '1776691912818-yiu2uq',  alt: 'AI fashion product photography example: macro fabric texture close-up.' },
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
    heroImageId: '1776691909999-ra3rym',
    heroAlt: 'AI fashion product photography example showing clothing in an editorial lifestyle scene.',
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
      { label: 'Clean White Studio Shot',  category: 'Studio',     imageId: '1776770345914-cg8uyy',                            alt: 'AI footwear product photography example: clean white studio shoe shot.' },
      { label: 'Sneaker Streetwear',       category: 'Streetwear', imageId: '1776691907477-77vt46',                            alt: 'AI footwear product photography example: sneaker in a streetwear scene.' },
      { label: 'Athletic Training',        category: 'Activewear', imageId: '1776690212460-cq4xnb',                            alt: 'AI footwear product photography example: athletic shoe in a training scene.' },
      { label: 'Boot Outdoor Lifestyle',   category: 'Outdoor',    imageId: '1776574208384-fmg2u3',                            alt: 'AI footwear product photography example: boot in an outdoor lifestyle scene.' },
      { label: 'Luxury High Heel',         category: 'Editorial',  imageId: '1776691912818-yiu2uq',                            alt: 'AI footwear product photography example: luxury high heel editorial visual.' },
      { label: 'Hard Shadow Hero',         category: 'Studio',     imageId: 'hard-shadow-shoes-sneakers-1776008136691',        alt: 'AI footwear product photography example: hard shadow hero shoe shot.' },
      { label: 'Floating Product Hero',    category: 'Studio',     imageId: '1776770347820-s3qwmr',                            alt: 'AI footwear product photography example: floating sneaker hero shot.' },
      { label: 'Urban Pavement Sneaker',   category: 'Streetwear', imageId: '1776691906436-3fe7l9',                            alt: 'AI footwear product photography example: sneaker on urban pavement.' },
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
    heroImageId: '1776770345914-cg8uyy',
    heroAlt: 'AI footwear product photography example showing a sneaker in a streetwear campaign scene.',
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
      { label: 'Serum Bottle Bathroom',   category: 'Lifestyle',  imageId: 'aesthetic-beauty-closeup-eyewear-1776148096014',     alt: 'AI skincare product photography example: serum bottle in a clean bathroom scene.' },
      { label: 'Cream Jar on Marble',     category: 'Studio',     imageId: '1776102176417-iih747',                                alt: 'AI skincare product photography example: cream jar on a marble counter.' },
      { label: 'Lipstick Editorial',      category: 'Editorial',  imageId: 'beauty-closeup-oversized-eyewear-1776150210659',     alt: 'AI cosmetic product photography example: lipstick editorial close-up.' },
      { label: 'Makeup Flatlay',          category: 'Flatlay',    imageId: '1776691909999-ra3rym',                                alt: 'AI cosmetic product photography example: makeup flatlay layout.' },
      { label: 'Spa-Inspired Skincare',   category: 'Lifestyle',  imageId: '1776856604775-kxc92a',                                alt: 'AI skincare product photography example: spa-inspired routine scene.' },
      { label: 'Clean White PDP',         category: 'Studio',     imageId: '1776770347820-s3qwmr',                                alt: 'AI skincare product photography example: clean white product page image.' },
      { label: 'Texture Macro',           category: 'Detail',     imageId: '1776691912818-yiu2uq',                                alt: 'AI cosmetic product photography example: macro texture shot.' },
      { label: 'Beauty Campaign Hero',    category: 'Campaign',   imageId: '1776691906436-3fe7l9',                                alt: 'AI beauty product photography example: campaign hero image.' },
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
    heroImageId: 'aesthetic-beauty-closeup-eyewear-1776148096014',
    heroAlt: 'AI skincare product photography example showing a serum bottle in a clean beauty scene.',
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
      { title: 'Editorial scent stories',text: 'Mood-driven editorial scenes that sell the feeling.',   icon: 'camera' },
      { title: 'Glass bottle close-ups', text: 'Macro details on glass, caps, and labels.',             icon: 'zoom-in' },
      { title: 'Social ad creatives',    text: 'Performance-ready ad variants.',                        icon: 'instagram' },
      { title: 'Website banners',        text: 'Hero banners and collection covers.',                   icon: 'layout-template' },
    ],
    sceneExamples: [
      { label: 'Marble Luxury',           category: 'Editorial',  imageId: 'near-face-hold-fragrance-1776013185169',          alt: 'AI perfume product photography example: luxury marble fragrance scene.' },
      { label: 'Golden Hour Campaign',    category: 'Campaign',   imageId: '1776574228066-oyklfz',                            alt: 'AI perfume product photography example: golden hour fragrance campaign.' },
      { label: 'Minimal Glass Studio',    category: 'Studio',     imageId: 'repeated-shadow-grid-fragrance-1776013389735',    alt: 'AI perfume product photography example: minimal glass bottle studio shot.' },
      { label: 'Gift Set Holiday',        category: 'Seasonal',   imageId: '1776018020221-aehe8n',                            alt: 'AI perfume product photography example: gift set holiday visual.' },
      { label: 'Floral Fragrance',        category: 'Lifestyle',  imageId: '1776524131703-gvh4bb',                            alt: 'AI perfume product photography example: floral fragrance scene.' },
      { label: 'Dark Luxury Editorial',   category: 'Editorial',  imageId: '1776018038709-gmt0eg',                            alt: 'AI perfume product photography example: dark luxury editorial image.' },
      { label: 'Bathroom Vanity',         category: 'Lifestyle',  imageId: '1776856604775-kxc92a',                            alt: 'AI perfume product photography example: bathroom vanity fragrance shot.' },
      { label: 'Wide Campaign Banner',    category: 'Banner',     imageId: '1776574255634-kmhz9g',                            alt: 'AI perfume product photography example: wide campaign banner.' },
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
    heroImageId: 'near-face-hold-fragrance-1776013185169',
    heroAlt: 'AI perfume product photography example showing a fragrance bottle in a luxury campaign setup.',
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
      { label: 'Gold Ring Macro',         category: 'Detail',     imageId: '1776102176417-iih747',  alt: 'AI jewelry product photography example: gold ring macro detail.' },
      { label: 'Earrings Editorial',      category: 'Editorial',  imageId: '1776691906436-3fe7l9',  alt: 'AI jewelry product photography example: earrings editorial portrait.' },
      { label: 'Necklace Editorial',      category: 'Editorial',  imageId: '1776691911049-gsxycu',  alt: 'AI jewelry product photography example: necklace editorial scene.' },
      { label: 'Bracelet Wrist',          category: 'Lifestyle',  imageId: '1776691907477-77vt46',  alt: 'AI jewelry product photography example: bracelet wrist shot.' },
      { label: 'Minimal White PDP',       category: 'Studio',     imageId: '1776770347820-s3qwmr',  alt: 'AI jewelry product photography example: minimal white product page image.' },
      { label: 'Velvet Luxury',           category: 'Luxury',     imageId: '1776018020221-aehe8n',  alt: 'AI jewelry product photography example: luxury velvet jewelry scene.' },
      { label: 'Diamond Close-up',        category: 'Detail',     imageId: '1776691912818-yiu2uq',  alt: 'AI jewelry product photography example: diamond close-up.' },
      { label: 'Campaign Hero',           category: 'Campaign',   imageId: '1776574228066-oyklfz',  alt: 'AI jewelry product photography example: campaign hero image.' },
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
    heroImageId: '1776102176417-iih747',
    heroAlt: 'AI jewelry product photography example showing a ring in a close-up editorial scene.',
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
      { label: 'Luxury Handbag Editorial', category: 'Editorial', imageId: '1776856613338-h5sdvq',                                alt: 'AI bag product photography example: luxury handbag editorial scene.' },
      { label: 'Backpack Travel',          category: 'Lifestyle', imageId: '1776574208384-fmg2u3',                                alt: 'AI bag product photography example: backpack travel lifestyle visual.' },
      { label: 'Wallet Leather Detail',    category: 'Detail',    imageId: '1776691912818-yiu2uq',                                alt: 'AI accessory product photography example: wallet leather detail close-up.' },
      { label: 'Sunglasses Summer',        category: 'Lifestyle', imageId: 'beauty-closeup-oversized-eyewear-1776150210659',     alt: 'AI eyewear product photography example: sunglasses summer scene.' },
      { label: 'Watch Desk Setup',         category: 'Lifestyle', imageId: 'editorial-office-flash-eyewear-1776150153576',       alt: 'AI watch product photography example: watch on a clean desk setup.' },
      { label: 'Hat Streetwear',           category: 'Streetwear',imageId: '1776691907477-77vt46',                                alt: 'AI accessory product photography example: hat streetwear visual.' },
      { label: 'Scarf Fashion Flatlay',    category: 'Flatlay',   imageId: '1776691909999-ra3rym',                                alt: 'AI accessory product photography example: scarf fashion flatlay.' },
      { label: 'Bag PDP Shot',             category: 'Studio',    imageId: '1776770347820-s3qwmr',                                alt: 'AI bag product photography example: clean product page shot.' },
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
    heroImageId: '1776856613338-h5sdvq',
    heroAlt: 'AI handbag product photography example showing a bag in a luxury lifestyle scene.',
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
      { title: 'Seasonal home campaigns',text: 'Visuals tuned for every season.',                       icon: 'calendar' },
    ],
    sceneExamples: [
      { label: 'Vase on Styled Shelf',     category: 'Lifestyle', imageId: '1776856604775-kxc92a',  alt: 'AI home decor product photography example: vase on a styled shelf.' },
      { label: 'Candle on Coffee Table',   category: 'Lifestyle', imageId: '1776856607319-693vtg',  alt: 'AI home decor product photography example: candle on a coffee table.' },
      { label: 'Sofa Modern Living',       category: 'Interior',  imageId: '1776856613338-h5sdvq',  alt: 'AI furniture product photography example: sofa in a modern living room.' },
      { label: 'Chair Minimal Interior',   category: 'Interior',  imageId: '1776691912818-yiu2uq',  alt: 'AI furniture product photography example: chair in a minimal interior.' },
      { label: 'Lighting Warm Room',       category: 'Lifestyle', imageId: '1776018020221-aehe8n',  alt: 'AI home decor product photography example: lighting product in a warm room.' },
      { label: 'Dining Table Scene',       category: 'Interior',  imageId: '1776856609329-7k8ow1',  alt: 'AI furniture product photography example: dining table scene.' },
      { label: 'Japandi Setup',            category: 'Editorial', imageId: '1776770347820-s3qwmr',  alt: 'AI home decor product photography example: Japandi-inspired setup.' },
      { label: 'Furniture Catalog Visual', category: 'Catalog',   imageId: '1776691909999-ra3rym',  alt: 'AI furniture product photography example: catalog visual.' },
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
    heroImageId: '1776856604775-kxc92a',
    heroAlt: 'AI home decor product photography example showing a product in a styled interior.',
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
      { label: 'Snack Bag Kitchen',        category: 'Lifestyle', imageId: '1776596629281-anqgf5',  alt: 'AI food product photography example: snack bag in a kitchen scene.' },
      { label: 'Beverage Can with Ice',    category: 'Beverage',  imageId: '1776856609329-7k8ow1',  alt: 'AI beverage product photography example: can with ice and condensation.' },
      { label: 'Bottle Splash',            category: 'Beverage',  imageId: '1776856607319-693vtg',  alt: 'AI beverage product photography example: bottle splash visual.' },
      { label: 'Packaged Food Flatlay',    category: 'Flatlay',   imageId: '1776691909999-ra3rym',  alt: 'AI food product photography example: packaged food flatlay.' },
      { label: 'Coffee Lifestyle',         category: 'Lifestyle', imageId: '1776856604775-kxc92a',  alt: 'AI beverage product photography example: coffee product lifestyle scene.' },
      { label: 'Jar with Ingredients',     category: 'Editorial', imageId: '1776102176417-iih747',  alt: 'AI food product photography example: jar with ingredient props.' },
      { label: 'Wide Campaign Banner',     category: 'Banner',    imageId: '1776574255634-kmhz9g',  alt: 'AI food and beverage product photography example: wide campaign banner.' },
      { label: 'Clean Ecommerce Image',    category: 'Studio',    imageId: '1776770347820-s3qwmr',  alt: 'AI food product photography example: clean ecommerce product image.' },
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
    heroImageId: '1776596629281-anqgf5',
    heroAlt: 'AI food and beverage product photography example showing packaged products in a lifestyle scene.',
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
      { title: 'Capsule & powder detail',text: 'Macro detail of supplement form.',                   icon: 'zoom-in' },
      { title: 'Clean PDP images',       text: 'E-commerce-ready product photos.',                   icon: 'layout-grid' },
      { title: 'Social ad creatives',    text: 'Performance-ready ad variants.',                     icon: 'instagram' },
    ],
    sceneExamples: [
      { label: 'Morning Routine Bottle',  category: 'Lifestyle', imageId: '1776856607319-693vtg',  alt: 'AI supplement product photography example: vitamin bottle in a morning routine.' },
      { label: 'Protein Tub Gym',         category: 'Fitness',   imageId: '1776690212460-cq4xnb',  alt: 'AI supplement product photography example: protein tub in a gym scene.' },
      { label: 'Wellness Pouch Kitchen',  category: 'Lifestyle', imageId: '1776856604775-kxc92a',  alt: 'AI wellness product photography example: pouch on a kitchen counter.' },
      { label: 'Capsule Detail',          category: 'Detail',    imageId: '1776691912818-yiu2uq',  alt: 'AI supplement product photography example: capsule detail shot.' },
      { label: 'Clean White Image',       category: 'Studio',    imageId: '1776770347820-s3qwmr',  alt: 'AI supplement product photography example: clean white product image.' },
      { label: 'Fitness Campaign',        category: 'Campaign',  imageId: '1776691907477-77vt46',  alt: 'AI supplement product photography example: fitness campaign visual.' },
      { label: 'Healthy Lifestyle Flatlay',category: 'Flatlay',  imageId: '1776691909999-ra3rym',  alt: 'AI wellness product photography example: healthy lifestyle flatlay.' },
      { label: 'Website Banner',          category: 'Banner',    imageId: '1776574255634-kmhz9g',  alt: 'AI supplement product photography example: wellness website banner image.' },
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
    heroImageId: '1776856607319-693vtg',
    heroAlt: 'AI supplement product photography example showing a vitamin bottle in a wellness lifestyle scene.',
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
      { label: 'Headphones Clean Desk',  category: 'Lifestyle', imageId: '1776856609329-7k8ow1',                            alt: 'AI electronics product photography example: headphones on a clean desk.' },
      { label: 'Phone Case PDP',         category: 'Studio',    imageId: '1776770347820-s3qwmr',                            alt: 'AI electronics product photography example: phone case product page image.' },
      { label: 'Gadget Launch Hero',     category: 'Launch',    imageId: '1776856613338-h5sdvq',                            alt: 'AI electronics product photography example: gadget launch hero visual.' },
      { label: 'Smart Device Lifestyle', category: 'Lifestyle', imageId: '1776856604775-kxc92a',                            alt: 'AI electronics product photography example: smart device lifestyle scene.' },
      { label: 'Minimal Tech Studio',    category: 'Studio',    imageId: 'editorial-office-flash-eyewear-1776150153576',   alt: 'AI electronics product photography example: minimal tech studio shot.' },
      { label: 'Screen Reflection',      category: 'Detail',    imageId: '1776691912818-yiu2uq',                            alt: 'AI electronics product photography example: screen reflection detail.' },
      { label: 'Wide Website Banner',    category: 'Banner',    imageId: '1776574255634-kmhz9g',                            alt: 'AI electronics product photography example: wide website banner.' },
      { label: 'Clean Ecommerce Image',  category: 'Studio',    imageId: '1776691909999-ra3rym',                            alt: 'AI electronics product photography example: clean ecommerce image.' },
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
    heroImageId: '1776856609329-7k8ow1',
    heroAlt: 'AI electronics product photography example showing a gadget in a clean desk setup.',
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
