---
name: virtualization
description: >
  Render thousands of rows or hundreds of columns in Material React Table V4 with enableRowVirtualization and enableColumnVirtualization, tune rowVirtualizerOptions and columnVirtualizerOptions (overscan, estimateSize), reach the TanStack Virtual instance through rowVirtualizerInstanceRef for scrollToIndex, and understand the automatic layoutMode grid and sticky header. Load for large unpaginated tables, infinite scroll, scroll-to-row, jumpy scrolling, or headless virtualization with useMRT_RowVirtualizer.
metadata:
  type: framework
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - getting-started
sources:
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/virtualization.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/enable-row-virtualization/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:packages/material-react-table/src/hooks/useMRT_RowVirtualizer.ts'
  - 'lminii/material-react-table:packages/material-react-table/src/hooks/useMRT_TableOptions.ts'
  - 'lminii/material-react-table:packages/material-react-table/src/types.ts'
---

This skill builds on `getting-started`. MRT wraps `@tanstack/react-virtual` so only the rows and columns inside the scroll container render. Enable it when a table shows more than about 50 rows without pagination or more than about a dozen columns; below that it adds overhead without benefit.

## Setup

```tsx
const table = useMaterialReactTable({
  columns,
  data, // 10,000 rows
  enablePagination: false,
  enableRowVirtualization: true,
  enableColumnVirtualization: true, // only with many columns
  muiTableContainerProps: { sx: { maxHeight: '600px' } },
  rowVirtualizerOptions: { overscan: 5 },
  columnVirtualizerOptions: { overscan: 2 },
})
```

Row virtualization sets `enableStickyHeader` to true and, unless `layoutMode` was given, switches `layoutMode` to `'grid'`, so the table renders with CSS grid and flexbox instead of semantic table layout. The container needs a bounded height for scrolling; the sticky header default caps it at 100vh, and `muiTableContainerProps.sx.maxHeight` sets a tighter one.

## Core Patterns

### Tune the virtualizer

```tsx
rowVirtualizerOptions: ({ table }) => ({
  overscan: 10,
  estimateSize: () => (table.getState().density === 'compact' ? 37 : 73),
}),
columnVirtualizerOptions: { overscan: 3, estimateSize: () => 200 },
```

Both options accept an object or a callback receiving `table`, and both are `Partial<VirtualizerOptions>` from TanStack Virtual. MRT already estimates row height from the density (37, 58, or 73 px) and measures rendered rows, sets `overscan: 4`, and keeps a dragging row mounted; anything you pass merges over those defaults. Raise `overscan` if fast scrolling shows blank rows, and set `estimateSize` when rows or columns are far from the defaults so the scrollbar length is accurate.

### Reach the virtualizer instance

```tsx
const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null)
const [sorting, setSorting] = useState<MRT_SortingState>([])

useEffect(() => {
  rowVirtualizerInstanceRef.current?.scrollToIndex?.(0) // back to top when sorting changes
}, [sorting])

const table = useMaterialReactTable({
  columns,
  data,
  enablePagination: false,
  enableRowVirtualization: true,
  rowVirtualizerInstanceRef,
  state: { sorting },
  onSortingChange: setSorting,
})
```

`MRT_RowVirtualizer` and `MRT_ColumnVirtualizer` are the TanStack `Virtualizer` plus `virtualRows` or `virtualColumns`, so `scrollToIndex`, `scrollToOffset`, `measure`, and `getVirtualItems` are available. `columnVirtualizerInstanceRef` is the column counterpart.

### Infinite scroll on the container

```tsx
const tableContainerRef = useRef<HTMLDivElement>(null)

const table = useMaterialReactTable({
  columns,
  data: flatRows,
  enablePagination: false,
  enableRowVirtualization: true,
  manualFiltering: true,
  manualSorting: true,
  muiTableContainerProps: {
    ref: tableContainerRef,
    sx: { maxHeight: '600px' },
    onScroll: (event) => {
      const { scrollHeight, scrollTop, clientHeight } = event.currentTarget
      if (scrollHeight - scrollTop - clientHeight < 400 && !isFetching && hasNextPage) fetchNextPage()
    },
  },
  renderBottomToolbarCustomActions: () => <Typography>Fetched {flatRows.length} of {totalRowCount} rows</Typography>,
  state: { isLoading, showProgressBars: isFetching },
})
```

Virtualization keeps the DOM small while the fetched array grows. Server-side sorting and filtering options are covered in `state-and-server-data`.

### Headless virtualization

```tsx
import { useMRT_Rows, useMRT_RowVirtualizer, useMRT_ColumnVirtualizer } from '@lminii/material-react-table'

const rows = useMRT_Rows(table)
const rowVirtualizer = useMRT_RowVirtualizer(table)
const columnVirtualizer = useMRT_ColumnVirtualizer(table)

rowVirtualizer?.virtualRows.map((virtualRow) => {
  const row = rows[virtualRow.index]
  return <MyRow key={row.id} row={row} style={{ transform: `translateY(${virtualRow.start}px)` }} />
})
```

The hooks return `undefined` when the matching `enable*Virtualization` option is off. They read the scroll element from `table.refs.tableContainerRef`, so a custom layout must attach that ref to its scroll container.

## Common Mistakes

### HIGH Enabling virtualization conditionally

Wrong:

```tsx
enableRowVirtualization: data.length > 100,
```

Correct:

```tsx
enableRowVirtualization: true, // decide once per table, not per render
```

The virtualizer hooks run only when enabled, so toggling the option at runtime changes the hook order and breaks React's rules of hooks; it also flips `layoutMode`, which re-lays out every cell.

Source: `docs/guides/virtualization.mdx`

### HIGH Leaving pagination on

Wrong:

```tsx
enableRowVirtualization: true,
```

Correct:

```tsx
enableRowVirtualization: true,
enablePagination: false,
```

With pagination on, only one page of rows exists to virtualize, so the table still renders 10 rows and the user pages through 10,000.

Source: `docs/guides/virtualization.mdx`

### MEDIUM Expecting semantic table CSS to keep working

Wrong:

```tsx
enableRowVirtualization: true,
muiTableBodyCellProps: { sx: { width: '20%' } }, // percentage widths ignored in grid layout
```

Correct:

```tsx
enableRowVirtualization: true,
columns: [{ accessorKey: 'email', header: 'Email', size: 300, grow: false }],
```

Virtualization forces `layoutMode: 'grid'`, where column widths come from `size`, `minSize`, `maxSize`, and `grow`, not from table-layout CSS.

Source: `packages/material-react-table/src/hooks/useMRT_TableOptions.ts`

### MEDIUM Detail panels with a fixed row estimate

Wrong:

```tsx
enableRowVirtualization: true,
renderDetailPanel: ({ row }) => <Details row={row} />,
rowVirtualizerOptions: { estimateSize: () => 50 },
```

Correct:

```tsx
enableRowVirtualization: true,
renderDetailPanel: ({ row }) => <Details row={row} />,
// keep MRT's estimate: it counts two virtual items per row and sizes the panel item from the expanded state
```

With a detail panel MRT virtualizes two items per row (row and panel) and estimates the panel at 0 or 100 px depending on expansion. A flat `estimateSize` breaks the scrollbar and item positions.

Source: `packages/material-react-table/src/hooks/useMRT_RowVirtualizer.ts`

## API Discovery

Search `node_modules/@lminii/material-react-table/dist/index.d.ts` for `Virtualizer` to find `MRT_RowVirtualizer`, `MRT_ColumnVirtualizer`, `MRT_VirtualizerOptions`, and `MRT_VirtualItem`. The TanStack Virtual docs at `https://tanstack.com/virtual/v3/docs/api/virtualizer` list every option and instance method. The Virtualization guide at `/docs/guides/virtualization` and the examples `/docs/examples/virtualized`, `enable-row-virtualization`, `enable-column-virtualization`, `enable-detail-panel-virtualized`, and `infinite-scrolling` show the patterns above.
