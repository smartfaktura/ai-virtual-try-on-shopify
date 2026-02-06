import { TrendingUp, Clock, DollarSign, Image } from 'lucide-react';

const metrics = [
  { icon: Image, value: '50,000+', label: 'Images generated' },
  { icon: Clock, value: '12s', label: 'Avg. generation time' },
  { icon: DollarSign, value: '84%', label: 'Cost savings vs studios' },
  { icon: TrendingUp, value: '2,000+', label: 'Brands using nanobanna' },
];

export function SocialProofBar() {
  return (
    <section className="py-12 border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
      </div>
    </section>
  );
}
