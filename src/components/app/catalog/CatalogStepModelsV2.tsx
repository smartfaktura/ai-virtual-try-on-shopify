import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, UserX, Check, Crown, Plus } from 'lucide-react';
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
  const navigate = useNavigate();
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');

  const filteredLibrary = useMemo(() => {
    if (genderFilter === 'all') return libraryModels;
    return libraryModels.filter(m => m.gender === genderFilter);
  }, [libraryModels, genderFilter]);

  const filteredUser = useMemo(() => {
    if (genderFilter === 'all') return userModels;
    return userModels.filter(m => m.gender === genderFilter);
  }, [userModels, genderFilter]);

  const selectionLabel = productOnlyMode
    ? 'Product Only'
    : selectedModelIds.size === 0
      ? 'None'
      : `${selectedModelIds.size} model${selectedModelIds.size > 1 ? 's' : ''} selected`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Select Models</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Pick one or more models — each multiplies your shot count. Or choose product-only.
          </p>
        </div>
        {selectedModelIds.size > 0 && !productOnlyMode && (
          <Badge variant="default" className="text-[10px] flex-shrink-0">{selectionLabel}</Badge>
        )}
      </div>

      {/* Product Only toggle */}
      <button
        onClick={onProductOnlyToggle}
        className={cn('outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'w-full rounded-xl border p-4 text-left transition-all duration-150 flex items-center gap-4',
          productOnlyMode
            ? 'border-primary ring-2 ring-primary/20 bg-card'
            : 'border-border hover:border-primary/30 bg-card hover:shadow-sm',
        )}
      >
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
          productOnlyMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}>
          <UserX className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">No Model — Product Only</p>
          <p className="text-[11px] text-muted-foreground">Packshots, flat lays, and product-focused images</p>
        </div>
        {productOnlyMode && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </button>

      {/* Gender filter */}
      <div className="flex items-center justify-between">
        <Tabs value={genderFilter} onValueChange={(v) => setGenderFilter(v as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-[11px] px-3 h-6">All</TabsTrigger>
            <TabsTrigger value="female" className="text-[11px] px-3 h-6">Women</TabsTrigger>
            <TabsTrigger value="male" className="text-[11px] px-3 h-6">Men</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* YOUR BRAND MODELS — shown first for upsell */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Crown className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Your Brand Models</span>
        </div>
        {filteredUser.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {filteredUser.map(model => (
              <ModelSelectorCard
                key={model.modelId}
                model={model}
                isSelected={selectedModelIds.has(model.modelId)}
                onSelect={() => onModelToggle(model.modelId)}
              />
            ))}
          </div>
        ) : (
          <button
            onClick={() => window.open('/app/brand-models', '_blank')}
            className="w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 p-5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Create Your Brand Model</p>
                <p className="text-[11px] text-muted-foreground">Generate a unique AI model for your brand's identity</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Library Models */}
      {filteredLibrary.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Library Models</span>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {filteredLibrary.map(model => (
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
