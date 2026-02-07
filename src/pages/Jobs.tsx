import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedJobForPublish, setSelectedJobForPublish] = useState<GenerationJob | null>(null);
  const [selectedImageUrlsForPublish, setSelectedImageUrlsForPublish] = useState<string[]>([]);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<GenerationJob | null>(null);

  const handleViewJob = (job: GenerationJob) => {
    setSelectedJobForDetail(job);
    setDetailModalOpen(true);
  };

  const handlePublishClick = (job: GenerationJob, specificUrls?: string[]) => {
    setSelectedJobForPublish(job);
    const urlsToPublish = specificUrls || job.results.filter(r => !r.publishedToShopify).map(r => r.imageUrl);
    setSelectedImageUrlsForPublish(urlsToPublish);
    setPublishModalOpen(true);
  };

  const handlePublish = (mode: 'add' | 'replace', variantId?: string) => {
    if (!selectedJobForPublish) return;
    const count = selectedImageUrlsForPublish.length;
    toast.success(`${count} image${count !== 1 ? 's' : ''} ${mode === 'add' ? 'added to' : 'replaced on'} "${selectedJobForPublish.productSnapshot.title}"!`);
    setPublishModalOpen(false);
    setSelectedJobForPublish(null);
    setSelectedImageUrlsForPublish([]);
  };

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

  return (
    <PageHeader title="Jobs">
      <div className="space-y-4">
        {/* Status summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { key: 'all', label: 'All Jobs', count: statusCounts.all },
            { key: 'queued', label: 'Queued', count: statusCounts.queued },
            { key: 'generating', label: 'Generating', count: statusCounts.generating },
            { key: 'completed', label: 'Completed', count: statusCounts.completed },
            { key: 'failed', label: 'Failed', count: statusCounts.failed },
          ].map(item => (
            <Card
              key={item.key}
              className={`cursor-pointer transition-opacity ${statusFilter === item.key ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => setStatusFilter(item.key as JobStatus | 'all')}
            >
              <CardContent className="p-4 text-center space-y-1">
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and table */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product or template..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as JobStatus | 'all')}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product & Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map(job => {
                    const unpublishedCount = job.results.filter(r => !r.publishedToShopify).length;
                    const publishedCount = job.results.filter(r => r.publishedToShopify).length;
                    return (
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
                            <div>
                              <p className="font-medium text-sm truncate max-w-[180px]">{job.productSnapshot.title}</p>
                              <p className="text-xs text-muted-foreground">{job.templateSnapshot.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={job.status} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {job.requestedCount} × {job.ratio} • {job.creditsUsed > 0 ? `${job.creditsUsed} cr` : '—'}
                          {publishedCount > 0 && ` • ${publishedCount}/${job.results.length} ✓`}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(job.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleViewJob(job)}>View</Button>
                            {job.status === 'failed' && (
                              <Button size="sm" onClick={() => navigate('/app/generate')}>Retry</Button>
                            )}
                            {job.status === 'completed' && unpublishedCount > 0 && (
                              <Button size="sm" onClick={() => handlePublishClick(job)}>
                                Download {unpublishedCount}
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

            {filteredJobs.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm text-muted-foreground">No jobs found matching your filters.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PublishModal
        open={publishModalOpen}
        onClose={() => {
          setPublishModalOpen(false);
          setSelectedJobForPublish(null);
          setSelectedImageUrlsForPublish([]);
        }}
        onPublish={handlePublish}
        selectedImages={selectedImageUrlsForPublish}
        product={selectedJobForPublish ? getProductForJob(selectedJobForPublish) : null}
        existingImages={selectedJobForPublish?.productSnapshot.images || []}
      />

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
          handlePublishClick(job, selectedUrls);
        }}
        onRetry={() => navigate('/app/generate')}
      />
    </PageHeader>
  );
}
