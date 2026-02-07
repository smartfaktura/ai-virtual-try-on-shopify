import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-primary/10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/8 rounded-full blur-3xl opacity-40" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Start for free today
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
          Ready to Automate Your
          <br />
          Product Photography?
        </h2>

        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Join 2,000+ brands using nanobanna to get fresh, on-brand product visuals delivered automatically every month.
        </p>

        <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25" onClick={() => navigate('/auth')}>
          Start Free — 5 Visuals
          <ArrowRight className="w-5 h-5" />
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            No credit card required
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            Setup in 30 seconds
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            5 free visuals included
          </div>
        </div>
      </div>
    </section>
  );
}
