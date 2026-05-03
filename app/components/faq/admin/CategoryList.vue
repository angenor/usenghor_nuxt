<script setup lang="ts">
import type { FaqCategoryAdmin } from '~/types/api/faq'

interface Props {
  categories: FaqCategoryAdmin[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'edit', category: FaqCategoryAdmin): void
  (e: 'delete', category: FaqCategoryAdmin): void
  (e: 'reorder', ids: string[]): void
}>()

const { t } = useI18n()

function isProtected(category: FaqCategoryAdmin) {
  return category.code === 'general'
}

function canDelete(category: FaqCategoryAdmin) {
  return !isProtected(category) && category.entry_count === 0
}

function moveUp(index: number) {
  if (index === 0) return
  const next = [...props.categories]
  ;[next[index - 1], next[index]] = [next[index]!, next[index - 1]!]
  emit('reorder', next.map(c => c.id))
}

function moveDown(index: number) {
  if (index >= props.categories.length - 1) return
  const next = [...props.categories]
  ;[next[index], next[index + 1]] = [next[index + 1]!, next[index]!]
  emit('reorder', next.map(c => c.id))
}
</script>

<template>
  <div>
    <div v-if="loading" class="py-10 text-center text-gray-500">
      …
    </div>
    <table v-else class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th class="px-3 py-2 text-left text-xs font-semibold uppercase">
            {{ t('faq.admin.displayOrder') }}
          </th>
          <th class="px-3 py-2 text-left text-xs font-semibold uppercase">
            {{ t('faq.admin.fieldCode') }}
          </th>
          <th class="px-3 py-2 text-left text-xs font-semibold uppercase">
            {{ t('faq.admin.fieldLabelFr') }}
          </th>
          <th class="px-3 py-2 text-left text-xs font-semibold uppercase">
            {{ t('faq.admin.entryCount') }}
          </th>
          <th class="px-3 py-2 text-left text-xs font-semibold uppercase">
            {{ t('faq.admin.fieldIsActive') }}
          </th>
          <th class="px-3 py-2" />
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
        <tr v-for="(c, idx) in categories" :key="c.id">
          <td class="px-3 py-2 text-sm">
            <div class="flex flex-col gap-1">
              <button class="text-xs hover:text-brand-blue-600" :disabled="idx === 0" @click="moveUp(idx)">
                ▲
              </button>
              <button
                class="text-xs hover:text-brand-blue-600"
                :disabled="idx === categories.length - 1"
                @click="moveDown(idx)"
              >
                ▼
              </button>
            </div>
          </td>
          <td class="px-3 py-2 text-sm font-mono">
            {{ c.code }}
          </td>
          <td class="px-3 py-2 text-sm">
            {{ c.label_fr }}
          </td>
          <td class="px-3 py-2 text-sm">
            {{ c.entry_count }}
          </td>
          <td class="px-3 py-2 text-sm">
            <span v-if="c.is_active" class="text-green-600">●</span>
            <span v-else class="text-gray-400">○</span>
          </td>
          <td class="px-3 py-2 text-right text-sm">
            <button
              class="mr-2 text-xs text-brand-blue-600 hover:underline"
              @click="emit('edit', c)"
            >
              {{ t('faq.admin.editCategory') }}
            </button>
            <button
              class="text-xs"
              :class="canDelete(c) ? 'text-red-600 hover:underline' : 'text-gray-400 cursor-not-allowed'"
              :disabled="!canDelete(c)"
              :title="isProtected(c)
                ? t('faq.admin.categoryProtected')
                : c.entry_count > 0 ? t('faq.admin.categoryNotEmpty') : ''"
              @click="canDelete(c) && emit('delete', c)"
            >
              {{ t('faq.admin.delete') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
