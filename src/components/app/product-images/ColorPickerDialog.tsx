import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Pipette, Check } from 'lucide-react';

const PRESET_SWATCHES = [
  '#FFFFFF', '#F5F5F5', '#E8E8E8', '#D4D4D4',
  '#FAFAF0', '#F5E6D3', '#FFE4E1', '#E6F0FA',
  '#2B3A4E', '#1A1A2E', '#3D3D3D', '#000000',
];

const GRADIENT_PRESETS = [
  { name: 'Terracotta', from: '#984D1B', to: '#FBEFE9' },
  { name: 'Ocean', from: '#1C6CA0', to: '#C7E6F5' },
  { name: 'Crimson', from: '#B62020', to: '#FBE9E9' },
  { name: 'Forest', from: '#0F570F', to: '#EAFBE9' },
  { name: 'Sunset Duo', from: '#D42525', to: '#246DCC' },
  { name: 'Navy Fade', from: '#FFFFFF', to: '#123668' },
];

function isValidHex(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

function normalizeHex(v: string) {
  let h = v.trim();
  if (!h.startsWith('#')) h = '#' + h;
  return h.slice(0, 7).toUpperCase();
}

function isDark(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return false;
  const lum = (parseInt(m[1], 16) * 299 + parseInt(m[2], 16) * 587 + parseInt(m[3], 16) * 114) / 1000;
  return lum < 140;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function hexToHsl(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [0, 0, 50];
  let r = parseInt(m[1], 16) / 255;
  let g = parseInt(m[2], 16) / 255;
  let b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

const THUMB_STYLE = [
  '[&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:w-5',
  '[&::-webkit-slider-thumb]:h-5',
  '[&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:bg-white',
  '[&::-webkit-slider-thumb]:border',
  '[&::-webkit-slider-thumb]:border-black/10',
  '[&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.3)]',
  '[&::-webkit-slider-thumb]:cursor-pointer',
  '[&::-moz-range-thumb]:w-5',
  '[&::-moz-range-thumb]:h-5',
  '[&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:bg-white',
  '[&::-moz-range-thumb]:border',
  '[&::-moz-range-thumb]:border-black/10',
  '[&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.3)]',
  '[&::-moz-range-thumb]:cursor-pointer',
].join(' ');

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  background: string;
}

function ColorSlider({ value, min, max, onChange, background }: SliderProps) {
  return (
    <input
      type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className={`w-full h-3 rounded-full appearance-none cursor-pointer ${THUMB_STYLE}`}
      style={{ background }}
    />
  );
}

interface ColorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'solid' | 'gradient';
  initialHex: string;
  initialGradientFrom: string;
  initialGradientTo: string;
  canSave: boolean;
  onApplySolid: (hex: string) => void;
  onApplyGradient: (from: string, to: string) => void;
  onSaveColor: (hex: string) => void;
  onSaveGradient: (from: string, to: string) => void;
}

export function ColorPickerDialog({
  open, onOpenChange, mode: initialMode,
  initialHex, initialGradientFrom, initialGradientTo,
  canSave, onApplySolid, onApplyGradient, onSaveColor, onSaveGradient,
}: ColorPickerDialogProps) {
  const [tab, setTab] = useState<string>(initialMode);
  const [hex, setHex] = useState(initialHex || '#FFFFFF');
  const [hexInput, setHexInput] = useState(initialHex || '#FFFFFF');
  const [hue, setHue] = useState(0);
  const [lightness, setLightness] = useState(50);
  const [saturation, setSaturation] = useState(70);

  const [gradFrom, setGradFrom] = useState(initialGradientFrom || '#F8F8F8');
  const [gradTo, setGradTo] = useState(initialGradientTo || '#EEEEEE');
  const [gradFromInput, setGradFromInput] = useState(initialGradientFrom || '#F8F8F8');
  const [gradToInput, setGradToInput] = useState(initialGradientTo || '#EEEEEE');
  const [gradFromHue, setGradFromHue] = useState(0);
  const [gradFromLight, setGradFromLight] = useState(50);
  const [gradToHue, setGradToHue] = useState(0);
  const [gradToLight, setGradToLight] = useState(50);

  const colorInputRef = useRef<HTMLInputElement>(null);

  const syncHslFromHex = useCallback((h: string) => {
    const [hu, sa, li] = hexToHsl(h);
    setHue(hu); setSaturation(sa); setLightness(li);
  }, []);

  useEffect(() => {
    if (open) {
      const h = initialHex || '#FFFFFF';
      setTab(initialMode);
      setHex(h); setHexInput(h);
      syncHslFromHex(h);
      const gf = initialGradientFrom || '#F8F8F8';
      const gt = initialGradientTo || '#EEEEEE';
      setGradFrom(gf); setGradTo(gt);
      setGradFromInput(gf); setGradToInput(gt);
      const [fh,,fl] = hexToHsl(gf);
      const [th,,tl] = hexToHsl(gt);
      setGradFromHue(fh); setGradFromLight(fl);
      setGradToHue(th); setGradToLight(tl);
    }
  }, [open, initialMode, initialHex, initialGradientFrom, initialGradientTo, syncHslFromHex]);

  const updateFromSliders = (h: number, s: number, l: number) => {
    const newHex = hslToHex(h, s, l);
    setHex(newHex); setHexInput(newHex);
  };

  const handleHueChange = (v: number) => { setHue(v); updateFromSliders(v, saturation, lightness); };
  const handleLightnessChange = (v: number) => { setLightness(v); updateFromSliders(hue, saturation, v); };

  const handleHexInputBlur = () => {
    const n = normalizeHex(hexInput);
    if (isValidHex(n)) { setHex(n); setHexInput(n); syncHslFromHex(n); } else { setHexInput(hex); }
  };

  const handleGradFromBlur = () => {
    const n = normalizeHex(gradFromInput);
    if (isValidHex(n)) { setGradFrom(n); setGradFromInput(n); const [h,,l] = hexToHsl(n); setGradFromHue(h); setGradFromLight(l); } else { setGradFromInput(gradFrom); }
  };

  const handleGradToBlur = () => {
    const n = normalizeHex(gradToInput);
    if (isValidHex(n)) { setGradTo(n); setGradToInput(n); const [h,,l] = hexToHsl(n); setGradToHue(h); setGradToLight(l); } else { setGradToInput(gradTo); }
  };

  const handleApply = () => {
    if (tab === 'solid') onApplySolid(hex); else onApplyGradient(gradFrom, gradTo);
    onOpenChange(false);
  };

  const pickSwatch = (c: string) => { setHex(c); setHexInput(c); syncHslFromHex(c); };

  const pickGradientPreset = (from: string, to: string) => {
    setGradFrom(from); setGradFromInput(from);
    setGradTo(to); setGradToInput(to);
    const [fh,,fl] = hexToHsl(from); setGradFromHue(fh); setGradFromLight(fl);
    const [th,,tl] = hexToHsl(to); setGradToHue(th); setGradToLight(tl);
  };

  const updateGradFrom = (h: number, l: number) => {
    setGradFromHue(h); setGradFromLight(l);
    const v = hslToHex(h, 70, l); setGradFrom(v); setGradFromInput(v);
  };

  const updateGradTo = (h: number, l: number) => {
    setGradToHue(h); setGradToLight(l);
    const v = hslToHex(h, 70, l); setGradTo(v); setGradToInput(v);
  };

  const hueGradient = 'linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden rounded-2xl max-h-[85vh]">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold">Custom Color</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="px-5">
            <TabsList className="w-full grid grid-cols-2 h-9 rounded-xl">
              <TabsTrigger value="solid" className="text-xs rounded-lg">Solid</TabsTrigger>
              <TabsTrigger value="gradient" className="text-xs rounded-lg">Gradient</TabsTrigger>
            </TabsList>
          </div>

          {/* ─── Solid Tab ─── */}
          <TabsContent value="solid" className="px-4 pb-4 pt-3 space-y-3 mt-0 overflow-y-auto max-h-[70vh]">
            {/* Quick-pick swatches */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Quick pick</span>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_SWATCHES.map(c => {
                  const selected = hex.toUpperCase() === c;
                  return (
                    <button
                      key={c} type="button" onClick={() => pickSwatch(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-150 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${selected ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border hover:scale-105'}`}
                      style={{ background: c }} title={c}
                    >
                      {selected && <Check className={`w-3.5 h-3.5 ${isDark(c) ? 'text-white' : 'text-foreground'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom sliders */}
            <div className="space-y-3">
              <span className="text-[11px] font-medium text-muted-foreground">Custom</span>
              <ColorSlider value={hue} min={0} max={360} onChange={handleHueChange} background={hueGradient} />
              <ColorSlider value={lightness} min={5} max={95} onChange={handleLightnessChange} background={`linear-gradient(to right, hsl(${hue},70%,5%), hsl(${hue},70%,50%), hsl(${hue},70%,95%))`} />
            </div>

            {/* Color preview + Hex input + Eyedropper */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full border border-border shadow-sm shrink-0 ring-1 ring-black/5"
                style={{ background: hex }}
              />
              <Input
                value={hexInput}
                onChange={e => setHexInput(e.target.value)}
                onBlur={handleHexInputBlur}
                onKeyDown={e => { if (e.key === 'Enter') handleHexInputBlur(); }}
                className="h-9 text-[13px] font-medium tracking-wide text-foreground rounded-xl"
                placeholder="#FF5522" maxLength={7}
              />
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                className="shrink-0 w-9 h-9 rounded-full border border-border bg-muted/50 flex items-center justify-center hover:bg-accent hover:shadow-sm transition-all duration-150"
                title="Eyedropper"
              >
                <Pipette className="w-4 h-4 text-muted-foreground" />
                <input
                  ref={colorInputRef} type="color"
                  value={isValidHex(hex) ? hex : '#FFFFFF'}
                  onChange={e => { const v = e.target.value.toUpperCase(); setHex(v); setHexInput(v); syncHslFromHex(v); }}
                  className="sr-only"
                />
              </button>
            </div>

            {canSave && isValidHex(hex) && (
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl" onClick={() => onSaveColor(hex)}>
                <Save className="w-3 h-3" /> Save to palette
              </Button>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs h-10 rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button size="sm" className="flex-1 text-xs h-10 rounded-xl" onClick={handleApply}>Apply</Button>
            </div>
          </TabsContent>

          {/* ─── Gradient Tab ─── */}
          <TabsContent value="gradient" className="px-4 pb-4 pt-3 space-y-3 mt-0 overflow-y-auto max-h-[70vh]">
            {/* Live gradient preview */}
            <div
              className="h-16 rounded-xl border border-border shadow-sm"
              style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
            />

            {/* Quick gradients */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Quick gradients</span>
              <div className="grid grid-cols-3 gap-1.5">
                {GRADIENT_PRESETS.map(p => {
                  const selected = gradFrom.toUpperCase() === p.from.toUpperCase() && gradTo.toUpperCase() === p.to.toUpperCase();
                  return (
                    <button
                      key={p.name} type="button" onClick={() => pickGradientPreset(p.from, p.to)}
                      title={p.name}
                      className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <div
                        className={`w-full h-8 rounded-lg border-2 transition-all duration-150 ${selected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-muted-foreground/40'}`}
                        style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start color */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-border shadow-sm" style={{ background: gradFrom }} />
                <span className="text-[11px] font-medium text-muted-foreground">Start color</span>
              </div>
              <ColorSlider value={gradFromHue} min={0} max={360} onChange={h => updateGradFrom(h, gradFromLight)} background={hueGradient} />
              <ColorSlider value={gradFromLight} min={5} max={95} onChange={l => updateGradFrom(gradFromHue, l)} background={`linear-gradient(to right, hsl(${gradFromHue},70%,5%), hsl(${gradFromHue},70%,50%), hsl(${gradFromHue},70%,95%))`} />
              <Input value={gradFromInput} onChange={e => setGradFromInput(e.target.value)} onBlur={handleGradFromBlur} onKeyDown={e => { if (e.key === 'Enter') handleGradFromBlur(); }} className="h-8 text-[13px] font-medium tracking-wide text-foreground rounded-xl" maxLength={7} />
            </div>

            {/* End color */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-border shadow-sm" style={{ background: gradTo }} />
                <span className="text-[11px] font-medium text-muted-foreground">End color</span>
              </div>
              <ColorSlider value={gradToHue} min={0} max={360} onChange={h => updateGradTo(h, gradToLight)} background={hueGradient} />
              <ColorSlider value={gradToLight} min={5} max={95} onChange={l => updateGradTo(gradToHue, l)} background={`linear-gradient(to right, hsl(${gradToHue},70%,5%), hsl(${gradToHue},70%,50%), hsl(${gradToHue},70%,95%))`} />
              <Input value={gradToInput} onChange={e => setGradToInput(e.target.value)} onBlur={handleGradToBlur} onKeyDown={e => { if (e.key === 'Enter') handleGradToBlur(); }} className="h-8 text-[13px] font-medium tracking-wide text-foreground rounded-xl" maxLength={7} />
            </div>

            {canSave && (
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 rounded-xl" onClick={() => onSaveGradient(gradFrom, gradTo)}>
                <Save className="w-3 h-3" /> Save to palette
              </Button>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs h-10 rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button size="sm" className="flex-1 text-xs h-10 rounded-xl" onClick={handleApply}>Apply</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
