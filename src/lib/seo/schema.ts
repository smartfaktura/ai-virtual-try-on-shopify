/**
 * Helpers to build Schema.org JSON-LD structures.
 * Used together with <JsonLd> from '@/components/JsonLd'.
 */
import { SITE_URL } from '@/lib/constants';

export interface BreadcrumbCrumb {
  name: string;
  /** Path relative to site root, with leading slash. e.g. '/blog'. Omit `item` for the current page if you prefer. */
  path: string;
}

/**
 * Build a BreadcrumbList JSON-LD object.
 * Always pass crumbs from root → current page (Home is added automatically).
 *
 * Example:
 *   buildBreadcrumbJsonLd([
 *     { name: 'Features', path: '/features' },
 *     { name: 'Workflows', path: '/features/workflows' },
 *   ])
 */
export function buildBreadcrumbJsonLd(
  crumbs: BreadcrumbCrumb[],
  options: { includeHome?: boolean } = {},
) {
  const { includeHome = true } = options;
  const list: BreadcrumbCrumb[] = includeHome
    ? [{ name: 'Home', path: '/' }, ...crumbs]
    : crumbs;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.path === '/' ? SITE_URL : `${SITE_URL}${c.path}`,
    })),
  };
}

/**
 * Build a generic WebPage JSON-LD object for content pages without a more
 * specific schema type (about, contact, careers, legal, etc.).
 */
export function buildWebPageJsonLd(args: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: args.name,
    description: args.description,
    url: `${SITE_URL}${args.path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'VOVV.AI',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'VOVV.AI',
      url: SITE_URL,
    },
  };
}
