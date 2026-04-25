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
import { CategorySubcategoryChips } from '@/components/seo/photography/category/CategorySubcategoryChips';
import { CategoryVisualOutputs } from '@/components/seo/photography/category/CategoryVisualOutputs';
import { CategoryPainPoints } from '@/components/seo/photography/category/CategoryPainPoints';
import { CategorySceneExamples } from '@/components/seo/photography/category/CategorySceneExamples';
import { CategoryBuiltForEveryCategory } from '@/components/seo/photography/category/CategoryBuiltForEveryCategory';
import { CategoryUseCases } from '@/components/seo/photography/category/CategoryUseCases';
import { CategoryRelatedCategories } from '@/components/seo/photography/category/CategoryRelatedCategories';
import { CategoryFAQ } from '@/components/seo/photography/category/CategoryFAQ';
import { getCategoryPage, PREVIEW } from '@/data/aiProductPhotographyCategoryPages';

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

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SEOHead
        title={page.seoTitle}
        description={page.metaDescription}
        canonical={PAGE_URL}
        ogImage={ogImage}
      />
      <JsonLd data={breadcrumbJsonLd} />

      <LandingNav />
      <main>
        <CategoryBreadcrumbs page={page} />
        <CategoryHero page={page} />
        <CategoryBuiltForEveryCategory page={page} />
        <CategorySubcategoryChips page={page} />
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
