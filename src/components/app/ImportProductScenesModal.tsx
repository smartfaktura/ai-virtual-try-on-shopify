import { useState, useMemo } from 'react';
import { Search, X, Import, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useProductImageScenes, type DbScene } from '@/hooks/useProductImageScenes';
import { useAddCustomScene } from '@/hooks/useCustomScenes';
import { useSceneCategories } from '@/hooks/useSceneCategories';
import { toast } from '@/lib/brandedToast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface ConfigEntry {
  source: DbScene;
  name: string;
  description: string;
  category: string;
  prompt_hint: string;
  prompt_only: boolean;
  image_url: string;
  preview_image_url: string | null;
}

export default function ImportProductScenesModal({ open, onOpenChange }: Props) {
  const { rawScenes, isLoading } = useProductImageScenes();
  const { allCategoryLabels, allCategorySlugs } = useSceneCategories();
  const addScene = useAddCustomScene();

  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [importing, setImporting] = useState(false);

  const scenes = rawScenes.filter(s => s.is_active);

  const filtered = useMemo(() => {
    if (!search.trim()) return scenes;
    const q = search.toLowerCase();
    return scenes.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.category_collection || '').toLowerCase().includes(q) ||
      (s.sub_category || '').toLowerCase().includes(q)
    );
  }, [scenes, search]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const SCENE_TYPE_TO_CATEGORY: Record<string, string> = {
    packshot: 'studio',
    lifestyle: 'lifestyle',
    editorial: 'editorial',
    flatlay: 'flatlay',
    'on-model': 'editorial',
    'detail-shot': 'macro',
    macro: 'macro',
    ambient: 'lifestyle',
    contextual: 'lifestyle',
  };

  const goToStep2 = () => {
    const entries: ConfigEntry[] = scenes
      .filter(s => selected.has(s.id))
      .map(s => ({
        source: s,
        name: s.title,
        description: s.description || '',
        category: SCENE_TYPE_TO_CATEGORY[s.scene_type] || 'lifestyle',
        prompt_hint: s.prompt_template || '',
        prompt_only: false,
        image_url: s.preview_image_url || '',
        preview_image_url: s.preview_image_url || null,
      }));
    setConfigs(entries);
    setStep(2);
  };

  const updateConfig = (idx: number, patch: Partial<ConfigEntry>) => {
    setConfigs(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const handleImport = async () => {
    const valid = configs.filter(c => c.name.trim() && c.image_url);
    if (!valid.length) {
      toast.error('No valid scenes to import (need name + image)');
      return;
    }
    setImporting(true);
    let ok = 0;
    for (const c of valid) {
      try {
        await addScene.mutateAsync({
          name: c.name.trim(),
          description: c.description,
          category: c.category,
          image_url: c.image_url,
          prompt_hint: c.prompt_hint,
          prompt_only: c.prompt_only,
        });
        ok++;
      } catch (e: any) {
        toast.error(`Failed: ${c.name} — ${e.message}`);
      }
    }
    setImporting(false);
    if (ok) {
      toast.success(`Imported ${ok} scene${ok > 1 ? 's' : ''}`);
      onOpenChange(false);
      setStep(1);
      setSelected(new Set());
      setSearch('');
    }
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep(1);
      setSelected(new Set());
      setSearch('');
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import from Product Image Scenes</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Select product image scenes to import as custom scenes.'
              : `Configure ${configs.length} scene${configs.length > 1 ? 's' : ''} before importing.`}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search product scenes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-1 pr-1">
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No scenes found.</p>
              ) : (
                filtered.map(s => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selected.has(s.id) ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                    {s.preview_image_url ? (
                      <img src={s.preview_image_url} alt="" className="w-10 h-10 rounded object-cover bg-muted shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <Import className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {s.category_collection && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{s.category_collection}</Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{s.scene_type}</Badge>
                        {s.sub_category && (
                          <span className="text-[10px] text-muted-foreground truncate">{s.sub_category}</span>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-xs text-muted-foreground">{selected.size} selected</span>
              <Button onClick={goToStep2} disabled={selected.size === 0} size="sm" className="gap-1.5">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
              {configs.map((c, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-3 bg-card">
                  <div className="flex items-center gap-2">
                    {c.image_url ? (
                      <img src={c.image_url} alt="" className="w-8 h-8 rounded object-cover bg-muted shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate flex-1">{c.source.title}</span>
                    <Badge variant="outline" className="text-[10px]">{c.source.category_collection || '—'}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground">Name</label>
                      <Input value={c.name} onChange={e => updateConfig(idx, { name: e.target.value })} className="h-8 text-sm mt-0.5" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground">Category</label>
                      <Select value={c.category} onValueChange={v => updateConfig(idx, { category: v })}>
                        <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {allCategorySlugs.map(slug => (
                            <SelectItem key={slug} value={slug}>{allCategoryLabels[slug] || slug}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Prompt Hint</label>
                    <Textarea
                      value={c.prompt_hint}
                      onChange={e => updateConfig(idx, { prompt_hint: e.target.value })}
                      rows={2}
                      className="text-sm mt-0.5"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={c.prompt_only} onCheckedChange={v => updateConfig(idx, { prompt_only: v })} />
                    <span className="text-xs text-muted-foreground">Prompt-only (no reference image needed)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1.5">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </Button>
              <Button onClick={handleImport} disabled={importing} size="sm" className="gap-1.5">
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Import className="w-3.5 h-3.5" />}
                Import {configs.length} Scene{configs.length > 1 ? 's' : ''}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
