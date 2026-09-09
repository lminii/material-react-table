# Material React Table Agent Skills

These folders are [Agent Skills](https://agentskills.io) for AI coding assistants such as Claude Code, Cursor, Codex, and Copilot.
Each folder holds one `SKILL.md` that teaches an agent a slice of the Material React Table V4 API and the patterns the documentation recommends.
The skills ship inside the `@lminii/material-react-table` npm package, so every install of the library carries them.

Full documentation for AI agents, including the MCP server, lives on the [AI Agents](https://material-react-table.minii.dev/docs/getting-started/ai-agents) docs page.

## Skills

| Skill | Load it for |
| --- | --- |
| `getting-started` | Installing V4, defining columns, the `useMaterialReactTable` plus `table` prop pattern, and the sub-component exports. |
| `customization` | `mui*Props`, `render*` overrides, display columns, icons, and Material UI theming. |
| `composable-components` | Building a custom layout from the exported `MRT_*` components. |
| `state-and-server-data` | Controlled state, `on*Change` callbacks, `manual*` options, `rowCount`, and TanStack Query integration. |
| `editing` | The five edit display modes, create rows, validation, and saving to a server. |
| `filtering` | Column filter variants and modes, global filtering, faceted values, and custom filter functions. |
| `virtualization` | Row and column virtualization, virtualizer options, and scroll-to-index. |
| `localization` | The bundled locales and custom localization strings. |
| `drag-and-drop-ordering` | Column and row drag and drop ordering. |
| `migrate-v3-to-v4` | Moving an app from `material-react-table` V3 to `@lminii/material-react-table` V4. |

## How Agents Use Them

There are three ways to get a skill in front of an agent.

### TanStack Intent

[TanStack Intent](https://www.npmjs.com/package/@tanstack/intent) discovers skills from the packages installed in a project.
In a project with `@lminii/material-react-table` installed, an agent (or you) can list and load them:

```bash
npx @tanstack/intent@latest list
npx @tanstack/intent@latest load @lminii/material-react-table#getting-started
```

Run `npx @tanstack/intent@latest install` once to add the discovery instructions to your `AGENTS.md` or `CLAUDE.md`.
After that the agent runs the `list` and `load` commands on its own before editing table code.
The TanStack Table V9 packages ship skills the same way, and the `requires` field in each `SKILL.md` points at the TanStack skills a feature builds on.

### Skills CLI

Any harness that reads `SKILL.md` files can install this folder straight from GitHub with the [skills CLI](https://github.com/vercel-labs/skills).
Pick the command for your agent.

| Agent | Command |
| --- | --- |
| Claude Code | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a claude-code` |
| Cursor | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a cursor` |
| Codex | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a codex` |
| GitHub Copilot | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a github-copilot` |
| Gemini CLI | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a gemini-cli` |
| Windsurf | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a windsurf` |
| OpenCode | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a opencode` |
| Cline | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a cline` |
| Several agents | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a claude-code -a cursor` |
| Every detected agent | `npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills --all` |

The CLI supports many more agents, including Amp, Antigravity, Augment, Continue, Devin, Droid, Goose, Junie, Kilo Code, Kiro, OpenHands, Qwen Code, Roo Code, Trae, and Zed.
The full list of `-a` values is in the [Supported Agents](https://github.com/vercel-labs/skills#supported-agents) table.

### MCP Server

The [`@lminii/material-react-table-mcp`](https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table-mcp) server bundles a copy of these skills.
Its `get_mrt_skill` tool lists them or returns one by name, and `search_mrt_docs` searches them alongside the guides and examples.

```bash
claude mcp add material-react-table -- npx -y @lminii/material-react-table-mcp
```

## File Format

Each `SKILL.md` starts with YAML frontmatter.

- `name` and `description` are what Intent and the skills CLI show when listing, so the description says both what the skill covers and when to load it.
- `metadata` records the library and version the skill was written against.
- `requires` lists TanStack skills (for example `@tanstack/table-core#core`) that should be loaded alongside it.
- `sources` lists the docs pages in this repository the skill was distilled from, so a change to those pages is a cue to update the skill.

The body is plain Markdown that an agent reads in full, so it stays focused on the API, the recommended patterns, and the mistakes to avoid.
