# @lminii/material-react-table-mcp

An [MCP](https://modelcontextprotocol.io) server that gives AI coding agents an exact reference for [Material React Table V4](https://github.com/lminii/material-react-table) (`@lminii/material-react-table`).
It serves the same data as the docs site: the API pages, every feature guide, the components and hooks reference, the source of every runnable example, the V3 to V4 migration guide, and the agent skills bundled with the library.

## Tools

| Tool | Purpose |
| --- | --- |
| `search_mrt_api` | Search table options, column options, state slices, and instance methods by name or description. |
| `get_mrt_api` | Exact lookup of one entry: type, default, source library, description, docs link. |
| `list_mrt_api` | List one category, optionally filtered by a name prefix such as `mui`, `render`, `enable`, or `on`. |
| `get_mrt_migration_guide` | The full `MIGRATION.md` for moving from `material-react-table` V3 to V4. |
| `get_mrt_skill` | The `SKILL.md` guides shipped in `@lminii/material-react-table/skills`. |
| `search_mrt_docs` | Find which guide, reference page, skill, or example covers a topic, and which tool returns it. |
| `get_mrt_guide` | One of the 38 feature guides as Markdown, with its relevant options expanded and its live examples named. Call without a name to list them. |
| `get_mrt_reference` | The MRT components or MRT hooks reference page. |
| `get_mrt_example` | The source of one of the 113 docs examples, as TypeScript or JavaScript. Call without an id to list them with the guides that embed each one. |

## Setup

Claude Code:

```bash
claude mcp add material-react-table -- npx -y @lminii/material-react-table-mcp
```

Any client that launches stdio servers:

```json
{
  "mcpServers": {
    "material-react-table": {
      "command": "npx",
      "args": ["-y", "@lminii/material-react-table-mcp"]
    }
  }
}
```

Node 22.12 or newer is required.

## Skills without the server

The library package ships the same skills for [TanStack Intent](https://www.npmjs.com/package/@tanstack/intent).
In a project that has `@lminii/material-react-table` installed:

```bash
npx @tanstack/intent@latest list
npx @tanstack/intent@latest load @lminii/material-react-table#getting-started
```

Any other harness can install them with the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a codex
```

## Development

From this directory in the monorepo:

```bash
pnpm build   # regenerates data/ from the docs prop tables, MIGRATION.md and skills, then compiles
pnpm test    # starts the built server and exercises every tool
```

`data/` is generated; edit the docs prop tables under `apps/material-react-table-docs/components/prop-tables`, the MDX pages under `apps/material-react-table-docs/pages/docs`, or the examples under `apps/material-react-table-docs/examples` instead. Guides are rendered from MDX to Markdown at build time: imports and the `Head` block are dropped, `*OptionsTable` components become option lists, and embedded examples become pointers to `get_mrt_example`.
