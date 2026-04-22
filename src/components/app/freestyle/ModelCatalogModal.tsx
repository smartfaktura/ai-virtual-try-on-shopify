import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Crown, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { mockModels } from '@/data/mockData';
import { useCustomModels } from '@/hooks/useCustomModels';
import { useUserModels, useDeleteUserModel } from '@/hooks/useUserModels';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from '@/lib/brandedToast';
import { MissingRequestBanner } from '@/components/app/MissingRequestBanner';
import type { ModelProfile, ModelGender, ModelAgeRange } from '@/types';

interface ModelCatalogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: ModelProfile | null;
  onSelect: (model: ModelProfile | null) => void;
}

type GenderFilter = 'all' | Extract<ModelGender, 'female' | 'male'>;
type QuickView = 'all' | 'brand';
type SortKey = 'featured' | 'name';

const GENDER_CHIPS: { value: GenderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const AGE_RANGES: { value: ModelAgeRange; label: string }[] = [
  { value: 'young-adult', label: 'Young adult' },
  { value: 'adult', label: 'Adult' },
  { value: 'mature', label: 'Mature' },
];

export function ModelCatalogModal({ open, onOpenChange, selectedModel, onSelect }: ModelCatalogModalProps) {
  const navigate = useNavigate();
  const { plan, openBuyModal } = useCredits();
  const { asProfiles: customModels } = useCustomModels();
  const { asProfiles: userModelProfiles } = useUserModels();
  const deleteUserModel = useDeleteUserModel();
  const { sortModels, applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();

  const isPaidPlan = ['growth', 'pro', 'enterprise'].includes(plan);

  const [gender, setGender] = useState<GenderFilter>('all');
  const [ageRange, setAgeRange] = useState<ModelAgeRange | null>(null);
  const [quickView, setQuickView] = useState<QuickView>('all');
  const [sort, setSort] = useState<SortKey>('featured');
  const [pending, setPending] = useState<ModelProfile | null>(null);

  const userModelIds = useMemo(() => new Set(userModelProfiles.map(m => m.modelId)), [userModelProfiles]);

  const allModels = useMemo(
    () => sortModels(filterHidden([
      ...applyNameOverrides(applyOverrides(mockModels)),
      ...customModels,
      ...userModelProfiles,
    ])),
    [sortModels, filterHidden, applyNameOverrides, applyOverrides, customModels, userModelProfiles],
  );

  const filtered = useMemo(() => {
    let list = allModels;
    if (quickView === 'brand') list = list.filter(m => userModelIds.has(m.modelId));
    if (gender !== 'all') list = list.filter(m => m.gender === gender);
    if (ageRange) list = list.filter(m => m.ageRange === ageRange);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [allModels, quickView, gender, ageRange, sort, userModelIds]);

  const anyFilterActive = gender !== 'all' || ageRange !== null || quickView !== 'all';

  const clearAll = () => {
    setGender('all');
    setAgeRange(null);
    setQuickView('all');
    setSort('featured');
  };

  const brandCount = userModelProfiles.length;

  const handleSelectCard = (model: ModelProfile, locked: boolean) => {
    if (locked) {
      toast.error('Upgrade to Growth or Pro to use your Brand Models');
      openBuyModal();
      return;
    }
    setPending(model);
  };

  const handleConfirm = () => {
    if (pending) {
      onSelect(pending);
      setPending(null);
      onOpenChange(false);
    }
  };

  const handleCreateBrandModel = () => {
    if (!isPaidPlan) {
      openBuyModal();
      return;
    }
    onOpenChange(false);
    navigate('/app/models');
  };

  const handleBrandQuickView = () => {
    if (!isPaidPlan) {
      openBuyModal();
      return;
    }
    setQuickView('brand');
  };

  const handleDeleteUserModel = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dbId = modelId.replace('user-', '');
    deleteUserModel.mutate(dbId, {
      onSuccess: () => {
        toast.success('Model removed');
        if (selectedModel?.modelId === modelId) onSelect(null);
        if (pending?.modelId === modelId) setPending(null);
      },
      onError: () => toast.error('Failed to remove model'),
    });
  };

  const currentSelectedId = pending?.modelId ?? selectedModel?.modelId ?? null;
  const footerThumb = pending?.previewUrl ?? null;
  const footerTitle = pending?.name ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 gap-0 flex flex-col w-[92vw] max-w-[1500px] sm:max-w-[1500px]"
      >
        {/* Header */}
        <header className="flex items-start justify-between px-4 sm:px-6 py-4 pr-12 sm:pr-6 border-b border-border/40">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Select a Model</h2>
            <p className="text-sm text-muted-foreground mt-0.5 tracking-tight">
              Choose a character to guide the look and composition
            </p>
          </div>
        </header>

        {/* Filter bar — gender chips + sort */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border/40">
          <div className="flex items-center gap-1.5 flex-wrap">
            {GENDER_CHIPS.map(chip => (
              <button
                key={chip.value}
                onClick={() => setGender(chip.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
                  gender === chip.value
                    ? 'bg-foreground text-background'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted',
                )}
              >
                {chip.label}
              </button>
            ))}
            {anyFilterActive && (
              <button
                onClick={clearAll}
                className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="shrink-0">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="name">Name A→Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Body: sidebar + grid */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[240px] shrink-0 border-r border-border/40 overflow-y-auto">
            <div className="p-4 space-y-5">
              <SidebarSection title="Quick">
                <SidebarRow
                  active={false}
                  onClick={() => setQuickView('all')}
                  label="All models"
                  count={allModels.length}
                />
                <SidebarRow
                  active={quickView === 'brand'}
                  onClick={handleBrandQuickView}
                  label="My Brand Models"
                  count={isPaidPlan ? brandCount : undefined}
                  trailing={!isPaidPlan ? <Crown className="w-3.5 h-3.5 text-primary" /> : undefined}
                />
              </SidebarSection>

              <SidebarSection title="Age">
                <SidebarRow
                  active={false}
                  onClick={() => setAgeRange(null)}
                  label="Any"
                />
                {AGE_RANGES.map(a => (
                  <SidebarRow
                    key={a.value}
                    active={ageRange === a.value}
                    onClick={() => setAgeRange(a.value)}
                    label={a.label}
                  />
                ))}
              </SidebarSection>
            </div>
          </aside>

          {/* Grid */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 sm:px-6 py-4 space-y-4">
              {/* Brand-view upsell for free users */}
              {quickView === 'brand' && !isPaidPlan && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Brand Models is a Growth feature</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Create reusable, on-brand model identities for consistent campaigns.
                    </p>
                  </div>
                  <Button size="sm" onClick={openBuyModal} className="shrink-0">
                    <Crown className="w-3.5 h-3.5 mr-1" /> Upgrade
                  </Button>
                </div>
              )}

              {/* Empty brand state for paid users */}
              {quickView === 'brand' && isPaidPlan && brandCount === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">Create your first Brand Model</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a reference and generate consistent on-brand characters.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => { onOpenChange(false); navigate('/app/models'); }}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Create Brand Model
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map(model => {
                  const isUserModel = userModelIds.has(model.modelId);
                  const locked = isUserModel && !isPaidPlan;
                  const isSelected = currentSelectedId === model.modelId;

                  return (
                    <button
                      key={model.modelId}
                      onClick={() => handleSelectCard(model, locked)}
                      className={cn(
                        'group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all duration-200 text-left bg-background',
                        locked && 'cursor-pointer',
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent hover:border-border/60 hover:shadow-md hover:-translate-y-0.5',
                      )}
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={getOptimizedUrl(model.previewUrl, { quality: 65 })}
                          alt={model.name}
                          className={cn(
                            'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
                            locked && 'opacity-50 grayscale',
                          )}
                        />
                        {isUserModel && (
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-bold text-white uppercase tracking-wider">
                            Brand
                          </span>
                        )}
                        {locked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-background/90 flex items-center justify-center shadow">
                              <Crown className="w-4.5 h-4.5 text-primary" />
                            </div>
                          </div>
                        )}
                        {isSelected && !locked && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        )}
                        {isUserModel && !locked && (
                          <button
                            onClick={(e) => handleDeleteUserModel(model.modelId, e)}
                            className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-background/85 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="px-2 py-2 bg-background">
                        <p className="text-xs font-medium text-foreground truncate">{model.name}</p>
                      </div>
                    </button>
                  );
                })}

                {/* Create Brand Model tile — always visible */}
                <button
                  onClick={handleCreateBrandModel}
                  className="group relative flex flex-col rounded-xl overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left bg-background"
                >
                  <div className="aspect-square bg-muted/50 flex flex-col items-center justify-center gap-2 p-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {isPaidPlan ? (
                        <Plus className="w-5 h-5 text-primary" />
                      ) : (
                        <Crown className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    {!isPaidPlan && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-semibold text-primary uppercase tracking-wider">
                        Growth
                      </span>
                    )}
                  </div>
                  <div className="px-2 py-2 bg-background text-center">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {isPaidPlan ? 'Create Brand Model' : 'Brand Models'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {isPaidPlan ? 'Upload your reference' : 'Upgrade to unlock'}
                    </p>
                  </div>
                </button>

                {filtered.length === 0 && quickView !== 'brand' && (
                  <p className="col-span-full text-center text-sm text-muted-foreground py-10">
                    No models match these filters
                  </p>
                )}
              </div>

              {quickView !== 'brand' && (
                <div className="pt-2">
                  <MissingRequestBanner category="model" compact />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-background px-4 sm:px-6 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {footerTitle ? (
              <>
                {footerThumb && (
                  <img
                    src={getOptimizedUrl(footerThumb, { quality: 60 })}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{footerTitle}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Pick a model to continue.</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {selectedModel && (
              <Button
                variant="ghost"
                onClick={() => { onSelect(null); setPending(null); onOpenChange(false); }}
              >
                Clear
              </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={!pending} onClick={handleConfirm}>
              Use model
            </Button>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarRow({
  label, active, onClick, count, trailing,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  count?: number;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-foreground/80 hover:bg-muted/60',
      )}
    >
      <span className="truncate flex items-center gap-1.5">
        {label}
        {trailing}
      </span>
      {typeof count === 'number' && (
        <span className={cn('text-[11px] tabular-nums', active ? 'text-primary/80' : 'text-muted-foreground')}>
          {count}
        </span>
      )}
    </button>
  );
}
