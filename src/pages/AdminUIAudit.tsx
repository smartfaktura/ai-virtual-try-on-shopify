import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Loader2, Search, AlertTriangle, Check, Info, X, Copy, ChevronDown, Image as ImageIcon,
  Heart, Star, Download, Share2, Sparkles, Zap, Crown, Bell, Clock, Play,
  Menu, ChevronRight, ArrowRight, Filter, Trash2, Eye, Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { StatusBadge } from '@/components/app/StatusBadge';
import { WorkflowCardCompact } from '@/components/app/WorkflowCardCompact';
import { FreestylePromptCard } from '@/components/app/FreestylePromptCard';
import { cn } from '@/lib/utils';
import type { Workflow } from '@/types/workflow';

// ─── helpers ──────────────────────────────────────────────────────────────────

function useComputedStyle<T extends HTMLElement>(
  ref: React.RefObject<T>,
  props: string[],
): Record<string, string> {
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!ref.current) return;
    const cs = window.getComputedStyle(ref.current);
    const out: Record<string, string> = {};
    props.forEach((p) => (out[p] = cs.getPropertyValue(p)));
    setVals(out);
  }, [ref, props.join(',')]);
  return vals;
}

function useCssVar(name: string): string {
  const [val, setVal] = useState('');
  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    setVal(v);
  }, [name]);
  return val;
}

type Density = 'comfortable' | 'compact';

function matchesSearch(query: string, ...haystack: (string | undefined)[]) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return haystack.some((h) => (h ?? '').toLowerCase().includes(q));
}

// ─── small reusable presentational components ─────────────────────────────────

function CopyClasses({ value }: { value?: string }) {
  if (!value) return null;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => toast.success('Classes copied'));
      }}
      className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
      title="Copy classes"
    >
      <Copy className="w-3 h-3" /> copy
    </button>
  );
}

function MockChip() {
  return (
    <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-amber-500/40 text-amber-700">
      mock
    </Badge>
  );
}

function UsedIn({ paths }: { paths: string[] }) {
  if (!paths?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70 self-center">Used in</span>
      {paths.map((p) => (
        <span
          key={p}
          className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-foreground/70 border border-border/50"
        >
          {p}
        </span>
      ))}
    </div>
  );
}

function AuditSection({
  title, anchor, description, children,
}: {
  title: string; anchor: string; description?: string; children: React.ReactNode;
}) {
  return (
    <section id={anchor} className="scroll-mt-32 space-y-4">
      <div className="border-b border-border pb-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Block({
  name, source, classes, used, computed, children, query, density, mock,
}: {
  name: string;
  source?: string;
  classes?: string;
  used?: string[];
  computed?: Record<string, string>;
  children: React.ReactNode;
  query: string;
  density: Density;
  mock?: boolean;
}) {
  if (!matchesSearch(query, name, source, classes, ...(used ?? []))) return null;
  const padding = density === 'compact' ? 'p-3' : 'p-4';
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 items-start rounded-xl border border-border bg-card',
      padding,
    )}>
      <div className="flex items-center justify-start min-h-[60px] min-w-0">{children}</div>
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="font-semibold text-foreground truncate">{name}</div>
            {mock && <MockChip />}
          </div>
          <CopyClasses value={classes} />
        </div>
        {source && <div className="font-mono text-[10px] text-muted-foreground truncate">{source}</div>}
        {classes && (
          <div className="font-mono text-[10px] text-muted-foreground/80 break-all bg-background/50 rounded px-1.5 py-1 mt-1">
            {classes}
          </div>
        )}
        {computed && (
          <div className="mt-2 space-y-0">
            {Object.entries(computed).map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 border-b border-border/40 py-0.5 last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-mono text-foreground/90 truncate">{v || '—'}</span>
              </div>
            ))}
          </div>
        )}
        {used && used.length > 0 && <UsedIn paths={used} />}
      </div>
    </div>
  );
}

function SwatchBox({ cssVar, label, query }: { cssVar: string; label: string; query: string }) {
  const value = useCssVar(cssVar);
  if (!matchesSearch(query, cssVar, label)) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="h-12 w-full rounded-md border border-border" style={{ background: `hsl(var(${cssVar}))` }} />
      <div className="text-xs space-y-0.5">
        <div className="font-mono">{cssVar}</div>
        <div className="text-muted-foreground">{label}</div>
        <div className="font-mono text-[10px] text-foreground/70 truncate" title={value}>hsl({value || '—'})</div>
      </div>
    </div>
  );
}

function FontWeightSample({ weight, query }: { weight: number; query: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const c = useComputedStyle(ref, ['font-weight', 'font-family']);
  if (!matchesSearch(query, `font-weight ${weight}`, `weight ${weight}`)) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div ref={ref} className="text-lg" style={{ fontWeight: weight }}>The quick brown fox</div>
      <div className="text-xs space-y-0.5">
        <div className="font-mono">font-weight: {weight}</div>
        <div className="font-mono text-[10px] text-muted-foreground truncate">{c['font-family']}</div>
        <div className="font-mono text-[10px] text-muted-foreground">computed: {c['font-weight']}</div>
      </div>
    </div>
  );
}

function RadiusBox({ radiusClass, label, query }: { radiusClass: string; label: string; query: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const c = useComputedStyle(ref, ['border-radius']);
  if (!matchesSearch(query, radiusClass, label)) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div ref={ref} className={cn('h-16 w-full bg-primary/20 border border-primary/30', radiusClass)} />
      <div className="text-xs">
        <div className="font-mono">{label}</div>
        <div className="text-muted-foreground">{c['border-radius']}</div>
      </div>
    </div>
  );
}

function ShadowBox({ shadowClass, label, query }: { shadowClass: string; label: string; query: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const c = useComputedStyle(ref, ['box-shadow']);
  if (!matchesSearch(query, shadowClass, label)) return null;
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div ref={ref} className={cn('h-16 w-full rounded-lg bg-card border border-border', shadowClass)} />
      <div className="text-xs mt-2">
        <div className="font-mono">{label}</div>
        <div className="text-muted-foreground truncate" title={c['box-shadow']}>{c['box-shadow']?.slice(0, 40)}…</div>
      </div>
    </div>
  );
}

function SpacerBox({ tokenClass, size, label, query }: { tokenClass: string; size: number; label: string; query: string }) {
  if (!matchesSearch(query, label, tokenClass, `${size}`)) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-end gap-2 h-16">
        <div className="bg-primary/20 border border-primary/40 w-full" style={{ height: size }} />
      </div>
      <div className="text-xs">
        <div className="font-mono">{label}</div>
        <div className="text-muted-foreground">{size}px</div>
      </div>
    </div>
  );
}

// ─── inconsistencies data (with severity) ────────────────────────────────────

type Severity = 'high' | 'med' | 'low';

const SEVERITY_MAP: Record<Severity, { label: string; classes: string }> = {
  high: { label: 'high', classes: 'border-destructive/40 text-destructive bg-destructive/10' },
  med: { label: 'med', classes: 'border-amber-500/40 text-amber-700 bg-amber-500/10 dark:text-amber-400' },
  low: { label: 'low', classes: 'border-border text-muted-foreground bg-muted/40' },
};

type Inconsistency = {
  id: string;
  title: string;
  why: string;
  suggested: string;
  /** The single canonical winner (what to standardize on). */
  canonical: string;
  /** Patterns that should be retired. */
  deprecated: string[];
  severity: Severity;
  variants: { label: string; node: React.ReactNode }[];
};

const INCONSISTENCIES: Inconsistency[] = [
  {
    id: 'status-pills',
    title: 'Status pill colors',
    severity: 'high',
    why: 'Generation/library/trend chips use ad-hoc emerald/amber/red/blue while shadcn Badge uses semantic tokens.',
    suggested: 'Use <StatusBadge> for all job/library/video/trend states.',
    canonical: '<StatusBadge status="…" />',
    deprecated: ['inline bg-emerald-500/10', 'inline bg-blue-500/10', '.status-badge--*'],
    variants: [
      { label: 'StatusBadge (queued)', node: <StatusBadge status="queued" /> },
      { label: 'StatusBadge (generating)', node: <StatusBadge status="generating" /> },
      { label: 'StatusBadge (completed)', node: <StatusBadge status="completed" /> },
      { label: 'ad-hoc running (blue)', node: <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-blue-500/10 text-blue-600">Running</span> },
      { label: 'ad-hoc done (emerald)', node: <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-600">Done</span> },
    ],
  },
  {
    id: 'overlay-drift',
    title: 'Confirmation overlay drift',
    severity: 'high',
    why: 'Dialog, AlertDialog, Sheet, and Drawer all used for confirmations across the app.',
    suggested: 'Wrap destructive confirms in <ConfirmDialog>; reserve Dialog for content/forms.',
    canonical: '<ConfirmDialog> for destructive · <Dialog> for forms · <Sheet> for side flows · <Drawer> for mobile',
    deprecated: ['ad-hoc Dialog "Are you sure?" patterns', 'inline AlertDialog boilerplate'],
    variants: [
      { label: 'ConfirmDialog (canonical)', node: <Badge>Destructive confirm</Badge> },
      { label: 'Dialog', node: <Badge variant="outline">Centered modal</Badge> },
      { label: 'Sheet', node: <Badge variant="outline">Side panel</Badge> },
      { label: 'Drawer', node: <Badge variant="outline">Bottom mobile sheet</Badge> },
    ],
  },
  {
    id: 'button-heights',
    title: 'Button height conventions',
    severity: 'high',
    why: 'shadcn Button uses h-10/h-9/h-11; ad-hoc menu buttons in AppShell use raw <button class="h-10">.',
    suggested: 'Always use <Button> from components/ui/button.tsx; remove ad-hoc <button> styling.',
    canonical: '<Button variant size>',
    deprecated: ['raw <button class="h-10 px-3 …">', 'div with role="button"'],
    variants: [
      { label: 'shadcn default (h-10)', node: <Button>Action</Button> },
      { label: 'ad-hoc menu button', node: <button className="h-10 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors">Action</button> },
    ],
  },
  {
    id: 'card-padding',
    title: 'Card padding drift',
    severity: 'med',
    why: 'p-3, p-4, p-5, p-6 used on visually similar cards across the app.',
    suggested: 'Use the <Card density="…"> prop instead of overriding padding ad-hoc.',
    canonical: '<Card density="comfortable|compact|dense"> → p-5 / p-4 / p-3',
    deprecated: ['random p-6 on content cards', 'mixed p-4/p-5 in same surface family'],
    variants: [
      { label: 'dense (p-3)', node: <div className="rounded-2xl border border-border bg-card p-3 w-44 h-20 text-xs">dense</div> },
      { label: 'compact (p-4)', node: <div className="rounded-2xl border border-border bg-card p-4 w-44 h-20 text-xs">compact</div> },
      { label: 'comfortable (p-5)', node: <div className="rounded-2xl border border-border bg-card p-5 w-44 h-20 text-xs">comfortable</div> },
      { label: 'p-6 (deprecated)', node: <div className="rounded-2xl border border-border bg-card p-6 w-44 h-20 text-xs">p-6</div> },
    ],
  },
  {
    id: 'radius-drift',
    title: 'Radius drift on similar surfaces',
    severity: 'med',
    why: 'Cards mix rounded-lg / rounded-xl / rounded-2xl on identical contexts.',
    suggested: 'Cards = rounded-2xl (Card default), pills = rounded-full, inputs = rounded-md.',
    canonical: 'rounded-2xl for cards · rounded-full for pills · rounded-md for inputs',
    deprecated: ['rounded-lg / rounded-xl on card surfaces'],
    variants: [
      { label: 'rounded-lg', node: <div className="h-12 w-32 bg-card border border-border rounded-lg" /> },
      { label: 'rounded-xl', node: <div className="h-12 w-32 bg-card border border-border rounded-xl" /> },
      { label: 'rounded-2xl (canonical)', node: <div className="h-12 w-32 bg-card border border-border rounded-2xl" /> },
    ],
  },
  {
    id: 'skeletons',
    title: 'Skeleton patterns',
    severity: 'med',
    why: 'Skeleton component, custom shimmer divs, and animate-pulse boxes coexist.',
    suggested: 'Use <Skeleton /> exclusively; deprecate ad-hoc shimmers.',
    canonical: '<Skeleton className="…" />',
    deprecated: ['<div class="animate-pulse bg-muted">', 'custom shimmer keyframes'],
    variants: [
      { label: 'Skeleton', node: <Skeleton className="h-4 w-32" /> },
      { label: 'ad-hoc pulse', node: <div className="h-4 w-32 bg-muted animate-pulse rounded" /> },
    ],
  },
  {
    id: 'pagination',
    title: 'Two pagination styles',
    severity: 'med',
    why: 'shadcn Pagination component vs custom prev/next button rows.',
    suggested: 'Standardize on shadcn Pagination.',
    canonical: '<Pagination> from components/ui/pagination.tsx',
    deprecated: ['custom prev/next button rows'],
    variants: [
      { label: 'shadcn Pagination', node: <Badge variant="outline">‹ 1 2 3 ›</Badge> },
      { label: 'custom prev/next', node: <div className="flex gap-2"><Button size="sm" variant="outline">Prev</Button><Button size="sm" variant="outline">Next</Button></div> },
    ],
  },
  {
    id: 'muted-text',
    title: 'Muted text variants',
    severity: 'low',
    why: 'Three muted-text patterns coexist across pages (~420 occurrences in 41 files).',
    suggested: 'Use text-muted-foreground exclusively; remove /60 /70 /80 opacity variants.',
    canonical: 'text-muted-foreground',
    deprecated: ['text-foreground/60', 'text-foreground/70', 'text-foreground/80'],
    variants: [
      { label: 'text-muted-foreground', node: <p className="text-sm text-muted-foreground">Helper text</p> },
      { label: 'text-foreground/60', node: <p className="text-sm text-foreground/60">Helper text</p> },
      { label: 'text-foreground/80', node: <p className="text-sm text-foreground/80">Helper text</p> },
    ],
  },
  {
    id: 'section-labels',
    title: 'Section label styles',
    severity: 'low',
    why: 'Two patterns for tiny section headers — uppercase tracked vs muted xs.',
    suggested: 'Use the .section-label utility class (text-[10px] uppercase tracking-widest muted).',
    canonical: '.section-label',
    deprecated: ['ad-hoc text-xs uppercase tracking-wider text-muted-foreground'],
    variants: [
      { label: '.section-label (canonical)', node: <div className="section-label">Section</div> },
      { label: 'plain xs muted', node: <div className="text-xs text-muted-foreground">Section</div> },
    ],
  },
  {
    id: 'heading-scales',
    title: 'Heading scales',
    severity: 'low',
    why: 'PageHeader uses text-2xl sm:text-3xl, but several admin pages render raw <h1 class="text-2xl">.',
    suggested: 'Always use <PageHeader title=… />.',
    canonical: '<PageHeader title="…" subtitle="…">',
    deprecated: ['raw <h1 class="text-2xl …"> in pages'],
    variants: [
      { label: 'PageHeader title', node: <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Page title</h1> },
      { label: 'raw text-2xl', node: <h1 className="text-2xl font-semibold">Page title</h1> },
    ],
  },
  {
    id: 'tooltip-hovercard',
    title: 'Tooltip vs HoverCard overlap',
    severity: 'low',
    why: 'Tooltip and HoverCard both used to show hover info — sometimes interchangeably.',
    suggested: 'Tooltip for short labels (<60ch); HoverCard for rich previews with media.',
    canonical: 'Tooltip = short text · HoverCard = rich media',
    deprecated: ['HoverCard for one-line tooltips'],
    variants: [
      { label: 'Tooltip', node: <Badge variant="outline">Short text only</Badge> },
      { label: 'HoverCard', node: <Badge variant="outline">Rich card preview</Badge> },
    ],
  },
];

const RESOLVED_STORAGE_KEY = 'ui-audit-resolved-v1';

// ─── TOC ──────────────────────────────────────────────────────────────────────

const TOC = [
  { id: 'inconsistencies', label: '★ Inconsistencies' },
  { id: 'tokens-design', label: '00 · Design Tokens' },
  { id: 'typography', label: '01 · Typography' },
  { id: 'buttons', label: '02 · Buttons' },
  { id: 'inputs', label: '03 · Inputs' },
  { id: 'cards', label: '04 · Cards' },
  { id: 'badges', label: '05 · Badges' },
  { id: 'modals', label: '06 · Modals & Overlays' },
  { id: 'toasts', label: '07 · Toasts & Alerts' },
  { id: 'navigation', label: '08 · Navigation' },
  { id: 'data', label: '09 · Data Display' },
  { id: 'workflow', label: '10 · Workflow Surfaces' },
  { id: 'wizard', label: '11 · Wizard / Steps' },
  { id: 'genlib', label: '12 · Generation & Library' },
  { id: 'pricing', label: '13 · Pricing & Billing' },
  { id: 'auth', label: '14 · Auth' },
  { id: 'marketing', label: '15 · Marketing snippets' },
  { id: 'forms-wild', label: '16 · Forms in the wild' },
  { id: 'status', label: '17 · Status / state chips' },
  { id: 'loading', label: '18 · Loading & Empty' },
  { id: 'lightbox', label: '19 · Lightbox & Overlays' },
  { id: 'mobile', label: '20 · Mobile patterns' },
  { id: 'spacing', label: '21 · Spacing' },
  { id: 'tokens', label: '22 · Borders / Radius / Shadows' },
  { id: 'patterns', label: '23 · Page patterns' },
];

// ─── typography example ──────────────────────────────────────────────────────

function TypographyExample({
  className, text, name, source, used, tag = 'p', query, density,
}: {
  className: string; text: string; name: string; source: string; used?: string[];
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'label';
  query: string; density: Density;
}) {
  const ref = useRef<HTMLElement>(null);
  const c = useComputedStyle(ref as any, ['font-size', 'font-weight', 'line-height', 'letter-spacing']);
  const Tag: any = tag;
  return (
    <Block
      name={name} source={source} classes={className} used={used}
      query={query} density={density}
      computed={{
        'font-size': c['font-size'],
        'font-weight': c['font-weight'],
        'line-height': c['line-height'],
        'letter-spacing': c['letter-spacing'],
      }}
    >
      <Tag ref={ref as any} className={className}>{text}</Tag>
    </Block>
  );
}

// ─── button example ─────────────────────────────────────────────────────────

function ButtonExample({
  name, source, classes, used, children, query, density,
}: {
  name: string; source: string; classes?: string; used?: string[]; children: React.ReactNode;
  query: string; density: Density;
}) {
  if (!matchesSearch(query, name, source, classes, ...(used ?? []))) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="min-h-[44px] flex items-center">{children}</div>
      <div className="text-[10px] space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold">{name}</div>
          <CopyClasses value={classes} />
        </div>
        <div className="font-mono text-muted-foreground truncate">{source}</div>
        {classes && <div className="font-mono text-muted-foreground/80 break-all">{classes}</div>}
        {used && used.length > 0 && <UsedIn paths={used} />}
      </div>
    </div>
  );
}

// ─── sample workflow used by real WorkflowCardCompact ────────────────────────

const SAMPLE_WORKFLOW: Workflow = {
  id: 'sample',
  name: 'Product Images',
  slug: 'product-images',
  description: 'Generate scene · model · product compositions for catalog & lifestyle.',
  default_image_count: 4,
  required_inputs: ['product'],
  recommended_ratios: ['4:5', '1:1'],
  uses_tryon: false,
  template_ids: [],
  is_system: true,
  created_at: new Date().toISOString(),
  sort_order: 0,
  preview_image_url: null as any,
} as Workflow;

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminUIAudit() {
  const { isRealAdmin, isLoading } = useIsAdmin();
  const [query, setQuery] = useState('');
  const [density, setDensity] = useState<Density>('comfortable');
  const [onlyDrift, setOnlyDrift] = useState(false);
  const [resolved, setResolved] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(RESOLVED_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(RESOLVED_STORAGE_KEY, JSON.stringify(resolved));
    } catch {
      /* noop */
    }
  }, [resolved]);

  const toggleResolved = (id: string) =>
    setResolved((prev) => ({ ...prev, [id]: !prev[id] }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isRealAdmin) return <Navigate to="/app" replace />;

  const filteredDrift = INCONSISTENCIES.filter((i) =>
    matchesSearch(query, i.title, i.why, i.suggested, i.canonical, i.severity, ...i.deprecated),
  );
  const totalDrift = INCONSISTENCIES.length;
  const resolvedCount = INCONSISTENCIES.filter((i) => resolved[i.id]).length;
  const progressPct = totalDrift === 0 ? 0 : Math.round((resolvedCount / totalDrift) * 100);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <PageHeader
          title="UI Style Audit"
          subtitle="Comprehensive — every style across /app with computed values, source files, and where each pattern is used. Use search to filter, density to control spacing."
        >
          {/* Sticky toolbar */}
          <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/90 backdrop-blur border-b border-border mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by name, file path, class…"
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Density</span>
                <ToggleGroup
                  type="single"
                  value={density}
                  onValueChange={(v) => v && setDensity(v as Density)}
                  size="sm"
                >
                  <ToggleGroupItem value="comfortable" className="text-xs">Comfortable</ToggleGroupItem>
                  <ToggleGroupItem value="compact" className="text-xs">Compact</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="only-drift" checked={onlyDrift} onCheckedChange={setOnlyDrift} />
                <Label htmlFor="only-drift" className="text-xs cursor-pointer">Only inconsistencies</Label>
              </div>
              {query && (
                <Button variant="ghost" size="sm" onClick={() => setQuery('')}>
                  <X className="w-3 h-3" /> Clear
                </Button>
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                Resolved {resolvedCount} / {totalDrift}
              </div>
              <Progress value={progressPct} className="h-1.5 flex-1" />
              <div className="text-[11px] font-mono text-muted-foreground tabular-nums w-9 text-right">{progressPct}%</div>
              {resolvedCount > 0 && (
                <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setResolved({})}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-8">
            {/* TOC */}
            <nav className="lg:sticky lg:top-32 lg:self-start space-y-0.5 rounded-xl border border-border bg-card p-3 h-fit max-h-[calc(100vh-10rem)] overflow-auto z-20">
              <div className="section-label px-2 pb-2">Sections</div>
              {TOC.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className="block px-2 py-1.5 text-xs rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.label}
                </a>
              ))}
            </nav>

            {/* Content */}
            <div className="space-y-12 min-w-0">
              {/* ★ INCONSISTENCIES — promoted to top */}
              <AuditSection
                title="★ Inconsistencies / drift to resolve"
                anchor="inconsistencies"
                description="Manually curated — sorted by severity. Toggle the checkbox when an inconsistency is fixed across the codebase. Progress is saved locally."
              >
                <div className="space-y-4">
                  {filteredDrift.length === 0 && (
                    <div className="text-sm text-muted-foreground italic">No matches.</div>
                  )}
                  {filteredDrift.map((item) => {
                    const sev = SEVERITY_MAP[item.severity];
                    const isDone = !!resolved[item.id];
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'rounded-2xl border p-4 transition-colors',
                          isDone
                            ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                            : 'border-amber-500/30 bg-amber-500/[0.04]',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`drift-${item.id}`}
                            checked={isDone}
                            onCheckedChange={() => toggleResolved(item.id)}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <label
                                htmlFor={`drift-${item.id}`}
                                className={cn(
                                  'text-sm font-semibold cursor-pointer',
                                  isDone && 'line-through text-muted-foreground',
                                )}
                              >
                                {item.title}
                              </label>
                              <Badge variant="outline" className={cn('text-[10px] uppercase tracking-widest', sev.classes)}>
                                {sev.label}
                              </Badge>
                              {isDone && (
                                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                                  <Check className="w-3 h-3 mr-1" /> resolved
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{item.why}</div>

                            {/* Canonical vs Deprecated */}
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] p-2.5">
                                <div className="section-label flex items-center gap-1 mb-1">
                                  <Check className="w-3 h-3 text-emerald-700" /> Canonical
                                </div>
                                <code className="text-[11px] font-mono text-foreground break-words">{item.canonical}</code>
                              </div>
                              <div className="rounded-lg border border-destructive/30 bg-destructive/[0.04] p-2.5">
                                <div className="section-label flex items-center gap-1 mb-1">
                                  <X className="w-3 h-3 text-destructive" /> Deprecated
                                </div>
                                <ul className="space-y-0.5">
                                  {item.deprecated.map((d) => (
                                    <li key={d} className="text-[11px] font-mono text-muted-foreground break-words">
                                      • {d}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="text-xs mt-2">
                              <span className="font-semibold text-foreground">Action: </span>
                              <span className="text-muted-foreground">{item.suggested}</span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3">
                              {item.variants.map((v) => (
                                <div key={v.label} className="rounded-lg border border-border bg-card p-3 space-y-2">
                                  <div className="section-label">{v.label}</div>
                                  <div>{v.node}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AuditSection>

              {!onlyDrift && (
                <>
                  {/* 0. DESIGN TOKENS (real, computed) */}
                  <AuditSection
                    title="00 · Design tokens (live from :root)"
                    anchor="tokens-design"
                    description="Resolved CSS variables, font weights, and spacing scale read directly from the DOM."
                  >
                    <div>
                      <div className="text-sm font-semibold mb-2">Brand & semantic colors</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {[
                          '--background', '--foreground',
                          '--primary', '--primary-foreground',
                          '--secondary', '--secondary-foreground',
                          '--accent', '--accent-foreground',
                          '--muted', '--muted-foreground',
                          '--card', '--card-foreground',
                          '--popover', '--popover-foreground',
                          '--border', '--input', '--ring',
                          '--destructive', '--destructive-foreground',
                        ].map((v) => (
                          <SwatchBox key={v} query={query} cssVar={v} label={v.replace('--', '')} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold mb-2">Font weight ladder (Inter)</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[300, 400, 500, 600, 700].map((w) => (
                          <FontWeightSample key={w} weight={w} query={query} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold mb-2">Spacing scale</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                          { c: 'gap-1', s: 4 }, { c: 'gap-2', s: 8 }, { c: 'gap-3', s: 12 },
                          { c: 'gap-4', s: 16 }, { c: 'gap-5', s: 20 }, { c: 'gap-6', s: 24 },
                          { c: 'gap-8', s: 32 }, { c: 'gap-10', s: 40 }, { c: 'gap-12', s: 48 },
                        ].map((s) => (
                          <SpacerBox key={s.c} query={query} tokenClass={s.c} size={s.s} label={s.c} />
                        ))}
                      </div>
                    </div>
                  </AuditSection>

                  {/* 1. TYPOGRAPHY */}
                  <AuditSection title="01 · Typography" anchor="typography" description="Live samples + computed font-size, weight, line-height, letter-spacing.">
                    <TypographyExample query={query} density={density} tag="h1" name="H1 — PageHeader title" source="src/components/app/PageHeader.tsx" used={['/app (all top-level pages)']} className="text-2xl sm:text-3xl font-bold tracking-tight" text="Page title goes here" />
                    <TypographyExample query={query} density={density} tag="h2" name="H2 — section header" source="ad-hoc, many pages" used={['/app/workflows', '/app/library', '/app/admin/*']} className="text-xl font-semibold tracking-tight" text="Section title" />
                    <TypographyExample query={query} density={density} tag="h3" name="H3 — card title" source="src/components/ui/card.tsx" used={['CardTitle in dialogs/modals']} className="text-lg font-semibold" text="Card heading" />
                    <TypographyExample query={query} density={density} tag="h4" name="H4 — sub-section" source="ad-hoc" used={['admin scenes editor', 'wizard step subheaders']} className="text-base font-semibold" text="Sub-section" />
                    <TypographyExample query={query} density={density} name="Body large" source="ad-hoc" used={['marketing/landing only']} className="text-base text-foreground" text="Body large paragraph used in feature pages." />
                    <TypographyExample query={query} density={density} name="Body default" source="ad-hoc, default" used={['everywhere — primary body text']} className="text-sm text-foreground" text="Body default — most paragraphs in app." />
                    <TypographyExample query={query} density={density} name="Body small" source="ad-hoc" used={['table cells', 'metadata strings', 'admin lists']} className="text-xs text-foreground" text="Body small — dense table cells / metadata." />
                    <TypographyExample query={query} density={density} name="Caption" source="ad-hoc" used={['image attribution', 'thumbnail subtitles']} className="text-[11px] text-muted-foreground" text="CAPTION — image attribution / footnote" />
                    <TypographyExample query={query} density={density} tag="label" name="Label" source="src/components/ui/label.tsx" used={['form fields throughout /app']} className="text-sm font-medium" text="Field label" />
                    <TypographyExample query={query} density={density} name="Helper text" source="ad-hoc" used={['below inputs in wizards']} className="text-xs text-muted-foreground" text="Helper text — tip below an input." />
                    <TypographyExample query={query} density={density} name="Muted text" source="design tokens" used={['secondary content everywhere']} className="text-sm text-muted-foreground" text="Muted text — secondary content." />
                    <TypographyExample query={query} density={density} tag="span" name="Button text" source="src/components/ui/button.tsx" used={['all CTAs']} className="text-sm font-medium" text="Button label" />
                    <TypographyExample query={query} density={density} tag="span" name="Badge text" source="src/components/ui/badge.tsx" used={['Badge component']} className="text-xs font-semibold" text="Badge" />
                    <TypographyExample query={query} density={density} tag="span" name="Section label (uppercase)" source="ad-hoc, sidebar" used={['src/components/app/AppShell.tsx', 'discover headers']} className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground" text="OVERVIEW" />
                    <TypographyExample query={query} density={density} tag="span" name="Mono code chip" source="ad-hoc" used={['admin tables', 'this audit page']} className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-foreground/80" text="components/ui/button.tsx" />
                  </AuditSection>

                  {/* 2. BUTTONS */}
                  <AuditSection title="02 · Buttons" anchor="buttons" description="All shadcn variants × sizes, plus loading / disabled and ad-hoc patterns found in the wild.">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      <ButtonExample query={query} density={density} name="default · default" source="src/components/ui/button.tsx" used={['primary CTAs everywhere']}><Button>Default</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="destructive · default" source="src/components/ui/button.tsx" used={['delete confirmations']}><Button variant="destructive">Delete</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="outline · default" source="src/components/ui/button.tsx" used={['secondary actions']}><Button variant="outline">Outline</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="secondary · default" source="src/components/ui/button.tsx" used={['toolbars']}><Button variant="secondary">Secondary</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="ghost · default" source="src/components/ui/button.tsx" used={['cancel buttons', 'menu items']}><Button variant="ghost">Ghost</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="link · default" source="src/components/ui/button.tsx" used={['inline text links']}><Button variant="link">Link</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="default · sm" source="src/components/ui/button.tsx" used={['empty state CTAs', 'modal footers']}><Button size="sm">Small</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="default · lg" source="src/components/ui/button.tsx" used={['hero CTAs']}><Button size="lg">Large</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="default · icon" source="src/components/ui/button.tsx" used={['icon-only toolbar buttons']}><Button size="icon"><Search /></Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="loading" source="ad-hoc" used={['generation Submit buttons']}><Button disabled><Loader2 className="animate-spin" />Loading</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="disabled" source="src/components/ui/button.tsx" used={['form submit when invalid']}><Button disabled>Disabled</Button></ButtonExample>
                      <ButtonExample query={query} density={density} name="⚠ ad-hoc menu button" source="ad-hoc — see AppShell" classes="h-10 px-3 py-2 text-sm hover:bg-muted rounded-md" used={['src/components/app/AppShell.tsx']}>
                        <button className="h-10 px-3 py-2 text-sm hover:bg-muted rounded-md w-full text-left">Menu item</button>
                      </ButtonExample>
                      <ButtonExample query={query} density={density} name="Toggle (single)" source="src/components/ui/toggle.tsx" used={['admin filters']}><Toggle aria-label="bold">B</Toggle></ButtonExample>
                      <ButtonExample query={query} density={density} name="ToggleGroup" source="src/components/ui/toggle-group.tsx" used={['density toggle above']}>
                        <ToggleGroup type="single" defaultValue="a" size="sm"><ToggleGroupItem value="a">A</ToggleGroupItem><ToggleGroupItem value="b">B</ToggleGroupItem></ToggleGroup>
                      </ButtonExample>
                      <ButtonExample query={query} density={density} name="Icon + label CTA" source="ad-hoc" classes="gap-2" used={['Library bulk actions']}>
                        <Button><Download className="w-4 h-4" /> Download</Button>
                      </ButtonExample>
                      <ButtonExample query={query} density={density} name="⚠ gradient CTA (marketing)" source="marketing only" classes="bg-gradient-to-r from-primary to-primary/70" used={['/ landing pages']}>
                        <button className="h-10 px-5 rounded-full bg-gradient-to-r from-primary to-primary/70 text-primary-foreground text-sm font-medium">Get started</button>
                      </ButtonExample>
                    </div>
                  </AuditSection>

                  {/* 3. INPUTS */}
                  <AuditSection title="03 · Inputs / form controls" anchor="inputs">
                    <Block query={query} density={density} name="Input" source="src/components/ui/input.tsx" classes="h-10 rounded-md border border-input bg-background" used={['all forms', 'admin tables', 'search bars']}>
                      <Input placeholder="Text input" className="max-w-sm" />
                    </Block>
                    <Block query={query} density={density} name="Textarea" source="src/components/ui/textarea.tsx" classes="min-h-[80px] rounded-md border" used={['feedback form', 'prompt inputs', 'brand description']}>
                      <Textarea placeholder="Textarea" className="max-w-sm" />
                    </Block>
                    <Block query={query} density={density} name="Select" source="src/components/ui/select.tsx" used={['workflow filters', 'admin pickers']}>
                      <Select>
                        <SelectTrigger className="max-w-sm"><SelectValue placeholder="Select option" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a">Option A</SelectItem>
                          <SelectItem value="b">Option B</SelectItem>
                        </SelectContent>
                      </Select>
                    </Block>
                    <Block query={query} density={density} name="Search input pattern" source="ad-hoc" classes="pl-9 + absolute icon" used={['Library search', 'Discover search', 'admin lists']}>
                      <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search…" className="pl-9" />
                      </div>
                    </Block>
                    <Block query={query} density={density} name="Switch + Label" source="src/components/ui/switch.tsx" used={['settings page', 'admin toggles']}>
                      <div className="flex items-center gap-3"><Switch id="audit-switch" /><Label htmlFor="audit-switch">Switch</Label></div>
                    </Block>
                    <Block query={query} density={density} name="Checkbox" source="src/components/ui/checkbox.tsx" used={['bulk select rows', 'consent forms']}>
                      <div className="flex items-center gap-3"><Checkbox id="audit-cb" /><Label htmlFor="audit-cb">Checkbox</Label></div>
                    </Block>
                    <Block query={query} density={density} name="RadioGroup" source="src/components/ui/radio-group.tsx" used={['plan choice', 'aspect ratio']}>
                      <RadioGroup defaultValue="a" className="flex gap-4">
                        <div className="flex items-center gap-2"><RadioGroupItem value="a" id="ra" /><Label htmlFor="ra">A</Label></div>
                        <div className="flex items-center gap-2"><RadioGroupItem value="b" id="rb" /><Label htmlFor="rb">B</Label></div>
                      </RadioGroup>
                    </Block>
                    <Block query={query} density={density} name="Slider" source="src/components/ui/slider.tsx" used={['quality / cfg controls', 'video duration']}>
                      <Slider defaultValue={[50]} max={100} step={1} className="max-w-sm" />
                    </Block>
                    <Block query={query} density={density} name="Field with error" source="ad-hoc" classes="border-destructive + text-destructive" used={['auth form validation']}>
                      <div className="space-y-1.5 max-w-sm w-full">
                        <Label htmlFor="err">Email</Label>
                        <Input id="err" defaultValue="bad@" className="border-destructive focus-visible:ring-destructive" />
                        <p className="text-xs text-destructive">Invalid email address</p>
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 4. CARDS */}
                  <AuditSection title="04 · Cards / containers" anchor="cards">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Block query={query} density={density} name="Card (shadcn default)" source="src/components/ui/card.tsx" classes="rounded-lg border bg-card shadow-sm" used={['Dashboard tiles', 'admin panels']}>
                        <Card className="p-4 w-full"><div className="text-sm font-semibold">Default Card</div><div className="text-xs text-muted-foreground mt-1">shadcn card</div></Card>
                      </Block>
                      <Block query={query} density={density} name="card-elevated" source="ad-hoc" classes="rounded-xl border bg-card shadow-sm" used={['src/components/app/WorkflowCardCompact.tsx', 'src/components/app/FreestylePromptCard.tsx']}>
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm w-full"><div className="text-sm font-semibold">Elevated</div></div>
                      </Block>
                      <Block query={query} density={density} name="card-luxury" source="ad-hoc" classes="rounded-2xl border bg-card shadow-md p-6" used={['landing pricing', 'auth screens']}>
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-md w-full"><div className="text-sm font-semibold">Luxury</div></div>
                      </Block>
                      <Block query={query} density={density} name="metric-card" source="src/components/app/MetricCard.tsx" classes="rounded-xl border bg-card p-5" used={['Dashboard', 'admin analytics']}>
                        <div className="rounded-xl border border-border bg-card p-5 w-full">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</div>
                          <div className="text-2xl font-bold mt-1">1,284</div>
                        </div>
                      </Block>
                      <Block query={query} density={density} name="empty state container" source="src/components/app/EmptyStateCard.tsx" classes="rounded-lg border-dashed bg-muted/30 p-8 text-center" used={['Library empty', 'Activity empty']}>
                        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center w-full">
                          <div className="text-sm font-medium">Empty state</div>
                          <div className="text-xs text-muted-foreground mt-1">Nothing here yet</div>
                        </div>
                      </Block>
                      <Block query={query} density={density} name="list row container" source="ad-hoc" classes="rounded-lg border bg-card divide-y" used={['admin tables', 'settings lists']}>
                        <div className="rounded-lg border border-border bg-card divide-y divide-border w-full">
                          <div className="px-4 py-3 text-sm">List row 1</div>
                          <div className="px-4 py-3 text-sm">List row 2</div>
                        </div>
                      </Block>
                    </div>
                  </AuditSection>

                  {/* 5. BADGES */}
                  <AuditSection title="05 · Badges / chips / status pills" anchor="badges">
                    <Block query={query} density={density} name="Badge variants + custom pills" source="src/components/ui/badge.tsx + ad-hoc" used={['Generation status', 'Library status', 'admin tables', 'plan tags']}>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600">Success</span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600">Warning</span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500/10 text-red-600">Error</span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-600">Info</span>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground">PRO</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground"><Check className="w-3 h-3" />Done</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-amber-500/15 text-amber-700"><Crown className="w-3 h-3" /> Premium</span>
                      </div>
                    </Block>
                    <Block query={query} density={density} name="StatusBadge (real component)" source="src/components/app/StatusBadge.tsx" used={['Activity / job status throughout']}>
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status="queued" />
                        <StatusBadge status="generating" />
                        <StatusBadge status="completed" />
                        <StatusBadge status="failed" />
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 6. MODALS & OVERLAYS */}
                  <AuditSection title="06 · Modals & Overlays" anchor="modals" description="Dialog, AlertDialog, Sheet, Drawer, Popover, HoverCard, Tooltip, ContextMenu, DropdownMenu.">
                    <Block query={query} density={density} name="Dialog" source="src/components/ui/dialog.tsx" used={['src/components/app/UpgradePlanModal.tsx', 'src/components/app/NoCreditsModal.tsx']}>
                      <Dialog>
                        <DialogTrigger asChild><Button variant="outline" size="sm">Open Dialog</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Dialog title</DialogTitle><DialogDescription>Body description</DialogDescription></DialogHeader>
                          <DialogFooter><Button>Confirm</Button></DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </Block>
                    <Block query={query} density={density} name="AlertDialog" source="src/components/ui/alert-dialog.tsx" used={['delete confirms', 'destructive actions']}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Delete…</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </Block>
                    <Block query={query} density={density} name="Sheet (right)" source="src/components/ui/sheet.tsx" used={['src/components/app/UpgradeValueDrawer.tsx']}>
                      <Sheet>
                        <SheetTrigger asChild><Button variant="outline" size="sm">Open Sheet</Button></SheetTrigger>
                        <SheetContent>
                          <SheetHeader><SheetTitle>Side panel</SheetTitle><SheetDescription>Right-aligned overlay.</SheetDescription></SheetHeader>
                        </SheetContent>
                      </Sheet>
                    </Block>
                    <Block query={query} density={density} name="Drawer (mobile bottom)" source="src/components/ui/drawer.tsx" used={['mobile filter sheets', 'mobile pickers']}>
                      <Drawer>
                        <DrawerTrigger asChild><Button variant="outline" size="sm">Open Drawer</Button></DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader><DrawerTitle>Bottom drawer</DrawerTitle><DrawerDescription>Mobile-style sheet.</DrawerDescription></DrawerHeader>
                        </DrawerContent>
                      </Drawer>
                    </Block>
                    <Block query={query} density={density} name="Popover" source="src/components/ui/popover.tsx" used={['color pickers', 'small forms', 'admin tools']}>
                      <Popover>
                        <PopoverTrigger asChild><Button variant="outline" size="sm">Open Popover</Button></PopoverTrigger>
                        <PopoverContent className="text-sm">Popover body content.</PopoverContent>
                      </Popover>
                    </Block>
                    <Block query={query} density={density} name="HoverCard" source="src/components/ui/hover-card.tsx" used={['rich previews on thumbnails']}>
                      <HoverCard>
                        <HoverCardTrigger asChild><Button variant="link" size="sm">Hover me</Button></HoverCardTrigger>
                        <HoverCardContent className="text-sm">Rich preview content.</HoverCardContent>
                      </HoverCard>
                    </Block>
                    <Block query={query} density={density} name="Tooltip" source="src/components/ui/tooltip.tsx" used={['icon button labels', 'truncated text']}>
                      <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost"><Info className="w-4 h-4" /></Button></TooltipTrigger><TooltipContent>Tooltip text</TooltipContent></Tooltip>
                    </Block>
                    <Block query={query} density={density} name="DropdownMenu" source="src/components/ui/dropdown-menu.tsx" used={['src/components/app/AppShell.tsx', 'row actions']}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Menu <ChevronDown className="w-3 h-3" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Account</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Profile</DropdownMenuItem>
                          <DropdownMenuItem>Settings</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Block>
                    <Block query={query} density={density} name="ContextMenu" source="src/components/ui/context-menu.tsx" used={['library asset right-click']}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild><div className="rounded-md border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">Right-click here</div></ContextMenuTrigger>
                        <ContextMenuContent><ContextMenuItem>Copy</ContextMenuItem><ContextMenuItem>Delete</ContextMenuItem></ContextMenuContent>
                      </ContextMenu>
                    </Block>
                  </AuditSection>

                  {/* 7. TOASTS & ALERTS */}
                  <AuditSection title="07 · Toasts & Notifications" anchor="toasts">
                    <Block query={query} density={density} name="Sonner toast — success" source="src/components/ui/sonner.tsx" used={['App.tsx mounted globally', 'all success feedback']}>
                      <Button size="sm" onClick={() => toast.success('Saved')}>Trigger success</Button>
                    </Block>
                    <Block query={query} density={density} name="Sonner toast — error" source="sonner" used={['error feedback throughout']}>
                      <Button size="sm" variant="destructive" onClick={() => toast.error('Something failed')}>Trigger error</Button>
                    </Block>
                    <Block query={query} density={density} name="Sonner toast — info" source="sonner" used={['neutral notifications']}>
                      <Button size="sm" variant="outline" onClick={() => toast('Heads up', { description: 'Informational' })}>Trigger info</Button>
                    </Block>
                    <Block query={query} density={density} name="Sonner toast — loading" source="sonner" used={['async actions']}>
                      <Button size="sm" variant="outline" onClick={() => { const id = toast.loading('Working…'); setTimeout(() => toast.success('Done', { id }), 1200); }}>Trigger loading</Button>
                    </Block>
                    <Block query={query} density={density} name="Alert (default)" source="src/components/ui/alert.tsx" used={['inline page warnings', 'admin notices']}>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Heads up</AlertTitle>
                        <AlertDescription>This is an informational alert.</AlertDescription>
                      </Alert>
                    </Block>
                    <Block query={query} density={density} name="Alert (destructive)" source="src/components/ui/alert.tsx" used={['error banners']}>
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>Something went wrong.</AlertDescription>
                      </Alert>
                    </Block>
                    <Block query={query} density={density} name="Inline status banner — credits low" source="src/components/app/LowCreditsBanner.tsx" classes="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs" used={['src/components/app/AppShell.tsx']}>
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Low on credits — <Button variant="link" size="sm" className="h-auto p-0 text-xs">Upgrade</Button></span>
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 8. NAVIGATION */}
                  <AuditSection title="08 · Navigation" anchor="navigation">
                    <Block query={query} density={density} name="Tabs (underline)" source="src/components/ui/tabs.tsx" used={['Library tabs', 'admin pages']}>
                      <Tabs defaultValue="a" className="w-full">
                        <TabsList><TabsTrigger value="a">Tab A</TabsTrigger><TabsTrigger value="b">Tab B</TabsTrigger></TabsList>
                        <TabsContent value="a" className="text-sm pt-2">A content</TabsContent>
                        <TabsContent value="b" className="text-sm pt-2">B content</TabsContent>
                      </Tabs>
                    </Block>
                    <Block query={query} density={density} name="NavigationMenu" source="src/components/ui/navigation-menu.tsx" used={['marketing top nav']}>
                      <NavigationMenu>
                        <NavigationMenuList>
                          <NavigationMenuItem><NavigationMenuLink className="px-3 py-2 text-sm">Home</NavigationMenuLink></NavigationMenuItem>
                          <NavigationMenuItem><NavigationMenuLink className="px-3 py-2 text-sm">Pricing</NavigationMenuLink></NavigationMenuItem>
                        </NavigationMenuList>
                      </NavigationMenu>
                    </Block>
                    <Block query={query} density={density} name="Breadcrumb" source="src/components/ui/breadcrumb.tsx" used={['admin sub-pages']}>
                      <Breadcrumb>
                        <BreadcrumbList>
                          <BreadcrumbItem><BreadcrumbLink>Admin</BreadcrumbLink></BreadcrumbItem>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem><BreadcrumbPage>UI Audit</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                      </Breadcrumb>
                    </Block>
                    <Block query={query} density={density} name="Pagination" source="src/components/ui/pagination.tsx" used={['admin tables']}>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                          <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
                          <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
                          <PaginationItem><PaginationEllipsis /></PaginationItem>
                          <PaginationItem><PaginationNext href="#" /></PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </Block>
                    <Block query={query} density={density} name="Sidebar group label" source="src/components/app/AppShell.tsx" classes="text-[10px] uppercase tracking-widest text-muted-foreground" used={['AppShell sidebar headings']}>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-2">CREATE</div>
                    </Block>
                    <Block query={query} density={density} name="Sidebar nav item — active vs idle" source="src/components/app/AppShell.tsx" used={['AppShell sidebar items']}>
                      <div className="space-y-1 w-56">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-primary/10 text-primary font-medium"><Sparkles className="w-4 h-4" /> Active item</div>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-foreground/80"><Sparkles className="w-4 h-4" /> Idle item</div>
                      </div>
                    </Block>
                    <Block query={query} density={density} name="Top app bar pattern" source="src/components/app/AppShell.tsx" used={['mobile AppShell header']}>
                      <div className="w-full max-w-md rounded-xl border border-border bg-card flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2"><Menu className="w-4 h-4" /><span className="text-sm font-semibold">VOVV</span></div>
                        <Avatar className="h-7 w-7"><AvatarFallback>JD</AvatarFallback></Avatar>
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 9. DATA DISPLAY */}
                  <AuditSection title="09 · Data display" anchor="data">
                    <Block query={query} density={density} name="Table" source="src/components/ui/table.tsx" used={['src/pages/AdminFeedback.tsx', 'src/pages/AdminModels.tsx', 'src/pages/AdminScenes.tsx']}>
                      <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                          <TableRow><TableCell>Item A</TableCell><TableCell><Badge variant="secondary">Active</Badge></TableCell></TableRow>
                          <TableRow><TableCell>Item B</TableCell><TableCell><Badge variant="outline">Idle</Badge></TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </Block>
                    <Block query={query} density={density} name="Accordion" source="src/components/ui/accordion.tsx" used={['FAQ', 'admin advanced settings']}>
                      <Accordion type="single" collapsible className="w-full max-w-md">
                        <AccordionItem value="i1"><AccordionTrigger>Question A</AccordionTrigger><AccordionContent>Answer A</AccordionContent></AccordionItem>
                        <AccordionItem value="i2"><AccordionTrigger>Question B</AccordionTrigger><AccordionContent>Answer B</AccordionContent></AccordionItem>
                      </Accordion>
                    </Block>
                    <Block query={query} density={density} name="Collapsible" source="src/components/ui/collapsible.tsx" used={['admin scene editor sections']}>
                      <Collapsible className="w-full max-w-md">
                        <CollapsibleTrigger asChild><Button size="sm" variant="ghost">Toggle <ChevronDown className="w-3 h-3" /></Button></CollapsibleTrigger>
                        <CollapsibleContent className="text-sm pt-2">Hidden content</CollapsibleContent>
                      </Collapsible>
                    </Block>
                    <Block query={query} density={density} name="Separator" source="src/components/ui/separator.tsx" used={['between form sections']}>
                      <div className="w-full max-w-md"><div className="text-xs">Above</div><Separator className="my-2" /><div className="text-xs">Below</div></div>
                    </Block>
                    <Block query={query} density={density} name="ScrollArea" source="src/components/ui/scroll-area.tsx" used={['long lists in popovers']}>
                      <ScrollArea className="h-24 w-64 rounded-md border p-2 text-xs">
                        {Array.from({ length: 20 }).map((_, i) => <div key={i}>Row {i + 1}</div>)}
                      </ScrollArea>
                    </Block>
                    <Block query={query} density={density} name="Avatar (sizes)" source="src/components/ui/avatar.tsx" used={['user menu', 'team members']}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6"><AvatarFallback>S</AvatarFallback></Avatar>
                        <Avatar className="h-8 w-8"><AvatarFallback>M</AvatarFallback></Avatar>
                        <Avatar className="h-10 w-10"><AvatarFallback>L</AvatarFallback></Avatar>
                        <Avatar className="h-14 w-14"><AvatarFallback>XL</AvatarFallback></Avatar>
                      </div>
                    </Block>
                    <Block query={query} density={density} name="AspectRatio" source="src/components/ui/aspect-ratio.tsx" used={['generation thumbnails']}>
                      <div className="w-40"><AspectRatio ratio={4 / 5} className="rounded-lg bg-muted flex items-center justify-center"><ImageIcon className="w-6 h-6 text-muted-foreground" /></AspectRatio></div>
                    </Block>
                    <Block query={query} density={density} name="Progress" source="src/components/ui/progress.tsx" used={['generation progress', 'upload progress']}>
                      <Progress value={66} className="max-w-sm" />
                    </Block>
                    <Block query={query} density={density} name="Skeleton (line / circle / card)" source="src/components/ui/skeleton.tsx" used={['src/components/app/LibrarySkeletonGrid.tsx', 'card placeholders']}>
                      <div className="space-y-2 w-full max-w-sm">
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-40" /></div>
                        <Skeleton className="h-24 w-full rounded-xl" />
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 10. WORKFLOW SURFACES (real components!) */}
                  <AuditSection title="10 · Workflow surfaces" anchor="workflow" description="Real cards used on /app/workflows and inside generators.">
                    <Block query={query} density={density} name="WorkflowCardCompact (real)" source="src/components/app/WorkflowCardCompact.tsx" used={['src/pages/Workflows.tsx grid']}>
                      <div className="w-full max-w-xs">
                        <WorkflowCardCompact workflow={SAMPLE_WORKFLOW} onSelect={() => toast('Workflow selected')} />
                      </div>
                    </Block>
                    <Block query={query} density={density} name="FreestylePromptCard (real)" source="src/components/app/FreestylePromptCard.tsx" used={['src/pages/Workflows.tsx freestyle entry']}>
                      <div className="w-full max-w-xs">
                        <FreestylePromptCard onSelect={() => toast('Freestyle clicked')} />
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Activity card (running)" source="src/components/app/WorkflowActivityCard.tsx" used={['src/pages/Workflows.tsx top of page']}>
                      <div className="rounded-xl border border-border bg-card p-4 w-full max-w-md">
                        <div className="flex items-center justify-between"><div className="text-sm font-semibold">Generation in progress</div><StatusBadge status="generating" /></div>
                        <Progress value={42} className="mt-2" />
                        <div className="text-xs text-muted-foreground mt-2">3 of 6 images complete</div>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Generation phase card (Step 5)" source="src/pages/ProductImages.tsx (step 5)" used={['/app/generate/product-images step 5']}>
                      <div className="rounded-xl border border-border bg-card p-6 w-full max-w-md text-center">
                        <Sparkles className="w-10 h-10 mx-auto text-primary animate-pulse" />
                        <div className="text-sm font-semibold mt-3">Composing your scene</div>
                        <div className="text-xs text-muted-foreground mt-1">Phase 2 of 4 · Lighting</div>
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 11. WIZARD / STEPS */}
                  <AuditSection title="11 · Wizard / step patterns" anchor="wizard">
                    <Block query={query} density={density} mock name="Multi-step header (numbered)" source="src/pages/ProductImages.tsx 6-step header" used={['/app/generate/product-images', '/app/video/short-film', '/app/catalog-studio']}>
                      <div className="flex items-center gap-2 w-full overflow-auto">
                        {['Products', 'Shots', 'Setup', 'Models', 'Generate', 'Review'].map((s, i) => (
                          <div key={s} className="flex items-center gap-2 shrink-0">
                            <div className={cn('h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center', i === 2 ? 'bg-primary text-primary-foreground' : i < 2 ? 'bg-emerald-500/15 text-emerald-700' : 'bg-muted text-muted-foreground')}>{i + 1}</div>
                            <span className={cn('text-xs', i === 2 ? 'font-semibold' : 'text-muted-foreground')}>{s}</span>
                            {i < 5 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Anchor / derivative card (Catalog Studio)" source="src/pages/CatalogGenerate.tsx" used={['/app/catalog-studio']}>
                      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                        <div className="rounded-xl border-2 border-primary bg-card p-3 text-center">
                          <div className="aspect-square bg-muted rounded-lg mb-2" />
                          <div className="text-xs font-semibold">Anchor</div>
                        </div>
                        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-center">
                          <div className="aspect-square bg-muted/40 rounded-lg mb-2 flex items-center justify-center"><Plus className="w-5 h-5 text-muted-foreground" /></div>
                          <div className="text-xs text-muted-foreground">Derivative</div>
                        </div>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Wizard footer (sticky CTA bar)" source="ad-hoc wizards" used={['all wizards']}>
                      <div className="w-full max-w-md rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                        <Button variant="ghost" size="sm">Back</Button>
                        <div className="text-xs text-muted-foreground">Step 3 of 6</div>
                        <Button size="sm">Continue <ArrowRight className="w-3 h-3" /></Button>
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 12. GENERATION & LIBRARY */}
                  <AuditSection title="12 · Generation & Library cards" anchor="genlib">
                    <Block query={query} density={density} mock name="Generation preview tile" source="src/components/app/RecentCreationsGallery.tsx" used={['/app/library', 'lightbox grids']}>
                      <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="aspect-[4/5] rounded-lg border border-border bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button className="h-6 w-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"><Heart className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Block>
                    <Block query={query} density={density} name="Library asset card (real)" source="src/components/app/LibraryImageCard.tsx" used={['src/pages/Library or freestyle library views']}>
                      <div className="rounded-xl border border-border bg-card overflow-hidden w-full max-w-xs">
                        <div className="aspect-[4/5] bg-muted relative">
                          <Badge variant="secondary" className="absolute top-2 left-2 bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">Draft</Badge>
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">2h ago</div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-7 w-7"><ChevronDown className="w-3 h-3" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent><DropdownMenuItem>Mark Brand Ready</DropdownMenuItem><DropdownMenuItem>Publish</DropdownMenuItem></DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Lightbox header" source="src/components/app/ImageLightbox.tsx" used={['Library lightbox', 'Discover lightbox']}>
                      <div className="w-full max-w-lg rounded-xl border border-border bg-background flex items-center justify-between px-4 py-3">
                        <div className="text-sm font-semibold">Image · 2026-04-18</div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8"><Share2 className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8"><X className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </Block>
                    <Block query={query} density={density} name="Dashboard metric / stat card" source="src/components/app/MetricCard.tsx" used={['src/pages/Dashboard.tsx']}>
                      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                        {[{ k: 'Generated', v: '1,284' }, { k: 'Credits', v: '420' }, { k: 'Saved', v: '38' }].map((m) => (
                          <div key={m.k} className="rounded-xl border border-border bg-card p-4">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.k}</div>
                            <div className="text-xl font-bold mt-1">{m.v}</div>
                          </div>
                        ))}
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 13. PRICING & BILLING */}
                  <AuditSection title="13 · Pricing & billing surfaces" anchor="pricing">
                    <Block query={query} density={density} name="Plan card (real)" source="src/components/app/PlanCard.tsx" used={['src/components/app/UpgradePlanModal.tsx', 'src/pages/AppPricing.tsx']}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                        {[
                          { name: 'Starter', price: '€19', highlight: false },
                          { name: 'Growth', price: '€49', highlight: true },
                          { name: 'Pro', price: '€99', highlight: false },
                        ].map((p) => (
                          <div key={p.name} className={cn('rounded-2xl border p-5', p.highlight ? 'border-primary bg-primary/5' : 'border-border bg-card')}>
                            <div className="text-sm font-semibold">{p.name}</div>
                            <div className="text-2xl font-bold mt-2">{p.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                            <Button className="w-full mt-3" size="sm" variant={p.highlight ? 'default' : 'outline'}>Choose</Button>
                          </div>
                        ))}
                      </div>
                    </Block>
                    <Block query={query} density={density} name="Credits balance pill" source="src/components/app/CreditIndicator.tsx" classes="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium" used={['src/components/app/AppShell.tsx sidebar bottom']}>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"><Zap className="w-3 h-3" /> 420 credits</span>
                    </Block>
                    <Block query={query} density={density} mock name="Stripe checkout return banner" source="ad-hoc" classes="rounded-lg bg-emerald-500/10 border border-emerald-500/30" used={['/app after Stripe redirect']}>
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" /> Subscription activated.
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 14. AUTH */}
                  <AuditSection title="14 · Auth surfaces" anchor="auth">
                    <Block query={query} density={density} mock name="Sign-in card" source="src/pages/Auth.tsx" used={['/auth']}>
                      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-3">
                        <div className="text-lg font-semibold">Sign in</div>
                        <Input placeholder="Email" />
                        <Input placeholder="Password" type="password" />
                        <Button className="w-full">Sign in</Button>
                        <Button variant="outline" className="w-full">Continue with Google</Button>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Magic link confirmation panel" source="src/pages/Auth.tsx (post-submit)" used={['/auth after submit']}>
                      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
                        <Bell className="w-8 h-8 mx-auto text-primary" />
                        <div className="text-sm font-semibold mt-2">Check your email</div>
                        <div className="text-xs text-muted-foreground mt-1">We sent a sign-in link to your inbox.</div>
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 15. MARKETING */}
                  <AuditSection title="15 · Marketing snippets (NOT /app)" anchor="marketing" description="Premium aesthetics from landing — clearly distinct from in-app design.">
                    <Block query={query} density={density} mock name="Premium hero heading" source="src/pages/Landing.tsx" used={['/ landing', '/seo/* landing']}>
                      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">Premium hero</h1>
                    </Block>
                    <Block query={query} density={density} mock name="Marquee chip" source="ad-hoc landing" classes="rounded-full border border-border bg-background px-3 py-1 text-xs" used={['landing brand marquee']}>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs"><Star className="w-3 h-3" /> Featured by …</span>
                    </Block>
                    <Block query={query} density={density} mock name="CTA gradient button" source="landing only" classes="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground" used={['landing CTAs only']}>
                      <button className="h-11 px-6 rounded-full bg-gradient-to-r from-primary to-primary/70 text-primary-foreground text-sm font-semibold">Start free</button>
                    </Block>
                  </AuditSection>

                  {/* 16. FORMS IN THE WILD */}
                  <AuditSection title="16 · Forms in the wild" anchor="forms-wild">
                    <Block query={query} density={density} name="Search + filter bar" source="ad-hoc — Library / Discover" used={['/app/library', '/app/discover']}>
                      <div className="w-full max-w-xl flex items-center gap-2">
                        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search…" className="pl-9" /></div>
                        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Bulk action toolbar" source="Library bulk select" used={['/app/library after selecting items']}>
                      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-2 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground pl-2">3 selected</div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost"><Download className="w-3 h-3" /> Download</Button>
                          <Button size="sm" variant="ghost"><Trash2 className="w-3 h-3" /> Delete</Button>
                        </div>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Admin scene editor row" source="src/pages/AdminScenes.tsx" used={['/app/admin/scenes']}>
                      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-3 grid grid-cols-[60px_1fr_auto] items-center gap-3">
                        <div className="aspect-square bg-muted rounded-md" />
                        <div><div className="text-sm font-semibold">Scene name</div><div className="text-xs text-muted-foreground">scene_038 · prompt-only</div></div>
                        <div className="flex items-center gap-2"><Switch /><Button size="sm" variant="ghost"><Eye className="w-3 h-3" /></Button></div>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Model overrides toggle row" source="src/pages/AdminModels.tsx" used={['/app/admin/models']}>
                      <div className="w-full max-w-md rounded-lg border border-border bg-card p-3 flex items-center justify-between">
                        <div><div className="text-sm font-semibold">Hide model</div><div className="text-xs text-muted-foreground">From public landing gallery</div></div>
                        <Switch />
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 17. STATUS CHIPS */}
                  <AuditSection title="17 · Status / state chips" anchor="status">
                    <Block query={query} density={density} name="Generation states (StatusBadge — canonical)" source="src/components/app/StatusBadge.tsx" used={['Activity cards', 'Library status']}>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status="queued" />
                        <StatusBadge status="generating" />
                        <StatusBadge status="completed" />
                        <StatusBadge status="failed" />
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="⚠ ad-hoc generation pills (drift)" source="ad-hoc — Library/Activity surfaces" used={['various activity / library cards']}>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground"><Clock className="w-3 h-3" /> Queued</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-blue-500/10 text-blue-600"><Loader2 className="w-3 h-3 animate-spin" /> Running</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-600"><Check className="w-3 h-3" /> Completed</span>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-red-500/10 text-red-600"><X className="w-3 h-3" /> Failed</span>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Library asset states" source="library_asset_status table" used={['/app/library asset cards']}>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full px-2 py-0.5 text-xs bg-amber-500/15 text-amber-700">Draft</span>
                        <span className="rounded-full px-2 py-0.5 text-xs bg-blue-500/15 text-blue-700">Brand Ready</span>
                        <span className="rounded-full px-2 py-0.5 text-xs bg-emerald-500/15 text-emerald-700">Published</span>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Trend Watch sync status" source="watch_accounts table" used={['/app/admin/trend-watch']}>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground">idle</span>
                        <span className="rounded-full px-2 py-0.5 text-xs bg-blue-500/10 text-blue-600">syncing</span>
                        <span className="rounded-full px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-600">synced</span>
                        <span className="rounded-full px-2 py-0.5 text-xs bg-red-500/10 text-red-600">error</span>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Video processing chip" source="generated_videos.status" used={['/app/video/* video cards']}>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-600"><Play className="w-3 h-3" /> Processing video…</span>
                    </Block>
                  </AuditSection>

                  {/* 18. LOADING & EMPTY */}
                  <AuditSection title="18 · Loading & empty states" anchor="loading">
                    <Block query={query} density={density} name="Full-page loader" source="src/components/app/AppShellLoading.tsx" used={['route boundaries', 'admin guard']}>
                      <div className="w-full h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    </Block>
                    <Block query={query} density={density} name="Inline spinner with text" source="ad-hoc" used={['inline async actions']}>
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…</span>
                    </Block>
                    <Block query={query} density={density} mock name="Branded animated phase icon" source="src/pages/ProductImages.tsx step 5" used={['/app/generate/product-images step 5']}>
                      <div className="flex items-center gap-3"><Sparkles className="w-8 h-8 text-primary animate-pulse" /><div className="text-sm">Composing scene…</div></div>
                    </Block>
                    <Block query={query} density={density} name="Empty state card (real)" source="src/components/app/EmptyStateCard.tsx" used={['/app/library when 0 assets', 'activity empty']}>
                      <div className="w-full max-w-md rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                        <div className="text-sm font-semibold mt-2">No images yet</div>
                        <div className="text-xs text-muted-foreground mt-1">Generate your first one to get started.</div>
                        <Button size="sm" className="mt-3">Create</Button>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Error retry card" source="ad-hoc" used={['failed network requests']}>
                      <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                        <div className="text-sm font-semibold text-destructive">Couldn't load</div>
                        <div className="text-xs text-muted-foreground mt-1">Check your connection and try again.</div>
                        <Button size="sm" variant="outline" className="mt-3">Retry</Button>
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 19. LIGHTBOX & OVERLAYS */}
                  <AuditSection title="19 · Lightbox & overlays" anchor="lightbox">
                    <Block query={query} density={density} mock name="Lightbox toolbar (download/share)" source="src/components/app/ImageLightbox.tsx" used={['Library lightbox', 'Discover lightbox']}>
                      <div className="rounded-xl bg-foreground text-background px-4 py-2 flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-background hover:bg-background/10"><Download className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-background hover:bg-background/10"><Share2 className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-background hover:bg-background/10"><Heart className="w-4 h-4" /></Button>
                      </div>
                    </Block>
                    <Block query={query} density={density} mock name="Keyboard hints" source="src/components/app/ImageLightbox.tsx footer" used={['lightbox shortcuts']}>
                      <div className="flex gap-2 text-xs text-muted-foreground items-center">
                        <kbd className="font-mono px-1.5 py-0.5 rounded border border-border bg-muted">←</kbd>
                        <kbd className="font-mono px-1.5 py-0.5 rounded border border-border bg-muted">→</kbd>
                        <span>Navigate</span>
                        <kbd className="font-mono px-1.5 py-0.5 rounded border border-border bg-muted">Esc</kbd>
                        <span>Close</span>
                      </div>
                    </Block>
                  </AuditSection>

                  {/* 20. MOBILE PATTERNS */}
                  <AuditSection title="20 · Mobile-specific patterns" anchor="mobile">
                    <Block query={query} density={density} name="Mobile sidebar trigger" source="src/components/app/AppShell.tsx" used={['mobile AppShell']}>
                      <Button variant="outline" size="icon"><Menu className="w-4 h-4" /></Button>
                    </Block>
                    <Block query={query} density={density} mock name="Mobile sticky CTA" source="ad-hoc" used={['wizards on mobile']}>
                      <div className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-lg p-3 flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="flex-1">Back</Button>
                        <Button size="sm" className="flex-[2]">Continue</Button>
                      </div>
                    </Block>
                    <Block query={query} density={density} name="Compact pill row (4 fits 390px)" source="src/components/app/FreestylePromptCard.tsx" used={['mobile freestyle card']}>
                      <div className="flex gap-1 max-w-[280px]">
                        {['Scene', 'Model', 'Product', 'Send'].map((p) => (
                          <span key={p} className="rounded-full bg-card border border-border h-7 px-2 text-[10px] flex items-center">{p}</span>
                        ))}
                      </div>
                    </Block>
                    <Block query={query} density={density} name="Bottom sheet (Drawer)" source="src/components/ui/drawer.tsx" used={['mobile filter sheets']}>
                      <Drawer>
                        <DrawerTrigger asChild><Button variant="outline" size="sm">Open bottom sheet</Button></DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader><DrawerTitle>Filters</DrawerTitle></DrawerHeader>
                        </DrawerContent>
                      </Drawer>
                    </Block>
                  </AuditSection>

                  {/* 21. SPACING */}
                  <AuditSection title="21 · Layout & spacing" anchor="spacing" description="Real spacing values used across the app — visual rulers.">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      <SpacerBox query={query} tokenClass="gap-1" size={4} label="gap-1" />
                      <SpacerBox query={query} tokenClass="gap-2" size={8} label="gap-2" />
                      <SpacerBox query={query} tokenClass="gap-3" size={12} label="gap-3" />
                      <SpacerBox query={query} tokenClass="gap-4" size={16} label="gap-4" />
                      <SpacerBox query={query} tokenClass="gap-5" size={20} label="gap-5" />
                      <SpacerBox query={query} tokenClass="gap-6" size={24} label="gap-6" />
                      <SpacerBox query={query} tokenClass="gap-8" size={32} label="gap-8" />
                      <SpacerBox query={query} tokenClass="gap-10" size={40} label="gap-10" />
                      <SpacerBox query={query} tokenClass="gap-12" size={48} label="gap-12" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { t: 'Page padding', v: 'px-4 sm:px-6 py-6 (container)', u: 'all routes' },
                        { t: 'Section gap', v: 'space-y-8 sm:space-y-10 (PageHeader)', u: 'src/components/app/PageHeader.tsx' },
                        { t: 'Card padding (varies)', v: 'p-3 / p-4 / p-5 / p-6 ⚠ inconsistent', u: 'see Inconsistencies' },
                        { t: 'Title → subtitle', v: 'mt-1.5 (PageHeader)', u: 'src/components/app/PageHeader.tsx' },
                        { t: 'Form field spacing', v: 'space-y-1.5 inside / space-y-4 between', u: 'forms' },
                        { t: 'Button group gap', v: 'gap-2 / gap-3 ⚠ varies', u: 'modal footers' },
                      ].map((s) => (
                        <div key={s.t} className="rounded-xl border border-border p-4 text-xs space-y-1">
                          <div className="font-semibold">{s.t}</div>
                          <div className="font-mono text-muted-foreground">{s.v}</div>
                          <div className="text-[10px] text-muted-foreground/70">Used in: {s.u}</div>
                        </div>
                      ))}
                    </div>
                  </AuditSection>

                  {/* 22. TOKENS */}
                  <AuditSection title="22 · Borders / Radius / Shadows / Surfaces" anchor="tokens">
                    <div>
                      <div className="text-sm font-semibold mb-2">Radius scale</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {['rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'].map((r) => (
                          <RadiusBox key={r} query={query} radiusClass={r} label={r} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-2">Shadow scale</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {['shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'].map((s) => (
                          <ShadowBox key={s} query={query} shadowClass={s} label={s} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-2">Dividers</div>
                      <div className="space-y-3 max-w-md">
                        <div><div className="text-xs text-muted-foreground mb-1">border-b border-border</div><div className="border-b border-border h-0" /></div>
                        <div><div className="text-xs text-muted-foreground mb-1">Separator (ui/separator.tsx)</div><Separator /></div>
                      </div>
                    </div>
                  </AuditSection>

                  {/* 23. PATTERNS */}
                  <AuditSection title="23 · Page structure patterns" anchor="patterns">
                    <Block query={query} density={density} name="Page header pattern" source="src/components/app/PageHeader.tsx" used={['every /app top-level route']}>
                      <div className="flex items-start justify-between gap-3 w-full">
                        <div>
                          <h1 className="text-2xl font-bold tracking-tight">Page title</h1>
                          <p className="text-sm text-muted-foreground mt-1.5">Subtitle goes underneath</p>
                        </div>
                        <Button>Primary action</Button>
                      </div>
                    </Block>
                    <Block query={query} density={density} name="Empty state pattern" source="src/components/app/EmptyStateCard.tsx" used={['empty Library / Discover / Activity']}>
                      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center w-full max-w-md">
                        <Info className="w-6 h-6 mx-auto text-muted-foreground" />
                        <div className="text-sm font-medium mt-2">No items yet</div>
                        <div className="text-xs text-muted-foreground mt-1">Create your first one to get started.</div>
                        <Button size="sm" className="mt-3">Create</Button>
                      </div>
                    </Block>
                    <Block query={query} density={density} name="Modal structure (header / body / footer)" source="src/components/ui/dialog.tsx" used={['all dialogs']}>
                      <div className="rounded-lg border border-border bg-background overflow-hidden max-w-md w-full">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                          <div className="text-sm font-semibold">Modal title</div>
                          <button className="text-muted-foreground"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-4 text-sm">Body content goes here.</div>
                        <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/30">
                          <Button variant="ghost" size="sm">Cancel</Button>
                          <Button size="sm">Confirm</Button>
                        </div>
                      </div>
                    </Block>
                  </AuditSection>
                </>
              )}
            </div>
          </div>
        </PageHeader>
      </div>
    </TooltipProvider>
  );
}
