import type { OutputData } from '@editorjs/editorjs'

export interface EditorJSBlock {
  id?: string
  type: string
  data: Record<string, unknown>
}

export function useEditorJS() {
  const content = ref<OutputData>({
    time: Date.now(),
    blocks: [],
    version: '2.31.0',
  })

  function setContent(data: OutputData) {
    content.value = data
  }

  function clearContent() {
    content.value = {
      time: Date.now(),
      blocks: [],
      version: '2.31.0',
    }
  }

  function hasContent(): boolean {
    return content.value.blocks.length > 0
  }

  function getPlainText(): string {
    return content.value.blocks
      .map((block) => {
        switch (block.type) {
          case 'paragraph':
          case 'header':
            return stripHtml(block.data.text as string)
          case 'list':
            return (block.data.items as string[]).map(stripHtml).join('\n')
          case 'quote':
            return stripHtml(block.data.text as string)
          default:
            return ''
        }
      })
      .filter(Boolean)
      .join('\n\n')
  }

  function stripHtml(html: string): string {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '')
  }

  function toJSON(): string {
    return JSON.stringify(content.value)
  }

  function fromJSON(json: string): boolean {
    try {
      const data = JSON.parse(json) as OutputData
      if (data && Array.isArray(data.blocks)) {
        content.value = data
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return {
    content,
    setContent,
    clearContent,
    hasContent,
    getPlainText,
    toJSON,
    fromJSON,
  }
}
