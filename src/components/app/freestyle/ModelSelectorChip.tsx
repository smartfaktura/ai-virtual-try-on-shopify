import { useState } from 'react';
import { User, ChevronDown, X, Sparkles, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockModels } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobilePickerSheet } from './MobilePickerSheet';
import type { ModelProfile } from '@/types';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels, useDeleteUserModel } from '@/hooks/useUserModels';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';
import { MissingRequestBanner } from '@/components/app/MissingRequestBanner';
import { useCredits } from '@/contexts/CreditContext';
import { GenerateModelModal } from '@/components/app/GenerateModelModal';
import { toast } from 'sonner';

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
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const { asProfiles: customModels } = useCustomModels();
  const { asProfiles: userModelProfiles } = useUserModels();
  const deleteUserModel = useDeleteUserModel();
  const { sortModels } = useModelSortOrder();
  const { plan } = useCredits();
  const isMobile = useIsMobile();

  const isPaidPlan = ['growth', 'pro', 'enterprise'].includes(plan);

  // User model IDs for badge display
  const userModelIds = new Set(userModelProfiles.map(m => m.modelId));

  const allModels = sortModels([...mockModels, ...customModels, ...userModelProfiles]);

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

  const triggerButton = (
    <button
      onClick={isMobile ? () => onOpenChange(!open) : undefined}
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

  const filtersAndGrid = (
    <>
      {/* Gender filter */}
      <div className="flex gap-1 mb-2">
        {GENDER_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setGenderFilter(f.value)}
            className={cn(
              'px-3 py-1 rounded-full text-[11px] font-medium transition-colors',
              genderFilter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Body type filter */}
      <div className="flex gap-1 mb-3">
        {BODY_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setBodyFilter(f.value)}
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors',
              bodyFilter === f.value
                ? 'bg-secondary text-secondary-foreground border border-border'
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

      {/* Create Your Model button */}
      <button
        onClick={() => {
          onOpenChange(false);
          setGenerateModalOpen(true);
        }}
        className={cn(
          "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors mb-2 border border-dashed",
          isPaidPlan
            ? "border-primary/30 text-primary hover:bg-primary/5"
            : "border-border text-muted-foreground hover:bg-muted/40"
        )}
      >
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>Create Your Model</span>
        {!isPaidPlan && (
          <span className="ml-auto text-[9px] uppercase tracking-wider font-semibold text-muted-foreground/60">Pro</span>
        )}
      </button>

      {/* Model grid */}
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map(model => (
          <button
            key={model.modelId}
            onClick={() => { onSelect(model); onOpenChange(false); }}
            className={cn(
              'relative flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left',
              selectedModel?.modelId === model.modelId
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-transparent hover:border-border'
            )}
          >
            <img src={getOptimizedUrl(model.previewUrl, { quality: 60 })} alt={model.name} className="w-full aspect-square object-cover rounded-t-md" />
            <div className="px-1.5 py-1 bg-background text-center">
              <p className="text-[10px] font-medium text-foreground truncate">{model.name}</p>
              {userModelIds.has(model.modelId) && (
                <p className="text-[8px] font-semibold text-primary uppercase tracking-wider">My Model</p>
              )}
            </div>
            {/* Delete button for user models */}
            {userModelIds.has(model.modelId) && (
              <button
                onClick={(e) => handleDeleteUserModel(model.modelId, e)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 text-center text-xs text-muted-foreground py-6">
            No models match these filters
          </p>
        )}
      </div>

      <div className="mt-2">
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
        <GenerateModelModal open={generateModalOpen} onOpenChange={setGenerateModalOpen} userPlan={plan} />
      </>
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
        <PopoverTrigger asChild>
          {triggerButton}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
            Character Reference
          </p>
          {filtersAndGrid}
        </PopoverContent>
      </Popover>
      <GenerateModelModal open={generateModalOpen} onOpenChange={setGenerateModalOpen} userPlan={plan} />
    </>
  );
}
