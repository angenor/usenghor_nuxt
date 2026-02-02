/**
 * Plugin MergeTable pour EditorJS
 * Tableau avec support de fusion de cellules (colspan/rowspan)
 */

export { MergeTable } from './MergeTable'
export { MergeTable as default } from './MergeTable'

export type {
  MergeTableData,
  MergeTableCell,
  MergeTableConfig,
  LegacyTableData,
  SelectionState,
  SelectionRect,
  CellCoords,
} from './types'
