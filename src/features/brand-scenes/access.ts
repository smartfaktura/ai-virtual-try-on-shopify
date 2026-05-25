/**
 * Brand Scenes creation entitlement. Only Growth, Pro, and Enterprise plans
 * may design new brand scenes. Free and Starter users keep read access to
 * any scenes they previously saved but cannot create more.
 */
export const BRAND_SCENE_PLANS = ['growth', 'pro', 'enterprise'] as const;

export function canCreateBrandScenes(plan: string | undefined | null): boolean {
  if (!plan) return false;
  return (BRAND_SCENE_PLANS as readonly string[]).includes(plan);
}
