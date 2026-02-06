import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlockStack,
  InlineGrid,
  Card,
  Text,
  Button,
  DataTable,
  InlineStack,
  Thumbnail,
} from '@shopify/polaris';
import { ImageIcon, WalletIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon } from '@shopify/polaris-icons';
import { PageHeader } from '@/components/app/PageHeader';
import { MetricCard } from '@/components/app/MetricCard';
import { StatusBadge } from '@/components/app/StatusBadge';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { JobDetailModal } from '@/components/app/JobDetailModal';
import { LowCreditsBanner } from '@/components/app/LowCreditsBanner';
import { useCredits } from '@/contexts/CreditContext';
import { mockMetrics, mockJobs, categoryLabels } from '@/data/mockData';
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

  const rows = recentJobs.map(job => [
    <InlineStack gap="300" blockAlign="center" key={job.jobId}>
      <Thumbnail
        source={job.productSnapshot.images[0]?.url || '/placeholder.svg'}
        alt={job.productSnapshot.title}
        size="small"
      />
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {job.productSnapshot.title}
      </Text>
    </InlineStack>,
    job.templateSnapshot.name,
    <StatusBadge key={`status-${job.jobId}`} status={job.status} />,
    <Text as="span" variant="bodyMd" key={`credits-${job.jobId}`}>
      {job.creditsUsed > 0 ? job.creditsUsed : '—'}
    </Text>,
    new Date(job.createdAt).toLocaleDateString(),
    <InlineStack gap="200" key={`actions-${job.jobId}`}>
      <Button size="slim" onClick={() => handleViewJob(job)}>
        View
      </Button>
      {job.status === 'failed' && (
        <Button size="slim" variant="primary" onClick={() => navigate('/app/generate')}>
          Retry
        </Button>
      )}
    </InlineStack>,
  ]);

  return (
    <PageHeader title="Dashboard">
      <BlockStack gap="600">
        {/* Low credits banner */}
        <LowCreditsBanner />

        {/* Metrics Row */}
        <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
          <MetricCard
            title="Images Generated"
            value={mockMetrics.imagesGenerated30d}
            suffix="last 30 days"
            icon={ImageIcon}
            trend={{ value: 12, direction: 'up' }}
          />
          <MetricCard
            title="Credits Remaining"
            value={balance}
            suffix="available"
            icon={WalletIcon}
            onClick={openBuyModal}
            trend={{ value: 15, direction: 'down' }}
          />
          <MetricCard
            title="Avg. Generation Time"
            value={mockMetrics.avgGenerationTime}
            suffix="seconds"
            icon={ClockIcon}
            trend={{ value: 8, direction: 'down' }}
          />
          <MetricCard
            title="Publish Rate"
            value={`${mockMetrics.publishRate}%`}
            suffix="of generated"
            icon={CheckCircleIcon}
            trend={{ value: 5, direction: 'up' }}
          />
        </InlineGrid>

        {/* Usage Progress */}
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">Usage This Month</Text>
              <Text as="span" variant="bodyMd" tone="subdued">
                {mockMetrics.imagesGenerated30d} / 300 images
              </Text>
            </InlineStack>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all rounded-full"
                style={{ width: `${Math.min((mockMetrics.imagesGenerated30d / 300) * 100, 100)}%` }}
              />
            </div>
            <Text as="p" variant="bodySm" tone="subdued">
              {Math.round((mockMetrics.imagesGenerated30d / 300) * 100)}% of monthly quota used
            </Text>
          </BlockStack>
        </Card>

        {/* Quick Generate Card */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Quick Generate
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Generate professional product images in seconds. Select a product and we'll recommend the best photography styles.
            </Text>
            <InlineStack gap="300" wrap>
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/app/generate')}
              >
                Upload & Generate
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/app/templates')}
                variant="plain"
              >
                Explore Templates
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Recent Jobs
              </Text>
              <Button variant="plain" onClick={() => navigate('/app/jobs')}>
                View all
              </Button>
            </InlineStack>
            
            {recentJobs.length > 0 ? (
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text']}
                headings={['Product', 'Template', 'Status', 'Credits', 'Created', 'Actions']}
                rows={rows}
              />
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
          </BlockStack>
        </Card>
      </BlockStack>

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
