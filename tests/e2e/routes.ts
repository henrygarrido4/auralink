import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = join(process.cwd(), 'dist');

/**
 * Every HTML route in the production build, derived from dist/.
 * Call this inside a test (not at module load) so the build has finished.
 */
export function builtRoutes(): string[] {
  const routes: string[] = [];
  const visit = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        visit(full);
      } else if (name.endsWith('.html')) {
        const rel = relative(DIST, full).split(sep).join('/');
        if (rel === '404.html') continue;
        const route =
          rel === 'index.html'
            ? '/'
            : `/${rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '')}`;
        routes.push(route);
      }
    }
  };
  visit(DIST);
  return routes.sort();
}
