<script setup lang="ts">
import type { PeiResourceAdmin, PeiResourceCreatePayload } from '~/types/api/entrepreneurship'
import { resourceTypeLabels } from '~/composables/useEntrepreneurshipApi'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermissions()
const {
  getResource,
  updateResource,
  setResourcePublished,
  deleteResource,
} = useEntrepreneurshipApi()

const id = String(route.params.id)
const resource = ref<PeiResourceAdmin | null>(null)
const loading = ref(true)
const saving = ref(false)
const toggling = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
// Clé de rendu : réinitialise le formulaire après rechargement.
const formKey = ref(0)

const canEdit = computed(() => hasPermission('entrepreneurship.edit'))
const canDelete = computed(() => hasPermission('entrepreneurship.delete'))

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

async function load() {
  loading.value = true
  errorMessage.value = null
  try {
    resource.value = await getResource(id)
    formKey.value++
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Impossible de charger la ressource.')
  }
  finally {
    loading.value = false
  }
}

onMounted(load)

const sourceHref = computed(() => {
  if (!resource.value) return null
  return resource.value.type === 'document' ? resource.value.media_url : resource.value.url
})

const youtubeEmbed = computed(() => {
  const r = resource.value
  if (!r || r.type !== 'video' || !r.url) return null
  try {
    const u = new URL(r.url)
    let videoId: string | null = null
    if (u.hostname.includes('youtu.be')) videoId = u.pathname.slice(1)
    else if (u.hostname.includes('youtube.com')) videoId = u.searchParams.get('v') ?? (u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] ?? null : null)
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null
  }
  catch {
    return null
  }
})

async function onSubmit(payload: PeiResourceCreatePayload) {
  errorMessage.value = null
  successMessage.value = null
  saving.value = true
  try {
    await updateResource(id, payload)
    await load()
    successMessage.value = 'Ressource enregistrée.'
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'L\'enregistrement de la ressource a échoué.')
  }
  finally {
    saving.value = false
  }
}

async function onTogglePublish() {
  const current = resource.value
  if (!current) return
  errorMessage.value = null
  successMessage.value = null
  toggling.value = true
  try {
    const wasPublished = current.is_published
    const status = await setResourcePublished(id, !wasPublished)
    // Mise à jour locale sans remonter le formulaire (préserve les modifications non enregistrées).
    resource.value = {
      ...current,
      is_published: status.is_published,
      published_at: status.published_at,
      updated_at: status.updated_at,
    }
    successMessage.value = wasPublished ? 'Ressource dépubliée.' : 'Ressource publiée.'
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'Le changement de statut a échoué.')
  }
  finally {
    toggling.value = false
  }
}

// ── Suppression ──────────────────────────────────────────────────
const showDelete = ref(false)
const deleting = ref(false)

async function confirmDelete() {
  deleting.value = true
  errorMessage.value = null
  try {
    await deleteResource(id)
    await router.push('/admin/entrepreneuriat/ressources')
  }
  catch (error: unknown) {
    errorMessage.value = extractError(error, 'La suppression a échoué.')
    showDelete.value = false
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
        <NuxtLink to="/admin/entrepreneuriat/ressources" class="text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400">
          ← Boîte à outils
        </NuxtLink>
        <h1 class="mt-2 flex flex-wrap items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white">
          Modifier la ressource
          <template v-if="resource">
            <span
              v-if="resource.is_published"
              class="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              Publiée
            </span>
            <span
              v-else
              class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Brouillon
            </span>
          </template>
        </h1>
      </div>
      <div v-if="resource" class="flex flex-wrap gap-2">
        <button
          v-if="canEdit"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          :disabled="toggling"
          @click="onTogglePublish"
        >
          <font-awesome-icon :icon="resource.is_published ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
          {{ resource.is_published ? 'Dépublier' : 'Publier' }}
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
          @click="showDelete = true"
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
          Supprimer
        </button>
      </div>
    </header>

    <div
      v-if="errorMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5" />
      <span>{{ errorMessage }}</span>
    </div>
    <div
      v-if="successMessage"
      class="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
      role="status"
    >
      <font-awesome-icon icon="fa-solid fa-circle-check" class="mt-0.5" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="loading && !resource" class="flex items-center gap-2 p-8 text-sm text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
      Chargement…
    </div>

    <template v-if="resource">
      <EntrepreneurshipAdminResourceForm
        :key="formKey"
        :resource="resource"
        :saving="saving"
        @submit="onSubmit"
        @cancel="router.push('/admin/entrepreneuriat/ressources')"
      />

      <section class="mt-10">
        <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Aperçu de la source
        </h2>
        <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p class="mb-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {{ resourceTypeLabels[resource.type] }}<span v-if="resource.category"> · {{ resource.category }}</span>
          </p>
          <p class="font-medium text-gray-900 dark:text-white">
            {{ resource.title }}
          </p>
          <p v-if="resource.description" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {{ resource.description }}
          </p>
          <div v-if="youtubeEmbed" class="mt-4 aspect-video w-full max-w-2xl overflow-hidden rounded-lg bg-black">
            <iframe
              :src="youtubeEmbed"
              class="h-full w-full"
              title="Aperçu de la vidéo"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
          <a
            v-if="sourceHref"
            :href="sourceHref"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 inline-flex items-center gap-2 break-all text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400"
          >
            <font-awesome-icon :icon="resource.type === 'document' ? 'fa-solid fa-file' : resource.type === 'video' ? 'fa-solid fa-video' : 'fa-solid fa-link'" />
            {{ resource.type === 'document' ? 'Ouvrir le document' : resource.url }}
          </a>
          <p v-else class="mt-3 text-sm text-gray-400">
            Aucune source disponible.
          </p>
        </div>
      </section>
    </template>

    <Teleport to="body">
      <div
        v-if="showDelete && resource"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDelete = false"
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
                « {{ resource.title }} » sera supprimée. Cette action est définitive.
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              :disabled="deleting"
              @click="showDelete = false"
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
