import { Button } from '@/components/ui/button';
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
  return (
    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-xl border border-border">
      <FilterRow label="Gender" options={genderOptions} value={genderFilter} onChange={onGenderChange} />
      <FilterRow label="Body Type" options={bodyTypeOptions} value={bodyTypeFilter} onChange={onBodyTypeChange} />
      <FilterRow label="Age" options={ageOptions} value={ageFilter} onChange={onAgeChange} />
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
