import { Switch } from '@/components/ui/switch';

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

const RULES: { key: keyof Omit<PreservationRulesPanelProps, `on${string}`>; label: string }[] = [
  { key: 'preserveScene', label: 'Preserve scene composition' },
  { key: 'preserveProductDetails', label: 'Preserve product details' },
  { key: 'preserveIdentity', label: 'Preserve subject identity' },
  { key: 'preserveOutfit', label: 'Preserve outfit / styling' },
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
      <h3 className="text-sm font-medium text-foreground">Preservation Rules</h3>
      {RULES.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">{label}</label>
          <Switch checked={props[key] as boolean} onCheckedChange={handlers[key]} />
        </div>
      ))}
    </div>
  );
}
