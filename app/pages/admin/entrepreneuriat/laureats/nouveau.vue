<script setup lang="ts">
/**
 * Backoffice PEI — création d'un portrait (lauréat FSE / étudiant-entrepreneur).
 */
import type { PeiCohortAdmin, PeiLaureateCreatePayload } from '~/types/api/entrepreneurship'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const { hasPermission } = usePermissions()
const { createLaureate, listCohorts } = useEntrepreneurshipApi()

const canCreate = computed(() => hasPermission('entrepreneurship.create'))

const cohorts = ref<PeiCohortAdmin[]>([])
const loadingCohorts = ref(true)
const saving = ref(false)
const errorMessage = ref<string | null>(null)

function extractError(error: unknown, fallback: string): string {
  const err = error as { data?: { detail?: unknown } }
  const detail = err?.data?.detail
  if (typeof detail === 'string' && detail) return detail
  // Erreurs de validation Pydantic : liste de { msg }
  if (Array.isArray(detail) && detail.length) {
    const msg = (detail[0] as { msg?: string })?.msg
    if (msg) return msg.replace(/^Value error, /, '')
  }
  return fallback
}

onMounted(async () => {
  try {
    const res = await listCohorts({ page: 1, page_size: 100 })
    cohorts.value = res.items
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de charger les cohortes.')
  }
  finally {
    loadingCohorts.value = false
  }
})

async function onSubmit(payload: PeiLaureateCreatePayload) {
  errorMessage.value = null
  saving.value = true
  try {
    const created = await createLaureate(payload)
    await router.push(`/admin/entrepreneuriat/laureats/${created.id}`)
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'L\'enregistrement du portrait a échoué.')
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
        to="/admin/entrepreneuriat/laureats"
        class="inline-flex items-center gap-1 text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-3 w-3" />
        Lauréats et étudiants-entrepreneurs
      </NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        Nouveau portrait
      </h1>
    </header>

    <div
      v-if="!canCreate"
      class="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
    >
      La permission « entrepreneurship.create » est requise pour créer un portrait.
    </div>

    <template v-else>
      <div
        v-if="errorMessage"
        class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
        role="alert"
      >
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5 h-4 w-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="loadingCohorts" class="flex items-center justify-center gap-2 py-16 text-sm text-gray-500 dark:text-gray-400">
        <font-awesome-icon icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
        Chargement…
      </div>

      <EntrepreneurshipAdminLaureateForm
        v-else
        :cohorts="cohorts"
        :saving="saving"
        @submit="onSubmit"
        @cancel="router.push('/admin/entrepreneuriat/laureats')"
      />
    </template>
  </div>
</template>
