#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import {
  type ApiEntry,
  CATEGORIES,
  type Category,
  listSkills,
  loadApi,
  loadDocsIndex,
  loadExample,
  loadGuide,
  loadMigrationGuide,
  loadReference,
  loadSkill,
  searchApi,
  searchDocs,
} from './data.js';

const api = loadApi();
const docs = loadDocsIndex();

const categoryDescriptions: Record<Category, string> = {
  tableOptions:
    'options passed to useMaterialReactTable (props of MaterialReactTable)',
  columnOptions: 'options on an MRT_ColumnDef column definition',
  stateOptions:
    'slices of MRT_TableState, each with an initialState key, a state key, and an on*Change callback',
  tableInstanceAPIs:
    'methods on the MRT_TableInstance returned by useMaterialReactTable',
  columnInstanceAPIs: 'methods on an MRT_Column instance',
  rowInstanceAPIs: 'methods on an MRT_Row instance',
  cellInstanceAPIs: 'methods on an MRT_Cell instance',
};

const formatEntry = (entry: ApiEntry, category: Category): string => {
  const lines = [`### ${entry.name}`, `Category: ${category}`];
  if (entry.type) lines.push(`Type: \`${entry.type}\``);
  if (entry.defaultValue) lines.push(`Default: \`${entry.defaultValue}\``);
  if (entry.required) lines.push('Required: yes');
  if (entry.source) lines.push(`Source library: ${entry.source}`);
  if (entry.description) lines.push('', entry.description);
  if (entry.link)
    lines.push('', `More: ${entry.linkText || entry.link} <${entry.link}>`);
  return lines.join('\n');
};

const text = (value: string) => ({
  content: [{ type: 'text' as const, text: value }],
});

const server = new McpServer({
  name: 'material-react-table',
  version: api.libraryVersion,
});

server.registerTool(
  'search_mrt_api',
  {
    title: 'Search the Material React Table API',
    description: `Search Material React Table V${api.libraryVersion.split('.')[0]} (@lminii/material-react-table) table options, column options, state slices, and table/column/row/cell instance methods by name or description. Use this first when unsure which option or method exists.`,
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe(
          'Words to match against option or method names and descriptions, e.g. "pinning", "muiTableBodyRowProps", "manual pagination".',
        ),
      categories: z
        .array(z.enum(CATEGORIES))
        .optional()
        .describe('Restrict the search to these categories. Defaults to all.'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Maximum hits to return. Defaults to 20.'),
    },
  },
  async ({ query, categories, limit }) => {
    const hits = searchApi(api, query, categories ?? CATEGORIES, limit ?? 20);
    if (hits.length === 0) {
      return text(
        `No Material React Table API entries match "${query}". Try a shorter term, or list a category with list_mrt_api.`,
      );
    }
    return text(hits.map((hit) => formatEntry(hit, hit.category)).join('\n\n'));
  },
);

server.registerTool(
  'get_mrt_api',
  {
    title: 'Get one Material React Table API entry',
    description:
      'Return the type, default, source library, description, and docs link for one table option, column option, state slice, or instance method by exact name.',
    inputSchema: {
      name: z
        .string()
        .min(1)
        .describe(
          'Exact option, state, or method name, e.g. "enableRowSelection" or "getSelectedRowModel".',
        ),
      category: z
        .enum(CATEGORIES)
        .optional()
        .describe(
          'Category to look in. When omitted, every category is checked and all matches are returned.',
        ),
    },
  },
  async ({ name, category }) => {
    const matches: string[] = [];
    for (const cat of category ? [category] : CATEGORIES) {
      const entry = api.categories[cat].find((row) => row.name === name);
      if (entry) matches.push(formatEntry(entry, cat));
    }
    if (matches.length === 0) {
      const suggestions = searchApi(
        api,
        name,
        category ? [category] : CATEGORIES,
        5,
      ).map((hit) => `${hit.name} (${hit.category})`);
      return text(
        `"${name}" is not a Material React Table ${category ?? 'API'} entry.${suggestions.length ? ` Did you mean: ${suggestions.join(', ')}?` : ''}`,
      );
    }
    return text(matches.join('\n\n'));
  },
);

server.registerTool(
  'list_mrt_api',
  {
    title: 'List a Material React Table API category',
    description: `List every entry in one category with a one-line description. Categories: ${CATEGORIES.map((cat) => `${cat} (${categoryDescriptions[cat]})`).join('; ')}.`,
    inputSchema: {
      category: z.enum(CATEGORIES),
      prefix: z
        .string()
        .optional()
        .describe(
          'Only entries whose name starts with this prefix, e.g. "mui", "render", "enable", "on", "get".',
        ),
    },
  },
  async ({ category, prefix }) => {
    const rows = api.categories[category].filter(
      (row) => !prefix || row.name.startsWith(prefix),
    );
    if (rows.length === 0)
      return text(`No ${category} entries start with "${prefix}".`);
    const lines = rows.map((row) => {
      const summary = row.description.replace(/\s+/g, ' ').trim();
      const type = row.type ? ` \`${row.type}\`` : '';
      return `- ${row.name}${type}${summary ? ` - ${summary}` : ''}`;
    });
    return text(
      `${category}: ${categoryDescriptions[category]} (${rows.length} entries)\n\n${lines.join('\n')}`,
    );
  },
);

server.registerTool(
  'get_mrt_migration_guide',
  {
    title: 'Get the Material React Table V3 to V4 migration guide',
    description:
      'Return the full migration guide: switching from material-react-table to @lminii/material-react-table, Material UI V9 changes (slotProps, date pickers), and every TanStack Table V9 rename and behaviour change.',
    inputSchema: {},
  },
  async () => text(loadMigrationGuide()),
);

server.registerTool(
  'get_mrt_skill',
  {
    title: 'Get a Material React Table agent skill',
    description: `Return one of the bundled SKILL.md guides for coding agents (${listSkills().join(', ')}). Call without a name to list them with their descriptions.`,
    inputSchema: {
      name: z
        .string()
        .optional()
        .describe('Skill name. Omit to list available skills.'),
    },
  },
  async ({ name }) => {
    if (!name) {
      const summaries = listSkills().map((skill) => {
        const body = loadSkill(skill) ?? '';
        const match = body.match(
          /description:\s*>?\s*\n?([\s\S]*?)\nmetadata:/,
        );
        const description = match ? match[1].replace(/\s+/g, ' ').trim() : '';
        return `- ${skill}: ${description}`;
      });
      return text(`Available skills:\n${summaries.join('\n')}`);
    }
    const skill = loadSkill(name);
    if (!skill)
      return text(
        `Unknown skill "${name}". Available: ${listSkills().join(', ')}.`,
      );
    return text(skill);
  },
);

const REFERENCE_PAGES = docs.reference.map((page) => page.name) as [
  string,
  ...string[],
];

const toolFor: Record<string, string> = {
  guide: 'get_mrt_guide',
  reference: 'get_mrt_reference',
  skill: 'get_mrt_skill',
  example: 'get_mrt_example',
};

server.registerTool(
  'search_mrt_docs',
  {
    title: 'Search the Material React Table guides, examples, and skills',
    description:
      'Find which guide, reference page, skill, or example covers a topic. Matches names, titles, headings, and descriptions, and tells you which tool to call next. Use search_mrt_api instead for a specific option or method name.',
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe(
          'Words to match, e.g. "row selection", "virtualization", "detail panel", "export csv".',
        ),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Maximum hits to return. Defaults to 20.'),
    },
  },
  async ({ query, limit }) => {
    const hits = searchDocs(docs, query, limit ?? 20);
    if (hits.length === 0) {
      return text(
        `Nothing in the Material React Table docs matches "${query}". Try a shorter term, or list everything with get_mrt_guide or get_mrt_example.`,
      );
    }
    return text(
      hits
        .map(
          (hit) =>
            `- ${hit.kind} \`${hit.name}\` (${toolFor[hit.kind]}): ${hit.summary}`,
        )
        .join('\n'),
    );
  },
);

server.registerTool(
  'get_mrt_guide',
  {
    title: 'Get a Material React Table feature guide',
    description: `Return one of the ${docs.guides.length} docs guides as Markdown, with its relevant options expanded and its live examples named (fetch those with get_mrt_example). Call without a name to list the guides.`,
    inputSchema: {
      name: z
        .string()
        .optional()
        .describe(
          'Guide name, e.g. "editing", "column-filtering", "virtualization". Omit to list all guides.',
        ),
    },
  },
  async ({ name }) => {
    if (!name) {
      return text(
        `Guides:\n${docs.guides.map((guide) => `- ${guide.name}: ${guide.description || guide.title}`).join('\n')}`,
      );
    }
    const guide = loadGuide(name);
    if (!guide) {
      const suggestions = searchDocs(docs, name, 5, ['guide']).map(
        (hit) => hit.name,
      );
      return text(
        `Unknown guide "${name}".${suggestions.length ? ` Did you mean: ${suggestions.join(', ')}?` : ''} Call get_mrt_guide without a name to list them.`,
      );
    }
    return text(guide);
  },
);

server.registerTool(
  'get_mrt_reference',
  {
    title: 'Get the Material React Table components or hooks reference',
    description: `Return a reference page as Markdown: ${docs.reference.map((page) => `"${page.name}" (${page.description})`).join(', ')}.`,
    inputSchema: {
      page: z.enum(REFERENCE_PAGES),
    },
  },
  async ({ page }) => text(loadReference(page) ?? `Unknown page "${page}".`),
);

server.registerTool(
  'get_mrt_example',
  {
    title: 'Get a Material React Table example',
    description: `Return the source of one of the ${docs.examples.length} runnable docs examples, as TypeScript or JavaScript. Call without an id to list every example with the guides that embed it.`,
    inputSchema: {
      id: z
        .string()
        .optional()
        .describe(
          'Example id, e.g. "basic", "editing-crud-modal", "virtualized", "remote". Omit to list all examples.',
        ),
      language: z
        .enum(['ts', 'js'])
        .optional()
        .describe(
          'Source language to return, "ts" or "js". Defaults to "ts".',
        ),
    },
  },
  async ({ id, language }) => {
    if (!id) {
      const lines = docs.examples.map((example) => {
        const where = [
          example.guides.length ? `guides: ${example.guides.join(', ')}` : '',
          example.pages.length ? `pages: ${example.pages.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join('; ');
        return `- ${example.id}${where ? ` (${where})` : ''}`;
      });
      return text(`Examples:\n${lines.join('\n')}`);
    }
    const lang = language ?? 'ts';
    const source = loadExample(id, lang);
    if (!source) {
      const known = docs.examples.some((example) => example.id === id);
      if (!known) {
        const suggestions = searchDocs(docs, id, 5, ['example']).map(
          (hit) => hit.name,
        );
        return text(
          `Unknown example "${id}".${suggestions.length ? ` Did you mean: ${suggestions.join(', ')}?` : ''} Call get_mrt_example without an id to list them.`,
        );
      }
      return text(`No ${lang} source is available for example "${id}".`);
    }
    const sourceNote =
      lang === 'js'
        ? `// examples/${id}/sandbox/src/TS.tsx (JavaScript, types stripped)`
        : `// examples/${id}/sandbox/src/TS.tsx`;
    return text(`${sourceNote}\n${source}`);
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
