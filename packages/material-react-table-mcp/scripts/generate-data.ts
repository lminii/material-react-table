/**
 * Builds the data the MCP server ships: the docs prop tables as JSON, the migration
 * guide, the agent skills, every docs example source, and the guide and reference pages
 * rendered from MDX to plain Markdown. Run from packages/material-react-table-mcp.
 */
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { cellInstanceAPIs } from '../../../apps/material-react-table-docs/components/prop-tables/cellInstanceAPIs';
import { columnInstanceAPIs } from '../../../apps/material-react-table-docs/components/prop-tables/columnInstanceAPIs';
import { columnOptions } from '../../../apps/material-react-table-docs/components/prop-tables/columnOptions';
import { rowInstanceAPIs } from '../../../apps/material-react-table-docs/components/prop-tables/rowInstanceAPIs';
import { stateOptions } from '../../../apps/material-react-table-docs/components/prop-tables/stateOptions';
import { tableInstanceAPIs } from '../../../apps/material-react-table-docs/components/prop-tables/tableInstanceAPIs';
import { tableOptions } from '../../../apps/material-react-table-docs/components/prop-tables/tableOptions';

import type {
  ApiData,
  ApiEntry,
  Category,
  DocEntry,
  DocsIndex,
  ExampleEntry,
} from '../src/data.js';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const repoRoot = join(pkgRoot, '..', '..');
const docsRoot = join(repoRoot, 'apps/material-react-table-docs');
const dataDir = join(pkgRoot, 'data');

type RawEntry = Record<string, unknown>;

const normalize = (rows: RawEntry[], nameKey: string): ApiEntry[] =>
  rows
    .map((row) => ({
      name: String(row[nameKey]),
      type: typeof row.type === 'string' ? row.type : '',
      defaultValue:
        typeof row.defaultValue === 'string' ? row.defaultValue : '',
      description: typeof row.description === 'string' ? row.description : '',
      link: typeof row.link === 'string' ? row.link : '',
      linkText: typeof row.linkText === 'string' ? row.linkText : '',
      required: row.required === true,
      source: typeof row.source === 'string' ? row.source : '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

const libraryPkg = JSON.parse(
  readFileSync(
    join(repoRoot, 'packages/material-react-table/package.json'),
    'utf8',
  ),
) as { version: string };

const api: ApiData = {
  libraryVersion: libraryPkg.version,
  categories: {
    tableOptions: normalize(tableOptions as RawEntry[], 'tableOption'),
    columnOptions: normalize(columnOptions as RawEntry[], 'columnOption'),
    stateOptions: normalize(stateOptions as RawEntry[], 'stateOption'),
    tableInstanceAPIs: normalize(
      tableInstanceAPIs as RawEntry[],
      'tableInstanceAPI',
    ),
    columnInstanceAPIs: normalize(
      columnInstanceAPIs as RawEntry[],
      'columnInstanceAPI',
    ),
    rowInstanceAPIs: normalize(rowInstanceAPIs as RawEntry[], 'rowInstanceAPI'),
    cellInstanceAPIs: normalize(
      cellInstanceAPIs as RawEntry[],
      'cellInstanceAPI',
    ),
  },
};

// ---------------------------------------------------------------------------
// Examples

const examplesDir = join(docsRoot, 'examples');
const exampleIds = readdirSync(examplesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

/** Example ids imported by one example-groups/*.tsx component. */
const exampleGroups = new Map<string, string[]>();
for (const file of readdirSync(join(docsRoot, 'example-groups'))) {
  const source = readFileSync(join(docsRoot, 'example-groups', file), 'utf8');
  const ids = [...source.matchAll(/from '\.\.\/examples\/([a-z0-9-]+)'/g)].map(
    (match) => match[1],
  );
  exampleGroups.set(basename(file, '.tsx'), ids);
}

// ---------------------------------------------------------------------------
// MDX to Markdown

const optionTables: Record<string, Category> = {
  TableOptionsTable: 'tableOptions',
  ColumnOptionsTable: 'columnOptions',
  StateOptionsTable: 'stateOptions',
};

const categoryLabels: Record<Category, string> = {
  tableOptions: 'table options',
  columnOptions: 'column options',
  stateOptions: 'state options',
  tableInstanceAPIs: 'table instance APIs',
  columnInstanceAPIs: 'column instance APIs',
  rowInstanceAPIs: 'row instance APIs',
  cellInstanceAPIs: 'cell instance APIs',
};

const renderOptionsTable = (category: Category, block: string): string => {
  const names = [...block.matchAll(/'([A-Za-z0-9_]+)'/g)].map(
    (match) => match[1],
  );
  const rows = api.categories[category].filter((row) =>
    names.includes(row.name),
  );
  if (rows.length === 0)
    return `Relevant ${categoryLabels[category]}: call list_mrt_api with category "${category}".`;
  const lines = rows.map((row) => {
    const parts = [`- \`${row.name}\``];
    if (row.type) parts.push(`type \`${row.type}\``);
    if (row.defaultValue) parts.push(`default \`${row.defaultValue}\``);
    const summary = row.description.replace(/\s+/g, ' ').trim();
    if (summary) parts.push(summary);
    return parts.join(' - ');
  });
  return `Relevant ${categoryLabels[category]} (get_mrt_api has full details):\n\n${lines.join('\n')}`;
};

interface ParsedMdx {
  title: string;
  description: string;
  headings: string[];
  markdown: string;
  /** Example ids embedded in the page, directly or through an example group. */
  examples: string[];
}

const renderExamples = (ids: string[]): string =>
  ids.length === 1
    ? `> Live example: \`${ids[0]}\` (call get_mrt_example with that id).`
    : `> Live examples: ${ids.map((id) => `\`${id}\``).join(', ')} (call get_mrt_example with an id).`;

/**
 * Turns a docs MDX page into Markdown a model can read: drops imports and the Head
 * block, expands the prop tables into option lists, and points embedded examples at
 * get_mrt_example. Fenced code is left untouched.
 */
const parseMdx = (file: string): ParsedMdx => {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const imports = new Map<string, string>();
  const headings: string[] = [];
  const examples: string[] = [];
  let title = '';
  let description = '';
  const out: string[] = [];
  let inFence = false;
  let i = 0;

  const examplesFor = (component: string): string[] | undefined => {
    const source = imports.get(component);
    if (!source) return undefined;
    const direct = source.match(/\/examples\/([a-z0-9-]+)$/);
    if (direct) return [direct[1]];
    const group = source.match(/\/example-groups\/([A-Za-z]+)$/);
    const ids = group ? exampleGroups.get(group[1]) : undefined;
    return ids?.length ? ids : undefined;
  };

  const replaceBlock = (tag: string, block: string): string | undefined => {
    if (tag === 'Head') {
      title = (
        block.match(/<title>\s*\{?'?([^'<}]*?)'?\}?\s*<\/title>/)?.[1] ?? ''
      )
        .replace(/\s*-\s*Material React Table.*$/, '')
        .trim();
      description =
        block.match(/name="description"\s+content="([^"]*)"/)?.[1] ?? '';
      return undefined;
    }
    if (tag in optionTables)
      return renderOptionsTable(optionTables[tag], block);
    const ids = examplesFor(tag);
    if (ids) {
      examples.push(...ids.filter((id) => !examples.includes(id)));
      return renderExamples(ids);
    }
    if (tag === 'TableOfContentsList' || tag === 'OptionsSwitcher')
      return undefined;
    console.warn(`  dropped <${tag}> in ${basename(file)}`);
    return undefined;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (/^(```|~~~)/.test(trimmed)) {
      inFence = !inFence;
      out.push(line);
      i += 1;
      continue;
    }
    if (inFence) {
      out.push(line);
      i += 1;
      continue;
    }
    if (trimmed.startsWith('import ')) {
      let statement = line;
      while (!/from\s+['"]/.test(statement) && i + 1 < lines.length) {
        i += 1;
        statement += `\n${lines[i]}`;
      }
      const match = statement.match(
        /^import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+)['"]/,
      );
      if (match) imports.set(match[1], match[2]);
      i += 1;
      continue;
    }
    const tagMatch = trimmed.match(/^<([A-Z][A-Za-z0-9_]*)/);
    if (tagMatch) {
      const tag = tagMatch[1];
      let block = line;
      // Head is the only element in the docs MDX that wraps children; the rest
      // are self-closing, even when their props span several lines.
      const complete = () =>
        tag === 'Head'
          ? new RegExp(`</${tag}>\\s*$`).test(block)
          : /\/>\s*$/.test(block);
      while (!complete() && i + 1 < lines.length) {
        i += 1;
        block += `\n${lines[i]}`;
      }
      const replacement = replaceBlock(tag, block);
      if (replacement !== undefined) out.push(replacement);
      i += 1;
      continue;
    }
    if (/^<br\s*\/>$/.test(trimmed)) {
      i += 1;
      continue;
    }
    if (/^#{1,6}\s/.test(trimmed)) headings.push(trimmed.replace(/^#+\s*/, ''));
    out.push(line.replace(/<Box[^>]*>(.*?)<\/Box>/g, '$1'));
    i += 1;
  }

  const markdown = `${out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;
  return { title, description, headings, markdown, examples };
};

const mdxFiles = (dir: string): string[] =>
  readdirSync(dir)
    .filter((file) => file.endsWith('.mdx') && file !== 'index.mdx')
    .sort();

// ---------------------------------------------------------------------------
// Write data/

rmSync(dataDir, { recursive: true, force: true });
mkdirSync(join(dataDir, 'guides'), { recursive: true });
mkdirSync(join(dataDir, 'reference'), { recursive: true });
mkdirSync(join(dataDir, 'examples'), { recursive: true });
writeFileSync(join(dataDir, 'api.json'), JSON.stringify(api, null, 2));
cpSync(join(repoRoot, 'MIGRATION.md'), join(dataDir, 'MIGRATION.md'));
cpSync(
  join(repoRoot, 'packages/material-react-table/skills'),
  join(dataDir, 'skills'),
  { recursive: true },
);

// The docs sandboxes only author a TS.tsx source, so the JS variant is derived
// by stripping types with the TypeScript compiler rather than copied.
const toJs = (source: string): string =>
  ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: 'TS.tsx',
  }).outputText;

const exampleUsage = new Map<string, ExampleEntry>(
  exampleIds.map((id) => [id, { id, guides: [], pages: [] }]),
);
for (const id of exampleIds) {
  const tsFile = join(examplesDir, id, 'sandbox/src/TS.tsx');
  cpSync(tsFile, join(dataDir, 'examples', `${id}.tsx`));
  writeFileSync(
    join(dataDir, 'examples', `${id}.js`),
    toJs(readFileSync(tsFile, 'utf8')),
  );
}

const guides: DocEntry[] = [];
const guidesDir = join(docsRoot, 'pages/docs/guides');
for (const file of mdxFiles(guidesDir)) {
  const name = basename(file, '.mdx');
  const page = parseMdx(join(guidesDir, file));
  writeFileSync(join(dataDir, 'guides', `${name}.md`), page.markdown);
  guides.push({
    name,
    title: page.title,
    description: page.description,
    headings: page.headings,
  });
  for (const id of page.examples) exampleUsage.get(id)?.guides.push(name);
}

const reference: DocEntry[] = [];
const apiDir = join(docsRoot, 'pages/docs/api');
for (const file of ['mrt-components.mdx', 'mrt-hooks.mdx']) {
  const name = basename(file, '.mdx');
  const page = parseMdx(join(apiDir, file));
  writeFileSync(join(dataDir, 'reference', `${name}.md`), page.markdown);
  reference.push({
    name,
    title: page.title,
    description: page.description,
    headings: page.headings,
  });
}

const examplePagesDir = join(docsRoot, 'pages/docs/examples');
for (const file of mdxFiles(examplePagesDir)) {
  const page = parseMdx(join(examplePagesDir, file));
  for (const id of page.examples)
    exampleUsage.get(id)?.pages.push(basename(file, '.mdx'));
}

const skills: DocEntry[] = readdirSync(join(dataDir, 'skills'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const body = readFileSync(
      join(dataDir, 'skills', entry.name, 'SKILL.md'),
      'utf8',
    );
    const description =
      body
        .match(/description:\s*>?\s*\n?([\s\S]*?)\nmetadata:/)?.[1]
        .replace(/\s+/g, ' ')
        .trim() ?? '';
    const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map(
      (match) => match[1],
    );
    return { name: entry.name, title: entry.name, description, headings };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const index: DocsIndex = {
  guides,
  reference,
  skills,
  examples: [...exampleUsage.values()],
};
writeFileSync(join(dataDir, 'index.json'), JSON.stringify(index, null, 2));

const counts = Object.entries(api.categories)
  .map(([key, rows]) => `${key}=${rows.length}`)
  .join(' ');
console.log(
  `Wrote data/ for @lminii/material-react-table ${api.libraryVersion}: ${counts} guides=${guides.length} reference=${reference.length} skills=${skills.length} examples=${exampleIds.length}`,
);
