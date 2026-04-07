export const TREND_CATEGORIES = [
  'Fashion & Apparel',
  'Beauty & Skincare',
  'Fragrances',
  'Jewelry',
  'Accessories',
  'Home & Decor',
  'Food & Beverage',
  'Electronics',
  'Sports & Fitness',
  'Health & Supplements',
] as const;

export type TrendCategory = typeof TREND_CATEGORIES[number];

export const SYNC_STATUS_MAP: Record<string, { label: string; className: string }> = {
  synced: { label: 'Synced', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  pending: { label: 'Syncing…', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  manual: { label: 'Manual', className: 'bg-muted text-muted-foreground' },
};

export const SOURCE_MODE_MAP: Record<string, { label: string; className: string }> = {
  official_api: { label: 'API', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  manual: { label: 'Manual', className: 'bg-muted text-muted-foreground' },
};
