import { useNavigate } from 'react-router-dom';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { SEOHead } from '@/components/SEOHead';
import { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { Image, ArrowRight, Sparkles, Layers, RefreshCw, Compass, Gift, Palette, Wand2, Film, Clapperboard, RotateCw, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/app/StatusBadge';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { UpgradePlanModal } from '@/components/app/UpgradePlanModal';





import { DashboardDiscoverSection } from '@/components/app/DashboardDiscoverSection';
import { RecentCreationsGallery } from '@/components/app/RecentCreationsGallery';
import { DashboardTipCard } from '@/components/app/DashboardTipCard';
import { ActivityFeed } from '@/components/app/ActivityFeed';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { JobStatus } from '@/types';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { Badge } from '@/components/ui/badge';
import { FeedbackBanner } from '@/components/app/FeedbackBanner';
import { StartWorkflowModal } from '@/components/app/StartWorkflowModal';
import { EarnCreditsModal } from '@/components/app/EarnCreditsModal';



export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, isEmpty, openBuyModal, plan, planConfig } = useCredits();
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

  // Fetch product count
  const { data: productCount = 0, isLoading: productsLoading } = useQuery({
    queryKey: ['dashboard-product-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_products')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: number | undefined) => prev,
  });

  // Fetch brand profile count
  const { data: brandProfileCount = 0 } = useQuery({
    queryKey: ['dashboard-brand-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('brand_profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch freestyle generation count (exclude Perspectives)
  const { data: freestyleCount = 0 } = useQuery({
    queryKey: ['dashboard-freestyle-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('freestyle_generations')
        .select('*', { count: 'exact', head: true })
        .is('workflow_label', null);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recent jobs (generation_jobs + Picture Perspectives from freestyle_generations)
  const { data: recentJobs = [], isLoading: jobsLoading, isError: jobsError, refetch: refetchJobs } = useQuery({
    queryKey: ['dashboard-recent-jobs', user?.id],
    queryFn: async () => {
      const [jobsRes, perspRes] = await Promise.all([
        supabase
          .from('generation_jobs')
          .select('*, user_products(title, image_url), workflows(name)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('freestyle_generations')
          .select('id, workflow_label, image_url, quality, created_at')
          .not('workflow_label', 'is', null)
          .ilike('workflow_label', 'Picture Perspectives%')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      if (jobsRes.error) throw jobsRes.error;

      const genJobs = (jobsRes.data ?? []).map(j => ({ ...j, _source: 'job' as const }));
      const perspJobs = (perspRes.data ?? []).map(p => ({
        id: p.id,
        created_at: p.created_at,
        status: 'completed',
        credits_used: p.quality === 'high' ? 8 : 4,
        results: [p.image_url],
        user_products: null,
        workflows: { name: 'Picture Perspectives' },
        workflow_id: null,
        product_id: null,
        _source: 'perspectives' as const,
        _label: p.workflow_label,
        _image_url: p.image_url,
      }));

      const merged = [...genJobs, ...perspJobs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      return merged;
    },
    enabled: !!user,
  });

  // Fetch active schedule count
  const { data: scheduleCount = 0, isLoading: schedulesLoading } = useQuery({
    queryKey: ['dashboard-schedule-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('creative_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: number | undefined) => prev,
  });


  // Critical error state — show recovery UI instead of blank skeletons
  const hasCriticalError = profileError && jobsError;

  const handleRetry = () => {
    refetchProfile();
    refetchJobs();
  };

  if (hasCriticalError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-center">Something went wrong loading your dashboard.</p>
        <Button onClick={handleRetry} variant="outline" className="rounded-full gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Lightweight activity check — determines new vs returning without waiting for heavy queries
  const modeHintKey = user ? `dashboard_mode_hint_${user.id}` : '';
  const modeHint = modeHintKey ? localStorage.getItem(modeHintKey) : null;

  const { data: hasActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-has-activity', user?.id],
    queryFn: async () => {
      const [jobRes, freestyleRes] = await Promise.all([
        supabase.from('generation_jobs').select('id', { count: 'exact', head: true }),
        supabase.from('freestyle_generations').select('id', { count: 'exact', head: true }),
      ]);
      const total = (jobRes.count ?? 0) + (freestyleRes.count ?? 0);
      if (total > 0 && modeHintKey) {
        localStorage.removeItem(modeHintKey);
      }
      return total > 0;
    },
    enabled: !!user && modeHint !== 'new',
    staleTime: 5 * 60 * 1000,
  });

  // Derive dashboard mode
  const dashboardMode: 'new' | 'returning' | 'resolving' =
    modeHint === 'new' ? 'new' :
    activityLoading ? 'resolving' :
    hasActivity ? 'returning' : 'new';

  const totalJobCount = recentJobs.length;

  const firstName = profile?.first_name || profile?.display_name || 'there';




  // --- RESOLVING STATE — neutral placeholder while we determine mode ---
  if (dashboardMode === 'resolving') {
    return (
      <div className="space-y-8 sm:space-y-10">
        <SEOHead title="Dashboard — VOVV.AI" description="Your AI photography studio dashboard." noindex />
        <div>
          <div className="h-10 w-64 bg-muted/40 rounded-lg animate-pulse" />
          <div className="h-5 w-96 bg-muted/30 rounded-lg animate-pulse mt-3" />
        </div>
      </div>
    );
  }

  // --- FIRST-RUN DASHBOARD ---
  if (dashboardMode === 'new') {
    return (
      <div className="space-y-8 sm:space-y-10">
        <SEOHead title="Dashboard — VOVV.AI" description="Your AI photography studio dashboard." noindex />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Welcome, {firstName} 👋
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-xl">
            Your AI photography studio is ready. Choose how you want to start.
          </p>

          {/* Credit badge or out-of-credits CTA */}
          {isEmpty ? (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between gap-4 mt-5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-sm">You're out of credits</p>
                  <p className="text-sm text-muted-foreground">Get credits to start creating.</p>
                </div>
              </div>
              <Button onClick={openBuyModal} className="rounded-full font-semibold shrink-0">
                Get Credits
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">{balance}</strong> credits available</span>
            </div>
          )}
        </div>

        {/* Start here — 3-card grid */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Start here</h2>
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
                Start creating
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

        <DashboardDiscoverSection />

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
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Your Products, In Motion</h2>
            <p className="text-base text-muted-foreground mt-1.5">AI-generated video ads ready in minutes, not weeks.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                <video
                  src={`/videos/showcase/showcase-${i + 1}.mp4`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* More tools */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">More tools</h2>
            <p className="text-base text-muted-foreground mt-1.5">Specialized tools for angles, quality, and catalog creation.</p>
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
        <RecentCreationsGallery />

        <FeedbackBanner />




        <StartWorkflowModal open={startModalOpen} onOpenChange={setStartModalOpen} />
        <EarnCreditsModal open={earnCreditsOpen} onOpenChange={setEarnCreditsOpen} />
      </div>
    );
  }

  // --- RETURNING USER DASHBOARD ---
  return (
    <div className="space-y-8 sm:space-y-10">
      <SEOHead title="Dashboard — VOVV.AI" description="Your AI photography studio dashboard." noindex />
      {/* Welcome greeting */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-xl">
          Your next visuals are just a click away
        </p>
      </div>

      {/* Tools — 3 cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">Create Product Visuals</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Brand-ready visuals tailored to your product and category.</p>
            </div>
            <Button className="w-full rounded-full font-semibold gap-2 mt-4 min-h-[44px] shadow-lg shadow-primary/25" onClick={() => navigate('/app/generate/product-images')}>
              Start creating <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">Create with Prompt</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Describe any shot, scene, or style you want to create.</p>
            </div>
            <Button variant="outline" className="w-full rounded-full font-semibold gap-2 mt-4 min-h-[44px]" onClick={() => navigate('/app/freestyle')}>
              Open studio <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">Explore Examples</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Browse real examples and recreate them with your product.</p>
            </div>
            <Button variant="outline" className="w-full rounded-full font-semibold gap-2 mt-4 min-h-[44px]" onClick={() => navigate('/app/discover')}>
              Browse looks <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/brand-profiles')}>
            <Palette className="w-3.5 h-3.5" /> Brand Profiles
          </Button>
          <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/library')}>
            <Image className="w-3.5 h-3.5" /> My Library
          </Button>
          <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/video')}>
            <Clapperboard className="w-3.5 h-3.5" /> Video Studio
          </Button>
          <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/workflows')}>
            <Layers className="w-3.5 h-3.5" /> Visual Studio
          </Button>
          <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1.5" onClick={() => setEarnCreditsOpen(true)}>
            <Gift className="w-3.5 h-3.5" /> Earn Credits
          </Button>
        </div>
      </div>

      {/* Plan & Credits */}
      {(() => {
        const canUpgrade = !!planConfig.nextPlanId && planConfig.nextPlanId !== 'enterprise';
        const monthly = planConfig.monthlyCredits;
        const isInfinite = monthly === Infinity;
        const usagePercent = isInfinite ? 100 : Math.min(100, Math.max(2, (balance / (monthly || 1)) * 100));
        return (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current plan</span>
                <Badge variant="secondary" className="rounded-full">{planConfig.name}</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground tracking-tight">{balance.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">/ {isInfinite ? '∞' : monthly.toLocaleString()} credits this period</span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
            <div className="shrink-0">
              <Button
                className="rounded-full font-semibold gap-2 min-h-[44px] px-6"
                onClick={() => (canUpgrade ? setUpgradeOpen(true) : openBuyModal())}
              >
                {canUpgrade ? 'Upgrade plan' : 'Top up credits'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })()}

      {/* Steal This Look */}
      <DashboardDiscoverSection />

      {/* Tip Card */}
      <DashboardTipCard />

      {/* Recent Creations Gallery */}
      <RecentCreationsGallery />

      {/* Recent Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Recent Jobs</h2>
          <Button variant="link" className="text-sm font-medium" onClick={() => navigate('/app/library')}>
            View all
          </Button>
        </div>
        {jobsLoading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-muted/40 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-muted/40 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted/30 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : recentJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Visual Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobs.map(job => {
                  const isPerspectives = '_source' in job && job._source === 'perspectives';
                  const firstResult = Array.isArray(job.results) ? (job.results as string[])[0] : null;
                  const thumbUrl = isPerspectives ? (job as any)._image_url : (firstResult || job.user_products?.image_url);
                  const displayUrl = getOptimizedUrl(thumbUrl, { quality: 50 }) || '/placeholder.svg';
                  const hoverUrl = getOptimizedUrl(thumbUrl, { quality: 70 }) || '/placeholder.svg';
                  const toSentenceCase = (str: string) => str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
                  const sourceLabel = isPerspectives ? ((job as any)._label || 'Picture Perspectives') : toSentenceCase(job.user_products?.title || job.workflows?.name || 'Generation');
                  return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <HoverCard openDelay={200}>
                          <HoverCardTrigger asChild>
                            <div className="w-10 h-10 rounded-md overflow-hidden border border-border flex-shrink-0 bg-muted/30 cursor-pointer">
                              <img
                                src={displayUrl}
                                alt={sourceLabel}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" className="w-52 p-1">
                            <img src={hoverUrl} alt="" className="w-full rounded-md" />
                          </HoverCardContent>
                        </HoverCard>
                        <span className="font-medium text-sm">
                          {sourceLabel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {job.workflows?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={job.status as JobStatus} />
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {job.credits_used > 0 ? job.credits_used : '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(job.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {job.status === 'completed' && (
                          <Button size="sm" variant="outline" className="rounded-full" onClick={() => navigate(`/app/library?search=${encodeURIComponent(job.user_products?.title || job.workflows?.name || '')}`)}>
                            View
                          </Button>
                        )}
                        {job.status === 'failed' && (
                          <Button size="sm" className="rounded-full" onClick={() => navigate('/app/generate')}>
                            Retry
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyStateCard
            heading="No jobs yet"
            description="Generate your first product visuals to see them here."
            showCollage
            action={{
              content: 'Generate visuals',
              onAction: () => navigate('/app/generate'),
            }}
          />
        )}
      </div>



      {/* Feedback Banner */}
      <FeedbackBanner />

      <StartWorkflowModal open={startModalOpen} onOpenChange={setStartModalOpen} />
      <EarnCreditsModal open={earnCreditsOpen} onOpenChange={setEarnCreditsOpen} />
      <UpgradePlanModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
