import type { API, BlockAPI, BlockTool, BlockToolConstructorOptions, BlockToolData } from '@editorjs/editorjs'

/**
 * Représente une cellule du tableau avec support de fusion
 */
export interface MergeTableCell {
  /** Contenu HTML de la cellule */
  content: string
  /** Nombre de colonnes à fusionner (défaut: 1) */
  colspan?: number
  /** Nombre de lignes à fusionner (défaut: 1) */
  rowspan?: number
  /** True si cette cellule est couverte par une cellule fusionnée */
  merged?: boolean
  /** Référence à la cellule qui couvre celle-ci */
  mergedBy?: {
    row: number
    col: number
  }
}

/**
 * Données du bloc tableau avec support de fusion
 */
export interface MergeTableData extends BlockToolData {
  /** Indique si la première ligne est un en-tête */
  withHeadings: boolean
  /** Tableau 2D des cellules */
  content: MergeTableCell[][]
  /** Étirer le tableau sur toute la largeur */
  stretched?: boolean
  /** Largeurs des colonnes en pixels ou pourcentage */
  columnWidths?: number[]
}

/**
 * Ancien format de données (pour rétrocompatibilité)
 */
export interface LegacyTableData extends BlockToolData {
  withHeadings: boolean
  content: string[][]
  stretched?: boolean
}

/**
 * Configuration du plugin MergeTable
 */
export interface MergeTableConfig {
  /** Nombre de lignes initial */
  rows?: number
  /** Nombre de colonnes initial */
  cols?: number
  /** Nombre maximum de lignes */
  maxRows?: number
  /** Nombre maximum de colonnes */
  maxCols?: number
}

/**
 * État de la sélection de cellules
 */
export interface SelectionState {
  /** Sélection active */
  active: boolean
  /** Ligne de départ */
  startRow: number
  /** Colonne de départ */
  startCol: number
  /** Ligne de fin */
  endRow: number
  /** Colonne de fin */
  endCol: number
}

/**
 * Rectangle de sélection normalisé (minRow <= maxRow, minCol <= maxCol)
 */
export interface SelectionRect {
  minRow: number
  maxRow: number
  minCol: number
  maxCol: number
}

/**
 * Coordonnées d'une cellule
 */
export interface CellCoords {
  row: number
  col: number
}

/**
 * Options du constructeur du Block Tool
 */
export interface MergeTableConstructorOptions extends BlockToolConstructorOptions<MergeTableData, MergeTableConfig> {
  data: MergeTableData | LegacyTableData
  config?: MergeTableConfig
  api: API
  readOnly: boolean
  block?: BlockAPI
}

/**
 * Interface pour le Block Tool MergeTable
 */
export interface MergeTableTool extends BlockTool {
  render(): HTMLElement
  save(block: HTMLElement): MergeTableData
  validate?(data: MergeTableData): boolean
  renderSettings?(): HTMLElement | HTMLElement[]
  destroy?(): void
}

/**
 * Traductions i18n
 */
export interface MergeTableI18n {
  toolbox: {
    title: string
  }
  toolbar: {
    merge: string
    unmerge: string
    withHeadings: string
    withoutHeadings: string
  }
  contextMenu: {
    mergeCells: string
    unmergeCells: string
    insertRowAbove: string
    insertRowBelow: string
    insertColumnLeft: string
    insertColumnRight: string
    deleteRow: string
    deleteColumn: string
  }
  errors: {
    invalidSelection: string
    nonRectangular: string
    alreadyMerged: string
  }
}
