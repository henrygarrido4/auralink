import type { ImageMetadata } from 'astro';
import activewearStretch from '../assets/work/activewear-stretch.webp';
import apartmentPool from '../assets/work/apartment-pool.webp';
import barberTools from '../assets/work/barber-tools.webp';
import bottle from '../assets/work/props/bottle.webp';
import comb from '../assets/work/props/comb.webp';
import keys from '../assets/work/props/keys.webp';
import scissors from '../assets/work/props/scissors.webp';
import sneakers from '../assets/work/props/sneakers.webp';
import succulent from '../assets/work/props/succulent.webp';

/**
 * The cover photo of each project in the home page's selected work section, by project id
 * (`featuredProjects` in src/data/site.ts, which holds each photo's alt text). Kept apart from the
 * data so that module stays free of image imports: the Playwright specs import it in Node.
 *
 * All three are licensed stock photos chosen to match the project's industry, credited in
 * src/assets/CREDITS.md, cropped to 3:2 and stored at 2100x1400. They only illustrate: none shows
 * the business itself, its premises, or its products, so never caption one as if it did.
 */
export const projectPhotos = {
  'johnnys-exclusive-barbershop': barberTools,
  'villas-at-foxbrick': apartmentPool,
  one0one: activewearStretch,
};

export type ProjectId = keyof typeof projectPhotos;

/**
 * The two cut-out objects that pop out from behind each project's card, as the plant and pencil
 * cup do in the Hub2B reference: `top` rises above the card's top edge near its left end, and
 * `bottom` drops below its bottom edge near its right end (src/components/ui/ProjectCard.astro).
 * Each is a top-down photo of an object from the project's industry, cut out from a licensed stock
 * photo and centred on an 800x800 transparent square, so one size fits every prop. Decorative:
 * they carry no meaning and show nothing of the project itself (credits: src/assets/CREDITS.md).
 */
export const projectProps: Record<ProjectId, { top: ImageMetadata; bottom: ImageMetadata }> = {
  'johnnys-exclusive-barbershop': { top: scissors, bottom: comb },
  'villas-at-foxbrick': { top: keys, bottom: succulent },
  one0one: { top: sneakers, bottom: bottle },
};
