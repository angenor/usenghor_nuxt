<script setup lang="ts">
/**
 * Backoffice PEI — liste des cohortes (FSE / SEE).
 */
import type { PeiCohortAdmin, PeiCohortType } from '~/types/api/entrepreneurship'
import { cohortTypeOptions } from '~/composables/useEntrepreneurshipApi'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const { hasPermission } = usePermissions()
const {
  listCohorts,
  deleteCohort,
  reorderCohorts,
  setCohortActive,
} = useEntrepreneurshipApi()

const canCreate = computed(() => hasPermission('entrepreneurship.create'))
const canEdit = computed(() => hasPermission('entrepreneurship.edit'))
const canDelete = computed(() => hasPermission('entrepreneurship.delete'))

const items = ref<PeiCohortAdmin[]>([])
const total = ref(0)
const loading = ref(false)
const errorMessage = ref<string | null>(null)

// ── Filtres ────────────────────────────────────────────────────────
const q = ref('')
const debouncedQ = ref('')
const type = ref<PeiCohortType | ''>('')
const active = ref<'' | 'true' | 'false'>('')

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(q, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedQ.value = value.trim()
  }, 300)
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

const hasFilters = computed(() => !!debouncedQ.value || type.value !== '' || active.value !== '')

function resetFilters() {
  q.value = ''
  debouncedQ.value = ''
  type.value = ''
  active.value = ''
}

function extractError(error: unknown, fallback: string): string {
  const err = error as { data?: { detail?: unknown } }
  const detail = err?.data?.detail
  return typeof detail === 'string' && detail ? detail : fallback
}

async function load() {
  loading.value = true
  errorMessage.value = null
  try {
    const res = await listCohorts({
      q: debouncedQ.value || undefined,
      type: type.value || undefined,
      active: active.value === '' ? undefined : active.value === 'true',
      page: 1,
      page_size: 100,
    })
    items.value = res.items
    total.value = res.total
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de charger les cohortes.')
  }
  finally {
    loading.value = false
  }
}

watch([debouncedQ, type, active], load)
onMounted(load)

// ── Actions ────────────────────────────────────────────────────────
function onEdit(id: string) {
  router.push(`/admin/entrepreneuriat/cohortes/${id}`)
}

async function onReorder(ids: string[]) {
  errorMessage.value = null
  try {
    await reorderCohorts(ids)
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Le réordonnancement a échoué. L\'ordre précédent a été rétabli.')
  }
  finally {
    await load()
  }
}

async function onToggleActive(item: PeiCohortAdmin) {
  errorMessage.value = null
  try {
    const res = await setCohortActive(item.id, !item.active)
    const target = items.value.find(i => i.id === item.id)
    if (target) {
      target.active = res.active
      target.updated_at = res.updated_at
    }
    if (active.value !== '') await load()
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de modifier l\'état de la cohorte.')
  }
}

// ── Suppression ────────────────────────────────────────────────────
const deleteTarget = ref<PeiCohortAdmin | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

function onDelete(id: string) {
  deleteError.value = null
  deleteTarget.value = items.value.find(i => i.id === id) ?? null
}

function closeDeleteModal() {
  if (deleting.value) return
  deleteTarget.value = null
  deleteError.value = null
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await deleteCohort(deleteTarget.value.id)
    deleteTarget.value = null
    await load()
  }
  catch (error: unknown) {
    deleteError.value = extractError(error, 'La suppression a échoué.')
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <!-- En-tête -->
    <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Cohortes
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Cohortes FSE et SEE du Pôle Entrepreneuriat et Innovation. Glissez-déposez pour définir l'ordre d'affichage.
        </p>
      </div>
      <NuxtLink
        v-if="canCreate"
        to="/admin/entrepreneuriat/cohortes/nouveau"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
        Nouvelle cohorte
      </NuxtLink>
    </header>

    <!-- Filtres -->
    <div class="mb-4 flex flex-wrap items-end gap-3">
      <div class="relative min-w-[16rem] flex-1">
        <label for="cohort-search" class="sr-only">Rechercher</label>
        <font-awesome-icon
          icon="fa-solid fa-magnifying-glass"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
        <input
          id="cohort-search"
          v-model="q"
          type="search"
          placeholder="Rechercher par libellé…"
          class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
      </div>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-gray-700 dark:text-gray-300">Type</span>
        <select
          v-model="type"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">
            Tous
          </option>
          <option v-for="opt in cohortTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-gray-700 dark:text-gray-300">État</span>
        <select
          v-model="active"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">
            Tous
          </option>
          <option value="true">
            Actifs
          </option>
          <option value="false">
            Inactifs
          </option>
        </select>
      </label>
      <button
        v-if="hasFilters"
        type="button"
        class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="resetFilters"
      >
        Réinitialiser
      </button>
    </div>

    <p v-if="hasFilters" class="mb-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-circle-info" class="h-3 w-3" />
      Le glisser-déposer est désactivé tant qu'une recherche ou un filtre est actif.
    </p>

    <!-- Bandeau d'erreur -->
    <div
      v-if="errorMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5 h-4 w-4 shrink-0" />
      <span class="flex-1">{{ errorMessage }}</span>
      <button type="button" class="text-red-500 hover:text-red-700" aria-label="Fermer" @click="errorMessage = null">
        <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
      </button>
    </div>

    <EntrepreneurshipAdminCohortList
      :items="items"
      :loading="loading"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :drag-disabled="hasFilters || !canEdit"
      @edit="onEdit"
      @delete="onDelete"
      @toggle-active="onToggleActive"
      @reorder="onReorder"
    />

    <p v-if="!loading && total > items.length" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
      {{ items.length }} cohortes affichées sur {{ total }}.
    </p>

    <!-- Modale de confirmation de suppression -->
    <Teleport to="body">
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div
          class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cohort-delete-title"
        >
          <div class="mb-4 flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 id="cohort-delete-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                Supprimer la cohorte
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Voulez-vous vraiment supprimer « {{ deleteTarget.label }} » ? Cette action est définitive.
              </p>
            </div>
          </div>

          <div
            v-if="deleteError"
            class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
            role="alert"
          >
            {{ deleteError }}
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              :disabled="deleting"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="deleting"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              @click="confirmDelete"
            >
              <font-awesome-icon
                :icon="deleting ? 'fa-solid fa-spinner' : 'fa-solid fa-trash'"
                :class="['h-4 w-4', deleting ? 'animate-spin' : '']"
              />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
