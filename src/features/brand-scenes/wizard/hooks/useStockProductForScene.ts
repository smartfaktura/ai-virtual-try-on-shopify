import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BrandSceneModule } from "../../constants";
import { findStockOverride } from "../constants/stockOverrides";

export interface StockProductPlaceholder {
  url: string;
  label: string;
}

/**
 * Looks up a category-matched stock product image to render alongside the
 * brand-scene preview generation so users see how a representative product
 * sits inside the scene.
 *
 * Resolution order:
 *   1. gender-specific override (e.g. men's swimwear, men's lingerie)
 *   2. exact (module, sub_family) match
 *   3. module-level fallback (sub_family IS NULL)
 *   4. null — caller falls back to current (empty-environment) behavior
 *
 * This is preview-only. The saved prompt_template still uses [PRODUCT IMAGE]
 * tokens via `injectReferenceTokens`, so end users' real products replace
 * the placeholder when the scene is later applied.
 */
export function useStockProductForScene(
  module: BrandSceneModule | undefined,
  sub_family: string | undefined,
  gender?: string,
) {
  return useQuery<StockProductPlaceholder | null>({
    queryKey: ["brand-scene-stock-product", module, sub_family, gender ?? null],
    enabled: !!module,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (!module) return null;
      const override = findStockOverride(module, sub_family, gender);
      if (override) return { url: override.image_url, label: override.label };
      const { data, error } = await supabase
        .from("brand_scene_stock_products")
        .select("image_url, label, sub_family")
        .eq("module", module)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error || !data) return null;
      const exact = sub_family ? data.find((r) => r.sub_family === sub_family) : undefined;
      const fallback = data.find((r) => r.sub_family === null);
      const pick = exact ?? fallback;
      return pick ? { url: pick.image_url, label: pick.label } : null;
    },
  });
}
