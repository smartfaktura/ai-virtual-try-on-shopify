import {
  ShoppingBag, Megaphone, Instagram, Mail, Calendar, Rocket, LayoutGrid, Sparkles,
} from 'lucide-react';

const useCases = [
  { title: 'Shopify product pages', text: 'Hero shots, alternates, and lifestyle scenes for every PDP.', Icon: ShoppingBag },
  { title: 'Meta and Google Ads', text: 'High-CTR creative variations for performance testing.', Icon: Megaphone },
  { title: 'Instagram and TikTok', text: 'Always-on social content without booking another shoot.', Icon: Instagram },
  { title: 'Email campaign banners', text: 'On-brand hero imagery for newsletters and promos.', Icon: Mail },
  { title: 'Seasonal campaigns', text: 'Refresh your visuals for every season and drop.', Icon: Calendar },
  { title: 'Product launches', text: 'Launch-day creative ready before the inventory lands.', Icon: Rocket },
  { title: 'Catalog consistency', text: 'A unified look across hundreds of SKUs.', Icon: LayoutGrid },
  { title: 'Brand storytelling', text: 'Editorial scenes that match your brand world.', Icon: Sparkles },
];

export function PhotographyUseCases() {
  return (
    <section className="py-16 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Use cases
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Built for the visuals e-commerce brands need every week
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map(({ title, text, Icon }) => (
            <div key={title} className="bg-white rounded-2xl border border-[#f0efed] shadow-sm p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <Icon size={20} className="text-primary mb-3" strokeWidth={1.75} />
              <h3 className="text-[#1a1a2e] text-base font-semibold mb-1">{title}</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
