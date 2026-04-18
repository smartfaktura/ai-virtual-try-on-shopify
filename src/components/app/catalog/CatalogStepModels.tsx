import { useMemo } from 'react';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { ModelFilterBar } from '@/components/app/ModelFilterBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import type { ModelProfile, ModelGender, ModelBodyType, ModelAgeRange } from '@/types';

interface CatalogStepModelsProps {
  libraryModels: ModelProfile[];
  userModels: ModelProfile[];
  selectedModelIds: Set<string>;
  onModelToggle: (id: string) => void;
  genderFilter: ModelGender | 'all';
  bodyTypeFilter: ModelBodyType | 'all';
  ageFilter: ModelAgeRange | 'all';
  onGenderChange: (v: ModelGender | 'all') => void;
  onBodyTypeChange: (v: ModelBodyType | 'all') => void;
  onAgeChange: (v: ModelAgeRange | 'all') => void;
  maxModels: number;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepModels({
  libraryModels, userModels, selectedModelIds, onModelToggle,
  genderFilter, bodyTypeFilter, ageFilter,
  onGenderChange, onBodyTypeChange, onAgeChange,
  maxModels, onBack, onNext, canProceed,
}: CatalogStepModelsProps) {
  const filterModel = (m: ModelProfile) => {
    if (genderFilter !== 'all' && m.gender !== genderFilter) return false;
    if (bodyTypeFilter !== 'all' && m.bodyType !== bodyTypeFilter) return false;
    if (ageFilter !== 'all' && m.ageRange !== ageFilter) return false;
    return true;
  };

  const filteredLibrary = useMemo(() => libraryModels.filter(filterModel), [libraryModels, genderFilter, bodyTypeFilter, ageFilter]);
  const filteredUser = useMemo(() => userModels.filter(filterModel), [userModels, genderFilter, bodyTypeFilter, ageFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Select Models</h3>
        <Badge variant="secondary" className="text-[10px]">{selectedModelIds.size}/{maxModels}</Badge>
        <span className="text-xs text-muted-foreground ml-1">Choose AI models to wear your products</span>
      </div>

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
              isSelected={selectedModelIds.has(model.modelId)}
              onSelect={() => onModelToggle(model.modelId)}
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
                isSelected={selectedModelIds.has(model.modelId)}
                onSelect={() => onModelToggle(model.modelId)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} size="pill" className="gap-2">
          Next: Backgrounds <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
