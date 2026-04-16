import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Monitor, Smartphone } from 'lucide-react';
import { PostGenerationUpgradeCard } from '@/components/app/PostGenerationUpgradeCard';
import { UpgradeValueDrawer } from '@/components/app/UpgradeValueDrawer';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import {
  type ConversionCategory,
  type BehaviorHint,
  getLayer1Copy,
  getLayer1Subline,
  getLayer1Avatar,
  getLayer2Copy,
  getLayer3Headline,
  getLayer3Subline,
} from '@/lib/conversionCopy';

const ALL_CATEGORIES: ConversionCategory[] = [
  'fashion', 'beauty', 'jewelry', 'fragrances', 'food', 'electronics', 'home', 'accessories', 'fallback',
];

const ALL_BEHAVIOR_HINTS: { value: BehaviorHint; label: string }[] = [
  { value: 'general', label: 'Default' },
  { value: 'low-credits', label: 'Low Credits' },
  { value: 'repeated-product', label: 'Repeated Product' },
  { value: 'model-heavy', label: 'Model Heavy' },
  { value: 'export-intent', label: 'Export Intent' },
  { value: 'video-usage', label: 'Video Usage' },
];

export default function AdminConversion() {
  const { isAdmin, isLoading } = useIsAdmin();
  const [category, setCategory] = useState<ConversionCategory>('fashion');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [behaviorHint, setBehaviorHint] = useState<BehaviorHint>('general');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlanPreview, setModalPlanPreview] = useState<string>('free');

  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Post-Gen Conversion Preview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preview all 3 conversion layers across categories and viewports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={category} onValueChange={(v) => setCategory(v as ConversionCategory)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={behaviorHint} onValueChange={(v) => setBehaviorHint(v as BehaviorHint)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_BEHAVIOR_HINTS.map((h) => (
                <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-2 transition-colors ${viewport === 'desktop' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-2 transition-colors ${viewport === 'mobile' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Layer 1 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Layer 1</Badge>
          <h2 className="text-sm font-semibold">Inline Upgrade Card</h2>
          <span className="text-xs text-muted-foreground">— appears 3s after first generation</span>
        </div>
        <div className="border border-border/60 rounded-xl p-6 bg-muted/10">
          <div className={viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-[600px]'}>
            <PostGenerationUpgradeCard
              category={category}
              behaviorHint={behaviorHint}
              onSeeMore={() => setDrawerOpen(true)}
              onDismiss={() => {}}
              forceVisible
            />
          </div>
        </div>
      </section>

      {/* Layer 2 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Layer 2</Badge>
          <h2 className="text-sm font-semibold">Value Drawer</h2>
          <span className="text-xs text-muted-foreground">— opens from "See Plans & Features"</span>
        </div>
        <div className="border border-border/60 rounded-xl p-6 bg-muted/10">
          <Button onClick={() => setDrawerOpen(true)} variant="outline" className="rounded-xl">
            Open Drawer Preview
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Currently showing: <span className="font-medium capitalize">{category}</span> category
          </p>
        </div>
      </section>

      {/* Layer 3 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Layer 3</Badge>
          <h2 className="text-sm font-semibold">No Credits Modal</h2>
          <span className="text-xs text-muted-foreground">— opens when user has 0 credits</span>
        </div>
        <div className="border border-border/60 rounded-xl p-6 bg-muted/10 space-y-3">
          <div className="flex items-center gap-3">
            <Button onClick={() => setModalOpen(true)} variant="outline" className="rounded-xl">
              Open Modal Preview
            </Button>
            <Select value={modalPlanPreview} onValueChange={setModalPlanPreview}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free User</SelectItem>
                <SelectItem value="starter">Starter User</SelectItem>
                <SelectItem value="growth">Growth User</SelectItem>
                <SelectItem value="pro">Pro User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Category: <span className="font-medium capitalize">{category}</span> · Plan: <span className="font-medium capitalize">{modalPlanPreview}</span>
            {modalPlanPreview === 'free' ? ' → Shows subscription plans' : ' → Shows credit top-up packs'}
          </p>
        </div>
      </section>

      {/* Copy Reference Table */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Copy Reference — All Categories</h2>
        <div className="border border-border/60 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Category</TableHead>
                <TableHead>L1 Headline</TableHead>
                <TableHead>L1 Subline</TableHead>
                <TableHead>Value Blocks</TableHead>
                <TableHead>L3 Headline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_CATEGORIES.map((cat) => {
                const l1 = getLayer1Copy(cat);
                const l3h = getLayer3Headline(cat);
                return (
                  <TableRow key={cat} className={cat === category ? 'bg-primary/5' : ''}>
                    <TableCell className="font-medium capitalize text-xs">{cat}</TableCell>
                    <TableCell className="text-xs">{l1.headline}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l1.subline}</TableCell>
                    <TableCell className="text-xs">{l1.valueBlocks.map(b => b.title).join(', ')}</TableCell>
                    <TableCell className="text-xs">{l3h}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Behavior Hint Sublines Reference */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Behavior-Aware Sublines — {category}</h2>
        <div className="border border-border/60 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Behavior Hint</TableHead>
                <TableHead>Subline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_BEHAVIOR_HINTS.map((h) => (
                <TableRow key={h.value} className={h.value === behaviorHint ? 'bg-primary/5' : ''}>
                  <TableCell className="font-medium text-xs">{h.label}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{getLayer1Subline(category, h.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* L2 Outcomes Reference */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Layer 2 Outcomes — All Categories</h2>
        <div className="border border-border/60 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Category</TableHead>
                <TableHead>Outcomes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_CATEGORIES.map((cat) => {
                const l2 = getLayer2Copy(cat);
                return (
                  <TableRow key={cat} className={cat === category ? 'bg-primary/5' : ''}>
                    <TableCell className="font-medium capitalize text-xs">{cat}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l2.outcomes.join(' · ')}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Actual components */}
      <UpgradeValueDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={category}
        generationContext={{
          productThumbnail: undefined,
          productTitle: 'Sample Product',
          sceneName: 'Editorial Studio',
          modelName: 'Sofia',
        }}
      />
      <NoCreditsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={category}
        generationCount={3}
        previewPlan={modalPlanPreview}
      />
    </div>
  );
}
