import freightSolutions from '../assets/work/freight-solutions.webp';
import johnnysExclusiveBarbershop from '../assets/work/johnnys-exclusive-barbershop.webp';
import villasAtFoxbrick from '../assets/work/villas-at-foxbrick.webp';

/**
 * The screenshot of each project's homepage, by project id (`workProjects` in src/data/work.ts,
 * which holds each screenshot's alt text). Kept apart from the data so that module stays free of
 * image imports: the Playwright specs import it in Node.
 *
 * Each is the site's own homepage as it rendered on 2026-11-21 in a 1440x1080 desktop viewport at
 * 2x, with its newsletter pop-up dismissed and the host's badge hidden, saved at 1920x1440 (4:3)
 * as WebP (src/assets/CREDITS.md). The home cards crop them to 16:10 from the top; the work page
 * shows the full frame. Capture them again when a site changes.
 */
export const projectScreenshots = {
  'johnnys-exclusive-barbershop': johnnysExclusiveBarbershop,
  'freight-solutions': freightSolutions,
  'villas-at-foxbrick': villasAtFoxbrick,
};

export type ProjectId = keyof typeof projectScreenshots;
