declare module '@toast-ui/editor' {
  interface EditorOptions {
    el: HTMLElement
    initialValue?: string
    initialEditType?: 'markdown' | 'wysiwyg'
    previewStyle?: 'tab' | 'vertical'
    height?: string
    minHeight?: string
    language?: string
    placeholder?: string
    hideModeSwitch?: boolean
    toolbarItems?: (string | string[])[][]
    plugins?: EditorPlugin[]
    hooks?: {
      addImageBlobHook?: (blob: Blob | File, callback: (url: string, alt?: string) => void) => void
    }
    events?: {
      change?: () => void
      focus?: () => void
      blur?: () => void
    }
  }

  type EditorPlugin = (context: { eventEmitter: unknown; usageStatistics: boolean }) => {
    markdownCommands?: Record<string, unknown>
    wysiwygCommands?: Record<string, unknown>
    toolbarItems?: unknown[]
    toHTMLRenderers?: Record<string, unknown>
    markdownPlugins?: unknown[]
    wysiwygPlugins?: unknown[]
    wysiwygNodeViews?: Record<string, unknown>
  }

  export default class Editor {
    constructor(options: EditorOptions)
    getMarkdown(): string
    getHTML(): string
    setMarkdown(markdown: string, cursorToEnd?: boolean): void
    setHTML(html: string, cursorToEnd?: boolean): void
    insertText(text: string): void
    focus(): void
    blur(): void
    moveCursorToEnd(): void
    moveCursorToStart(): void
    destroy(): void
    hide(): void
    show(): void
    reset(): void
    on(eventName: string, handler: (...args: unknown[]) => void): void
    off(eventName: string): void
    changeMode(mode: 'markdown' | 'wysiwyg', isWithoutFocus?: boolean): void
    isMarkdownMode(): boolean
    isWysiwygMode(): boolean
    getCurrentModeEditor(): unknown
    setPlaceholder(placeholder: string): void
  }
}

declare module '@toast-ui/editor/dist/i18n/fr-fr' {
  // Side-effect import : enregistre la locale fr-FR
}

declare module '@toast-ui/editor-plugin-table-merged-cell' {
  import type { EditorPlugin } from '@toast-ui/editor'
  const tableMergedCell: EditorPlugin
  export default tableMergedCell
}
