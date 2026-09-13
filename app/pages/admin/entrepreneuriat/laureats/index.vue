<script setup lang="ts">
/**
 * Backoffice PEI — liste des portraits (lauréats FSE / étudiants-entrepreneurs).
 * L'ordre est relatif à la cohorte : le glisser-déposer n'est actif que lorsqu'une
 * seule cohorte est filtrée, sans recherche ni autre filtre.
 */
import type {
  PeiCohortAdmin,
  PeiLaureateAdmin,
  PeiLaureateType,
} from '~/types/api/entrepreneurship'
import { laureateTypeOptions } from '~/composables/useEntrepreneurshipApi'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const { hasPermission } = usePermissions()
const {
  listCohorts,
  listLaureates,
  deleteLaureate,
  reorderLaureates,
  setLaureatePublished,
  setLaureateFeatured,
} = useEntrepreneurshipApi()

const canCreate = computed(() => hasPermission('entrepreneurship.create'))
const canEdit = computed(() => hasPermission('entrepreneurship.edit'))
const canDelete = computed(() => hasPermission('entrepreneurship.delete'))

const items = ref<PeiLaureateAdmin[]>([])
const total = ref(0)
const cohorts = ref<PeiCohortAdmin[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

// ── Filtres ────────────────────────────────────────────────────────
const q = ref('')
const debouncedQ = ref('')
const cohortId = ref('')
const type = ref<PeiLaureateType | ''>('')
const published = ref<'' | 'true' | 'false'>('')

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

const hasFilters = computed(
  () => !!debouncedQ.value || !!cohortId.value || type.value !== '' || published.value !== '',
)

// Réordonnancement possible uniquement sur une cohorte seule, sans autre filtre
const dragDisabled = computed(
  () => !cohortId.value || !!debouncedQ.value || type.value !== '' || published.value !== '',
)

function resetFilters() {
  q.value = ''
  debouncedQ.value = ''
  cohortId.value = ''
  type.value = ''
  published.value = ''
}

function extractError(error: unknown, fallback: string): string {
  const err = error as { data?: { detail?: unknown } }
  const detail = err?.data?.detail
  return typeof detail === 'string' && detail ? detail : fallback
}

async function loadCohorts() {
  try {
    const res = await listCohorts({ page: 1, page_size: 100 })
    cohorts.value = res.items
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de charger les cohortes.')
  }
}

async function load() {
  loading.value = true
  errorMessage.value = null
  try {
    const res = await listLaureates({
      q: debouncedQ.value || undefined,
      cohort_id: cohortId.value || undefined,
      type: type.value || undefined,
      is_published: published.value === '' ? undefined : published.value === 'true',
      page: 1,
      page_size: 100,
    })
    items.value = res.items
    total.value = res.total
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de charger les portraits.')
  }
  finally {
    loading.value = false
  }
}

watch([debouncedQ, cohortId, type, published], load)
onMounted(() => {
  loadCohorts()
  load()
})

// ── Actions ────────────────────────────────────────────────────────
function onEdit(id: string) {
  router.push(`/admin/entrepreneuriat/laureats/${id}`)
}

async function onReorder(ids: string[]) {
  if (!cohortId.value) return
  errorMessage.value = null
  try {
    await reorderLaureates(cohortId.value, ids)
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Le réordonnancement a échoué. L\'ordre précédent a été rétabli.')
  }
  finally {
    await load()
  }
}

async function onTogglePublish(item: PeiLaureateAdmin) {
  errorMessage.value = null
  try {
    const res = await setLaureatePublished(item.id, !item.is_published)
    const target = items.value.find(i => i.id === item.id)
    if (target) {
      target.is_published = res.is_published
      target.published_at = res.published_at
      target.updated_at = res.updated_at
    }
    if (published.value !== '') await load()
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de modifier la publication du portrait.')
  }
}

async function onToggleFeatured(item: PeiLaureateAdmin) {
  errorMessage.value = null
  try {
    const res = await setLaureateFeatured(item.id, !item.is_featured)
    const target = items.value.find(i => i.id === item.id)
    if (target) {
      target.is_featured = res.is_featured
      target.updated_at = res.updated_at
    }
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de modifier la mise en avant du portrait.')
  }
}

// ── Suppression ────────────────────────────────────────────────────
const deleteTarget = ref<PeiLaureateAdmin | null>(null)
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
    await deleteLaureate(deleteTarget.value.id)
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

const selectClass = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
</script>

<template>
  <div class="p-6">
    <!-- En-tête -->
    <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Lauréats et étudiants-entrepreneurs
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Portraits rattachés aux cohortes FSE et SEE. L'ordre d'affichage se règle cohorte par cohorte.
        </p>
      </div>
      <NuxtLink
        v-if="canCreate"
        to="/admin/entrepreneuriat/laureats/nouveau"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
        Nouveau portrait
      </NuxtLink>
    </header>

    <!-- Filtres -->
    <div class="mb-4 flex flex-wrap items-end gap-3">
      <div class="relative min-w-[16rem] flex-1">
        <label for="laureate-search" class="sr-only">Rechercher</label>
        <font-awesome-icon
          icon="fa-solid fa-magnifying-glass"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
        <input
          id="laureate-search"
          v-model="q"
          type="search"
          placeholder="Rechercher par nom ou projet…"
          class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
      </div>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-gray-700 dark:text-gray-300">Cohorte</span>
        <select v-model="cohortId" :class="selectClass">
          <option value="">
            Toutes
          </option>
          <option v-for="c in cohorts" :key="c.id" :value="c.id">
            {{ c.label }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-gray-700 dark:text-gray-300">Type</span>
        <select v-model="type" :class="selectClass">
          <option value="">
            Tous
          </option>
          <option v-for="opt in laureateTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-gray-700 dark:text-gray-300">Publication</span>
        <select v-model="published" :class="selectClass">
          <option value="">
            Tous
          </option>
          <option value="true">
            Publiés
          </option>
          <option value="false">
            Brouillons
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

    <p v-if="dragDisabled && canEdit" class="mb-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-circle-info" class="h-3 w-3" />
      Filtrez sur une seule cohorte, sans autre filtre, pour réordonner.
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

    <EntrepreneurshipAdminLaureateList
      :items="items"
      :loading="loading"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :drag-disabled="dragDisabled || !canEdit"
      @edit="onEdit"
      @delete="onDelete"
      @toggle-publish="onTogglePublish"
      @toggle-featured="onToggleFeatured"
      @reorder="onReorder"
    />

    <p v-if="!loading && total > items.length" class="mt-3 text-xs text-gray-500 dark:text-gray-400">
      {{ items.length }} portraits affichés sur {{ total }}.
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
          aria-labelledby="laureate-delete-title"
        >
          <div class="mb-4 flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 id="laureate-delete-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                Supprimer le portrait
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Voulez-vous vraiment supprimer le portrait de « {{ deleteTarget.full_name }} » ? Cette action est définitive.
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
