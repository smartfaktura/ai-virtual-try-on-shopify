import { useState } from 'react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCredits } from '@/contexts/CreditContext';
import { UpgradePlanModal } from '@/components/app/UpgradePlanModal';
import { PlanChangeDialog, type PlanChangeMode } from '@/components/app/PlanChangeDialog';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { UpgradeValueDrawer } from '@/components/app/UpgradeValueDrawer';
import { PostGenerationUpgradeCard } from '@/components/app/PostGenerationUpgradeCard';
import { pricingPlans } from '@/data/mockData';
import type { ConversionCategory, BehaviorHint } from '@/lib/conversionCopy';

const CATEGORIES: ConversionCategory[] = [
  'fashion', 'beauty', 'jewelry', 'fragrances', 'food', 'electronics', 'home', 'accessories', 'fallback',
];
const BEHAVIOR_HINTS: (BehaviorHint | 'none')[] = [
  'none', 'low-credits', 'repeated-product', 'model-heavy', 'export-intent', 'video-usage', 'general',
];
const PLANS = ['free', 'starter', 'growth', 'pro'];
const MODES: PlanChangeMode[] = ['upgrade', 'downgrade', 'cancel', 'reactivate'];

const COMPONENTS = [
  {
    name: 'BuyCreditsModal',
    file: 'src/components/app/BuyCreditsModal.tsx',
    trigger: 'Sidebar "Top up", openBuyModal()',
    audience: 'All users',
    notes: 'Tabs (Top up / Upgrade), monthly/annual toggle, plan grid, credit packs',
  },
  {
    name: 'UpgradePlanModal',
    file: 'src/components/app/UpgradePlanModal.tsx',
    trigger: 'Sidebar "Upgrade" pill',
    audience: 'Users with higher tier available',
    notes: 'Lists higher tiers, billing toggle, ~5 cr/img estimate',
  },
  {
    name: 'PlanChangeDialog',
    file: 'src/components/app/PlanChangeDialog.tsx',
    trigger: 'Confirm step inside BuyCreditsModal',
    audience: 'Anyone changing tier',
    notes: '4 modes: upgrade / downgrade / cancel / reactivate',
  },
  {
    name: 'NoCreditsModal',
    file: 'src/components/app/NoCreditsModal.tsx',
    trigger: 'balance < cost on Generate / ProductImages / BrandModels / Upscale',
    audience: 'Out-of-credits users',
    notes: '7 ConversionCategory variants, free vs paid view',
  },
  {
    name: 'UpgradeValueDrawer',
    file: 'src/components/app/UpgradeValueDrawer.tsx',
    trigger: '"See plans" from post-gen card (Layer 2)',
    audience: 'Free users post-generation',
    notes: 'Per-category Layer 2 copy, 3 plan cards, recommended badge',
  },
  {
    name: 'PostGenerationUpgradeCard',
    file: 'src/components/app/PostGenerationUpgradeCard.tsx',
    trigger: '7s after first successful gen (Layer 1)',
    audience: 'Free users',
    notes: 'Inline card, per-category headline + value chips, behavior hints',
  },
];

export default function AdminPlanPopups() {
  const { isAdmin, isLoading } = useIsAdmin();
  const { openBuyModal } = useCredits();

  // Global controls
  const [category, setCategory] = useState<ConversionCategory>('fashion');
  const [previewPlan, setPreviewPlan] = useState<string>('free');
  const [behaviorHint, setBehaviorHint] = useState<BehaviorHint | 'none'>('none');
  const [generationCount, setGenerationCount] = useState<number>(1);

  // Per-component state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [planChangeOpen, setPlanChangeOpen] = useState(false);
  const [planChangeMode, setPlanChangeMode] = useState<PlanChangeMode>('upgrade');
  const [planChangeTarget, setPlanChangeTarget] = useState<string>('growth');
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPostGen, setShowPostGen] = useState(true);

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const targetPlan = pricingPlans.find((p) => p.planId === planChangeTarget);
  const hint: BehaviorHint | undefined = behaviorHint === 'none' ? undefined : behaviorHint;

  if (typeof document !== 'undefined') document.title = 'Admin · Plan Pop-ups';

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plan & Credit Pop-ups</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preview every upgrade surface in one place.
          </p>
        </div>
        <Badge variant="secondary">Admin</Badge>
      </header>

      {/* Global controls */}
      <Card className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Global controls
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v as ConversionCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Preview as plan</label>
            <Select value={previewPlan} onValueChange={setPreviewPlan}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Behavior hint</label>
            <Select value={behaviorHint} onValueChange={(v) => setBehaviorHint(v as BehaviorHint | 'none')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BEHAVIOR_HINTS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Generation count</label>
            <Select value={String(generationCount)} onValueChange={(v) => setGenerationCount(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 5, 10].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Component cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <ComponentCard
          title="1. BuyCreditsModal"
          subtitle="Full upgrade + top-up modal"
          meta="Reads current user plan from useCredits()"
        >
          <Button onClick={() => openBuyModal()}>Open</Button>
        </ComponentCard>

        <ComponentCard
          title="2. UpgradePlanModal"
          subtitle="Compact next-tier picker"
          meta={`Lists plans above previewPlan=${previewPlan}`}
        >
          <Button onClick={() => setUpgradeModalOpen(true)}>Open</Button>
        </ComponentCard>

        <ComponentCard
          title="3. PlanChangeDialog"
          subtitle="Confirmation dialog · 4 modes"
        >
          <div className="flex flex-wrap gap-2 mb-3">
            {MODES.map((m) => (
              <Button
                key={m}
                size="sm"
                variant={planChangeMode === m ? 'default' : 'outline'}
                onClick={() => setPlanChangeMode(m)}
              >
                {m}
              </Button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium">Target plan</label>
              <Select value={planChangeTarget} onValueChange={setPlanChangeTarget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {pricingPlans.filter(p => !p.isEnterprise).map((p) =>
                    <SelectItem key={p.planId} value={p.planId}>{p.name}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setPlanChangeOpen(true)}>Open</Button>
          </div>
        </ComponentCard>

        <ComponentCard
          title="4. NoCreditsModal"
          subtitle="Out-of-credits full-screen modal"
          meta={`Uses category=${category}, previewPlan=${previewPlan}, generationCount=${generationCount}`}
        >
          <Button onClick={() => setNoCreditsOpen(true)}>Open</Button>
        </ComponentCard>

        <ComponentCard
          title="5. UpgradeValueDrawer"
          subtitle="Layer 2 side drawer"
          meta={`category=${category}`}
        >
          <Button onClick={() => setDrawerOpen(true)}>Open</Button>
        </ComponentCard>

        <ComponentCard
          title="6. PostGenerationUpgradeCard"
          subtitle="Inline Layer 1 card (renders below)"
          meta={`category=${category}, behaviorHint=${behaviorHint}`}
        >
          <Button variant="outline" onClick={() => setShowPostGen((v) => !v)}>
            {showPostGen ? 'Hide' : 'Show'} card
          </Button>
        </ComponentCard>
      </div>

      {/* Inline preview area for PostGenerationUpgradeCard */}
      {showPostGen && (
        <Card className="p-5 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-3">Inline preview:</p>
          <PostGenerationUpgradeCard
            category={category}
            behaviorHint={hint}
            forceVisible
            onSeeMore={() => setDrawerOpen(true)}
            onDismiss={() => setShowPostGen(false)}
          />
        </Card>
      )}

      {/* Reference table */}
      <Card className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Reference
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>File</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COMPONENTS.map((c) => (
              <TableRow key={c.name}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.trigger}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.audience}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.notes}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{c.file}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-4">
          Dynamic copy lives in <code className="font-mono">src/lib/conversionCopy.ts</code>.
          Plan/pricing in <code className="font-mono">src/data/mockData.ts</code> and <code className="font-mono">src/contexts/CreditContext.tsx</code>.
        </p>
      </Card>

      {/* Mounted popups */}
      <UpgradePlanModal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} previewPlan={previewPlan} />
      <PlanChangeDialog
        open={planChangeOpen}
        onClose={() => setPlanChangeOpen(false)}
        onConfirm={() => setPlanChangeOpen(false)}
        mode={planChangeMode}
        targetPlan={targetPlan}
        currentPlanName="Current"
        currentBalance={0}
        periodEnd="January 1, 2026"
      />
      <NoCreditsModal
        open={noCreditsOpen}
        onClose={() => setNoCreditsOpen(false)}
        category={category}
        generationCount={generationCount}
        previewPlan={previewPlan}
      />
      <UpgradeValueDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={category}
      />
    </div>
  );
}

function ComponentCard({
  title,
  subtitle,
  meta,
  children,
}: {
  title: string;
  subtitle: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        {meta && <p className="text-[11px] text-muted-foreground/70 mt-1.5 font-mono">{meta}</p>}
      </div>
      <div className="mt-auto">{children}</div>
    </Card>
  );
}
