import { useEffect } from 'react';

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

    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', ogType, 'property');
    if (ogImage) setMeta('og:image', ogImage, 'property');
    if (canonical) {
      setMeta('og:url', canonical, 'property');
      setLink('canonical', canonical);
    }

    setMeta('twitter:title', title, 'name');
    setMeta('twitter:description', description, 'name');
    if (ogImage) setMeta('twitter:image', ogImage, 'name');

    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) robotsMeta.remove();
    }

    return () => {
      document.title = 'VOVV AI | Automated Visual Studio for E-commerce';
    };
  }, [title, description, canonical, ogImage, ogType, noindex]);

  return null;
}
