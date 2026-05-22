import { z } from "zod";
import {
  FASHION_ARCHETYPES,
  FASHION_CAMERA_FEELS,
  FASHION_GARMENTS,
  FASHION_MAX_CAMERA_FEELS,
  FASHION_MAX_GARMENTS,
  FASHION_TEXT_MAX,
  FASHION_WEARERS,
  WEARERS_WITH_PERSON,
} from "./questions";

const archetypeSchema = z.enum(
  FASHION_ARCHETYPES.map((a) => a.value) as unknown as [string, ...string[]],
);
const wearerSchema = z.enum(
  FASHION_WEARERS.map((w) => w.value) as unknown as [string, ...string[]],
);
const garmentSchema = z.enum(FASHION_GARMENTS as unknown as [string, ...string[]]);
const cameraFeelSchema = z.enum(
  FASHION_CAMERA_FEELS as unknown as [string, ...string[]],
);

const text = z.string().trim().max(FASHION_TEXT_MAX);

export const fashionModuleAnswersSchema = z
  .object({
    archetype: archetypeSchema,
    garment_focus: z.array(garmentSchema).min(1).max(FASHION_MAX_GARMENTS),
    wearer: wearerSchema,
    scene: z
      .object({
        location: text.optional(),
        props: text.optional(),
        pose: text.optional(),
      })
      .strict()
      .default({}),
    finishing: z
      .object({
        color_anchor: text.optional(),
        camera_feel: z
          .array(cameraFeelSchema)
          .max(FASHION_MAX_CAMERA_FEELS)
          .optional(),
      })
      .strict()
      .default({}),
  })
  .strict()
  .refine(
    (v) =>
      !v.scene?.pose ||
      WEARERS_WITH_PERSON.includes(v.wearer as (typeof WEARERS_WITH_PERSON)[number]),
    {
      message: "Pose can only be set when an on-model wearer is selected",
      path: ["scene", "pose"],
    },
  );

export type FashionModuleAnswers = z.infer<typeof fashionModuleAnswersSchema>;
