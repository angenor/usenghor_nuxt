<script setup lang="ts">
import type {
  FaqCategoryAdmin,
  FaqEntryAdminListItem,
} from '~/types/api/faq'

interface Props {
  entries: FaqEntryAdminListItem[]
  categories: FaqCategoryAdmin[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'togglePublish', item: FaqEntryAdminListItem): void
  (e: 'reorder', categoryId: string, ids: string[]): void
  (e: 'filter', filters: { category_id?: string, is_published?: boolean }): void
}>()

const { t } = useI18n()

const filterCategory = ref<string>('')
const filterStatus = ref<'all' | 'draft' | 'published'>('all')

watch([filterCategory, filterStatus], () => {
  const filters: { category_id?: string, is_published?: boolean } = {}
  if (filterCategory.value) filters.category_id = filterCategory.value
  if (filterStatus.value === 'draft') filters.is_published = false
  if (filterStatus.value === 'published') filters.is_published = true
  emit('filter', filters)
})

function moveUp(index: number) {
  if (index === 0) return
  const next = [...props.entries]
  ;[next[index - 1], next[index]] = [next[index]!, next[index - 1]!]
  const groupCat = next[0]?.category_id
  if (groupCat) {
    emit('reorder', groupCat, next.filter(e => e.category_id === groupCat).map(e => e.id))
  }
}

function moveDown(index: number) {
  if (index >= props.entries.length - 1) return
  const next = [...props.entries]
  ;[next[index], next[index + 1]] = [next[index + 1]!, next[index]!]
  const groupCat = next[0]?.category_id
  if (groupCat) {
    emit('reorder', groupCat, next.filter(e => e.category_id === groupCat).map(e => e.id))
  }
}

function categoryLabel(id: string) {
  return props.categories.find(c => c.id === id)?.label_fr ?? id
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end gap-3">
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.filterCategory') }}</span>
        <select
          v-model="filterCategory"
          class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">
            {{ t('faq.admin.statusAll') }}
          </option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.label_fr }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium">{{ t('faq.admin.filterStatus') }}</span>
        <select
          v-model="filterStatus"
          class="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="all">
            {{ t('faq.admin.statusAll') }}
          </option>
          <option value="draft">
            {{ t('faq.admin.statusDraft') }}
          </option>
          <option value="published">
            {{ t('faq.admin.statusPublished') }}
          </option>
        </select>
      </label>
    </div>

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
            {{ t('faq.admin.fieldQuestionFr') }}
          </th>
          <th class="px-3 py-2 text-left text-xs font-semibold uppercase">
            {{ t('faq.admin.fieldCategory') }}
          </th>
          <th class="px-3 py-2 text-left text-xs font-semibold uppercase">
            {{ t('faq.admin.filterStatus') }}
          </th>
          <th class="px-3 py-2" />
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
        <tr v-for="(entry, idx) in entries" :key="entry.id">
          <td class="px-3 py-2 text-sm">
            <div class="flex flex-col gap-1">
              <button class="text-xs hover:text-brand-blue-600" :disabled="idx === 0" @click="moveUp(idx)">
                ▲
              </button>
              <button
                class="text-xs hover:text-brand-blue-600"
                :disabled="idx === entries.length - 1"
                @click="moveDown(idx)"
              >
                ▼
              </button>
            </div>
          </td>
          <td class="px-3 py-2 text-sm">
            <div class="font-medium">
              {{ entry.question_fr }}
            </div>
            <div class="text-xs text-gray-500">
              /{{ entry.slug }}
            </div>
          </td>
          <td class="px-3 py-2 text-sm">
            {{ categoryLabel(entry.category_id) }}
          </td>
          <td class="px-3 py-2 text-sm">
            <span
              v-if="entry.is_published"
              class="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300"
            >
              {{ t('faq.admin.publishedBadge') }}
            </span>
            <span
              v-else
              class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            >
              {{ t('faq.admin.draftBadge') }}
            </span>
          </td>
          <td class="px-3 py-2 text-right text-sm">
            <button
              class="mr-2 text-xs text-brand-blue-600 hover:underline"
              @click="emit('togglePublish', entry)"
            >
              {{ entry.is_published ? t('faq.admin.unpublish') : t('faq.admin.publish') }}
            </button>
            <button
              class="mr-2 text-xs text-brand-blue-600 hover:underline"
              @click="emit('edit', entry.id)"
            >
              {{ t('faq.admin.editEntry') }}
            </button>
            <button
              class="text-xs text-red-600 hover:underline"
              @click="emit('delete', entry.id)"
            >
              {{ t('faq.admin.delete') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
