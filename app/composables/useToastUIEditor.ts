export function useToastUIEditor() {
  const html = ref('')
  const markdown = ref('')

  function setContent(newHtml: string, newMd: string) {
    html.value = newHtml
    markdown.value = newMd
  }

  function clearContent() {
    html.value = ''
    markdown.value = ''
  }

  const hasContent = computed(() => {
    return markdown.value.trim().length > 0 || html.value.trim().length > 0
  })

  function getPlainText(): string {
    if (!html.value) return ''
    return html.value.replace(/<[^>]*>/g, '').trim()
  }

  function toJSON(): string {
    return JSON.stringify({ html: html.value, markdown: markdown.value })
  }

  function fromJSON(json: string): boolean {
    try {
      const data = JSON.parse(json)
      if (data && typeof data === 'object') {
        html.value = data.html || ''
        markdown.value = data.markdown || ''
        return true
      }
      return false
    }
    catch {
      return false
    }
  }

  return {
    html,
    markdown,
    setContent,
    clearContent,
    hasContent,
    getPlainText,
    toJSON,
    fromJSON,
  }
}
