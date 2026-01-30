import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
  DataTable,
  Badge,
  TextField,
  Select,
  InlineGrid,
  Icon,
} from '@shopify/polaris';
import { SearchIcon, ImageIcon, ViewIcon, PlayIcon } from '@shopify/polaris-icons';
import { PageHeader } from '@/components/app/PageHeader';
import { mockTemplates, categoryLabels } from '@/data/mockData';
import { getTemplateImage } from '@/components/app/TemplatePreviewCard';
import type { Template, TemplateCategory } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Badge as ShadcnBadge } from '@/components/ui/badge';

export default function Templates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const categories = [
    { id: 'all', content: 'All' },
    { id: 'clothing', content: 'Clothing' },
    { id: 'cosmetics', content: 'Cosmetics' },
    { id: 'food', content: 'Food' },
    { id: 'home', content: 'Home' },
    { id: 'supplements', content: 'Supplements' },
    { id: 'universal', content: 'Universal' },
  ];

  const filteredTemplates = mockTemplates.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleUseTemplate = (templateId: string) => {
    navigate(`/generate?template=${templateId}`);
  };

  const rows = filteredTemplates.map(template => {
    const previewImage = getTemplateImage(template.templateId);
    return [
      <InlineStack key={template.templateId} gap="300" blockAlign="center">
        {previewImage ? (
          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
            <img src={previewImage} alt={template.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            <Icon source={ImageIcon} tone="subdued" />
          </div>
        )}
        <BlockStack gap="050">
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {template.name}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {template.description.slice(0, 50)}...
          </Text>
        </BlockStack>
      </InlineStack>,
      <Badge key={`cat-${template.templateId}`}>
        {categoryLabels[template.category]}
      </Badge>,
      <Badge key={`status-${template.templateId}`} tone={template.enabled ? 'success' : undefined}>
        {template.enabled ? 'Active' : 'Disabled'}
      </Badge>,
      new Date(template.updatedAt).toLocaleDateString(),
      <InlineStack key={`actions-${template.templateId}`} gap="200">
        <Button
          icon={PlayIcon}
          onClick={() => handleUseTemplate(template.templateId)}
        >
          Use
        </Button>
        <Button
          icon={ViewIcon}
          variant="plain"
          onClick={() => setPreviewTemplate(template)}
        >
          Preview
        </Button>
      </InlineStack>,
    ];
  });

  return (
    <PageHeader title="Templates">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            {/* Filters */}
            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              <TextField
                label="Search"
                labelHidden
                placeholder="Search templates..."
                value={searchQuery}
                onChange={setSearchQuery}
                prefix={<Icon source={SearchIcon} />}
                autoComplete="off"
              />
              <Select
                label="Category"
                labelHidden
                options={categories.map(c => ({ label: c.content, value: c.id }))}
                value={selectedCategory}
                onChange={(v) => setSelectedCategory(v as TemplateCategory | 'all')}
              />
            </InlineGrid>

            {/* Table */}
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'text']}
              headings={['Template', 'Category', 'Status', 'Updated', 'Actions']}
              rows={rows}
            />
          </BlockStack>
        </Card>

        {/* Template Categories Overview */}
        <InlineGrid columns={{ xs: 2, md: 3, lg: 6 }} gap="400">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = mockTemplates.filter(t => t.category === key && t.enabled).length;
            return (
              <Card key={key}>
                <BlockStack gap="100" inlineAlign="center">
                  <Text as="p" variant="headingLg" fontWeight="bold">
                    {count}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {label}
                  </Text>
                </BlockStack>
              </Card>
            );
          })}
        </InlineGrid>
      </BlockStack>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Template preview and details
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              {/* Large Preview Image */}
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                {getTemplateImage(previewTemplate.templateId) ? (
                  <img 
                    src={getTemplateImage(previewTemplate.templateId)} 
                    alt={previewTemplate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon source={ImageIcon} tone="subdued" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <ShadcnBadge variant="secondary">
                    {categoryLabels[previewTemplate.category]}
                  </ShadcnBadge>
                  <ShadcnBadge variant={previewTemplate.enabled ? 'default' : 'outline'}>
                    {previewTemplate.enabled ? 'Active' : 'Disabled'}
                  </ShadcnBadge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {previewTemplate.description}
                </p>

                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(previewTemplate.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <ShadcnButton variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </ShadcnButton>
            <ShadcnButton onClick={() => {
              if (previewTemplate) {
                handleUseTemplate(previewTemplate.templateId);
              }
            }}>
              Use this template
            </ShadcnButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageHeader>
  );
}
