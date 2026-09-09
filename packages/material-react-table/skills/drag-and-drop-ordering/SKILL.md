---
name: drag-and-drop-ordering
description: >
  Reorder columns and rows by drag and drop in Material React Table V4: enableColumnOrdering with the columnOrder state and mrt-row-* display column ids, enableRowOrdering with muiRowDragHandleProps onDragEnd reading draggingRow and hoveredRow, enableRowDragging for dropping rows onto other tables or UI, enableColumnDragging for column drags without reordering, and the draggingColumn, hoveredColumn, draggingRow, hoveredRow state. Load for user-arranged columns, sortable lists, moving rows between tables, or a drop that never fires.
metadata:
  type: framework
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - getting-started
  - state-and-server-data
  - '@tanstack/table-core#column-ordering'
sources:
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/column-ordering-dnd.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/row-ordering-dnd.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/enable-row-ordering/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/enable-row-dragging/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:packages/material-react-table/src/components/body/MRT_TableBodyRowGrabHandle.tsx'
  - 'lminii/material-react-table:packages/material-react-table/src/utils/column.utils.ts'
---

This skill builds on `getting-started`, `state-and-server-data`, and `@tanstack/table-core#column-ordering`. MRT uses native HTML drag events with a grab handle button. Column ordering is fully built in; row ordering exposes the drag state and leaves the reorder of `data` to you.

## Setup

```tsx
const table = useMaterialReactTable({
  columns,
  data,
  enableColumnOrdering: true, // drag handles in every header
  enableRowOrdering: true, // adds the mrt-row-drag display column
  enableSorting: false, // manual order and sorting fight each other
  muiRowDragHandleProps: ({ table }) => ({
    onDragEnd: () => {
      const { draggingRow, hoveredRow } = table.getState()
      if (draggingRow && hoveredRow) {
        setData((old) => {
          const next = [...old]
          next.splice(hoveredRow.index!, 0, next.splice(draggingRow.index, 1)[0])
          return next
        })
      }
    },
  }),
})
```

Column-level `enableColumnOrdering: false` removes the handle from one column. `hoveredRow` and `hoveredColumn` are typed as partial objects because a drop target may be a placeholder; read `index` or `id` and guard for undefined.

## Core Patterns

### Set or persist the column order

```tsx
const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>([
  'mrt-row-select',
  'name',
  'email',
  'mrt-row-actions',
])

const table = useMaterialReactTable({
  columns,
  data,
  enableRowSelection: true,
  enableRowActions: true,
  enableColumnOrdering: true,
  state: { columnOrder },
  onColumnOrderChange: setColumnOrder,
})
```

`columnOrder` is an array of column ids (`accessorKey` or `id`). Include the display column ids you enable (`mrt-row-select`, `mrt-row-actions`, `mrt-row-expand`, `mrt-row-numbers`, `mrt-row-drag`, `mrt-row-pin`) at the position you want; missing ones are appended at the start or end. If the array length does not match the column count MRT regenerates it, so `initialState.columnOrder` is enough when you only need a default. A dropped column is also pinned to the target column's pin position.

### Move rows between tables

```tsx
const [draggingRow, setDraggingRow] = useState<MRT_Row<Person> | null>(null)
const [hoveredTable, setHoveredTable] = useState<string | null>(null)

const common = {
  columns,
  enableRowDragging: true, // handle only; no in-table reorder
  onDraggingRowChange: setDraggingRow,
  state: { draggingRow },
}

const table1 = useMaterialReactTable({
  ...common,
  data: data1,
  getRowId: (row) => `t1-${row.id}`,
  muiRowDragHandleProps: {
    onDragEnd: () => {
      if (hoveredTable === 'table-2' && draggingRow) {
        setData2((rows) => [...rows, draggingRow.original])
        setData1((rows) => rows.filter((r) => r !== draggingRow.original))
      }
      setHoveredTable(null)
    },
  },
  muiTablePaperProps: {
    onDragEnter: () => setHoveredTable('table-1'),
    sx: { outline: hoveredTable === 'table-1' ? '2px dashed' : undefined },
  },
})
```

`enableRowDragging` shows the handle and maintains `draggingRow` without the in-table hover targets that `enableRowOrdering` adds. Any element can be a drop target through its own `onDragEnter`. Share `draggingRow` across tables by controlling it. Use `enableColumnDragging` the same way for columns that should be draggable onto external targets, for example a group-by drop zone.

### Style the drag interaction

```tsx
muiRowDragHandleProps: ({ row }) => ({
  'aria-label': `Move ${row.original.name}`,
  sx: { cursor: 'grab' },
}),
muiTableBodyRowProps: ({ row, table }) => ({
  sx: {
    opacity: table.getState().draggingRow?.id === row.id ? 0.5 : 1,
    outline: table.getState().hoveredRow?.id === row.id ? '2px dashed' : undefined,
  },
}),
```

`muiRowDragHandleProps` takes `IconButtonProps`; your `onDragStart` and `onDragEnd` run before MRT sets or clears `draggingRow`. `muiColumnDragHandleProps` is the column counterpart, and `hoveredColumn` / `draggingColumn` drive header styling. Replace the handle icon through `icons.DragHandleIcon`.

### Combine with virtualization

```tsx
enableRowOrdering: true,
enableRowVirtualization: true,
enablePagination: false,
```

The row virtualizer keeps the dragging row mounted while it is scrolled out of view, so drops still resolve. Keep `autoResetPageIndex: false` when paginated so a drop does not jump back to page one.

## Common Mistakes

### HIGH Reordering with the wrong row index

Wrong:

```tsx
onDragEnd: () => {
  const { draggingRow, hoveredRow } = table.getState()
  data.splice(hoveredRow.index, 0, data.splice(draggingRow.index, 1)[0])
  setData(data) // same array reference, no re-render
},
```

Correct:

```tsx
onDragEnd: () => {
  const { draggingRow, hoveredRow } = table.getState()
  if (!draggingRow || hoveredRow?.index === undefined) return
  setData((old) => {
    const next = [...old]
    next.splice(hoveredRow.index!, 0, next.splice(draggingRow.index, 1)[0])
    return next
  })
},
```

`row.index` is the index in the original `data` array, so it is only meaningful when no client-side sort or filter is applied; and a mutated array with the same reference does not trigger a render.

Source: `docs/examples/enable-row-ordering`

### HIGH Expecting a drop callback

Wrong:

```tsx
onHoveredRowChange: (row) => moveRow(row), // fires on every hover, not on drop
```

Correct:

```tsx
muiRowDragHandleProps: { onDragEnd: () => moveRow(table.getState().hoveredRow) },
```

There is no `onRowDrop`; the drop point is the handle's `onDragEnd`, after which MRT clears `draggingRow` and `hoveredRow`.

Source: `packages/material-react-table/src/components/body/MRT_TableBodyRowGrabHandle.tsx`

### MEDIUM Leaving sorting on with row ordering

Wrong:

```tsx
enableRowOrdering: true,
```

Correct:

```tsx
enableRowOrdering: true,
enableSorting: false,
```

A sorted view re-sorts after every drop, so the user's arrangement disappears and `row.index` no longer maps to the visible position.

Source: `docs/guides/row-ordering-dnd.mdx`

### MEDIUM Column order array that ignores display columns

Wrong:

```tsx
initialState: { columnOrder: ['name', 'email'] }, // with enableRowSelection: true
```

Correct:

```tsx
initialState: { columnOrder: ['mrt-row-select', 'name', 'email'] },
```

The length mismatch makes MRT regenerate the order from the column definitions, discarding the custom arrangement.

Source: `docs/guides/column-ordering-dnd.mdx`

## API Discovery

Search `node_modules/@lminii/material-react-table/dist/index.d.ts` for `enableRowOrdering`, `enableRowDragging`, `muiRowDragHandleProps`, `muiColumnDragHandleProps`, `draggingRow`, and `hoveredColumn`. The Column Ordering and Row Ordering guides at `/docs/guides/column-ordering-dnd` and `/docs/guides/row-ordering-dnd` list the related options, and `/docs/examples/enable-column-ordering`, `enable-row-ordering`, and `enable-row-dragging` are runnable examples.
