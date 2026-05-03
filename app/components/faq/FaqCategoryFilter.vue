<script setup lang="ts">
import type { FaqCategoryPublic } from '~/types/api/faq'

interface Props {
  categories: FaqCategoryPublic[]
  selectedCategoryId: string | null
}

defineProps<Props>()
const emit = defineEmits<{
  'update:selectedCategoryId': [value: string | null]
}>()

const { locale, t } = useI18n()

function localizedLabel(c: FaqCategoryPublic): string {
  if (locale.value === 'en') return c.label_en || c.label_fr
  if (locale.value === 'ar') return c.label_ar || c.label_fr
  return c.label_fr
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      type="button"
      class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
      :class="selectedCategoryId === null
        ? 'bg-brand-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'"
      @click="emit('update:selectedCategoryId', null)"
    >
      {{ t('faq.allCategories') }}
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id"
      type="button"
      class="rounded-full px-4 py-2 text-sm font-medium transition-colors"
      :class="selectedCategoryId === cat.id
        ? 'bg-brand-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'"
      @click="emit('update:selectedCategoryId', cat.id)"
    >
      {{ localizedLabel(cat) }}
    </button>
  </div>
</template>
