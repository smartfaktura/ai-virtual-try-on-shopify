import { useMemo } from "react";
import { Section } from "../components/Section";
import type { BrandSceneBaseAnswers } from "../../types";
import type { BrandSceneModule } from "../../constants";
import {
  SCENE_LENSES,
  SCENE_DEPTH_OF_FIELD,
  SCENE_PALETTES,
  SCENE_FINISHES,
  type SceneLens,
  type SceneDepthOfField,
  type SceneFinish,
} from "../constants/scene";
import {
  COLOR_CONTRASTS,
  SATURATIONS,
  SHADOWS,
  COMPOSITIONS,
  NEG_SPACE_INTENTS,
  REALISM_LEVELS,
  SUBJECT_FOCUSES,
  type ColorContrast,
  type Saturation,
  type Shadow,
  type Composition,
  type NegSpaceIntent,
  type RealismLevel,
  type SubjectFocus,
} from "../constants/sceneExtras";
import { SCENE_EXTRAS_FIELDS, applicableFieldsCtx } from "../constants/extras";
import { ExtrasPillField } from "../components/ExtrasPillField";
import { StageCGroup } from "../components/StageCGroup";
import type { SceneTypeId } from "../registry/settingsBySubfamily";
import { applyCascade, type SceneCtx } from "../rules/sceneRules";
import { resolveAll } from "../registry/resolvePresets";
import type { CastPreset } from "../constants/cast";
import { ChipRow, PaletteBlock } from "./_baseHelpers";

interface Props {
  module?: BrandSceneModule;
  subFamily?: string;
  castPreset?: CastPreset;
  value: BrandSceneBaseAnswers;
  onChange: (patch: Partial<BrandSceneBaseAnswers>) => void;
}

const PHOTO_GROUPS: { label: string; keys: string[]; defaultOpen?: boolean }[] = [
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

export function Step5Photography({
  module,
  subFamily,
  castPreset,
  value,
  onChange,
}: Props) {
  const resolved = useMemo(
    () => resolveAll(module, subFamily),
    [module, subFamily],
  );

  const lenses = (expanded: boolean) =>
    expanded
      ? SCENE_LENSES
      : SCENE_LENSES.filter((l) => resolved.lens.includes(l.value));
  const dofs = (expanded: boolean) =>
    expanded
      ? SCENE_DEPTH_OF_FIELD
      : SCENE_DEPTH_OF_FIELD.filter((d) =>
          resolved.depthOfField.includes(d.value),
        );
  const palettes = (expanded: boolean) =>
    expanded
      ? SCENE_PALETTES
      : SCENE_PALETTES.filter((p) => resolved.palettes.includes(p.value));
  const finishes = (expanded: boolean) =>
    expanded
      ? SCENE_FINISHES
      : SCENE_FINISHES.filter((f) => resolved.finishes.includes(f.value));

  const sceneType = value.scene_type as SceneTypeId | undefined;

  return (
    <div className="space-y-7">
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

      <Section label="Shadows / reflections">
        <ChipRow
          options={SHADOWS}
          current={value.shadows}
          onPick={(v) => onChange({ shadows: v as Shadow | undefined })}
        />
      </Section>

      <Section label="Realism level">
        <ChipRow
          options={REALISM_LEVELS}
          current={value.realism}
          onPick={(v) => onChange({ realism: v as RealismLevel | undefined })}
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

      <div className="space-y-4 pt-2 border-t border-border/60">
        <div className="pt-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
            Optional fine-tuning{" "}
            <span className="normal-case tracking-normal text-muted-foreground/60">
              — skip and we'll pick smart defaults
            </span>
          </div>
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

          const renderField = (f: typeof fields[number]) => {
            const resolvedF = f.presetsResolver
              ? { ...f, presets: f.presetsResolver(ctx) }
              : f;
            const writeCtx: SceneCtx = { ...ctx, values: value.extras ?? {} };
            return (
              <ExtrasPillField
                key={f.key}
                field={resolvedF}
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
              />
            );
          };

          return (
            <>
              {PHOTO_GROUPS.map((g) => {
                const groupFields = fields.filter((f) => g.keys.includes(f.key));
                if (groupFields.length === 0) return null;
                const filledCount = groupFields.filter(
                  (f) => !!value.extras?.[f.key],
                ).length;
                return (
                  <StageCGroup
                    key={g.label}
                    label={g.label}
                    defaultOpen={g.defaultOpen}
                    count={filledCount}
                  >
                    {groupFields.map(renderField)}
                  </StageCGroup>
                );
              })}
            </>
          );
        })()}
      </div>
    </div>
  );
}
