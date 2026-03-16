import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ModelGender, ModelBodyType, ModelAgeRange } from '@/types';

interface ModelFilterBarProps {
  genderFilter: ModelGender | 'all';
  bodyTypeFilter: ModelBodyType | 'all';
  ageFilter: ModelAgeRange | 'all';
  onGenderChange: (gender: ModelGender | 'all') => void;
  onBodyTypeChange: (bodyType: ModelBodyType | 'all') => void;
  onAgeChange: (age: ModelAgeRange | 'all') => void;
}

const genderOptions: Array<{ value: ModelGender | 'all'; label: string }> = [
  { value: 'all', label: 'All' }, { value: 'female', label: 'Female' }, { value: 'male', label: 'Male' },
];
const bodyTypeOptions: Array<{ value: ModelBodyType | 'all'; label: string }> = [
  { value: 'all', label: 'All' }, { value: 'slim', label: 'Slim' }, { value: 'athletic', label: 'Athletic' }, { value: 'average', label: 'Average' }, { value: 'plus-size', label: 'Plus Size' },
];
const ageOptions: Array<{ value: ModelAgeRange | 'all'; label: string }> = [
  { value: 'all', label: 'All' }, { value: 'young-adult', label: 'Young Adult' }, { value: 'adult', label: 'Adult' }, { value: 'mature', label: 'Mature' },
];

export function ModelFilterBar({ genderFilter, bodyTypeFilter, ageFilter, onGenderChange, onBodyTypeChange, onAgeChange }: ModelFilterBarProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const activeCount = [genderFilter, bodyTypeFilter, ageFilter].filter(f => f !== 'all').length;

  const filterRows = (
    <>
      <FilterRow label="Gender" options={genderOptions} value={genderFilter} onChange={onGenderChange} />
      <FilterRow label="Body Type" options={bodyTypeOptions} value={bodyTypeFilter} onChange={onBodyTypeChange} />
      <FilterRow label="Age" options={ageOptions} value={ageFilter} onChange={onAgeChange} />
    </>
  );

  if (isMobile) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-accent transition-colors w-full justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
              {activeCount > 0 && (
                <Badge variant="secondary" className="rounded-full px-1.5 h-5 min-w-5 text-[10px] flex items-center justify-center">
                  {activeCount}
                </Badge>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="flex flex-col gap-3 p-3 bg-muted rounded-xl border border-border">
            {filterRows}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-xl border border-border">
      {filterRows}
    </div>
  );
}

function FilterRow<T extends string>({ label, options, value, onChange }: { label: string; options: Array<{ value: T; label: string }>; value: T; onChange: (val: T) => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-xs sm:text-sm font-medium text-muted-foreground sm:min-w-[80px]">{label}:</span>
      <div className="flex flex-wrap gap-1 sm:gap-1.5">
        {options.map((option) => (
          <Button key={option.value} size="sm" variant={value === option.value ? 'default' : 'outline'} onClick={() => onChange(option.value)} className="h-7 text-xs">
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
