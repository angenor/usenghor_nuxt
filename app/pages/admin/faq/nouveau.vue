<script setup lang="ts">
import type {
  FaqCategoryAdmin,
  FaqEntryCreatePayload,
  FaqEntryUpdatePayload,
} from '~/types/api/faq'

definePageMeta({
  layout: 'admin',
})

const { t } = useI18n()
const router = useRouter()
const { listCategories, createEntry } = useFaqApi()

const categories = ref<FaqCategoryAdmin[]>([])
const saving = ref(false)
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  categories.value = await listCategories()
})

async function onSubmit(
  payload: FaqEntryCreatePayload | FaqEntryUpdatePayload,
) {
  errorMessage.value = null
  saving.value = true
  try {
    const created = await createEntry(payload as FaqEntryCreatePayload)
    await router.push(`/admin/faq/${created.id}`)
  }
  catch (error: unknown) {
    const err = error as { data?: { detail?: string } }
    errorMessage.value = err?.data?.detail ?? t('faq.admin.saveError')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <header class="mb-6">
      <NuxtLink to="/admin/faq" class="text-sm text-brand-blue-600 hover:underline">
        ← {{ t('faq.admin.title') }}
      </NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold">
        {{ t('faq.admin.newEntry') }}
      </h1>
    </header>

    <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <FaqAdminEntryForm
      v-if="categories.length"
      :categories="categories"
      :saving="saving"
      @submit="onSubmit"
      @cancel="router.push('/admin/faq')"
    />
  </div>
</template>
