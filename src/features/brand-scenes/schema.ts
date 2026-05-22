/**
 * Brand Scenes — Zod runtime validation.
 * Mirrors the DB `protect_brand_scene_writes` trigger as a double safety net.
 */

import { z } from "zod";
import {
  BRAND_SCENE_KEY_PREFIX,
  BRAND_SCENE_MODULES,
  BRAND_SCENE_NAME_MAX,
  BRAND_SCENE_NOTE_MAX,
  BRAND_SCENE_PLACEMENT_MAX,
  BRAND_SCENE_SCHEMA_VERSION,
  BRAND_SCENE_SOURCES,
  BRAND_SCENE_REFERENCE_MAX_IMAGES,
  type BrandSceneModule,
} from "./constants";
import {
  FAMILY_ID_TO_NAME,
  SUB_TYPES_BY_FAMILY,
} from "@/lib/onboardingTaxonomy";

export const brandSceneModuleSchema = z.enum(
  BRAND_SCENE_MODULES as unknown as [string, ...string[]],
);

export const brandSceneSourceSchema = z.enum(
  BRAND_SCENE_SOURCES as unknown as [string, ...string[]],
);

const sceneAspectRatioSchema = z.enum(["4:5", "1:1", "3:4", "16:9"]);
const sceneTimeOfDaySchema = z.enum(["morning", "midday", "evening", "night"]);

const sceneWeatherSchema = z.enum([
  "clear", "overcast", "rain", "fog", "snow", "dusty", "smoke",
]);
const sceneSeasonSchema = z.enum([
  "spring", "summer", "autumn", "winter", "seasonless",
]);
const sceneLensSchema = z.enum(["wide", "standard", "portrait", "tele", "macro"]);
const sceneDofSchema = z.enum(["deep", "balanced", "shallow", "extreme"]);
const scenePaletteSchema = z.enum([
  "warm_neutral", "cool_neutral", "terracotta", "sage_cream", "monochrome", "bold_accent",
]);
const sceneFinishSchema = z.enum([
  "clean_digital", "film_grain", "editorial_matte", "glossy", "sun_bleached",
]);
const wardrobeColorSchema = z.enum([
  "neutral_light", "neutral_dark", "earth_tones", "denim", "monochrome_product", "contrast",
]);

// Phase 7c — versatility dials.
const surfaceSchema = z.enum([
  "concrete", "linen", "polished_stone", "raw_wood", "glass",
  "sand", "water", "paper", "velvet",
]);
const colorContrastSchema = z.enum(["tonal", "soft", "bold", "complementary"]);
const saturationSchema = z.enum(["desaturated", "natural", "vivid"]);
const shadowSchema = z.enum(["hard", "soft", "none", "mirror", "wet"]);
const compositionSchema = z.enum([
  "thirds", "centered", "symmetry", "neg_left", "neg_right", "neg_top",
]);
const negSpaceIntentSchema = z.enum(["headline", "logo", "none"]);
const aestheticEraSchema = z.enum([
  "contemporary", "90s", "y2k", "70s_film", "brutalist", "quiet_luxury", "max2020s",
]);
const realismSchema = z.enum([
  "photoreal", "high_fashion", "documentary", "stylised", "surreal",
]);
const brandVoiceSchema = z.enum([
  "premium_quiet", "energetic", "playful", "technical", "romantic", "bold_rebel",
]);
const outputUseCaseSchema = z.enum([
  "web_hero", "social_square", "lookbook", "paid_ad", "editorial_print",
]);
const subjectFocusSchema = z.enum(["product", "person", "equal", "environment"]);
const bodyPartFocusSchema = z.enum([
  "face", "hands", "wrist", "neck", "feet", "full_body", "detail",
]);
const gazeSchema = z.enum(["to_camera", "away", "down_at_product", "closed_eyes"]);
const groupDynamicSchema = z.enum(["independent", "interacting", "mirrored", "lined_up"]);
const handsOnProductSchema = z.enum([
  "cradle", "pinch", "cap", "pour", "wrist_show", "tap",
]);
const diversitySchema = z.enum(["as_cast", "diverse"]);

export const brandSceneBaseAnswersSchema = z
  .object({
    aesthetic: z.string().trim().min(1).max(120).optional(),
    palette: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
    mood: z.string().trim().min(1).max(120).optional(),
    lighting: z.string().trim().min(1).max(120).optional(),
    location: z.string().trim().min(1).max(160).optional(),
    framing: z.string().trim().min(1).max(120).optional(),
    notes: z.string().trim().max(600).optional(),
    aspect_ratio: sceneAspectRatioSchema.optional(),
    time_of_day: sceneTimeOfDaySchema.optional(),
    setting: z.string().trim().min(1).max(120).optional(),
    weather: sceneWeatherSchema.optional(),
    season: sceneSeasonSchema.optional(),
    lens: sceneLensSchema.optional(),
    depth_of_field: sceneDofSchema.optional(),
    palette_preset: scenePaletteSchema.optional(),
    palette_custom: z.string().trim().min(1).max(120).optional(),
    finish: sceneFinishSchema.optional(),
    avoid: z.string().trim().max(240).optional(),
    subject_focus: subjectFocusSchema.optional(),
    surface: surfaceSchema.optional(),
    prop_density: z.number().int().min(0).max(4).optional(),
    color_contrast: colorContrastSchema.optional(),
    saturation: saturationSchema.optional(),
    shadows: shadowSchema.optional(),
    composition: compositionSchema.optional(),
    negative_space_intent: negSpaceIntentSchema.optional(),
    aesthetic_era: aestheticEraSchema.optional(),
    realism: realismSchema.optional(),
    brand_voice: brandVoiceSchema.optional(),
    output_use_case: outputUseCaseSchema.optional(),
  })
  .strict();

const castPresetSchema = z.enum([
  "solo",
  "two",
  "group",
  "hands",
  "none",
  "replicate",
]);
const castGenderSchema = z.enum(["woman", "man", "mixed", "any"]);
const castAgeSchema = z.enum(["young", "adult", "mature", "mixed"]);
const castVibeSchema = z.enum([
  "athlete",
  "creative",
  "professional",
  "casual",
  "editorial",
]);
const castInteractionSchema = z.enum([
  "wearing",
  "holding",
  "using",
  "beside",
  "hero",
]);
const castActionSchema = z.enum([
  "still",
  "walking",
  "motion",
  "seated",
  "candid",
]);

export const brandSceneCastSchema = z
  .object({
    preset: castPresetSchema,
    gender: z.array(castGenderSchema).max(4).optional(),
    age: z.array(castAgeSchema).max(4).optional(),
    vibe: castVibeSchema.optional(),
    interaction: castInteractionSchema.optional(),
    action: castActionSchema.optional(),
    note: z.string().trim().max(160).optional(),
    wardrobe_color: wardrobeColorSchema.optional(),
    wardrobe_custom: z.string().trim().min(1).max(120).optional(),
    body_part_focus: bodyPartFocusSchema.optional(),
    gaze: gazeSchema.optional(),
    group_dynamic: groupDynamicSchema.optional(),
    hands_on_product: handsOnProductSchema.optional(),
    diversity: diversitySchema.optional(),
  })
  .strict()
  .refine(
    (c) => c.preset === "replicate" || !!c.interaction,
    {
      message: "interaction is required unless preset is 'replicate'",
      path: ["interaction"],
    },
  )
  // Hard combo guard — cast=none must use the hero interaction.
  .refine(
    (c) => c.preset !== "none" || !c.interaction || c.interaction === "hero",
    {
      message: "Cast 'none' is only compatible with interaction 'hero'",
      path: ["interaction"],
    },
  )
  // Hard combo guard — hands cannot wear.
  .refine(
    (c) => c.preset !== "hands" || c.interaction !== "wearing",
    {
      message: "Cast 'hands only' cannot use interaction 'wearing'",
      path: ["interaction"],
    },
  )
  // Hard combo guard — a person cast cannot use 'hero' (product-only).
  .refine(
    (c) =>
      !c.interaction ||
      c.interaction !== "hero" ||
      c.preset === "none" ||
      c.preset === "replicate",
    {
      message: "Interaction 'hero' is reserved for cast 'none'",
      path: ["interaction"],
    },
  )
  // Group dynamic only valid for two/group.
  .refine(
    (c) =>
      !c.group_dynamic || c.preset === "two" || c.preset === "group",
    {
      message: "Group dynamic only applies when cast is 'two' or 'group'",
      path: ["group_dynamic"],
    },
  );

const scalePresetSchema = z.enum([
  "pocket",
  "handheld",
  "carry",
  "furniture",
  "architectural",
  "on_body",
]);

export const brandSceneScaleSchema = z
  .object({
    preset: scalePresetSchema,
    dimensions: z
      .object({
        w: z.number().positive(),
        h: z.number().positive(),
        d: z.number().positive().optional(),
        units: z.enum(["cm", "in"]),
      })
      .strict()
      .optional(),
  })
  .strict();

const referenceIntentSchema = z.enum([
  "replicate",
  "location",
  "composition",
  "vibe",
]);

const previewVariantSchema = z
  .object({
    image_url: z.string().url().max(2048),
    generation_id: z.string().min(1).max(80),
    chosen: z.boolean().optional(),
  })
  .strict();

/** Sub-family slugs allowed for a given module id. */
export function getSubFamilySlugs(module: BrandSceneModule): string[] {
  const famName = FAMILY_ID_TO_NAME[module];
  if (!famName) return [];
  return (SUB_TYPES_BY_FAMILY[famName] ?? []).map((s) => s.slug);
}

export const brandSceneAnswersSchema = z
  .object({
    source: brandSceneSourceSchema,
    module: brandSceneModuleSchema,
    sub_family: z.string().trim().min(1),
    base: brandSceneBaseAnswersSchema,
    module_answers: z.record(z.unknown()),
    reference_image_paths: z
      .array(z.string().trim().min(1).max(512))
      .max(BRAND_SCENE_REFERENCE_MAX_IMAGES)
      .optional(),
    reference_preview_url: z.string().trim().url().max(2048).optional(),
    reference_intent: referenceIntentSchema.optional(),
    placement_hint: z.string().trim().max(BRAND_SCENE_PLACEMENT_MAX).optional(),
    cast: brandSceneCastSchema.optional(),
    scale: brandSceneScaleSchema.optional(),
    negative_note: z.string().trim().max(240).optional(),
    preview_variants: z.array(previewVariantSchema).max(6).optional(),
    name: z.string().trim().min(1).max(BRAND_SCENE_NAME_MAX).optional(),
    note: z.string().trim().max(BRAND_SCENE_NOTE_MAX).optional(),
  })
  .strict()
  .refine(
    (v) => getSubFamilySlugs(v.module as BrandSceneModule).includes(v.sub_family),
    {
      message: "sub_family must belong to the chosen module's family",
      path: ["sub_family"],
    },
  )
  .refine(
    (v) =>
      v.source === "wizard"
        ? !v.reference_image_paths || v.reference_image_paths.length === 0
        : true,
    {
      message: "reference_image_paths only allowed when source is 'reference'",
      path: ["reference_image_paths"],
    },
  )
  .refine(
    (v) =>
      v.source === "wizard"
        ? !v.placement_hint && !v.reference_preview_url && !v.reference_intent
        : true,
    {
      message:
        "reference fields only allowed when source is 'reference'",
      path: ["reference_intent"],
    },
  );

export const brandSceneDraftSchema = z
  .object({
    scene_key: z
      .string()
      .trim()
      .min(BRAND_SCENE_KEY_PREFIX.length + 1)
      .max(120)
      .refine((v) => v.startsWith(BRAND_SCENE_KEY_PREFIX), {
        message: `scene_key must start with "${BRAND_SCENE_KEY_PREFIX}"`,
      }),
    category_collection: z
      .string()
      .trim()
      .min(1)
      .refine((v) => v !== "bundle", {
        message: 'category_collection "bundle" is reserved for admin scenes',
      }),
    is_active: z.boolean(),
    is_brand_scene: z.literal(true),
    owner_user_id: z.string().uuid(),
    brand_scene_module: brandSceneModuleSchema,
    brand_scene_schema_version: z.literal(BRAND_SCENE_SCHEMA_VERSION),
    brand_scene_answers: brandSceneAnswersSchema,
    source_generation_id: z.string().uuid().nullable().optional(),
    sort_order: z.number().int().min(0),
  })
  .strict()
  .refine(
    (v) => v.brand_scene_answers.module === v.brand_scene_module,
    {
      message: "brand_scene_answers.module must match brand_scene_module",
      path: ["brand_scene_answers", "module"],
    },
  )
  .refine(
    (v) => v.brand_scene_answers.sub_family === v.category_collection,
    {
      message:
        "category_collection must equal brand_scene_answers.sub_family",
      path: ["category_collection"],
    },
  );

export type BrandSceneDraftInput = z.input<typeof brandSceneDraftSchema>;
export type BrandSceneDraftParsed = z.output<typeof brandSceneDraftSchema>;
