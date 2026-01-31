import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlockStack,
  InlineGrid,
  Card,
  Text,
  Button,
  DataTable,
  Badge,
  InlineStack,
  Thumbnail,
} from '@shopify/polaris';
import { ImageIcon, WalletIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon } from '@shopify/polaris-icons';
import { PageHeader } from '@/components/app/PageHeader';
import { MetricCard } from '@/components/app/MetricCard';
import { StatusBadge } from '@/components/app/StatusBadge';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { JobDetailModal } from '@/components/app/JobDetailModal';
import { mockMetrics, mockJobs, categoryLabels } from '@/data/mockData';
import type { GenerationJob } from '@/types';
export default function Dashboard() {
  const navigate = useNavigate();
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
        source={job.productSnapshot.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
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
        <Button size="slim" variant="primary" onClick={() => navigate('/generate')}>
          Retry
        </Button>
      )}
    </InlineStack>,
  ]);

  return (
    <PageHeader title="Dashboard">
      <BlockStack gap="600">
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
            value={mockMetrics.creditsRemaining}
            icon={WalletIcon}
          />
          <MetricCard
            title="Avg. Generation Time"
            value={mockMetrics.avgGenerationTime}
            suffix="seconds"
            icon={ClockIcon}
          />
          <MetricCard
            title="Publish Rate"
            value={`${mockMetrics.publishRate}%`}
            icon={CheckCircleIcon}
            trend={{ value: 5, direction: 'up' }}
          />
        </InlineGrid>

        {/* Quick Generate Card */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Quick Generate
              </Text>
              <Badge tone="info">{`${mockMetrics.creditsRemaining} credits`}</Badge>
            </InlineStack>
            <Text as="p" variant="bodyMd" tone="subdued">
              Generate professional product images in seconds. Select a product and we'll recommend the best photography styles.
            </Text>
            <InlineStack gap="300" wrap>
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/generate')}
              >
                Select Product to Generate
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/templates')}
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
              <Button variant="plain" onClick={() => navigate('/jobs')}>
                View all
              </Button>
            </InlineStack>
            
            {recentJobs.length > 0 ? (
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                headings={['Product', 'Template', 'Status', 'Created', 'Actions']}
                rows={rows}
              />
            ) : (
              <EmptyStateCard
                heading="No jobs yet"
                description="Generate your first product images to see them here."
                action={{
                  content: 'Generate images',
                  onAction: () => navigate('/generate'),
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
        onRetry={() => navigate('/generate')}
      />
    </PageHeader>
  );
}
