---
name: migrate-v3-to-v4
description: >
  Migrate an application from material-react-table V3 to @lminii/material-react-table V4: switch the package and imports, upgrade Material UI and X Date Pickers to V9, move text field props to slotProps, and apply every TanStack Table V9 rename and behaviour change (column pinning start/end, columnResizing, sortFn, getPaginatedRowModel, rowSelection true values, removed getCoreRowModel options and onStateChange). Load for migration plans, implementation, or audits of a V3 codebase.
metadata:
  type: lifecycle
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - getting-started
sources:
  - 'lminii/material-react-table:MIGRATION.md'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/getting-started/migrating-to-v4.mdx'
  - 'lminii/material-react-table:packages/material-react-table/src/types.ts'
  - 'lminii/material-react-table:packages/material-react-table/src/hooks/useMRT_TableOptions.ts'
---

This skill builds on `getting-started`. V4 keeps the V3 API: `useMaterialReactTable`, the `table` prop, every `mui*Props`, `render*`, and `enable*` option. Breaking changes come from three sources only: the package rename, Material UI V9, and TanStack Table V9. Do them in that order.

## Setup

```bash
npx @mui/codemod@latest v9.0.0/system-props src
npx @mui/codemod@latest deprecations/all src
npm uninstall material-react-table
npm install @lminii/material-react-table @mui/material@^9 @mui/icons-material@^9 @mui/x-date-pickers@^9
```

Then rewrite imports:

```diff
-import { MaterialReactTable } from 'material-react-table';
-import { MRT_Localization_DE } from 'material-react-table/locales/de';
+import { MaterialReactTable } from '@lminii/material-react-table';
+import { MRT_Localization_DE } from '@lminii/material-react-table/locales/de';
```

Peer floors are `@mui/material`, `@mui/icons-material`, and `@mui/x-date-pickers` at 9.0 or newer; React 18 and Emotion 11.13 are unchanged. Node 22.12 or newer is required for the CommonJS build.

## Core Patterns

### Renames from TanStack Table V9

Each of these is a find and replace across the codebase:

| V3 | V4 |
| --- | --- |
| `columnPinning: { left, right }` | `columnPinning: { start, end }` |
| `column.pin('left')`, `getIsPinned() === 'left'` | `column.pin('start')`, `getIsPinned() === 'start'` |
| `table.getLeftLeafColumns()`, `getRight*`, `row.getLeftVisibleCells()` | `getStartLeafColumns()`, `getEnd*`, `row.getStartVisibleCells()` |
| `columnSizingInfo`, `onColumnSizingInfoChange`, `setColumnSizingInfo` | `columnResizing`, `onColumnResizingChange`, `setColumnResizing` |
| `sortingFn`, `sortingFns`, `column.getSortingFn()` | `sortFn`, `sortFns`, `column.getSortFn()` |
| `table.getPrePaginationRowModel()`, `getPaginationRowModel()` | `getPrePaginatedRowModel()`, `getPaginatedRowModel()` |
| `column.getAggregationFn()` | `column.getAggregationFns()` |
| `MRT_SortingFn`, `MRT_ColumnSizingInfoState` | `MRT_SortFn`, `MRT_ColumnResizingState` (old names remain as deprecated aliases) |

### Behaviour changes to audit

- `rowSelection` values are `true`, never `false`. Deselect by deleting the key.
- `rowPinning` needs both `top` and `bottom`; `columnPinning` needs both `start` and `end` when passed through `initialState` or `state`.
- `table.getIsSomeRowsSelected()` is `true` when all rows are selected. Indeterminate is `getIsSomeRowsSelected() && !getIsAllRowsSelected()`.
- A custom `aggregationFn` is `{ aggregate: (context) => value }`, not a callable. Built-in names still work.
- `getCoreRowModel`, `getFilteredRowModel`, `getSortedRowModel`, `getPaginationRowModel`, `getExpandedRowModel`, `getGroupedRowModel`, and `getFaceted*` options are gone; the models are always registered. Use `manual*` to take over a stage.
- Rows with `renderDetailPanel` report `row.getCanExpand()` as `true`. Pass `getRowCanExpand` to restrict it.
- `onStateChange` and `table.setState()` are gone. Control slices individually.
- `table.getState()` still returns the full state; `table.state` is reactive in render code.
- Pinned cells use `insetInlineStart` and `insetInlineEnd`, so RTL pins to the logical start and end.

### Material UI V9 changes inside MRT options

```diff
 muiFilterTextFieldProps: {
-  InputProps: { sx: { minWidth: 120 } },
+  slotProps: { input: { sx: { minWidth: 120 } } },
 },
-const pickerProps: DatePickerProps<Dayjs> = { ... };
+const pickerProps: DatePickerProps = { ... };
```

`muiFilterDatePickerProps`, `muiFilterDateTimePickerProps`, and `muiFilterTimePickerProps` are no longer generic, and the filter pickers render `PickersTextField`, so a custom `slots.textField` must accept `PickersTextFieldProps`. Everything else in `mui*Props` passes straight to Material UI, so Material UI's own V7 and V9 notes apply.

### Package entry points

The package ships an `exports` map with `.mjs` and `.js` builds. Only `@lminii/material-react-table`, `@lminii/material-react-table/locales/<code>`, and `@lminii/material-react-table/package.json` resolve; deep imports into `dist/` or `src/` fail at build time and must be replaced with root exports.

## Common Mistakes

### HIGH Keeping v8 pinning literals

Wrong:

```tsx
initialState: { columnPinning: { left: ['mrt-row-select'], right: ['mrt-row-actions'] } }
```

Correct:

```tsx
initialState: { columnPinning: { start: ['mrt-row-select'], end: ['mrt-row-actions'] } }
```

`left` and `right` are no longer valid keys, so the pinning state is silently empty.

Source: `MIGRATION.md`

### HIGH Passing row model factories

Wrong:

```tsx
useMaterialReactTable({ columns, data, getSortedRowModel: getSortedRowModel() })
```

Correct:

```tsx
useMaterialReactTable({ columns, data })
```

The options no longer exist in `MRT_TableOptions`; MRT registers every row model itself.

Source: `packages/material-react-table/src/features/mrtFeatures.ts`

### MEDIUM Treating the migration as a TanStack useTable rewrite

Wrong:

```tsx
const table = useTable({ features: tableFeatures({ rowSortingFeature }), columns, data })
```

Correct:

```tsx
const table = useMaterialReactTable({ columns, data })
```

The `@tanstack/react-table#migrate-v8-to-v9` skill describes migrating a headless table. MRT applications stay on `useMaterialReactTable`; only the renamed instance methods and state shapes from that skill apply.

Source: `MIGRATION.md`

### LOW Deep-importing a locale file

Wrong:

```tsx
import { MRT_Localization_FR } from '@lminii/material-react-table/dist/locales/fr'
```

Correct:

```tsx
import { MRT_Localization_FR } from '@lminii/material-react-table/locales/fr'
```

Source: `packages/material-react-table/package.json` exports map

## API Discovery

Compare `node_modules/@lminii/material-react-table/dist/index.d.ts` against the V3 declarations for renamed members; the deprecated `MRT_SortingFn` and `MRT_ColumnSizingInfoState` aliases carry JSDoc pointing to the new names. The full guide with tables is at `/docs/getting-started/migrating-to-v4`.
