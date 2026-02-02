/**
 * Gestionnaire de redimensionnement des colonnes du tableau
 */
export class ResizeManager {
  private tableElement: HTMLTableElement | null = null
  private columnWidths: number[] = []
  private isResizing = false
  private currentColumnIndex = -1
  private startX = 0
  private startWidth = 0
  private resizeHandles: HTMLElement[] = []
  private onResize: ((widths: number[]) => void) | null = null
  private minColumnWidth = 50 // Largeur minimale en pixels

  constructor() {
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
  }

  /**
   * Attache le gestionnaire à un élément table
   */
  attach(
    table: HTMLTableElement,
    initialWidths: number[] | undefined,
    onResize: (widths: number[]) => void
  ): void {
    this.tableElement = table
    this.onResize = onResize

    // Initialiser les largeurs
    this.initializeWidths(initialWidths)

    // Créer les poignées de redimensionnement
    this.createResizeHandles()

    // Ajouter les écouteurs globaux
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  }

  /**
   * Détache le gestionnaire
   */
  detach(): void {
    this.removeResizeHandles()
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
    this.tableElement = null
    this.onResize = null
  }

  /**
   * Retourne les largeurs actuelles des colonnes
   */
  getColumnWidths(): number[] {
    return [...this.columnWidths]
  }

  /**
   * Met à jour les largeurs des colonnes
   */
  setColumnWidths(widths: number[]): void {
    this.columnWidths = [...widths]
    this.applyWidths()
  }

  /**
   * Recalcule les poignées après un changement de structure
   */
  refresh(): void {
    this.removeResizeHandles()
    if (this.tableElement) {
      this.initializeWidths(this.columnWidths)
      this.createResizeHandles()
    }
  }

  private initializeWidths(initialWidths: number[] | undefined): void {
    if (!this.tableElement) return

    const firstRow = this.tableElement.querySelector('tr')
    if (!firstRow) return

    const cells = firstRow.querySelectorAll('th, td')
    const columnCount = this.getActualColumnCount()

    if (initialWidths && initialWidths.length === columnCount) {
      this.columnWidths = [...initialWidths]
    } else {
      // Calculer les largeurs par défaut basées sur la largeur du tableau
      const tableWidth = this.tableElement.offsetWidth
      const defaultWidth = Math.floor(tableWidth / columnCount)
      this.columnWidths = Array(columnCount).fill(defaultWidth)
    }

    this.applyWidths()
  }

  private getActualColumnCount(): number {
    if (!this.tableElement) return 0

    const firstRow = this.tableElement.querySelector('tr')
    if (!firstRow) return 0

    let count = 0
    const cells = firstRow.querySelectorAll('th, td')
    cells.forEach((cell) => {
      const colspan = (cell as HTMLTableCellElement).colSpan || 1
      count += colspan
    })

    return count
  }

  private applyWidths(): void {
    if (!this.tableElement) return

    // Appliquer les largeurs via un colgroup
    let colgroup = this.tableElement.querySelector('colgroup')
    if (!colgroup) {
      colgroup = document.createElement('colgroup')
      this.tableElement.insertBefore(colgroup, this.tableElement.firstChild)
    }

    // Vider le colgroup existant
    colgroup.innerHTML = ''

    // Créer les éléments col avec les largeurs
    this.columnWidths.forEach((width) => {
      const col = document.createElement('col')
      col.style.width = `${width}px`
      colgroup!.appendChild(col)
    })

    // S'assurer que le tableau utilise table-layout: fixed
    this.tableElement.style.tableLayout = 'fixed'
    this.tableElement.style.width = `${this.columnWidths.reduce((a, b) => a + b, 0)}px`
  }

  private createResizeHandles(): void {
    if (!this.tableElement) return

    const wrapper = this.tableElement.closest('.mt-wrap')
    if (!wrapper) return

    // Supprimer les anciennes poignées
    this.removeResizeHandles()

    // Créer un conteneur pour les poignées
    let handlesContainer = wrapper.querySelector('.mt-resize-handles') as HTMLElement
    if (!handlesContainer) {
      handlesContainer = document.createElement('div')
      handlesContainer.className = 'mt-resize-handles'
      wrapper.appendChild(handlesContainer)
    }

    // Calculer la position de départ du tableau
    const tableRect = this.tableElement.getBoundingClientRect()
    const wrapperRect = wrapper.getBoundingClientRect()
    const tableOffsetLeft = tableRect.left - wrapperRect.left
    const tableOffsetTop = tableRect.top - wrapperRect.top

    // Créer une poignée pour chaque bordure de colonne (sauf la dernière)
    let currentX = tableOffsetLeft
    for (let i = 0; i < this.columnWidths.length - 1; i++) {
      currentX += this.columnWidths[i]

      const handle = document.createElement('div')
      handle.className = 'mt-resize-handle'
      handle.dataset.columnIndex = i.toString()
      handle.style.left = `${currentX - 3}px`
      handle.style.top = `${tableOffsetTop}px`
      handle.style.height = `${tableRect.height}px`

      handle.addEventListener('mousedown', this.handleMouseDown)

      handlesContainer.appendChild(handle)
      this.resizeHandles.push(handle)
    }
  }

  private removeResizeHandles(): void {
    this.resizeHandles.forEach((handle) => {
      handle.removeEventListener('mousedown', this.handleMouseDown)
      handle.remove()
    })
    this.resizeHandles = []
  }

  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()

    const handle = event.target as HTMLElement
    const columnIndex = parseInt(handle.dataset.columnIndex || '-1', 10)

    if (columnIndex < 0) return

    this.isResizing = true
    this.currentColumnIndex = columnIndex
    this.startX = event.clientX
    this.startWidth = this.columnWidths[columnIndex]

    // Ajouter une classe pour le style de curseur global
    document.body.classList.add('mt-resizing')
    handle.classList.add('mt-resize-handle--active')
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return

    const deltaX = event.clientX - this.startX
    const newWidth = Math.max(this.minColumnWidth, this.startWidth + deltaX)

    // Mettre à jour la largeur de la colonne courante
    this.columnWidths[this.currentColumnIndex] = newWidth

    // Appliquer immédiatement
    this.applyWidths()
    this.updateHandlePositions()
  }

  private handleMouseUp(): void {
    if (!this.isResizing) return

    this.isResizing = false
    document.body.classList.remove('mt-resizing')

    // Retirer la classe active de la poignée
    const activeHandle = this.resizeHandles[this.currentColumnIndex]
    if (activeHandle) {
      activeHandle.classList.remove('mt-resize-handle--active')
    }

    this.currentColumnIndex = -1

    // Notifier le changement
    if (this.onResize) {
      this.onResize(this.getColumnWidths())
    }
  }

  private updateHandlePositions(): void {
    if (!this.tableElement) return

    const wrapper = this.tableElement.closest('.mt-wrap')
    if (!wrapper) return

    const tableRect = this.tableElement.getBoundingClientRect()
    const wrapperRect = wrapper.getBoundingClientRect()
    const tableOffsetLeft = tableRect.left - wrapperRect.left

    let currentX = tableOffsetLeft
    for (let i = 0; i < this.resizeHandles.length; i++) {
      currentX += this.columnWidths[i]
      this.resizeHandles[i].style.left = `${currentX - 3}px`
      this.resizeHandles[i].style.height = `${tableRect.height}px`
    }
  }
}
