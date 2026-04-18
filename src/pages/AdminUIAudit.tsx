import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, Search, AlertTriangle, Check, Info, X } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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

function AuditSection({
  title,
  anchor,
  description,
  children,
}: {
  title: string;
  anchor: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={anchor} className="scroll-mt-24 space-y-4">
      <div className="border-b border-border pb-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function SpecRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs border-b border-border/50 py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground/90 truncate">{value || '—'}</span>
    </div>
  );
}

function SpecPanel({
  name,
  source,
  classes,
  computed,
}: {
  name: string;
  source?: string;
  classes?: string;
  computed?: Record<string, string>;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1 min-w-[220px]">
      <div className="font-semibold text-foreground">{name}</div>
      {source && <div className="font-mono text-[10px] text-muted-foreground truncate">{source}</div>}
      {classes && (
        <div className="font-mono text-[10px] text-muted-foreground/80 break-all bg-background/50 rounded px-1.5 py-1 mt-1">
          {classes}
        </div>
      )}
      {computed && (
        <div className="mt-2 space-y-0">
          {Object.entries(computed).map(([k, v]) => (
            <SpecRow key={k} label={k} value={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExampleRow({
  example,
  spec,
}: {
  example: React.ReactNode;
  spec: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 items-start rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-start min-h-[60px]">{example}</div>
      <div>{spec}</div>
    </div>
  );
}

function SwatchBox({
  cssVar,
  label,
}: {
  cssVar: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div
        className="h-12 w-full rounded-md border border-border"
        style={{ background: `hsl(var(${cssVar}))` }}
      />
      <div className="text-xs">
        <div className="font-mono">{cssVar}</div>
        <div className="text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function RadiusBox({ radiusClass, label }: { radiusClass: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const c = useComputedStyle(ref, ['border-radius']);
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

function ShadowBox({ shadowClass, label }: { shadowClass: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const c = useComputedStyle(ref, ['box-shadow']);
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div
        ref={ref}
        className={cn('h-16 w-full rounded-lg bg-card border border-border', shadowClass)}
      />
      <div className="text-xs mt-2">
        <div className="font-mono">{label}</div>
        <div className="text-muted-foreground truncate" title={c['box-shadow']}>
          {c['box-shadow']?.slice(0, 40)}…
        </div>
      </div>
    </div>
  );
}

function SpacerBox({ size, label }: { size: number; label: string }) {
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

// ─── inconsistencies data ─────────────────────────────────────────────────────

const INCONSISTENCIES: Array<{
  title: string;
  why: string;
  suggested: string;
  variants: { label: string; node: React.ReactNode }[];
}> = [
  {
    title: 'Card padding drift',
    why: 'Three+ padding scales (p-3, p-4, p-5, p-6) used on visually similar cards across the app.',
    suggested: 'Standardize to p-4 (mobile) / p-5 (desktop) for content cards.',
    variants: [
      { label: 'p-3', node: <div className="rounded-xl border border-border bg-card p-3 w-44 h-20 text-xs">p-3 card</div> },
      { label: 'p-4', node: <div className="rounded-xl border border-border bg-card p-4 w-44 h-20 text-xs">p-4 card</div> },
      { label: 'p-5', node: <div className="rounded-xl border border-border bg-card p-5 w-44 h-20 text-xs">p-5 card</div> },
      { label: 'p-6', node: <div className="rounded-xl border border-border bg-card p-6 w-44 h-20 text-xs">p-6 card</div> },
    ],
  },
  {
    title: 'Button height conventions',
    why: 'Shadcn Button uses h-10/h-9/h-11; ad-hoc menu buttons in AppShell use raw <button class="h-10">.',
    suggested: 'Always use <Button> from components/ui/button.tsx; remove ad-hoc <button> styling.',
    variants: [
      { label: 'shadcn default (h-10)', node: <Button>Action</Button> },
      {
        label: 'ad-hoc menu button',
        node: (
          <button className="h-10 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors">
            Action
          </button>
        ),
      },
    ],
  },
  {
    title: 'Muted text variants',
    why: 'Three muted-text patterns coexist across pages.',
    suggested: 'Use text-muted-foreground exclusively; remove /60 and /80 opacity variants.',
    variants: [
      { label: 'text-muted-foreground', node: <p className="text-sm text-muted-foreground">Helper text</p> },
      { label: 'text-foreground/60', node: <p className="text-sm text-foreground/60">Helper text</p> },
      { label: 'text-foreground/80', node: <p className="text-sm text-foreground/80">Helper text</p> },
    ],
  },
  {
    title: 'Section label styles',
    why: 'Two patterns for tiny section headers — uppercase tracked vs muted xs.',
    suggested: 'Pick one (uppercase tracking-widest preferred for nav groups).',
    variants: [
      {
        label: 'uppercase tracking',
        node: <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Section</div>,
      },
      { label: 'plain xs muted', node: <div className="text-xs text-muted-foreground">Section</div> },
    ],
  },
  {
    title: 'Badge systems',
    why: 'Shadcn <Badge> coexists with custom .status-badge--* CSS classes.',
    suggested: 'Migrate status badges to shadcn Badge variants (add success/warning).',
    variants: [
      { label: 'shadcn Badge', node: <Badge>Default</Badge> },
      {
        label: 'inline pill',
        node: (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600">
            Success
          </span>
        ),
      },
    ],
  },
  {
    title: 'Radius drift on similar surfaces',
    why: 'Cards mix rounded-lg / rounded-xl / rounded-2xl on identical contexts.',
    suggested: 'Cards = rounded-xl, pills = rounded-full, inputs = rounded-md.',
    variants: [
      { label: 'rounded-lg', node: <div className="h-12 w-32 bg-card border border-border rounded-lg" /> },
      { label: 'rounded-xl', node: <div className="h-12 w-32 bg-card border border-border rounded-xl" /> },
      { label: 'rounded-2xl', node: <div className="h-12 w-32 bg-card border border-border rounded-2xl" /> },
    ],
  },
  {
    title: 'Heading scales',
    why: 'PageHeader uses text-2xl sm:text-3xl, but several admin pages render raw <h1 className="text-2xl">.',
    suggested: 'Always use <PageHeader title=… />.',
    variants: [
      { label: 'PageHeader title', node: <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Page title</h1> },
      { label: 'raw text-2xl', node: <h1 className="text-2xl font-semibold">Page title</h1> },
    ],
  },
];

// ─── TOC ──────────────────────────────────────────────────────────────────────

const TOC = [
  { id: 'typography', label: '1. Typography' },
  { id: 'buttons', label: '2. Buttons' },
  { id: 'inputs', label: '3. Inputs' },
  { id: 'cards', label: '4. Cards' },
  { id: 'badges', label: '5. Badges' },
  { id: 'spacing', label: '6. Spacing' },
  { id: 'tokens', label: '7. Borders / Radius / Shadows' },
  { id: 'patterns', label: '8. Page patterns' },
  { id: 'inconsistencies', label: '9. Inconsistencies' },
];

// ─── typography example ──────────────────────────────────────────────────────

function TypographyExample({
  className,
  text,
  name,
  source,
  tag = 'p',
}: {
  className: string;
  text: string;
  name: string;
  source: string;
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'label';
}) {
  const ref = useRef<HTMLElement>(null);
  const c = useComputedStyle(ref as any, ['font-size', 'font-weight', 'line-height', 'letter-spacing']);
  const Tag: any = tag;
  return (
    <ExampleRow
      example={<Tag ref={ref as any} className={className}>{text}</Tag>}
      spec={
        <SpecPanel
          name={name}
          source={source}
          classes={className}
          computed={{
            'font-size': c['font-size'],
            'font-weight': c['font-weight'],
            'line-height': c['line-height'],
            'letter-spacing': c['letter-spacing'],
          }}
        />
      }
    />
  );
}

// ─── button example ─────────────────────────────────────────────────────────

function ButtonExample({
  name,
  source,
  classes,
  children,
}: {
  name: string;
  source: string;
  classes?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const c = useComputedStyle(ref, ['height', 'padding', 'border-radius', 'font-size', 'font-weight']);
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="min-h-[44px] flex items-center">
        <span ref={(el) => { if (el) (ref as any).current = el.querySelector('button') as HTMLButtonElement; }}>
          {children}
        </span>
      </div>
      <div className="text-[10px] space-y-0.5">
        <div className="font-semibold">{name}</div>
        <div className="font-mono text-muted-foreground truncate">{source}</div>
        {classes && <div className="font-mono text-muted-foreground/80 break-all">{classes}</div>}
        <div className="font-mono text-muted-foreground/80">
          {c.height} · {c['border-radius']} · {c['font-size']}
        </div>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminUIAudit() {
  const { isRealAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isRealAdmin) return <Navigate to="/app" replace />;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      <PageHeader
        title="UI Style Audit"
        subtitle="Internal admin view — every style currently in use across /app, side-by-side, with computed values to identify inconsistencies before standardizing."
      >
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-8">
          {/* TOC */}
          <nav className="lg:sticky lg:top-4 lg:self-start space-y-1 rounded-xl border border-border bg-card p-3 h-fit">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 pb-2">
              Sections
            </div>
            {TOC.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="block px-2 py-1.5 text-sm rounded-md hover:bg-muted text-foreground/80 hover:text-foreground transition-colors"
              >
                {t.label}
              </a>
            ))}
          </nav>

          {/* Content */}
          <div className="space-y-12 min-w-0">
            {/* 1. TYPOGRAPHY */}
            <AuditSection
              title="1. Typography"
              anchor="typography"
              description="Live samples + computed font-size, weight, line-height, letter-spacing."
            >
              <TypographyExample tag="h1" name="H1 — PageHeader title" source="components/app/PageHeader.tsx" className="text-2xl sm:text-3xl font-bold tracking-tight" text="Page title goes here" />
              <TypographyExample tag="h2" name="H2 — section header" source="ad-hoc, many pages" className="text-xl font-semibold tracking-tight" text="Section title" />
              <TypographyExample tag="h3" name="H3 — card title" source="components/ui/card.tsx" className="text-lg font-semibold" text="Card heading" />
              <TypographyExample tag="h4" name="H4 — sub-section" source="ad-hoc" className="text-base font-semibold" text="Sub-section" />
              <TypographyExample name="Body large" source="ad-hoc" className="text-base text-foreground" text="Body large paragraph used in feature pages." />
              <TypographyExample name="Body default" source="ad-hoc, default" className="text-sm text-foreground" text="Body default — most paragraphs in app." />
              <TypographyExample name="Body small" source="ad-hoc" className="text-xs text-foreground" text="Body small — dense table cells / metadata." />
              <TypographyExample name="Caption" source="ad-hoc" className="text-[11px] text-muted-foreground" text="CAPTION — image attribution / footnote" />
              <TypographyExample tag="label" name="Label" source="components/ui/label.tsx" className="text-sm font-medium" text="Field label" />
              <TypographyExample name="Helper text" source="ad-hoc" className="text-xs text-muted-foreground" text="Helper text — tip below an input." />
              <TypographyExample name="Muted text" source="design tokens" className="text-sm text-muted-foreground" text="Muted text — secondary content." />
              <TypographyExample tag="span" name="Button text" source="components/ui/button.tsx" className="text-sm font-medium" text="Button label" />
              <TypographyExample tag="span" name="Badge text" source="components/ui/badge.tsx" className="text-xs font-semibold" text="Badge" />
              <TypographyExample tag="span" name="Section label (uppercase)" source="ad-hoc, sidebar" className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground" text="OVERVIEW" />
            </AuditSection>

            {/* 2. BUTTONS */}
            <AuditSection
              title="2. Buttons"
              anchor="buttons"
              description="All shadcn variants × sizes, plus loading / disabled and ad-hoc patterns found in the wild."
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <ButtonExample name="default · default" source="ui/button.tsx"><Button>Default</Button></ButtonExample>
                <ButtonExample name="destructive · default" source="ui/button.tsx"><Button variant="destructive">Delete</Button></ButtonExample>
                <ButtonExample name="outline · default" source="ui/button.tsx"><Button variant="outline">Outline</Button></ButtonExample>
                <ButtonExample name="secondary · default" source="ui/button.tsx"><Button variant="secondary">Secondary</Button></ButtonExample>
                <ButtonExample name="ghost · default" source="ui/button.tsx"><Button variant="ghost">Ghost</Button></ButtonExample>
                <ButtonExample name="link · default" source="ui/button.tsx"><Button variant="link">Link</Button></ButtonExample>
                <ButtonExample name="default · sm" source="ui/button.tsx"><Button size="sm">Small</Button></ButtonExample>
                <ButtonExample name="default · lg" source="ui/button.tsx"><Button size="lg">Large</Button></ButtonExample>
                <ButtonExample name="default · icon" source="ui/button.tsx"><Button size="icon"><Search /></Button></ButtonExample>
                <ButtonExample name="loading" source="ad-hoc"><Button disabled><Loader2 className="animate-spin" />Loading</Button></ButtonExample>
                <ButtonExample name="disabled" source="ui/button.tsx"><Button disabled>Disabled</Button></ButtonExample>
                <ButtonExample
                  name="⚠ ad-hoc menu button"
                  source="components/app/AppShell.tsx"
                  classes="h-10 px-3 py-2 text-sm hover:bg-muted rounded-md"
                >
                  <button className="h-10 px-3 py-2 text-sm hover:bg-muted rounded-md w-full text-left">
                    Menu item
                  </button>
                </ButtonExample>
                <ButtonExample
                  name="⚠ ad-hoc primary"
                  source="freestyle send"
                  classes="bg-primary text-primary-foreground rounded-full h-10 px-5"
                >
                  <button className="bg-primary text-primary-foreground rounded-full h-10 px-5 text-sm font-medium">
                    Send
                  </button>
                </ButtonExample>
              </div>
            </AuditSection>

            {/* 3. INPUTS */}
            <AuditSection title="3. Inputs / form controls" anchor="inputs">
              <ExampleRow
                example={<Input placeholder="Text input" className="max-w-sm" />}
                spec={<SpecPanel name="Input" source="components/ui/input.tsx" classes="h-10 rounded-md border border-input bg-background" />}
              />
              <ExampleRow
                example={<Textarea placeholder="Textarea" className="max-w-sm" />}
                spec={<SpecPanel name="Textarea" source="components/ui/textarea.tsx" classes="min-h-[80px] rounded-md border" />}
              />
              <ExampleRow
                example={
                  <Select>
                    <SelectTrigger className="max-w-sm"><SelectValue placeholder="Select option" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">Option A</SelectItem>
                      <SelectItem value="b">Option B</SelectItem>
                    </SelectContent>
                  </Select>
                }
                spec={<SpecPanel name="Select" source="components/ui/select.tsx" />}
              />
              <ExampleRow
                example={
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search…" className="pl-9" />
                  </div>
                }
                spec={<SpecPanel name="Search input pattern" source="ad-hoc" classes="pl-9 + absolute icon" />}
              />
              <ExampleRow
                example={
                  <div className="flex items-center gap-3">
                    <Switch id="audit-switch" />
                    <Label htmlFor="audit-switch">Switch</Label>
                  </div>
                }
                spec={<SpecPanel name="Switch + Label" source="ui/switch.tsx" />}
              />
              <ExampleRow
                example={
                  <div className="flex items-center gap-3">
                    <Checkbox id="audit-cb" />
                    <Label htmlFor="audit-cb">Checkbox</Label>
                  </div>
                }
                spec={<SpecPanel name="Checkbox" source="ui/checkbox.tsx" />}
              />
              <ExampleRow
                example={
                  <RadioGroup defaultValue="a" className="flex gap-4">
                    <div className="flex items-center gap-2"><RadioGroupItem value="a" id="ra" /><Label htmlFor="ra">A</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="b" id="rb" /><Label htmlFor="rb">B</Label></div>
                  </RadioGroup>
                }
                spec={<SpecPanel name="RadioGroup" source="ui/radio-group.tsx" />}
              />
              <ExampleRow
                example={
                  <div className="space-y-1.5 max-w-sm w-full">
                    <Label htmlFor="err">Email</Label>
                    <Input id="err" defaultValue="bad@" className="border-destructive focus-visible:ring-destructive" />
                    <p className="text-xs text-destructive">Invalid email address</p>
                  </div>
                }
                spec={<SpecPanel name="Field with error" source="ad-hoc" classes="border-destructive + text-destructive" />}
              />
            </AuditSection>

            {/* 4. CARDS */}
            <AuditSection title="4. Cards / containers" anchor="cards">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="text-sm font-semibold">Card (shadcn default)</div>
                  <div className="text-xs text-muted-foreground mt-1">components/ui/card.tsx · rounded-lg border bg-card</div>
                </Card>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="text-sm font-semibold">card-elevated (rounded-xl + shadow-sm)</div>
                  <div className="text-xs text-muted-foreground mt-1">ad-hoc · WorkflowCardCompact</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
                  <div className="text-sm font-semibold">card-luxury (rounded-2xl + shadow-md + p-6)</div>
                  <div className="text-xs text-muted-foreground mt-1">ad-hoc · landing / pricing</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold mt-1">1,284</div>
                </div>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                  <div className="text-sm font-medium">Empty state</div>
                  <div className="text-xs text-muted-foreground mt-1">Nothing here yet</div>
                </div>
                <div className="rounded-lg border border-border bg-card divide-y divide-border">
                  <div className="px-4 py-3 text-sm">List row 1</div>
                  <div className="px-4 py-3 text-sm">List row 2</div>
                  <div className="px-4 py-3 text-sm">List row 3</div>
                </div>
              </div>
            </AuditSection>

            {/* 5. BADGES */}
            <AuditSection title="5. Badges / chips / status pills" anchor="badges">
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
              </div>
            </AuditSection>

            {/* 6. SPACING */}
            <AuditSection
              title="6. Layout & spacing"
              anchor="spacing"
              description="Real spacing values used across the app — visual rulers."
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <SpacerBox size={4} label="gap-1" />
                <SpacerBox size={8} label="gap-2" />
                <SpacerBox size={12} label="gap-3" />
                <SpacerBox size={16} label="gap-4" />
                <SpacerBox size={20} label="gap-5" />
                <SpacerBox size={24} label="gap-6" />
                <SpacerBox size={32} label="gap-8" />
                <SpacerBox size={40} label="gap-10" />
                <SpacerBox size={48} label="gap-12" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4 text-xs space-y-1">
                  <div className="font-semibold">Page padding</div>
                  <div className="font-mono text-muted-foreground">px-4 sm:px-6 py-6 (container)</div>
                </div>
                <div className="rounded-xl border border-border p-4 text-xs space-y-1">
                  <div className="font-semibold">Section gap</div>
                  <div className="font-mono text-muted-foreground">space-y-8 sm:space-y-10 (PageHeader)</div>
                </div>
                <div className="rounded-xl border border-border p-4 text-xs space-y-1">
                  <div className="font-semibold">Card padding (varies)</div>
                  <div className="font-mono text-muted-foreground">p-3 / p-4 / p-5 / p-6 ⚠ inconsistent</div>
                </div>
                <div className="rounded-xl border border-border p-4 text-xs space-y-1">
                  <div className="font-semibold">Title → subtitle</div>
                  <div className="font-mono text-muted-foreground">mt-1.5 (PageHeader)</div>
                </div>
                <div className="rounded-xl border border-border p-4 text-xs space-y-1">
                  <div className="font-semibold">Form field spacing</div>
                  <div className="font-mono text-muted-foreground">space-y-1.5 inside field, space-y-4 between</div>
                </div>
                <div className="rounded-xl border border-border p-4 text-xs space-y-1">
                  <div className="font-semibold">Button group gap</div>
                  <div className="font-mono text-muted-foreground">gap-2 / gap-3 ⚠ varies</div>
                </div>
              </div>
            </AuditSection>

            {/* 7. TOKENS */}
            <AuditSection title="7. Borders / Radius / Shadows / Surfaces" anchor="tokens">
              <div>
                <div className="text-sm font-semibold mb-2">Surface tokens</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <SwatchBox cssVar="--background" label="background" />
                  <SwatchBox cssVar="--foreground" label="foreground" />
                  <SwatchBox cssVar="--card" label="card" />
                  <SwatchBox cssVar="--popover" label="popover" />
                  <SwatchBox cssVar="--muted" label="muted" />
                  <SwatchBox cssVar="--accent" label="accent" />
                  <SwatchBox cssVar="--primary" label="primary" />
                  <SwatchBox cssVar="--secondary" label="secondary" />
                  <SwatchBox cssVar="--destructive" label="destructive" />
                  <SwatchBox cssVar="--border" label="border" />
                  <SwatchBox cssVar="--input" label="input" />
                  <SwatchBox cssVar="--ring" label="ring" />
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Radius scale</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <RadiusBox radiusClass="rounded-sm" label="rounded-sm" />
                  <RadiusBox radiusClass="rounded-md" label="rounded-md" />
                  <RadiusBox radiusClass="rounded-lg" label="rounded-lg" />
                  <RadiusBox radiusClass="rounded-xl" label="rounded-xl" />
                  <RadiusBox radiusClass="rounded-2xl" label="rounded-2xl" />
                  <RadiusBox radiusClass="rounded-full" label="rounded-full" />
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Shadow scale</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <ShadowBox shadowClass="shadow-none" label="shadow-none" />
                  <ShadowBox shadowClass="shadow-sm" label="shadow-sm" />
                  <ShadowBox shadowClass="shadow" label="shadow" />
                  <ShadowBox shadowClass="shadow-md" label="shadow-md" />
                  <ShadowBox shadowClass="shadow-lg" label="shadow-lg" />
                  <ShadowBox shadowClass="shadow-xl" label="shadow-xl" />
                  <ShadowBox shadowClass="shadow-2xl" label="shadow-2xl" />
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Dividers</div>
                <div className="space-y-3 max-w-md">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">border-b border-border</div>
                    <div className="border-b border-border h-0" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Separator (ui/separator.tsx)</div>
                    <Separator />
                  </div>
                </div>
              </div>
            </AuditSection>

            {/* 8. PATTERNS */}
            <AuditSection title="8. Page structure patterns" anchor="patterns">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Page header pattern</div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Page title</h1>
                    <p className="text-sm text-muted-foreground mt-1.5">Subtitle goes underneath</p>
                  </div>
                  <Button>Primary action</Button>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Empty state pattern</div>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                  <Info className="w-6 h-6 mx-auto text-muted-foreground" />
                  <div className="text-sm font-medium mt-2">No items yet</div>
                  <div className="text-xs text-muted-foreground mt-1">Create your first one to get started.</div>
                  <Button size="sm" className="mt-3">Create</Button>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Modal structure</div>
                <div className="rounded-lg border border-border bg-background overflow-hidden max-w-md">
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
              </div>
            </AuditSection>

            {/* 9. INCONSISTENCIES */}
            <AuditSection
              title="9. Inconsistencies / likely duplicates"
              anchor="inconsistencies"
              description="Manually curated drift to resolve before standardizing."
            >
              <div className="space-y-4">
                {INCONSISTENCIES.map((item) => (
                  <div key={item.title} className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.why}</div>
                        <div className="text-xs mt-1">
                          <span className="font-semibold text-emerald-700">Suggested: </span>
                          <span className="text-foreground/80">{item.suggested}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {item.variants.map((v) => (
                            <div key={v.label} className="rounded-lg border border-border bg-card p-3 space-y-2">
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{v.label}</div>
                              <div>{v.node}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AuditSection>
          </div>
        </div>
      </PageHeader>
    </div>
  );
}
