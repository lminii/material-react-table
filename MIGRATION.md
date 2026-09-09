# Migration guide

## Migrating to V4 from V3 (Material UI V9 and TanStack Table V9)

Material React Table V4 is the first release published as `@lminii/material-react-table`.
It targets Material UI V9 and Material UI X Date Pickers V9.
It also moves from TanStack Table V8 to TanStack Table V9 (see section 8).

### 1. Upgrade Material UI first

Follow the official guides, in order, before touching this package:

- [Material UI: upgrade to v7](https://mui.com/material-ui/migration/upgrade-to-v7/)
- [Material UI: upgrade to v9](https://mui.com/material-ui/migration/upgrade-to-v9/)
- [Date Pickers: v7 to v8](https://mui.com/x/migration/migration-pickers-v7/)
- [Date Pickers: v8 to v9](https://mui.com/x/migration/migration-pickers-v8/)

Material UI's own codemods handle most of it:

```bash
npx @mui/codemod@latest v9.0.0/system-props <path>
npx @mui/codemod@latest deprecations/all <path>
```

### 2. Switch the package

```bash
npm uninstall material-react-table
npm install @lminii/material-react-table @mui/material@^9 @mui/icons-material@^9 @mui/x-date-pickers@^9
```

Update every import:

```diff
-import { MaterialReactTable } from 'material-react-table';
-import { MRT_Localization_DE } from 'material-react-table/locales/de';
+import { MaterialReactTable } from '@lminii/material-react-table';
+import { MRT_Localization_DE } from '@lminii/material-react-table/locales/de';
```

### 3. Peer dependency floors

| Peer | V3 | V4 |
|---|---|---|
| `@mui/material` | `>=6` | `>=9.0` |
| `@mui/icons-material` | `>=6` | `>=9.0` |
| `@mui/x-date-pickers` | `>=7.15` | `>=9.0` |
| `react`, `react-dom` | `>=18.0` | `>=18.0` (unchanged) |
| `@emotion/react`, `@emotion/styled` | `>=11.13` | `>=11.13` (unchanged) |

Node 20.10 or newer is required to build the package from source.

### 4. Text field props moved to `slotProps`

Material UI V9 removed `InputProps`, `inputProps`, `SelectProps`, `InputLabelProps` and `FormHelperTextProps` from `TextField`.
The same applies to the three MRT options typed as `TextFieldProps`: `muiEditTextFieldProps`, `muiFilterTextFieldProps` and `muiSearchTextFieldProps`.

```diff
 muiSearchTextFieldProps={{
-  InputProps: { startAdornment: <SearchIcon /> },
-  inputProps: { 'aria-label': 'Search' },
-  InputLabelProps: { shrink: true },
+  slotProps: {
+    input: { startAdornment: <SearchIcon /> },
+    htmlInput: { 'aria-label': 'Search' },
+    inputLabel: { shrink: true },
+  },
 }}
```

MRT merges your `slotProps.input`, `slotProps.htmlInput` and `slotProps.select` objects after its own defaults, and composes `sx` the same way it did for `InputProps.sx`.
Only the object form of a slot entry is supported for these three options; the function form `(ownerState) => props` is ignored because MRT has no `ownerState` to call it with.

### 5. Date picker prop types are no longer generic

`muiFilterDatePickerProps`, `muiFilterDateTimePickerProps` and `muiFilterTimePickerProps` are now typed with the non-generic `DatePickerProps`, `DateTimePickerProps` and `TimePickerProps`.

```diff
-const props: DatePickerProps<Dayjs> = { ... };
+const props: DatePickerProps = { ... };
```

The date, datetime and time filter inputs now render the accessible `PickersTextField` (section based) that pickers V9 makes mandatory.
If you passed a custom `slots.textField` to a filter picker it must be compatible with `PickersTextFieldProps`.

### 6. Package entry points

The package now declares an `exports` map with separate ESM (`.mjs`) and CommonJS (`.js`) builds.
Supported specifiers are `@lminii/material-react-table`, `@lminii/material-react-table/locales/<code>` and `@lminii/material-react-table/package.json`.
Deep imports into `dist/` or `src/` are no longer resolvable.

This also fixes server-side rendering with date filters when the application imports `@mui/x-date-pickers` as ESM.
V3 loaded the CommonJS pickers build from its own bundle, which created a second `LocalizationProvider` context and threw "MUI X error #149" during SSR with pickers V8 or newer.

### 7. Everything else

All other `mui*Props` options pass straight through to the corresponding Material UI component, so Material UI's own V7 and V9 migration notes apply to whatever you pass there.
Behaviour changes worth checking in your app come from Material UI itself, most notably: `ButtonBase` now bubbles a click to ancestors on Enter and Space, `Menu` keyboard navigation moves `tabindex`, `TextField select` renders its label as a `div`, and `Autocomplete` with `freeSolo` may pass a `string` to `getOptionLabel`.

### 8. TanStack Table V9

V4 is built on TanStack Table V9 (`@tanstack/react-table` 9.2.4), up from V8.
The V9 packages are ESM-only, so the CommonJS build of this package now requires Node 22.12 or newer (`require()` of ES modules). The `engines` field says `>=22.12`.
Most of your code keeps working unchanged. The table below lists everything that was renamed; each is a straight find and replace.

| V3 (TanStack 8) | V4 (TanStack 9) |
| --- | --- |
| `initialState: { columnPinning: { left: [...], right: [...] } }` | `columnPinning: { start: [...], end: [...] }` |
| `column.pin('left')` / `column.pin('right')` | `column.pin('start')` / `column.pin('end')` |
| `column.getIsPinned() === 'left'` | `column.getIsPinned() === 'start'` |
| `table.getLeftLeafColumns()` and the other `getLeft*` / `getRight*` methods | `table.getStartLeafColumns()` and `getStart*` / `getEnd*` |
| `row.getLeftVisibleCells()` / `row.getRightVisibleCells()` | `row.getStartVisibleCells()` / `row.getEndVisibleCells()` |
| `columnSizingInfo` state, `onColumnSizingInfoChange`, `table.setColumnSizingInfo()` | `columnResizing`, `onColumnResizingChange`, `table.setColumnResizing()` |
| `sortingFn` column option | `sortFn` |
| `sortingFns` table option | `sortFns` |
| `column.getSortingFn()` / `column.getAutoSortingFn()` | `column.getSortFn()` / `column.getAutoSortFn()` |
| `table.getPrePaginationRowModel()` / `table.getPaginationRowModel()` | `table.getPrePaginatedRowModel()` / `table.getPaginatedRowModel()` |
| `column.getAggregationFn()` | `column.getAggregationFns()` |
| `MRT_SortingFn` type | `MRT_SortFn` (the old name is kept as a deprecated alias) |
| `MRT_ColumnSizingInfoState` type | `MRT_ColumnResizingState` (the old name is kept as a deprecated alias) |

Behaviour changes to check:

- `rowSelection` state values are typed `true` instead of `boolean`. Toggle a row by deleting its key rather than setting it to `false`.
- `rowPinning` state requires both `top` and `bottom` arrays, and `columnPinning` requires both `start` and `end`, when you pass them in `initialState` or `state`.
- `table.getIsSomeRowsSelected()` now returns `true` when all rows are selected. For an indeterminate checkbox use `getIsSomeRowsSelected() && !getIsAllRowsSelected()`.
- A custom `aggregationFn` is an object `{ aggregate: (context) => result }` instead of a `(columnId, leafRows, childRows) => result` callable. The built-in names (`'sum'`, `'mean'`, ...) and arrays of names work as before.
- The `getCoreRowModel`, `getFilteredRowModel`, `getSortedRowModel`, `getPaginationRowModel`, `getExpandedRowModel`, `getGroupedRowModel` and `getFaceted*` table options no longer exist. The row models are always registered; use the `manual*` options to take over a stage.
- Rows with a detail panel now report `row.getCanExpand()` as `true`, because V9 refuses to toggle a row that cannot expand.
  Pass your own `getRowCanExpand` to override this.
- `onStateChange` and `table.setState()` no longer exist. Control individual slices with `state` plus the matching `onXChange` option.
- `table.getState()` still works and returns the full current state. Inside render code `table.state` is the reactive equivalent.
- Pinned cells are positioned with `insetInlineStart` and `insetInlineEnd`, so right-to-left layouts pin to the logical start and end of the row.

Both this package and the TanStack V9 packages ship agent skills for AI coding assistants; run `npx @tanstack/intent@latest list` in your project to see them.
The `migrate-v3-to-v4` skill covers everything on this page, and the `@lminii/material-react-table-mcp` server answers exact option lookups.
