import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "../components/Chip";
import { Section } from "../components/Section";
import type { BrandSceneBaseAnswers } from "../../types";
import type { BrandSceneModule } from "../../constants";
import {
  SCENE_WEATHER,
  SCENE_SEASONS,
  type SceneWeather,
  type SceneSeason,
} from "../constants/scene";
import {
  PROP_DENSITY_LABELS,
  AESTHETIC_ERAS,
  BRAND_VOICES,
  type PropDensity,
  type AestheticEra,
  type BrandVoice,
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
import type { CastPreset } from "../constants/cast";
import { ChipRow } from "./_baseHelpers";

interface Props {
  module?: BrandSceneModule;
  subFamily?: string;
  castPreset?: CastPreset;
  value: BrandSceneBaseAnswers;
  onChange: (patch: Partial<BrandSceneBaseAnswers>) => void;
}

const ENV_GROUPS: { label: string; keys: string[]; defaultOpen?: boolean }[] = [
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
];

export function Step4Environment({
  module,
  subFamily,
  castPreset,
  value,
  onChange,
}: Props) {
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
    for (const [k, v] of Object.entries(res.values))
      if (v !== undefined) cleaned[k] = v;
    onChange({
      setting: next,
      extras: cleaned,
      auto: res.auto,
      recommendations: res.recommendations,
    });
  };

  const propDensityMax = 4 as PropDensity;

  const hasSceneType = !!sceneType;

  return (
    <div className="space-y-7">
      <Section
        label="Scene type"
        helper="Pick this first — everything else tunes to it."
      >
        <SceneTypePicker value={sceneType} onChange={handleSceneType} />
      </Section>

      {!hasSceneType && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Pick a scene type above to unlock setting, weather, mood, and fine-tuning.
          </p>
        </div>
      )}

      {hasSceneType && (
        <>
          <Section label="Setting / environment">
            <SettingPicker
              options={settingPool}
              value={value.setting}
              onChange={handleSetting}
            />
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

      <Section label="Prop density">
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

        const renderField = (f: typeof fields[number]) => {
          const isColorField =
            f.key === "backdrop_color" ||
            f.key === "backdrop_color_a" ||
            f.key === "backdrop_color_b";
          const resolved = f.presetsResolver
            ? { ...f, presets: f.presetsResolver(ctx) }
            : f;
          const writeCtx: SceneCtx = { ...ctx, values: value.extras ?? {} };
          return (
            <ExtrasPillField
              key={f.key}
              field={resolved}
              showAllInitially
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

        // Render every applicable fine-tuning field as a flat Section,
        // preserving the original group ordering.
        const orderedKeys = ENV_GROUPS.flatMap((g) => g.keys);
        const ordered = [
          ...fields.filter((f) => orderedKeys.includes(f.key))
            .sort(
              (a, b) =>
                orderedKeys.indexOf(a.key) - orderedKeys.indexOf(b.key),
            ),
          ...fields.filter((f) => !orderedKeys.includes(f.key)),
        ];
        return <>{ordered.map(renderField)}</>;
      })()}


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
          placeholder="Anything else worth anchoring across every scene"
          className="rounded-xl resize-none"
        />
      </Section>
        </>
      )}
    </div>
  );
}

