/**
 * Minimal YAML front matter reader for the instruction and content files in
 * this repository. It understands the subset these files use:
 *   key: value            strings, numbers, booleans, null
 *   key: "quoted"         single or double quotes
 *   key: [a, b]           inline lists
 *   key:                  block lists of `- item`
 *     - item
 * Anything more complex should use a real YAML parser.
 */
export function parseFrontmatter(source) {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { data: null, body: normalized, error: 'missing opening --- on line 1' };
  }
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) {
    return { data: null, body: normalized, error: 'missing closing ---' };
  }
  const block = normalized.slice(4, end);
  const body = normalized.slice(end + 4).replace(/^\n/, '');
  const data = {};
  const lines = block.split('\n');
  let currentListKey = null;
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const listItem = /^\s+-\s+(.*)$/.exec(line) || /^-\s+(.*)$/.exec(line);
    if (listItem && currentListKey) {
      data[currentListKey].push(parseScalar(listItem[1]));
      continue;
    }
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) {
      return { data: null, body, error: `cannot parse front matter line: "${line}"` };
    }
    const [, key, rawValue] = kv;
    if (rawValue === '') {
      data[key] = [];
      currentListKey = key;
      continue;
    }
    currentListKey = null;
    data[key] = parseValue(rawValue);
  }
  return { data, body, error: null };
}

function parseValue(raw) {
  const value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return splitInline(inner).map(parseScalar);
  }
  return parseScalar(value);
}

function splitInline(inner) {
  const parts = [];
  let current = '';
  let quote = null;
  for (const ch of inner) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === ',') {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseScalar(raw) {
  const value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}
