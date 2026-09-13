<script setup lang="ts">
import type { PeiProgramCreatePayload } from '~/types/api/entrepreneurship'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const { createProgram } = useEntrepreneurshipApi()

const saving = ref(false)
const errorMessage = ref<string | null>(null)

function extractError(error: unknown, fallback: string): string {
  const err = error as { status?: number, statusCode?: number, data?: { detail?: unknown } }
  if ((err?.status ?? err?.statusCode) === 409) return 'Code déjà utilisé : choisissez un autre code pour ce dispositif.'
  const detail = err?.data?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0] as { msg?: string }
    if (first?.msg) return first.msg
  }
  return fallback
}

async function onSubmit(payload: PeiProgramCreatePayload) {
  errorMessage.value = null
  saving.value = true
  try {
    const created = await createProgram(payload)
    await router.push(`/admin/entrepreneuriat/dispositifs/${created.id}`)
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'L\'enregistrement du dispositif a échoué.')
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
      <NuxtLink to="/admin/entrepreneuriat/dispositifs" class="text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400">
        ← Dispositifs du parcours
      </NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        Nouveau dispositif
      </h1>
    </header>

    <div
      v-if="errorMessage"
      class="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5" />
      <span>{{ errorMessage }}</span>
    </div>

    <EntrepreneurshipAdminProgramForm
      :saving="saving"
      @submit="onSubmit"
      @cancel="router.push('/admin/entrepreneuriat/dispositifs')"
    />
  </div>
</template>
