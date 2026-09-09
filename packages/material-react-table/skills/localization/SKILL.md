---
name: localization
description: >
  Translate Material React Table V4 with the localization option: import a built-in locale from @lminii/material-react-table/locales/<code>, override individual MRT_Localization strings, write a full custom locale with the language BCP 47 tag, keep {column} placeholders, and pair it with Material UI theme locales and the date pickers adapterLocale. Load for i18n, translating toolbar and menu text, number formatting in pagination, or a locale import that fails to resolve.
metadata:
  type: framework
  library: '@lminii/material-react-table'
  library_version: '4.0.0'
  framework: react
requires:
  - getting-started
sources:
  - 'lminii/material-react-table:apps/material-react-table-docs/pages/docs/guides/localization.mdx'
  - 'lminii/material-react-table:apps/material-react-table-docs/examples/localization-i18n-de/sandbox/src/TS.tsx'
  - 'lminii/material-react-table:packages/material-react-table/src/locales/en.ts'
  - 'lminii/material-react-table:packages/material-react-table/src/hooks/useMRT_TableOptions.ts'
  - 'lminii/material-react-table:packages/material-react-table/src/types.ts'
---

This skill builds on `getting-started`. Every user-facing string MRT renders comes from one `MRT_Localization` object. The `localization` option takes a partial object that is merged over the English defaults, so a locale file or a handful of overrides both work.

## Setup

```tsx
import { MRT_Localization_DE } from '@lminii/material-react-table/locales/de'

const table = useMaterialReactTable({
  columns,
  data,
  localization: MRT_Localization_DE,
})
```

Built-in locales, imported from `@lminii/material-react-table/locales/<code>`: `ar`, `az`, `bg`, `cs`, `da`, `de`, `el`, `en`, `es`, `et`, `fa`, `fi`, `fr`, `he`, `hr`, `hu`, `hy`, `id`, `it`, `ja`, `ko`, `mk`, `nl`, `no`, `np`, `pl`, `pt`, `pt-BR`, `ro`, `ru`, `sk`, `sr-Cyrl-RS`, `sr-Latn-RS`, `sv`, `tr`, `uk`, `vi`, `zh-Hans`, `zh-Hant`. Each exports `MRT_Localization_<CODE>` with hyphens replaced by underscores, for example `MRT_Localization_PT_BR` and `MRT_Localization_ZH_HANS`. Column headers, cell content, and your own toolbar buttons are not translated by MRT; those come from your column definitions and render slots.

## Core Patterns

### Override a few strings

```tsx
const table = useMaterialReactTable({
  columns,
  data,
  localization: {
    ...MRT_Localization_DE,
    noRecordsToDisplay: 'Keine Personen gefunden',
    rowsPerPage: 'Personen pro Seite',
  },
})
```

Partial objects are merged over English, so an override object without a base locale still renders every other string. Keep the `localization` object stable (module scope or `useMemo`); MRT memoizes the merge on its identity.

### Write a custom locale

```tsx
import { type MRT_Localization } from '@lminii/material-react-table'

export const MRT_Localization_GA: MRT_Localization = {
  ...MRT_Localization_EN, // start from English so nothing is missing
  language: 'ga', // BCP 47 tag used for number formatting
  actions: 'Gníomhartha',
  filterByColumn: 'Scag de réir {column}',
  sortByColumnAsc: 'Sórtáil de réir {column} in ord ardaitheach',
  noRecordsToDisplay: 'Níl aon taifid le taispeáint',
}
```

`MRT_Localization` has around 90 keys; `language` is required on the type and feeds `toLocaleString` for the row counts in pagination and the selection banner. Strings such as `filterByColumn`, `sortByColumnAsc`, `dropToGroupBy`, and `filteringByColumn` contain `{column}` placeholders that MRT replaces with the column header, so keep the token verbatim. Fully translated locales are welcome as pull requests to `packages/material-react-table/src/locales`.

### Pair with Material UI and the date pickers

```tsx
import { createTheme, ThemeProvider, useTheme } from '@mui/material'
import { deDE } from '@mui/material/locale'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { deDE as pickersDeDE } from '@mui/x-date-pickers/locales'
import 'dayjs/locale/de'

const theme = useTheme()

<ThemeProvider theme={createTheme(theme, deDE, pickersDeDE)}>
  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
    <MaterialReactTable table={table} />
  </LocalizationProvider>
</ThemeProvider>
```

MRT's `localization` covers MRT strings only. Material UI's own component text (pagination select labels, accessibility labels) comes from the theme locale, and the date and time filter pickers take their month names and formats from the pickers locale and `adapterLocale`.

### Switch locales at runtime

```tsx
const locales = { en: MRT_Localization_EN, de: MRT_Localization_DE, ja: MRT_Localization_JA }

const table = useMaterialReactTable({
  columns,
  data,
  localization: locales[currentLanguage],
})
```

The table re-renders with the new strings; no state is reset.

## Common Mistakes

### HIGH Importing a locale from the upstream package name

Wrong:

```tsx
import { MRT_Localization_ES } from 'material-react-table/locales/es'
```

Correct:

```tsx
import { MRT_Localization_ES } from '@lminii/material-react-table/locales/es'
```

The fork publishes locales under its own `exports` map. The upstream path resolves only if the upstream package is also installed, which produces two copies of MRT.

Source: `MIGRATION.md`

### MEDIUM Custom locale without the language tag

Wrong:

```tsx
localization: { actions: 'Ações', cancel: 'Cancelar', rowsPerPage: 'Linhas por página' }
```

Correct:

```tsx
localization: { language: 'pt', actions: 'Ações', cancel: 'Cancelar', rowsPerPage: 'Linhas por página' }
```

Without `language`, the English `en` tag from the merged defaults formats row counts, so `1.234` renders as `1,234`.

Source: `packages/material-react-table/src/locales/en.ts`

### MEDIUM Dropping the {column} placeholder

Wrong:

```tsx
localization: { filterByColumn: 'Filtrer' }
```

Correct:

```tsx
localization: { filterByColumn: 'Filtrer par {column}' }
```

MRT substitutes the header into `{column}`; without it the tooltip and placeholder no longer say which column they apply to.

Source: `packages/material-react-table/src/locales/en.ts`

### LOW Passing an unstable localization object

Wrong:

```tsx
localization: { ...MRT_Localization_FR, noRecordsToDisplay: t('empty') }, // new object each render
```

Correct:

```tsx
const localization = useMemo(() => ({ ...MRT_Localization_FR, noRecordsToDisplay: t('empty') }), [t])
```

A fresh object every render re-runs the merge and invalidates the memoized table options.

Source: `packages/material-react-table/src/hooks/useMRT_TableOptions.ts`

## API Discovery

`MRT_Localization` in `node_modules/@lminii/material-react-table/dist/index.d.ts` lists every key; `en.ts` in `packages/material-react-table/src/locales` is the reference translation. `ls node_modules/@lminii/material-react-table/locales` shows the shipped locale folders. The Localization guide at `/docs/guides/localization` renders an example per locale.
