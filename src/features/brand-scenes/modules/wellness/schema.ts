import { z } from "zod";
import {
  WELLNESS_ARCHETYPES,
  WELLNESS_CAMERA_FEELS,
  WELLNESS_MAX_CAMERA_FEELS,
  WELLNESS_PRESENTATIONS,
  WELLNESS_PRESENTATIONS_WITH_PERSON,
  WELLNESS_PRODUCT_TYPES,
  WELLNESS_TEXT_MAX,
} from "./questions";

const archetypeSchema = z.enum(
  WELLNESS_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const productTypeSchema = z.enum(
  WELLNESS_PRODUCT_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  WELLNESS_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  WELLNESS_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(WELLNESS_TEXT_MAX);

export const wellnessModuleAnswersSchema = z
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
          .max(WELLNESS_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      WELLNESS_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof WELLNESS_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type WellnessModuleAnswers = z.infer<
  typeof wellnessModuleAnswersSchema
>;

export function isWellnessStepValid(
  a: Partial<WellnessModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.product_type && !!a.presentation;
}
