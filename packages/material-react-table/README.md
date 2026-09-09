# Material React Table V4

A maintained fork of [KevinVandy/material-react-table](https://github.com/KevinVandy/material-react-table), published as `@lminii/material-react-table`, that tracks the latest Material UI and TanStack Table releases.

View [Documentation](https://material-react-table.minii.dev/)

<a href="https://npmjs.com/package/@lminii/material-react-table" target="_blank">
  <img alt="" src="https://badgen.net/npm/v/@lminii/material-react-table?color=blue" />
</a>
<a href="https://npmtrends.com/@lminii/material-react-table" target="_blank">
  <img alt="" src="https://badgen.net/npm/dt/@lminii/material-react-table?label=installs&icon=npm&color=blue" />
</a>
<a href="https://bundlephobia.com/result?p=@lminii/material-react-table" target="_blank">
  <img alt="" src="https://badgen.net/bundlephobia/minzip/@lminii/material-react-table@latest?color=blue" />
</a>
<a href="https://star-history.com/#lminii/material-react-table&Date" target="_blank">
  <img alt="" src="https://badgen.net/github/stars/lminii/material-react-table?color=blue" />
</a>
<a href="https://github.com/lminii/material-react-table/blob/v4/LICENSE" target="_blank">
  <img alt="" src="https://badgen.net/github/license/lminii/material-react-table?color=blue" />
</a>
<a
  href="https://discord.gg/5wqyRx6fnm"
  target="_blank"
  rel="noopener"
>
  <img alt="" src="https://dcbadge.vercel.app/api/server/5wqyRx6fnm?style=flat">
</a>

## About

### _Quickly Create React Data Tables with Material Design_

### **Built with [Material UI <sup>V9</sup>](https://mui.com) and [TanStack Table <sup>V9</sup>](https://tanstack.com/table/v9)**

<img src="https://material-react-table.minii.dev/banner.png" alt="MRT" height="50" />

> Want to use Mantine instead of Material UI? Check out [Mantine React Table](https://www.mantine-react-table.com)

## Learn More

- Join the [Discord](https://discord.gg/5wqyRx6fnm) server to join in on the development discussion or ask questions
- View the [Docs Website](https://material-react-table.minii.dev/)
- See all [Props, Options, APIs, Components, and Hooks](https://material-react-table.minii.dev/docs/api)

### Quick Examples

- [Basic Table](https://material-react-table.minii.dev/docs/examples/basic/) (See Default Features)
- [Minimal Table](https://material-react-table.minii.dev/docs/examples/minimal/) (Turn off Features like Pagination, Sorting, Filtering, and Toolbars)
- [Advanced Table](https://material-react-table.minii.dev/docs/examples/advanced/) (See some of the Advanced Features)
- [Custom Headless Table](https://material-react-table.minii.dev/docs/examples/custom-headless/) (Build your own table markup)
- [Dragging / Ordering Examples](https://material-react-table.minii.dev/docs/examples/column-ordering/) (Drag and Drop)
- [Editing (CRUD) Examples](https://material-react-table.minii.dev/docs/examples/editing-crud/) (Create, Edit, and Delete Rows)
- [Expanding / Grouping Examples](https://material-react-table.minii.dev/docs/examples/aggregation-and-grouping/) (Sum, Average, Count, etc.)
- [Filtering Examples](https://material-react-table.minii.dev/docs/examples/filter-variants/) (Faceted Values, Switching Filters, etc.)
- [Sticky Pinning Examples](https://material-react-table.minii.dev/docs/examples/sticky-header/) (Sticky Headers, Sticky Columns, Sticky Rows, etc.)
- [Remote Data Fetching Examples](https://material-react-table.minii.dev/docs/examples/react-query/) (Server-side Pagination, Sorting, and Filtering)
- [Virtualized Examples](https://material-react-table.minii.dev/docs/examples/virtualized/) (10,000 rows at once!)
- [Infinite Scrolling](https://material-react-table.minii.dev/docs/examples/infinite-scrolling/) (Fetch data as you scroll)
- [Localization (i18n)](https://material-react-table.minii.dev/docs/guides/localization#built-in-locale-examples) (Over a dozen languages built-in)

View additional [storybook examples](https://www.material-react-table.dev/)

## Features

_All features can easily be enabled/disabled_

_**Fully Fleshed out [Docs](https://material-react-table.minii.dev/docs/guides#guides) are available for all features**_

- [x] 30-56kb gzipped - [Bundlephobia](https://bundlephobia.com/package/@lminii/material-react-table)
- [x] Advanced TypeScript Generics Support (TypeScript Optional)
- [x] Aggregation and Grouping (Sum, Average, Count, etc.)
- [x] Cell Actions (Right-click Context Menu)
- [x] Click To Copy Cell Values
- [x] Column Action Dropdown Menu
- [x] Column Hiding
- [x] Column Ordering via Drag'n'Drop
- [x] Column Pinning (Freeze Columns)
- [x] Column Resizing
- [x] Customize Icons
- [x] Customize Styling of internal Mui Components
- [x] Data Editing and Creating (5 different editing modes)
- [x] Density Toggle
- [x] Detail Panels (Expansion)
- [x] Faceted Value Generation for Filter Options
- [x] Filtering (supports client-side and server-side)
- [x] Filter Match Highlighting
- [x] Full Screen Mode
- [x] Global Filtering (Search across all columns, rank by best match)
- [x] Header Groups & Footers
- [x] Localization (i18n) support
- [x] Manage your own state or let the table manage it internally for you
- [x] Pagination (supports client-side and server-side)
- [x] Row Actions (Your Custom Action Buttons)
- [x] Row Numbers
- [x] Row Ordering via Drag'n'Drop
- [x] Row Pinning
- [x] Row Selection (Checkboxes)
- [x] SSR compatible
- [x] Sorting (supports client-side and server-side)
- [x] Theming (Respects your Material UI Theme)
- [x] Toolbars (Add your own action buttons)
- [x] Tree Data / Expanding Sub-rows
- [x] Virtualization (@tanstack/react-virtual)

## Getting Started

### Installation

View the full [Installation Docs](https://material-react-table.minii.dev/docs/getting-started/install)

1. Ensure that you have React 18 or later installed

2. Install Peer Dependencies (Material UI V9)

```bash
npm install @mui/material @mui/x-date-pickers @mui/icons-material @emotion/react @emotion/styled
```

3. Install @lminii/material-react-table

```bash
npm install @lminii/material-react-table
```

> _`@tanstack/react-table`, `@tanstack/react-virtual`, and `@tanstack/match-sorter-utils`_ are internal dependencies, so you do NOT need to install them yourself.

### Usage

> Read the full usage docs [here](https://material-react-table.minii.dev/docs/getting-started/usage/)

```jsx
import { useMemo, useState, useEffect } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from '@lminii/material-react-table';

//data must be stable reference (useState, useMemo, useQuery, defined outside of component, etc.)
const data = [
  {
    name: 'John',
    age: 30,
  },
  {
    name: 'Sara',
    age: 25,
  },
];

export default function App() {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', //simple recommended way to define a column
        header: 'Name',
        muiTableHeadCellProps: { sx: { color: 'green' } }, //optional custom props
        Cell: ({ cell }) => <span>{cell.getValue()}</span>, //optional custom cell render
      },
      {
        accessorFn: (row) => row.age, //alternate way
        id: 'age', //id required if you use accessorFn instead of accessorKey
        header: 'Age',
        Header: () => <i>Age</i>, //optional custom header render
      },
    ],
    [],
  );

  //optionally, you can manage any/all of the table state yourself
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    //do something when the row selection changes
  }, [rowSelection]);

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnOrdering: true, //enable some features
    enableRowSelection: true,
    enablePagination: false, //disable a default feature
    onRowSelectionChange: setRowSelection, //hoist internal state to your own state (optional)
    state: { rowSelection }, //manage your own state, pass it back to the table (optional)
  });

  const someEventHandler = () => {
    //read the table state during an event from the table instance
    console.log(table.getState().sorting);
  };

  return (
    <MaterialReactTable table={table} /> //other more lightweight MRT sub components also available
  );
}
```

_Open in [Code Sandbox](https://codesandbox.io/s/simple-material-react-table-example-t5c3ji)_

## AI Agents

The package ships [TanStack Intent](https://www.npmjs.com/package/@tanstack/intent) skills that teach coding agents the MRT API, the `table` prop pattern, customization, state management, editing, filtering, virtualization, localization, drag and drop ordering, and the V3 to V4 migration.
In a project with `@lminii/material-react-table` installed:

```bash
npx @tanstack/intent@latest list
npx @tanstack/intent@latest load @lminii/material-react-table#getting-started
```

The skills follow the Agent Skills `SKILL.md` format, so any harness can install them from the repository with the [skills CLI](https://github.com/vercel-labs/skills) (pass `-a codex`, `-a cursor`, `--all`, or another agent):

```bash
npx skills add https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table/skills -a claude-code
```

For exact option lookups, the feature guides, and the source of every docs example, add the MCP server [`@lminii/material-react-table-mcp`](https://github.com/lminii/material-react-table/tree/v4/packages/material-react-table-mcp):

```bash
claude mcp add material-react-table -- npx -y @lminii/material-react-table-mcp
```

The [AI Agents](https://material-react-table.minii.dev/docs/getting-started/ai-agents) docs page covers every tool and install path.

## Contributors

<a href="https://github.com/lminii/material-react-table/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=lminii/material-react-table" />
</a>

PRs are Welcome, but please discuss in [GitHub Issues](https://github.com/lminii/material-react-table/issues) or the [Discord Server](https://discord.gg/5wqyRx6fnm) first if it is a large change!

Read the [Contributing Guide](https://github.com/lminii/material-react-table/blob/v4/CONTRIBUTING.md) to learn how to run this project locally.

<!-- Use the FORCE, Luke! -->
