#!/usr/bin/env node
/**
 * Content integrity checks for src/content. Complements the Zod schemas in
 * src/content.config.ts with rules that schemas cannot express well:
 *   - published entries contain no placeholder text
 *   - published case studies are client-approved
 *   - quoted results always cite a source
 *   - published entries do not use hedged "estimated" numbers as facts
 *
 * Draft entries (`draft: true`) and files starting with `_` are skipped.
 * Run with `npm run check:content`. Exits 1 when any error is found.
 */
import { readFileSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { walk } from './lib/files.mjs';

const root = resolve(new URL('..', import.meta.url).pathname);
const contentDir = join(root, 'src', 'content');
const errors = [];

const placeholderPatterns = [
  { pattern: /lorem ipsum/i, label: 'lorem ipsum' },
  { pattern: /\bTODO\b/, label: 'TODO' },
  { pattern: /\bTBD\b/, label: 'TBD' },
  { pattern: /\bFIXME\b/, label: 'FIXME' },
  {
    pattern: /\[(placeholder|insert [^\]]+|client name|coming soon)\]/i,
    label: 'bracketed placeholder',
  },
  { pattern: /\bXX+%/, label: 'unfilled percentage' },
];

const files = walk(contentDir, (f) => /\.(md|mdx)$/.test(f) && !basename(f).startsWith('_'));
let published = 0;

for (const file of files) {
  const name = relative(root, file);
  const collection = relative(contentDir, file).split(sep)[0];
  const { data, body, error } = parseFrontmatter(readFileSync(file, 'utf8'));
  if (error) {
    errors.push(`${name}: ${error}`);
    continue;
  }
  if (data.draft === true) continue;
  published += 1;

  const haystack = `${JSON.stringify(data)}\n${body}`;
  for (const { pattern, label } of placeholderPatterns) {
    if (pattern.test(haystack))
      errors.push(`${name}: published entry contains placeholder text (${label})`);
  }

  if (collection === 'work') {
    if (data.approvedByClient !== true) {
      errors.push(`${name}: case studies need approvedByClient: true before leaving draft`);
    }
    if (data.results !== undefined && !data.resultsSource) {
      errors.push(`${name}: results are listed without a resultsSource`);
    }
  }

  if (
    /\b(approximately|roughly|about|around|estimated)\s+\d+(\.\d+)?\s*(%|x\b|times)/i.test(body)
  ) {
    errors.push(
      `${name}: hedged statistic found; publish only measured numbers with a source, or remove the figure`,
    );
  }
}

if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\ncheck-content: ${errors.length} error(s) across ${files.length} entries.`);
  process.exit(1);
}
console.log(`check-content: OK. ${files.length} entries scanned, ${published} published.`);
