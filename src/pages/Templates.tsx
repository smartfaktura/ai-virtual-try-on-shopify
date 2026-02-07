import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Image, Play, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/app/PageHeader';
import { mockTemplates, categoryLabels } from '@/data/mockData';
import { getTemplateImage } from '@/components/app/TemplatePreviewCard';
import type { Template, TemplateCategory } from '@/types';

export default function Templates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filteredTemplates = mockTemplates.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleUseTemplate = (templateId: string) => {
    navigate(`/app/generate?template=${templateId}`);
  };

  return (
    <PageHeader title="Templates">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-5 space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={v => setSelectedCategory(v as TemplateCategory | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="cosmetics">Cosmetics</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="supplements">Supplements</SelectItem>
                  <SelectItem value="universal">Universal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map(template => {
                    const previewImage = getTemplateImage(template.templateId);
                    return (
                      <TableRow key={template.templateId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {previewImage ? (
                              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                <img src={previewImage} alt={template.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                <Image className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.description.slice(0, 50)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{categoryLabels[template.category]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.enabled ? 'default' : 'outline'}>
                            {template.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(template.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => handleUseTemplate(template.templateId)}>
                              <Play className="w-3 h-3 mr-1" /> Use
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setPreviewTemplate(template)}>
                              <Eye className="w-3 h-3 mr-1" /> Preview
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Template Categories Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = mockTemplates.filter(t => t.category === key && t.enabled).length;
            return (
              <Card key={key}>
                <CardContent className="p-4 text-center space-y-1">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>Template preview and details</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                {getTemplateImage(previewTemplate.templateId) ? (
                  <img
                    src={getTemplateImage(previewTemplate.templateId)}
                    alt={previewTemplate.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="secondary">{categoryLabels[previewTemplate.category]}</Badge>
                  <Badge variant={previewTemplate.enabled ? 'default' : 'outline'}>
                    {previewTemplate.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(previewTemplate.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Close</Button>
            <Button onClick={() => previewTemplate && handleUseTemplate(previewTemplate.templateId)}>
              Use this template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageHeader>
  );
}
