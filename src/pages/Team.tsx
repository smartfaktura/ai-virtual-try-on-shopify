import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/landing/PageLayout';
import { TEAM_MEMBERS } from '@/data/teamData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Sparkles, CreditCard, X } from 'lucide-react';

export default function Team() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-24 sm:py-32 text-center px-4">
        <Badge variant="secondary" className="mb-6 text-xs tracking-widest uppercase px-4 py-1.5">
          Your AI Studio Team
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-[1.1]">
          10 AI Professionals.<br />
          <span className="text-primary">Zero Overhead.</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A dedicated creative team that never sleeps, never misses a deadline, and delivers studio-grade visuals on demand.
        </p>
      </section>

      {/* Team Grid */}
      <section className="pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 lg:gap-10">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <video
                  src={member.videoUrl}
                  poster={member.avatar}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-5 space-y-1.5">
                <h3 className="font-semibold text-foreground">{member.fullName}</h3>
                <p className="text-sm font-medium text-primary">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 border-t border-border bg-muted/30">
        <div className="max-w-2xl mx-auto text-center px-4 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Your studio team is ready.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Start generating professional product visuals today — no credit card, no contracts, no studio booking.
          </p>

          <Button asChild size="lg" className="rounded-xl text-base px-8 min-h-[48px]">
            <Link to="/auth">
              Start Creating Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Free to try</span>
            <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> No credit card</span>
            <span className="flex items-center gap-1.5"><X className="h-3.5 w-3.5" /> Cancel anytime</span>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              Questions? Reach out at{' '}
              <a href="mailto:hello@vovv.ai" className="text-primary hover:underline font-medium">
                hello@vovv.ai
              </a>
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
