<script setup lang="ts">
import type { PeiResourceAdmin, PeiResourceType } from '~/types/api/entrepreneurship'
import { resourceTypeOptions } from '~/composables/useEntrepreneurshipApi'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const { hasPermission } = usePermissions()
const {
  listResources,
  listResourceCategories,
  reorderResources,
  setResourcePublished,
  deleteResource,
} = useEntrepreneurshipApi()

const canCreate = computed(() => hasPermission('entrepreneurship.create'))
const canEdit = computed(() => hasPermission('entrepreneurship.edit'))
const canDelete = computed(() => hasPermission('entrepreneurship.delete'))

const items = ref<PeiResourceAdmin[]>([])
const categories = ref<string[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const search = ref('')
const q = ref('')
const type = ref<PeiResourceType | ''>('')
const category = ref('')
const published = ref<'' | 'true' | 'false'>('')

const dragDisabled = computed(() => !!q.value || type.value !== '' || category.value !== '' || published.value !== '')

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

let requestId = 0

async function loadResources() {
  const current = ++requestId
  loading.value = true
  errorMessage.value = null
  try {
    const result = await listResources({
      q: q.value || undefined,
      type: type.value || undefined,
      category: category.value || undefined,
      is_published: published.value === '' ? undefined : published.value === 'true',
      page: 1,
      page_size: 100,
    })
    if (current === requestId) items.value = result.items
  }
  catch (error: unknown) {
    if (current === requestId) errorMessage.value = extractError(error, 'Impossible de charger les ressources.')
  }
  finally {
    if (current === requestId) loading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await listResourceCategories()
  }
  catch {
    categories.value = []
  }
}

onMounted(() => {
  loadResources()
  loadCategories()
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    q.value = value.trim()
  }, 300)
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

watch([q, type, category, published], () => {
  loadResources()
})

function resetFilters() {
  search.value = ''
  q.value = ''
  type.value = ''
  category.value = ''
  published.value = ''
}

function onEdit(id: string) {
  router.push(`/admin/entrepreneuriat/ressources/${id}`)
}

async function onReorder(ids: string[]) {
  errorMessage.value = null
  try {
    await reorderResources(ids)
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Le réordonnancement a échoué.')
  }
  finally {
    await loadResources()
  }
}

async function onTogglePublish(item: PeiResourceAdmin) {
  errorMessage.value = null
  try {
    await setResourcePublished(item.id, !item.is_published)
    await loadResources()
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Le changement de statut a échoué.')
  }
}

// ── Suppression ──────────────────────────────────────────────────
const toDelete = ref<PeiResourceAdmin | null>(null)
const deleting = ref(false)

function onDelete(id: string) {
  toDelete.value = items.value.find(i => i.id === id) ?? null
}

async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  errorMessage.value = null
  try {
    await deleteResource(toDelete.value.id)
    toDelete.value = null
    await Promise.all([loadResources(), loadCategories()])
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'La suppression a échoué.')
    toDelete.value = null
  }
  finally {
    deleting.value = false
  }
}

const inputClass = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
</script>

<template>
  <div class="p-6">
    <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <NuxtLink to="/admin/entrepreneuriat" class="text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400">
          ← Entrepreneuriat (PEI)
        </NuxtLink>
        <h1 class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Boîte à outils
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Documents, liens et vidéos mis à disposition des porteurs de projet.
        </p>
      </div>
      <NuxtLink
        v-if="canCreate"
        to="/admin/entrepreneuriat/ressources/nouveau"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700"
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Nouvelle ressource
      </NuxtLink>
    </header>

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <div class="relative min-w-[220px] flex-1">
        <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher par titre…"
          :class="[inputClass, 'w-full pl-9']"
        >
      </div>
      <select v-model="type" :class="inputClass" aria-label="Filtrer par type">
        <option value="">
          Tous les types
        </option>
        <option v-for="option in resourceTypeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <select v-model="category" :class="inputClass" aria-label="Filtrer par catégorie">
        <option value="">
          Toutes les catégories
        </option>
        <option v-for="c in categories" :key="c" :value="c">
          {{ c }}
        </option>
      </select>
      <select v-model="published" :class="inputClass" aria-label="Filtrer par publication">
        <option value="">
          Tous les statuts
        </option>
        <option value="true">
          Publiées
        </option>
        <option value="false">
          Brouillons
        </option>
      </select>
      <button
        v-if="dragDisabled || search"
        type="button"
        class="text-sm text-gray-600 hover:underline dark:text-gray-300"
        @click="resetFilters"
      >
        Réinitialiser
      </button>
    </div>

    <p v-if="dragDisabled" class="mb-3 text-xs text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-circle-info" class="mr-1" />
      Le glisser-déposer est désactivé tant qu'une recherche ou un filtre est actif.
    </p>

    <div
      v-if="errorMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5" />
      <span class="flex-1">{{ errorMessage }}</span>
      <button type="button" aria-label="Fermer" @click="errorMessage = null">
        <font-awesome-icon icon="fa-solid fa-xmark" />
      </button>
    </div>

    <EntrepreneurshipAdminResourceList
      :items="items"
      :categories="categories"
      :loading="loading"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :drag-disabled="dragDisabled || !canEdit"
      @edit="onEdit"
      @delete="onDelete"
      @toggle-publish="onTogglePublish"
      @reorder="onReorder"
    />

    <Teleport to="body">
      <div
        v-if="toDelete"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="toDelete = null"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800" role="dialog" aria-modal="true">
          <div class="mb-4 flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Supprimer la ressource
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                « {{ toDelete.title }} » sera supprimée. Cette action est définitive.
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              :disabled="deleting"
              @click="toDelete = null"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              :disabled="deleting"
              @click="confirmDelete"
            >
              <font-awesome-icon v-if="deleting" icon="fa-solid fa-spinner" class="animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
