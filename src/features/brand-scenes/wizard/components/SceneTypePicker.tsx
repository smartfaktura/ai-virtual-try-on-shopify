import { SCENE_TYPES, type SceneTypeId } from "../registry/settingsBySubfamily";
import { WizardCard } from "./WizardCard";

interface Props {
  value: SceneTypeId | undefined;
  onChange: (next: SceneTypeId | undefined) => void;
}

/**
 * Stage A — 5 scene-type cards. Clicking the active one clears it.
 * Uses the shared WizardCard so spacing/typography matches Source + Family steps.
 */
export function SceneTypePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {SCENE_TYPES.map((t) => {
        const active = value === t.value;
        return (
          <WizardCard
            key={t.value}
            active={active}
            onClick={() => onChange(active ? undefined : t.value)}
            title={t.label}
            body={t.vibe}
          />
        );
      })}
    </div>
  );
}
