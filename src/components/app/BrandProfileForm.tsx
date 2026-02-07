import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { BrandProfile } from '@/pages/BrandProfiles';

interface BrandProfileFormProps {
  open: boolean;
  onClose: () => void;
  profile: BrandProfile | null;
}

const TONE_OPTIONS = ['luxury', 'clean', 'bold', 'minimal', 'playful'];
const LIGHTING_OPTIONS = ['soft diffused', 'dramatic side', 'natural window', 'studio flat', 'golden hour', 'high key'];
const BACKGROUND_OPTIONS = ['studio', 'lifestyle', 'gradient', 'pattern', 'contextual'];
const COLOR_TEMP_OPTIONS = ['warm', 'neutral', 'cool'];
const COMPOSITION_OPTIONS = ['centered', 'rule-of-thirds', 'dynamic', 'symmetrical', 'off-center'];

export function BrandProfileForm({ open, onClose, profile }: BrandProfileFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('clean');
  const [lightingStyle, setLightingStyle] = useState('soft diffused');
  const [backgroundStyle, setBackgroundStyle] = useState('studio');
  const [colorTemperature, setColorTemperature] = useState('neutral');
  const [compositionBias, setCompositionBias] = useState('centered');
  const [doNotRules, setDoNotRules] = useState<string[]>([]);
  const [ruleInput, setRuleInput] = useState('');

  const isEditing = !!profile;

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setDescription(profile.brand_description);
      setTone(profile.tone);
      setLightingStyle(profile.lighting_style);
      setBackgroundStyle(profile.background_style);
      setColorTemperature(profile.color_temperature);
      setCompositionBias(profile.composition_bias);
      setDoNotRules(profile.do_not_rules || []);
    } else {
      setName('');
      setDescription('');
      setTone('clean');
      setLightingStyle('soft diffused');
      setBackgroundStyle('studio');
      setColorTemperature('neutral');
      setCompositionBias('centered');
      setDoNotRules([]);
    }
    setRuleInput('');
  }, [profile, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const payload = {
        user_id: user.id,
        name,
        brand_description: description,
        tone,
        lighting_style: lightingStyle,
        background_style: backgroundStyle,
        color_temperature: colorTemperature,
        composition_bias: compositionBias,
        do_not_rules: doNotRules,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('brand_profiles')
          .update(payload)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('brand_profiles')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-profiles'] });
      toast.success(isEditing ? 'Brand profile updated' : 'Brand profile created');
      onClose();
    },
    onError: () => toast.error('Failed to save brand profile'),
  });

  const addRule = () => {
    const trimmed = ruleInput.trim();
    if (trimmed && !doNotRules.includes(trimmed)) {
      setDoNotRules(prev => [...prev, trimmed]);
      setRuleInput('');
    }
  };

  const removeRule = (rule: string) => {
    setDoNotRules(prev => prev.filter(r => r !== rule));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRule();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Brand Profile' : 'Create Brand Profile'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="bp-name">Profile Name</Label>
            <Input
              id="bp-name"
              placeholder="e.g. My Premium Brand"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="bp-desc">Brand Description</Label>
            <Textarea
              id="bp-desc"
              placeholder="Describe what your brand is about..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lighting */}
          <div className="space-y-1.5">
            <Label>Lighting Style</Label>
            <Select value={lightingStyle} onValueChange={setLightingStyle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LIGHTING_OPTIONS.map(l => (
                  <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Background */}
          <div className="space-y-1.5">
            <Label>Background Style</Label>
            <Select value={backgroundStyle} onValueChange={setBackgroundStyle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BACKGROUND_OPTIONS.map(b => (
                  <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Temperature */}
          <div className="space-y-1.5">
            <Label>Color Temperature</Label>
            <Select value={colorTemperature} onValueChange={setColorTemperature}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLOR_TEMP_OPTIONS.map(c => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Composition */}
          <div className="space-y-1.5">
            <Label>Composition Bias</Label>
            <Select value={compositionBias} onValueChange={setCompositionBias}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMPOSITION_OPTIONS.map(c => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Do-Not Rules */}
          <div className="space-y-1.5">
            <Label>Do-Not Rules</Label>
            <p className="text-xs text-muted-foreground">Things to avoid in generated images.</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. no text overlays"
                value={ruleInput}
                onChange={e => setRuleInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button variant="outline" size="sm" onClick={addRule} type="button">
                Add
              </Button>
            </div>
            {doNotRules.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {doNotRules.map((rule, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1">
                    {rule}
                    <button onClick={() => removeRule(rule)} className="ml-0.5 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!name.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
