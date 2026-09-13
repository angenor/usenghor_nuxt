<script setup lang="ts">
import type { PeiProgramAdmin, PeiProgramPhase } from '~/types/api/entrepreneurship'
import { programPhaseOptions } from '~/composables/useEntrepreneurshipApi'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const { hasPermission } = usePermissions()
const {
  listPrograms,
  reorderPrograms,
  setProgramActive,
  deleteProgram,
} = useEntrepreneurshipApi()

const canCreate = computed(() => hasPermission('entrepreneurship.create'))
const canEdit = computed(() => hasPermission('entrepreneurship.edit'))
const canDelete = computed(() => hasPermission('entrepreneurship.delete'))

// === ÉTAT ===
const q = ref('')
const debouncedQ = ref('')
const phase = ref<PeiProgramPhase | ''>('')
const active = ref<'' | 'true' | 'false'>('')

const programs = ref<PeiProgramAdmin[]>([])
const total = ref(0)
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const showDeleteModal = ref(false)
const deletingProgram = ref<PeiProgramAdmin | null>(null)
const isDeleting = ref(false)

const hasFilters = computed(() => !!debouncedQ.value || phase.value !== '' || active.value !== '')

function extractError(error: unknown, fallback: string): string {
  const err = error as { data?: { detail?: unknown } }
  const detail = err?.data?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0] as { msg?: string }
    if (first?.msg) return first.msg
  }
  return fallback
}

// === CHARGEMENT ===
async function loadPrograms() {
  loading.value = true
  errorMessage.value = null
  try {
    const result = await listPrograms({
      q: debouncedQ.value || undefined,
      phase: phase.value || undefined,
      active: active.value === '' ? undefined : active.value === 'true',
      page: 1,
      page_size: 100,
    })
    programs.value = result.items
    total.value = result.total
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Erreur lors du chargement des dispositifs.')
  }
  finally {
    loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(q, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedQ.value = value.trim()
  }, 300)
})

watch([debouncedQ, phase, active], () => {
  loadPrograms()
})

onMounted(loadPrograms)

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

function resetFilters() {
  q.value = ''
  debouncedQ.value = ''
  phase.value = ''
  active.value = ''
}

// === ACTIONS ===
function onEdit(id: string) {
  router.push(`/admin/entrepreneuriat/dispositifs/${id}`)
}

async function onReorder(ids: string[]) {
  errorMessage.value = null
  try {
    await reorderPrograms(ids)
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Le réordonnancement a échoué. L\'ordre précédent a été rétabli.')
  }
  finally {
    await loadPrograms()
  }
}

async function onToggleActive(item: PeiProgramAdmin) {
  errorMessage.value = null
  try {
    await setProgramActive(item.id, !item.active)
    await loadPrograms()
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de modifier l\'état du dispositif.')
  }
}

function onDelete(id: string) {
  deletingProgram.value = programs.value.find(p => p.id === id) ?? null
  if (deletingProgram.value) showDeleteModal.value = true
}

function closeDeleteModal() {
  if (isDeleting.value) return
  showDeleteModal.value = false
  deletingProgram.value = null
}

async function executeDelete() {
  if (!deletingProgram.value) return
  isDeleting.value = true
  errorMessage.value = null
  try {
    await deleteProgram(deletingProgram.value.id)
    showDeleteModal.value = false
    deletingProgram.value = null
    await loadPrograms()
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
    <!-- En-tête -->
    <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <NuxtLink to="/admin/entrepreneuriat" class="text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400">
          ← Entrepreneuriat (PEI)
        </NuxtLink>
        <h1 class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Dispositifs du parcours
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Étapes du parcours entrepreneurial affichées sur le site public, dans l'ordre défini ci-dessous.
        </p>
      </div>
      <NuxtLink
        v-if="canCreate"
        to="/admin/entrepreneuriat/dispositifs/nouveau"
        class="inline-flex items-center gap-2 self-start rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700"
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Nouveau dispositif
      </NuxtLink>
    </header>

    <!-- Filtres -->
    <div class="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center dark:border-gray-700 dark:bg-gray-800">
      <div class="relative flex-1">
        <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
        <input
          v-model="q"
          type="search"
          placeholder="Rechercher un dispositif (titre, sigle, code)…"
          aria-label="Rechercher un dispositif"
          class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
      </div>
      <select
        v-model="phase"
        aria-label="Filtrer par phase"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">
          Toutes les phases
        </option>
        <option v-for="option in programPhaseOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <select
        v-model="active"
        aria-label="Filtrer par état"
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="">
          Tous les états
        </option>
        <option value="true">
          Actifs
        </option>
        <option value="false">
          Inactifs
        </option>
      </select>
      <button
        v-if="hasFilters || q"
        type="button"
        class="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="resetFilters"
      >
        <font-awesome-icon icon="fa-solid fa-xmark" class="mr-1" />
        Réinitialiser
      </button>
    </div>

    <div
      v-if="errorMessage"
      class="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5" />
      <span class="flex-1">{{ errorMessage }}</span>
      <button type="button" class="text-red-500 hover:text-red-700" aria-label="Fermer" @click="errorMessage = null">
        <font-awesome-icon icon="fa-solid fa-xmark" />
      </button>
    </div>

    <p v-if="!loading && programs.length" class="mb-2 text-xs text-gray-500 dark:text-gray-400">
      {{ total }} dispositif{{ total > 1 ? 's' : '' }}
    </p>

    <EntrepreneurshipAdminProgramList
      :items="programs"
      :loading="loading"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :drag-disabled="!!q || phase !== '' || active !== ''"
      @edit="onEdit"
      @delete="onDelete"
      @toggle-active="onToggleActive"
      @reorder="onReorder"
    />

    <!-- Modale de confirmation de suppression -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="closeDeleteModal" />
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
            <strong class="text-gray-900 dark:text-white">{{ deletingProgram?.title }}</strong> ?
            Cette action est définitive.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              :disabled="isDeleting"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeDeleteModal"
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
