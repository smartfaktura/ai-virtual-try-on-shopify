import { z } from "zod";
import {
  BEAUTY_ARCHETYPES,
  BEAUTY_CAMERA_FEELS,
  BEAUTY_MAX_CAMERA_FEELS,
  BEAUTY_PRESENTATIONS,
  BEAUTY_PRESENTATIONS_WITH_PERSON,
  BEAUTY_PRODUCT_TYPES,
  BEAUTY_TEXT_MAX,
} from "./questions";

const archetypeSchema = z.enum(
  BEAUTY_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const productTypeSchema = z.enum(
  BEAUTY_PRODUCT_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  BEAUTY_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  BEAUTY_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(BEAUTY_TEXT_MAX);

export const beautyFragranceModuleAnswersSchema = z
  .object({
    archetype: archetypeSchema,
    product_type: productTypeSchema,
    presentation: presentationSchema,
    scene: z
      .object({
        surface: text.optional(),
        location: text.optional(),
        mood: text.optional(),
        expression: text.optional(),
      })
      .strict()
      .default({}),
    finishing: z
      .object({
        color_anchor: text.optional(),
        camera_feel: z
          .array(cameraFeelSchema)
          .max(BEAUTY_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      BEAUTY_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof BEAUTY_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type BeautyFragranceModuleAnswers = z.infer<
  typeof beautyFragranceModuleAnswersSchema
>;

export function isBeautyFragranceStepValid(
  a: Partial<BeautyFragranceModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.product_type && !!a.presentation;
}
