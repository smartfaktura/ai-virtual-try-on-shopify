// ── Outfit Preset Bar — 5 universal presets with apply-to-all confirmation ──
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, Sparkles, Check, X, SlidersHorizontal } from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { useOutfitPresets, type UserOutfitPreset } from '@/hooks/useOutfitPresets';
import { applyPresetWithLocks, type ConflictResolution } from '@/lib/outfitConflictResolver';
import { toast } from 'sonner';
import type { OutfitConfig } from '@/components/app/product-images/types';
import { cn } from '@/lib/utils';

interface OutfitPresetBarProps {
  currentConfig: OutfitConfig;
  resolution: ConflictResolution;
  onApplyToAll: (config: OutfitConfig, presetName: string) => void;
  onLoadSingle?: (config: OutfitConfig) => void;
  onOpenCustomize?: () => void;
  category?: string;
  gender?: string;
  productCategories?: string[];
  activePresetName?: string;
  shotCount?: number;
  mode?: 'apply-all' | 'single';
}

export function OutfitPresetBar({
  currentConfig, resolution, onApplyToAll, onLoadSingle, onOpenCustomize,
  category, gender,
  productCategories, activePresetName, shotCount = 0, mode = 'apply-all',
}: OutfitPresetBarProps) {
  const { builtIn, userPresets, savePreset, deletePreset } = useOutfitPresets(undefined);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<UserOutfitPreset | null>(null);

  const handleSelect = (preset: UserOutfitPreset) => {
    const cleaned = applyPresetWithLocks(preset.config, resolution);
    const merged = { ...currentConfig, ...cleaned };

    if (mode === 'single' && onLoadSingle) {
      onLoadSingle(merged);
      toast.success(`Applied "${preset.name}"`);
      return;
    }

    // In apply-all mode, show confirmation
    setPendingPreset({ ...preset, config: merged });
  };

  const confirmApply = () => {
    if (!pendingPreset) return;
    onApplyToAll(pendingPreset.config, pendingPreset.name);
    setPendingPreset(null);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const result = await savePreset(name.trim(), currentConfig, category, gender);
    setSaving(false);
    if (result) {
      toast.success(`Saved "${name.trim()}"`);
      setName('');
      setSaveOpen(false);
    } else {
      toast.error('Could not save preset');
    }
  };

  const handleDelete = async (id: string, pName: string) => {
    await deletePreset(id);
    toast.success(`Removed "${pName}"`);
  };

  return (
    <div className="space-y-2.5">
      {/* Presets section */}
      <div className="rounded-xl border bg-muted/20 p-3 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary/60" />
          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
            {mode === 'single' ? 'Quick styles' : 'Presets'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {builtIn.map(p => {
            const isActive = activePresetName === p.name;
            const isPending = pendingPreset?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className={cn(
                  'h-7 px-2.5 rounded-full text-[11px] font-medium border transition-all',
                  isPending
                    ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20'
                    : isActive
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-background hover:bg-muted border-border hover:border-foreground/20',
                )}
              >
                {isActive && <Check className="inline h-3 w-3 mr-1 -ml-0.5" />}
                {p.name}
              </button>
            );
          })}

          {/* User saved looks — inline as pills */}
          {userPresets.map(p => (
            <div key={p.id} className="inline-flex items-center gap-0.5 rounded-full border bg-background hover:bg-muted transition-colors">
              <button
                onClick={() => handleSelect(p)}
                className={cn(
                  'h-7 pl-2.5 pr-1 text-[11px] font-medium',
                  activePresetName === p.name && 'text-primary',
                )}
              >
                {activePresetName === p.name && <Check className="inline h-3 w-3 mr-1 -ml-0.5" />}
                {p.name}
              </button>
              <button
                onClick={() => handleDelete(p.id, p.name)}
                className="h-7 w-6 flex items-center justify-center text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${p.name}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Customize button — opens full editor modal (apply-all mode only) */}
          {mode === 'apply-all' && onOpenCustomize && (
            <button
              onClick={onOpenCustomize}
              className="h-7 px-2.5 rounded-full text-[11px] font-medium border border-dashed border-border hover:border-foreground/30 bg-background hover:bg-muted transition-all flex items-center gap-1"
            >
              <SlidersHorizontal className="h-3 w-3" />
              Customize
            </button>
          )}

          {/* Save as custom style — inline pill */}
          <Popover open={saveOpen} onOpenChange={setSaveOpen}>
            <PopoverTrigger asChild>
              <button className="h-7 px-2.5 rounded-full text-[11px] font-medium border border-dashed border-border hover:border-foreground/30 bg-background hover:bg-muted transition-all flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Save className="h-3 w-3" />
                Save custom
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-3 space-y-2">
              <p className="text-xs font-medium">Save outfit as preset</p>
              <Input
                autoFocus
                placeholder="e.g. My everyday look"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                className="h-8 text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSaveOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="h-7 text-xs" disabled={!name.trim() || saving} onClick={handleSave}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Confirmation bar */}
        {pendingPreset && mode === 'apply-all' && (
          <div className="flex items-center gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="text-[11px] text-foreground flex-1">
              Apply <span className="font-semibold">{pendingPreset.name}</span> to all {shotCount} shots?
            </p>
            <Button
              size="sm"
              className="h-7 text-[11px] px-3 gap-1"
              onClick={confirmApply}
            >
              <Check className="h-3 w-3" /> Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2"
              onClick={() => setPendingPreset(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
