import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BrandSceneModule } from "../../constants";

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
 *   1. exact (module, sub_family) match
 *   2. module-level fallback (sub_family IS NULL)
 *   3. null — caller falls back to current (empty-environment) behavior
 *
 * This is preview-only. The saved prompt_template still uses [PRODUCT IMAGE]
 * tokens via `injectReferenceTokens`, so end users' real products replace
 * the placeholder when the scene is later applied.
 */
export function useStockProductForScene(
  module: BrandSceneModule | undefined,
  sub_family: string | undefined,
) {
  return useQuery<StockProductPlaceholder | null>({
    queryKey: ["brand-scene-stock-product", module, sub_family],
    enabled: !!module,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (!module) return null;
      const { data, error } = await supabase
        .from("brand_scene_stock_products" as any)
        .select("image_url, label, sub_family")
        .eq("module", module)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error || !data) return null;
      const rows = data as unknown as Array<{ image_url: string; label: string; sub_family: string | null }>;
      const exact = sub_family ? rows.find((r) => r.sub_family === sub_family) : undefined;
      const fallback = rows.find((r) => r.sub_family === null);
      const pick = exact ?? fallback;
      return pick ? { url: pick.image_url, label: pick.label } : null;
    },
  });
}
