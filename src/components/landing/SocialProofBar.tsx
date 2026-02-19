import { TrendingUp, Clock, RefreshCw, Image, Quote } from 'lucide-react';

const metrics = [
  { icon: Image, value: '50,000+', label: 'Visuals generated' },
  { icon: Clock, value: '12s', label: 'Avg. delivery time' },
  { icon: RefreshCw, value: 'Monthly', label: 'Visuals refreshed automatically' },
  { icon: TrendingUp, value: '2,000+', label: 'Brands trust VOVV.AI' },
];


export function SocialProofBar() {
  return (
    <section className="py-12 border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-3">
                <metric.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="max-w-xl mx-auto text-center mb-6">
          <Quote className="w-5 h-5 text-primary/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            "We replaced 3 monthly photoshoots. Our ad creative is fresher than ever."
          </p>
          <p className="text-xs font-medium text-foreground mt-2">
            — E-commerce brand, Growth plan
          </p>
        </div>

      </div>
    </section>
  );
}
