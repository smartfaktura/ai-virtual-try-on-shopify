import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { PhotographyHowItWorks } from '@/components/seo/photography/PhotographyHowItWorks';
import { PhotographyFinalCTA } from '@/components/seo/photography/PhotographyFinalCTA';
import { CategoryBreadcrumbs } from '@/components/seo/photography/category/CategoryBreadcrumbs';
import { CategoryHero } from '@/components/seo/photography/category/CategoryHero';

import { CategoryVisualOutputs } from '@/components/seo/photography/category/CategoryVisualOutputs';
import { CategoryPainPoints } from '@/components/seo/photography/category/CategoryPainPoints';
import { CategorySceneExamples } from '@/components/seo/photography/category/CategorySceneExamples';
import { CategoryBuiltForEveryCategory } from '@/components/seo/photography/category/CategoryBuiltForEveryCategory';
import { CategoryUseCases } from '@/components/seo/photography/category/CategoryUseCases';
import { CategoryRelatedCategories } from '@/components/seo/photography/category/CategoryRelatedCategories';
import { CategoryFAQ } from '@/components/seo/photography/category/CategoryFAQ';
import { getCategoryPage, PREVIEW } from '@/data/aiProductPhotographyCategoryPages';
import { getOptimizedSrcSet, getOptimizedUrl } from '@/lib/imageOptimization';

/**
 * Inject a <link rel="preload" as="image"> for the LCP hero tile so the
 * browser starts downloading it during HTML parse rather than after React
 * mounts. Cleans up on unmount/route change to avoid stale preloads.
 */
function HeroPreload({ url }: { url: string }) {
  useEffect(() => {
    if (!url) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.setAttribute('imagesrcset', getOptimizedSrcSet(url, [480, 720, 960, 1280], 55));
    link.setAttribute('imagesizes', '(min-width: 1024px) 28vw, 50vw');
    link.href = getOptimizedUrl(url, { width: 720, quality: 55 });
    link.fetchPriority = 'high';
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [url]);
  return null;
}


export default function AIProductPhotographyCategory() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getCategoryPage(slug) : undefined;

  if (!page) {
    return <Navigate to="/ai-product-photography" replace />;
  }

  const PAGE_URL = `${SITE_URL}${page.url}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'AI Product Photography', item: `${SITE_URL}/ai-product-photography` },
      { '@type': 'ListItem', position: 3, name: page.groupName, item: PAGE_URL },
    ],
  };

  const ogImage = PREVIEW(page.heroImageId) || DEFAULT_OG_IMAGE;
  // LCP target: first hero collage tile if present, otherwise the single hero image.
  const lcpImageId = page.heroCollage?.[0]?.imageId ?? page.heroImageId;
  const lcpUrl = PREVIEW(lcpImageId);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title={page.seoTitle}
        description={page.metaDescription}
        canonical={PAGE_URL}
        ogImage={ogImage}
      />
      <HeroPreload url={lcpUrl} />
      <JsonLd data={breadcrumbJsonLd} />

      <LandingNav />
      <main>
        <CategoryBreadcrumbs page={page} />
        <CategoryHero page={page} />
        <CategoryBuiltForEveryCategory page={page} />
        
        <CategoryVisualOutputs page={page} />
        <CategoryPainPoints page={page} />
        <CategorySceneExamples page={page} />
        <PhotographyHowItWorks />
        <CategoryUseCases page={page} />
        <CategoryRelatedCategories page={page} />
        <CategoryFAQ page={page} />
        <PhotographyFinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
