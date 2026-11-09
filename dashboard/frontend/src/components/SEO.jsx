import { useEffect } from 'react';

/**
 * Dynamic Head SEO Manager for React Router
 * Ensures compliance with Screaming Frog SEO Spider & Search Engine indexation.
 */
export default function SEO({
  title = 'TOGETHER — #1 Discord Music Bot & Lossless Webplayer',
  description = 'Top-rated Discord music bot featuring 24-bit lossless opus audio, real-time 3D webplayer visualizer, 24/7 uptime, and multi-source streaming.',
  canonical = 'https://dash.together.dpdns.org/',
  noindex = false,
  image = 'https://dash.together.dpdns.org/og-banner.png'
}) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to safely set meta or link attributes
    const setMetaTag = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=');
        el.setAttribute(attrName, attrVal.replace(/['"]/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setLinkTag = (rel, href) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // 2. Meta Description
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[name="title"]', 'content', title);

    // 3. Robots
    setMetaTag(
      'meta[name="robots"]',
      'content',
      noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );

    // 4. Canonical
    setLinkTag('canonical', canonical);

    // 5. Open Graph
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:url"]', 'content', canonical);
    setMetaTag('meta[property="og:image"]', 'content', image);

    // 6. Twitter
    setMetaTag('meta[name="twitter:title"]', 'content', title);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', image);
  }, [title, description, canonical, noindex, image]);

  return null;
}
