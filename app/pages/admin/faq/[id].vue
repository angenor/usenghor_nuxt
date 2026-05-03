<script setup lang="ts">
import type {
  FaqCategoryAdmin,
  FaqEntryAdminFull,
  FaqEntryCreatePayload,
  FaqEntryUpdatePayload,
} from '~/types/api/faq'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const {
  listCategories,
  getEntry,
  updateEntry,
  setPublished,
  deleteEntry,
} = useFaqApi()

const id = String(route.params.id)
const entry = ref<FaqEntryAdminFull | null>(null)
const categories = ref<FaqCategoryAdmin[]>([])
const saving = ref(false)
const errorMessage = ref<string | null>(null)

async function loadAll() {
  ;[entry.value, categories.value] = await Promise.all([
    getEntry(id),
    listCategories(),
  ])
}

onMounted(loadAll)

async function onSubmit(
  payload: FaqEntryCreatePayload | FaqEntryUpdatePayload,
) {
  errorMessage.value = null
  saving.value = true
  try {
    entry.value = await updateEntry(id, payload as FaqEntryUpdatePayload)
  }
  catch (error: unknown) {
    const err = error as { data?: { detail?: string } }
    errorMessage.value = err?.data?.detail ?? t('faq.admin.saveError')
  }
  finally {
    saving.value = false
  }
}

async function onTogglePublish() {
  if (!entry.value) return
  const message = entry.value.is_published
    ? t('faq.admin.unpublishConfirm')
    : t('faq.admin.publishConfirm')
  if (!window.confirm(message)) return
  try {
    await setPublished(id, !entry.value.is_published)
    await loadAll()
  }
  catch (error: unknown) {
    const err = error as { data?: { detail?: string } }
    errorMessage.value = err?.data?.detail ?? t('faq.admin.saveError')
  }
}

async function onDelete() {
  if (!window.confirm(t('faq.admin.deleteConfirm'))) return
  await deleteEntry(id)
  await router.push('/admin/faq')
}
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex items-start justify-between">
      <div>
        <NuxtLink to="/admin/faq" class="text-sm text-brand-blue-600 hover:underline">
          ← {{ t('faq.admin.title') }}
        </NuxtLink>
        <h1 class="mt-2 text-2xl font-semibold">
          {{ t('faq.admin.editEntry') }}
        </h1>
      </div>
      <div v-if="entry" class="flex gap-2">
        <button
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          @click="onTogglePublish"
        >
          {{ entry.is_published ? t('faq.admin.unpublish') : t('faq.admin.publish') }}
        </button>
        <button
          class="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-700"
          @click="onDelete"
        >
          {{ t('faq.admin.delete') }}
        </button>
      </div>
    </header>

    <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <FaqAdminEntryForm
      v-if="entry"
      :entry="entry"
      :categories="categories"
      :saving="saving"
      @submit="onSubmit"
      @cancel="router.push('/admin/faq')"
    />

    <section v-if="entry?.answer_fr_html" class="mt-10">
      <h2 class="mb-2 text-lg font-semibold">
        Aperçu (FR)
      </h2>
      <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <RichTextRenderer :html="entry.answer_fr_html" />
      </div>
    </section>
  </div>
</template>
