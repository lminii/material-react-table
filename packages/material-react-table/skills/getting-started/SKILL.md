---
name: getting-started
description: >
  Build a Material React Table V4 with useMaterialReactTable and the MaterialReactTable table prop: install @lminii/material-react-table with Material UI V9 peers, define stable data and MRT_ColumnDef columns, toggle features with enable* options, and read the instance. Load for a first MRT table, a Material UI data grid on TanStack Table V9, or when a TanStack useTable or upstream material-react-table example is producing the wrong setup.
metadata:
  type: framework
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - '@tanstack/table-core#core'
sources:
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/getting-started/install.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/getting-started/usage.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/best-practices.mdx'
  - 'lminii/material-react-table:packages/material-react-table/src/hooks/useMaterialReactTable.ts'
  - 'lminii/material-react-table:packages/material-react-table/src/types.ts'
---

This skill builds on `@tanstack/table-core#core` for the headless model and stable inputs. Material React Table (MRT) owns the TanStack Table instance, feature registration, and all Material UI rendering. Application code never calls `useTable` or `tableFeatures`; it configures MRT options and renders MRT components.

## Setup

```bash
npm install @lminii/material-react-table @mui/material@^9 @mui/icons-material@^9 @mui/x-date-pickers@^9 @emotion/react @emotion/styled
```

Do not install `@tanstack/react-table`; MRT pins its own exact version. Node 22.12 or newer is required for the CommonJS build because TanStack Table V9 is ESM-only.

```tsx
import { useMemo } from 'react'
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from '@lminii/material-react-table'

type Person = { name: string; age: number }

const data: Person[] = [
  { name: 'Ada', age: 36 },
  { name: 'Grace', age: 45 },
]

export function PeopleTable() {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'age', header: 'Age' },
    ],
    [],
  )

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: true,
  })

  return <MaterialReactTable table={table} />
}
```

`useMaterialReactTable(options)` returns an `MRT_TableInstance<TData>`. Every MRT component takes that instance through a `table` prop; nothing is passed through React context.

## Core Patterns

### Accessors return primitives, renders return markup

```tsx
const columns: MRT_ColumnDef<Person>[] = [
  {
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: 'fullName',
    header: 'Name',
    Cell: ({ cell, row }) => (
      <a href={row.original.profileUrl}>{cell.getValue<string>()}</a>
    ),
  },
]
```

`accessorKey` or `accessorFn` feeds sorting, filtering, grouping, and search, so it must return a string, number, boolean, or Date. `Cell`, `Header`, `Footer`, `Edit`, `Filter`, `AggregatedCell`, and `GroupedCell` are the render slots. An `accessorFn` column needs an explicit `id`.

### Infer column types with createMRTColumnHelper

```tsx
import { createMRTColumnHelper } from '@lminii/material-react-table'

const helper = createMRTColumnHelper<Person>()
const columns = [
  helper.accessor('name', { header: 'Name' }),
  helper.accessor((row) => row.age, {
    id: 'age',
    header: 'Age',
    Cell: ({ cell }) => cell.getValue().toLocaleString(), // typed number
  }),
  helper.display({ id: 'actions', header: 'Actions' }),
]
```

### Toggle features with enable* options

Table-level `enable*` options switch a feature on for every column; the same option on a column definition overrides it for that column. `enableColumnFilters`, `enableSorting`, `enablePagination`, `enableGlobalFilter`, `enableColumnActions`, `enableDensityToggle`, `enableFullScreenToggle`, `enableHiding`, and `enableTopToolbar` are on by default. Row selection, editing, grouping, pinning, ordering, expanding, virtualization, and row actions are off until enabled.

```tsx
const table = useMaterialReactTable({
  columns,
  data,
  enableColumnOrdering: true,
  enableColumnPinning: true,
  enableGrouping: true,
  enablePagination: false,
  renderDetailPanel: ({ row }) => <pre>{JSON.stringify(row.original)}</pre>,
})
```

### Read the instance where you need it

```tsx
const selectedRows = table.getSelectedRowModel().rows
const { pagination, sorting } = table.getState()
table.resetRowSelection()
```

`table.getState()` returns the full MRT state, including MRT-only slices such as `density`, `isFullScreen`, and `showColumnFilters`. Inside render code `table.state` is the reactive equivalent.

## Common Mistakes

### HIGH Building the table with TanStack hooks

Wrong:

```tsx
const table = useTable({ features, columns, data })
return <MaterialReactTable table={table} />
```

Correct:

```tsx
const table = useMaterialReactTable({ columns, data })
return <MaterialReactTable table={table} />
```

`MaterialReactTable` needs the MRT instance, which registers MRT's features, display columns, localization, icons, and Material UI props. A bare TanStack instance lacks all of them.

Source: `packages/material-react-table/src/hooks/useMaterialReactTable.ts`

### HIGH Unstable data or columns

Wrong:

```tsx
const table = useMaterialReactTable({
  columns: [{ accessorKey: 'name', header: 'Name' }],
  data: response.data ?? [],
})
```

Correct:

```tsx
const columns = useMemo<MRT_ColumnDef<Person>[]>(() => [...], [])
const EMPTY: Person[] = []
const table = useMaterialReactTable({ columns, data: response.data ?? EMPTY })
```

A new array each render invalidates every row model and can loop forever. Keep `columns` and `data` in `useMemo`, `useState`, module scope, or a query cache.

Source: `docs/getting-started/usage.mdx`

### MEDIUM Mixing the upstream and fork package names

Wrong:

```tsx
import { MaterialReactTable } from 'material-react-table'
import { MRT_Localization_DE } from '@lminii/material-react-table/locales/de'
```

Correct:

```tsx
import { MaterialReactTable } from '@lminii/material-react-table'
import { MRT_Localization_DE } from '@lminii/material-react-table/locales/de'
```

Two copies of MRT produce two `MRT_TableInstance` types and duplicate Emotion styles. Pick the fork everywhere, or alias `material-react-table` to it in `package.json`.

Source: `MIGRATION.md`

### MEDIUM Returning JSX from an accessor

Wrong:

```tsx
{ accessorFn: (row) => <b>{row.name}</b>, id: 'name', header: 'Name' }
```

Correct:

```tsx
{ accessorKey: 'name', header: 'Name', Cell: ({ cell }) => <b>{cell.getValue<string>()}</b> }
```

Sorting, filtering, and global search compare accessor values, so JSX breaks all three.

Source: `docs/getting-started/usage.mdx`

## API Discovery

Read `node_modules/@lminii/material-react-table/dist/index.d.ts` for `MRT_TableOptions`, `MRT_ColumnDef`, `MRT_TableInstance`, and `MRT_TableState`; the `mui*Props`, `render*`, `enable*`, and `on*Change` option families are all declared there with JSDoc. The docs prop tables at `/docs/api/table-options`, `/docs/api/column-options`, and `/docs/api/state-options` list every option with its default and source library.
