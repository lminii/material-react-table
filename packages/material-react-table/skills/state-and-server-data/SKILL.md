---
name: state-and-server-data
description: >
  Control Material React Table V4 state with initialState, the state option plus on*Change callbacks, MRT_Updater handlers, table.getState and table.state, and move filtering, sorting, pagination, grouping, or expanding to the server with manual* options and rowCount. Load for controlled tables, persisted state, side effects on state change, TanStack Query integration, or infinite scrolling.
metadata:
  type: framework
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - getting-started
  - '@tanstack/table-core#client-vs-server'
sources:
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/state-management.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/pagination.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/async-loading.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/react-query/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:packages/material-react-table/src/types.ts'
---

This skill builds on `getting-started` and `@tanstack/table-core#client-vs-server`. MRT manages every state slice internally by default. Take over only the slices you need to read or persist, and only through the `state` option paired with the matching `on*Change` callback.

## Setup

```tsx
const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 25 })
const [sorting, setSorting] = useState<MRT_SortingState>([])

const table = useMaterialReactTable({
  columns,
  data,
  initialState: { density: 'compact', showColumnFilters: true },
  state: { pagination, sorting },
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
})
```

`initialState` seeds slices MRT keeps managing. `state` hands a slice over to you; from then on MRT calls `on<Slice>Change` and reads only what you pass back. Do not put the same slice in both.

## Core Patterns

### Handle updaters like React setState

```tsx
import { type MRT_Updater, type MRT_RowSelectionState } from '@lminii/material-react-table'

const handleRowSelectionChange = (updater: MRT_Updater<MRT_RowSelectionState>) => {
  setRowSelection((previous) => {
    const next = updater instanceof Function ? updater(previous) : updater
    onSelectionChanged(Object.keys(next)) // side effect runs once, even in Strict Mode
    return next
  })
}
```

Callbacks receive either a value or an updater function, exactly like `useState`. Use `getRowId` so selection keys are stable ids instead of row indexes.

### Server-side data with manual* options

```tsx
const { data: page, isLoading, isError, isRefetching } = useQuery({
  queryKey: ['people', pagination, sorting, columnFilters, globalFilter],
  queryFn: () => fetchPeople({ pagination, sorting, columnFilters, globalFilter }),
  placeholderData: keepPreviousData,
})

const table = useMaterialReactTable({
  columns,
  data: page?.rows ?? EMPTY,
  rowCount: page?.total ?? 0,
  manualFiltering: true,
  manualPagination: true,
  manualSorting: true,
  state: { pagination, sorting, columnFilters, globalFilter, isLoading, showAlertBanner: isError, showProgressBars: isRefetching },
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
  muiToolbarAlertBannerProps: isError ? { color: 'error', children: 'Error loading data' } : undefined,
})
```

Each `manual*` option tells MRT that stage already happened on the server, so the client row model passes rows through. `rowCount` (or `pageCount`) drives the pagination controls. `isLoading`, `showProgressBars`, `showSkeletons`, and `showLoadingOverlay` are MRT state slices meant to be set from fetch status.

### Read state without controlling it

```tsx
const table = useMaterialReactTable({ columns, data })

<Button onClick={() => save(table.getState().columnVisibility)}>Save layout</Button>
```

`table.getState()` returns the complete state, including MRT-only slices such as `density`, `isFullScreen`, `showColumnFilters`, `editingRow`, and `creatingRow`. In render code `table.state` is reactive. Setters such as `table.setPagination`, `table.resetSorting`, `table.setShowColumnFilters`, and `table.setDensity` exist for every slice.

### Persist state

```tsx
const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
  () => JSON.parse(localStorage.getItem('people-columns') ?? '{}'),
)
useEffect(() => {
  localStorage.setItem('people-columns', JSON.stringify(columnVisibility))
}, [columnVisibility])

const table = useMaterialReactTable({
  columns,
  data,
  state: { columnVisibility },
  onColumnVisibilityChange: setColumnVisibility,
})
```

## Common Mistakes

### HIGH Passing on*Change without state

Wrong:

```tsx
const table = useMaterialReactTable({ columns, data, onSortingChange: setSorting })
```

Correct:

```tsx
const table = useMaterialReactTable({
  columns,
  data,
  state: { sorting },
  onSortingChange: setSorting,
})
```

Once a callback is supplied, MRT stops updating that slice itself. Without `state`, the table never sorts.

Source: `docs/guides/state-management.mdx`

### HIGH Toggling row selection with false

Wrong:

```tsx
setRowSelection((old) => ({ ...old, [id]: false }))
```

Correct:

```tsx
setRowSelection(({ [id]: _removed, ...rest }) => rest)
```

TanStack Table V9 types `rowSelection` as `Record<string, true>`, so a `false` entry is a type error; absence of the key is the only deselected state.

Source: `MIGRATION.md`

### MEDIUM Using onStateChange or table.setState

Wrong:

```tsx
onStateChange: (updater) => setTableState(updater)
```

Correct:

```tsx
state: { pagination, sorting },
onPaginationChange: setPagination,
onSortingChange: setSorting,
```

`onStateChange` and `table.setState` were removed with TanStack Table V9. Control slices individually.

Source: `MIGRATION.md`

### MEDIUM Forgetting rowCount with manualPagination

Wrong:

```tsx
manualPagination: true,
data: page.rows,
```

Correct:

```tsx
manualPagination: true,
data: page.rows,
rowCount: page.total,
```

Without a total, MRT assumes the current page is all the data and disables the next page button.

Source: `docs/guides/pagination.mdx`

## API Discovery

`MRT_TableState` in `node_modules/@lminii/material-react-table/dist/index.d.ts` lists every slice; each has an `on<Slice>Change` option and `table.set<Slice>` method. The State Options table at `/docs/api/state-options` shows defaults, and the `manual*` and `rowCount` options are in `/docs/api/table-options`.
