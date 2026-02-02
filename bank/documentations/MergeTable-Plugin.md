# Plugin MergeTable pour EditorJS

## Vue d'ensemble

MergeTable est un plugin EditorJS personnalisé qui étend les fonctionnalités du tableau standard en ajoutant le support de la **fusion de cellules** (colspan/rowspan). Ce plugin a été développé spécifiquement pour le projet USenghor car le plugin officiel `@editorjs/table` ne supporte pas cette fonctionnalité.

## Fonctionnalités

- **Fusion de cellules** : Fusionner 2 ou plusieurs cellules horizontalement (colspan) et/ou verticalement (rowspan)
- **Scission de cellules** : Diviser une cellule fusionnée en cellules individuelles
- **Ajout/Suppression de lignes et colonnes** : Avec gestion intelligente des cellules fusionnées
- **Undo/Redo** : Support complet de Ctrl+Z / Cmd+Z pour annuler les actions
- **Sélection multi-cellules** : Sélection par clic-glisser ou Shift+Clic
- **Rétrocompatibilité** : Migration automatique des anciens tableaux vers le nouveau format
- **Redimensionnement des colonnes** : Ajuster la largeur des colonnes par glisser-déposer
- **Mode sombre** : Support complet du dark mode via Tailwind CSS
- **i18n** : Interface en français

## Installation

Le plugin est inclus dans le projet et n'a pas besoin d'installation npm séparée.

### Emplacement des fichiers

```
app/components/editorjs/MergeTable/
├── index.ts              # Export principal
├── MergeTable.ts         # Classe Block Tool EditorJS
├── Table.ts              # Gestion du tableau, fusion, historique
├── SelectionManager.ts   # Sélection multi-cellules
├── ResizeManager.ts      # Redimensionnement des colonnes
├── types.ts              # Interfaces TypeScript
├── icons.ts              # Icônes SVG
└── styles.css            # Styles CSS (également dans EditorJS.vue)
```

## Utilisation

### Intégration avec EditorJS

```typescript
import { MergeTable } from '~/components/editorjs/MergeTable'

const editor = new EditorJS({
  tools: {
    table: {
      class: MergeTable,
      inlineToolbar: true,
      config: {
        rows: 2,    // Nombre de lignes initial
        cols: 3,    // Nombre de colonnes initial
      },
    },
  },
})
```

### Création d'un tableau programmatiquement

```typescript
// Format MergeTable avec cellules
const tableData = {
  withHeadings: true,
  content: [
    [
      { content: 'En-tête 1', colspan: 1, rowspan: 1 },
      { content: 'En-tête 2', colspan: 1, rowspan: 1 },
      { content: 'En-tête 3', colspan: 1, rowspan: 1 },
    ],
    [
      { content: 'Cellule 1', colspan: 1, rowspan: 1 },
      { content: 'Cellule 2', colspan: 1, rowspan: 1 },
      { content: 'Cellule 3', colspan: 1, rowspan: 1 },
    ],
  ],
}
```

## Format de données

### Nouveau format (avec fusion)

```typescript
interface MergeTableCell {
  content: string       // Contenu HTML de la cellule
  colspan?: number      // Nombre de colonnes fusionnées (défaut: 1)
  rowspan?: number      // Nombre de lignes fusionnées (défaut: 1)
  merged?: boolean      // True si couverte par une autre cellule
  mergedBy?: {          // Référence à la cellule parente
    row: number
    col: number
  }
}

interface MergeTableData {
  withHeadings: boolean   // Première ligne = en-tête
  content: MergeTableCell[][]
  stretched?: boolean     // Étirer sur toute la largeur
  columnWidths?: number[] // Largeurs des colonnes en pixels
}
```

### Exemple de cellules fusionnées

```typescript
// Tableau 3x3 avec fusion de A1+A2 (rowspan=2) et B1+C1 (colspan=2)
{
  withHeadings: true,
  content: [
    [
      { content: 'A1+A2', colspan: 1, rowspan: 2 },
      { content: 'B1+C1', colspan: 2, rowspan: 1 },
      { content: '', merged: true, mergedBy: { row: 0, col: 1 } },
    ],
    [
      { content: '', merged: true, mergedBy: { row: 0, col: 0 } },
      { content: 'B2', colspan: 1, rowspan: 1 },
      { content: 'C2', colspan: 1, rowspan: 1 },
    ],
    [
      { content: 'A3', colspan: 1, rowspan: 1 },
      { content: 'B3', colspan: 1, rowspan: 1 },
      { content: 'C3', colspan: 1, rowspan: 1 },
    ],
  ],
}
```

### Ancien format (rétrocompatible)

```typescript
// Ancien format @editorjs/table - migré automatiquement
{
  withHeadings: true,
  content: [
    ['En-tête 1', 'En-tête 2', 'En-tête 3'],
    ['Cellule 1', 'Cellule 2', 'Cellule 3'],
  ],
}
```

## Guide d'utilisation

### Sélectionner des cellules

| Action | Description |
|--------|-------------|
| **Clic + Glisser** | Sélectionner une zone rectangulaire de cellules |
| **Shift + Clic** | Étendre la sélection de la cellule active jusqu'au clic |
| **Échap** | Annuler la sélection |

### Fusionner des cellules

1. Sélectionner 2 cellules ou plus (zone rectangulaire)
2. Une barre d'outils flottante apparaît au-dessus du tableau
3. Cliquer sur le bouton **"Fusionner"**

> **Note** : La sélection doit être rectangulaire et ne pas chevaucher partiellement d'autres cellules fusionnées.

### Scinder une cellule

1. Sélectionner une cellule fusionnée
2. Cliquer sur le bouton **"Scinder"** dans la barre d'outils

### Ajouter des lignes/colonnes

- Cliquer sur **"+ Ligne"** en bas du tableau pour ajouter une ligne
- Cliquer sur **"+ Colonne"** pour ajouter une colonne

### Undo/Redo

| Raccourci | Action |
|-----------|--------|
| `Ctrl+Z` (Windows/Linux) ou `Cmd+Z` (Mac) | Annuler |
| `Ctrl+Shift+Z` ou `Ctrl+Y` (Windows/Linux) ou `Cmd+Shift+Z` (Mac) | Rétablir |

L'historique conserve jusqu'à 50 états et inclut :
- Fusion/Scission de cellules
- Ajout/Suppression de lignes et colonnes
- Modification du contenu des cellules
- Toggle des en-têtes
- Redimensionnement des colonnes

### Redimensionner les colonnes

1. Survoler la bordure entre deux colonnes (le curseur change en `col-resize`)
2. Cliquer et maintenir sur la bordure
3. Glisser horizontalement pour ajuster la largeur
4. Relâcher pour valider

> **Note** : La largeur minimale d'une colonne est de 50 pixels. Les largeurs sont sauvegardées avec le tableau.

## Rendu dans EditorJSRenderer

Le composant `EditorJSRenderer.vue` gère automatiquement le rendu des cellules fusionnées :

```typescript
case 'table':
  const rows = data.content || []
  const withHeadings = data.withHeadings ?? true

  // Détection automatique du format
  const isNewFormat = typeof rows[0]?.[0] === 'object' && 'content' in rows[0][0]

  // Rendu avec colspan/rowspan si nouveau format
  if (isNewFormat) {
    // Ignorer les cellules avec merged: true
    // Appliquer colspan/rowspan sur les cellules maîtres
  }
```

## Styles CSS

Les styles sont définis dans `EditorJS.vue` avec les classes suivantes :

| Classe | Description |
|--------|-------------|
| `.mt-wrap` | Wrapper du tableau avec padding pour la toolbar |
| `.mt-table` | Tableau principal |
| `.mt-cell` | Cellule du tableau |
| `.mt-cell--selected` | Cellule sélectionnée (fond bleu) |
| `.mt-cell--selection-start` | Première cellule de la sélection (animation) |
| `.mt-toolbar` | Barre d'outils flottante |
| `.mt-toolbar-btn` | Boutons de la toolbar |
| `.mt-add-row`, `.mt-add-col` | Boutons d'ajout ligne/colonne |
| `.mt-resize-handles` | Conteneur des poignées de redimensionnement |
| `.mt-resize-handle` | Poignée de redimensionnement de colonne |
| `.mt-resize-handle--active` | Poignée active pendant le glisser |
| `.mt-resizing` | Classe ajoutée au body pendant le redimensionnement |

## Architecture technique

### Classe MergeTable (Block Tool)

```typescript
class MergeTable {
  static get toolbox()        // Configuration de la toolbox EditorJS
  static get isReadOnlySupported()  // Support du mode lecture seule
  static get pasteConfig()    // Configuration du collage HTML

  constructor(options)        // Initialisation avec migration des données
  render(): HTMLElement       // Rendu du bloc
  save(): MergeTableData      // Sauvegarde des données
  validate(data): boolean     // Validation des données
  renderSettings(): HTMLElement[]  // Panneau de configuration (toggle en-têtes)
  onPaste(event)              // Gestion du collage de tableaux HTML
  destroy()                   // Nettoyage des ressources
}
```

### Classe Table (Core)

```typescript
class Table {
  // Propriétés
  private data: MergeTableData
  private history: string[]           // Historique pour Undo/Redo
  private selectionManager: SelectionManager

  // Méthodes publiques
  getElement(): HTMLElement
  getData(): MergeTableData
  setWithHeadings(value: boolean)
  destroy()

  // Opérations sur les cellules
  mergeSelectedCells()
  unmergeCells()

  // Opérations sur les lignes/colonnes
  addRow(index: number)
  deleteRow(index: number)
  addColumn(index: number)
  deleteColumn(index: number)

  // Historique
  private saveToHistory()
  private undo()
  private redo()
}
```

### Classe SelectionManager

```typescript
class SelectionManager {
  attach(table: HTMLTableElement, onChange: callback)
  detach()
  getSelectionRect(): SelectionRect | null
  isCellSelected(row: number, col: number): boolean
  getSelectedCellCount(): number
  clearSelection()
  setSelection(startRow, startCol, endRow, endCol)
  isValidMergeSelection(data: MergeTableCell[][]): boolean
}
```

### Classe ResizeManager

```typescript
class ResizeManager {
  // Configuration
  private minColumnWidth = 50  // Largeur minimale en pixels

  // Méthodes publiques
  attach(table: HTMLTableElement, initialWidths: number[] | undefined, onResize: callback)
  detach()
  getColumnWidths(): number[]
  setColumnWidths(widths: number[])
  refresh()  // Recalcule les poignées après changement de structure

  // Méthodes privées
  private createResizeHandles()
  private handleMouseDown/Move/Up()
  private applyWidths()  // Applique via colgroup
  private updateHandlePositions()
}
```

## Limitations connues

1. **Sélection rectangulaire uniquement** : Impossible de sélectionner des cellules non adjacentes
2. **Pas d'import Excel/CSV** : Le collage fonctionne uniquement avec du HTML
3. **Pas de couleurs de cellules** : Pas de personnalisation des couleurs

## Dépendances

- EditorJS v2.31.0+
- TypeScript
- Tailwind CSS (pour les styles)

## Auteur

Plugin développé pour le projet USenghor - Université Senghor d'Alexandrie.

## Licence

MIT
