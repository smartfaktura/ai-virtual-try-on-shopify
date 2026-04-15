import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, Plus, ArrowRight, Monitor, Smartphone } from 'lucide-react';
import { PostGenerationUpgradeCard } from '@/components/app/PostGenerationUpgradeCard';
import { UpgradeValueDrawer } from '@/components/app/UpgradeValueDrawer';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import {
  type ConversionCategory,
  getLayer1Copy,
  getLayer2Copy,
  getLayer3Headline,
  getLayer3Subline,
} from '@/lib/conversionCopy';

const ALL_CATEGORIES: ConversionCategory[] = [
  'fashion', 'beauty', 'jewelry', 'fragrances', 'food', 'electronics', 'home', 'accessories', 'fallback',
];

function Layer1Preview({ category, mobile }: { category: ConversionCategory; mobile: boolean }) {
  const copy = getLayer1Copy(category);
  return (
    <div className={mobile ? 'max-w-[375px]' : 'max-w-[600px]'}>
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/[0.04] to-transparent">
        <button
          className="absolute top-3 right-3 p-2.5 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Dismiss"
        >
          <span className="text-xs">✕</span>
        </button>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start gap-2.5 pr-6">
            <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-semibold tracking-tight leading-snug">{copy.headline}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{copy.subline}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-7 sm:pl-9">
            {copy.chips.map((chip) => (
              <Badge key={chip} variant="outline" className="text-[11px] sm:text-[10px] font-medium px-2 py-0.5 bg-background border-border/60">
                <Plus className="w-2.5 h-2.5 mr-1 text-primary" />
                {chip}
              </Badge>
            ))}
          </div>
          <div className="pl-7 sm:pl-9">
            <Button variant="link" size="sm" className="h-auto p-0 text-xs font-medium text-primary">
              See what you can unlock
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminConversion() {
  const { isAdmin, isLoading } = useIsAdmin();
  const [category, setCategory] = useState<ConversionCategory>('fashion');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
          <Layer1Preview category={category} mobile={viewport === 'mobile'} />
        </div>
      </section>

      {/* Layer 2 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Layer 2</Badge>
          <h2 className="text-sm font-semibold">Value Drawer</h2>
          <span className="text-xs text-muted-foreground">— opens from "See what you can unlock"</span>
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
        <div className="border border-border/60 rounded-xl p-6 bg-muted/10">
          <Button onClick={() => setModalOpen(true)} variant="outline" className="rounded-xl">
            Open Modal Preview
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Currently showing: <span className="font-medium capitalize">{category}</span> category
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
                <TableHead>L1 Chips</TableHead>
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
                    <TableCell className="text-xs">{l1.chips.join(', ')}</TableCell>
                    <TableCell className="text-xs">{l3h}</TableCell>
                  </TableRow>
                );
              })}
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
      />
    </div>
  );
}
