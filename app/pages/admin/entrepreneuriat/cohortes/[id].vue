<script setup lang="ts">
/**
 * Backoffice PEI — édition d'une cohorte (avec aperçu FR du bilan).
 */
import type { PeiCohortAdmin, PeiCohortCreatePayload, PeiCohortType } from '~/types/api/entrepreneurship'
import { cohortTypeOptions } from '~/composables/useEntrepreneurshipApi'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermissions()
const {
  getCohort,
  updateCohort,
  setCohortActive,
  deleteCohort,
} = useEntrepreneurshipApi()

const id = String(route.params.id)

const canEdit = computed(() => hasPermission('entrepreneurship.edit'))
const canDelete = computed(() => hasPermission('entrepreneurship.delete'))

const cohort = ref<PeiCohortAdmin | null>(null)
const loading = ref(true)
const notFound = ref(false)
const saving = ref(false)
const toggling = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

let successTimer: ReturnType<typeof setTimeout> | null = null

function extractError(error: unknown, fallback: string): string {
  const err = error as { data?: { detail?: unknown } }
  const detail = err?.data?.detail
  return typeof detail === 'string' && detail ? detail : fallback
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
    cohort.value = await getCohort(id)
  }
  catch (error: unknown) {
    const err = error as { status?: number, statusCode?: number }
    if ((err?.status ?? err?.statusCode) === 404) {
      notFound.value = true
    }
    else {
      errorMessage.value = extractError(error, 'Impossible de charger la cohorte.')
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(load)

const typeBadgeClasses: Record<PeiCohortType, string> = {
  fse: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
  see: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
}

function typeLabel(type: PeiCohortType): string {
  return cohortTypeOptions.find(o => o.value === type)?.label ?? type
}

async function onSubmit(payload: PeiCohortCreatePayload) {
  errorMessage.value = null
  successMessage.value = null
  saving.value = true
  try {
    cohort.value = await updateCohort(id, payload)
    showSuccess('Cohorte enregistrée.')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'L\'enregistrement de la cohorte a échoué.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  finally {
    saving.value = false
  }
}

async function onToggleActive() {
  if (!cohort.value) return
  errorMessage.value = null
  toggling.value = true
  try {
    const res = await setCohortActive(id, !cohort.value.active)
    // Seul `active` est mis à jour pour ne pas écraser les modifications en cours du formulaire
    cohort.value = { ...cohort.value, active: res.active }
    showSuccess(res.active ? 'Cohorte activée.' : 'Cohorte désactivée.')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de modifier l\'état de la cohorte.')
  }
  finally {
    toggling.value = false
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
    await deleteCohort(id)
    showDeleteModal.value = false
    await router.push('/admin/entrepreneuriat/cohortes')
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
          to="/admin/entrepreneuriat/cohortes"
          class="inline-flex items-center gap-1 text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-3 w-3" />
          Cohortes
        </NuxtLink>
        <h1 class="mt-2 flex flex-wrap items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
          {{ cohort?.label ?? 'Modifier la cohorte' }}
          <template v-if="cohort">
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="typeBadgeClasses[cohort.type]"
            >
              {{ typeLabel(cohort.type) }} · {{ cohort.year }}
            </span>
            <span
              v-if="cohort.active"
              class="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              Actif
            </span>
            <span
              v-else
              class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Inactif
            </span>
          </template>
        </h1>
        <p v-if="cohort" class="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
          {{ cohort.code }}
        </p>
      </div>

      <div v-if="cohort" class="flex gap-2">
        <button
          v-if="canEdit"
          type="button"
          :disabled="toggling"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="onToggleActive"
        >
          <font-awesome-icon
            :icon="toggling ? 'fa-solid fa-spinner' : (cohort.active ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye')"
            :class="['h-4 w-4', toggling ? 'animate-spin' : '']"
          />
          {{ cohort.active ? 'Désactiver' : 'Activer' }}
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
        Cette cohorte est introuvable.
      </p>
      <NuxtLink
        to="/admin/entrepreneuriat/cohortes"
        class="mt-4 inline-flex rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700"
      >
        Retour à la liste
      </NuxtLink>
    </div>

    <template v-else-if="cohort">
      <EntrepreneurshipAdminCohortForm
        :cohort="cohort"
        :saving="saving"
        @submit="onSubmit"
        @cancel="router.push('/admin/entrepreneuriat/cohortes')"
      />

      <!-- Aperçu FR -->
      <section class="mt-10">
        <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Aperçu (FR)
        </h2>
        <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="typeBadgeClasses[cohort.type]"
            >
              {{ typeLabel(cohort.type) }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ cohort.year }}</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ cohort.label }}
          </h3>
          <p v-if="cohort.focus" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ cohort.focus }}
          </p>
          <div v-if="cohort.summary_html" class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <RichTextRenderer :html="cohort.summary_html" />
          </div>
          <p v-else class="mt-4 text-sm italic text-gray-400 dark:text-gray-500">
            Aucun bilan renseigné.
          </p>
        </div>
      </section>
    </template>

    <!-- Modale de confirmation de suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && cohort"
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
                Voulez-vous vraiment supprimer « {{ cohort.label }} » ? Cette action est définitive.
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
