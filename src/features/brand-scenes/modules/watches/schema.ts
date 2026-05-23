import { z } from "zod";
import {
  WATCHES_ARCHETYPES,
  WATCHES_CAMERA_FEELS,
  WATCHES_MAX_CAMERA_FEELS,
  WATCHES_PRESENTATIONS,
  WATCHES_PRESENTATIONS_WITH_PERSON,
  WATCHES_PRODUCT_TYPES,
  WATCHES_TEXT_MAX,
} from "./questions";

const archetypeSchema = z.enum(
  WATCHES_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const productTypeSchema = z.enum(
  WATCHES_PRODUCT_TYPES.map((t) => t.value) as unknown as [string, ...string[]],
);
const presentationSchema = z.enum(
  WATCHES_PRESENTATIONS.map((p) => p.value) as unknown as [string, ...string[]],
);
const cameraFeelSchema = z.enum(
  WATCHES_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(WATCHES_TEXT_MAX);

export const watchesModuleAnswersSchema = z
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
          .max(WATCHES_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.expression ||
      WATCHES_PRESENTATIONS_WITH_PERSON.includes(
        v.presentation as (typeof WATCHES_PRESENTATIONS_WITH_PERSON)[number],
      ),
    {
      message:
        "Expression can only be set when an on-model presentation is selected",
      path: ["scene", "expression"],
    },
  );

export type WatchesModuleAnswers = z.infer<
  typeof watchesModuleAnswersSchema
>;

export function isWatchesStepValid(
  a: Partial<WatchesModuleAnswers>,
): boolean {
  return !!a.archetype && !!a.product_type && !!a.presentation;
}
