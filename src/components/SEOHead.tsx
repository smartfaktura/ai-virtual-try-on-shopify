import { useEffect } from 'react';
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function SEOHead({ title, description, canonical, ogImage, ogType = 'website', noindex }: SEOHeadProps) {
  useEffect(() => {
    document.title = title;
    setMeta('description', description);

    const resolvedImage = ogImage || DEFAULT_OG_IMAGE;
    const resolvedUrl = canonical || window.location.href;

    // Open Graph
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', ogType, 'property');
    setMeta('og:image', resolvedImage, 'property');
    setMeta('og:url', resolvedUrl, 'property');
    setMeta('og:site_name', 'VOVV.AI', 'property');

    if (canonical) {
      setLink('canonical', canonical);
    }

    // Twitter / X
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', title, 'name');
    setMeta('twitter:description', description, 'name');
    setMeta('twitter:image', resolvedImage, 'name');

    // Robots
    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.remove();
    }

    return () => {
      document.title = 'VOVV.AI | Automated Visual Studio for E-commerce';
    };
  }, [title, description, canonical, ogImage, ogType, noindex]);

  return null;
}
