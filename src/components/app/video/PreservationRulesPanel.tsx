import { Switch } from '@/components/ui/switch';
import { InfoTooltip } from './InfoTooltip';

interface PreservationRulesPanelProps {
  preserveScene: boolean;
  preserveProductDetails: boolean;
  preserveIdentity: boolean;
  preserveOutfit: boolean;
  onPreserveSceneChange: (v: boolean) => void;
  onPreserveProductDetailsChange: (v: boolean) => void;
  onPreserveIdentityChange: (v: boolean) => void;
  onPreserveOutfitChange: (v: boolean) => void;
}

const RULES: { key: keyof Omit<PreservationRulesPanelProps, `on${string}`>; label: string; tooltip: string }[] = [
  { key: 'preserveScene', label: 'Preserve scene composition', tooltip: 'Keeps background, layout, and overall framing stable.' },
  { key: 'preserveProductDetails', label: 'Preserve product details', tooltip: 'Protects logos, labels, textures, and product geometry from distortion.' },
  { key: 'preserveIdentity', label: 'Preserve subject identity', tooltip: 'Maintains facial features and body proportions. Important for on-model shots.' },
  { key: 'preserveOutfit', label: 'Preserve outfit / styling', tooltip: 'Keeps clothing details, colors, and accessories consistent.' },
];

export function PreservationRulesPanel(props: PreservationRulesPanelProps) {
  const handlers: Record<string, (v: boolean) => void> = {
    preserveScene: props.onPreserveSceneChange,
    preserveProductDetails: props.onPreserveProductDetailsChange,
    preserveIdentity: props.onPreserveIdentityChange,
    preserveOutfit: props.onPreserveOutfitChange,
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-1">
        <h3 className="text-sm font-medium text-foreground">Preservation Rules</h3>
        <InfoTooltip text="Toggle which elements the AI should protect from changing during motion. Critical for brand consistency." />
      </div>
      {RULES.map(({ key, label, tooltip }) => (
        <div key={key} className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <label className="text-xs text-muted-foreground">{label}</label>
            <InfoTooltip text={tooltip} />
          </div>
          <Switch checked={props[key] as boolean} onCheckedChange={handlers[key]} />
        </div>
      ))}
    </div>
  );
}
