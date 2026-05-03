<script setup lang="ts">
import type {
  FaqCategoryAdmin,
  FaqCategoryCreatePayload,
  FaqCategoryUpdatePayload,
} from '~/types/api/faq'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = useFaqApi()

const categories = ref<FaqCategoryAdmin[]>([])
const loading = ref(false)
const editing = ref<FaqCategoryAdmin | null>(null)
const showForm = ref(false)
const saving = ref(false)
const errorMessage = ref<string | null>(null)

async function loadAll() {
  loading.value = true
  try {
    categories.value = await listCategories()
  }
  finally {
    loading.value = false
  }
}

onMounted(loadAll)

function openCreate() {
  editing.value = null
  showForm.value = true
  errorMessage.value = null
}

function openEdit(category: FaqCategoryAdmin) {
  editing.value = category
  showForm.value = true
  errorMessage.value = null
}

function closeForm() {
  showForm.value = false
  editing.value = null
}

async function onSubmit(
  payload: FaqCategoryCreatePayload | FaqCategoryUpdatePayload,
) {
  saving.value = true
  errorMessage.value = null
  try {
    if (editing.value) {
      await updateCategory(editing.value.id, payload as FaqCategoryUpdatePayload)
    }
    else {
      await createCategory(payload as FaqCategoryCreatePayload)
    }
    closeForm()
    await loadAll()
  }
  catch (error: unknown) {
    const err = error as { data?: { detail?: string } }
    errorMessage.value = err?.data?.detail ?? t('faq.admin.saveError')
  }
  finally {
    saving.value = false
  }
}

async function onDelete(category: FaqCategoryAdmin) {
  if (!window.confirm(t('faq.admin.deleteCategoryConfirm'))) return
  try {
    await deleteCategory(category.id)
    await loadAll()
  }
  catch (error: unknown) {
    const err = error as { data?: { detail?: string }, status?: number }
    if (err.status === 409) {
      window.alert(err?.data?.detail ?? t('faq.admin.categoryNotEmpty'))
    }
    else {
      window.alert(err?.data?.detail ?? t('faq.admin.saveError'))
    }
  }
}

async function onReorder(ids: string[]) {
  const items = ids.map((id, idx) => ({ id, display_order: idx }))
  await reorderCategories({ items })
  await loadAll()
}
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <NuxtLink to="/admin/faq" class="text-sm text-brand-blue-600 hover:underline">
          ← {{ t('faq.admin.title') }}
        </NuxtLink>
        <h1 class="mt-2 text-2xl font-semibold">
          {{ t('faq.admin.categoriesTab') }}
        </h1>
      </div>
      <button
        class="rounded-lg bg-brand-blue-600 px-4 py-2 text-sm text-white hover:bg-brand-blue-700"
        @click="openCreate"
      >
        + {{ t('faq.admin.newCategory') }}
      </button>
    </header>

    <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <FaqAdminCategoryList
      :categories="categories"
      :loading="loading"
      @edit="openEdit"
      @delete="onDelete"
      @reorder="onReorder"
    />

    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeForm"
      >
        <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
          <h2 class="mb-4 text-lg font-semibold">
            {{ editing ? t('faq.admin.editCategory') : t('faq.admin.newCategory') }}
          </h2>
          <FaqAdminCategoryForm
            :category="editing"
            :saving="saving"
            @submit="onSubmit"
            @cancel="closeForm"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
