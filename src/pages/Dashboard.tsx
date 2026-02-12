import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Image, Wallet, Package, CalendarClock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MetricCard } from '@/components/app/MetricCard';
import { StatusBadge } from '@/components/app/StatusBadge';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { LowCreditsBanner } from '@/components/app/LowCreditsBanner';
import { OnboardingChecklist } from '@/components/app/OnboardingChecklist';
import { GenerationModeCards } from '@/components/app/GenerationModeCards';
import { UpcomingDropsCard } from '@/components/app/UpcomingDropsCard';
import { WorkflowCard } from '@/components/app/WorkflowCard';
import { DashboardTeamCarousel } from '@/components/app/DashboardTeamCarousel';
import { RecentCreationsGallery } from '@/components/app/RecentCreationsGallery';
import { DashboardTipCard } from '@/components/app/DashboardTipCard';
import { ActivityFeed } from '@/components/app/ActivityFeed';
import { DashboardQuickActions } from '@/components/app/DashboardQuickActions';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { JobStatus } from '@/types';
import type { Workflow } from '@/pages/Workflows';
import { getOptimizedUrl } from '@/lib/imageOptimization';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, openBuyModal } = useCredits();

  // Fetch user profile (first_name)
  const { data: profile } = useQuery({
    queryKey: ['dashboard-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, display_name')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch product count
  const { data: productCount = 0 } = useQuery({
    queryKey: ['dashboard-product-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_products')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
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
  });

  // Fetch recent jobs
  const { data: recentJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['dashboard-recent-jobs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('*, user_products(title, image_url), workflows(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // Fetch 30-day generation count
  const { data: generatedCount = 0 } = useQuery({
    queryKey: ['dashboard-generated-30d', user?.id],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count, error } = await supabase
        .from('generation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgo.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  // Fetch active schedule count
  const { data: scheduleCount = 0 } = useQuery({
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
  });

  // Fetch workflows (for first-run grid)
  const { data: workflows = [] } = useQuery({
    queryKey: ['dashboard-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as unknown as Workflow[];
    },
    enabled: !!user,
  });

  // Total job count determines first-run vs returning
  const totalJobCount = recentJobs.length;
  const isNewUser = totalJobCount === 0 && !jobsLoading;

  const firstName = profile?.first_name || profile?.display_name || 'there';

  // Credit usage progress (out of 300 monthly quota)
  const creditUsageProgress = Math.round(((300 - balance) / 300) * 100);

  // --- FIRST-RUN DASHBOARD ---
  if (isNewUser) {
    return (
      <div className="space-y-8 sm:space-y-10">
        {/* Welcome — bold, matching landing hero */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Welcome, {firstName} 👋
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-xl">
            Your AI photography studio is ready. Let's create your first visual set.
          </p>

          {/* Credit badge */}
          <div className="flex items-center gap-4 mt-5 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">{balance}</strong> credits available</span>
            </div>
            <Button variant="outline" size="sm" className="rounded-full font-semibold gap-1" onClick={openBuyModal}>
              Buy Credits
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Onboarding Checklist */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Get Started</h2>
          <OnboardingChecklist
            productCount={productCount}
            brandProfileCount={brandProfileCount}
            jobCount={totalJobCount}
          />
        </div>

        {/* What You Can Create — showcase gallery */}
        <RecentCreationsGallery />

        {/* Your AI Studio Team */}
        <DashboardTeamCarousel />

        {/* Two Ways to Create */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Two Ways to Create</h2>
          <GenerationModeCards />
        </div>

        {/* Explore Workflows */}
        {workflows.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Explore Workflows</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {workflows.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onSelect={() => navigate(`/app/generate?workflow=${workflow.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RETURNING USER DASHBOARD ---
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Welcome greeting + Quick Actions */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your studio.</p>

        {/* Quick Actions */}
        <div className="mt-4">
          <DashboardQuickActions />
        </div>
      </div>

      {/* Tip Card */}
      <DashboardTipCard />

      {/* Low credits banner */}
      <LowCreditsBanner />

      {/* Metrics Row — 2x2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Images Generated"
          value={generatedCount}
          suffix="last 30 days"
          icon={Image}
          progress={Math.min(100, Math.round((generatedCount / 300) * 100))}
        />
        <MetricCard
          title="Credits Remaining"
          value={balance}
          suffix="available"
          icon={Wallet}
          onClick={openBuyModal}
          progress={Math.max(0, Math.round((balance / 300) * 100))}
          progressColor={balance < 10 ? 'bg-destructive' : balance < 30 ? 'bg-amber-500' : 'bg-primary'}
        />
        <MetricCard
          title="Products"
          value={productCount}
          suffix="in library"
          icon={Package}
        />
        <MetricCard
          title="Active Schedules"
          value={scheduleCount}
          suffix="creative drops"
          icon={CalendarClock}
        />
      </div>

      {/* Recent Creations Gallery */}
      <RecentCreationsGallery />

      {/* Your AI Studio Team */}
      <DashboardTeamCarousel />

      {/* Quick Create */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Quick Create</h2>
        <GenerationModeCards compact />
      </div>

      {/* Recent Jobs */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recent Jobs</h2>
            <Button variant="link" className="text-sm font-medium" onClick={() => navigate('/app/library')}>
              View all
            </Button>
          </div>

          {recentJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map(job => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0">
                            <img
                              src={getOptimizedUrl(job.user_products?.image_url, { width: 80, quality: 50 }) || '/placeholder.svg'}
                              alt={job.user_products?.title || 'Product'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-sm">
                            {job.user_products?.title || 'Unknown product'}
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
                          {job.status === 'failed' && (
                            <Button size="sm" className="rounded-full" onClick={() => navigate('/app/generate')}>
                              Retry
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyStateCard
              heading="No jobs yet"
              description="Generate your first product images to see them here."
              showCollage
              action={{
                content: 'Generate images',
                onAction: () => navigate('/app/generate'),
              }}
            />
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <ActivityFeed />

      {/* Upcoming Drops */}
      <UpcomingDropsCard />
    </div>
  );
}
