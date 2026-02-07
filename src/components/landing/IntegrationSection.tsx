import { ShoppingBag, Megaphone, Search, Package, Globe } from 'lucide-react';

const platforms = [
  { icon: ShoppingBag, name: 'Shopify', desc: 'Auto-sized for your store' },
  { icon: Megaphone, name: 'Meta Ads', desc: '1:1, 4:5, 9:16 ready' },
  { icon: Search, name: 'Google Ads', desc: 'Display & Performance Max' },
  { icon: Package, name: 'Amazon', desc: 'Main image compliant' },
  { icon: Globe, name: 'Any Platform', desc: 'Custom export sizes' },
];

export function IntegrationSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Export Everywhere. Perfect Sizes.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your visuals are delivered in the right format for every platform.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 max-w-3xl mx-auto">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="text-center p-5 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                <platform.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{platform.name}</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">{platform.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
