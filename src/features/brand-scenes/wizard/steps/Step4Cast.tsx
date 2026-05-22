import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "../components/Chip";
import {
  CAST_ACTIONS,
  CAST_AGES,
  CAST_GENDERS,
  CAST_INTERACTIONS,
  CAST_NOTE_MAX,
  CAST_PRESETS,
  CAST_PRESETS_WITH_PEOPLE,
  CAST_VIBES,
  interactionsForFamily,
  type CastAction,
  type CastAge,
  type CastGender,
  type CastInteraction,
  type CastPreset,
  type CastVibe,
} from "../constants/cast";
import {
  defaultScaleForFamily,
  SCALE_PRESETS,
  SCALE_UNITS,
  type ScalePreset,
  type ScaleUnit,
} from "../constants/scale";
import { WARDROBE_COLORS, type WardrobeColor } from "../constants/scene";
import type {
  BrandSceneAnswers,
  BrandSceneCast,
  BrandSceneScale,
} from "../../types";
import type { BrandSceneModule } from "../../constants";

interface Props {
  module?: BrandSceneModule;
  source: BrandSceneAnswers["source"];
  cast?: BrandSceneCast;
  scale?: BrandSceneScale;
  onCastChange: (patch: Partial<BrandSceneCast>) => void;
  onScaleChange: (patch: Partial<BrandSceneScale>) => void;
}

export function Step4Cast({
  module,
  source,
  cast,
  scale,
  onCastChange,
  onScaleChange,
}: Props) {
  const isReference = source === "reference";
  const preset: CastPreset | undefined = cast?.preset;
  const hasPeople = preset
    ? CAST_PRESETS_WITH_PEOPLE.includes(preset)
    : false;
  const isReplicate = preset === "replicate";

  const presetsToShow = CAST_PRESETS.filter(
    (p) => p.value !== "replicate" || isReference,
  );

  const interactions = interactionsForFamily(module);
  const [showExact, setShowExact] = useState(!!scale?.dimensions);
  const scalePreset: ScalePreset = scale?.preset ?? defaultScaleForFamily(module);

  // Ensure a scale preset is always present in state.
  if (!scale?.preset) {
    onScaleChange({ preset: scalePreset });
  }

  return (
    <div className="space-y-8">
      {/* Cast preset */}
      <Block label="Cast" required>
        <div className="flex flex-wrap gap-2">
          {presetsToShow.map((p) => (
            <Chip
              key={p.value}
              active={preset === p.value}
              onClick={() => {
                if (p.value === "replicate") {
                  // Lock everything else.
                  onCastChange({
                    preset: "replicate",
                    gender: undefined,
                    age: undefined,
                    vibe: undefined,
                    interaction: undefined,
                    action: undefined,
                  });
                  return;
                }
                onCastChange({ preset: p.value });
              }}
            >
              {p.label}
            </Chip>
          ))}
        </div>
        {isReplicate && (
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Subject, pose, framing and lighting will be locked to your
            reference. Product scale below still applies because the inserted
            product may differ from what's in the image.
          </p>
        )}
      </Block>

      {/* People details */}
      {hasPeople && !isReplicate && (
        <>
          <Block label="Gender mix">
            <MultiSelect
              options={CAST_GENDERS}
              current={cast?.gender ?? []}
              onToggle={(v) =>
                onCastChange({
                  gender: toggleArr(cast?.gender ?? [], v as CastGender),
                })
              }
            />
          </Block>

          <Block label="Age feel">
            <MultiSelect
              options={CAST_AGES}
              current={cast?.age ?? []}
              onToggle={(v) =>
                onCastChange({
                  age: toggleArr(cast?.age ?? [], v as CastAge),
                })
              }
            />
          </Block>

          <Block label="Vibe">
            <div className="flex flex-wrap gap-2">
              {CAST_VIBES.map((v) => (
                <Chip
                  key={v.value}
                  active={cast?.vibe === v.value}
                  onClick={() =>
                    onCastChange({
                      vibe:
                        cast?.vibe === v.value ? undefined : (v.value as CastVibe),
                    })
                  }
                >
                  {v.label}
                </Chip>
              ))}
            </div>
          </Block>
        </>
      )}

      {/* Interaction */}
      {!isReplicate && (
        <Block label="Product interaction" required>
          <div className="flex flex-wrap gap-2">
            {interactions.map((i) => (
              <Chip
                key={i.value}
                active={cast?.interaction === i.value}
                onClick={() =>
                  onCastChange({ interaction: i.value as CastInteraction })
                }
              >
                {i.label}
              </Chip>
            ))}
          </div>
        </Block>
      )}

      {/* Action */}
      {hasPeople && !isReplicate && (
        <Block label="Action / energy">
          <div className="flex flex-wrap gap-2">
            {CAST_ACTIONS.map((a) => (
              <Chip
                key={a.value}
                active={cast?.action === a.value}
                onClick={() =>
                  onCastChange({
                    action:
                      cast?.action === a.value
                        ? undefined
                        : (a.value as CastAction),
                  })
                }
              >
                {a.label}
              </Chip>
            ))}
          </div>
        </Block>
      )}

      {/* Wardrobe color anchor */}
      {hasPeople && !isReplicate && (
        <Block label="Wardrobe color anchor">
          <div className="flex flex-wrap gap-2">
            {WARDROBE_COLORS.map((w) => (
              <Chip
                key={w.value}
                active={cast?.wardrobe_color === w.value}
                onClick={() =>
                  onCastChange({
                    wardrobe_color:
                      cast?.wardrobe_color === w.value
                        ? undefined
                        : (w.value as WardrobeColor),
                  })
                }
              >
                {w.label}
              </Chip>
            ))}
          </div>
        </Block>
      )}

      {/* Scale */}
      <Block label="Product scale" required>
        <div className="flex flex-wrap gap-2">
          {SCALE_PRESETS.map((s) => (
            <Chip
              key={s.value}
              active={scalePreset === s.value}
              onClick={() => onScaleChange({ preset: s.value })}
            >
              {s.label}
            </Chip>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setShowExact((v) => !v);
            if (showExact) onScaleChange({ dimensions: undefined });
          }}
          className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground mt-3"
        >
          {showExact ? "− Hide exact size" : "+ Add exact size"}
        </button>
        {showExact && (
          <ExactDimensions
            value={scale?.dimensions}
            onChange={(d) => onScaleChange({ dimensions: d })}
          />
        )}
      </Block>

      {/* Cast note */}
      {!isReplicate && (
        <Block label="Note">
          <Textarea
            value={cast?.note ?? ""}
            maxLength={CAST_NOTE_MAX}
            rows={2}
            onChange={(e) => onCastChange({ note: e.target.value })}
            placeholder="e.g. lead athlete dribbles, second player watches in background"
            className="rounded-xl resize-none"
          />
        </Block>
      )}
    </div>
  );
}

function toggleArr<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function MultiSelect({
  options,
  current,
  onToggle,
}: {
  options: readonly { value: string; label: string }[];
  current: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o.value}
          active={current.includes(o.value)}
          onClick={() => onToggle(o.value)}
        >
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

function ExactDimensions({
  value,
  onChange,
}: {
  value?: { w: number; h: number; d?: number; units: ScaleUnit };
  onChange: (d: { w: number; h: number; d?: number; units: ScaleUnit }) => void;
}) {
  const v = value ?? { w: 0, h: 0, units: "cm" as ScaleUnit };
  const set = (patch: Partial<typeof v>) => onChange({ ...v, ...patch });

  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
      <NumberField label="W" value={v.w} onChange={(n) => set({ w: n })} />
      <NumberField label="H" value={v.h} onChange={(n) => set({ h: n })} />
      <NumberField
        label="D"
        value={v.d ?? 0}
        onChange={(n) => set({ d: n || undefined })}
      />
      <div>
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Units
        </Label>
        <div className="flex gap-1 mt-1.5">
          {SCALE_UNITS.map((u) => (
            <Chip key={u} active={v.units === u} onClick={() => set({ units: u })}>
              {u}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      <Input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="rounded-xl mt-1.5"
      />
    </div>
  );
}

function Block({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        {required && <span className="text-foreground/60 ml-1">·</span>}
      </Label>
      {children}
    </div>
  );
}
