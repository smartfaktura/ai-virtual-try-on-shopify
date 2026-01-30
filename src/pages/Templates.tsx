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
  Popover,
  ActionList,
  Modal,
  InlineGrid,
  Tabs,
} from '@shopify/polaris';
import { SearchIcon, PlusIcon, MenuHorizontalIcon } from '@shopify/polaris-icons';
import { PageHeader } from '@/components/app/PageHeader';
import { mockTemplates, categoryLabels } from '@/data/mockData';
import type { Template, TemplateCategory } from '@/types';
import { toast } from 'sonner';

export default function Templates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

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

  const handleDuplicate = (template: Template) => {
    toast.success(`Template "${template.name}" duplicated`);
    setActivePopover(null);
  };

  const handleToggleEnabled = (template: Template) => {
    toast.success(`Template "${template.name}" ${template.enabled ? 'disabled' : 'enabled'}`);
    setActivePopover(null);
  };

  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      toast.success(`Template "${templateToDelete.name}" deleted`);
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
    }
  };

  const rows = filteredTemplates.map(template => [
    <BlockStack key={template.templateId} gap="100">
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {template.name}
      </Text>
      <Text as="span" variant="bodySm" tone="subdued">
        {template.description.slice(0, 60)}...
      </Text>
    </BlockStack>,
    <Badge key={`cat-${template.templateId}`}>
      {categoryLabels[template.category]}
    </Badge>,
    <Badge key={`status-${template.templateId}`} tone={template.enabled ? 'success' : undefined}>
      {template.enabled ? 'Active' : 'Disabled'}
    </Badge>,
    new Date(template.updatedAt).toLocaleDateString(),
    <Popover
      key={`actions-${template.templateId}`}
      active={activePopover === template.templateId}
      activator={
        <Button
          icon={MenuHorizontalIcon}
          variant="plain"
          onClick={() => setActivePopover(activePopover === template.templateId ? null : template.templateId)}
        />
      }
      onClose={() => setActivePopover(null)}
    >
      <ActionList
        items={[
          {
            content: 'Edit',
            onAction: () => {
              navigate(`/templates/${template.templateId}`);
              setActivePopover(null);
            },
          },
          {
            content: 'Duplicate',
            onAction: () => handleDuplicate(template),
          },
          {
            content: template.enabled ? 'Disable' : 'Enable',
            onAction: () => handleToggleEnabled(template),
          },
          {
            content: 'Delete',
            destructive: true,
            onAction: () => {
              setTemplateToDelete(template);
              setDeleteModalOpen(true);
              setActivePopover(null);
            },
          },
        ]}
      />
    </Popover>,
  ]);

  return (
    <PageHeader
      title="Templates"
      primaryAction={{
        content: 'Create template',
        icon: PlusIcon,
        onAction: () => navigate('/templates/new'),
      }}
    >
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
                prefix={<span className="text-muted-foreground">🔍</span>}
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete template?"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: handleDeleteConfirm,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setDeleteModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    </PageHeader>
  );
}
