import { checkPageHead, serviceCardById, servicePath, type ServicePage } from '../detail-pages';
import { aeoGeo } from './aeo-geo';
import { customWebsites } from './custom-websites';
import { emailAutomation } from './email-automation';
import { goHighLevel } from './gohighlevel';
import { localSeo } from './local-seo';
import { metaGoogleAds } from './meta-google-ads';
import { seo } from './seo';
import { shopifyStores } from './shopify-stores';
import { wordpressWebsites } from './wordpress-websites';

/**
 * The nine service pages, one per card on the services page, in that page's order: the six home
 * cards (`serviceCards`) and then the three cards only the services page shows
 * (`servicesPageCards`, both in src/data/site.ts). Each renders at /services/<slug>/
 * (src/pages/services/[slug].astro). All of their copy is proposed, for the owner to confirm
 * (docs/content-strategy.md).
 */
export const servicePages: readonly ServicePage[] = [
  customWebsites,
  wordpressWebsites,
  shopifyStores,
  emailAutomation,
  seo,
  aeoGeo,
  localSeo,
  metaGoogleAds,
  goHighLevel,
];

/*
 * A page's route is its card's `href`, so the home cards, the services hub, the footer, and the
 * industry pages' recommendations all lead to the page that exists, and each head is within the
 * limits the SEO suite enforces. Checked at build.
 */
for (const page of servicePages) {
  checkPageHead(page);
  const { href, title } = serviceCardById(page.card);
  if (href !== servicePath(page.slug)) {
    throw new Error(
      `The ${title} card links to "${href}", but its page is at "${servicePath(page.slug)}".`,
    );
  }
}
