<script setup lang="ts">
import type { FaqEntryPublic } from '~/types/api/faq'

interface Props {
  entry: FaqEntryPublic
  open: boolean
  question: string
  answerHtml: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: [slug: string]
}>()

const { t } = useI18n()
const copied = ref(false)
const contentId = computed(() => `faq-content-${props.entry.slug}`)
const buttonId = computed(() => `faq-button-${props.entry.slug}`)
const itemRef = ref<HTMLElement | null>(null)

async function copyLink() {
  if (!import.meta.client) return
  const url = `${window.location.origin}${window.location.pathname}#${props.entry.slug}`
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
  catch {
    // ignore — clipboard non disponible
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('toggle', props.entry.slug)
  }
}

defineExpose({ el: itemRef })
</script>

<template>
  <div
    :id="entry.slug"
    ref="itemRef"
    class="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow dark:border-gray-700 dark:bg-gray-800"
    :class="{ 'shadow-md': open }"
  >
    <h3 class="m-0">
      <button
        :id="buttonId"
        type="button"
        class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 dark:text-white dark:hover:bg-gray-700/40"
        :aria-expanded="open"
        :aria-controls="contentId"
        @click="emit('toggle', entry.slug)"
        @keydown="onKey"
      >
        <span>{{ question }}</span>
        <svg
          class="h-5 w-5 shrink-0 transition-transform"
          :class="{ 'rotate-180': open }"
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
        >
          <path d="M12 15.5 5.5 9l1.4-1.4L12 12.7l5.1-5.1L18.5 9 12 15.5Z"/>
        </svg>
      </button>
    </h3>
    <div
      v-show="open"
      :id="contentId"
      role="region"
      :aria-labelledby="buttonId"
      class="border-t border-gray-100 px-5 py-4 dark:border-gray-700"
    >
      <RichTextRenderer :html="answerHtml" class="prose prose-sm max-w-none dark:prose-invert" />
      <div class="mt-4 flex justify-end">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          @click="copyLink"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M3.9 12a4.1 4.1 0 0 1 4.1-4.1H11v2H8a2.1 2.1 0 0 0 0 4.2h3v2H8A4.1 4.1 0 0 1 3.9 12Zm9.1-3.1h3a4.1 4.1 0 0 1 0 8.2h-3v-2h3a2.1 2.1 0 0 0 0-4.2h-3v-2Zm-5 4.1h8v-2H8v2Z"/>
          </svg>
          {{ copied ? t('faq.linkCopied') : t('faq.copyLink') }}
        </button>
      </div>
    </div>
  </div>
</template>
