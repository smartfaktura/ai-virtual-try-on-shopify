import {
  ShoppingBag, Sparkles, Instagram, Megaphone, Camera, ZoomIn, LayoutTemplate, Rocket,
} from 'lucide-react';

const items = [
  { title: 'Product page images', text: 'Clean, high-converting hero shots for Shopify, Amazon, and product pages.', Icon: ShoppingBag },
  { title: 'Lifestyle visuals', text: 'Editorial scenes that show your product in real-world moments.', Icon: Sparkles },
  { title: 'Social media content', text: 'Platform-ready posts and stories for Instagram, TikTok, and Pinterest.', Icon: Instagram },
  { title: 'Paid ad creatives', text: 'High-CTR creative for Meta, Google, and TikTok performance campaigns.', Icon: Megaphone },
  { title: 'Campaign visuals', text: 'Seasonal and themed campaign imagery built around your brand world.', Icon: Camera },
  { title: 'Detail shots', text: 'Macro close-ups that highlight texture, finish, and craftsmanship.', Icon: ZoomIn },
  { title: 'Website banners', text: 'Hero banners, collection covers, and email-ready hero graphics.', Icon: LayoutTemplate },
  { title: 'Product launch assets', text: 'Launch-day creative for new drops, collabs, and seasonal releases.', Icon: Rocket },
];

export function PhotographyVisualSystem() {
  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            One photo · Many outputs
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            One product photo. A full visual system.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Upload your product once and create visuals for your website, ads, email campaigns, social media, product launches, and seasonal campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ title, text, Icon }) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <h3 className="text-[#1a1a2e] text-base font-semibold mb-1.5">{title}</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
