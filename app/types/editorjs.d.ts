declare module '@editorjs/header' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  export default class Header implements BlockTool {
    constructor(config: BlockToolConstructorOptions)
    render(): HTMLElement
    save(block: HTMLElement): { text: string; level: number }
    validate(savedData: { text: string; level: number }): boolean
  }
}

declare module '@editorjs/list' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  export default class List implements BlockTool {
    constructor(config: BlockToolConstructorOptions)
    render(): HTMLElement
    save(block: HTMLElement): { style: string; items: string[] }
  }
}

declare module '@editorjs/paragraph' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  export default class Paragraph implements BlockTool {
    constructor(config: BlockToolConstructorOptions)
    render(): HTMLElement
    save(block: HTMLElement): { text: string }
  }
}

declare module '@editorjs/image' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  export default class Image implements BlockTool {
    constructor(config: BlockToolConstructorOptions)
    render(): HTMLElement
    save(block: HTMLElement): {
      file: { url: string }
      caption: string
      withBorder: boolean
      withBackground: boolean
      stretched: boolean
    }
  }
}

declare module '@editorjs/quote' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  export default class Quote implements BlockTool {
    constructor(config: BlockToolConstructorOptions)
    render(): HTMLElement
    save(block: HTMLElement): { text: string; caption: string; alignment: string }
  }
}

declare module '@editorjs/embed' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  export default class Embed implements BlockTool {
    constructor(config: BlockToolConstructorOptions)
    render(): HTMLElement
    save(block: HTMLElement): {
      service: string
      source: string
      embed: string
      width: number
      height: number
      caption: string
    }
  }
}

declare module '@editorjs/table' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  export default class Table implements BlockTool {
    constructor(config: BlockToolConstructorOptions)
    render(): HTMLElement
    save(block: HTMLElement): { content: string[][] }
  }
}

declare module '@editorjs/delimiter' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  const Delimiter: {
    new (config: BlockToolConstructorOptions): BlockTool
  }
  export default Delimiter
}

declare module '@editorjs/inline-code' {
  import { InlineTool, InlineToolConstructorOptions } from '@editorjs/editorjs'
  const InlineCode: {
    new (config: InlineToolConstructorOptions): InlineTool
  }
  export default InlineCode
}

declare module '@editorjs/marker' {
  import { InlineTool, InlineToolConstructorOptions } from '@editorjs/editorjs'
  const Marker: {
    new (config: InlineToolConstructorOptions): InlineTool
  }
  export default Marker
}

declare module '@editorjs/link' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  export default class LinkTool implements BlockTool {
    constructor(config: BlockToolConstructorOptions)
    render(): HTMLElement
    save(block: HTMLElement): {
      link: string
      meta: {
        title: string
        description: string
        image: { url: string }
      }
    }
  }
}

declare module '@editorjs/checklist' {
  import { BlockTool, BlockToolConstructorOptions } from '@editorjs/editorjs'
  export default class Checklist implements BlockTool {
    constructor(config: BlockToolConstructorOptions)
    render(): HTMLElement
    save(block: HTMLElement): {
      items: Array<{ text: string; checked: boolean }>
    }
  }
}

declare module 'editorjs-undo' {
  import type EditorJS from '@editorjs/editorjs'

  interface UndoConfig {
    editor: EditorJS
    maxLength?: number
    onUpdate?: () => void
  }

  export default class Undo {
    constructor(config: UndoConfig)
    initialize(data: unknown): void
    undo(): void
    redo(): void
    registerChange(): void
    clear(): void
  }
}
