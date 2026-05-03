<script setup lang="ts">
import type {
  FaqCategoryAdmin,
  FaqEntryAdminListItem,
} from '~/types/api/faq'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const router = useRouter()
const {
  listCategories,
  listEntries,
  setPublished,
  deleteEntry,
  reorderEntries,
} = useFaqApi()

const activeTab = ref<'entries' | 'categories'>('entries')

const categories = ref<FaqCategoryAdmin[]>([])
const entries = ref<FaqEntryAdminListItem[]>([])
const loading = ref(false)
const filters = ref<{ category_id?: string, is_published?: boolean }>({})

async function loadCategories() {
  categories.value = await listCategories()
}

async function loadEntries() {
  loading.value = true
  try {
    const result = await listEntries({
      ...filters.value,
      page: 1,
      page_size: 100,
    })
    entries.value = result.items
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await loadEntries()
})

async function onTogglePublish(entry: FaqEntryAdminListItem) {
  const message = entry.is_published
    ? t('faq.admin.unpublishConfirm')
    : t('faq.admin.publishConfirm')
  if (!window.confirm(message)) return
  try {
    await setPublished(entry.id, !entry.is_published)
    await loadEntries()
  }
  catch (error: unknown) {
    const err = error as { data?: { detail?: string } }
    window.alert(err?.data?.detail ?? t('faq.admin.saveError'))
  }
}

async function onDelete(id: string) {
  if (!window.confirm(t('faq.admin.deleteConfirm'))) return
  await deleteEntry(id)
  await loadEntries()
}

function onEdit(id: string) {
  router.push(`/admin/faq/${id}`)
}

async function onReorder(categoryId: string, ids: string[]) {
  const items = ids.map((id, idx) => ({ id, display_order: idx }))
  await reorderEntries({ category_id: categoryId, items })
  await loadEntries()
}

function onFilter(next: { category_id?: string, is_published?: boolean }) {
  filters.value = next
  loadEntries()
}
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">
        {{ t('faq.admin.title') }}
      </h1>
      <div class="flex gap-2">
        <NuxtLink
          to="/admin/faq/categories"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          {{ t('faq.admin.categoriesTab') }}
        </NuxtLink>
        <NuxtLink
          to="/admin/faq/nouveau"
          class="rounded-lg bg-brand-blue-600 px-4 py-2 text-sm text-white hover:bg-brand-blue-700"
        >
          + {{ t('faq.admin.newEntry') }}
        </NuxtLink>
      </div>
    </header>

    <FaqAdminEntryList
      :entries="entries"
      :categories="categories"
      :loading="loading"
      @edit="onEdit"
      @delete="onDelete"
      @toggle-publish="onTogglePublish"
      @reorder="onReorder"
      @filter="onFilter"
    />
  </div>
</template>
