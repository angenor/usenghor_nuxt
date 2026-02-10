<script setup lang="ts">
import type { NewsStatus, NewsHighlightStatus, NewsDisplay, TagRead } from '~/types/news'
import type { OutputData } from '@editorjs/editorjs'
import type { ImageVariants } from '~/types/api'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const {
  getNewsById,
  updateNews: apiUpdateNews,
  getAllTags,
  createTag: apiCreateTag,
  newsStatusLabels,
  highlightStatusLabels,
  slugify,
} = useAdminNewsApi()

const { uploadMedia, uploadMediaVariants, getMediaUrl } = useMediaApi()

// Données de référence depuis le backend
const {
  getCampuses,
  getDepartments,
  getServices,
  getUsers,
  getProjects,
  getEvents,
  getCalls,
  getPrograms,
  campuses: allCampuses,
  departments: allDepartments,
  services: allServices,
  users: allAuthors,
  projects: allProjects,
  events: allEvents,
  calls: allCalls,
  programs: allPrograms,
} = useReferenceData()

// === STATE ===
const isLoading = ref(true)
const isSubmitting = ref(false)
const showTagModal = ref(false)
const newTagName = ref('')
const error = ref<string | null>(null)

// Get news item
const newsId = computed(() => route.params.id as string)
const originalNews = ref<NewsDisplay | null>(null)

// Contenu EditorJS (séparé du formulaire pour éviter les problèmes de réactivité)
const content = ref<OutputData | undefined>(undefined)
const contentEn = ref<OutputData | undefined>(undefined)
const contentAr = ref<OutputData | undefined>(undefined)
const contentChanged = ref(false)
const formInitialized = ref(false)

// Handler pour les changements de contenu
const onContentChange = () => {
  contentChanged.value = true
}

// Form data
const form = reactive({
  title: '',
  slug: '',
  summary: '',
  video_url: '',
  cover_image: '',
  cover_image_alt: '',
  cover_image_external_id: null as string | null,
  author_id: '',
  tags: [] as string[],
  campus_id: '',
  sector_id: '',
  service_id: '',
  event_id: '',
  project_id: '',
  call_id: '',
  program_id: '',
  status: 'draft' as NewsStatus,
  highlight_status: 'standard' as NewsHighlightStatus,
  published_at: '',
  visible_from: ''
})

// Tags from API
const allTags = ref<TagRead[]>([])

// Load data on mount
onMounted(async () => {
  isLoading.value = true
  try {
    // Charger les infos utilisateur si pas encore disponibles
    if (!authStore.user && authStore.token) {
      await authStore.fetchCurrentUser()
    }

    // Charger en parallèle l'actualité, les tags et les données de référence
    const [newsData, tagsData] = await Promise.all([
      getNewsById(newsId.value),
      getAllTags(),
      getCampuses(),
      getDepartments(),
      getServices(),
      getUsers(),
      getProjects(),
      getEvents(),
      getCalls(),
      getPrograms(),
    ])

    originalNews.value = newsData
    allTags.value = tagsData

    // Initialiser le formulaire
    if (newsData) {
      form.title = newsData.title || ''
      form.slug = newsData.slug || ''
      form.summary = newsData.summary || ''
      form.video_url = newsData.video_url || ''
      form.cover_image_external_id = newsData.cover_image_external_id || null
      // Utiliser getMediaUrl pour construire l'URL depuis l'ID (évite les URLs mock picsum)
      form.cover_image = newsData.cover_image_external_id
        ? (getMediaUrl(newsData.cover_image_external_id) || '')
        : (newsData.cover_image || '')
      form.cover_image_alt = newsData.cover_image_alt || ''
      // Utiliser l'auteur existant ou l'utilisateur connecté par défaut
      form.author_id = newsData.author_external_id || authStore.user?.id || ''
      form.tags = newsData.tags?.map(t => t.id) || []
      form.campus_id = newsData.campus_id || ''
      form.sector_id = newsData.sector_id || ''
      form.service_id = newsData.service_id || ''
      form.event_id = newsData.event_id || ''
      form.project_id = newsData.project_id || ''
      form.call_id = newsData.call_external_id || ''
      form.program_id = newsData.program_id || ''
      form.status = newsData.status || 'draft'
      form.highlight_status = newsData.highlight_status || 'standard'
      form.published_at = newsData.published_at ? newsData.published_at.slice(0, 16) : ''
      form.visible_from = newsData.visible_from ? newsData.visible_from.slice(0, 16) : ''

      // Charger le contenu EditorJS
      content.value = newsData.content as OutputData | undefined
      contentEn.value = newsData.content_en as OutputData | undefined
      contentAr.value = newsData.content_ar as OutputData | undefined

      formInitialized.value = true
    }
  }
  catch (e: unknown) {
    const fetchError = e as { status?: number; data?: { detail?: string } }
    if (fetchError.status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Actualité non trouvée'
      })
    }
    error.value = fetchError.data?.detail || 'Erreur lors du chargement'
    console.error('Error:', e)
  }
  finally {
    isLoading.value = false
  }
})

// Auto-generate slug from title (only after form is initialized)
watch(() => form.title, (newTitle) => {
  // Ne pas auto-générer pendant le chargement initial
  if (!formInitialized.value) return
  // Auto-générer uniquement si le slug correspond au titre précédent slugifié
  if (!form.slug || form.slug === slugify(form.title.slice(0, -1))) {
    form.slug = slugify(newTitle)
  }
})

// Filtered services based on department
const filteredServices = computed(() => {
  if (!form.sector_id) return []
  return allServices.value.filter(s => s.sector_id === form.sector_id)
})

// Selected tags objects
const selectedTags = computed(() => {
  return allTags.value.filter(t => form.tags.includes(t.id))
})

// Validation - vérifie que le contenu EditorJS a au moins un bloc
const hasContent = computed(() => {
  return content.value?.blocks && content.value.blocks.length > 0
})

const isValid = computed(() => {
  return form.title.trim() !== '' &&
    form.slug.trim() !== '' &&
    hasContent.value
})

// Check if form has changes
const hasChanges = computed(() => {
  if (!originalNews.value) return false

  return form.title !== originalNews.value.title ||
    form.slug !== originalNews.value.slug ||
    form.summary !== (originalNews.value.summary || '') ||
    contentChanged.value ||
    form.video_url !== (originalNews.value.video_url || '') ||
    form.cover_image !== (originalNews.value.cover_image || '') ||
    form.status !== originalNews.value.status ||
    form.highlight_status !== originalNews.value.highlight_status
})

// === METHODS ===
function toggleTag(tagId: string) {
  const index = form.tags.indexOf(tagId)
  if (index === -1) {
    form.tags.push(tagId)
  }
  else {
    form.tags.splice(index, 1)
  }
}

function removeTag(tagId: string) {
  const index = form.tags.indexOf(tagId)
  if (index !== -1) {
    form.tags.splice(index, 1)
  }
}

// État pour l'éditeur d'image de couverture
const showCoverEditor = ref(false)
const pendingCoverFile = ref<File | null>(null)
const isUploadingCover = ref(false)

function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    // Stocker le fichier et ouvrir l'éditeur
    pendingCoverFile.value = input.files[0]
    showCoverEditor.value = true
    input.value = ''
  }
}

function cancelCoverEditor() {
  showCoverEditor.value = false
  pendingCoverFile.value = null
}

async function saveEditedCover(variants: ImageVariants) {
  showCoverEditor.value = false
  isUploadingCover.value = true

  try {
    // Extraire le nom de base du fichier original
    const originalName = pendingCoverFile.value?.name || 'cover.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')

    // Upload les 3 versions (low, medium, original)
    const response = await uploadMediaVariants(variants, baseName, { folder: 'news/covers' })

    // Stocker l'ID de l'original (les autres URLs sont déduites par convention)
    form.cover_image_external_id = response.original.id
    // Créer un aperçu local temporaire avec la version medium
    form.cover_image = URL.createObjectURL(variants.medium)
  }
  catch (err) {
    console.error('Erreur upload image de couverture:', err)
  }
  finally {
    isUploadingCover.value = false
    pendingCoverFile.value = null
  }
}

function removeCoverImage() {
  form.cover_image = ''
  form.cover_image_alt = ''
  form.cover_image_external_id = null
}

// Valide si une chaîne est un UUID valide (les mock IDs comme 'author-2' ne passent pas)
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Retourne la valeur si c'est un UUID valide, sinon null
function toUUIDOrNull(value: string | null | undefined): string | null {
  if (!value) return null
  return isValidUUID(value) ? value : null
}

async function submitForm() {
  if (!isValid.value || isSubmitting.value) return

  isSubmitting.value = true
  error.value = null

  try {
    // Définir automatiquement published_at lors du premier passage en published
    // Conserver la date existante si déjà publiée, sinon définir maintenant
    let publishedAt: string | null = form.published_at || null
    if (form.status === 'published' && !publishedAt) {
      publishedAt = new Date().toISOString()
    }

    await apiUpdateNews(newsId.value, {
      title: form.title,
      slug: form.slug,
      summary: form.summary || null,
      content: content.value || null,
      content_en: contentEn.value || null,
      content_ar: contentAr.value || null,
      video_url: form.video_url || null,
      highlight_status: form.highlight_status,
      // Filtrer les IDs mock - seuls les vrais UUIDs sont envoyés
      cover_image_external_id: toUUIDOrNull(form.cover_image_external_id),
      campus_external_id: toUUIDOrNull(form.campus_id),
      sector_external_id: toUUIDOrNull(form.sector_id),
      service_external_id: toUUIDOrNull(form.service_id),
      event_external_id: toUUIDOrNull(form.event_id),
      project_external_id: toUUIDOrNull(form.project_id),
      call_external_id: toUUIDOrNull(form.call_id),
      program_external_id: toUUIDOrNull(form.program_id),
      author_external_id: toUUIDOrNull(form.author_id),
      status: form.status,
      published_at: publishedAt,
      visible_from: form.visible_from || null,
      tag_ids: form.tags,
    })

    contentChanged.value = false
    router.push(`/admin/contenus/actualites/${newsId.value}`)
  }
  catch (e: unknown) {
    const fetchError = e as { data?: { detail?: string } }
    error.value = fetchError.data?.detail || 'Erreur lors de la mise à jour'
    console.error('Error updating news:', e)
  }
  finally {
    isSubmitting.value = false
  }
}

function cancel() {
  router.push(`/admin/contenus/actualites/${newsId.value}`)
}

async function createTag() {
  if (!newTagName.value.trim()) return

  try {
    const result = await apiCreateTag({
      name: newTagName.value.trim(),
      slug: slugify(newTagName.value.trim()),
    })

    // Recharger les tags et sélectionner le nouveau
    allTags.value = await getAllTags()
    form.tags.push(result.id)
    newTagName.value = ''
    showTagModal.value = false
  }
  catch (e) {
    console.error('Error creating tag:', e)
  }
}
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
  <div v-else-if="error && !originalNews" class="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
    <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mb-4 h-12 w-12 text-red-500" />
    <h2 class="mb-2 text-lg font-semibold text-red-800 dark:text-red-400">Erreur</h2>
    <p class="text-red-600 dark:text-red-300">{{ error }}</p>
  </div>

  <!-- Content -->
  <div v-else-if="originalNews" class="mx-auto max-w-4xl space-y-6">
    <!-- Error message -->
    <div
      v-if="error"
      class="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    >
      <div class="flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-5 w-5" />
        <span>{{ error }}</span>
      </div>
    </div>
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button
        class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        @click="cancel"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-5 w-5" />
      </button>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Modifier l'actualité
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ originalNews.title }}
        </p>
      </div>
      <span
        v-if="hasChanges"
        class="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      >
        Modifications non enregistrées
      </span>
    </div>

    <form class="space-y-6" @submit.prevent="submitForm">
      <!-- Informations principales -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Informations principales
        </h2>

        <div class="space-y-4">
          <!-- Titre -->
          <div>
            <label for="title" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre <span class="text-red-500">*</span>
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Titre de l'actualité"
            />
          </div>

          <!-- Slug -->
          <div>
            <label for="slug" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">/actualites/</span>
              <input
                id="slug"
                v-model="form.slug"
                type="text"
                required
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="titre-de-lactualite"
              />
            </div>
          </div>

          <!-- Résumé -->
          <div>
            <label for="summary" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résumé
            </label>
            <textarea
              id="summary"
              v-model="form.summary"
              rows="2"
              maxlength="300"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Résumé court de l'actualité (200-300 caractères)"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ form.summary.length }}/300 caractères
            </p>
          </div>

          <!-- URL Vidéo -->
          <div>
            <label for="video_url" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL Vidéo (YouTube, Vimeo)
            </label>
            <input
              id="video_url"
              v-model="form.video_url"
              type="url"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>

      <!-- Contenu détaillé -->
      <AdminRichTextEditor
        v-model="content"
        v-model:model-value-en="contentEn"
        v-model:model-value-ar="contentAr"
        title="Contenu de l'actualité"
        description="Rédigez le contenu complet de l'actualité avec l'éditeur riche (titres, listes, images, citations, etc.)"
        icon="fa-solid fa-file-lines"
        icon-color="text-indigo-500"
        placeholder="Commencez à rédiger le contenu de l'actualité..."
        placeholder-en="Start writing the news content..."
        placeholder-ar="ابدأ في كتابة محتوى الخبر..."
        :min-height="400"
        required
        @change="onContentChange"
      />

      <!-- Médias -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Médias
        </h2>

        <div class="space-y-4">
          <!-- Image de couverture -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image de couverture
            </label>
            <!-- Loading state -->
            <div
              v-if="isUploadingCover"
              class="mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
            >
              <div class="text-center">
                <font-awesome-icon icon="fa-solid fa-spinner" class="mb-2 h-8 w-8 animate-spin text-blue-500" />
                <p class="text-sm text-gray-500 dark:text-gray-400">Téléversement en cours...</p>
              </div>
            </div>
            <!-- Image preview -->
            <div
              v-else-if="form.cover_image"
              class="relative mb-4"
            >
              <img
                :src="form.cover_image"
                :alt="form.cover_image_alt || 'Image de couverture'"
                class="h-48 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                class="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white transition-colors hover:bg-red-700"
                @click="removeCoverImage"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
              </button>
            </div>
            <div class="flex items-center gap-4">
              <label
                class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :class="{ 'pointer-events-none opacity-50': isUploadingCover }"
              >
                <font-awesome-icon icon="fa-solid fa-upload" class="h-4 w-4" />
                Télécharger une image
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  :disabled="isUploadingCover"
                  @change="handleCoverImageUpload"
                />
              </label>
            </div>
          </div>

          <!-- Alt text -->
          <div v-if="form.cover_image">
            <label for="cover_image_alt" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Texte alternatif
            </label>
            <input
              id="cover_image_alt"
              v-model="form.cover_image_alt"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Description de l'image pour l'accessibilité"
            />
          </div>
        </div>
      </div>

      <!-- Associations -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Associations
        </h2>

        <div class="grid gap-4 md:grid-cols-2">
          <!-- Auteur -->
          <div>
            <label for="author_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Auteur <span class="text-red-500">*</span>
            </label>
            <select
              id="author_id"
              v-model="form.author_id"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner un auteur</option>
              <option v-for="author in allAuthors" :key="author.id" :value="author.id">
                {{ author.full_name }}
              </option>
            </select>
          </div>

          <!-- Campus -->
          <div>
            <label for="campus_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Campus associé
            </label>
            <select
              id="campus_id"
              v-model="form.campus_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="campus in allCampuses" :key="campus.id" :value="campus.id">
                {{ campus.name }}
              </option>
            </select>
          </div>

          <!-- Département -->
          <div>
            <label for="sector_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Département associé
            </label>
            <select
              id="sector_id"
              v-model="form.sector_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <!-- Service -->
          <div>
            <label for="service_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service associé
            </label>
            <select
              id="service_id"
              v-model="form.service_id"
              :disabled="!form.sector_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="service in filteredServices" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
            </select>
          </div>

          <!-- Projet -->
          <div>
            <label for="project_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Projet lié
            </label>
            <select
              id="project_id"
              v-model="form.project_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="project in allProjects" :key="project.id" :value="project.id">
                {{ project.title }}
              </option>
            </select>
          </div>

          <!-- Appel lié -->
          <div>
            <label for="call_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Appel lié
            </label>
            <select
              id="call_id"
              v-model="form.call_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="call in allCalls" :key="call.id" :value="call.id">
                {{ call.title }}
              </option>
            </select>
          </div>

          <!-- Programme lié -->
          <div>
            <label for="program_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Programme lié
            </label>
            <select
              id="program_id"
              v-model="form.program_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="program in allPrograms" :key="program.id" :value="program.id">
                {{ program.title }}
              </option>
            </select>
          </div>

          <!-- Événement -->
          <div>
            <label for="event_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Événement lié
            </label>
            <select
              id="event_id"
              v-model="form.event_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="event in allEvents" :key="event.id" :value="event.id">
                {{ event.title }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tags -->
        <div class="mt-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </label>

          <!-- Tags sélectionnés -->
          <div v-if="selectedTags.length > 0" class="mb-3 flex flex-wrap gap-2">
            <span
              v-for="tag in selectedTags"
              :key="tag.id"
              class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {{ tag.name }}
              <button
                type="button"
                class="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                @click="removeTag(tag.id)"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" class="h-3 w-3" />
              </button>
            </span>
          </div>

          <!-- Liste des tags disponibles -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in allTags"
              :key="tag.id"
              type="button"
              class="rounded-full border px-3 py-1 text-sm transition-colors"
              :class="form.tags.includes(tag.id)
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500'"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-600 dark:border-gray-600 dark:text-gray-400"
              @click="showTagModal = true"
            >
              <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
              Nouveau tag
            </button>
          </div>
        </div>
      </div>

      <!-- Publication -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Publication
        </h2>

        <div class="grid gap-4 md:grid-cols-2">
          <!-- Statut -->
          <div>
            <label for="status" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut de publication
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="(label, value) in newsStatusLabels" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- Highlight status -->
          <div>
            <label for="highlight_status" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mise en avant
            </label>
            <select
              id="highlight_status"
              v-model="form.highlight_status"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="(label, value) in highlightStatusLabels" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- Visible à partir de -->
          <div>
            <label for="visible_from" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Visible à partir de
            </label>
            <input
              id="visible_from"
              v-model="form.visible_from"
              type="datetime-local"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-4">
        <button
          type="button"
          class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="cancel"
        >
          Annuler
        </button>
        <button
          type="submit"
          :disabled="!isValid || isSubmitting"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-check" class="h-4 w-4" />
          Enregistrer
        </button>
      </div>
    </form>

    <!-- Modal Nouveau Tag -->
    <Teleport to="body">
      <div
        v-if="showTagModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showTagModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Créer un nouveau tag
          </h3>

          <div class="mb-4">
            <label for="new_tag_name" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom du tag
            </label>
            <input
              id="new_tag_name"
              v-model="newTagName"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Nom du tag"
              @keyup.enter="createTag"
            />
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showTagModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="!newTagName.trim()"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              @click="createTag"
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- 404 - Actualité non trouvée -->
  <div v-else class="flex flex-col items-center justify-center py-16">
    <font-awesome-icon icon="fa-solid fa-newspaper" class="h-16 w-16 text-gray-300 dark:text-gray-600" />
    <h1 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Actualité non trouvée</h1>
    <p class="mt-2 text-gray-500 dark:text-gray-400">
      L'actualité demandée n'existe pas ou a été supprimée.
    </p>
    <NuxtLink
      to="/admin/contenus/actualites"
      class="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-4 w-4" />
      Retour à la liste
    </NuxtLink>
  </div>

  <!-- Image Editor Modal for Cover Image -->
  <Teleport to="body">
    <div
      v-if="showCoverEditor && pendingCoverFile"
      class="fixed inset-0 z-50 overflow-y-auto"
    >
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/70 transition-opacity" />
        <div class="relative w-full max-w-4xl transform transition-all">
          <MediaImageEditor
            :image-file="pendingCoverFile"
            :aspect-ratio="16/9"
            @save="saveEditedCover"
            @cancel="cancelCoverEditor"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
