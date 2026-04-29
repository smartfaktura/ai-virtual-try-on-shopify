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
import { getOptimizedUrl, getResizedSrcSet } from '@/lib/imageOptimization';

/**
 * Inject a <link rel="preload" as="image"> for the LCP hero image, matching
 * the EXACT URL/srcset the hero <img> will request so the browser can satisfy
 * the request from the preload (no double download). Also sets fetchPriority
 * high so the LCP candidate is prioritized during HTML parse.
 */
function HeroPreload({ url, isCollage }: { url: string; isCollage: boolean }) {
  useEffect(() => {
    if (!url) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.fetchPriority = 'high';

    if (isCollage) {
      // Mirror HeroTile: 4:5 tile, w=640 h=800 q=85, srcSet 360/540/720
      link.href = getOptimizedUrl(url, { width: 640, height: 800, quality: 85, resize: 'cover' });
      link.setAttribute(
        'imagesrcset',
        getResizedSrcSet(url, { widths: [360, 540, 720], aspect: [4, 5], quality: 85 }),
      );
      link.setAttribute('imagesizes', '(max-width: 1024px) 45vw, 280px');
    } else {
      // Mirror single-image hero: 4:5, w=1120 h=1400 q=85, srcSet 640/900/1120/1400
      link.href = getOptimizedUrl(url, { width: 1120, height: 1400, quality: 85, resize: 'cover' });
      link.setAttribute(
        'imagesrcset',
        getResizedSrcSet(url, { widths: [640, 900, 1120, 1400], aspect: [4, 5], quality: 85 }),
      );
      link.setAttribute('imagesizes', '(max-width: 1024px) 92vw, 560px');
    }

    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [url, isCollage]);
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

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.seoTitle,
    description: page.metaDescription,
    url: PAGE_URL,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'VOVV.AI',
      url: SITE_URL,
    },
    about: {
      '@type': 'Thing',
      name: `${page.groupName} product photography`,
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: ogImage,
    },
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title={page.seoTitle}
        description={page.metaDescription}
        canonical={PAGE_URL}
        ogImage={ogImage}
      />
      <HeroPreload url={lcpUrl} isCollage={Boolean(page.heroCollage && page.heroCollage.length >= 4)} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />

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
