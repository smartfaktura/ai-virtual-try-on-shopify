import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, UserX, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModelProfile } from '@/types';

interface CatalogStepModelsV2Props {
  libraryModels: ModelProfile[];
  userModels: ModelProfile[];
  selectedModelIds: Set<string>;
  productOnlyMode: boolean;
  onModelToggle: (id: string) => void;
  onProductOnlyToggle: () => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export function CatalogStepModelsV2({
  libraryModels, userModels, selectedModelIds, productOnlyMode, onModelToggle, onProductOnlyToggle,
  onBack, onNext, canProceed,
}: CatalogStepModelsV2Props) {
  const selectionLabel = productOnlyMode
    ? 'Product Only'
    : selectedModelIds.size === 0
      ? 'None'
      : `${selectedModelIds.size} model${selectedModelIds.size > 1 ? 's' : ''} selected`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Select Models</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Pick one or more models — each multiplies your shot count. Or choose product-only.
        </p>
        {selectedModelIds.size > 0 && !productOnlyMode && (
          <Badge variant="default" className="mt-2 text-[10px]">{selectionLabel}</Badge>
        )}
      </div>

      {/* No Model card */}
      <button
        onClick={onProductOnlyToggle}
        className={cn(
          'w-full rounded-lg border p-4 text-left transition-all flex items-center gap-3',
          productOnlyMode
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/30 bg-card',
        )}
      >
        <div className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center',
          productOnlyMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}>
          <UserX className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">No Model — Product Only</p>
          <p className="text-[11px] text-muted-foreground">Packshots, flat lays, and product-focused images</p>
        </div>
        {productOnlyMode && (
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-primary-foreground" />
          </div>
        )}
      </button>

      {/* Library Models */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Library Models</span>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {libraryModels.map(model => (
            <ModelSelectorCard
              key={model.modelId}
              model={model}
              isSelected={selectedModelIds.has(model.modelId)}
              onSelect={() => onModelToggle(model.modelId)}
            />
          ))}
        </div>
      </div>

      {/* User Models */}
      {userModels.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Models</span>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {userModels.map(model => (
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
        <Button onClick={onNext} disabled={!canProceed} className="gap-2">
          Next: Background <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
