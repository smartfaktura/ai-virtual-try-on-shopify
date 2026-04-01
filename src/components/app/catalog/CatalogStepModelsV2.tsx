import { useMemo } from 'react';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { ModelFilterBar } from '@/components/app/ModelFilterBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Users, UserX, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelProfile, ModelGender, ModelBodyType, ModelAgeRange } from '@/types';

interface CatalogStepModelsV2Props {
  libraryModels: ModelProfile[];
  userModels: ModelProfile[];
  selectedModelId: string | null;
  onModelSelect: (id: string | null) => void;
  genderFilter: ModelGender | 'all';
  bodyTypeFilter: ModelBodyType | 'all';
  ageFilter: ModelAgeRange | 'all';
  onGenderChange: (v: ModelGender | 'all') => void;
  onBodyTypeChange: (v: ModelBodyType | 'all') => void;
  onAgeChange: (v: ModelAgeRange | 'all') => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepModelsV2({
  libraryModels, userModels, selectedModelId, onModelSelect,
  genderFilter, bodyTypeFilter, ageFilter,
  onGenderChange, onBodyTypeChange, onAgeChange,
  onBack, onNext, canProceed,
}: CatalogStepModelsV2Props) {
  const filterModel = (m: ModelProfile) => {
    if (genderFilter !== 'all' && m.gender !== genderFilter) return false;
    if (bodyTypeFilter !== 'all' && m.bodyType !== bodyTypeFilter) return false;
    if (ageFilter !== 'all' && m.ageRange !== ageFilter) return false;
    return true;
  };

  const filteredLibrary = useMemo(() => libraryModels.filter(filterModel), [libraryModels, genderFilter, bodyTypeFilter, ageFilter]);
  const filteredUser = useMemo(() => userModels.filter(filterModel), [userModels, genderFilter, bodyTypeFilter, ageFilter]);

  const isNoModel = selectedModelId === null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Select Model</h3>
        <Badge variant="secondary" className="text-[10px]">
          {isNoModel ? 'Product Only' : '1 selected'}
        </Badge>
        <span className="text-xs text-muted-foreground ml-1">Choose one model or product-only mode</span>
      </div>

      {/* No Model card */}
      <button
        onClick={() => onModelSelect(null)}
        className={cn(
          'w-full rounded-xl border-2 p-4 text-left transition-all flex items-center gap-3',
          isNoModel
            ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
            : 'border-border hover:border-primary/50 bg-card',
        )}
      >
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isNoModel ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}>
          <UserX className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">No Model — Product Only</p>
          <p className="text-[11px] text-muted-foreground">Generate packshots, flat lays, and product-focused images only</p>
        </div>
        {isNoModel && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </button>

      <ModelFilterBar
        genderFilter={genderFilter}
        bodyTypeFilter={bodyTypeFilter}
        ageFilter={ageFilter}
        onGenderChange={onGenderChange}
        onBodyTypeChange={onBodyTypeChange}
        onAgeChange={onAgeChange}
      />

      {/* Library Models */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Library Models</span>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 rounded-xl border border-border p-2">
          {filteredLibrary.map(model => (
            <ModelSelectorCard
              key={model.modelId}
              model={model}
              isSelected={selectedModelId === model.modelId}
              onSelect={() => onModelSelect(model.modelId)}
            />
          ))}
          {filteredLibrary.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground py-8">No models match filters</p>
          )}
        </div>
      </div>

      {/* User Models */}
      {filteredUser.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Models</span>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 rounded-xl border border-border p-2">
            {filteredUser.map(model => (
              <ModelSelectorCard
                key={model.modelId}
                model={model}
                isSelected={selectedModelId === model.modelId}
                onSelect={() => onModelSelect(model.modelId)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Next: Background <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
