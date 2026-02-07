import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Wallet, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/app/PageHeader';
import { MetricCard } from '@/components/app/MetricCard';
import { StatusBadge } from '@/components/app/StatusBadge';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { JobDetailModal } from '@/components/app/JobDetailModal';
import { LowCreditsBanner } from '@/components/app/LowCreditsBanner';
import { useCredits } from '@/contexts/CreditContext';
import { mockMetrics, mockJobs } from '@/data/mockData';
import type { GenerationJob } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { balance, openBuyModal } = useCredits();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<GenerationJob | null>(null);

  const handleViewJob = (job: GenerationJob) => {
    setSelectedJob(job);
    setDetailModalOpen(true);
  };
  const recentJobs = mockJobs.slice(0, 5);

  return (
    <PageHeader title="Dashboard">
      <div className="space-y-6">
        {/* Low credits banner */}
        <LowCreditsBanner />

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Images Generated"
            value={mockMetrics.imagesGenerated30d}
            suffix="last 30 days"
            icon={Image}
            trend={{ value: 12, direction: 'up' }}
          />
          <MetricCard
            title="Credits Remaining"
            value={balance}
            suffix="available"
            icon={Wallet}
            onClick={openBuyModal}
            trend={{ value: 15, direction: 'down' }}
          />
          <MetricCard
            title="Avg. Generation Time"
            value={mockMetrics.avgGenerationTime}
            suffix="seconds"
            icon={Clock}
            trend={{ value: 8, direction: 'down' }}
          />
          <MetricCard
            title="Publish Rate"
            value={`${mockMetrics.publishRate}%`}
            suffix="of generated"
            icon={CheckCircle}
            trend={{ value: 5, direction: 'up' }}
          />
        </div>

        {/* Usage Progress */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Usage This Month</h2>
              <span className="text-sm text-muted-foreground">
                {mockMetrics.imagesGenerated30d} / 300 images
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all rounded-full"
                style={{ width: `${Math.min((mockMetrics.imagesGenerated30d / 300) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.round((mockMetrics.imagesGenerated30d / 300) * 100)}% of monthly quota used
            </p>
          </CardContent>
        </Card>

        {/* Quick Generate Card */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-base font-semibold">Quick Generate</h2>
            <p className="text-sm text-muted-foreground">
              Generate professional product images in seconds. Select a product and we'll recommend the best photography styles.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button size="lg" onClick={() => navigate('/app/workflows')}>
                Choose a Workflow
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('/app/brand-profiles')}>
                Set Up Brand Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent Jobs</h2>
              <Button variant="link" onClick={() => navigate('/app/jobs')}>
                View all
              </Button>
            </div>

            {recentJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentJobs.map(job => (
                      <TableRow key={job.jobId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={job.productSnapshot.images[0]?.url || '/placeholder.svg'}
                                alt={job.productSnapshot.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium text-sm">{job.productSnapshot.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{job.templateSnapshot.name}</TableCell>
                        <TableCell>
                          <StatusBadge status={job.status} />
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {job.creditsUsed > 0 ? job.creditsUsed : '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewJob(job)}>
                              View
                            </Button>
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
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        onRetry={() => navigate('/app/generate')}
      />
    </PageHeader>
  );
}
