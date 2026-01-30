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
  Thumbnail,
  InlineGrid,
  Icon,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { toast } from 'sonner';
import { PageHeader } from '@/components/app/PageHeader';
import { StatusBadge } from '@/components/app/StatusBadge';
import { PublishModal } from '@/components/app/PublishModal';
import { JobDetailModal } from '@/components/app/JobDetailModal';
import { mockJobs, mockProducts, categoryLabels } from '@/data/mockData';
import type { JobStatus, GenerationJob, Product } from '@/types';

export default function Jobs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Publish modal state
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedJobForPublish, setSelectedJobForPublish] = useState<GenerationJob | null>(null);
  const [selectedImageUrlsForPublish, setSelectedImageUrlsForPublish] = useState<string[]>([]);
  
  // Job detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<GenerationJob | null>(null);

  const handleViewJob = (job: GenerationJob) => {
    setSelectedJobForDetail(job);
    setDetailModalOpen(true);
  };

  const handlePublishClick = (job: GenerationJob) => {
    setSelectedJobForPublish(job);
    setPublishModalOpen(true);
  };

  const handlePublish = (mode: 'add' | 'replace', variantId?: string) => {
    if (!selectedJobForPublish) return;
    const unpublished = selectedJobForPublish.results.filter(r => !r.publishedToShopify).length;
    toast.success(`${unpublished} image${unpublished !== 1 ? 's' : ''} ${mode === 'add' ? 'added to' : 'replaced on'} "${selectedJobForPublish.productSnapshot.title}"!`);
    setPublishModalOpen(false);
    setSelectedJobForPublish(null);
  };

  // Find matching product for job
  const getProductForJob = (job: GenerationJob): Product | null => {
    return mockProducts.find(p => p.id === job.productId) || null;
  };

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const rows = filteredJobs.map(job => {
    const unpublishedCount = job.results.filter(r => !r.publishedToShopify).length;
    const publishedCount = job.results.filter(r => r.publishedToShopify).length;
    
    return [
      // Product & Template combined
      <InlineStack key={job.jobId} gap="300" blockAlign="center" wrap={false}>
        <Thumbnail
          source={job.productSnapshot.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
          alt={job.productSnapshot.title}
          size="small"
        />
        <BlockStack gap="100">
          <Text as="span" variant="bodyMd" fontWeight="semibold" truncate>
            {job.productSnapshot.title}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {job.templateSnapshot.name}
          </Text>
        </BlockStack>
      </InlineStack>,
      // Status
      <StatusBadge key={`status-${job.jobId}`} status={job.status} />,
      // Details - simplified
      <Text key={`details-${job.jobId}`} as="span" variant="bodySm" tone="subdued">
        {job.requestedCount} × {job.ratio}
        {publishedCount > 0 && ` • ${publishedCount}/${job.results.length} ✓`}
      </Text>,
      // Date - compact
      <Text key={`date-${job.jobId}`} as="span" variant="bodySm" tone="subdued">
        {formatDate(job.createdAt)}
      </Text>,
      // Actions - simplified
      <InlineStack key={`actions-${job.jobId}`} gap="100">
        <Button size="slim" onClick={() => handleViewJob(job)}>
          View
        </Button>
        {job.status === 'failed' && (
          <Button size="slim" variant="primary" onClick={() => navigate('/generate')}>
            Retry
          </Button>
        )}
        {job.status === 'completed' && unpublishedCount > 0 && (
          <Button size="slim" variant="primary" onClick={() => handlePublishClick(job)}>
            {`Publish ${unpublishedCount}`}
          </Button>
        )}
      </InlineStack>,
    ];
  });

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
                prefix={<Icon source={SearchIcon} />}
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
              columnContentTypes={['text', 'text', 'text', 'text', 'text']}
              headings={['Product & Template', 'Status', 'Details', 'Date', 'Actions']}
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

      {/* Publish Modal with product context */}
      <PublishModal
        open={publishModalOpen}
        onClose={() => {
          setPublishModalOpen(false);
          setSelectedJobForPublish(null);
        }}
        onPublish={handlePublish}
        selectedImages={selectedJobForPublish?.results.filter(r => !r.publishedToShopify).map(r => r.imageUrl) || []}
        product={selectedJobForPublish ? getProductForJob(selectedJobForPublish) : null}
        existingImages={selectedJobForPublish?.productSnapshot.images || []}
      />

      {/* Job Detail Modal */}
      <JobDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedJobForDetail(null);
        }}
        job={selectedJobForDetail}
        onPublish={(job, selectedUrls) => {
          setDetailModalOpen(false);
          setSelectedJobForDetail(null);
          toast.success(`${selectedUrls.length} image${selectedUrls.length !== 1 ? 's' : ''} ready to publish`);
          handlePublishClick(job);
        }}
        onRetry={() => navigate('/generate')}
      />
    </PageHeader>
  );
}
