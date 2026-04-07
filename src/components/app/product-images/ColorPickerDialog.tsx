import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Pipette } from 'lucide-react';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function isValidHex(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

function normalizeHex(v: string) {
  let h = v.trim();
  if (!h.startsWith('#')) h = '#' + h;
  return h.slice(0, 7).toUpperCase();
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
  open,
  onOpenChange,
  mode: initialMode,
  initialHex,
  initialGradientFrom,
  initialGradientTo,
  canSave,
  onApplySolid,
  onApplyGradient,
  onSaveColor,
  onSaveGradient,
}: ColorPickerDialogProps) {
  const [tab, setTab] = useState<string>(initialMode);
  const [hex, setHex] = useState(initialHex || '#FFFFFF');
  const [hexInput, setHexInput] = useState(initialHex || '#FFFFFF');
  const [gradFrom, setGradFrom] = useState(initialGradientFrom || '#F8F8F8');
  const [gradTo, setGradTo] = useState(initialGradientTo || '#EEEEEE');
  const [gradFromInput, setGradFromInput] = useState(initialGradientFrom || '#F8F8F8');
  const [gradToInput, setGradToInput] = useState(initialGradientTo || '#EEEEEE');

  // Sync when dialog opens with new values
  useEffect(() => {
    if (open) {
      setTab(initialMode);
      setHex(initialHex || '#FFFFFF');
      setHexInput(initialHex || '#FFFFFF');
      setGradFrom(initialGradientFrom || '#F8F8F8');
      setGradTo(initialGradientTo || '#EEEEEE');
      setGradFromInput(initialGradientFrom || '#F8F8F8');
      setGradToInput(initialGradientTo || '#EEEEEE');
    }
  }, [open, initialMode, initialHex, initialGradientFrom, initialGradientTo]);

  const rgb = hexToRgb(hex);

  const handleHexInputBlur = () => {
    const n = normalizeHex(hexInput);
    if (isValidHex(n)) {
      setHex(n);
      setHexInput(n);
    } else {
      setHexInput(hex);
    }
  };

  const handleGradFromBlur = () => {
    const n = normalizeHex(gradFromInput);
    if (isValidHex(n)) {
      setGradFrom(n);
      setGradFromInput(n);
    } else {
      setGradFromInput(gradFrom);
    }
  };

  const handleGradToBlur = () => {
    const n = normalizeHex(gradToInput);
    if (isValidHex(n)) {
      setGradTo(n);
      setGradToInput(n);
    } else {
      setGradToInput(gradTo);
    }
  };

  const handleApply = () => {
    if (tab === 'solid') {
      onApplySolid(hex);
    } else {
      onApplyGradient(gradFrom, gradTo);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold">Custom Color</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="px-5">
            <TabsList className="w-full grid grid-cols-2 h-9">
              <TabsTrigger value="solid" className="text-xs">Solid</TabsTrigger>
              <TabsTrigger value="gradient" className="text-xs">Gradient</TabsTrigger>
            </TabsList>
          </div>

          {/* ─── Solid Tab ─── */}
          <TabsContent value="solid" className="px-5 pb-5 pt-4 space-y-4 mt-0">
            {/* Preview */}
            <div
              className="w-full h-24 rounded-lg border border-border shadow-inner"
              style={{ background: isValidHex(hex) ? hex : '#FFFFFF' }}
            />

            {/* Picker + Hex */}
            <div className="flex items-center gap-3">
              <label className="relative shrink-0 cursor-pointer group">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm group-hover:ring-2 group-hover:ring-primary/40 transition-all"
                  style={{ background: hex }}
                />
                <Pipette className="absolute bottom-0.5 right-0.5 w-3 h-3 text-white drop-shadow-md" />
                <input
                  type="color"
                  value={isValidHex(hex) ? hex : '#FFFFFF'}
                  onChange={e => {
                    const v = e.target.value.toUpperCase();
                    setHex(v);
                    setHexInput(v);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">HEX</label>
                <Input
                  value={hexInput}
                  onChange={e => setHexInput(e.target.value)}
                  onBlur={handleHexInputBlur}
                  onKeyDown={e => { if (e.key === 'Enter') handleHexInputBlur(); }}
                  className="h-8 text-xs font-mono"
                  placeholder="#FF5522"
                  maxLength={7}
                />
              </div>
            </div>

            {/* RGB readout */}
            {rgb && (
              <div className="flex gap-3 text-[11px] text-muted-foreground">
                <span>R: <span className="font-mono text-foreground">{rgb.r}</span></span>
                <span>G: <span className="font-mono text-foreground">{rgb.g}</span></span>
                <span>B: <span className="font-mono text-foreground">{rgb.b}</span></span>
              </div>
            )}

            {/* Save */}
            {canSave && isValidHex(hex) && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5"
                onClick={() => onSaveColor(hex)}
              >
                <Save className="w-3 h-3" /> Save to palette
              </Button>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </TabsContent>

          {/* ─── Gradient Tab ─── */}
          <TabsContent value="gradient" className="px-5 pb-5 pt-4 space-y-4 mt-0">
            {/* Gradient preview */}
            <div
              className="w-full h-24 rounded-lg border border-border shadow-inner"
              style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
            />

            {/* Two color wells */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Start</span>
                <label className="relative block cursor-pointer group">
                  <div
                    className="w-full h-10 rounded-lg border-2 border-border shadow-sm group-hover:ring-2 group-hover:ring-primary/40 transition-all"
                    style={{ background: gradFrom }}
                  />
                  <Pipette className="absolute bottom-1 right-1 w-3 h-3 text-white drop-shadow-md" />
                  <input
                    type="color"
                    value={isValidHex(gradFrom) ? gradFrom : '#F8F8F8'}
                    onChange={e => {
                      const v = e.target.value.toUpperCase();
                      setGradFrom(v);
                      setGradFromInput(v);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
                <Input
                  value={gradFromInput}
                  onChange={e => setGradFromInput(e.target.value)}
                  onBlur={handleGradFromBlur}
                  onKeyDown={e => { if (e.key === 'Enter') handleGradFromBlur(); }}
                  className="h-7 text-[11px] font-mono"
                  maxLength={7}
                />
              </div>

              {/* End */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">End</span>
                <label className="relative block cursor-pointer group">
                  <div
                    className="w-full h-10 rounded-lg border-2 border-border shadow-sm group-hover:ring-2 group-hover:ring-primary/40 transition-all"
                    style={{ background: gradTo }}
                  />
                  <Pipette className="absolute bottom-1 right-1 w-3 h-3 text-white drop-shadow-md" />
                  <input
                    type="color"
                    value={isValidHex(gradTo) ? gradTo : '#EEEEEE'}
                    onChange={e => {
                      const v = e.target.value.toUpperCase();
                      setGradTo(v);
                      setGradToInput(v);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
                <Input
                  value={gradToInput}
                  onChange={e => setGradToInput(e.target.value)}
                  onBlur={handleGradToBlur}
                  onKeyDown={e => { if (e.key === 'Enter') handleGradToBlur(); }}
                  className="h-7 text-[11px] font-mono"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Save */}
            {canSave && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5"
                onClick={() => onSaveGradient(gradFrom, gradTo)}
              >
                <Save className="w-3 h-3" /> Save to palette
              </Button>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1 text-xs" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
