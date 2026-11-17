import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Recursively list files under `dir` whose name matches `test`. */
export function walk(dir, test = () => true) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (name === 'node_modules' || name.startsWith('.git')) continue;
      out.push(...walk(full, test));
    } else if (test(full)) {
      out.push(full);
    }
  }
  return out.sort();
}
