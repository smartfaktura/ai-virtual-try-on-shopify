import { z } from "zod";
import {
  FOOD_ARCHETYPES,
  FOOD_CAMERA_FEELS,
  FOOD_MAX_CAMERA_FEELS,
  FOOD_PRESENTATIONS,
  FOOD_PRESENTATIONS_WITH_PERSON,
  FOOD_PRODUCT_TYPES,
  FOOD_TEXT_MAX,
} from "./questions";

const archetypeSchema = z.enum(
  FOOD_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const productTypeSchema = z.enum(
  FOOD_PRODUCT_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  FOOD_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  FOOD_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(FOOD_TEXT_MAX);

export const foodDrinkModuleAnswersSchema = z
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
          .max(FOOD_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      FOOD_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof FOOD_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type FoodDrinkModuleAnswers = z.infer<
  typeof foodDrinkModuleAnswersSchema
>;

export function isFoodDrinkStepValid(
  a: Partial<FoodDrinkModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.product_type && !!a.presentation;
}
