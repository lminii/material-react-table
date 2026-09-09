---
name: customization
description: >
  Style and extend Material React Table V4 through mui*Props objects and callbacks, the sx prop, Material UI V9 slotProps on text fields, render* slots for toolbars, row actions, detail panels and empty states, displayColumnDefOptions, icons, and localization. Load for theming, conditional row or cell styling, custom toolbar buttons, or replacing built-in display columns.
metadata:
  type: framework
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - getting-started
sources:
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/customize-components.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/display-columns.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/toolbar-customization.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/row-actions.mdx'
  - 'lminii/material-react-table:MIGRATION.md'
---

This skill builds on `getting-started`. MRT renders Material UI components and forwards props to each of them through a matching `mui<Component>Props` option, so customization means passing Material UI props, not overriding MRT internals.

## Setup

```tsx
const table = useMaterialReactTable({
  columns,
  data,
  muiTablePaperProps: { elevation: 0, sx: { borderRadius: 0 } },
  muiTableBodyRowProps: ({ row }) => ({
    sx: { backgroundColor: row.getIsSelected() ? 'action.selected' : undefined },
  }),
  muiTableBodyCellProps: ({ column }) => ({
    align: column.id === 'amount' ? 'right' : 'left',
  }),
})
```

Every `mui*Props` option accepts a static object or a callback. The callback receives `table` plus whatever is in scope for that component: `row`, `cell`, `column`, `staticRowIndex`, `isDetailPanel`, and similar. Static objects are cheaper; use a callback only when the props depend on data.

## Core Patterns

### Text field options use Material UI V9 slotProps

```tsx
muiSearchTextFieldProps: {
  placeholder: 'Search people',
  slotProps: {
    input: { startAdornment: <SearchIcon /> },
    htmlInput: { 'aria-label': 'Search people' },
    inputLabel: { shrink: true },
  },
},
```

`muiEditTextFieldProps`, `muiFilterTextFieldProps`, and `muiSearchTextFieldProps` take `slotProps.input`, `slotProps.htmlInput`, `slotProps.select`, and `slotProps.inputLabel`. MRT merges the object form of each slot after its own defaults and composes `sx`. The function form `(ownerState) => props` is ignored.

### Column-level props override table-level props

```tsx
const columns: MRT_ColumnDef<Person>[] = [
  {
    accessorKey: 'salary',
    header: 'Salary',
    muiTableHeadCellProps: { align: 'right' },
    muiTableBodyCellProps: { align: 'right' },
    Cell: ({ cell }) => cell.getValue<number>().toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
  },
]
```

`muiTableHeadCellProps`, `muiTableBodyCellProps`, `muiTableFooterCellProps`, `muiFilter*Props`, `muiEditTextFieldProps`, `muiCopyButtonProps`, and `muiColumnActionsButtonProps` exist on both the table options and the column definition. The column value wins.

### render* slots add UI without replacing MRT components

```tsx
const table = useMaterialReactTable({
  columns,
  data,
  enableRowActions: true,
  positionActionsColumn: 'last',
  renderRowActionMenuItems: ({ row, closeMenu }) => [
    <MenuItem key="edit" onClick={() => { edit(row.original); closeMenu() }}>Edit</MenuItem>,
  ],
  renderTopToolbarCustomActions: ({ table }) => (
    <Button onClick={() => exportRows(table.getPrePaginatedRowModel().rows)}>Export</Button>
  ),
  renderDetailPanel: ({ row }) => <Address address={row.original.address} />,
  renderEmptyRowsFallback: () => <Typography>No people match these filters</Typography>,
})
```

`renderTopToolbar` and `renderBottomToolbar` replace the whole toolbar; `renderTopToolbarCustomActions`, `renderBottomToolbarCustomActions`, and `renderToolbarInternalActions` add to it. `renderRowActions` renders inline buttons; `renderRowActionMenuItems` fills the kebab menu. `renderDetailPanel` also makes every row expandable.

### Adjust built-in display columns

```tsx
displayColumnDefOptions: {
  'mrt-row-actions': { header: '', size: 80, muiTableHeadCellProps: { align: 'center' } },
  'mrt-row-select': { enableColumnActions: false },
  'mrt-row-expand': { size: 40 },
},
```

Display column ids are `mrt-row-actions`, `mrt-row-drag`, `mrt-row-expand`, `mrt-row-numbers`, `mrt-row-pin`, `mrt-row-select`, and `mrt-row-spacer`. They exist only when the matching feature is enabled.

### Icons and localization

```tsx
import { MRT_Localization_DE } from '@lminii/material-react-table/locales/de'

const table = useMaterialReactTable({
  columns,
  data,
  localization: MRT_Localization_DE,
  icons: { SearchIcon: (props) => <TravelExploreIcon {...props} /> },
})
```

`icons` accepts a partial `MRT_Icons` map; `localization` accepts a partial `MRT_Localization`, so overriding a few strings is fine.

## Common Mistakes

### HIGH Passing removed Material UI text field props

Wrong:

```tsx
muiSearchTextFieldProps: {
  InputProps: { startAdornment: <SearchIcon /> },
  inputProps: { 'aria-label': 'Search' },
}
```

Correct:

```tsx
muiSearchTextFieldProps: {
  slotProps: {
    input: { startAdornment: <SearchIcon /> },
    htmlInput: { 'aria-label': 'Search' },
  },
}
```

Material UI V9 removed `InputProps`, `inputProps`, `SelectProps`, `InputLabelProps`, and `FormHelperTextProps` from `TextField`, so the old keys are type errors and are never applied.

Source: `MIGRATION.md`

### MEDIUM Styling with a class selector instead of the sx prop

Wrong:

```tsx
muiTableBodyCellProps: { className: 'my-cell' }
// plus a global .my-cell rule fighting Material UI specificity
```

Correct:

```tsx
muiTableBodyCellProps: {
  sx: (theme) => ({ borderRight: `1px solid ${theme.palette.divider}` }),
}
```

`sx` receives the Material UI theme and wins the specificity contest with Emotion styles that MRT already applies.

Source: `docs/guides/customize-components.mdx`

### MEDIUM Replacing the toolbar when only a button was needed

Wrong:

```tsx
renderTopToolbar: ({ table }) => <Button onClick={add}>Add</Button>
```

Correct:

```tsx
renderTopToolbarCustomActions: ({ table }) => <Button onClick={add}>Add</Button>
```

`renderTopToolbar` removes the search box, filter toggle, density and full screen buttons, and the alert banner. The `*CustomActions` slot keeps them.

Source: `docs/guides/toolbar-customization.mdx`

## API Discovery

Search `node_modules/@lminii/material-react-table/dist/index.d.ts` for `mui` to see every prop option and its callback arguments, and for `render` to see every render slot. The Customize Components guide at `/docs/guides/customize-components` lists the options per component, and `/docs/api/column-options` marks which options also exist on columns.
