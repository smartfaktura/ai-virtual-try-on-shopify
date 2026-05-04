// ── Outfit Preset Bar — 5 universal presets + user saved looks ──
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Trash2, Sparkles } from 'lucide-react';
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
  onLoad: (config: OutfitConfig) => void;
  category?: string;
  gender?: string;
  /** Union of selected product categories — used to filter curated built-ins. */
  productCategories?: string[];
  /** Currently active preset id (for highlight) */
  activePresetId?: string;
}

export function OutfitPresetBar({ currentConfig, resolution, onLoad, category, gender, productCategories, activePresetId }: OutfitPresetBarProps) {
  const { builtIn, userPresets, savePreset, deletePreset } = useOutfitPresets(undefined);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLoad = (preset: UserOutfitPreset) => {
    const cleaned = applyPresetWithLocks(preset.config, resolution);
    onLoad({ ...currentConfig, ...cleaned });
    toast.success(`Loaded "${preset.name}"`);
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

  const handleDelete = async (id: string, name: string) => {
    await deletePreset(id);
    toast.success(`Removed "${name}"`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
          Quick styles
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {builtIn.map(p => (
          <button
            key={p.id}
            onClick={() => handleLoad(p)}
            className={cn(
              'h-7 px-2.5 rounded-full text-[11px] font-medium border transition-colors',
              activePresetId === p.id
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-background hover:bg-muted border-border',
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {userPresets.length > 0 && (
        <>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
              Your saved looks
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {userPresets.map(p => (
              <div key={p.id} className="inline-flex items-center gap-0.5 rounded-full border bg-background hover:bg-muted transition-colors">
                <button
                  onClick={() => handleLoad(p)}
                  className="h-7 pl-2.5 pr-1 text-[11px] font-medium"
                >
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
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-1.5">
        <Popover open={saveOpen} onOpenChange={setSaveOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[11px] gap-1">
              <Save className="h-3 w-3" /> Save current
            </Button>
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
    </div>
  );
}
