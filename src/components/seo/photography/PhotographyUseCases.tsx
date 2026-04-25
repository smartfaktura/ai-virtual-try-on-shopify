import { Link } from 'react-router-dom';
import {
  ShoppingBag, Megaphone, Instagram, Mail, Calendar, Rocket, LayoutGrid, Sparkles, ArrowRight,
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {useCases.map(({ title, text, Icon }) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-[#f0efed] shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-center mb-4 shadow-sm">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <h3 className="text-[#1a1a2e] text-base font-semibold mb-1.5 tracking-tight">{title}</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12 lg:mt-16">
          <Link
            to="/product-visual-library"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a1a2e] hover:gap-2.5 transition-all"
          >
            See all 1600+ scenes
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
