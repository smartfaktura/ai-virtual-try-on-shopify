import { Helmet } from 'react-helmet-async';
import { DEFAULT_OG_IMAGE } from '@/lib/constants';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noindex,
}: SEOHeadProps) {
  const resolvedImage = ogImage || DEFAULT_OG_IMAGE;
  // Avoid SSR-unsafe window access; fall back to canonical or undefined.
  const resolvedUrl =
    canonical ||
    (typeof window !== 'undefined' ? window.location.href : undefined);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={resolvedImage} />
      {resolvedUrl && <meta property="og:url" content={resolvedUrl} />}
      <meta property="og:site_name" content="VOVV.AI" />

      {canonical && <link rel="canonical" href={canonical} />}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, follow" />}
    </Helmet>
  );
}
