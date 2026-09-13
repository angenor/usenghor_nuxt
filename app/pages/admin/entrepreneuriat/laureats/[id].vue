<script setup lang="ts">
/**
 * Backoffice PEI — édition d'un portrait (lauréat FSE / étudiant-entrepreneur).
 */
import type {
  PeiCohortAdmin,
  PeiLaureateAdmin,
  PeiLaureateCreatePayload,
  PeiLaureateType,
} from '~/types/api/entrepreneurship'
import { laureateTypeLabels } from '~/composables/useEntrepreneurshipApi'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermissions()
const {
  getLaureate,
  updateLaureate,
  deleteLaureate,
  listCohorts,
  setLaureatePublished,
  setLaureateFeatured,
} = useEntrepreneurshipApi()

const id = String(route.params.id)

const canEdit = computed(() => hasPermission('entrepreneurship.edit'))
const canDelete = computed(() => hasPermission('entrepreneurship.delete'))

const laureate = ref<PeiLaureateAdmin | null>(null)
const cohorts = ref<PeiCohortAdmin[]>([])
const loading = ref(true)
const notFound = ref(false)
const saving = ref(false)
const togglingPublish = ref(false)
const togglingFeatured = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

let successTimer: ReturnType<typeof setTimeout> | null = null

function extractError(error: unknown, fallback: string): string {
  const err = error as { data?: { detail?: unknown } }
  const detail = err?.data?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail) && detail.length) {
    const msg = (detail[0] as { msg?: string })?.msg
    if (msg) return msg.replace(/^Value error, /, '')
  }
  return fallback
}

function showSuccess(text: string) {
  successMessage.value = text
  if (successTimer) clearTimeout(successTimer)
  successTimer = setTimeout(() => {
    successMessage.value = null
  }, 4000)
}

onBeforeUnmount(() => {
  if (successTimer) clearTimeout(successTimer)
})

async function load() {
  loading.value = true
  errorMessage.value = null
  try {
    const [item, cohortPage] = await Promise.all([
      getLaureate(id),
      listCohorts({ page: 1, page_size: 100 }),
    ])
    laureate.value = item
    cohorts.value = cohortPage.items
  }
  catch (error: unknown) {
    const err = error as { status?: number, statusCode?: number }
    if ((err?.status ?? err?.statusCode) === 404) {
      notFound.value = true
    }
    else {
      errorMessage.value = extractError(error, 'Impossible de charger le portrait.')
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(load)

const typeBadgeClasses: Record<PeiLaureateType, string> = {
  fse_laureate: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
  student_entrepreneur: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
}

async function onSubmit(payload: PeiLaureateCreatePayload) {
  errorMessage.value = null
  successMessage.value = null
  saving.value = true
  try {
    laureate.value = await updateLaureate(id, payload)
    showSuccess('Portrait enregistré.')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'L\'enregistrement du portrait a échoué.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  finally {
    saving.value = false
  }
}

async function onTogglePublish() {
  if (!laureate.value) return
  errorMessage.value = null
  togglingPublish.value = true
  try {
    const res = await setLaureatePublished(id, !laureate.value.is_published)
    // Seuls les champs de publication sont mis à jour pour préserver le formulaire en cours
    laureate.value = { ...laureate.value, is_published: res.is_published, published_at: res.published_at }
    showSuccess(res.is_published ? 'Portrait publié.' : 'Portrait dépublié.')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de modifier la publication du portrait.')
  }
  finally {
    togglingPublish.value = false
  }
}

async function onToggleFeatured() {
  if (!laureate.value) return
  errorMessage.value = null
  togglingFeatured.value = true
  try {
    const res = await setLaureateFeatured(id, !laureate.value.is_featured)
    laureate.value = { ...laureate.value, is_featured: res.is_featured }
    showSuccess(res.is_featured ? 'Portrait mis en avant.' : 'Mise en avant retirée.')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de modifier la mise en avant du portrait.')
  }
  finally {
    togglingFeatured.value = false
  }
}

// ── Suppression ────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

function openDeleteModal() {
  deleteError.value = null
  showDeleteModal.value = true
}

function closeDeleteModal() {
  if (deleting.value) return
  showDeleteModal.value = false
  deleteError.value = null
}

async function confirmDelete() {
  deleting.value = true
  deleteError.value = null
  try {
    await deleteLaureate(id)
    showDeleteModal.value = false
    await router.push('/admin/entrepreneuriat/laureats')
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
    <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <NuxtLink
          to="/admin/entrepreneuriat/laureats"
          class="inline-flex items-center gap-1 text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-3 w-3" />
          Lauréats et étudiants-entrepreneurs
        </NuxtLink>
        <h1 class="mt-2 flex flex-wrap items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
          {{ laureate?.full_name ?? 'Modifier le portrait' }}
          <template v-if="laureate">
            <span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {{ laureate.cohort.label }}
            </span>
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="typeBadgeClasses[laureate.type]"
            >
              {{ laureateTypeLabels[laureate.type] }}
            </span>
            <span
              v-if="laureate.is_published"
              class="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              Publié
            </span>
            <span
              v-else
              class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Brouillon
            </span>
            <span
              v-if="laureate.is_featured"
              class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            >
              <font-awesome-icon icon="fa-solid fa-star" class="h-3 w-3" />
              Mis en avant
            </span>
          </template>
        </h1>
        <p v-if="laureate" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ laureate.project_name }}
        </p>
      </div>

      <div v-if="laureate" class="flex flex-wrap gap-2">
        <button
          v-if="canEdit"
          type="button"
          :disabled="togglingPublish"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="onTogglePublish"
        >
          <font-awesome-icon
            :icon="togglingPublish ? 'fa-solid fa-spinner' : (laureate.is_published ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye')"
            :class="['h-4 w-4', togglingPublish ? 'animate-spin' : '']"
          />
          {{ laureate.is_published ? 'Dépublier' : 'Publier' }}
        </button>
        <button
          v-if="canEdit"
          type="button"
          :disabled="togglingFeatured"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="onToggleFeatured"
        >
          <font-awesome-icon
            :icon="togglingFeatured ? 'fa-solid fa-spinner' : 'fa-solid fa-star'"
            :class="['h-4 w-4', togglingFeatured ? 'animate-spin' : (laureate.is_featured ? 'text-amber-500' : '')]"
          />
          {{ laureate.is_featured ? 'Retirer la mise en avant' : 'Mettre en avant' }}
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
          @click="openDeleteModal"
        >
          <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
          Supprimer
        </button>
      </div>
    </header>

    <div
      v-if="errorMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5 h-4 w-4 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <div
      v-if="successMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
      role="status"
    >
      <font-awesome-icon icon="fa-solid fa-check" class="mt-0.5 h-4 w-4 shrink-0" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="loading" class="flex items-center justify-center gap-2 py-16 text-sm text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
      Chargement…
    </div>

    <div
      v-else-if="notFound"
      class="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800"
    >
      <p class="text-gray-700 dark:text-gray-300">
        Ce portrait est introuvable.
      </p>
      <NuxtLink
        to="/admin/entrepreneuriat/laureats"
        class="mt-4 inline-flex rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700"
      >
        Retour à la liste
      </NuxtLink>
    </div>

    <EntrepreneurshipAdminLaureateForm
      v-else-if="laureate"
      :laureate="laureate"
      :cohorts="cohorts"
      :saving="saving"
      @submit="onSubmit"
      @cancel="router.push('/admin/entrepreneuriat/laureats')"
    />

    <!-- Modale de confirmation de suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && laureate"
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
                Voulez-vous vraiment supprimer le portrait de « {{ laureate.full_name }} » ? Cette action est définitive.
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
