import type { BrandSceneModule } from "../../constants";
import menSwimShorts from "../../assets/stock-overrides/men-swim-shorts.jpg";
import menBoxers from "../../assets/stock-overrides/men-boxers.jpg";

export interface StockOverride {
  module: BrandSceneModule;
  sub_family: string;
  gender: string;
  image_url: string;
  label: string;
}

/**
 * Gender-specific preview overrides for sub-families where the default stock
 * product (typically women's silhouette) would misrepresent the scene.
 * Currently scoped to men's swimwear and men's lingerie only.
 */
export const STOCK_OVERRIDES: ReadonlyArray<StockOverride> = [
  {
    module: "fashion",
    sub_family: "swimwear",
    gender: "men",
    image_url: menSwimShorts,
    label: "Men's striped swim shorts",
  },
  {
    module: "fashion",
    sub_family: "lingerie",
    gender: "men",
    image_url: menBoxers,
    label: "Men's boxer briefs",
  },
];

export function findStockOverride(
  module: BrandSceneModule | undefined,
  sub_family: string | undefined,
  gender: string | undefined,
): StockOverride | null {
  if (!module || !sub_family || !gender) return null;
  return (
    STOCK_OVERRIDES.find(
      (o) => o.module === module && o.sub_family === sub_family && o.gender === gender,
    ) ?? null
  );
}
