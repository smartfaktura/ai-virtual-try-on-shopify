// ── Outfit Preset Bar — DB-backed cross-device presets ──
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
}

function presetIsRelevant(preset: UserOutfitPreset, resolution: ConflictResolution): boolean {
  const cfg = (preset.config || {}) as Record<string, unknown>;
  const definedSlots = Object.keys(cfg).filter(k => {
    const v = cfg[k];
    return v !== undefined && v !== null && v !== '';
  });
  if (definedSlots.length === 0) return false;
  return definedSlots.some(slot => resolution.availableSlots.includes(slot as OutfitSlotKey));
}

export function OutfitPresetBar({ currentConfig, resolution, onLoad, category, gender }: OutfitPresetBarProps) {
  const { builtIn, userPresets, savePreset, deletePreset } = useOutfitPresets();
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const relevantBuiltIn = builtIn.filter(p => presetIsRelevant(p, resolution));
  const relevantUser = userPresets.filter(p => presetIsRelevant(p, resolution));
  const noRelevantPresets = relevantBuiltIn.length === 0 && relevantUser.length === 0;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
            Outfit Presets
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {builtIn.map(p => (
          <button
            key={p.id}
            onClick={() => handleLoad(p)}
            className={cn(
              'h-7 px-2.5 rounded-full text-[11px] font-medium border bg-background hover:bg-muted transition-colors',
            )}
          >
            {p.name}
          </button>
        ))}
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
