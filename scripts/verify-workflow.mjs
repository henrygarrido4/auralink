#!/usr/bin/env node
/**
 * Verifies that the instruction system is well formed:
 *   - AGENTS.md and CLAUDE.md exist, and CLAUDE.md imports AGENTS.md
 *   - .cursor/rules/*.mdc have valid front matter and a deliberate scope
 *   - .cursor/agents/*.md have a name matching the file and a description
 *   - .cursor/skills/<name>/SKILL.md have a name matching the folder and a description
 *   - local paths referenced from instruction files and docs exist
 *   - every `npm run <script>` and `node scripts/<file>` mentioned exists
 *
 * Run with `npm run check:workflow`. Exits 1 when any error is found.
 * Routing preview: `npm run check:workflow -- --route src/components/islands/Nav.vue`
 * prints which rules Cursor would attach for each given path.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { walk } from './lib/files.mjs';

const root = resolve(new URL('..', import.meta.url).pathname);
const errors = [];
const warnings = [];
const rel = (p) => relative(root, p);
const read = (path) => readFileSync(path, 'utf8');
const lineCount = (text) => text.split('\n').length;

// 1. Root instruction files -------------------------------------------------
const agentsPath = join(root, 'AGENTS.md');
const claudePath = join(root, 'CLAUDE.md');
if (!existsSync(agentsPath)) errors.push('AGENTS.md is missing');
if (!existsSync(claudePath)) {
  errors.push('CLAUDE.md is missing');
} else {
  const claude = read(claudePath);
  if (!/^@AGENTS\.md\s*$/m.test(claude)) {
    errors.push(
      'CLAUDE.md must import the shared instructions with a line containing only `@AGENTS.md`',
    );
  }
  if (lineCount(claude) > 120) {
    warnings.push(`CLAUDE.md is ${lineCount(claude)} lines; keep it concise (target < 120)`);
  }
}
if (existsSync(agentsPath) && lineCount(read(agentsPath)) > 200) {
  warnings.push(
    `AGENTS.md is ${lineCount(read(agentsPath))} lines; move detail into rules, skills, or docs (target < 200)`,
  );
}

// 2. Cursor rules -------------------------------------------------------------
const rulesDir = join(root, '.cursor', 'rules');
const ruleFiles = walk(rulesDir, (f) => f.endsWith('.mdc'));
if (ruleFiles.length === 0) errors.push('.cursor/rules contains no .mdc rules');
const allowedRuleKeys = new Set(['description', 'globs', 'alwaysApply']);
const rules = [];
for (const file of ruleFiles) {
  const text = read(file);
  const { data, body, error } = parseFrontmatter(text);
  const name = rel(file);
  if (error) {
    errors.push(`${name}: ${error}`);
    continue;
  }
  rules.push({ id: basename(file, '.mdc'), data });
  for (const key of Object.keys(data)) {
    if (!allowedRuleKeys.has(key)) warnings.push(`${name}: unexpected front matter key "${key}"`);
  }
  if (typeof data.alwaysApply !== 'boolean')
    errors.push(`${name}: alwaysApply must be true or false`);
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push(`${name}: description must be a string`);
  }
  if (data.globs !== undefined) {
    // Cursor reads `globs` as one comma-separated string without quotes or brackets;
    // YAML lists are not documented and are reported as ignored by users.
    if (Array.isArray(data.globs)) {
      errors.push(`${name}: write globs as one comma-separated string, not a YAML list`);
    } else if (typeof data.globs !== 'string' || !data.globs.trim()) {
      errors.push(`${name}: globs must be a non-empty comma-separated string`);
    } else if (/["'[\]]/.test(data.globs)) {
      errors.push(`${name}: globs must not contain quotes or brackets`);
    }
  }
  if (data.alwaysApply !== true && !data.description && !data.globs) {
    warnings.push(`${name}: manual-only rule (no description or globs); confirm this is intended`);
  }
  if (!body.trim()) errors.push(`${name}: rule body is empty`);
  if (lineCount(text) > 500)
    errors.push(`${name}: ${lineCount(text)} lines exceeds the 500-line guideline`);
  if (!/^#\s/m.test(body))
    warnings.push(`${name}: add a top-level heading so the rule is easy to scan`);
}

// 3. Cursor agents -----------------------------------------------------------
const agentsDir = join(root, '.cursor', 'agents');
const agentFiles = walk(agentsDir, (f) => f.endsWith('.md'));
if (agentFiles.length === 0) errors.push('.cursor/agents contains no agent definitions');
for (const file of agentFiles) {
  const name = rel(file);
  const { data, body, error } = parseFrontmatter(read(file));
  if (error) {
    errors.push(`${name}: ${error}`);
    continue;
  }
  const expected = basename(file, '.md');
  if (data.name !== expected) {
    errors.push(`${name}: front matter name "${data.name}" must equal the file name "${expected}"`);
  }
  if (!/^[a-z0-9-]+$/.test(String(data.name))) {
    errors.push(`${name}: name must be lowercase letters, digits, and hyphens`);
  }
  if (typeof data.description !== 'string' || data.description.length < 40) {
    errors.push(`${name}: description must explain when to delegate (at least 40 characters)`);
  }
  if (data.model !== undefined && typeof data.model !== 'string')
    errors.push(`${name}: model must be a string`);
  for (const flag of ['readonly', 'is_background']) {
    if (data[flag] !== undefined && typeof data[flag] !== 'boolean') {
      errors.push(`${name}: ${flag} must be a boolean`);
    }
  }
  if (!body.trim()) errors.push(`${name}: agent prompt is empty`);
}

// 4. Cursor skills ------------------------------------------------------------
const skillsDir = join(root, '.cursor', 'skills');
let skillDirs = [];
try {
  skillDirs = readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory());
} catch {
  errors.push('.cursor/skills is missing');
}
if (skillDirs.length === 0) errors.push('.cursor/skills contains no skills');
for (const dir of skillDirs) {
  const file = join(skillsDir, dir, 'SKILL.md');
  const name = rel(file);
  if (!existsSync(file)) {
    errors.push(`${rel(join(skillsDir, dir))}: missing SKILL.md`);
    continue;
  }
  const { data, body, error } = parseFrontmatter(read(file));
  if (error) {
    errors.push(`${name}: ${error}`);
    continue;
  }
  if (data.name !== dir) {
    errors.push(`${name}: front matter name "${data.name}" must equal the folder name "${dir}"`);
  }
  if (!/^[a-z0-9-]+$/.test(dir)) {
    errors.push(`${name}: skill folder must be lowercase letters, digits, and hyphens`);
  }
  if (typeof data.description !== 'string' || data.description.length < 40) {
    errors.push(
      `${name}: description must say what the skill does and when to use it (at least 40 characters)`,
    );
  }
  if (!body.trim()) errors.push(`${name}: skill body is empty`);
  if (!/##\s*When to use/i.test(body)) warnings.push(`${name}: add a "When to use" section`);
}

// 5. Local references ---------------------------------------------------------
const docFiles = [
  agentsPath,
  claudePath,
  join(root, 'README.md'),
  ...ruleFiles,
  ...agentFiles,
  ...walk(skillsDir, (f) => f.endsWith('.md')),
  ...walk(join(root, 'docs'), (f) => f.endsWith('.md')),
].filter(existsSync);

for (const file of docFiles) {
  const text = read(file);
  const name = rel(file);
  const refs = new Set();
  // Markdown links to local files: [text](path) without a scheme.
  for (const match of text.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
    const target = match[1];
    if (/^[a-z]+:/i.test(target)) continue;
    refs.add(target);
  }
  // @path references (Cursor/Claude import style), ignoring code spans and fences.
  const withoutCode = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const atRef =
    /(?:^|\s)@((?:\.\.?\/|\.cursor\/|docs\/|src\/|scripts\/|tests\/|AGENTS|CLAUDE)[^\s)]*)/g;
  for (const match of withoutCode.matchAll(atRef)) refs.add(match[1]);
  // Backticked paths into the instruction system and docs must exist (other backticked
  // paths may be illustrative examples, so they are not checked).
  for (const match of text.matchAll(/`((?:\.cursor|docs)\/[A-Za-z0-9_./-]+)`/g)) refs.add(match[1]);
  for (const target of refs) {
    const cleaned = target.replace(/^\.\//, '');
    const candidates = [resolve(dirname(file), cleaned), resolve(root, cleaned)];
    if (!candidates.some(existsSync)) errors.push(`${name}: references missing path "${target}"`);
  }
}

// 6. Command references -------------------------------------------------------
const pkg = JSON.parse(read(join(root, 'package.json')));
for (const file of docFiles) {
  const name = rel(file);
  const text = read(file);
  for (const match of text.matchAll(/npm run ([a-z0-9:_-]+)/g)) {
    if (!pkg.scripts[match[1]]) errors.push(`${name}: references missing npm script "${match[1]}"`);
  }
  for (const match of text.matchAll(/node (scripts\/[a-z0-9_./-]+\.mjs)/g)) {
    if (!existsSync(join(root, match[1])))
      errors.push(`${name}: references missing script "${match[1]}"`);
  }
}

// 7. Required docs ------------------------------------------------------------
for (const doc of [
  'docs/architecture.md',
  'docs/content-strategy.md',
  'docs/quality-checks.md',
  'docs/seo-aeo-geo.md',
  'docs/performance.md',
]) {
  if (!existsSync(join(root, doc))) errors.push(`${doc} is missing`);
}

// Routing preview --------------------------------------------------------------
function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i += 1) {
    const ch = glob[i];
    if (ch === '*') {
      if (glob[i + 1] === '*') {
        if (glob[i + 2] === '/') {
          re += '(?:.*/)?';
          i += 2;
        } else {
          re += '.*';
          i += 1;
        }
      } else {
        re += '[^/]*';
      }
    } else if (ch === '?') {
      re += '[^/]';
    } else if (ch === '{') {
      const end = glob.indexOf('}', i);
      const options = glob
        .slice(i + 1, end)
        .split(',')
        .map((s) => s.replace(/[.+^$()|\\]/g, '\\$&'));
      re += `(?:${options.join('|')})`;
      i = end;
    } else if ('.+^$()|\\'.includes(ch)) {
      re += `\\${ch}`;
    } else {
      re += ch;
    }
  }
  return new RegExp(`^${re}$`);
}

export function rulesFor(filePath) {
  const always = [];
  const attached = [];
  const onRequest = [];
  for (const { id, data } of rules) {
    if (data.alwaysApply === true) always.push(id);
    else if (
      typeof data.globs === 'string' &&
      data.globs.split(',').some((g) => globToRegExp(g.trim()).test(filePath))
    ) {
      attached.push(id);
    } else if (data.description) onRequest.push(id);
  }
  return { always, attached, onRequest };
}

const routeIndex = process.argv.indexOf('--route');
if (routeIndex !== -1) {
  for (const target of process.argv.slice(routeIndex + 1)) {
    const { always, attached, onRequest } = rulesFor(target);
    console.log(
      `${target}\n  always: ${always.join(', ')}\n  attached by glob: ${attached.join(', ') || '(none)'}\n  available by description: ${onRequest.join(', ')}`,
    );
  }
}

// Report ----------------------------------------------------------------------
const summary = `${ruleFiles.length} rules, ${agentFiles.length} agents, ${skillDirs.length} skills checked`;
for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(
    `\nverify-workflow: ${errors.length} error(s), ${warnings.length} warning(s). ${summary}.`,
  );
  process.exit(1);
}
console.log(`verify-workflow: OK. ${summary}, ${warnings.length} warning(s).`);
