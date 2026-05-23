import { z } from "zod";
import {
  HATS_ARCHETYPES,
  HATS_CAMERA_FEELS,
  HATS_MAX_CAMERA_FEELS,
  HATS_PRESENTATIONS,
  HATS_PRESENTATIONS_WITH_PERSON,
  HATS_PRODUCT_TYPES,
  HATS_TEXT_MAX,
} from "./questions";

const archetypeSchema = z.enum(
  HATS_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const productTypeSchema = z.enum(
  HATS_PRODUCT_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  HATS_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  HATS_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(HATS_TEXT_MAX);

export const hatsCapsBeaniesModuleAnswersSchema = z
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
          .max(HATS_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      HATS_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof HATS_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type HatsCapsBeaniesModuleAnswers = z.infer<
  typeof hatsCapsBeaniesModuleAnswersSchema
>;

export function isHatsCapsBeaniesStepValid(
  a: Partial<HatsCapsBeaniesModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.product_type && !!a.presentation;
}
