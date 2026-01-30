import { Button } from '@shopify/polaris';
import type { ModelGender, ModelBodyType, ModelAgeRange } from '@/types';

interface ModelFilterBarProps {
  genderFilter: ModelGender | 'all';
  bodyTypeFilter: ModelBodyType | 'all';
  ageFilter: ModelAgeRange | 'all';
  onGenderChange: (gender: ModelGender | 'all') => void;
  onBodyTypeChange: (bodyType: ModelBodyType | 'all') => void;
  onAgeChange: (age: ModelAgeRange | 'all') => void;
}

interface FilterGroup<T extends string> {
  label: string;
  options: Array<{ value: T | 'all'; label: string }>;
}

const genderOptions: FilterGroup<ModelGender>['options'] = [
  { value: 'all', label: 'All' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const bodyTypeOptions: FilterGroup<ModelBodyType>['options'] = [
  { value: 'all', label: 'All' },
  { value: 'slim', label: 'Slim' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'average', label: 'Average' },
  { value: 'plus-size', label: 'Plus Size' },
];

const ageOptions: FilterGroup<ModelAgeRange>['options'] = [
  { value: 'all', label: 'All' },
  { value: 'young-adult', label: 'Young Adult' },
  { value: 'adult', label: 'Adult' },
  { value: 'mature', label: 'Mature' },
];

export function ModelFilterBar({
  genderFilter,
  bodyTypeFilter,
  ageFilter,
  onGenderChange,
  onBodyTypeChange,
  onAgeChange,
}: ModelFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-surface-subdued rounded-xl border border-border">
      {/* Gender Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Gender:</span>
        <div className="flex flex-wrap gap-1.5">
          {genderOptions.map((option) => (
            <Button
              key={option.value}
              size="slim"
              pressed={genderFilter === option.value}
              onClick={() => onGenderChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Body Type Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Body Type:</span>
        <div className="flex flex-wrap gap-1.5">
          {bodyTypeOptions.map((option) => (
            <Button
              key={option.value}
              size="slim"
              pressed={bodyTypeFilter === option.value}
              onClick={() => onBodyTypeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Age Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Age:</span>
        <div className="flex flex-wrap gap-1.5">
          {ageOptions.map((option) => (
            <Button
              key={option.value}
              size="slim"
              pressed={ageFilter === option.value}
              onClick={() => onAgeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
