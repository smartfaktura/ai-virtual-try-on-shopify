import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CATEGORY_FAMILY_MAP, FAMILY_ORDER,
  SHOT_STYLE_LABEL, SUBJECT_LABEL, SETTING_LABEL,
} from '@/lib/sceneTaxonomy';
import type { SceneCounts } from '@/hooks/useSceneCounts';

interface SceneCatalogSidebarProps {
  counts: SceneCounts | undefined;
  selectedSubjects: string[];
  selectedShotStyles: string[];
  selectedSettings: string[];
  selectedCollections: string[];
  onToggle: (axis: 'subject' | 'shot_style' | 'setting' | 'collection', value: string) => void;
}

const SHOT_STYLES_IN_RAIL: Array<keyof typeof SHOT_STYLE_LABEL> = [
  'packshot', 'editorial', 'lifestyle', 'flatlay', 'macro', 'portrait', 'still-life', 'campaign',
];
const SETTINGS_IN_RAIL: Array<keyof typeof SETTING_LABEL> = [
  'studio', 'indoor', 'outdoor', 'surface', 'editorial-set',
];
const SUBJECTS_IN_RAIL: Array<keyof typeof SUBJECT_LABEL> = [
  'product-only', 'with-model', 'hands-only',
];

export function SceneCatalogSidebar({
  counts,
  selectedSubjects,
  selectedShotStyles,
  selectedSettings,
  selectedCollections,
  onToggle,
}: SceneCatalogSidebarProps) {
  // Group collections by family
  const families = useMemo(() => {
    const result: Record<string, Array<{ slug: string; count: number }>> = {};
    if (!counts) return result;
    for (const [slug, count] of Object.entries(counts.byCollection)) {
      const family = CATEGORY_FAMILY_MAP[slug] ?? 'Other';
      if (!result[family]) result[family] = [];
      result[family].push({ slug, count });
    }
    for (const list of Object.values(result)) {
      list.sort((a, b) => b.count - a.count);
    }
    return result;
  }, [counts]);

  const orderedFamilies = FAMILY_ORDER.filter(f => families[f]?.length);

  const renderRow = (
    label: string,
    count: number | undefined,
    active: boolean,
    onClick: () => void,
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left text-xs transition-colors',
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-foreground/80 hover:bg-muted/60',
      )}
    >
      <span className="truncate">{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span className={cn('text-[10px] tabular-nums', active ? 'text-primary' : 'text-muted-foreground')}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-border/40 overflow-y-auto bg-muted/20">
      <Accordion type="multiple" defaultValue={['shot', 'setting', 'family']} className="px-3 py-3">
        <AccordionItem value="shot" className="border-none">
          <AccordionTrigger className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70 py-2 hover:no-underline">
            Shot Types
          </AccordionTrigger>
          <AccordionContent className="space-y-0.5 pb-3">
            {SUBJECTS_IN_RAIL.map(s =>
              renderRow(
                SUBJECT_LABEL[s],
                counts?.bySubject[s],
                selectedSubjects.includes(s),
                () => onToggle('subject', s),
              ),
            )}
            <div className="h-2" />
            {SHOT_STYLES_IN_RAIL.map(s =>
              renderRow(
                SHOT_STYLE_LABEL[s],
                counts?.byShotStyle[s],
                selectedShotStyles.includes(s),
                () => onToggle('shot_style', s),
              ),
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="setting" className="border-none">
          <AccordionTrigger className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70 py-2 hover:no-underline">
            Settings
          </AccordionTrigger>
          <AccordionContent className="space-y-0.5 pb-3">
            {SETTINGS_IN_RAIL.map(s =>
              renderRow(
                SETTING_LABEL[s],
                counts?.bySetting[s],
                selectedSettings.includes(s),
                () => onToggle('setting', s),
              ),
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="family" className="border-none">
          <AccordionTrigger className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70 py-2 hover:no-underline">
            Product Families
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-3">
            {orderedFamilies.map(family => (
              <div key={family}>
                <p className="px-2 pb-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {family}
                </p>
                {families[family].map(({ slug, count }) =>
                  renderRow(
                    slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    count,
                    selectedCollections.includes(slug),
                    () => onToggle('collection', slug),
                  ),
                )}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
