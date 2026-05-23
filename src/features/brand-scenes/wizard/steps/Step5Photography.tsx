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
import type { SceneTypeId } from "../registry/settingsBySubfamily";
import { applyCascade, type SceneCtx } from "../rules/sceneRules";
import { resolveAll } from "../registry/resolvePresets";
import type { CastPreset } from "../constants/cast";
import { ChipRow, ChipRowWithOther, PaletteBlock } from "./_baseHelpers";

interface Props {
  module?: BrandSceneModule;
  subFamily?: string;
  castPreset?: CastPreset;
  value: BrandSceneBaseAnswers;
  onChange: (patch: Partial<BrandSceneBaseAnswers>) => void;
}

const PHOTO_EXTRAS_KEYS = [
  "camera_angle",
  "camera_angle_apparel",
  "camera_angle_footwear",
  "camera_angle_eyewear",
  "camera_angle_jewelry",
  "motion",
  "composition_energy",
  "crop_safety",
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
    <div className="space-y-12">
      <div>
        <ChapterHeading>Lens & focus</ChapterHeading>
        <div className="space-y-10">
          <Section
            label="Lens"
            tooltip="Wide = roomy and dramatic. Long = compressed and flattering."
            expandable
          >
            {(expanded) => (
              <ChipRowWithOther
                options={lenses(expanded)}
                current={value.lens}
                custom={value.lens_custom}
                placeholder="e.g. 50mm f/1.4, anamorphic 40mm"
                onPick={(v) => onChange({ lens: v as SceneLens | undefined })}
                onCustom={(c) => onChange({ lens_custom: c })}
              />
            )}
          </Section>

          <Section
            label="Background blur"
            tooltip="Shallow = creamy bokeh behind the product. Deep = everything in focus."
            expandable
          >
            {(expanded) => (
              <ChipRowWithOther
                options={dofs(expanded)}
                current={value.depth_of_field}
                custom={value.depth_of_field_custom}
                placeholder="e.g. razor-thin focus on the logo only"
                onPick={(v) =>
                  onChange({ depth_of_field: v as SceneDepthOfField | undefined })
                }
                onCustom={(c) => onChange({ depth_of_field_custom: c })}
              />
            )}
          </Section>

          <Section label="Focus">
            <ChipRowWithOther
              options={SUBJECT_FOCUSES}
              current={value.subject_focus}
              custom={value.subject_focus_custom}
              placeholder="e.g. focus on the strap stitching"
              onPick={(v) => onChange({ subject_focus: v as SubjectFocus | undefined })}
              onCustom={(c) => onChange({ subject_focus_custom: c })}
            />
          </Section>

          <Section label="Shadows">
            <ChipRowWithOther
              options={SHADOWS}
              current={value.shadows}
              custom={value.shadows_custom}
              placeholder="e.g. hard 45° rim shadow, no fill"
              onPick={(v) => onChange({ shadows: v as Shadow | undefined })}
              onCustom={(c) => onChange({ shadows_custom: c })}
            />
          </Section>
        </div>
      </div>

      <div>
        <ChapterHeading>Composition</ChapterHeading>
        <div className="space-y-10">
          <Section label="Composition">
            <ChipRowWithOther
              options={COMPOSITIONS}
              current={value.composition}
              custom={value.composition_custom}
              placeholder="e.g. low-angle diagonal, product bottom-right"
              onPick={(v) => onChange({ composition: v as Composition | undefined })}
              onCustom={(c) => onChange({ composition_custom: c })}
            />
          </Section>

          <Section label="Negative space">
            <ChipRowWithOther
              options={NEG_SPACE_INTENTS}
              current={value.negative_space_intent}
              custom={value.negative_space_intent_custom}
              placeholder="e.g. wide empty sky above for copy"
              onPick={(v) =>
                onChange({ negative_space_intent: v as NegSpaceIntent | undefined })
              }
              onCustom={(c) => onChange({ negative_space_intent_custom: c })}
            />
          </Section>

          <Section label="Realism">
            <ChipRowWithOther
              options={REALISM_LEVELS}
              current={value.realism}
              custom={value.realism_custom}
              placeholder="e.g. 35mm film grain, slight halation"
              onPick={(v) => onChange({ realism: v as RealismLevel | undefined })}
              onCustom={(c) => onChange({ realism_custom: c })}
            />
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
            const fields = applicableFieldsCtx(SCENE_EXTRAS_FIELDS, ctx).filter(
              (f) => PHOTO_EXTRAS_KEYS.includes(f.key),
            );

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

            const ordered = [...fields].sort(
              (a, b) =>
                PHOTO_EXTRAS_KEYS.indexOf(a.key) -
                PHOTO_EXTRAS_KEYS.indexOf(b.key),
            );
            return <>{ordered.map(renderField)}</>;
          })()}
        </div>
      </div>

      <div>
        <ChapterHeading>Color & finish</ChapterHeading>
        <div className="space-y-10">
          <Section label="Color palette" expandable>
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

          <Section label="Contrast">
            <ChipRowWithOther
              options={COLOR_CONTRASTS}
              current={value.color_contrast}
              custom={value.color_contrast_custom}
              placeholder="e.g. high-key with single ember accent"
              onPick={(v) => onChange({ color_contrast: v as ColorContrast | undefined })}
              onCustom={(c) => onChange({ color_contrast_custom: c })}
            />
          </Section>

          <Section label="Saturation">
            <ChipRowWithOther
              options={SATURATIONS}
              current={value.saturation}
              custom={value.saturation_custom}
              placeholder="e.g. muted except for product hue"
              onPick={(v) => onChange({ saturation: v as Saturation | undefined })}
              onCustom={(c) => onChange({ saturation_custom: c })}
            />
          </Section>

          <Section
            label="Finish"
            tooltip="The final grade — clean digital, filmic, glossy magazine, etc."
            expandable
          >
            {(expanded) => (
              <ChipRowWithOther
                options={finishes(expanded)}
                current={value.finish}
                custom={value.finish_custom}
                placeholder="e.g. Portra 400 film grade, soft halation"
                onPick={(v) => onChange({ finish: v as SceneFinish | undefined })}
                onCustom={(c) => onChange({ finish_custom: c })}
              />
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function ChapterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-14 mb-6 first:mt-0">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {children}
      </div>
      <div className="mt-3 h-px bg-border/70" />
    </div>
  );
}
