---
name: composable-components
description: >
  Compose a custom Material React Table V4 layout from exported MRT_* components that all take the same table prop: MRT_TablePaper, MRT_TableContainer, MRT_Table, MRT_TopToolbar, MRT_TablePagination, MRT_GlobalFilterTextField, MRT_ToolbarInternalButtons, MRT_ShowHideColumnsButton, and MRT_TableBodyCellValue for fully custom markup. Load for tables inside cards or dialogs, toolbars placed outside the table, split layouts, or headless rendering with MRT state.
metadata:
  type: framework
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - getting-started
sources:
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/api/mrt-components.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/custom-headless/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/custom-top-toolbar/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/external-toolbar/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:packages/material-react-table/src/index.ts'
---

This skill builds on `getting-started`. `MaterialReactTable` is a thin composition of exported sub-components. Because every sub-component takes the same `table` instance as a prop, you can render any subset of them anywhere in your tree while MRT keeps managing state.

## Setup

```tsx
import {
  MRT_GlobalFilterTextField,
  MRT_TableContainer,
  MRT_TablePagination,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from '@lminii/material-react-table'

const table = useMaterialReactTable({ columns, data, enableBottomToolbar: false })

return (
  <Card>
    <CardHeader
      title="People"
      action={
        <Stack direction="row" gap={1}>
          <MRT_GlobalFilterTextField table={table} />
          <MRT_ToggleFiltersButton table={table} />
        </Stack>
      }
    />
    <MRT_TableContainer table={table} />
    <CardActions sx={{ justifyContent: 'flex-end' }}>
      <MRT_TablePagination table={table} />
    </CardActions>
  </Card>
)
```

`MRT_TableContainer` renders the scroll container, the table, the loading overlay, the edit row modal, and the cell action menu. Turn off the built-in toolbars with `enableTopToolbar` and `enableBottomToolbar` when you place their pieces elsewhere.

## Core Patterns

### Layers of the default component

```text
MRT_TablePaper
  MRT_TopToolbar
    MRT_GlobalFilterTextField, MRT_ToolbarInternalButtons, MRT_ToolbarAlertBanner, MRT_TablePagination
  MRT_TableContainer
    MRT_Table
      MRT_TableHead > MRT_TableHeadRow > MRT_TableHeadCell
      MRT_TableBody > MRT_TableBodyRow > MRT_TableBodyCell, MRT_TableDetailPanel
      MRT_TableFooter > MRT_TableFooterRow > MRT_TableFooterCell
  MRT_BottomToolbar
```

Start from the layer just above what you need to change. Replacing `MRT_TopToolbar` with your own component is the most common cut; replacing `MRT_TableBodyRow` is rarely worth it because `muiTableBodyRowProps` covers styling and events.

### Toolbar buttons are individual exports

```tsx
import {
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
} from '@lminii/material-react-table'

<MRT_ShowHideColumnsButton table={table} />
<MRT_ToggleDensePaddingButton table={table} />
<MRT_ToggleFullScreenButton table={table} />
```

Each button reads and writes MRT state on the shared instance, so it works from any position in the tree.

### Fully custom markup with MRT_TableBodyCellValue

```tsx
import { MRT_TableBodyCellValue, flexRender } from '@lminii/material-react-table'

<Table>
  <TableHead>
    {table.getHeaderGroups().map((group) => (
      <TableRow key={group.id}>
        {group.headers.map((header) => (
          <TableCell key={header.id}>
            {header.isPlaceholder ? null : flexRender(header.column.columnDef.Header ?? header.column.columnDef.header, header.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableHead>
  <TableBody>
    {table.getRowModel().rows.map((row, staticRowIndex) => (
      <TableRow key={row.id} selected={row.getIsSelected()}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            <MRT_TableBodyCellValue cell={cell} table={table} staticRowIndex={staticRowIndex} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

`MRT_TableBodyCellValue` applies the column's `Cell`, `AggregatedCell`, `GroupedCell`, filter match highlighting, and click to copy, so custom markup keeps MRT cell behaviour. `table.getRowModel()` is the final model after filtering, sorting, grouping, expanding, and pagination.

### Row virtualization in custom layouts

Render `MRT_TableContainer` rather than `MRT_Table` when `enableRowVirtualization` or `enableColumnVirtualization` is on. The container owns the scroll element the virtualizers measure.

## Common Mistakes

### HIGH Rendering MRT components without the table prop

Wrong:

```tsx
<MRT_TablePagination />
```

Correct:

```tsx
<MRT_TablePagination table={table} />
```

MRT does not use React context. Every component requires the instance explicitly.

Source: `packages/material-react-table/src/components/toolbar/MRT_TablePagination.tsx`

### MEDIUM Duplicating the toolbar

Wrong:

```tsx
const table = useMaterialReactTable({ columns, data })
<MRT_GlobalFilterTextField table={table} />
<MaterialReactTable table={table} />
```

Correct:

```tsx
const table = useMaterialReactTable({ columns, data, enableTopToolbar: false })
<MRT_GlobalFilterTextField table={table} />
<MaterialReactTable table={table} />
```

The default top toolbar already contains the search field, so two inputs fight over `globalFilter`.

Source: `docs/api/mrt-components.mdx`

### MEDIUM Using a v8 header render

Wrong:

```tsx
flexRender(header.column.columnDef.header, header.getContext())
```

Correct:

```tsx
flexRender(header.column.columnDef.Header ?? header.column.columnDef.header, header.getContext())
```

MRT columns carry both `header` (string) and `Header` (custom render). Falling back to the string alone drops custom header markup.

Source: `apps/material-react-table-docs/examples/custom-headless/sandbox/src/TS.tsx`

## API Discovery

`node_modules/@lminii/material-react-table/dist/index.d.ts` exports every `MRT_*` component with its props interface; all of them include `table: MRT_TableInstance<TData>`. The component tree with links to source is at `/docs/api/mrt-components`.
