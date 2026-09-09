import {
  type MRT_ColumnDef,
  MRT_TableContainer,
  useMaterialReactTable,
} from 'material-react-table';

const Code = ({ children }: { children: string }) => (
  <code style={{ whiteSpace: 'pre-wrap' }}>{children}</code>
);

type SkillRow = { skill: string; loadFor: string };

const skillColumns: MRT_ColumnDef<SkillRow>[] = [
  {
    accessorKey: 'skill',
    header: 'Skill',
    Cell: ({ cell }) => <Code>{cell.getValue<string>()}</Code>,
  },
  { accessorKey: 'loadFor', header: 'Load it for' },
];

const skillData: SkillRow[] = [
  {
    skill: 'getting-started',
    loadFor:
      'Installing V4, defining columns, the useMaterialReactTable plus table prop pattern, and the sub-component exports.',
  },
  {
    skill: 'customization',
    loadFor:
      'mui*Props, render* overrides, display columns, icons, and Material UI theming.',
  },
  {
    skill: 'composable-components',
    loadFor: 'Building a custom layout from the exported MRT_* components.',
  },
  {
    skill: 'state-and-server-data',
    loadFor:
      'Controlled state, on*Change callbacks, manual* options, rowCount, and TanStack Query integration.',
  },
  {
    skill: 'editing',
    loadFor:
      'The five edit display modes, create rows, validation, and saving to a server.',
  },
  {
    skill: 'filtering',
    loadFor:
      'Column filter variants and modes, global filtering, faceted values, and custom filter functions.',
  },
  {
    skill: 'virtualization',
    loadFor:
      'Row and column virtualization, virtualizer options, and scroll-to-index.',
  },
  {
    skill: 'localization',
    loadFor: 'The bundled locales and custom localization strings.',
  },
  {
    skill: 'drag-and-drop-ordering',
    loadFor: 'Column and row drag and drop ordering.',
  },
  {
    skill: 'migrate-v3-to-v4',
    loadFor:
      'Moving an app from material-react-table V3 to @lminii/material-react-table V4.',
  },
];

type ToolRow = { tool: string; returns: string };

const toolColumns: MRT_ColumnDef<ToolRow>[] = [
  {
    accessorKey: 'tool',
    header: 'Tool',
    Cell: ({ cell }) => <Code>{cell.getValue<string>()}</Code>,
  },
  { accessorKey: 'returns', header: 'Returns' },
];

const toolData: ToolRow[] = [
  {
    tool: 'search_mrt_api',
    returns:
      'Table options, column options, state slices, and instance methods matching a query.',
  },
  {
    tool: 'get_mrt_api',
    returns:
      'The type, default, source library, description, and docs link for one entry by exact name.',
  },
  {
    tool: 'list_mrt_api',
    returns:
      'Every entry in one category, optionally filtered by a name prefix such as mui, render, enable, or on.',
  },
  {
    tool: 'search_mrt_docs',
    returns:
      'Which guide, reference page, skill, or example covers a topic, and which tool returns it.',
  },
  {
    tool: 'get_mrt_guide',
    returns:
      'One of the feature guides on this site as Markdown, with its relevant options expanded and its live examples named.',
  },
  {
    tool: 'get_mrt_reference',
    returns: 'The MRT Components or MRT Hooks reference page.',
  },
  {
    tool: 'get_mrt_example',
    returns:
      'The TypeScript or JavaScript source of any example on this site.',
  },
  {
    tool: 'get_mrt_migration_guide',
    returns: 'The complete V3 to V4 migration guide.',
  },
  {
    tool: 'get_mrt_skill',
    returns:
      'Any of the skills above, for agents that cannot install skills themselves.',
  },
];

const useDocsTable = <TData extends Record<string, any>>(
  columns: MRT_ColumnDef<TData>[],
  data: TData[],
) =>
  useMaterialReactTable({
    columns,
    data,
    defaultColumn: {
      muiTableHeadCellProps: { sx: { fontSize: '16px' } },
      muiTableBodyCellProps: { sx: { fontSize: '16px' } },
    },
    enableColumnActions: false,
    enableSorting: false,
  });

export const SkillsTable = () => {
  const table = useDocsTable(skillColumns, skillData);
  return <MRT_TableContainer table={table} />;
};

export const McpToolsTable = () => {
  const table = useDocsTable(toolColumns, toolData);
  return <MRT_TableContainer table={table} />;
};
