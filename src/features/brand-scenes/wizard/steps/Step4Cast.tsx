import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "../components/Chip";
import { Section } from "../components/Section";
import {
  CAST_ACTIONS,
  CAST_AGES,
  CAST_GENDERS,
  CAST_INTERACTIONS,
  CAST_NOTE_MAX,
  CAST_PRESETS,
  CAST_PRESETS_WITH_PEOPLE,
  CAST_VIBES,
  type CastAction,
  type CastAge,
  type CastGender,
  type CastInteraction,
  type CastPreset,
  type CastVibe,
} from "../constants/cast";
import {
  SCALE_PRESETS,
  SCALE_UNITS,
  type ScalePreset,
  type ScaleUnit,
} from "../constants/scale";
import { WARDROBE_COLORS, type WardrobeColor } from "../constants/scene";
import {
  BODY_PART_FOCUS,
  GAZE_DIRECTIONS,
  GROUP_DYNAMICS,
  HANDS_ON_PRODUCT,
  DIVERSITY_OPTIONS,
  type BodyPartFocus,
  type GazeDirection,
  type GroupDynamic,
  type HandsOnProduct,
  type Diversity,
} from "../constants/sceneExtras";
import { resolveAll } from "../registry/resolvePresets";
import {
  forbiddenInteractions,
  forbiddenCastPresets,
  warnings as sceneWarnings,
} from "../rules/combinationGuards";
import type {
  BrandSceneAnswers,
  BrandSceneCast,
  BrandSceneScale,
} from "../../types";
import type { BrandSceneModule } from "../../constants";

interface Props {
  module?: BrandSceneModule;
  subFamily?: string;
  source: BrandSceneAnswers["source"];
  answers: BrandSceneAnswers;
  cast?: BrandSceneCast;
  scale?: BrandSceneScale;
  onCastChange: (patch: Partial<BrandSceneCast>) => void;
  onScaleChange: (patch: Partial<BrandSceneScale>) => void;
}

export function Step4Cast({
  module,
  subFamily,
  source,
  answers,
  cast,
  scale,
  onCastChange,
  onScaleChange,
}: Props) {
  const isReference = source === "reference";
  const resolved = useMemo(
    () => resolveAll(module, subFamily),
    [module, subFamily],
  );
  const preset: CastPreset | undefined = cast?.preset;
  const hasPeople = preset
    ? CAST_PRESETS_WITH_PEOPLE.includes(preset)
    : false;
  const isReplicate = preset === "replicate";
  const scalePreset: ScalePreset = scale?.preset ?? resolved.scale.default;

  // Seed defaults exactly once (run after render, not during).
  useEffect(() => {
    if (!scale?.preset) onScaleChange({ preset: scalePreset });
    if (!cast?.preset) onCastChange({ preset: resolved.defaultCast });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, subFamily]);

  // Combo guards.
  const forbiddenInter = forbiddenInteractions(preset, module, scalePreset);
  const forbiddenCast = forbiddenCastPresets(scalePreset, module);

  // Resolved + filtered.
  const showAllScales = (expanded: boolean): typeof SCALE_PRESETS =>
    expanded
      ? SCALE_PRESETS
      : (SCALE_PRESETS.filter((s) =>
          resolved.scale.values.includes(s.value),
        ) as unknown as typeof SCALE_PRESETS);

  const visibleCastPresets = (expanded: boolean) => {
    const base = expanded
      ? CAST_PRESETS
      : CAST_PRESETS.filter((c) => resolved.castPresets.includes(c.value));
    // Always include the reference-only replicate option when applicable.
    const withRef = base.filter(
      (p) => p.value !== "replicate" || isReference,
    );
    return withRef.filter((p) => !forbiddenCast.has(p.value));
  };

  const visibleInteractions = (expanded: boolean) => {
    const base = expanded
      ? CAST_INTERACTIONS
      : CAST_INTERACTIONS.filter((i) => resolved.interactions.includes(i.value));
    return base.filter((i) => !forbiddenInter.has(i.value));
  };

  const visibleHandsOnProduct =
    HANDS_ON_PRODUCT.filter((h) => resolved.handsOnProduct.includes(h.value));
  const visibleBodyPart =
    BODY_PART_FOCUS.filter((b) => resolved.bodyPartFocus.includes(b.value));

  const wardrobes =
    WARDROBE_COLORS.filter((w) => resolved.wardrobeColors.includes(w.value));

  const [showExact, setShowExact] = useState(!!scale?.dimensions);

  const warnings = sceneWarnings(answers);

  return (
    <div className="space-y-8">
      {/* Cast preset */}
      <Section label="Cast" required expandable>
        {(expanded) => (
          <div className="flex flex-wrap gap-2">
            {visibleCastPresets(expanded).map((p) => (
              <Chip
                key={p.value}
                active={preset === p.value}
                onClick={() => {
                  if (p.value === "replicate") {
                    onCastChange({
                      preset: "replicate",
                      gender: undefined,
                      age: undefined,
                      vibe: undefined,
                      interaction: undefined,
                      action: undefined,
                      body_part_focus: undefined,
                      gaze: undefined,
                      group_dynamic: undefined,
                      hands_on_product: undefined,
                    });
                    return;
                  }
                  // Switching cast may invalidate interaction — clear it.
                  onCastChange({
                    preset: p.value,
                    interaction:
                      cast?.interaction &&
                      !forbiddenInteractions(p.value, module, scalePreset).has(
                        cast.interaction,
                      )
                        ? cast.interaction
                        : undefined,
                    group_dynamic:
                      p.value === "two" || p.value === "group"
                        ? cast?.group_dynamic
                        : undefined,
                  });
                }}
              >
                {p.label}
              </Chip>
            ))}
          </div>
        )}
      </Section>

      {isReplicate && (
        <p className="text-[11px] text-muted-foreground -mt-4 leading-relaxed">
          Subject, pose, framing and lighting will be locked to your reference.
          Product scale below still applies because the inserted product may
          differ from what's in the image.
        </p>
      )}

      {/* People details */}
      {hasPeople && !isReplicate && (
        <>
          <Section label="Gender mix">
            <MultiSelect
              options={CAST_GENDERS}
              current={cast?.gender ?? []}
              onToggle={(v) =>
                onCastChange({
                  gender: toggleArr(cast?.gender ?? [], v as CastGender),
                })
              }
            />
          </Section>

          <Section label="Age feel">
            <MultiSelect
              options={CAST_AGES}
              current={cast?.age ?? []}
              onToggle={(v) =>
                onCastChange({
                  age: toggleArr(cast?.age ?? [], v as CastAge),
                })
              }
            />
          </Section>

          <Section label="Vibe">
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
          </Section>

          <Section label="Diversity">
            <div className="flex flex-wrap gap-2">
              {DIVERSITY_OPTIONS.map((d) => (
                <Chip
                  key={d.value}
                  active={cast?.diversity === d.value}
                  onClick={() =>
                    onCastChange({
                      diversity:
                        cast?.diversity === d.value
                          ? undefined
                          : (d.value as Diversity),
                    })
                  }
                >
                  {d.label}
                </Chip>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* Interaction */}
      {!isReplicate && (
        <Section label="Product interaction" required expandable>
          {(expanded) => (
            <div className="flex flex-wrap gap-2">
              {visibleInteractions(expanded).map((i) => (
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
          )}
        </Section>
      )}

      {/* Hands-on-product gesture */}
      {!isReplicate &&
        visibleHandsOnProduct.length > 0 &&
        (preset === "hands" || preset === "solo" || preset === "two" || preset === "group") &&
        (scalePreset === "pocket" || scalePreset === "handheld") && (
          <Section label="Hands on product">
            <div className="flex flex-wrap gap-2">
              {visibleHandsOnProduct.map((h) => (
                <Chip
                  key={h.value}
                  active={cast?.hands_on_product === h.value}
                  onClick={() =>
                    onCastChange({
                      hands_on_product:
                        cast?.hands_on_product === h.value
                          ? undefined
                          : (h.value as HandsOnProduct),
                    })
                  }
                >
                  {h.label}
                </Chip>
              ))}
            </div>
          </Section>
        )}

      {/* Body part focus */}
      {!isReplicate && preset !== "none" && visibleBodyPart.length > 0 && (
        <Section label="Body-part focus">
          <div className="flex flex-wrap gap-2">
            {visibleBodyPart.map((b) => (
              <Chip
                key={b.value}
                active={cast?.body_part_focus === b.value}
                onClick={() =>
                  onCastChange({
                    body_part_focus:
                      cast?.body_part_focus === b.value
                        ? undefined
                        : (b.value as BodyPartFocus),
                  })
                }
              >
                {b.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* Gaze */}
      {hasPeople && !isReplicate && (
        <Section label="Gaze direction">
          <div className="flex flex-wrap gap-2">
            {GAZE_DIRECTIONS.map((g) => (
              <Chip
                key={g.value}
                active={cast?.gaze === g.value}
                onClick={() =>
                  onCastChange({
                    gaze:
                      cast?.gaze === g.value
                        ? undefined
                        : (g.value as GazeDirection),
                  })
                }
              >
                {g.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* Group dynamic */}
      {!isReplicate && (preset === "two" || preset === "group") && (
        <Section label="Group dynamic">
          <div className="flex flex-wrap gap-2">
            {GROUP_DYNAMICS.map((g) => (
              <Chip
                key={g.value}
                active={cast?.group_dynamic === g.value}
                onClick={() =>
                  onCastChange({
                    group_dynamic:
                      cast?.group_dynamic === g.value
                        ? undefined
                        : (g.value as GroupDynamic),
                  })
                }
              >
                {g.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* Action */}
      {hasPeople && !isReplicate && (
        <Section label="Action / energy">
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
        </Section>
      )}

      {/* Wardrobe color anchor */}
      {hasPeople && !isReplicate && wardrobes.length > 0 && (
        <Section label="Wardrobe color anchor">
          <div className="flex flex-wrap gap-2">
            {wardrobes.map((w) => (
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
        </Section>
      )}

      {/* Scale */}
      <Section label="Product scale" required expandable>
        {(expanded) => (
          <>
            <div className="flex flex-wrap gap-2">
              {showAllScales(expanded).map((s) => (
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
          </>
        )}
      </Section>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <p
              key={i}
              className={`text-[11px] rounded-xl border px-3 py-2 ${
                w.severity === "warn"
                  ? "border-foreground/30 text-foreground/80"
                  : "border-border text-muted-foreground"
              }`}
            >
              {w.message}
            </p>
          ))}
        </div>
      )}

      {/* Cast note */}
      {!isReplicate && (
        <Section label="Note">
          <Textarea
            value={cast?.note ?? ""}
            maxLength={CAST_NOTE_MAX}
            rows={2}
            onChange={(e) => onCastChange({ note: e.target.value })}
            placeholder="e.g. lead athlete dribbles, second player watches in background"
            className="rounded-xl resize-none"
          />
        </Section>
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
