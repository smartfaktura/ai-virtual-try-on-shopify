import { useNavigate } from 'react-router-dom';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { SEOHead } from '@/components/SEOHead';
import { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { Image, Wallet, ArrowRight, Sparkles, Layers, RefreshCw, Compass, Gift, Euro, Clock, Play, Palette, Wand2, Film, Clapperboard, RotateCw, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MetricCard } from '@/components/app/MetricCard';
import { StatusBadge } from '@/components/app/StatusBadge';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';





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
  const { balance, isEmpty, openBuyModal } = useCredits();
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [earnCreditsOpen, setEarnCreditsOpen] = useState(false);

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

  // Fetch 30-day generation count (actual images, not job rows)
  const { data: generatedCount = 0, isLoading: generatedLoading } = useQuery({
    queryKey: ['dashboard-generated-30d', user?.id],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const iso = thirtyDaysAgo.toISOString();

      const { data: jobs, error: e1 } = await supabase
        .from('generation_jobs')
        .select('requested_count')
        .eq('status', 'completed')
        .gte('created_at', iso);
      if (e1) throw e1;
      const jobImages = (jobs || []).reduce((sum, j) => sum + (j.requested_count || 0), 0);

      const { count: freestyleCount, error: e2 } = await supabase
        .from('freestyle_generations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', iso);
      if (e2) throw e2;

      return jobImages + (freestyleCount ?? 0);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: number | undefined) => prev,
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

  // Fetch last completed job's workflow
  const { data: lastJob } = useQuery({
    queryKey: ['dashboard-last-job', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('generation_jobs')
        .select('workflow_slug, workflow_id, workflows(name, slug)')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch most-used workflow
  const { data: topWorkflow } = useQuery({
    queryKey: ['dashboard-top-workflow', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('generation_jobs')
        .select('workflow_slug, workflow_id, workflows(name, slug)')
        .eq('status', 'completed')
        .limit(500);
      const counts: Record<string, { count: number; name: string; slug: string }> = {};
      (data || []).forEach(j => {
        const wf = j.workflows as any;
        if (wf?.name) {
          const key = wf.name;
          if (!counts[key]) counts[key] = { count: 0, name: wf.name, slug: wf.slug };
          counts[key].count++;
        }
      });
      const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
      return sorted[0] || null;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
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
      <div className="space-y-6 sm:space-y-10">
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
      <div className="space-y-6 sm:space-y-10">
        <SEOHead title="Dashboard — VOVV.AI" description="Your AI photography studio dashboard." noindex />
        {/* Welcome — bold, matching landing hero */}
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
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Start here</h2>
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
              <p className="text-xs text-muted-foreground/60 mt-3">Best place to start</p>
              <Button className="w-full rounded-full font-semibold gap-2 mt-3 min-h-[44px] shadow-lg shadow-primary/25" onClick={() => navigate('/app/generate/product-images')}>
                Open
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
              <p className="text-xs text-muted-foreground/60 mt-3">More creative control</p>
              <Button variant="outline" className="w-full rounded-full font-semibold gap-2 mt-3 min-h-[44px]" onClick={() => navigate('/app/freestyle')}>
                Open
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
              <p className="text-xs text-muted-foreground/60 mt-3">Good first look around</p>
              <Button variant="outline" className="w-full rounded-full font-semibold gap-2 mt-3 min-h-[44px]" onClick={() => navigate('/app/discover')}>
                Open
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DashboardDiscoverSection />

        {/* Create Video Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Create Video</h2>
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
                Explore
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Showcase */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Your Products, In Motion</h2>
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
            <h2 className="text-xl font-bold text-foreground">More tools</h2>
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
        <RecentCreationsGallery />

        <FeedbackBanner />




        <StartWorkflowModal open={startModalOpen} onOpenChange={setStartModalOpen} />
        <EarnCreditsModal open={earnCreditsOpen} onOpenChange={setEarnCreditsOpen} />
      </div>
    );
  }

  // --- RETURNING USER DASHBOARD ---
  return (
    <div className="space-y-5 sm:space-y-10">
      <SEOHead title="Dashboard — VOVV.AI" description="Your AI photography studio dashboard." noindex />
      {/* Welcome greeting + CTA */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground mt-1 sm:mt-2 max-w-xl">
          Your next visuals are just a click away
        </p>

        <div className="flex flex-col gap-3 mt-3 sm:mt-5">
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide fade-scroll sm:overflow-visible sm:flex-wrap sm:[mask-image:none]">
              <Button variant="outline" size="sm" className="shrink-0 rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/workflows')}>
                <Layers className="w-3.5 h-3.5" />
                Visual Studio
              </Button>
              <Button variant="outline" size="sm" className="shrink-0 rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/freestyle')}>
                <Wand2 className="w-3.5 h-3.5" />
                Create with Prompt
              </Button>
              <Button variant="outline" size="sm" className="shrink-0 rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/discover')}>
                <Compass className="w-3.5 h-3.5" />
                Explore
              </Button>
              <Button variant="outline" size="sm" className="shrink-0 rounded-full font-semibold gap-1.5" onClick={() => navigate('/app/library')}>
                <Image className="w-3.5 h-3.5" />
                Library
              </Button>
              <Button variant="outline" size="sm" className="shrink-0 rounded-full font-semibold gap-1.5" onClick={() => setEarnCreditsOpen(true)}>
                <Gift className="w-3.5 h-3.5" />
                Earn Credits
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Out-of-credits CTA */}
      {isEmpty && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between gap-4">
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
      )}

      {/* Metrics Row — 5 value-driven cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <MetricCard
          title="Cost Saved"
          value={`€${(generatedCount * 30).toLocaleString()}`}
          suffix="vs traditional photoshoots"
          icon={Euro}
          tooltip={{ text: "Based on €30 average cost per professional product photo", memberName: "Omar", avatar: getOptimizedUrl(getLandingAssetUrl('team/avatar-omar.jpg'), { quality: 60 }) }}
        />
        <MetricCard
          title="Time Saved"
          value={`${Math.round(generatedCount * 20 / 60)}h`}
          suffix="no shooting or editing needed"
          icon={Clock}
          tooltip={{ text: "Estimated 20 min saved per image vs traditional workflow", memberName: "Max", avatar: getOptimizedUrl(getLandingAssetUrl('team/avatar-max.jpg'), { quality: 60 }) }}
        />
        <MetricCard
          title="Credits"
          value={balance}
          suffix="available"
          icon={Wallet}
          onClick={openBuyModal}
          progress={Math.max(0, Math.round((balance / 300) * 100))}
          progressColor={balance < 10 ? 'bg-destructive' : balance < 30 ? 'bg-amber-500' : 'bg-primary'}
          tooltip={{ text: "Credits refresh monthly based on your plan", memberName: "Kenji", avatar: getOptimizedUrl(getLandingAssetUrl('team/avatar-kenji.jpg'), { quality: 60 }) }}
        />
        <MetricCard
          title="Continue Last"
          icon={Play}
          description={(lastJob?.workflows as any)?.name || 'No recent workflow'}
          action={lastJob ? {
            label: 'Continue',
            onClick: () => {
              const slug = (lastJob.workflows as any)?.slug || 'product-images';
              const routeMap: Record<string, string> = { 'product-on-model': 'product-images' };
              navigate(`/app/generate/${routeMap[slug] || slug}`);
            },
          } : undefined}
          tooltip={{ text: "Pick up where you left off", memberName: "Sophia", avatar: getOptimizedUrl(getLandingAssetUrl('team/avatar-sophia.jpg'), { quality: 60 }) }}
        />
        <div className="hidden md:block">
          <MetricCard
            title="Top Style"
            popoverAlign="end"
            icon={Palette}
            description={topWorkflow?.name || 'Generate to discover'}
            action={topWorkflow ? {
              label: 'Recreate',
              onClick: () => navigate(`/app/generate/${topWorkflow.slug}`),
            } : undefined}
            tooltip={{ text: "Your most-used workflow based on completed jobs", memberName: "Sienna", avatar: getOptimizedUrl(getLandingAssetUrl('team/avatar-sienna.jpg'), { quality: 60 }) }}
          />
        </div>
      </div>

      {/* Steal This Look */}
      <DashboardDiscoverSection />

      {/* Tip Card */}
      <DashboardTipCard />

      {/* Recent Creations Gallery */}
      <RecentCreationsGallery />

      {/* Tools */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Layers className="w-4.5 h-4.5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Create Product Visuals</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed flex-1">Brand-ready visuals tailored to your product and category.</p>
            <Button className="w-full rounded-full font-semibold gap-1.5 mt-3 h-9 text-xs shadow-lg shadow-primary/25" onClick={() => navigate('/app/generate/product-images')}>
              Open <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Wand2 className="w-4.5 h-4.5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Create with Prompt</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed flex-1">Describe any shot, scene, or style you want to create.</p>
            <Button variant="outline" className="w-full rounded-full font-semibold gap-1.5 mt-3 h-9 text-xs" onClick={() => navigate('/app/freestyle')}>
              Open <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Compass className="w-4.5 h-4.5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Explore Examples</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed flex-1">Browse real examples and recreate them with your product.</p>
            <Button variant="outline" className="w-full rounded-full font-semibold gap-1.5 mt-3 h-9 text-xs" onClick={() => navigate('/app/discover')}>
              Open <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>


      {/* Recent Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Recent Jobs</h2>
          <Button variant="link" className="text-sm font-medium" onClick={() => navigate('/app/library')}>
            View all
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-5 space-y-4">

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
      </div>
      </div>



      {/* Feedback Banner */}
      <FeedbackBanner />

      <StartWorkflowModal open={startModalOpen} onOpenChange={setStartModalOpen} />
      <EarnCreditsModal open={earnCreditsOpen} onOpenChange={setEarnCreditsOpen} />
    </div>
  );
}
