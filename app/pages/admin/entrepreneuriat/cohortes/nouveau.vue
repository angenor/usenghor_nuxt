<script setup lang="ts">
/**
 * Backoffice PEI — création d'une cohorte.
 */
import type { PeiCohortCreatePayload } from '~/types/api/entrepreneurship'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const { createCohort } = useEntrepreneurshipApi()

const saving = ref(false)
const errorMessage = ref<string | null>(null)

async function onSubmit(payload: PeiCohortCreatePayload) {
  errorMessage.value = null
  saving.value = true
  try {
    const created = await createCohort(payload)
    await router.push(`/admin/entrepreneuriat/cohortes/${created.id}`)
  }
  catch (error: unknown) {
    const err = error as { status?: number, statusCode?: number, data?: { detail?: unknown } }
    const detail = err?.data?.detail
    if (typeof detail === 'string' && detail) {
      errorMessage.value = detail
    }
    else if ((err?.status ?? err?.statusCode) === 409) {
      errorMessage.value = 'Code déjà utilisé'
    }
    else {
      errorMessage.value = 'L\'enregistrement de la cohorte a échoué.'
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <header class="mb-6">
      <NuxtLink
        to="/admin/entrepreneuriat/cohortes"
        class="inline-flex items-center gap-1 text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-3 w-3" />
        Cohortes
      </NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        Nouvelle cohorte
      </h1>
    </header>

    <div
      v-if="errorMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5 h-4 w-4 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <EntrepreneurshipAdminCohortForm
      :saving="saving"
      @submit="onSubmit"
      @cancel="router.push('/admin/entrepreneuriat/cohortes')"
    />
  </div>
</template>
