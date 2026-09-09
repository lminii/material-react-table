---
name: filtering
description: >
  Configure column and global filtering in Material React Table V4: filterVariant (text, select, multi-select, autocomplete, range, range-slider, checkbox, date, datetime, time and their ranges), enableFacetedValues, filterFn and filterFns, enableColumnFilterModes with columnFilterModeOptions, columnFilterDisplayMode, globalFilterFn and ranked results, filter match highlighting, and the muiFilter*Props. Load for dropdown or date filters, custom filter logic, filter mode menus, or search that matches the wrong rows.
metadata:
  type: framework
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - getting-started
  - '@tanstack/table-core#column-filtering'
  - '@tanstack/table-core#global-filtering'
sources:
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/column-filtering.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/global-filtering.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/customize-filter-variants/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:packages/material-react-table/src/fns/filterFns.ts'
  - 'lminii/material-react-table:packages/material-react-table/src/utils/column.utils.ts'
  - 'lminii/material-react-table:packages/material-react-table/src/types.ts'
---

This skill builds on `getting-started`, `@tanstack/table-core#column-filtering`, and `@tanstack/table-core#global-filtering`. Client-side column filters and the global search are on by default. MRT adds filter inputs, filter variants, fuzzy matching, and filter mode menus on top of the TanStack filtering model; server-side filtering is covered by `state-and-server-data`.

## Setup

```tsx
const columns: MRT_ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' }, // text filter, fuzzy
  { accessorKey: 'city', header: 'City', filterVariant: 'select' },
  { accessorKey: 'state', header: 'State', filterVariant: 'multi-select' },
  { accessorKey: 'salary', header: 'Salary', filterVariant: 'range-slider' },
  {
    accessorFn: (row) => new Date(row.hireDate), // filter and sort on a Date
    id: 'hireDate',
    header: 'Hired',
    filterVariant: 'date-range',
    Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(),
  },
]

const table = useMaterialReactTable({
  columns,
  data,
  enableFacetedValues: true, // options and min/max come from the data
  initialState: { showColumnFilters: true },
})
```

`enableColumnFilters` (table) and `enableColumnFilter` (column) turn column filters off; `enableGlobalFilter` does the same for search; `enableFilters: false` removes both. `showColumnFilters` and `showGlobalFilter` are state slices, so seed them in `initialState` to show the inputs immediately.

## Core Patterns

### Pick the variant and let it pick the filter function

```tsx
{ accessorKey: 'isActive', accessorFn: (row) => (row.isActive ? 'true' : 'false'), id: 'isActive', header: 'Active', filterVariant: 'checkbox' },
{ accessorKey: 'age', header: 'Age', filterVariant: 'range', filterFn: 'between' },
{ accessorKey: 'team', header: 'Team', filterVariant: 'autocomplete', filterSelectOptions: teams },
```

Variants: `text` (default), `autocomplete`, `select`, `multi-select`, `range`, `range-slider`, `checkbox`, `date`, `date-range`, `datetime`, `datetime-range`, `time`, `time-range`. The default `filterFn` follows the variant: `multi-select` uses `arrIncludesSome`, any `range` variant uses `betweenInclusive`, `select` and `checkbox` use `equals`, everything else uses `fuzzy`. `filterSelectOptions` takes strings or `{ label, value }` objects; with `enableFacetedValues` the select, multi-select, autocomplete, and range-slider inputs fill themselves from the column's unique values or min and max. The checkbox variant compares against the strings `'true'` and `'false'`, so its accessor must return strings.

### Date, datetime, and time variants need the pickers provider

```tsx
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

<LocalizationProvider dateAdapter={AdapterDayjs}>
  <MaterialReactTable table={table} />
</LocalizationProvider>
```

MRT renders `@mui/x-date-pickers` V9 components for these variants and expects one `LocalizationProvider` above the table. The accessor should return a `Date` so comparisons and sorting work. `muiFilterDatePickerProps`, `muiFilterDateTimePickerProps`, and `muiFilterTimePickerProps` forward props to the picker; for range variants the callback form receives `rangeFilterIndex` (0 for the start input, 1 for the end).

### Custom filter functions

```tsx
const table = useMaterialReactTable({
  columns: [
    { accessorKey: 'name', header: 'Name', filterFn: 'startsWith' }, // MRT built-in
    { accessorKey: 'code', header: 'Code', filterFn: 'includesStringSensitive' }, // TanStack built-in
    { accessorKey: 'tags', header: 'Tags', filterFn: 'hasAllTags' }, // registered below
  ],
  data,
  filterFns: {
    hasAllTags: (row, columnId, filterValue: string) =>
      filterValue.split(',').every((tag) => row.getValue<string[]>(columnId).includes(tag.trim())),
  },
  globalFilterFn: 'contains', // default is 'fuzzy'
})
```

MRT built-ins: `between`, `betweenInclusive`, `contains`, `empty`, `endsWith`, `equals`, `fuzzy`, `greaterThan`, `greaterThanOrEqualTo`, `lessThan`, `lessThanOrEqualTo`, `notEmpty`, `notEquals`, `startsWith`. TanStack built-ins such as `includesString`, `equalsString`, `arrIncludes`, `arrIncludesAll`, `arrIncludesSome`, `weakEquals`, and `inNumberRange` also work by name. A function passed to `filterFn` receives `(row, columnId, filterValue)` and returns a boolean; functions registered in `filterFns` become names usable in `filterFn`, `globalFilterFn`, and the filter mode menus. The `fuzzy` global filter ranks rows by match quality unless `enableGlobalFilterRankedResults` is false, a sort is active, rows are expanded, or a `manual*` option is set.

### Let users switch filter modes

```tsx
const table = useMaterialReactTable({
  columns: [
    { accessorKey: 'name', header: 'Name', columnFilterModeOptions: ['fuzzy', 'contains', 'startsWith'] },
    { accessorKey: 'age', header: 'Age', columnFilterModeOptions: ['between', 'lessThan', 'greaterThan'] },
  ],
  data,
  enableColumnFilterModes: true,
  enableGlobalFilterModes: true,
  globalFilterModeOptions: ['fuzzy', 'startsWith'],
  columnFilterDisplayMode: 'popover', // 'subheader' (default), 'popover', or 'custom'
})
```

The chosen modes live in the `columnFilterFns` and `globalFilterFn` state slices, controllable through `onColumnFilterFnsChange` and `onGlobalFilterFnChange`. `renderColumnFilterModeMenuItems` and `renderGlobalFilterModeMenuItems` replace the menu; each receives `onSelectFilterMode(name)` and `internalFilterOptions`. `columnFilterDisplayMode: 'custom'` keeps the filtering logic while you render inputs elsewhere with `column.setFilterValue`. Filter values arrive after a short debounce (200 ms client-side, 400 ms with `manualFiltering`).

### Keep match highlighting in custom cells

```tsx
{
  accessorKey: 'name',
  header: 'Name',
  Cell: ({ renderedCellValue }) => <strong>{renderedCellValue}</strong>,
}
```

Text filters and the global search highlight matches inside cells. A custom `Cell` keeps that only when it renders `renderedCellValue` instead of `cell.getValue()`. `enableFilterMatchHighlighting: false` turns it off per table or per column.

## Common Mistakes

### HIGH Filter variant does not match the accessor value type

Wrong:

```tsx
{ accessorKey: 'hireDate', header: 'Hired', filterVariant: 'date-range' } // hireDate is an ISO string
```

Correct:

```tsx
{
  accessorFn: (row) => new Date(row.hireDate),
  id: 'hireDate',
  header: 'Hired',
  filterVariant: 'date-range',
  Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(),
}
```

The `betweenInclusive` comparison the date variants use works on `Date` objects and numbers, not on date strings, so string columns silently match everything or nothing.

Source: `docs/examples/customize-filter-variants`

### HIGH Reading the filter value with the wrong shape

Wrong:

```tsx
filterFn: (row, id, filterValue) => row.getValue<number>(id) >= filterValue, // range variant
```

Correct:

```tsx
filterFn: (row, id, [min, max]: [number, number]) => {
  const value = row.getValue<number>(id)
  return (min === '' || value >= min) && (max === '' || value <= max)
}
```

Range variants store `[min, max]` and multi-select stores an array; text, select, and checkbox store a single value. Match the shape or the custom function throws or filters everything out.

Source: `packages/material-react-table/src/fns/filterFns.ts`

### MEDIUM Passing removed Material UI text field props to filters

Wrong:

```tsx
muiFilterTextFieldProps: { InputProps: { startAdornment: <SearchIcon /> } }
```

Correct:

```tsx
muiFilterTextFieldProps: { slotProps: { input: { startAdornment: <SearchIcon /> } } }
```

Material UI V9 removed `InputProps` and `inputProps`; MRT merges `slotProps.input`, `slotProps.htmlInput`, and `slotProps.select` into its own.

Source: `MIGRATION.md`

### MEDIUM Mode menu offers a function that is not registered

Wrong:

```tsx
columnFilterModeOptions: ['fuzzy', 'isPrime'], // isPrime only exists in the column's filterFn
```

Correct:

```tsx
filterFns: { isPrime: (row, id) => isPrime(row.getValue<number>(id)) },
columnFilterModeOptions: ['fuzzy', 'isPrime'],
```

Filter mode names resolve through the table `filterFns` map. A name that is not there falls back to the default and the menu label shows the raw key.

Source: `docs/guides/column-filtering.mdx`

## API Discovery

Search `node_modules/@lminii/material-react-table/dist/index.d.ts` for `filterVariant`, `MRT_FilterOption`, `filterFns`, and `muiFilter` for the exact unions and callback props. `MRT_FilterFns` is exported for reuse. The Column Filtering and Global Filtering guides at `/docs/guides/column-filtering` and `/docs/guides/global-filtering` list the related table, column, and state options, and `/docs/examples/customize-filter-variants`, `customize-filter-modes`, `enable-filter-facet-values`, and `alternate-column-filtering` are runnable examples.
