// Plugin TOAST UI Editor v3 pour la coloration de texte et le surlignage
// Gère son propre popup en DOM pur (le système popup TOAST UI ne fonctionne pas avec les éléments custom)

import { useColorPicker } from '~/composables/useColorPicker'
import type { ColorPickerMode } from '~/composables/useColorPicker'

// --- Types ProseMirror (minimaux) ---

interface PMMark {
  type: { name: string, create: (attrs?: Record<string, unknown>) => PMMark }
  attrs?: Record<string, unknown>
}

interface PMNode {
  marks: PMMark[]
}

interface PMTransaction {
  addMark: (from: number, to: number, mark: PMMark) => PMTransaction
  removeMark: (from: number, to: number, mark?: PMMark) => PMTransaction
  doc: { nodesBetween: (from: number, to: number, callback: (node: PMNode, pos: number) => void) => void }
}

interface PMState {
  tr: PMTransaction
  selection: { from: number, to: number, empty: boolean }
  schema: { marks: Record<string, { create: (attrs?: Record<string, unknown>) => PMMark }>, text: (content: string) => unknown }
  doc: PMTransaction['doc'] & { textBetween?: (from: number, to: number) => string }
}

type PMDispatch = (tr: PMTransaction) => void

// --- Types plugin TOAST UI ---

interface EventEmitter {
  emit: (event: string, ...args: unknown[]) => unknown[]
  listen: (event: string, handler: (...args: unknown[]) => void) => void
}

interface PluginContext {
  eventEmitter: EventEmitter
}

// --- Utilitaires style CSS ---

function parseStyleString(style: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!style) return result
  for (const part of style.split(';')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue
    const key = trimmed.slice(0, colonIdx).trim()
    const value = trimmed.slice(colonIdx + 1).trim()
    if (key && value) result[key] = value
  }
  return result
}

function buildStyleString(styles: Record<string, string>, highlightRadius?: string): string {
  const result = { ...styles }
  if (result['background-color']) {
    result['padding'] = '2px 4px'
    const radius = highlightRadius || '3px'
    if (radius !== '0') {
      result['border-radius'] = radius
    }
    else {
      delete result['border-radius']
    }
  }
  else {
    delete result['padding']
    delete result['border-radius']
  }
  return Object.entries(result)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}

// --- Commandes WYSIWYG ---
// Plugin commands via addCommand HOC: (payload, state, dispatch, view) => void

function createWysiwygCommand(styleProperty: 'color' | 'background-color', getHighlightRadius?: () => string) {
  const radius = getHighlightRadius
  return (payload: { selectedColor?: string }, state: PMState, dispatch: PMDispatch): boolean => {
    const { selection, schema, doc } = state
    if (selection.empty) return false

    const { from, to } = selection
    const selectedColor = payload?.selectedColor
    const spanMarkType = schema.marks.span
    if (!spanMarkType) return false

    const tr = state.tr
    const otherProp = styleProperty === 'color' ? 'background-color' : 'color'
    const r = radius?.()

    if (!selectedColor) {
      // Suppression sélective : retirer uniquement la propriété ciblée
      let hasOtherProp = false
      let otherPropValue = ''

      doc.nodesBetween(from, to, (node: PMNode) => {
        if (!node.marks) return
        for (const mark of node.marks) {
          if (mark.type.name === 'span') {
            const style = (mark.attrs?.htmlAttrs as { style?: string })?.style
            if (style) {
              const styles = parseStyleString(style)
              if (styles[otherProp]) {
                hasOtherProp = true
                otherPropValue = styles[otherProp]
              }
            }
          }
        }
      })

      // Retirer tous les span marks (par type, pas par instance)
      tr.removeMark(from, to, spanMarkType as unknown as PMMark)

      // Si l'autre propriété existe, la réappliquer
      if (hasOtherProp) {
        const kept: Record<string, string> = {}
        kept[otherProp] = otherPropValue
        tr.addMark(from, to, spanMarkType.create({ htmlAttrs: { style: buildStyleString(kept, r) } }))
      }

      dispatch(tr)
      return true
    }

    // Récupérer le style existant de l'autre propriété
    let existingOtherStyle: string | null = null
    doc.nodesBetween(from, to, (node: PMNode) => {
      if (!node.marks) return
      for (const mark of node.marks) {
        if (mark.type.name === 'span') {
          const style = (mark.attrs?.htmlAttrs as { style?: string })?.style
          if (style) {
            const styles = parseStyleString(style)
            if (styles[otherProp]) existingOtherStyle = styles[otherProp]
          }
        }
      }
    })

    tr.removeMark(from, to, spanMarkType as unknown as PMMark)

    const newStyles: Record<string, string> = {}
    newStyles[styleProperty] = selectedColor
    if (existingOtherStyle) newStyles[otherProp] = existingOtherStyle

    tr.addMark(from, to, spanMarkType.create({ htmlAttrs: { style: buildStyleString(newStyles, r) } }))
    dispatch(tr)
    return true
  }
}

// --- Commandes Markdown ---

function createMarkdownCommand(styleProperty: 'color' | 'background-color') {
  return (payload: { selectedColor?: string }, state: PMState, dispatch: PMDispatch): boolean => {
    const { selection, doc, schema } = state
    if (selection.empty) return false

    const { from, to } = selection
    const selectedText = doc.textBetween ? doc.textBetween(from, to) : ''
    if (!selectedText) return false

    const selectedColor = payload?.selectedColor
    const tr = state.tr

    if (!selectedColor) {
      const match = selectedText.match(/^<span\s+style="([^"]*)">(.*?)<\/span>$/s)
      if (match) {
        const styles = parseStyleString(match[1])
        const innerText = match[2]
        delete styles[styleProperty]
        const replacement = Object.keys(styles).length > 0
          ? `<span style="${buildStyleString(styles)}">${innerText}</span>`
          : innerText
        tr.replaceWith(from, to, schema.text(replacement) as unknown as PMNode)
        dispatch(tr)
      }
      return true
    }

    const match = selectedText.match(/^<span\s+style="([^"]*)">(.*?)<\/span>$/s)
    let replacement: string
    if (match) {
      const styles = parseStyleString(match[1])
      styles[styleProperty] = selectedColor
      replacement = `<span style="${buildStyleString(styles)}">${match[2]}</span>`
    }
    else {
      replacement = `<span style="${styleProperty}: ${selectedColor}">${selectedText}</span>`
    }
    tr.replaceWith(from, to, schema.text(replacement) as unknown as PMNode)
    dispatch(tr)
    return true
  }
}

// --- Bouton split avec popup DOM auto-géré ---

function createSplitButtonWithPopup(
  mode: ColorPickerMode,
  commandName: string,
  iconHtml: string,
  tooltip: string,
  eventEmitter: EventEmitter,
  getLastColor: (mode: ColorPickerMode) => string | null,
  setLastColor: (mode: ColorPickerMode, color: string | null) => void,
  createColorPickerPopup: (mode: ColorPickerMode, emitter: { emit: (event: string, ...args: unknown[]) => void }, commandName: string) => HTMLElement,
): HTMLElement {
  const wrapper = document.createElement('span')
  wrapper.className = 'color-split-btn'
  wrapper.style.position = 'relative'

  const defaultColor = mode === 'text-color' ? '#000000' : '#ffd966'

  // Bouton principal : applique la dernière couleur
  const applyBtn = document.createElement('button')
  applyBtn.type = 'button'
  applyBtn.className = 'color-apply-btn'
  applyBtn.title = tooltip
  applyBtn.innerHTML = iconHtml

  const colorIndicator = document.createElement('span')
  colorIndicator.className = 'color-indicator'
  colorIndicator.style.backgroundColor = getLastColor(mode) || defaultColor
  applyBtn.appendChild(colorIndicator)

  applyBtn.addEventListener('mousedown', (e) => { e.preventDefault() })
  applyBtn.addEventListener('click', () => {
    const color = getLastColor(mode)
    if (color) {
      eventEmitter.emit('command', commandName, { selectedColor: color })
    }
  })

  // Bouton chevron : toggle popup
  const dropdownBtn = document.createElement('button')
  dropdownBtn.type = 'button'
  dropdownBtn.className = 'color-dropdown-btn'
  dropdownBtn.innerHTML = '▾'
  dropdownBtn.addEventListener('mousedown', (e) => { e.preventDefault() })

  // Popup container — positionné en fixed pour éviter le clipping par la toolbar
  const popupContainer = document.createElement('div')
  popupContainer.className = 'color-popup-container'
  popupContainer.style.display = 'none'
  document.body.appendChild(popupContainer)

  // Créer le popup avec un emitter qui met à jour lastColor
  const popupEmitter = {
    emit(event: string, ...args: unknown[]) {
      if (event === 'command') {
        const payload = args[1] as { selectedColor?: string }
        if (payload?.selectedColor) {
          setLastColor(mode, payload.selectedColor)
          colorIndicator.style.backgroundColor = payload.selectedColor
        }
        else {
          setLastColor(mode, null)
          colorIndicator.style.backgroundColor = defaultColor
        }
      }
      if (event === 'closePopup') {
        isOpen = false
        popupContainer.style.display = 'none'
        return
      }
      eventEmitter.emit(event, ...args)
    },
  }

  const popupContent = createColorPickerPopup(mode, popupEmitter, commandName)
  popupContainer.appendChild(popupContent)

  let isOpen = false

  function positionPopup() {
    const rect = wrapper.getBoundingClientRect()
    popupContainer.style.top = `${rect.bottom + 4}px`
    popupContainer.style.left = `${rect.left}px`
  }

  dropdownBtn.addEventListener('click', () => {
    isOpen = !isOpen
    if (isOpen) {
      positionPopup()
    }
    popupContainer.style.display = isOpen ? 'block' : 'none'
  })

  // Fermer le popup quand on clique à l'extérieur
  document.addEventListener('mousedown', (e) => {
    if (isOpen && !wrapper.contains(e.target as Node) && !popupContainer.contains(e.target as Node)) {
      isOpen = false
      popupContainer.style.display = 'none'
    }
  })

  wrapper.appendChild(applyBtn)
  wrapper.appendChild(dropdownBtn)

  return wrapper
}

// --- Export du plugin ---

export default function colorPlugin(context: PluginContext): Record<string, unknown> {
  const { eventEmitter } = context
  const { getLastColor, setLastColor, getHighlightRadius, createColorPickerPopup } = useColorPicker()

  const textColorButton = createSplitButtonWithPopup(
    'text-color', 'textColor',
    '<span class="color-icon-text">A</span>',
    'Couleur du texte',
    eventEmitter, getLastColor, setLastColor, createColorPickerPopup,
  )

  const highlightButton = createSplitButtonWithPopup(
    'highlight', 'highlight',
    '<span class="color-icon-highlight"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M11.5 1.5L5 8l-.5 3.5L8 11l6.5-6.5-3-3zM3 13.5h10v1H3z"/></svg></span>',
    'Surlignage',
    eventEmitter, getLastColor, setLastColor, createColorPickerPopup,
  )

  return {
    markdownCommands: {
      textColor: createMarkdownCommand('color'),
      highlight: createMarkdownCommand('background-color'),
    },
    wysiwygCommands: {
      textColor: createWysiwygCommand('color', getHighlightRadius),
      highlight: createWysiwygCommand('background-color', getHighlightRadius),
    },
    toolbarItems: [
      {
        groupIndex: 0,
        itemIndex: 3,
        item: {
          name: 'textColor',
          tooltip: 'Couleur du texte',
          el: textColorButton,
        },
      },
      {
        groupIndex: 0,
        itemIndex: 4,
        item: {
          name: 'highlight',
          tooltip: 'Surlignage',
          el: highlightButton,
        },
      },
    ],
    toHTMLRenderers: {
      htmlInline: {
        span(node: { attrs?: Record<string, string> }, { entering }: { entering: boolean }) {
          if (entering) {
            return { type: 'openTag', tagName: 'span', attributes: node.attrs || {}, outerNewLine: false }
          }
          return { type: 'closeTag', tagName: 'span', outerNewLine: false }
        },
      },
    },
  }
}
