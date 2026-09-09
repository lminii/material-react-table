---
name: editing
description: >
  Add create, update, and inline editing to Material React Table V4 with enableEditing, editDisplayMode (modal, row, cell, table, custom), createDisplayMode, onEditingRowSave and onCreatingRowSave with exitEditingMode, table.setEditingRow, table.setCreatingRow, muiEditTextFieldProps validation, editVariant select, and the Edit column slot. Load for CRUD tables, editable cells, row forms in a dialog, or when saved values never reach the callback.
metadata:
  type: framework
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - getting-started
  - customization
sources:
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/editing.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/editing-crud-modal/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/editing-crud-cell/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:packages/material-react-table/src/components/inputs/MRT_EditCellTextField.tsx'
  - 'lminii/material-react-table:packages/material-react-table/src/types.ts'
---

This skill builds on `getting-started` and `customization`. MRT renders the editing inputs and tracks which row or cell is being edited; persisting the values is always application code, wired through the save callbacks or the text field events.

## Setup

```tsx
const table = useMaterialReactTable({
  columns,
  data,
  enableEditing: true,
  editDisplayMode: 'modal', // default; also 'row' | 'cell' | 'table' | 'custom'
  createDisplayMode: 'modal', // default; also 'row' | 'custom'
  getRowId: (row) => row.id,
  onEditingRowSave: async ({ values, table }) => {
    await updateUser(values)
    table.setEditingRow(null) // exit editing mode
  },
  onCreatingRowSave: async ({ values, table }) => {
    await createUser(values)
    table.setCreatingRow(null) // exit creating mode
  },
  renderRowActions: ({ row, table }) => (
    <IconButton onClick={() => table.setEditingRow(row)}><EditIcon /></IconButton>
  ),
  renderTopToolbarCustomActions: ({ table }) => (
    <Button onClick={() => table.setCreatingRow(true)}>Create</Button>
  ),
})
```

`enableEditing` accepts a boolean or `(row) => boolean`, on the table and on each column. Column-level `enableEditing: false` renders a disabled field in the modal and the plain cell value in the other modes. The `editingRow`, `creatingRow`, and `editingCell` state slices hold the active row or cell; `table.setEditingRow`, `table.setCreatingRow`, and `table.setEditingCell` change them.

## Core Patterns

### Modal and row modes save through onEditingRowSave

```tsx
const handleSave: MRT_TableOptions<User>['onEditingRowSave'] = async ({ values, row, table, exitEditingMode }) => {
  const errors = validateUser(values)
  if (Object.values(errors).some(Boolean)) {
    setValidationErrors(errors)
    return // stay in editing mode
  }
  setValidationErrors({})
  await updateUser({ ...row.original, ...values })
  exitEditingMode() // same as table.setEditingRow(null)
}
```

`values` is a record keyed by column id, holding the edited text of every editable column. Nothing is written to `data`; the callback owns persistence. The callback may return a promise, and the `isSaving` state slice disables the save button and shows a spinner while it is true. `onEditingRowCancel` and `onCreatingRowCancel` fire when the user closes without saving, which is where validation errors get cleared.

### Cell and table modes save through the text field events

```tsx
const columns: MRT_ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    muiEditTextFieldProps: ({ cell, row }) => ({
      type: 'email',
      required: true,
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
      onBlur: (event) => {
        const value = event.currentTarget.value
        setValidationErrors((prev) => ({ ...prev, [cell.id]: validateEmail(value) ? undefined : 'Invalid email' }))
        setEditedUsers((prev) => ({ ...prev, [row.id]: { ...row.original, email: value } }))
      },
    }),
  },
]

const table = useMaterialReactTable({
  columns,
  data,
  enableEditing: true,
  editDisplayMode: 'cell', // double-click a cell to edit it
})
```

In `'cell'` mode a double-click opens the field for that cell; in `'table'` mode every editable cell is a field at once. `onEditingRowSave` never fires in these modes. MRT calls your `onBlur` first, then stores the value in `row._valuesCache` and clears `editingCell`, so read `event.currentTarget.value` rather than `cell.getValue()`. Enter blurs the field. For single-click editing set `muiTableBodyCellProps` with an `onClick` that calls `table.setEditingCell(cell)` and focuses `table.refs.editInputRefs.current?.[column.id]`.

### Select inputs and custom Edit components

```tsx
{
  accessorKey: 'state',
  header: 'State',
  editVariant: 'select',
  editSelectOptions: usStates, // string[] or { label, value }[]
  muiEditTextFieldProps: { select: true, required: true },
},
{
  accessorKey: 'birthday',
  header: 'Birthday',
  Edit: ({ cell, column, row, table }) => (
    <DatePicker
      value={dayjs(cell.getValue<string>())}
      onChange={(date) => {
        row._valuesCache[column.id] = date?.toISOString()
        if (table.getState().creatingRow?.id === row.id) table.setCreatingRow(row)
        else table.setEditingRow(row)
      }}
    />
  ),
},
```

`editSelectOptions` also accepts a callback receiving `cell`, `column`, `row`, and `table`. Select values save on change; text values save on blur. A custom `Edit` slot replaces the text field entirely, so it must write to `row._valuesCache[column.id]` and re-set the editing or creating row, otherwise the value never reaches `values` in the save callback.

### Customize the dialog and the create row

```tsx
import { MRT_EditActionButtons, createRow } from '@lminii/material-react-table'

const table = useMaterialReactTable({
  columns,
  data,
  enableEditing: true,
  positionCreatingRow: 'bottom', // 'top' (default), 'bottom', or a row index
  renderEditRowDialogContent: ({ internalEditComponents, row, table }) => (
    <>
      <DialogTitle>Edit user</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{internalEditComponents}</DialogContent>
      <DialogActions><MRT_EditActionButtons table={table} row={row} variant="text" /></DialogActions>
    </>
  ),
  renderTopToolbarCustomActions: ({ table }) => (
    <Button onClick={() => table.setCreatingRow(createRow(table, { id: crypto.randomUUID(), role: 'viewer' }))}>
      Create with defaults
    </Button>
  ),
})
```

`internalEditComponents` is the array of generated fields, one per column, so custom dialog content can reorder them or mix in other inputs. `renderCreateRowDialogContent` is the create counterpart. `table.setCreatingRow(true)` opens a blank row; `createRow(table, defaults)` seeds it. `muiEditRowDialogProps` reaches the Material UI `Dialog` itself. `editDisplayMode: 'custom'` and `createDisplayMode: 'custom'` keep the state slices and callbacks but render no MRT editing UI, for forms in a sidebar.

## Common Mistakes

### HIGH Forgetting to exit editing mode after saving

Wrong:

```tsx
onEditingRowSave: async ({ values }) => {
  await updateUser(values)
}
```

Correct:

```tsx
onEditingRowSave: async ({ values, table }) => {
  await updateUser(values)
  table.setEditingRow(null)
}
```

MRT does not close the dialog or row on its own, so validation can keep it open. Call `exitEditingMode()` or `table.setEditingRow(null)` once the save succeeds, and the create counterpart `table.setCreatingRow(null)`.

Source: `docs/guides/editing.mdx`

### HIGH Expecting the data array to update itself

Wrong:

```tsx
editDisplayMode: 'cell',
// no muiEditTextFieldProps handlers; edits vanish after blur
```

Correct:

```tsx
muiEditTextFieldProps: ({ cell, row }) => ({
  onBlur: (event) => saveCell(row.id, cell.column.id, event.currentTarget.value),
}),
```

Edited text lives only in `row._valuesCache` until your code writes it to state or a server and the `data` prop changes.

Source: `packages/material-react-table/src/components/inputs/MRT_EditCellTextField.tsx`

### MEDIUM Passing removed Material UI text field props to the editor

Wrong:

```tsx
muiEditTextFieldProps: { InputProps: { startAdornment: <EuroIcon /> }, inputProps: { maxLength: 40 } }
```

Correct:

```tsx
muiEditTextFieldProps: {
  slotProps: { input: { startAdornment: <EuroIcon /> }, htmlInput: { maxLength: 40 } },
}
```

Material UI V9 removed `InputProps` and `inputProps` from `TextField`; MRT merges `slotProps.input`, `slotProps.htmlInput`, and `slotProps.select` with its own.

Source: `MIGRATION.md`

### MEDIUM Editing without a stable row id

Wrong:

```tsx
useMaterialReactTable({ columns, data, enableEditing: true })
```

Correct:

```tsx
useMaterialReactTable({ columns, data, enableEditing: true, getRowId: (row) => row.id })
```

Without `getRowId` rows are keyed by index, so `editingRow` and `creatingRow` can point at a different record after sorting, filtering, or an optimistic insert.

Source: `docs/examples/editing-crud-modal`

## API Discovery

Search `node_modules/@lminii/material-react-table/dist/index.d.ts` for `editDisplayMode`, `onEditingRowSave`, `onCreatingRowSave`, `_valuesCache`, and `editInputRefs` to see the exact signatures. The Editing guide at `/docs/guides/editing` lists the related table, column, and state options, and `/docs/examples/editing-crud`, `editing-crud-row`, `editing-crud-cell`, `editing-crud-table`, and `editing-crud-tree` are complete TanStack Query CRUD examples.
