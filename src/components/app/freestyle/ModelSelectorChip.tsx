import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronDown, X, Sparkles, Trash2, Crown, Check } from 'lucide-react';
import { mockModels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobilePickerSheet } from './MobilePickerSheet';
import { ModelCatalogModal } from './ModelCatalogModal';
import type { ModelProfile } from '@/types';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels, useDeleteUserModel } from '@/hooks/useUserModels';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';
import { MissingRequestBanner } from '@/components/app/MissingRequestBanner';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from '@/lib/brandedToast';

interface ModelSelectorChipProps {
  selectedModel: ModelProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (model: ModelProfile | null) => void;
  modal?: boolean;
  fullWidth?: boolean;
}

type GenderFilter = 'all' | 'female' | 'male';
type BodyFilter = 'all' | 'slim' | 'athletic' | 'average' | 'plus-size';

const GENDER_FILTERS: { value: GenderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const BODY_FILTERS: { value: BodyFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'slim', label: 'Slim' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'average', label: 'Average' },
  { value: 'plus-size', label: 'Plus' },
];

export function ModelSelectorChip({ selectedModel, open, onOpenChange, onSelect, modal, fullWidth }: ModelSelectorChipProps) {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [bodyFilter, setBodyFilter] = useState<BodyFilter>('all');
  const { asProfiles: customModels } = useCustomModels();
  const { asProfiles: userModelProfiles } = useUserModels();
  const deleteUserModel = useDeleteUserModel();
  const { sortModels, applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();
  const { plan } = useCredits();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const isPaidPlan = ['growth', 'pro', 'enterprise'].includes(plan);

  const userModelIds = new Set(userModelProfiles.map(m => m.modelId));

  const allModels = sortModels(filterHidden([...applyNameOverrides(applyOverrides(mockModels)), ...customModels, ...userModelProfiles]));

  const filtered = allModels.filter(m => {
    if (genderFilter !== 'all' && m.gender !== genderFilter) return false;
    if (bodyFilter !== 'all' && m.bodyType !== bodyFilter) return false;
    return true;
  });

  const handleDeleteUserModel = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dbId = modelId.replace('user-', '');
    deleteUserModel.mutate(dbId, {
      onSuccess: () => {
        toast.success('Model removed');
        if (selectedModel?.modelId === modelId) onSelect(null);
      },
      onError: () => toast.error('Failed to remove model'),
    });
  };

  const handleBrandModelClick = () => {
    onOpenChange(false);
    navigate('/app/models');
  };

  const triggerButton = (
    <button
      onClick={() => onOpenChange(!open)}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-colors min-w-0",
        fullWidth ? "w-full max-w-none" : "max-w-[140px]"
      )}
    >
      {selectedModel ? (
        <>
          <img src={getOptimizedUrl(selectedModel.previewUrl, { quality: 60 })} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
          <span className="truncate flex-1 min-w-0 text-left">{selectedModel.name}</span>
          <button
            onClick={e => { e.stopPropagation(); onSelect(null); }}
            className="ml-0.5 w-3.5 h-3.5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors shrink-0"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </>
      ) : (
        <>
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Model</span>
        </>
      )}
      <ChevronDown className="w-3 h-3 opacity-40 shrink-0" />
    </button>
  );

  const brandModelCard = (
    <button
      key="brand-model-cta"
      onClick={handleBrandModelClick}
      className="relative flex flex-col rounded-lg overflow-hidden border-2 transition-all duration-200 text-left border-dashed border-primary/30 hover:border-primary/50 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="w-full aspect-square bg-muted/60 flex flex-col items-center justify-center gap-1.5 p-2">
        <Sparkles className={cn("w-5 h-5", isPaidPlan ? "text-primary" : "text-muted-foreground")} />
        {!isPaidPlan && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-[8px] font-semibold text-primary uppercase tracking-wider">
            <Crown className="w-2.5 h-2.5" /> Growth
          </span>
        )}
      </div>
      <div className="px-1.5 py-1.5 bg-background text-center">
        <p className="text-[10px] font-medium text-foreground truncate">Brand Models</p>
        <p className="text-[8px] text-muted-foreground">
          {isPaidPlan ? 'Create your own' : 'Upgrade to unlock'}
        </p>
      </div>
    </button>
  );

  const filtersAndGrid = (
    <>
      {/* Header (desktop only — mobile sheet shows its own title) */}
      <div className="mb-4 hidden lg:block">
        <h3 className="text-sm font-semibold text-foreground">Character Reference</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Choose a model to guide the look and composition</p>
      </div>

      {/* Gender filter */}
      <div className="flex gap-1.5 mb-3">
        {GENDER_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setGenderFilter(f.value)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
              genderFilter === f.value
                ? 'bg-foreground text-background'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Body type filter (desktop only) */}
      <div className="hidden lg:flex gap-1.5 mb-4">
        {BODY_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setBodyFilter(f.value)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
              bodyFilter === f.value
                ? 'bg-muted border border-foreground/20 text-foreground'
                : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/40'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Clear selection */}
      {selectedModel && (
        <button
          onClick={() => { onSelect(null); onOpenChange(false); }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/80 transition-colors mb-2"
        >
          <X className="w-3 h-3" />
          Clear selection
        </button>
      )}

      {/* Model grid */}
      <div className="grid grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {filtered.map(model => {
          const isUserModel = userModelIds.has(model.modelId);
          const isLocked = isUserModel && !isPaidPlan;
          const isSelected = selectedModel?.modelId === model.modelId;

          return (
            <button
              key={model.modelId}
              onClick={() => {
                if (isLocked) {
                  toast.error('Upgrade to Growth or Pro to use your Brand Models');
                  return;
                }
                onSelect(model);
                onOpenChange(false);
              }}
              className={cn(
                'relative flex flex-col rounded-lg overflow-hidden border-2 transition-all duration-200 text-left',
                isLocked && 'opacity-50 grayscale cursor-not-allowed',
                isSelected
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-border/60 hover:shadow-sm hover:-translate-y-0.5'
              )}
            >
              <div className="relative">
                <img src={getOptimizedUrl(model.previewUrl, { quality: 60 })} alt={model.name} className="w-full aspect-square object-cover rounded-t-md" />
                {isUserModel && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[7px] font-bold text-white uppercase tracking-wider">Brand</span>
                )}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <Crown className="w-4 h-4 text-primary" />
                  </div>
                )}
                {isSelected && !isLocked && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="px-1.5 py-1.5 bg-background text-center">
                <p className="text-[11px] font-medium text-foreground truncate">{model.name}</p>
              </div>
              {isUserModel && !isLocked && (
                <button
                  onClick={(e) => handleDeleteUserModel(model.modelId, e)}
                  className="absolute top-1 left-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </button>
          );
        })}

        {brandModelCard}

        {filtered.length === 0 && (
          <p className="col-span-3 text-center text-xs text-muted-foreground py-6">
            No models match these filters
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-border/30">
        <MissingRequestBanner category="model" compact />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <MobilePickerSheet open={open} onOpenChange={onOpenChange} title="Character Reference">
          {filtersAndGrid}
        </MobilePickerSheet>
      </>
    );
  }

  return (
    <>
      {triggerButton}
      <ModelCatalogModal
        open={open}
        onOpenChange={onOpenChange}
        selectedModel={selectedModel}
        onSelect={onSelect}
      />
    </>
  );
}
