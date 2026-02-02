import type { API, BlockAPI, PasteConfig, ToolboxConfig } from '@editorjs/editorjs'
import type {
  MergeTableData,
  MergeTableCell,
  MergeTableConfig,
  LegacyTableData,
  MergeTableConstructorOptions,
} from './types'
import { Table } from './Table'
import { IconTable, IconWithHeadings, IconWithoutHeadings } from './icons'

/**
 * Plugin EditorJS pour les tableaux avec fusion de cellules
 */
export class MergeTable {
  private api: API
  private readOnly: boolean
  private config: MergeTableConfig
  private data: MergeTableData
  private table: Table | null = null
  private block?: BlockAPI

  /**
   * Configuration de la toolbox EditorJS
   */
  static get toolbox(): ToolboxConfig {
    return {
      title: 'Tableau',
      icon: IconTable,
    }
  }

  /**
   * Indique que l'outil supporte le mode lecture seule
   */
  static get isReadOnlySupported(): boolean {
    return true
  }

  /**
   * Configuration du collage de contenu HTML
   */
  static get pasteConfig(): PasteConfig {
    return {
      tags: ['TABLE'],
    }
  }

  /**
   * Conversion depuis d'autres blocs
   */
  static get conversionConfig() {
    return {
      export: (data: MergeTableData): string => {
        // Export en texte simple (séparé par tabulations)
        return data.content
          .map((row) =>
            row
              .filter((cell) => !cell.merged)
              .map((cell) => cell.content)
              .join('\t')
          )
          .join('\n')
      },
      import: (text: string): MergeTableData => {
        // Import depuis texte (séparé par tabulations/nouvelles lignes)
        const rows = text.split('\n').map((line) =>
          line.split('\t').map((content) => ({
            content: content.trim(),
            colspan: 1,
            rowspan: 1,
            merged: false,
          }))
        )
        return {
          withHeadings: false,
          content: rows,
        }
      },
    }
  }

  constructor({ data, config, api, readOnly, block }: MergeTableConstructorOptions) {
    this.api = api
    this.readOnly = readOnly
    this.block = block
    this.config = {
      rows: config?.rows ?? 2,
      cols: config?.cols ?? 3,
      maxRows: config?.maxRows ?? 50,
      maxCols: config?.maxCols ?? 20,
    }

    // Migrer les données si nécessaire
    this.data = this.migrateData(data)
  }

  /**
   * Migre les données de l'ancien format vers le nouveau
   */
  private migrateData(data: MergeTableData | LegacyTableData | undefined): MergeTableData {
    // Si pas de données, créer un tableau vide
    if (!data || !data.content || !data.content.length) {
      return this.createEmptyTable()
    }

    // Vérifier si c'est déjà le nouveau format
    const firstCell = data.content[0]?.[0]
    if (typeof firstCell === 'object' && 'content' in firstCell) {
      return data as MergeTableData
    }

    // Migrer depuis l'ancien format (string[][])
    const legacyData = data as LegacyTableData
    return {
      withHeadings: legacyData.withHeadings ?? false,
      stretched: legacyData.stretched,
      content: (legacyData.content as string[][]).map((row) =>
        row.map((cellContent) => ({
          content: cellContent || '',
          colspan: 1,
          rowspan: 1,
          merged: false,
        }))
      ),
    }
  }

  /**
   * Crée un tableau vide avec la configuration par défaut
   */
  private createEmptyTable(): MergeTableData {
    const rows = this.config.rows || 2
    const cols = this.config.cols || 3

    const content: MergeTableCell[][] = []
    for (let r = 0; r < rows; r++) {
      const row: MergeTableCell[] = []
      for (let c = 0; c < cols; c++) {
        row.push({
          content: '',
          colspan: 1,
          rowspan: 1,
          merged: false,
        })
      }
      content.push(row)
    }

    return {
      withHeadings: true,
      content,
    }
  }

  /**
   * Rend le bloc dans l'éditeur
   */
  render(): HTMLElement {
    this.table = new Table(this.data, this.config, this.readOnly, () => {
      this.block?.dispatchChange()
    })
    return this.table.getElement()
  }

  /**
   * Sauvegarde les données du bloc
   */
  save(): MergeTableData {
    if (this.table) {
      return this.table.getData()
    }
    return this.data
  }

  /**
   * Valide les données du bloc
   */
  validate(data: MergeTableData): boolean {
    // Au moins une cellule avec du contenu
    return data.content.some((row) => row.some((cell) => cell.content && cell.content.trim()))
  }

  /**
   * Rend les paramètres du bloc (panneau latéral)
   */
  renderSettings(): HTMLElement[] {
    const settings: HTMLElement[] = []

    // Toggle en-têtes
    const headingsToggle = document.createElement('div')
    headingsToggle.className = 'cdx-settings-button'
    headingsToggle.innerHTML = this.data.withHeadings ? IconWithHeadings : IconWithoutHeadings
    headingsToggle.title = this.data.withHeadings ? 'Sans en-têtes' : 'Avec en-têtes'
    headingsToggle.addEventListener('click', () => {
      this.data.withHeadings = !this.data.withHeadings
      headingsToggle.innerHTML = this.data.withHeadings ? IconWithHeadings : IconWithoutHeadings
      headingsToggle.title = this.data.withHeadings ? 'Sans en-têtes' : 'Avec en-têtes'
      if (this.table) {
        this.table.setWithHeadings(this.data.withHeadings)
      }
    })
    settings.push(headingsToggle)

    return settings
  }

  /**
   * Gère le collage de tableaux HTML
   */
  onPaste(event: { data: HTMLTableElement }): void {
    const table = event.data
    const rows = table.querySelectorAll('tr')

    const content: MergeTableCell[][] = []

    rows.forEach((tr, rowIdx) => {
      const cells = tr.querySelectorAll('td, th')
      const rowContent: MergeTableCell[] = []

      cells.forEach((cell) => {
        const td = cell as HTMLTableCellElement
        const colspan = td.colSpan || 1
        const rowspan = td.rowSpan || 1

        rowContent.push({
          content: td.innerHTML || '',
          colspan,
          rowspan,
          merged: false,
        })

        // Ajouter des cellules fusionnées pour colspan
        for (let c = 1; c < colspan; c++) {
          rowContent.push({
            content: '',
            merged: true,
            mergedBy: { row: rowIdx, col: rowContent.length - colspan },
          })
        }
      })

      content.push(rowContent)
    })

    // Gérer les rowspan (ajouter des cellules fusionnées sur les lignes suivantes)
    for (let rowIdx = 0; rowIdx < content.length; rowIdx++) {
      for (let colIdx = 0; colIdx < content[rowIdx].length; colIdx++) {
        const cell = content[rowIdx][colIdx]
        if (cell.rowspan && cell.rowspan > 1) {
          for (let r = 1; r < cell.rowspan; r++) {
            if (content[rowIdx + r]) {
              // Insérer une cellule fusionnée
              content[rowIdx + r].splice(colIdx, 0, {
                content: '',
                merged: true,
                mergedBy: { row: rowIdx, col: colIdx },
              })
            }
          }
        }
      }
    }

    this.data = {
      withHeadings: table.querySelector('th') !== null,
      content,
    }

    // Re-render si la table existe
    if (this.table) {
      const wrapper = this.table.getElement()
      this.table.destroy()
      this.table = new Table(this.data, this.config, this.readOnly, () => {
        this.block?.dispatchChange()
      })
      wrapper.parentNode?.replaceChild(this.table.getElement(), wrapper)
    }
  }

  /**
   * Détruit le bloc et libère les ressources
   */
  destroy(): void {
    if (this.table) {
      this.table.destroy()
      this.table = null
    }
  }
}
