import type { SelectionState, SelectionRect, CellCoords, MergeTableCell } from './types'

/**
 * Gère la sélection multi-cellules dans le tableau
 */
export class SelectionManager {
  private state: SelectionState = {
    active: false,
    startRow: -1,
    startCol: -1,
    endRow: -1,
    endCol: -1,
  }

  private tableElement: HTMLTableElement | null = null
  private isMouseDown = false
  private onSelectionChange: ((rect: SelectionRect | null) => void) | null = null

  constructor() {
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  /**
   * Attache le gestionnaire à un élément table
   */
  attach(table: HTMLTableElement, onChange?: (rect: SelectionRect | null) => void): void {
    this.tableElement = table
    this.onSelectionChange = onChange || null

    table.addEventListener('mousedown', this.handleMouseDown)
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
    document.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Détache le gestionnaire
   */
  detach(): void {
    if (this.tableElement) {
      this.tableElement.removeEventListener('mousedown', this.handleMouseDown)
    }
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
    document.removeEventListener('keydown', this.handleKeyDown)
    this.tableElement = null
    this.onSelectionChange = null
  }

  /**
   * Retourne le rectangle de sélection normalisé
   */
  getSelectionRect(): SelectionRect | null {
    if (!this.state.active) return null

    return {
      minRow: Math.min(this.state.startRow, this.state.endRow),
      maxRow: Math.max(this.state.startRow, this.state.endRow),
      minCol: Math.min(this.state.startCol, this.state.endCol),
      maxCol: Math.max(this.state.startCol, this.state.endCol),
    }
  }

  /**
   * Vérifie si une cellule est dans la sélection
   */
  isCellSelected(row: number, col: number): boolean {
    const rect = this.getSelectionRect()
    if (!rect) return false

    return row >= rect.minRow && row <= rect.maxRow && col >= rect.minCol && col <= rect.maxCol
  }

  /**
   * Retourne le nombre de cellules sélectionnées
   */
  getSelectedCellCount(): number {
    const rect = this.getSelectionRect()
    if (!rect) return 0

    return (rect.maxRow - rect.minRow + 1) * (rect.maxCol - rect.minCol + 1)
  }

  /**
   * Efface la sélection
   */
  clearSelection(): void {
    this.state = {
      active: false,
      startRow: -1,
      startCol: -1,
      endRow: -1,
      endCol: -1,
    }
    this.updateVisualSelection()
    this.notifyChange()
  }

  /**
   * Définit la sélection programmatiquement
   */
  setSelection(startRow: number, startCol: number, endRow: number, endCol: number): void {
    this.state = {
      active: true,
      startRow,
      startCol,
      endRow,
      endCol,
    }
    this.updateVisualSelection()
    this.notifyChange()
  }

  /**
   * Vérifie si la sélection est valide pour une fusion
   * (doit être rectangulaire et ne pas contenir de cellules déjà partiellement fusionnées)
   */
  isValidMergeSelection(data: MergeTableCell[][]): boolean {
    const rect = this.getSelectionRect()
    if (!rect) return false

    // Au moins 2 cellules
    if (this.getSelectedCellCount() < 2) return false

    // Vérifier que toutes les cellules de la sélection sont accessibles
    // et qu'aucune cellule fusionnée ne déborde de la sélection
    for (let row = rect.minRow; row <= rect.maxRow; row++) {
      for (let col = rect.minCol; col <= rect.maxCol; col++) {
        const cell = data[row]?.[col]
        if (!cell) return false

        // Si la cellule est fusionnée, vérifier que la cellule parente est aussi dans la sélection
        if (cell.merged && cell.mergedBy) {
          const parentRow = cell.mergedBy.row
          const parentCol = cell.mergedBy.col
          if (parentRow < rect.minRow || parentRow > rect.maxRow ||
              parentCol < rect.minCol || parentCol > rect.maxCol) {
            return false
          }
        }

        // Si la cellule a un colspan/rowspan, vérifier qu'elle ne déborde pas
        if (cell.colspan && cell.colspan > 1) {
          const endCol = col + cell.colspan - 1
          if (endCol > rect.maxCol) return false
        }
        if (cell.rowspan && cell.rowspan > 1) {
          const endRow = row + cell.rowspan - 1
          if (endRow > rect.maxRow) return false
        }
      }
    }

    return true
  }

  private handleMouseDown(event: MouseEvent): void {
    const cell = this.getCellFromEvent(event)
    if (!cell) return

    // Shift+click pour étendre la sélection
    if (event.shiftKey && this.state.active) {
      this.state.endRow = cell.row
      this.state.endCol = cell.col
      this.updateVisualSelection()
      this.notifyChange()
      event.preventDefault()
      return
    }

    this.isMouseDown = true
    this.state = {
      active: true,
      startRow: cell.row,
      startCol: cell.col,
      endRow: cell.row,
      endCol: cell.col,
    }
    this.updateVisualSelection()
    this.notifyChange()
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isMouseDown || !this.tableElement) return

    const cell = this.getCellFromEvent(event)
    if (!cell) return

    if (cell.row !== this.state.endRow || cell.col !== this.state.endCol) {
      this.state.endRow = cell.row
      this.state.endCol = cell.col
      this.updateVisualSelection()
      this.notifyChange()
    }
  }

  private handleMouseUp(): void {
    this.isMouseDown = false
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Escape pour annuler la sélection
    if (event.key === 'Escape') {
      this.clearSelection()
    }
  }

  private getCellFromEvent(event: MouseEvent): CellCoords | null {
    const target = event.target as HTMLElement
    const cell = target.closest('td, th') as HTMLTableCellElement | null
    if (!cell || !this.tableElement?.contains(cell)) return null

    const row = parseInt(cell.dataset.row || '-1', 10)
    const col = parseInt(cell.dataset.col || '-1', 10)

    if (row < 0 || col < 0) return null
    return { row, col }
  }

  private updateVisualSelection(): void {
    if (!this.tableElement) return

    // Retirer la classe de toutes les cellules
    const allCells = this.tableElement.querySelectorAll('td, th')
    allCells.forEach((cell) => {
      cell.classList.remove('mt-cell--selected', 'mt-cell--selection-start')
    })

    if (!this.state.active) return

    const rect = this.getSelectionRect()
    if (!rect) return

    // Ajouter la classe aux cellules sélectionnées
    allCells.forEach((cell) => {
      const cellElement = cell as HTMLTableCellElement
      const row = parseInt(cellElement.dataset.row || '-1', 10)
      const col = parseInt(cellElement.dataset.col || '-1', 10)

      if (row >= rect.minRow && row <= rect.maxRow && col >= rect.minCol && col <= rect.maxCol) {
        cell.classList.add('mt-cell--selected')

        // Marquer la cellule de départ
        if (row === this.state.startRow && col === this.state.startCol) {
          cell.classList.add('mt-cell--selection-start')
        }
      }
    })
  }

  private notifyChange(): void {
    if (this.onSelectionChange) {
      this.onSelectionChange(this.getSelectionRect())
    }
  }
}
