<script setup lang="ts">
import type { NewsStatus, NewsHighlightStatus, TagRead } from '~/types/news'
import type { OutputData } from '@editorjs/editorjs'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const authStore = useAuthStore()

const {
  createNews: apiCreateNews,
  getAllTags,
  createTag: apiCreateTag,
  newsStatusLabels,
  highlightStatusLabels,
  slugify,
} = useAdminNewsApi()

// Données de référence depuis le backend
const {
  getCampuses,
  getDepartments,
  getServices,
  getUsers,
  getProjects,
  getEvents,
  campuses: allCampuses,
  departments: allDepartments,
  services: allServices,
  users: allAuthors,
  projects: allProjects,
  events: allEvents,
} = useReferenceData()

// === STATE ===
const isSubmitting = ref(false)
const isLoadingTags = ref(false)
const showTagModal = ref(false)
const newTagName = ref('')
const error = ref<string | null>(null)

// Contenu EditorJS (séparé du formulaire pour éviter les problèmes de réactivité)
const content = ref<OutputData | undefined>(undefined)
const contentEn = ref<OutputData | undefined>(undefined)
const contentAr = ref<OutputData | undefined>(undefined)

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
  status: 'draft' as NewsStatus,
  highlight_status: 'standard' as NewsHighlightStatus,
  published_at: '',
  visible_from: ''
})

// Tags from API
const allTags = ref<TagRead[]>([])

// Load data on mount + set default author
onMounted(async () => {
  isLoadingTags.value = true
  try {
    // Charger en parallèle les tags et les données de référence
    const [tagsData] = await Promise.all([
      getAllTags(),
      getCampuses(),
      getDepartments(),
      getServices(),
      getUsers(),
      getProjects(),
      getEvents(),
    ])

    allTags.value = tagsData

    // Récupérer les infos de l'utilisateur si pas encore chargées
    if (!authStore.user && authStore.token) {
      await authStore.fetchCurrentUser()
    }

    // Définir l'auteur par défaut = utilisateur connecté
    if (authStore.user?.id) {
      form.author_id = authStore.user.id
    }
  }
  catch (e) {
    console.error('Erreur lors du chargement:', e)
  }
  finally {
    isLoadingTags.value = false
  }
})

// Auto-generate slug from title
watch(() => form.title, (newTitle) => {
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

function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    // Créer un aperçu local de l'image
    form.cover_image = URL.createObjectURL(input.files[0])
    // Générer un nouvel UUID pour cette image
    // NOTE: Dans un système complet, cet UUID serait généré par le serveur lors de l'upload
    form.cover_image_external_id = crypto.randomUUID()
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
    await apiCreateNews({
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
      author_external_id: toUUIDOrNull(form.author_id),
      status: form.status,
      published_at: form.published_at || null,
      visible_from: form.visible_from || null,
      tag_ids: form.tags,
    })

    router.push('/admin/contenus/actualites')
  }
  catch (e: unknown) {
    const fetchError = e as { data?: { detail?: string } }
    error.value = fetchError.data?.detail || 'Erreur lors de la création de l\'actualité'
    console.error('Error creating news:', e)
  }
  finally {
    isSubmitting.value = false
  }
}

function cancel() {
  router.push('/admin/contenus/actualites')
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
  <div class="mx-auto max-w-4xl space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button
        class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        @click="cancel"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-5 w-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Nouvelle actualité
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Créez une nouvelle actualité pour le site
        </p>
      </div>
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
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL de l'actualité (auto-généré depuis le titre)
            </p>
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
            <div
              v-if="form.cover_image"
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
              >
                <font-awesome-icon icon="fa-solid fa-upload" class="h-4 w-4" />
                Télécharger une image
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleCoverImageUpload"
                />
              </label>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                ou sélectionner depuis la médiathèque
              </span>
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
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Limite : 1 seule "À la une", 3-5 "Mises en avant"
            </p>
          </div>

          <!-- Date de publication -->
          <div>
            <label for="published_at" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de publication
            </label>
            <input
              id="published_at"
              v-model="form.published_at"
              type="datetime-local"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Laisser vide pour publier immédiatement
            </p>
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
          Créer l'actualité
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
</template>
