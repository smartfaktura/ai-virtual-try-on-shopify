import { z } from "zod";
import {
  BAGS_ARCHETYPES,
  BAGS_CAMERA_FEELS,
  BAGS_MAX_CAMERA_FEELS,
  BAGS_PRESENTATIONS,
  BAGS_PRESENTATIONS_WITH_PERSON,
  BAGS_PRODUCT_TYPES,
  BAGS_TEXT_MAX,
} from "./questions";

const archetypeSchema = z.enum(
  BAGS_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const productTypeSchema = z.enum(
  BAGS_PRODUCT_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  BAGS_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  BAGS_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(BAGS_TEXT_MAX);

export const bagsAccessoriesModuleAnswersSchema = z
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
          .max(BAGS_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      BAGS_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof BAGS_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type BagsAccessoriesModuleAnswers = z.infer<
  typeof bagsAccessoriesModuleAnswersSchema
>;

export function isBagsAccessoriesStepValid(
  a: Partial<BagsAccessoriesModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.product_type && !!a.presentation;
}
