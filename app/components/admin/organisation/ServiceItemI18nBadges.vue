<script setup lang="ts">
/**
 * Badges « EN » / « AR » signalant une traduction manquante (titre ou description)
 * d'un objectif, d'une réalisation ou d'un projet de service.
 */
import type { ServiceSubItemI18nFields } from '~/composables/useServicesApi'

const props = defineProps<{
  item: ServiceSubItemI18nFields & { description_html?: string | null, description_md?: string | null }
}>()

function hasText(value: string | null | undefined): boolean {
  if (!value) return false
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim().length > 0
}

const hasDescription = computed(() => hasText(props.item.description_html) || hasText(props.item.description_md))

function missingParts(lang: 'en' | 'ar'): string[] {
  const parts: string[] = []
  const title = lang === 'en' ? props.item.title_en : props.item.title_ar
  const html = lang === 'en' ? props.item.description_en_html : props.item.description_ar_html
  const md = lang === 'en' ? props.item.description_en_md : props.item.description_ar_md
  if (!hasText(title)) parts.push('titre')
  if (hasDescription.value && !hasText(html) && !hasText(md)) parts.push('description')
  return parts
}

const missing = computed(() => {
  const list: Array<{ lang: 'EN' | 'AR', label: string }> = []
  const en = missingParts('en')
  const ar = missingParts('ar')
  if (en.length) list.push({ lang: 'EN', label: `Traduction anglaise manquante (${en.join(' et ')})` })
  if (ar.length) list.push({ lang: 'AR', label: `Traduction arabe manquante (${ar.join(' et ')})` })
  return list
})
</script>

<template>
  <span v-if="missing.length" class="inline-flex items-center gap-1">
    <span
      v-for="entry in missing"
      :key="entry.lang"
      class="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-1.5 py-px text-[10px] font-semibold uppercase leading-4 tracking-wide text-amber-800 dark:border-amber-700/70 dark:bg-amber-900/30 dark:text-amber-300"
      :title="entry.label"
    >
      <font-awesome-icon :icon="['fas', 'language']" class="h-2.5 w-2.5" aria-hidden="true" />
      <span aria-hidden="true">{{ entry.lang }}</span>
      <span class="sr-only">{{ entry.label }}</span>
    </span>
  </span>
</template>
