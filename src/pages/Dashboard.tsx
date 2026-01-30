import { useNavigate } from 'react-router-dom';
import {
  BlockStack,
  InlineGrid,
  Card,
  Text,
  Button,
  Select,
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
import { mockMetrics, mockJobs, mockTemplates, categoryLabels } from '@/data/mockData';
import { useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const templateOptions = [
    { label: 'Select a template...', value: '' },
    ...mockTemplates.filter(t => t.enabled).map(t => ({
      label: `${t.name} (${categoryLabels[t.category]})`,
      value: t.templateId,
    })),
  ];

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
    new Date(job.createdAt).toLocaleDateString(),
    <InlineStack gap="200" key={`actions-${job.jobId}`}>
      <Button size="slim" onClick={() => navigate(`/jobs/${job.jobId}`)}>
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
        <InlineGrid columns={{ xs: 1, sm: 2, md: 4, lg: 5 }} gap="400">
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
          <MetricCard
            title="Error Rate"
            value={`${mockMetrics.errorRate}%`}
            icon={AlertCircleIcon}
            trend={{ value: 0.5, direction: 'down' }}
          />
        </InlineGrid>

        {/* Quick Generate Card */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Quick Generate
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Start generating product images in seconds. Select a product and template to begin.
            </Text>
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400" alignItems="end">
              <Button
                size="large"
                onClick={() => navigate('/generate')}
                variant="secondary"
              >
                Select Product
              </Button>
              <Select
                label="Template"
                labelHidden
                options={templateOptions}
                value={selectedTemplate}
                onChange={setSelectedTemplate}
              />
              <Button
                variant="primary"
                size="large"
                onClick={() => navigate('/generate')}
                disabled={!selectedTemplate}
              >
                Generate 4 Images
              </Button>
            </InlineGrid>
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
    </PageHeader>
  );
}
