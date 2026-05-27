import { supabase } from "@/integrations/supabase/client";
import type { BrandSceneAnswers } from "../types";

export interface GeneratedVariation {
  index: number;
  url: string;
}

export interface GenerateBrandSceneResult {
  runId: string;
  variations: GeneratedVariation[];
  partial: boolean;
  failed_count: number;
  credits_charged?: number;
  credits_refunded?: number;
  new_balance?: number;
}

export class BrandSceneApiError extends Error {
  constructor(public code: "RATE_LIMIT" | "INSUFFICIENT_CREDITS" | "GENERATION_FAILED" | "UNKNOWN", message: string) {
    super(message);
  }
}

function pickError(error: unknown, data: any): BrandSceneApiError {
  const status = (error as any)?.context?.status as number | undefined;
  const msg = data?.error ?? (error instanceof Error ? error.message : "Something went wrong");
  if (status === 429) return new BrandSceneApiError("RATE_LIMIT", msg);
  if (status === 402 || data?.code === "INSUFFICIENT_CREDITS") return new BrandSceneApiError("INSUFFICIENT_CREDITS", msg);
  if (status === 502) return new BrandSceneApiError("GENERATION_FAILED", msg);
  return new BrandSceneApiError("UNKNOWN", msg);
}

export async function generateBrandScene(args: {
  compiledPrompt: string;
  referenceImageUrl?: string;
  modelImageUrl?: string;
  productImageUrl?: string;
  name?: string;
}): Promise<GenerateBrandSceneResult> {
  const { data, error } = await supabase.functions.invoke("generate-brand-scene", {
    body: args,
  });
  if (error || data?.error) throw pickError(error, data);
  return data as GenerateBrandSceneResult;
}

export async function saveBrandScene(args: {
  answers: BrandSceneAnswers;
  name: string;
  pickedVariationUrl: string;
  compiledPrompt: string;
}): Promise<{ scene: { id: string; scene_id: string }; new_balance: number }> {
  const { data, error } = await supabase.functions.invoke("save-brand-scene", {
    body: args,
  });
  if (error || data?.error) throw pickError(error, data);
  return data;
}

export async function saveBrandSceneAsPublicScene(args: {
  answers: BrandSceneAnswers;
  name: string;
  previewImageUrl: string;
  categoryCollection: string;
  subCategory: string;
  compiledPrompt: string;
}): Promise<{ scene: { id: string; scene_id: string; title: string; category_collection: string; sub_category: string } }> {
  const { data, error } = await supabase.functions.invoke("save-brand-scene-as-public", {
    body: args,
  });
  if (error || data?.error) throw pickError(error, data);
  return data;
}
