export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqCategory {
  name: string;
  questions: FaqItem[];
}

export const faqCategories: FaqCategory[] = [
  {
    name: 'Getting Started',
    questions: [
      {
        q: 'How do I create my first product image?',
        a: 'Upload your product photo in the Products section, then head to Visual Studio. Choose a Visual Type — Product Visuals, Selfie / UGC, Flat Lay, Mirror Selfie, Interior / Exterior Staging, or Generate More Angles — select your product, and hit Generate. Your images will be ready in about 60 seconds at 2K resolution in PNG format. You can also design a Brand Scene to lock in a signature look and reuse it across every product.',
      },
      {
        q: 'What image formats are supported for uploads?',
        a: 'We accept JPG, PNG, and WebP files. For best results, use images with clean backgrounds and at least 1024×1024 resolution.',
      },
      {
        q: 'Do I need to remove the background from my product photos?',
        a: 'No — our AI handles background removal automatically. However, starting with a clean, well-lit product photo on a simple background will give you the best results.',
      },
      {
        q: 'What is Create with Prompt?',
        a: 'Create with Prompt is our open-ended generation mode. Write any prompt, attach product photos or reference images, apply a Brand Profile and style presets, then generate. It gives you full creative control when none of the standard Visual Types fit your vision.',
      },
      {
        q: 'What is a Brand Profile and why should I create one?',
        a: 'A Brand Profile teaches our AI your visual identity — your preferred colors, lighting style, scenes, tone, color temperature, and composition rules. Once set up, every image you generate across Visual Studio will automatically align with your brand aesthetic. Create one under Brand Profiles in the sidebar.',
      },
    ],
  },
  {
    name: 'Credits & Billing',
    questions: [
      {
        q: 'How do credits work?',
        a: 'Each generation costs credits based on the mode: Product Visuals are 6 credits per image. Brand Scenes generate 3 variations for 20 credits. Brand Model images are 20 credits each (using a public Brand Model is free). Animate video is 25 credits (5s) or 50 credits (10s) — premium motion doubles the base. Start & End video is 35 credits. 4K upscaling is 15 credits. Every new account gets 20 free credits — no credit card required. Your dashboard always shows the exact cost before you generate.',
      },
      {
        q: 'What happens if I run out of credits?',
        a: 'You\'ll see a notification when your credits are running low. You can purchase additional credit packs from Settings > Plans & Credits at any time. Monthly plan credits reset each billing cycle and do not roll over, but top-up credit packs never expire.',
      },
      {
        q: 'Is there a free trial?',
        a: 'Every new account gets 20 free credits — no credit card required. That\'s enough to run your first Visual Type and see the quality before committing to a plan.',
      },
      {
        q: 'Can I change my plan?',
        a: 'Yes, you can upgrade or downgrade your plan at any time from Settings > Plans & Credits. Upgrades take effect immediately. Downgrades take effect at the start of your next billing cycle.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer refunds for unused credit packs purchased within the last 14 days. Monthly plan charges are non-refundable, but you can cancel anytime to prevent future charges. There are no long-term contracts or cancellation fees. Contact hello@vovv.ai for refund requests.',
      },
    ],
  },
  {
    name: 'Visual Studio & Generation',
    questions: [
      {
        q: 'What Visual Types are available?',
        a: 'VOVV.AI offers core Visual Types, each pre-configured with the right prompts, aspect ratios, and model settings: Product Visuals (the flagship 1000+ scenes for any product), Selfie / UGC (user-generated-style content), Flat Lay (top-down product arrangements), Mirror Selfie (casual mirror-style shots), Interior / Exterior Staging (room and environment staging), and Generate More Angles (multi-angle product sets). You can also design your own Brand Scenes and reuse them across every product.',
      },
      {
        q: 'What are Brand Scenes?',
        a: 'A Brand Scene is a custom, reusable scene you design once — either by answering a short brief or by uploading a single reference photo — and then re-apply to any product. Each generation produces 3 variations for 20 credits. Saving the scene is free; reusing it later costs 6 credits per Product Visual. Available on Growth, Pro, and Enterprise plans. Free and Starter users can still generate from any Brand Scenes they previously saved.',
      },
      {
        q: 'Can I reuse a scene with a different product?',
        a: 'Yes. Open any image from your Library or a generation result and click Swap Product. We re-render the exact scene with your new product, preserving lighting, composition, and styling. 6 credits per swap.',
      },
      {
        q: 'What is Generate More Angles?',
        a: 'Generate More Angles creates a cohesive set of branded angles — front, back, sides, and close-ups — from a single source image. The AI detects the environment and lighting from your source photo and ensures all angles match. Costs 6 credits per angle. You select which angles you want before generating.',
      },
      {
        q: 'Can I generate images in bulk?',
        a: 'Yes! Visual Studio supports batch generation for multiple products at once. Select your products, choose a Visual Type, set your quality and count preferences, and let VOVV.AI process them all. You can track progress in the Visual Studio activity section.',
      },
      {
        q: 'What is the Content Calendar?',
        a: 'The Content Calendar automates recurring visual runs. Choose your products, select your Visual Types, and set a schedule (monthly or biweekly). Fresh visuals arrive on autopilot — no manual work needed. Available on Growth plans and above.',
      },
      {
        q: 'Can I upscale my images?',
        a: 'Yes — the Upscale feature lets you enhance any generated image to 4K resolution for 15 credits. You can access it from the Library by selecting an image and choosing Upscale. Great for hero banners, print materials, and large-format displays.',
      },
    ],
  },
  {
    name: 'Image Quality',
    questions: [
      {
        q: 'What resolution and format are generated images?',
        a: 'All generated images are output at 2K resolution in PNG format by default. We support common aspect ratios (1:1, 4:5, 16:9, 9:16) suitable for e-commerce listings, social media, ads, and print. You can also upscale images to 4K for 15 credits.',
      },
      {
        q: 'What\'s the difference between Standard and High Quality?',
        a: 'Standard uses fast generation suitable for social media and web listings. High Quality uses a more advanced model for higher detail and realism — ideal for hero banners, marketing materials, and large-format displays.',
      },
      {
        q: 'My generated images don\'t look right. What can I do?',
        a: 'Try these tips: 1) Use a higher-quality source image with good lighting. 2) Create a Brand Profile to guide the AI\'s style decisions. 3) Use the Additional Note field in Setup to exclude unwanted elements. 4) Try different Visual Types — some work better for certain product types. 5) Design a Brand Scene to lock in the exact look you want.',
      },
    ],
  },
  {
    name: 'Account & Data',
    questions: [
      {
        q: 'How is my product data stored?',
        a: 'All product images and data are stored securely in our cloud infrastructure with encryption at rest and in transit. Your images are private and never used to train our AI models. Contact hello@vovv.ai to request data deletion.',
      },
      {
        q: 'How do I export my generated images?',
        a: 'You can download individual images from the Library or Jobs view. Bulk export is available — select multiple images and download them as a ZIP file. All images are output in PNG format at 2K resolution by default.',
      },
      {
        q: 'Can I use generated images commercially?',
        a: 'Yes! All images generated through VOVV.AI are yours to use commercially — for product listings, advertisements, social media, print materials, and any other business purpose. No attribution required.',
      },
    ],
  },
];
