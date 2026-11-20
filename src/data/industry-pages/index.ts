import { checkPageHead, industryPath, type IndustryPage } from '../detail-pages';
import { industries } from '../site';
import { artsCultureEntertainment } from './arts-culture-entertainment';
import { automotive } from './automotive';
import { constructionHomeServices } from './construction-home-services';
import { dental } from './dental';
import { educationCommunityOrganizations } from './education-community-organizations';
import { financialProfessionalServices } from './financial-professional-services';
import { foodHospitality } from './food-hospitality';
import { healthcareMedical } from './healthcare-medical';
import { lawyersLawFirms } from './lawyers-law-firms';
import { manufacturingIndustrial } from './manufacturing-industrial';
import { medSpasSalonsWellness } from './med-spas-salons-wellness';
import { nonprofitsAssociations } from './nonprofits-associations';
import { realEstatePropertyManagement } from './real-estate-property-management';
import { retailConsumerBrands } from './retail-consumer-brands';
import { technologySaas } from './technology-saas';
import { veterinaryPetCare } from './veterinary-pet-care';

/**
 * The sixteen industry pages, one per entry in `industries` (src/data/site.ts), in that order.
 * Each renders at /industries/<slug>/ (src/pages/industries/[slug].astro). All of their copy is
 * proposed, for the owner to confirm (docs/content-strategy.md). The pages describe kinds of
 * business and prospective work: no client, result, or figure.
 */
export const industryPages: readonly IndustryPage[] = [
  constructionHomeServices,
  healthcareMedical,
  dental,
  veterinaryPetCare,
  medSpasSalonsWellness,
  automotive,
  foodHospitality,
  realEstatePropertyManagement,
  retailConsumerBrands,
  manufacturingIndustrial,
  artsCultureEntertainment,
  educationCommunityOrganizations,
  nonprofitsAssociations,
  lawyersLawFirms,
  financialProfessionalServices,
  technologySaas,
];

/** The industry page named as in `industries`, if one exists. */
export const industryPageFor = (name: string) => industryPages.find((page) => page.name === name);

/** Where an industry's name in the directories links, once its page exists. */
export const industryHref = (name: string) => {
  const page = industryPageFor(name);
  return page ? industryPath(page.slug) : undefined;
};

/*
 * Every listed industry has one page, in the list's order, no two share a route, and each head is
 * within the limits the SEO suite enforces. Checked at build.
 */
industryPages.forEach(checkPageHead);
const listed = industries.map((industry) => industry.name);
const paged = industryPages.map((page) => page.name);
if (listed.join('\n') !== paged.join('\n')) {
  throw new Error(
    `The industry pages must match \`industries\` in src/data/site.ts, in order.\nListed: ${listed.join(', ')}\nPages: ${paged.join(', ')}`,
  );
}
if (new Set(industryPages.map((page) => page.slug)).size !== industryPages.length) {
  throw new Error('Two industry pages share a slug.');
}
