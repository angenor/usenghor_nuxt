import type { MergeTableData, MergeTableCell, MergeTableConfig, SelectionRect } from './types'
import { SelectionManager } from './SelectionManager'
import { IconMerge, IconUnmerge, IconAddRow, IconDeleteRow, IconAddColumn, IconDeleteColumn } from './icons'

/**
 * Gère le rendu et les opérations sur le tableau
 */
export class Table {
  private data: MergeTableData
  private config: MergeTableConfig
  private readOnly: boolean
  private wrapper: HTMLElement
  private tableElement: HTMLTableElement | null = null
  private toolbar: HTMLElement | null = null
  private selectionManager: SelectionManager
  private onChange: () => void

  // Système d'historique pour Undo/Redo
  private history: string[] = []
  private historyIndex = -1
  private maxHistorySize = 50
  private isUndoRedo = false
  private saveHistoryTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(
    data: MergeTableData,
    config: MergeTableConfig,
    readOnly: boolean,
    onChange: () => void
  ) {
    this.data = data
    this.config = config
    this.readOnly = readOnly
    this.onChange = onChange
    this.selectionManager = new SelectionManager()
    this.wrapper = this.createWrapper()

    // Sauvegarder l'état initial
    this.saveToHistory()

    // Écouter les raccourcis clavier pour Undo/Redo
    if (!readOnly) {
      this.handleKeyDown = this.handleKeyDown.bind(this)
      document.addEventListener('keydown', this.handleKeyDown)
    }
  }

  /**
   * Retourne l'élément DOM du tableau
   */
  getElement(): HTMLElement {
    return this.wrapper
  }

  /**
   * Retourne les données actuelles du tableau
   */
  getData(): MergeTableData {
    this.syncDataFromDOM()
    return this.data
  }

  /**
   * Définit l'état des en-têtes
   */
  setWithHeadings(value: boolean): void {
    this.saveToHistory()
    this.data.withHeadings = value
    this.render()
    this.saveToHistory()
    this.onChange()
  }

  /**
   * Détruit le tableau et libère les ressources
   */
  destroy(): void {
    this.selectionManager.detach()
    this.removeToolbar()
    document.removeEventListener('keydown', this.handleKeyDown)
    if (this.saveHistoryTimeout) {
      clearTimeout(this.saveHistoryTimeout)
    }
  }

  /**
   * Gère les raccourcis clavier (Undo/Redo)
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Vérifier si le focus est dans ce tableau
    if (!this.wrapper.contains(document.activeElement) && !this.wrapper.contains(event.target as Node)) {
      return
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const isUndo = (isMac ? event.metaKey : event.ctrlKey) && event.key === 'z' && !event.shiftKey
    const isRedo = (isMac ? event.metaKey : event.ctrlKey) && ((event.key === 'z' && event.shiftKey) || event.key === 'y')

    if (isUndo) {
      event.preventDefault()
      event.stopPropagation()
      this.undo()
    } else if (isRedo) {
      event.preventDefault()
      event.stopPropagation()
      this.redo()
    }
  }

  /**
   * Sauvegarde l'état actuel dans l'historique
   */
  private saveToHistory(): void {
    if (this.isUndoRedo) return

    // Synchroniser les données depuis le DOM avant de sauvegarder
    this.syncDataFromDOM()

    const state = JSON.stringify(this.data)

    // Ne pas sauvegarder si c'est identique au dernier état
    if (this.history[this.historyIndex] === state) return

    // Supprimer les états après l'index actuel (si on a fait des undo)
    this.history = this.history.slice(0, this.historyIndex + 1)

    // Ajouter le nouvel état
    this.history.push(state)
    this.historyIndex = this.history.length - 1

    // Limiter la taille de l'historique
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.historyIndex--
    }
  }

  /**
   * Annule la dernière action (Undo)
   */
  private undo(): void {
    if (this.historyIndex <= 0) return

    this.isUndoRedo = true
    this.historyIndex--
    this.restoreFromHistory()
    this.isUndoRedo = false
  }

  /**
   * Rétablit l'action annulée (Redo)
   */
  private redo(): void {
    if (this.historyIndex >= this.history.length - 1) return

    this.isUndoRedo = true
    this.historyIndex++
    this.restoreFromHistory()
    this.isUndoRedo = false
  }

  /**
   * Restaure l'état depuis l'historique
   */
  private restoreFromHistory(): void {
    const state = this.history[this.historyIndex]
    if (!state) return

    this.data = JSON.parse(state)
    this.render()
    this.onChange()
  }

  /**
   * Sauvegarde l'historique avec un délai (debounce)
   */
  private debounceSaveHistory(): void {
    if (this.saveHistoryTimeout) {
      clearTimeout(this.saveHistoryTimeout)
    }
    this.saveHistoryTimeout = setTimeout(() => {
      this.saveToHistory()
      this.saveHistoryTimeout = null
    }, 500)
  }

  /**
   * Fusionne les cellules sélectionnées
   */
  mergeSelectedCells(): void {
    const rect = this.selectionManager.getSelectionRect()
    if (!rect) return

    if (!this.selectionManager.isValidMergeSelection(this.data.content)) {
      console.warn('Sélection invalide pour la fusion')
      return
    }

    // Sauvegarder l'état avant modification
    this.saveToHistory()

    // La cellule en haut à gauche devient la cellule fusionnée
    const masterCell = this.data.content[rect.minRow][rect.minCol]

    // Collecter le contenu de toutes les cellules
    const contents: string[] = []
    for (let row = rect.minRow; row <= rect.maxRow; row++) {
      for (let col = rect.minCol; col <= rect.maxCol; col++) {
        const cell = this.data.content[row][col]
        if (cell.content && cell.content.trim()) {
          contents.push(cell.content)
        }
      }
    }

    // Mettre à jour la cellule maître
    masterCell.content = contents.join('<br>')
    masterCell.colspan = rect.maxCol - rect.minCol + 1
    masterCell.rowspan = rect.maxRow - rect.minRow + 1
    masterCell.merged = false
    delete masterCell.mergedBy

    // Marquer les autres cellules comme fusionnées
    for (let row = rect.minRow; row <= rect.maxRow; row++) {
      for (let col = rect.minCol; col <= rect.maxCol; col++) {
        if (row === rect.minRow && col === rect.minCol) continue

        this.data.content[row][col] = {
          content: '',
          merged: true,
          mergedBy: { row: rect.minRow, col: rect.minCol },
        }
      }
    }

    this.selectionManager.clearSelection()
    this.render()
    this.saveToHistory()
    this.onChange()
  }

  /**
   * Scinde une cellule fusionnée
   */
  unmergeCells(): void {
    const rect = this.selectionManager.getSelectionRect()
    if (!rect) return

    // Trouver la cellule maître
    const masterCell = this.data.content[rect.minRow][rect.minCol]
    if (!masterCell.colspan || masterCell.colspan <= 1) {
      if (!masterCell.rowspan || masterCell.rowspan <= 1) {
        return // Pas une cellule fusionnée
      }
    }

    // Sauvegarder l'état avant modification
    this.saveToHistory()

    const colspan = masterCell.colspan || 1
    const rowspan = masterCell.rowspan || 1

    // Réinitialiser toutes les cellules de la fusion
    for (let row = rect.minRow; row < rect.minRow + rowspan; row++) {
      for (let col = rect.minCol; col < rect.minCol + colspan; col++) {
        this.data.content[row][col] = {
          content: row === rect.minRow && col === rect.minCol ? masterCell.content : '',
          colspan: 1,
          rowspan: 1,
          merged: false,
        }
      }
    }

    this.selectionManager.clearSelection()
    this.render()
    this.saveToHistory()
    this.onChange()
  }

  /**
   * Ajoute une ligne à l'index spécifié
   */
  addRow(index: number): void {
    this.saveToHistory()
    const colCount = this.getColumnCount()
    const newRow: MergeTableCell[] = []

    for (let col = 0; col < colCount; col++) {
      // Vérifier si une cellule au-dessus a un rowspan qui couvre cette ligne
      let cellAbove: MergeTableCell | null = null
      for (let row = index - 1; row >= 0; row--) {
        const cell = this.data.content[row][col]
        if (!cell.merged) {
          cellAbove = cell
          break
        }
      }

      if (cellAbove && cellAbove.rowspan && cellAbove.rowspan > 1) {
        // Étendre le rowspan
        cellAbove.rowspan++
        newRow.push({
          content: '',
          merged: true,
          mergedBy: { row: this.findMasterRow(index - 1, col), col },
        })
      } else {
        newRow.push({ content: '', colspan: 1, rowspan: 1 })
      }
    }

    this.data.content.splice(index, 0, newRow)

    // Mettre à jour les références mergedBy pour les lignes après l'insertion
    for (let row = index + 1; row < this.data.content.length; row++) {
      for (let col = 0; col < colCount; col++) {
        const cell = this.data.content[row][col]
        if (cell.mergedBy && cell.mergedBy.row >= index) {
          cell.mergedBy.row++
        }
      }
    }

    this.render()
    this.saveToHistory()
    this.onChange()
  }

  /**
   * Supprime une ligne à l'index spécifié
   */
  deleteRow(index: number): void {
    if (this.data.content.length <= 1) return

    this.saveToHistory()
    const colCount = this.getColumnCount()

    // Gérer les cellules fusionnées
    for (let col = 0; col < colCount; col++) {
      const cell = this.data.content[index][col]

      if (!cell.merged && cell.rowspan && cell.rowspan > 1) {
        // Cette cellule est un master avec rowspan > 1
        // Transférer le master à la ligne suivante
        const nextRow = this.data.content[index + 1]
        if (nextRow) {
          nextRow[col] = {
            content: cell.content,
            colspan: cell.colspan,
            rowspan: cell.rowspan - 1,
            merged: false,
          }
          // Mettre à jour les références
          for (let r = index + 2; r < index + cell.rowspan; r++) {
            if (this.data.content[r]?.[col]) {
              this.data.content[r][col].mergedBy = { row: index + 1, col }
            }
          }
        }
      }
    }

    this.data.content.splice(index, 1)

    // Mettre à jour les références mergedBy
    for (let row = 0; row < this.data.content.length; row++) {
      for (let col = 0; col < colCount; col++) {
        const cell = this.data.content[row][col]
        if (cell.mergedBy && cell.mergedBy.row > index) {
          cell.mergedBy.row--
        }
      }
    }

    this.render()
    this.saveToHistory()
    this.onChange()
  }

  /**
   * Ajoute une colonne à l'index spécifié
   */
  addColumn(index: number): void {
    this.saveToHistory()
    for (let row = 0; row < this.data.content.length; row++) {
      // Vérifier si une cellule à gauche a un colspan qui couvre cette colonne
      let cellLeft: MergeTableCell | null = null
      for (let col = index - 1; col >= 0; col--) {
        const cell = this.data.content[row][col]
        if (!cell.merged) {
          cellLeft = cell
          break
        }
      }

      if (cellLeft && cellLeft.colspan && cellLeft.colspan > 1) {
        // Étendre le colspan
        cellLeft.colspan++
        this.data.content[row].splice(index, 0, {
          content: '',
          merged: true,
          mergedBy: { row, col: this.findMasterCol(row, index - 1) },
        })
      } else {
        this.data.content[row].splice(index, 0, { content: '', colspan: 1, rowspan: 1 })
      }
    }

    // Mettre à jour les références mergedBy
    for (let row = 0; row < this.data.content.length; row++) {
      for (let col = 0; col < this.data.content[row].length; col++) {
        const cell = this.data.content[row][col]
        if (cell.mergedBy && cell.mergedBy.col >= index) {
          cell.mergedBy.col++
        }
      }
    }

    this.render()
    this.saveToHistory()
    this.onChange()
  }

  /**
   * Supprime une colonne à l'index spécifié
   */
  deleteColumn(index: number): void {
    if (this.getColumnCount() <= 1) return

    this.saveToHistory()
    for (let row = 0; row < this.data.content.length; row++) {
      const cell = this.data.content[row][index]

      if (!cell.merged && cell.colspan && cell.colspan > 1) {
        // Cette cellule est un master avec colspan > 1
        // Transférer le master à la colonne suivante
        const nextCell = this.data.content[row][index + 1]
        if (nextCell) {
          this.data.content[row][index + 1] = {
            content: cell.content,
            colspan: cell.colspan - 1,
            rowspan: cell.rowspan,
            merged: false,
          }
          // Mettre à jour les références
          for (let c = index + 2; c < index + cell.colspan; c++) {
            if (this.data.content[row][c]) {
              this.data.content[row][c].mergedBy = { row, col: index + 1 }
            }
          }
        }
      }

      this.data.content[row].splice(index, 1)
    }

    // Mettre à jour les références mergedBy
    for (let row = 0; row < this.data.content.length; row++) {
      for (let col = 0; col < this.data.content[row].length; col++) {
        const cell = this.data.content[row][col]
        if (cell.mergedBy && cell.mergedBy.col > index) {
          cell.mergedBy.col--
        }
      }
    }

    this.render()
    this.saveToHistory()
    this.onChange()
  }

  private createWrapper(): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.className = 'mt-wrap'
    this.render()
    wrapper.appendChild(this.tableElement!)

    if (!this.readOnly) {
      this.createAddButtons(wrapper)
    }

    return wrapper
  }

  private render(): void {
    const oldTable = this.tableElement
    this.tableElement = this.createTable()

    if (oldTable && oldTable.parentNode) {
      oldTable.parentNode.replaceChild(this.tableElement, oldTable)
    } else if (this.wrapper) {
      // Insérer au début du wrapper (avant les boutons d'ajout)
      this.wrapper.insertBefore(this.tableElement, this.wrapper.firstChild)
    }

    if (!this.readOnly) {
      this.selectionManager.attach(this.tableElement, (rect) => this.onSelectionChange(rect))
    }
  }

  private createTable(): HTMLTableElement {
    const table = document.createElement('table')
    table.className = 'mt-table w-full border-collapse'

    const tbody = document.createElement('tbody')

    for (let rowIdx = 0; rowIdx < this.data.content.length; rowIdx++) {
      const row = this.data.content[rowIdx]
      const tr = document.createElement('tr')
      tr.className = 'mt-row'

      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cellData = row[colIdx]

        // Ignorer les cellules couvertes par une fusion
        if (cellData.merged) continue

        const isHeader = this.data.withHeadings && rowIdx === 0
        const cell = document.createElement(isHeader ? 'th' : 'td')
        cell.className = `mt-cell border border-gray-300 dark:border-gray-600 px-3 py-2 ${isHeader ? 'bg-gray-50 dark:bg-gray-700 font-semibold' : 'bg-white dark:bg-gray-800'} text-gray-900 dark:text-gray-100`

        if (!this.readOnly) {
          cell.contentEditable = 'true'
          cell.addEventListener('input', () => {
            this.onChange()
            // Sauvegarder l'historique après un délai (debounce)
            this.debounceSaveHistory()
          })
          cell.addEventListener('paste', (e) => this.handlePaste(e, cell))
          // Sauvegarder avant de commencer à éditer
          cell.addEventListener('focus', () => this.saveToHistory())
        }

        cell.innerHTML = cellData.content || ''

        if (cellData.colspan && cellData.colspan > 1) {
          cell.colSpan = cellData.colspan
        }
        if (cellData.rowspan && cellData.rowspan > 1) {
          cell.rowSpan = cellData.rowspan
        }

        // Stocker les coordonnées pour les événements
        cell.dataset.row = rowIdx.toString()
        cell.dataset.col = colIdx.toString()

        tr.appendChild(cell)
      }

      tbody.appendChild(tr)
    }

    table.appendChild(tbody)
    return table
  }

  private createAddButtons(wrapper: HTMLElement): void {
    // Bouton pour ajouter une ligne
    const addRowBtn = document.createElement('button')
    addRowBtn.type = 'button'
    addRowBtn.className = 'mt-add-row'
    addRowBtn.innerHTML = '+ Ligne'
    addRowBtn.title = 'Ajouter une ligne'
    addRowBtn.addEventListener('click', () => this.addRow(this.data.content.length))
    wrapper.appendChild(addRowBtn)

    // Bouton pour ajouter une colonne
    const addColBtn = document.createElement('button')
    addColBtn.type = 'button'
    addColBtn.className = 'mt-add-col'
    addColBtn.innerHTML = '+ Colonne'
    addColBtn.title = 'Ajouter une colonne'
    addColBtn.addEventListener('click', () => this.addColumn(this.getColumnCount()))
    wrapper.appendChild(addColBtn)
  }

  private onSelectionChange(rect: SelectionRect | null): void {
    if (rect && this.selectionManager.getSelectedCellCount() >= 2) {
      this.showToolbar(rect)
    } else {
      this.removeToolbar()
    }
  }

  private showToolbar(rect: SelectionRect): void {
    this.removeToolbar()

    const toolbar = document.createElement('div')
    toolbar.className = 'mt-toolbar'

    // Bouton Fusionner
    const mergeBtn = document.createElement('button')
    mergeBtn.type = 'button'
    mergeBtn.className = 'mt-toolbar-btn'
    mergeBtn.innerHTML = `${IconMerge} <span>Fusionner</span>`
    mergeBtn.title = 'Fusionner les cellules'
    mergeBtn.disabled = !this.selectionManager.isValidMergeSelection(this.data.content)
    mergeBtn.addEventListener('click', () => this.mergeSelectedCells())
    toolbar.appendChild(mergeBtn)

    // Bouton Scinder (visible seulement si cellule fusionnée)
    const masterCell = this.data.content[rect.minRow]?.[rect.minCol]
    if (masterCell && ((masterCell.colspan && masterCell.colspan > 1) || (masterCell.rowspan && masterCell.rowspan > 1))) {
      const unmergeBtn = document.createElement('button')
      unmergeBtn.type = 'button'
      unmergeBtn.className = 'mt-toolbar-btn'
      unmergeBtn.innerHTML = `${IconUnmerge} <span>Scinder</span>`
      unmergeBtn.title = 'Scinder la cellule'
      unmergeBtn.addEventListener('click', () => this.unmergeCells())
      toolbar.appendChild(unmergeBtn)
    }

    // Positionner la toolbar
    this.positionToolbar(toolbar, rect)
    this.wrapper.appendChild(toolbar)
    this.toolbar = toolbar
  }

  private positionToolbar(toolbar: HTMLElement, rect: SelectionRect): void {
    if (!this.tableElement) return

    const firstCell = this.tableElement.querySelector(`[data-row="${rect.minRow}"][data-col="${rect.minCol}"]`) as HTMLElement
    if (!firstCell) return

    const cellRect = firstCell.getBoundingClientRect()
    const wrapperRect = this.wrapper.getBoundingClientRect()
    const tableRect = this.tableElement.getBoundingClientRect()

    toolbar.style.position = 'absolute'
    // Positionner au-dessus du tableau, pas au-dessus de la cellule
    // pour éviter que la toolbar soit coupée
    const topOffset = tableRect.top - wrapperRect.top - 45
    toolbar.style.top = `${Math.max(5, topOffset)}px`
    toolbar.style.left = `${cellRect.left - wrapperRect.left}px`
  }

  private removeToolbar(): void {
    if (this.toolbar) {
      this.toolbar.remove()
      this.toolbar = null
    }
  }

  private handlePaste(event: ClipboardEvent, cell: HTMLTableCellElement): void {
    event.preventDefault()
    const text = event.clipboardData?.getData('text/plain') || ''
    document.execCommand('insertText', false, text)
  }

  private syncDataFromDOM(): void {
    if (!this.tableElement) return

    const rows = this.tableElement.querySelectorAll('tr')
    rows.forEach((tr, rowIdx) => {
      const cells = tr.querySelectorAll('td, th')
      let colIdx = 0

      cells.forEach((cell) => {
        const cellElement = cell as HTMLTableCellElement
        const dataRow = parseInt(cellElement.dataset.row || '0', 10)
        const dataCol = parseInt(cellElement.dataset.col || '0', 10)

        if (this.data.content[dataRow]?.[dataCol]) {
          this.data.content[dataRow][dataCol].content = cellElement.innerHTML
        }
      })
    })
  }

  private getColumnCount(): number {
    if (!this.data.content.length) return 0
    return this.data.content[0].length
  }

  private findMasterRow(startRow: number, col: number): number {
    for (let row = startRow; row >= 0; row--) {
      const cell = this.data.content[row][col]
      if (!cell.merged) return row
    }
    return 0
  }

  private findMasterCol(row: number, startCol: number): number {
    for (let col = startCol; col >= 0; col--) {
      const cell = this.data.content[row][col]
      if (!cell.merged) return col
    }
    return 0
  }
}
