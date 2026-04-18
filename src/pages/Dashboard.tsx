import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Layers, RefreshCw, Compass, Wand2, Film, Clapperboard, RotateCw, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradePlanModal } from '@/components/app/UpgradePlanModal';
import { DashboardDiscoverSection } from '@/components/app/DashboardDiscoverSection';
import { RecentCreationsGallery } from '@/components/app/RecentCreationsGallery';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { FeedbackBanner } from '@/components/app/FeedbackBanner';
import { StartWorkflowModal } from '@/components/app/StartWorkflowModal';
import { EarnCreditsModal } from '@/components/app/EarnCreditsModal';
import { LazyVideo } from '@/components/ui/LazyVideo';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, isEmpty, openBuyModal } = useCredits();
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [earnCreditsOpen, setEarnCreditsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Fetch user profile (first_name)
  const { data: profile, isError: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ['dashboard-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, display_name')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Detect returning user (has at least one completed generation job)
  const { data: hasGenerated } = useQuery({
    queryKey: ['dashboard-has-generated', user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('generation_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed');
      return (count ?? 0) > 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const isReturning = hasGenerated === true;

  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-center">Something went wrong loading your dashboard.</p>
        <Button onClick={() => refetchProfile()} variant="outline" className="rounded-full gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const firstName = profile?.first_name || profile?.display_name || 'there';

  return (
      <div className="space-y-8 sm:space-y-10">
        <SEOHead title="Dashboard — VOVV.AI" description="Your AI photography studio dashboard." noindex />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {isReturning ? 'Welcome back' : 'Welcome'}{profile?.first_name || profile?.display_name ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="text-base text-muted-foreground mt-1.5 max-w-xl">
            Your AI photography studio is ready — choose how you want to start
          </p>

          {/* Out-of-credits / low-credits CTA */}
          {(isEmpty || balance < 4) && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between gap-4 mt-5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-sm">
                    {isEmpty ? "You're out of credits" : 'Running low on credits'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isEmpty
                      ? 'Get credits to start creating.'
                      : `Only ${balance} credits left — top up to avoid interruptions`}
                  </p>
                </div>
              </div>
              <Button onClick={openBuyModal} className="rounded-full font-semibold shrink-0">
                Get Credits
              </Button>
            </div>
          )}
        </div>

        {/* Start here — 3-card grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1 — Product Visuals */}
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Create Product Visuals</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Create brand-ready visuals tailored to your product and category.
                </p>
              </div>
              <Button className="w-full rounded-full font-semibold gap-2 mt-4 min-h-[44px] shadow-lg shadow-primary/25" onClick={() => navigate('/app/generate/product-images')}>
                {isReturning ? 'Create now' : 'Start creating'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Card 2 — Freestyle */}
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Create with Prompt</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Describe any shot, scene, or style you want to create.
                </p>
              </div>
              <Button variant="outline" className="w-full rounded-full font-semibold gap-2 mt-4 min-h-[44px]" onClick={() => navigate('/app/freestyle')}>
                Open studio
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Card 3 — Explore */}
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Explore Examples</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Browse real examples and recreate them with your product.
                </p>
              </div>
              <Button variant="outline" className="w-full rounded-full font-semibold gap-2 mt-4 min-h-[44px]" onClick={() => navigate('/app/discover')}>
                Browse looks
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
          <DashboardDiscoverSection />
        </div>

        {/* Create Video Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Create Video</h2>
            <p className="text-base text-muted-foreground mt-1.5">Bring your visuals to life with motion and short film tools.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1 — Animate from Image */}
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Animate from Image</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Fast product videos from a single image.
                </p>
              </div>
              <Button variant="outline" className="w-full rounded-full font-semibold gap-2 mt-4 min-h-[44px]" onClick={() => navigate('/app/video/animate')}>
                Open
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Card 2 — Short Films */}
            <div className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clapperboard className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Beta</Badge>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">Short Films</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Multi-shot video creation with guided scene structure.
                </p>
              </div>
              <Button variant="outline" className="w-full rounded-full font-semibold gap-2 mt-4 min-h-[44px]" onClick={() => navigate('/app/video/short-film')}>
                Open
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Showcase */}
        <div className="space-y-4" style={{ contentVisibility: 'auto', containIntrinsicSize: '900px' }}>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Your Products, In Motion</h2>
            <p className="text-sm text-muted-foreground mt-1">AI-generated video ads ready in minutes, not weeks.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                <LazyVideo src={`/videos/showcase/showcase-${i + 1}.mp4`} />
              </div>
            ))}
          </div>
        </div>

        {/* More tools */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">More tools</h2>
            <p className="text-sm text-muted-foreground mt-1">Specialized tools for angles, quality, and catalog creation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              { icon: RotateCw, title: 'Picture Perspectives', label: 'More angles', desc: 'Turn one product image into a complete set of alternate views.', to: '/app/perspectives' },
              { icon: Sparkles, title: 'Image Upscaling', label: 'Higher resolution', desc: 'Upscale images to 2K or 4K while improving clarity and detail.', to: '/app/generate/image-upscaling' },
              { icon: LayoutGrid, title: 'Catalog Studio', label: 'Bulk creation', desc: 'Create catalog visuals in bulk with consistent styling.', to: '/app/catalog' },
            ] as const).map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.title}
                  className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{tool.desc}</p>
                    <span className="text-xs text-muted-foreground/60 mt-3 block">{tool.label}</span>
                  </div>
                  <Button variant="outline" className="w-full rounded-full font-semibold gap-2 mt-3 min-h-[44px]" onClick={() => navigate(tool.to)}>
                    Open
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* What You Can Create — showcase gallery */}
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
          <RecentCreationsGallery />
        </div>

        <FeedbackBanner />




        <StartWorkflowModal open={startModalOpen} onOpenChange={setStartModalOpen} />
        <EarnCreditsModal open={earnCreditsOpen} onOpenChange={setEarnCreditsOpen} />
        <UpgradePlanModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      </div>
  );
}
