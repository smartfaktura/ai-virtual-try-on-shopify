import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chip, AddChip } from "../components/Chip";
import { Section } from "../components/Section";
import type { BrandSceneBaseAnswers } from "../../types";
import type { BrandSceneModule } from "../../constants";
import {
  SCENE_WEATHER,
  SCENE_SEASONS,
  SCENE_LENSES,
  SCENE_DEPTH_OF_FIELD,
  SCENE_PALETTES,
  SCENE_FINISHES,
  type SceneWeather,
  type SceneSeason,
  type SceneLens,
  type SceneDepthOfField,
  type ScenePalette,
  type SceneFinish,
} from "../constants/scene";
import {
  PROP_DENSITY_LABELS,
  COLOR_CONTRASTS,
  SATURATIONS,
  SHADOWS,
  COMPOSITIONS,
  NEG_SPACE_INTENTS,
  AESTHETIC_ERAS,
  REALISM_LEVELS,
  BRAND_VOICES,
  SUBJECT_FOCUSES,
  type PropDensity,
  type ColorContrast,
  type Saturation,
  type Shadow,
  type Composition,
  type NegSpaceIntent,
  type AestheticEra,
  type RealismLevel,
  type BrandVoice,
  type SubjectFocus,
} from "../constants/sceneExtras";
import { SCENE_EXTRAS_FIELDS, applicableFieldsCtx } from "../constants/extras";
import { ExtrasPillField } from "../components/ExtrasPillField";
import { StageCGroup } from "../components/StageCGroup";
import { SceneTypePicker } from "../components/SceneTypePicker";
import { SettingPicker } from "../components/SettingPicker";
import { BackdropColorField } from "../components/BackdropColorField";
import { getSettingPool, type SceneTypeId } from "../registry/settingsBySubfamily";
import {
  applyCascade,
  applySettingCascade,
  softWarnings,
  type SceneCtx,
} from "../rules/sceneRules";
import { resolveAll, tuningLabel } from "../registry/resolvePresets";
import type { CastPreset } from "../constants/cast";

interface Props {
  module?: BrandSceneModule;
  subFamily?: string;
  /** Cast preset from Step 3 — used to hide person-only dials when cast = none. */
  castPreset?: CastPreset;
  value: BrandSceneBaseAnswers;
  onChange: (patch: Partial<BrandSceneBaseAnswers>) => void;
}




// Phase 7k — top-level "Time of day" removed (was duplicating Stage C → Light & time
// → "Time of day (detail)"). The 14-option detail field is the single source of truth.

export function Step3BaseAnswers({ module, subFamily, castPreset, value, onChange }: Props) {
  const resolved = useMemo(
    () => resolveAll(module, subFamily),
    [module, subFamily],
  );
  const tuned = tuningLabel(module, subFamily);

  // Filter helpers — expanded=true returns the full global list.
  const lenses = (expanded: boolean) =>
    expanded ? SCENE_LENSES : SCENE_LENSES.filter((l) => resolved.lens.includes(l.value));
  const dofs = (expanded: boolean) =>
    expanded
      ? SCENE_DEPTH_OF_FIELD
      : SCENE_DEPTH_OF_FIELD.filter((d) => resolved.depthOfField.includes(d.value));
  const palettes = (expanded: boolean) =>
    expanded ? SCENE_PALETTES : SCENE_PALETTES.filter((p) => resolved.palettes.includes(p.value));
  const finishes = (expanded: boolean) =>
    expanded ? SCENE_FINISHES : SCENE_FINISHES.filter((f) => resolved.finishes.includes(f.value));

  const propDensityMax = resolved.propDensityMax;

  const sceneType = value.scene_type as SceneTypeId | undefined;
  const settingPool = useMemo(
    () => getSettingPool(module, subFamily, sceneType),
    [module, subFamily, sceneType],
  );

  const ctxBase: Omit<SceneCtx, "values" | "auto" | "recommendations"> = {
    module,
    sub_family: subFamily,
    scene_type: sceneType,
    setting: value.setting,
    cast: castPreset,
  };

  const warnings = softWarnings({
    ...ctxBase,
    values: { ...(value.extras ?? {}), _weather: value.weather },
    auto: value.auto ?? {},
    recommendations: value.recommendations ?? {},
  });

  const handleSceneType = (next: SceneTypeId | undefined) => {
    onChange({ scene_type: next });
  };

  const handleSetting = (next: string | undefined) => {
    const res = applySettingCascade(next, {
      ...ctxBase,
      setting: next,
      values: value.extras ?? {},
      auto: value.auto ?? {},
      recommendations: value.recommendations ?? {},
    });
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(res.values)) if (v !== undefined) cleaned[k] = v;
    onChange({
      setting: next,
      extras: cleaned,
      auto: res.auto,
      recommendations: res.recommendations,
    });
  };

  return (
    <div className="space-y-7">
      {tuned && (
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Category-tuned · {tuned}
        </div>
      )}

      <Section label="Stage A · Scene type" hint="Pick the world. Everything below tunes to it.">
        <SceneTypePicker value={sceneType} onChange={handleSceneType} />
      </Section>

      <Section
        label="Stage B · Setting / environment"
        hint={
          sceneType
            ? "Tailored to your category — or add your own."
            : "Pick a scene type above to see tailored settings (you can still type your own)."
        }
      >
        <div className="scroll-mt-24">
          <SettingPicker
            options={settingPool}
            value={value.setting}
            onChange={handleSetting}
          />
        </div>
      </Section>

      {warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] px-3 py-2 text-[12px] text-amber-700 dark:text-amber-300 space-y-1">
          {warnings.map((w) => (
            <div key={w}>· {w}</div>
          ))}
        </div>
      )}




      <Section label="Weather / atmosphere">
        <ChipRow
          options={SCENE_WEATHER}
          current={value.weather}
          onPick={(v) => onChange({ weather: v as SceneWeather | undefined })}
        />
      </Section>

      <Section label="Season">
        <ChipRow
          options={SCENE_SEASONS}
          current={value.season}
          onPick={(v) => onChange({ season: v as SceneSeason | undefined })}
        />
      </Section>

      {/* Phase 7k — "Time of day" moved to Stage C → Light & time (single field). */}


      <Section label="Brand voice">
        <ChipRow
          options={BRAND_VOICES}
          current={value.brand_voice}
          onPick={(v) => onChange({ brand_voice: v as BrandVoice | undefined })}
        />
      </Section>

      <Section label="Aesthetic era">
        <ChipRow
          options={AESTHETIC_ERAS}
          current={value.aesthetic_era}
          onPick={(v) => onChange({ aesthetic_era: v as AestheticEra | undefined })}
        />
      </Section>

      <Section label="Realism level">
        <ChipRow
          options={REALISM_LEVELS}
          current={value.realism}
          onPick={(v) => onChange({ realism: v as RealismLevel | undefined })}
        />
      </Section>


      <Section label="Shadows / reflections">
        <ChipRow
          options={SHADOWS}
          current={value.shadows}
          onPick={(v) => onChange({ shadows: v as Shadow | undefined })}
        />
      </Section>

      <Section label="Camera & lens" expandable>
        {(expanded) => (
          <ChipRow
            options={lenses(expanded)}
            current={value.lens}
            onPick={(v) => onChange({ lens: v as SceneLens | undefined })}
          />
        )}
      </Section>

      <Section label="Depth of field" expandable>
        {(expanded) => (
          <ChipRow
            options={dofs(expanded)}
            current={value.depth_of_field}
            onPick={(v) =>
              onChange({ depth_of_field: v as SceneDepthOfField | undefined })
            }
          />
        )}
      </Section>


      <Section label="Composition geometry">
        <ChipRow
          options={COMPOSITIONS}
          current={value.composition}
          onPick={(v) => onChange({ composition: v as Composition | undefined })}
        />
      </Section>

      <Section label="Negative-space intent">
        <ChipRow
          options={NEG_SPACE_INTENTS}
          current={value.negative_space_intent}
          onPick={(v) =>
            onChange({ negative_space_intent: v as NegSpaceIntent | undefined })
          }
        />
      </Section>

      <Section label="Subject focus">
        <ChipRow
          options={SUBJECT_FOCUSES}
          current={value.subject_focus}
          onPick={(v) => onChange({ subject_focus: v as SubjectFocus | undefined })}
        />
      </Section>

      <Section label="Color palette anchor" expandable>
        {(expanded) => (
          <PaletteBlock
            presets={palettes(expanded)}
            preset={value.palette_preset}
            custom={value.palette_custom}
            onPreset={(p) =>
              onChange({ palette_preset: p, palette_custom: undefined })
            }
            onCustom={(c) =>
              onChange({ palette_custom: c, palette_preset: undefined })
            }
          />
        )}
      </Section>

      <Section label="Color contrast">
        <ChipRow
          options={COLOR_CONTRASTS}
          current={value.color_contrast}
          onPick={(v) => onChange({ color_contrast: v as ColorContrast | undefined })}
        />
      </Section>

      <Section label="Saturation">
        <ChipRow
          options={SATURATIONS}
          current={value.saturation}
          onPick={(v) => onChange({ saturation: v as Saturation | undefined })}
        />
      </Section>

      <Section label="Finish / film look" expandable>
        {(expanded) => (
          <ChipRow
            options={finishes(expanded)}
            current={value.finish}
            onPick={(v) => onChange({ finish: v as SceneFinish | undefined })}
          />
        )}
      </Section>

      <Section
        label="Prop density"
        hint={`Capped at "${PROP_DENSITY_LABELS[propDensityMax]}" for this category`}
      >
        <div className="flex flex-wrap gap-2">
          {PROP_DENSITY_LABELS.slice(0, propDensityMax + 1).map((label, idx) => (
            <Chip
              key={label}
              active={value.prop_density === idx}
              onClick={() =>
                onChange({
                  prop_density:
                    value.prop_density === idx ? undefined : (idx as PropDensity),
                })
              }
            >
              {label}
            </Chip>
          ))}
        </div>
      </Section>



      {/* Phase 7j — Stage C grouped collapsibles. */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 pt-2">
          Stage C · More creative dials
        </div>
        {(() => {
          const ctx: SceneCtx = {
            module,
            sub_family: subFamily,
            scene_type: sceneType,
            setting: value.setting,
            cast: castPreset,
            values: { ...(value.extras ?? {}), _weather: value.weather },
            auto: value.auto ?? {},
            recommendations: value.recommendations ?? {},
          };
          const fields = applicableFieldsCtx(SCENE_EXTRAS_FIELDS, ctx);

          const GROUPS: { label: string; keys: string[]; defaultOpen?: boolean }[] = [
            {
              label: "Backdrop & floor",
              defaultOpen: true,
              keys: [
                "backdrop_type",
                "backdrop_color",
                "backdrop_color_a",
                "backdrop_color_b",
                "backdrop_gradient",
                "gradient_direction",
                "floor",
                "studio_fx",
              ],
            },
            {
              label: "Light & time",
              keys: ["time_of_day_detail", "light_direction", "light_quality"],
            },
            {
              label: "Camera",
              keys: [
                "camera_angle",
                "camera_angle_apparel",
                "camera_angle_footwear",
                "camera_angle_eyewear",
                "camera_angle_jewelry",
              ],
            },
            {
              label: "Composition & crop",
              keys: ["motion", "composition_energy", "crop_safety"],
            },
          ];

          const renderField = (f: typeof fields[number]) => {
            const isColorField =
              f.key === "backdrop_color" ||
              f.key === "backdrop_color_a" ||
              f.key === "backdrop_color_b";
            // Phase 7j — resolve presets dynamically when the field opts in.
            const resolved = f.presetsResolver
              ? { ...f, presets: f.presetsResolver(ctx) }
              : f;
            const writeCtx: SceneCtx = {
              ...ctx,
              values: value.extras ?? {},
            };
            return (
              <ExtrasPillField
                key={f.key}
                field={resolved}
                value={value.extras?.[f.key]}
                autoFilled={!!value.auto?.[f.key]}
                recommended={value.recommendations?.[f.key]}
                onChange={(next) => {
                  const { values, auto, recommendations } = applyCascade(
                    f.key,
                    next,
                    writeCtx,
                  );
                  const cleaned: Record<string, string> = {};
                  for (const [k, v] of Object.entries(values))
                    if (v !== undefined) cleaned[k] = v;
                  onChange({ extras: cleaned, auto, recommendations });
                }}
              >
                {isColorField && (
                  <BackdropColorField
                    value={value.extras?.[f.key]}
                    onChange={(next) => {
                      const { values, auto, recommendations } = applyCascade(
                        f.key,
                        next,
                        writeCtx,
                      );
                      const cleaned: Record<string, string> = {};
                      for (const [k, v] of Object.entries(values))
                        if (v !== undefined) cleaned[k] = v;
                      onChange({ extras: cleaned, auto, recommendations });
                    }}
                  />
                )}
              </ExtrasPillField>
            );
          };

          const groupedKeys = new Set(GROUPS.flatMap((g) => g.keys));
          const ungrouped = fields.filter((f) => !groupedKeys.has(f.key));

          return (
            <>
              {GROUPS.map((g) => {
                const groupFields = fields.filter((f) => g.keys.includes(f.key));
                if (groupFields.length === 0) return null;
                return (
                  <StageCGroup
                    key={g.label}
                    label={g.label}
                    defaultOpen={g.defaultOpen}
                  >
                    {groupFields.map(renderField)}
                  </StageCGroup>
                );
              })}
              {ungrouped.length > 0 && (
                <StageCGroup label="More">{ungrouped.map(renderField)}</StageCGroup>
              )}
            </>
          );
        })()}
      </div>





      <Section label="Avoid in this scene">
        <Textarea
          value={value.avoid ?? ""}
          maxLength={240}
          rows={2}
          onChange={(e) => onChange({ avoid: e.target.value })}
          placeholder="e.g. no visible logos, no children, no text overlays"
          className="rounded-xl resize-none"
        />
      </Section>

      <Section label="Notes">
        <Textarea
          value={value.notes ?? ""}
          maxLength={600}
          rows={3}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Anything else worth anchoring across every scene."
          className="rounded-xl resize-none"
        />
      </Section>

    </div>
  );
}

function ChipRow<T extends string>({
  options,
  current,
  onPick,
}: {
  options: readonly { value: T; label: string }[];
  current: T | undefined;
  onPick: (v: T | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o.value}
          active={current === o.value}
          onClick={() => onPick(current === o.value ? undefined : o.value)}
        >
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

function PaletteBlock({
  presets,
  preset,
  custom,
  onPreset,
  onCustom,
}: {
  presets: readonly { value: ScenePalette; label: string }[];
  preset?: ScenePalette;
  custom?: string;
  onPreset: (p: ScenePalette | undefined) => void;
  onCustom: (c: string) => void;
}) {
  const [showCustom, setShowCustom] = useState(!!custom);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Chip
            key={p.value}
            active={preset === p.value && !custom}
            onClick={() => {
              setShowCustom(false);
              onPreset(preset === p.value ? undefined : p.value);
            }}
          >
            {p.label}
          </Chip>
        ))}
        {!showCustom && <AddChip onClick={() => setShowCustom(true)} />}
      </div>
      {showCustom && (
        <Input
          value={custom ?? ""}
          maxLength={120}
          onChange={(e) => onCustom(e.target.value)}
          placeholder="Describe your own palette (e.g. dusty rose + cocoa)"
          className="rounded-xl mt-2"
          autoFocus
        />
      )}
    </div>
  );
}

function PillField({
  label,
  required,
  presets,
  current,
  placeholder,
  onChange,
}: {
  label: string;
  required?: boolean;
  presets: readonly string[];
  current: string;
  placeholder: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        {required && <span className="text-foreground/60 ml-1">·</span>}
      </Label>
      <PillFieldInner
        presets={presets}
        current={current}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}

function PillFieldInner({
  presets,
  current,
  placeholder,
  onChange,
}: {
  presets: readonly string[];
  current: string;
  placeholder: string;
  onChange: (next: string) => void;
}) {
  const isPreset = presets.includes(current);
  const [showCustom, setShowCustom] = useState(current.length > 0 && !isPreset);

  const select = (preset: string) => {
    setShowCustom(false);
    onChange(preset);
  };
  const openCustom = () => {
    setShowCustom(true);
    if (isPreset) onChange("");
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Chip key={preset} active={current === preset} onClick={() => select(preset)}>
            {preset}
          </Chip>
        ))}
        {!showCustom && <AddChip onClick={openCustom} />}
      </div>
      {showCustom && (
        <Input
          value={isPreset ? "" : current}
          maxLength={160}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-xl mt-2"
          autoFocus
        />
      )}
    </>
  );
}
