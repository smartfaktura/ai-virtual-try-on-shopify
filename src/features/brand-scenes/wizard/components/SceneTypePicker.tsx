import { SCENE_TYPES, type SceneTypeId } from "../registry/settingsBySubfamily";

interface Props {
  value: SceneTypeId | undefined;
  onChange: (next: SceneTypeId | undefined) => void;
}

/**
 * Stage A — 6 scene-type cards. Clicking the active one clears it.
 */
export function SceneTypePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {SCENE_TYPES.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(active ? undefined : t.value)}
            className={[
              "text-left rounded-2xl border px-4 py-3 transition-all",
              active
                ? "border-foreground bg-foreground/[0.04] shadow-sm"
                : "border-border bg-card hover:border-foreground/40",
            ].join(" ")}
          >
            <div className="text-sm font-medium">{t.label}</div>
            <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{t.vibe}</div>
          </button>
        );
      })}
    </div>
  );
}
