<script setup lang="ts">
import type { PeiResourceCreatePayload } from '~/types/api/entrepreneurship'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const { createResource } = useEntrepreneurshipApi()

const saving = ref(false)
const errorMessage = ref<string | null>(null)

function extractError(error: unknown, fallback: string): string {
  const detail = (error as { data?: { detail?: unknown } })?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const messages = detail
      .map(d => (d && typeof d === 'object' && 'msg' in d ? String((d as { msg: unknown }).msg) : ''))
      .map(m => m.replace(/^Value error,\s*/, ''))
      .filter(Boolean)
    if (messages.length) return messages.join(' ; ')
  }
  return fallback
}

async function onSubmit(payload: PeiResourceCreatePayload) {
  errorMessage.value = null
  saving.value = true
  try {
    const created = await createResource(payload)
    await router.push(`/admin/entrepreneuriat/ressources/${created.id}`)
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'L\'enregistrement de la ressource a échoué.')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <header class="mb-6">
      <NuxtLink to="/admin/entrepreneuriat/ressources" class="text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400">
        ← Boîte à outils
      </NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        Nouvelle ressource
      </h1>
    </header>

    <div
      v-if="errorMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5" />
      <span>{{ errorMessage }}</span>
    </div>

    <EntrepreneurshipAdminResourceForm
      :saving="saving"
      @submit="onSubmit"
      @cancel="router.push('/admin/entrepreneuriat/ressources')"
    />
  </div>
</template>
