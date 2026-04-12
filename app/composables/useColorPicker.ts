// Composable pour le sélecteur de couleur de l'éditeur TOAST UI
// Gère le catalogue de couleurs prédéfinies, la validation hex, et la création du popup

export interface ColorPreset {
  hex: string
  category: 'vivid' | 'pastel'
  label?: string
}

export type ColorPickerMode = 'text-color' | 'highlight'

// Catalogue par défaut (FR-003)
const DEFAULT_VIVID_COLORS: ColorPreset[] = [
  { hex: '#fdbc00', category: 'vivid', label: 'Jaune vif' },
  { hex: '#8bbc0a', category: 'vivid', label: 'Vert lime' },
  { hex: '#049ddf', category: 'vivid', label: 'Bleu ciel' },
  { hex: '#e06666', category: 'vivid', label: 'Rouge corail' },
  { hex: '#c27ba0', category: 'vivid', label: 'Rose' },
  { hex: '#a935c6', category: 'vivid', label: 'Violet' },
  { hex: '#1ca2bd', category: 'vivid', label: 'Turquoise' },
  { hex: '#0a5261', category: 'vivid', label: 'Bleu sarcelle' },
  { hex: '#e95853', category: 'vivid', label: 'Rouge tomate' },
  { hex: '#2b4bbf', category: 'vivid', label: 'Bleu roi' },
  { hex: '#f32525', category: 'vivid', label: 'Rouge vif' },
]

const DEFAULT_PASTEL_COLORS: ColorPreset[] = [
  { hex: '#ffd966', category: 'pastel', label: 'Jaune pastel' },
  { hex: '#93c47d', category: 'pastel', label: 'Vert pastel' },
  { hex: '#a4c2f4', category: 'pastel', label: 'Bleu pastel' },
  { hex: '#ea9999', category: 'pastel', label: 'Rouge pastel' },
  { hex: '#d5a6bd', category: 'pastel', label: 'Rose pastel' },
  { hex: '#b4a7d6', category: 'pastel', label: 'Violet pastel' },
  { hex: '#a2c4c9', category: 'pastel', label: 'Turquoise pastel' },
]

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

// État persistant par mode (retient la dernière couleur utilisée par bouton)
const lastTextColor = ref<string | null>(null)
const lastHighlightColor = ref<string | null>(null)

export function useColorPicker(options?: {
  vividColors?: ColorPreset[]
  pastelColors?: ColorPreset[]
}) {
  const vividColors = options?.vividColors ?? DEFAULT_VIVID_COLORS
  const pastelColors = options?.pastelColors ?? DEFAULT_PASTEL_COLORS

  function validateHexColor(hex: string): boolean {
    return HEX_COLOR_REGEX.test(hex)
  }

  function normalizeHexColor(hex: string): string {
    if (!validateHexColor(hex)) return hex
    // Convertit #RGB → #RRGGBB
    if (hex.length === 4) {
      const r = hex[1]
      const g = hex[2]
      const b = hex[3]
      return `#${r}${r}${g}${g}${b}${b}`
    }
    return hex
  }

  function getLastColor(mode: ColorPickerMode): string | null {
    return mode === 'text-color' ? lastTextColor.value : lastHighlightColor.value
  }

  function setLastColor(mode: ColorPickerMode, color: string | null) {
    if (mode === 'text-color') {
      lastTextColor.value = color
    }
    else {
      lastHighlightColor.value = color
    }
  }

  function createColorPickerPopup(
    mode: ColorPickerMode,
    eventEmitter: { emit: (event: string, ...args: unknown[]) => void },
    commandName: string,
  ): HTMLElement {
    const container = document.createElement('div')
    container.className = 'color-picker-popup'

    // Empêcher le mousedown de voler le focus à l'éditeur ProseMirror
    container.addEventListener('mousedown', (e) => {
      // Autoriser le focus uniquement sur les inputs (champ hex, color picker)
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT') return
      e.preventDefault()
    })

    // Section couleurs vives
    const vividSection = document.createElement('div')
    vividSection.className = 'color-section'
    const vividLabel = document.createElement('label')
    vividLabel.textContent = 'Couleurs vives'
    vividSection.appendChild(vividLabel)

    const vividGrid = document.createElement('div')
    vividGrid.className = 'color-grid'
    for (const color of vividColors) {
      vividGrid.appendChild(createSwatch(color, eventEmitter, commandName, mode))
    }
    vividSection.appendChild(vividGrid)
    container.appendChild(vividSection)

    // Section couleurs pastels
    const pastelSection = document.createElement('div')
    pastelSection.className = 'color-section'
    const pastelLabel = document.createElement('label')
    pastelLabel.textContent = 'Couleurs pastels'
    pastelSection.appendChild(pastelLabel)

    const pastelGrid = document.createElement('div')
    pastelGrid.className = 'color-grid'
    for (const color of pastelColors) {
      pastelGrid.appendChild(createSwatch(color, eventEmitter, commandName, mode))
    }
    pastelSection.appendChild(pastelGrid)
    container.appendChild(pastelSection)

    // Séparateur
    container.appendChild(document.createElement('hr'))

    // Section couleur personnalisée (US4)
    const customSection = createCustomColorSection(eventEmitter, commandName, mode)
    container.appendChild(customSection)

    // Bouton supprimer la couleur
    const removeBtn = document.createElement('button')
    removeBtn.className = 'color-remove'
    removeBtn.type = 'button'
    removeBtn.textContent = 'Supprimer la couleur'
    removeBtn.addEventListener('click', () => {
      setLastColor(mode, null)
      eventEmitter.emit('command', commandName, { selectedColor: '' })
      eventEmitter.emit('closePopup')
    })
    container.appendChild(removeBtn)

    return container
  }

  function createSwatch(
    color: ColorPreset,
    eventEmitter: { emit: (event: string, ...args: unknown[]) => void },
    commandName: string,
    mode: ColorPickerMode,
  ): HTMLElement {
    const swatch = document.createElement('button')
    swatch.type = 'button'
    swatch.className = 'color-swatch'
    swatch.style.backgroundColor = color.hex
    swatch.title = color.label ? `${color.label} (${color.hex})` : color.hex
    swatch.setAttribute('aria-label', swatch.title)
    swatch.addEventListener('click', () => {
      setLastColor(mode, color.hex)
      eventEmitter.emit('command', commandName, { selectedColor: color.hex })
      eventEmitter.emit('closePopup')
    })
    return swatch
  }

  function createCustomColorSection(
    eventEmitter: { emit: (event: string, ...args: unknown[]) => void },
    commandName: string,
    mode: ColorPickerMode,
  ): HTMLElement {
    const section = document.createElement('div')
    section.className = 'color-custom'

    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.value = getLastColor(mode) || '#000000'

    const hexInput = document.createElement('input')
    hexInput.type = 'text'
    hexInput.placeholder = '#RRGGBB'
    hexInput.className = 'color-hex-input'
    hexInput.value = getLastColor(mode) || ''
    hexInput.maxLength = 9

    const applyBtn = document.createElement('button')
    applyBtn.type = 'button'
    applyBtn.className = 'color-apply-custom'
    applyBtn.textContent = 'Appliquer'

    const errorMsg = document.createElement('span')
    errorMsg.className = 'color-error'
    errorMsg.textContent = 'Format invalide'
    errorMsg.style.display = 'none'

    // Synchronisation bidirectionnelle
    colorInput.addEventListener('input', () => {
      hexInput.value = colorInput.value
      errorMsg.style.display = 'none'
      hexInput.classList.remove('error')
      applyBtn.disabled = false
    })

    hexInput.addEventListener('input', () => {
      const val = hexInput.value
      if (validateHexColor(val)) {
        colorInput.value = normalizeHexColor(val)
        errorMsg.style.display = 'none'
        hexInput.classList.remove('error')
        applyBtn.disabled = false
      }
      else if (val.length > 0) {
        errorMsg.style.display = 'inline'
        hexInput.classList.add('error')
        applyBtn.disabled = true
      }
      else {
        errorMsg.style.display = 'none'
        hexInput.classList.remove('error')
        applyBtn.disabled = false
      }
    })

    applyBtn.addEventListener('click', () => {
      const color = hexInput.value || colorInput.value
      if (!color || !validateHexColor(color)) return
      const normalized = normalizeHexColor(color)
      setLastColor(mode, normalized)
      eventEmitter.emit('command', commandName, { selectedColor: normalized })
      eventEmitter.emit('closePopup')
    })

    section.appendChild(colorInput)
    section.appendChild(hexInput)
    section.appendChild(errorMsg)
    section.appendChild(applyBtn)

    return section
  }

  return {
    vividColors,
    pastelColors,
    validateHexColor,
    normalizeHexColor,
    getLastColor,
    setLastColor,
    createColorPickerPopup,
  }
}
