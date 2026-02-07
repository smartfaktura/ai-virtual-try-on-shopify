import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Image, Wallet, Package, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/app/PageHeader';
import { MetricCard } from '@/components/app/MetricCard';
import { StatusBadge } from '@/components/app/StatusBadge';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { LowCreditsBanner } from '@/components/app/LowCreditsBanner';
import { OnboardingChecklist } from '@/components/app/OnboardingChecklist';
import { GenerationModeCards } from '@/components/app/GenerationModeCards';
import { UpcomingDropsCard } from '@/components/app/UpcomingDropsCard';
import { WorkflowCard } from '@/components/app/WorkflowCard';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { JobStatus } from '@/types';
import type { Workflow } from '@/pages/Workflows';

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
      return data as Workflow[];
    },
    enabled: !!user,
  });

  // Total job count determines first-run vs returning
  const totalJobCount = recentJobs.length;
  const isNewUser = totalJobCount === 0 && !jobsLoading;

  const firstName = profile?.first_name || profile?.display_name || 'there';

  // --- FIRST-RUN DASHBOARD ---
  if (isNewUser) {
    return (
      <PageHeader title="Dashboard">
      <div className="space-y-8">
          {/* Welcome — breathing, no card wrapper */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Welcome, {firstName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-1.5 bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium text-foreground">
                  <Wallet className="w-3 h-3" />
                  {balance} credits
                </span>
                <span className="ml-2">to start creating.</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={openBuyModal}>
              Buy Credits
            </Button>
          </div>

          {/* Onboarding Checklist */}
          <OnboardingChecklist
            productCount={productCount}
            brandProfileCount={brandProfileCount}
            jobCount={totalJobCount}
          />

          {/* Two Ways to Create */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Two Ways to Create</h2>
            <GenerationModeCards />
          </div>

          {/* Explore Workflows */}
          {workflows.length > 0 && (
            <div className="space-y-3 bg-muted/50 -mx-4 px-4 py-6 rounded-xl">
              <h2 className="text-lg font-semibold tracking-tight">Explore Workflows</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </PageHeader>
    );
  }

  // --- RETURNING USER DASHBOARD ---
  return (
    <PageHeader title="Dashboard">
      <div className="space-y-6">
        {/* Low credits banner */}
        <LowCreditsBanner />

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Images Generated"
            value={generatedCount}
            suffix="last 30 days"
            icon={Image}
          />
          <MetricCard
            title="Credits Remaining"
            value={balance}
            suffix="available"
            icon={Wallet}
            onClick={openBuyModal}
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

        {/* Quick Create */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Quick Create</h2>
          <GenerationModeCards compact />
        </div>

        {/* Recent Jobs */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent Jobs</h2>
              <Button variant="link" onClick={() => navigate('/app/library')}>
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
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={job.user_products?.image_url || '/placeholder.svg'}
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
                              <Button size="sm" onClick={() => navigate('/app/generate')}>
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
                action={{
                  content: 'Generate images',
                  onAction: () => navigate('/app/generate'),
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Upcoming Drops */}
        <UpcomingDropsCard />
      </div>
    </PageHeader>
  );
}
