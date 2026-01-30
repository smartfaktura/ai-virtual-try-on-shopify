import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
  DataTable,
  TextField,
  Select,
  DatePicker,
  Popover,
  Thumbnail,
  InlineGrid,
  Filters,
} from '@shopify/polaris';
import { SearchIcon, CalendarIcon } from '@shopify/polaris-icons';
import { PageHeader } from '@/components/app/PageHeader';
import { StatusBadge } from '@/components/app/StatusBadge';
import { mockJobs, categoryLabels } from '@/data/mockData';
import type { JobStatus } from '@/types';

export default function Jobs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredJobs = mockJobs.filter(job => {
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && job.templateSnapshot.category !== categoryFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.productSnapshot.title.toLowerCase().includes(query) ||
        job.templateSnapshot.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const statusCounts = {
    all: mockJobs.length,
    queued: mockJobs.filter(j => j.status === 'queued').length,
    generating: mockJobs.filter(j => j.status === 'generating').length,
    completed: mockJobs.filter(j => j.status === 'completed').length,
    failed: mockJobs.filter(j => j.status === 'failed').length,
  };

  const rows = filteredJobs.map(job => [
    <InlineStack key={job.jobId} gap="300" blockAlign="center">
      <Thumbnail
        source={job.productSnapshot.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
        alt={job.productSnapshot.title}
        size="small"
      />
      <BlockStack gap="050">
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          {job.productSnapshot.title}
        </Text>
        <Text as="span" variant="bodySm" tone="subdued">
          {job.productSnapshot.vendor}
        </Text>
      </BlockStack>
    </InlineStack>,
    <BlockStack key={`template-${job.jobId}`} gap="050">
      <Text as="span" variant="bodyMd">
        {job.templateSnapshot.name}
      </Text>
      <Text as="span" variant="bodySm" tone="subdued">
        {categoryLabels[job.templateSnapshot.category]}
      </Text>
    </BlockStack>,
    <StatusBadge key={`status-${job.jobId}`} status={job.status} />,
    <BlockStack key={`details-${job.jobId}`} gap="050">
      <Text as="span" variant="bodySm">
        {job.requestedCount} images • {job.ratio} • {job.quality}
      </Text>
      {job.results.length > 0 && (
        <Text as="span" variant="bodySm" tone="subdued">
          {job.results.filter(r => r.publishedToShopify).length}/{job.results.length} published
        </Text>
      )}
    </BlockStack>,
    new Date(job.createdAt).toLocaleString(),
    <InlineStack key={`actions-${job.jobId}`} gap="200">
      <Button size="slim" onClick={() => navigate(`/jobs/${job.jobId}`)}>
        View
      </Button>
      {job.status === 'failed' && (
        <Button size="slim" variant="primary" onClick={() => navigate('/generate')}>
          Retry
        </Button>
      )}
      {job.status === 'completed' && job.results.some(r => !r.publishedToShopify) && (
        <Button size="slim" variant="secondary">
          Publish
        </Button>
      )}
    </InlineStack>,
  ]);

  return (
    <PageHeader title="Jobs">
      <BlockStack gap="400">
        {/* Status summary cards */}
        <InlineGrid columns={{ xs: 2, md: 5 }} gap="400">
          {[
            { key: 'all', label: 'All Jobs', count: statusCounts.all },
            { key: 'queued', label: 'Queued', count: statusCounts.queued },
            { key: 'generating', label: 'Generating', count: statusCounts.generating },
            { key: 'completed', label: 'Completed', count: statusCounts.completed },
            { key: 'failed', label: 'Failed', count: statusCounts.failed },
          ].map(item => (
            <Card key={item.key}>
              <div
                className={`cursor-pointer ${statusFilter === item.key ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                onClick={() => setStatusFilter(item.key as JobStatus | 'all')}
              >
                <BlockStack gap="100" inlineAlign="center">
                  <Text as="p" variant="headingLg" fontWeight="bold">
                    {item.count}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {item.label}
                  </Text>
                </BlockStack>
              </div>
            </Card>
          ))}
        </InlineGrid>

        {/* Filters and table */}
        <Card>
          <BlockStack gap="400">
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              <TextField
                label="Search"
                labelHidden
                placeholder="Search by product or template..."
                value={searchQuery}
                onChange={setSearchQuery}
                prefix={<span>🔍</span>}
                autoComplete="off"
              />
              <Select
                label="Status"
                labelHidden
                options={[
                  { label: 'All statuses', value: 'all' },
                  { label: 'Queued', value: 'queued' },
                  { label: 'Generating', value: 'generating' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Failed', value: 'failed' },
                ]}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as JobStatus | 'all')}
              />
              <Select
                label="Category"
                labelHidden
                options={[
                  { label: 'All categories', value: 'all' },
                  ...Object.entries(categoryLabels).map(([key, label]) => ({
                    label,
                    value: key,
                  })),
                ]}
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
            </InlineGrid>

            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
              headings={['Product', 'Template', 'Status', 'Details', 'Created', 'Actions']}
              rows={rows}
            />

            {filteredJobs.length === 0 && (
              <BlockStack gap="200" inlineAlign="center">
                <Text as="p" variant="bodyMd" tone="subdued">
                  No jobs found matching your filters.
                </Text>
                <Button onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}>
                  Clear filters
                </Button>
              </BlockStack>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </PageHeader>
  );
}
