<script setup lang="ts">
import type { NewsDisplay, NewsHighlightStatus } from '~/types/news'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getNewsById,
  deleteNews: apiDeleteNews,
  duplicateNews: apiDuplicateNews,
  publishNews: apiPublishNews,
  unpublishNews: apiUnpublishNews,
  updateNews: apiUpdateNews,
  newsStatusLabels,
  newsStatusColors,
  highlightStatusLabels,
  highlightStatusColors,
  formatNewsDateTime,
  slugify,
} = useAdminNewsApi()

const { getMediaUrl } = useMediaApi()

// Helper pour obtenir l'URL de l'image de couverture (préfère l'ID externe pour éviter les URLs mock)
const coverImageUrl = computed(() => {
  if (!newsItem.value) return null
  if (newsItem.value.cover_image_external_id) {
    return getMediaUrl(newsItem.value.cover_image_external_id)
  }
  return newsItem.value.cover_image || null
})

// === STATE ===
const showDeleteModal = ref(false)
const isLoading = ref(true)
const isActionLoading = ref(false)
const error = ref<string | null>(null)
const newsItem = ref<NewsDisplay | null>(null)

// Get news ID from route
const newsId = computed(() => route.params.id as string)

// Load news item
const loadNews = async () => {
  isLoading.value = true
  error.value = null

  try {
    newsItem.value = await getNewsById(newsId.value)
  }
  catch (e: unknown) {
    const fetchError = e as { status?: number; data?: { detail?: string } }
    if (fetchError.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Actualité non trouvée'
      })
    }
    error.value = fetchError.data?.detail || 'Erreur lors du chargement de l\'actualité'
    console.error('Erreur:', e)
  }
  finally {
    isLoading.value = false
  }
}

// Load on mount
onMounted(() => {
  loadNews()
})

// === METHODS ===
function editNews() {
  router.push(`/admin/contenus/actualites/${newsId.value}/edit`)
}

async function duplicateNews() {
  if (!newsItem.value) return

  isActionLoading.value = true
  try {
    const newSlug = `${newsItem.value.slug}-copie-${Date.now()}`
    const result = await apiDuplicateNews(newsId.value, newSlug)
    router.push(`/admin/contenus/actualites/${result.id}`)
  }
  catch (e) {
    console.error('Erreur lors de la duplication:', e)
  }
  finally {
    isActionLoading.value = false
  }
}

async function deleteNews() {
  isActionLoading.value = true
  try {
    await apiDeleteNews(newsId.value)
    showDeleteModal.value = false
    router.push('/admin/contenus/actualites')
  }
  catch (e) {
    console.error('Erreur lors de la suppression:', e)
  }
  finally {
    isActionLoading.value = false
  }
}

async function setHighlightStatus(status: NewsHighlightStatus) {
  isActionLoading.value = true
  try {
    newsItem.value = await apiUpdateNews(newsId.value, { highlight_status: status })
  }
  catch (e) {
    console.error('Erreur lors de la mise à jour:', e)
  }
  finally {
    isActionLoading.value = false
  }
}

async function publishNews() {
  isActionLoading.value = true
  try {
    newsItem.value = await apiPublishNews(newsId.value)
  }
  catch (e) {
    console.error('Erreur lors de la publication:', e)
  }
  finally {
    isActionLoading.value = false
  }
}

async function unpublishNews() {
  isActionLoading.value = true
  try {
    newsItem.value = await apiUnpublishNews(newsId.value)
  }
  catch (e) {
    console.error('Erreur lors de la dépublication:', e)
  }
  finally {
    isActionLoading.value = false
  }
}

function formatDate(dateString?: string | null) {
  return formatNewsDateTime(dateString)
}

// Contenu EditorJS formaté pour le composant renderer
const editorContent = computed(() => {
  if (!newsItem.value?.content || !newsItem.value.content.blocks || newsItem.value.content.blocks.length === 0) {
    return null
  }
  return newsItem.value.content
})
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoading" class="flex items-center justify-center py-12">
    <div class="flex flex-col items-center gap-4">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      <span class="text-sm text-gray-500 dark:text-gray-400">Chargement de l'actualité...</span>
    </div>
  </div>

  <!-- Error -->
  <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
    <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mb-4 h-12 w-12 text-red-500" />
    <h2 class="mb-2 text-lg font-semibold text-red-800 dark:text-red-400">Erreur</h2>
    <p class="text-red-600 dark:text-red-300">{{ error }}</p>
    <button
      class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      @click="loadNews"
    >
      Réessayer
    </button>
  </div>

  <!-- Content -->
  <div v-else-if="newsItem" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex items-start gap-4">
        <button
          class="mt-1 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          @click="router.push('/admin/contenus/actualites')"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-5 w-5" />
        </button>
        <div>
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
              :class="newsStatusColors[newsItem.status]"
            >
              {{ newsStatusLabels[newsItem.status] }}
            </span>
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
              :class="highlightStatusColors[newsItem.highlight_status]"
            >
              {{ highlightStatusLabels[newsItem.highlight_status] }}
            </span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ newsItem.title }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            /actualites/{{ newsItem.slug }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Actions rapides -->
        <div class="flex items-center gap-2">
          <button
            v-if="newsItem.status !== 'published'"
            :disabled="isActionLoading"
            class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            @click="publishNews"
          >
            <font-awesome-icon icon="fa-solid fa-globe" class="h-4 w-4" />
            Publier
          </button>
          <button
            v-else
            :disabled="isActionLoading"
            class="inline-flex items-center gap-2 rounded-lg border border-yellow-500 px-4 py-2 text-sm font-medium text-yellow-600 transition-colors hover:bg-yellow-50 disabled:opacity-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
            @click="unpublishNews"
          >
            <font-awesome-icon icon="fa-solid fa-eye-slash" class="h-4 w-4" />
            Dépublier
          </button>
        </div>

        <!-- Dropdown mise en avant -->
        <select
          :value="newsItem.highlight_status"
          :disabled="isActionLoading"
          class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @change="setHighlightStatus(($event.target as HTMLSelectElement).value as NewsHighlightStatus)"
        >
          <option value="standard">Standard</option>
          <option value="featured">Mise en avant</option>
          <option value="headline">À la une</option>
        </select>

        <!-- Actions -->
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="editNews"
        >
          <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
          Modifier
        </button>
        <button
          :disabled="isActionLoading"
          class="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          title="Dupliquer"
          @click="duplicateNews"
        >
          <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
        </button>
        <button
          class="rounded-lg border border-red-300 p-2 text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          title="Supprimer"
          @click="showDeleteModal = true"
        >
          <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Contenu principal -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Image de couverture -->
        <div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div v-if="coverImageUrl" class="relative">
            <img
              :src="coverImageUrl"
              :alt="newsItem.cover_image_alt || newsItem.title"
              class="h-64 w-full object-cover"
            />
            <div v-if="newsItem.cover_image_external_id" class="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
              ID: {{ newsItem.cover_image_external_id.substring(0, 8) }}...
            </div>
          </div>
          <div v-else class="flex h-48 flex-col items-center justify-center bg-gray-100 dark:bg-gray-700">
            <font-awesome-icon icon="fa-solid fa-image" class="mb-2 h-12 w-12 text-gray-400" />
            <p class="text-sm text-gray-500 dark:text-gray-400">Aucune image de couverture</p>
          </div>
        </div>

        <!-- Résumé -->
        <div v-if="newsItem.summary" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Résumé
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            {{ newsItem.summary }}
          </p>
        </div>

        <!-- Contenu -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Contenu
          </h2>
          <EditorJSRenderer
            v-if="editorContent"
            :data="editorContent"
          />
          <p v-else class="text-gray-500 italic dark:text-gray-400">
            Aucun contenu
          </p>
        </div>

        <!-- Vidéo -->
        <div v-if="newsItem.video_url" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Vidéo
          </h2>
          <a
            :href="newsItem.video_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
          >
            <font-awesome-icon icon="fa-solid fa-video" class="h-4 w-4" />
            {{ newsItem.video_url }}
          </a>
        </div>

        <!-- Galerie médias -->
        <div v-if="newsItem.media && newsItem.media.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Galerie ({{ newsItem.media.length }} médias)
          </h2>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div
              v-for="media in newsItem.media"
              :key="media.id"
              class="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <img
                :src="media.url"
                :alt="media.alt || 'Image'"
                class="h-32 w-full object-cover"
              />
              <p v-if="media.caption" class="p-2 text-xs text-gray-600 dark:text-gray-400">
                {{ media.caption }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Métadonnées -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Informations
          </h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                ID
              </dt>
              <dd class="mt-1 font-mono text-xs text-gray-900 dark:text-white">
                {{ newsItem.id }}
              </dd>
            </div>
            <div v-if="newsItem.author">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Auteur
              </dt>
              <dd class="mt-1 flex items-center gap-2">
                <img
                  v-if="newsItem.author.avatar"
                  :src="newsItem.author.avatar"
                  :alt="newsItem.author.name"
                  class="h-6 w-6 rounded-full"
                />
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ newsItem.author.name }}
                </span>
              </dd>
            </div>
            <div v-else-if="newsItem.author_external_id">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Auteur (ID)
              </dt>
              <dd class="mt-1 font-mono text-xs text-gray-900 dark:text-white">
                {{ newsItem.author_external_id }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Créé le
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(newsItem.created_at) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Modifié le
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(newsItem.updated_at) }}
              </dd>
            </div>
            <div v-if="newsItem.published_at">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Publié le
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(newsItem.published_at) }}
              </dd>
            </div>
            <div v-if="newsItem.visible_from">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Visible à partir de
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(newsItem.visible_from) }}
              </dd>
            </div>
            <div v-if="newsItem.cover_image_external_id">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Image de couverture (ID)
              </dt>
              <dd class="mt-1 font-mono text-xs text-gray-900 dark:text-white break-all">
                {{ newsItem.cover_image_external_id }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Tags -->
        <div v-if="newsItem.tags.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Tags
          </h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in newsItem.tags"
              :key="tag.id"
              class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Associations -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Associations
          </h2>
          <dl class="space-y-3">
            <div v-if="newsItem.campus_name || newsItem.campus_id">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Campus
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.campus_name || newsItem.campus_id }}
              </dd>
            </div>
            <div v-if="newsItem.department_name || newsItem.department_id">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Département
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.department_name || newsItem.department_id }}
              </dd>
            </div>
            <div v-if="newsItem.service_name || newsItem.service_id">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Service
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.service_name || newsItem.service_id }}
              </dd>
            </div>
            <div v-if="newsItem.project_name || newsItem.project_id">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Projet
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.project_name || newsItem.project_id }}
              </dd>
            </div>
            <div v-if="newsItem.event_name || newsItem.event_id">
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Événement
              </dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ newsItem.event_name || newsItem.event_id }}
              </dd>
            </div>
            <div v-if="!newsItem.campus_id && !newsItem.department_id && !newsItem.service_id && !newsItem.project_id && !newsItem.event_id">
              <p class="text-sm italic text-gray-500 dark:text-gray-400">
                Aucune association
              </p>
            </div>
          </dl>
        </div>

        <!-- Actions rapides -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Actions
          </h2>
          <div class="space-y-2">
            <a
              :href="`/actualites/${newsItem.slug}`"
              target="_blank"
              class="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <font-awesome-icon icon="fa-solid fa-external-link-alt" class="h-4 w-4" />
              Prévisualiser sur le site
            </a>
            <button
              :disabled="isActionLoading"
              class="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="duplicateNews"
            >
              <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
              Dupliquer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer l'actualité
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette actualité ?
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ newsItem.title }}
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="isActionLoading"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              @click="deleteNews"
            >
              <span v-if="isActionLoading">Suppression...</span>
              <span v-else>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
