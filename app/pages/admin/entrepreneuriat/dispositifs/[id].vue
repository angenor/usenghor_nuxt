<script setup lang="ts">
import type { PeiProgramAdmin, PeiProgramCreatePayload } from '~/types/api/entrepreneurship'
import { programPhaseColorLabels, programPhaseLabels } from '~/composables/useEntrepreneurshipApi'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermissions()
const {
  getProgram,
  updateProgram,
  setProgramActive,
  deleteProgram,
} = useEntrepreneurshipApi()

const id = String(route.params.id)

const program = ref<PeiProgramAdmin | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)
const saving = ref(false)
const toggling = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const showDeleteModal = ref(false)
const isDeleting = ref(false)

const canEdit = computed(() => hasPermission('entrepreneurship.edit'))
const canDelete = computed(() => hasPermission('entrepreneurship.delete'))

/** Teinte publique du dispositif : fixée par sa phase. */
const phaseTone = computed(() => (program.value ? peiStepTone(program.value.phase) : null))

let successTimer: ReturnType<typeof setTimeout> | null = null

function extractError(error: unknown, fallback: string): string {
  const err = error as { status?: number, statusCode?: number, data?: { detail?: unknown } }
  const status = err?.status ?? err?.statusCode
  if (status === 409) return 'Code déjà utilisé : choisissez un autre code pour ce dispositif.'
  if (status === 404) return 'Dispositif introuvable.'
  const detail = err?.data?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0] as { msg?: string }
    if (first?.msg) return first.msg
  }
  return fallback
}

async function loadProgram() {
  loadError.value = null
  try {
    program.value = await getProgram(id)
  }
  catch (error: unknown) {
    loadError.value = extractError(error, 'Erreur lors du chargement du dispositif.')
  }
  finally {
    loading.value = false
  }
}

onMounted(loadProgram)

onBeforeUnmount(() => {
  if (successTimer) clearTimeout(successTimer)
})

function showSuccess(message: string) {
  successMessage.value = message
  if (successTimer) clearTimeout(successTimer)
  successTimer = setTimeout(() => {
    successMessage.value = null
  }, 4000)
}

async function onSubmit(payload: PeiProgramCreatePayload) {
  errorMessage.value = null
  successMessage.value = null
  saving.value = true
  try {
    await updateProgram(id, payload)
    await loadProgram()
    showSuccess('Dispositif enregistré.')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'L\'enregistrement du dispositif a échoué.')
  }
  finally {
    saving.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function onToggleActive() {
  if (!program.value) return
  errorMessage.value = null
  toggling.value = true
  const next = !program.value.active
  try {
    await setProgramActive(id, next)
    await loadProgram()
    showSuccess(next ? 'Dispositif activé.' : 'Dispositif désactivé.')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de modifier l\'état du dispositif.')
  }
  finally {
    toggling.value = false
  }
}

async function executeDelete() {
  isDeleting.value = true
  errorMessage.value = null
  try {
    await deleteProgram(id)
    showDeleteModal.value = false
    await router.push('/admin/entrepreneuriat/dispositifs')
  }
  catch (error: unknown) {
    showDeleteModal.value = false
    errorMessage.value = extractError(error, 'La suppression du dispositif a échoué.')
  }
  finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <NuxtLink to="/admin/entrepreneuriat/dispositifs" class="text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400">
          ← Dispositifs du parcours
        </NuxtLink>
        <div class="mt-2 flex flex-wrap items-center gap-3">
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ program ? (program.sigle ? `${program.sigle} · ${program.title}` : program.title) : 'Modifier le dispositif' }}
          </h1>
          <span
            v-if="program"
            class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
            :class="program.active
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
          >
            {{ program.active ? 'Actif' : 'Inactif' }}
          </span>
        </div>
        <p v-if="program" class="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
          {{ program.code }}
        </p>
      </div>
      <div v-if="program" class="flex gap-2 self-start">
        <button
          v-if="canEdit"
          type="button"
          :disabled="toggling"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="onToggleActive"
        >
          <font-awesome-icon v-if="toggling" icon="fa-solid fa-spinner" class="animate-spin" />
          <font-awesome-icon v-else :icon="program.active ? 'fa-solid fa-toggle-off' : 'fa-solid fa-toggle-on'" />
          {{ program.active ? 'Désactiver' : 'Activer' }}
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
          @click="showDeleteModal = true"
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
          Supprimer
        </button>
      </div>
    </header>

    <div v-if="loading" class="flex items-center justify-center py-16 text-sm text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-spinner" class="mr-2 animate-spin" />
      Chargement du dispositif…
    </div>

    <div
      v-else-if="loadError"
      class="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mr-1" />
      {{ loadError }}
    </div>

    <template v-else-if="program">
      <div
        v-if="successMessage"
        class="mb-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300"
        role="status"
      >
        <font-awesome-icon icon="fa-solid fa-circle-check" class="mt-0.5" />
        <span>{{ successMessage }}</span>
      </div>

      <div
        v-if="errorMessage"
        class="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
        role="alert"
      >
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5" />
        <span>{{ errorMessage }}</span>
      </div>

      <EntrepreneurshipAdminProgramForm
        :program="program"
        :saving="saving"
        @submit="onSubmit"
        @cancel="router.push('/admin/entrepreneuriat/dispositifs')"
      />

      <!-- Aperçu (FR) -->
      <section class="mt-10">
        <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Aperçu (FR)
        </h2>
        <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex flex-wrap items-center gap-3">
            <span
              class="inline-block h-4 w-4 rounded-full"
              :style="phaseTone ? { backgroundColor: phaseTone.fill } : undefined"
              :title="`Couleur de la phase : ${programPhaseColorLabels[program.phase] ?? program.phase}`"
            />
            <span class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {{ programPhaseLabels[program.phase] ?? program.phase }}
            </span>
            <span
              v-if="program.highlight"
              class="inline-flex rounded-full px-3 py-1 text-sm font-semibold"
              :style="phaseTone ? { backgroundColor: phaseTone.soft, color: phaseTone.ink } : undefined"
            >
              {{ program.highlight }}
            </span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            <span v-if="program.sigle" class="mr-1">{{ program.sigle }} ·</span>{{ program.title }}
          </h3>
          <p v-if="program.tagline" class="mt-1 text-gray-600 dark:text-gray-300">
            {{ program.tagline }}
          </p>
          <div v-if="program.content_html" class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <RichTextRenderer :html="program.content_html" />
          </div>
          <p v-else class="mt-4 text-sm italic text-gray-400">
            Aucun contenu détaillé en français.
          </p>
        </div>
      </section>
    </template>

    <!-- Modale de confirmation de suppression -->
    <Teleport to="body">
      <div v-if="showDeleteModal && program" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="!isDeleting && (showDeleteModal = false)" />
        <div
          class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-program-title"
        >
          <h3 id="delete-program-title" class="text-lg font-semibold text-gray-900 dark:text-white">
            Supprimer le dispositif
          </h3>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer le dispositif
            <strong class="text-gray-900 dark:text-white">{{ program.title }}</strong> ?
            Cette action est définitive.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              :disabled="isDeleting"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="isDeleting"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              @click="executeDelete"
            >
              <font-awesome-icon v-if="isDeleting" icon="fa-solid fa-spinner" class="animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
