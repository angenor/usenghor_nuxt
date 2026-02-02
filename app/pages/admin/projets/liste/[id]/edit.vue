<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import type { ImageVariants, ProjectCategoryRead, ProjectStatus, PublicationStatus } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getProjectById,
  updateProject,
  getAllCategories,
  toDateInput,
  slugify,
  projectStatusLabels,
  publicationStatusLabels,
} = useProjectsApi()

const { getUsersForSelect } = useUsersApi()
const { uploadMediaVariants, getMediaUrl } = useMediaApi()
const { sectors } = useReferenceData()

// Données de référence
const categories = ref<ProjectCategoryRead[]>([])
const usersForSelect = ref<Array<{ id: string; email: string; full_name: string }>>([])

// Onglet actif
const activeTab = ref<'general' | 'classification' | 'dates' | 'associations' | 'publication'>('general')

// État
const form = reactive({
  title: '',
  slug: '',
  summary: '',
  description: undefined as OutputData | undefined,
  cover_image_external_id: null as string | null,
  sector_external_id: null as string | null,
  manager_external_id: null as string | null,
  start_date: '',
  end_date: '',
  budget: null as number | null,
  currency: 'EUR',
  beneficiaries: '',
  category_ids: [] as string[],
  status: 'planned' as ProjectStatus,
  publication_status: 'draft' as PublicationStatus,
})

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)
const notFound = ref(false)

// État pour l'éditeur d'image de couverture
const showCoverEditor = ref(false)
const pendingCoverFile = ref<File | null>(null)
const isUploadingCover = ref(false)
const coverImagePreview = ref<string | null>(null)

// Chargement
const projectId = computed(() => route.params.id as string)

onMounted(async () => {
  try {
    const [categoriesData, project, users] = await Promise.all([
      getAllCategories(),
      getProjectById(projectId.value),
      getUsersForSelect(),
    ])

    usersForSelect.value = users

    categories.value = categoriesData

    // Remplir le formulaire
    form.title = project.title
    form.slug = project.slug
    form.summary = project.summary || ''
    // Parser la description JSON en OutputData pour l'éditeur
    if (project.description) {
      try {
        form.description = JSON.parse(project.description) as OutputData
      }
      catch {
        // Si ce n'est pas du JSON valide, créer un bloc paragraphe
        form.description = {
          time: Date.now(),
          blocks: [{ type: 'paragraph', data: { text: project.description } }],
          version: '2.28.2',
        }
      }
    }
    else {
      form.description = undefined
    }
    form.cover_image_external_id = project.cover_image_external_id
    // Charger l'URL de l'image existante
    if (project.cover_image_external_id) {
      coverImagePreview.value = getMediaUrl(project.cover_image_external_id)
    }
    form.sector_external_id = project.sector_external_id
    form.manager_external_id = project.manager_external_id
    form.start_date = toDateInput(project.start_date)
    form.end_date = toDateInput(project.end_date)
    form.budget = project.budget
    form.currency = project.currency
    form.beneficiaries = project.beneficiaries || ''
    form.category_ids = project.categories?.map(c => c.id) || []
    form.status = project.status
    form.publication_status = project.publication_status
  }
  catch (err: any) {
    console.error('Erreur chargement projet:', err)
    notFound.value = true
    error.value = err.message || 'Projet non trouvé'
  }
  finally {
    isLoading.value = false
  }
})

// === GESTION DES CATÉGORIES ===
const toggleCategory = (categoryId: string) => {
  const index = form.category_ids.indexOf(categoryId)
  if (index === -1) {
    form.category_ids.push(categoryId)
  }
  else {
    form.category_ids.splice(index, 1)
  }
}

// === GESTION DE L'IMAGE DE COUVERTURE ===
function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
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
    const originalName = pendingCoverFile.value?.name || 'project-cover.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')

    // Upload les 3 versions (low, medium, original)
    const response = await uploadMediaVariants(variants, baseName, { folder: 'projects/covers' })

    // Stocker l'ID de l'original
    form.cover_image_external_id = response.original.id
    // Créer un aperçu local temporaire avec la version medium
    coverImagePreview.value = URL.createObjectURL(variants.medium)
  }
  catch (err) {
    console.error('Erreur upload image de couverture:', err)
    alert('Erreur lors de l\'upload de l\'image')
  }
  finally {
    isUploadingCover.value = false
    pendingCoverFile.value = null
  }
}

function removeCoverImage() {
  form.cover_image_external_id = null
  coverImagePreview.value = null
}

// === SAUVEGARDE ===
const saveForm = async () => {
  if (!form.title.trim()) {
    alert('Veuillez saisir un titre')
    return
  }
  if (!form.slug.trim()) {
    alert('Veuillez saisir un slug')
    return
  }

  isSaving.value = true
  error.value = null

  try {
    // Sérialiser la description EditorJS en JSON
    const descriptionJson = form.description ? JSON.stringify(form.description) : null

    await updateProject(projectId.value, {
      title: form.title,
      slug: form.slug,
      summary: form.summary || null,
      description: descriptionJson,
      cover_image_external_id: form.cover_image_external_id,
      sector_external_id: form.sector_external_id,
      manager_external_id: form.manager_external_id,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      budget: form.budget,
      currency: form.currency,
      beneficiaries: form.beneficiaries || null,
      category_ids: form.category_ids.length > 0 ? form.category_ids : null,
      status: form.status,
      publication_status: form.publication_status,
    })

    router.push(`/admin/projets/liste/${projectId.value}`)
  }
  catch (err: any) {
    console.error('Erreur mise à jour:', err)
    error.value = err.message || 'Erreur lors de la mise à jour'
  }
  finally {
    isSaving.value = false
  }
}

const saveDraft = async () => {
  form.publication_status = 'draft'
  await saveForm()
}

const saveAndPublish = async () => {
  form.publication_status = 'published'
  await saveForm()
}

const goBack = () => {
  router.push(`/admin/projets/liste/${projectId.value}`)
}

// Tabs configuration
const tabs = [
  { id: 'general', label: 'Général', icon: 'fa-solid fa-info-circle' },
  { id: 'classification', label: 'Classification', icon: 'fa-solid fa-tags' },
  { id: 'dates', label: 'Dates & Budget', icon: 'fa-solid fa-calendar' },
  { id: 'associations', label: 'Associations', icon: 'fa-solid fa-link' },
  { id: 'publication', label: 'Publication', icon: 'fa-solid fa-eye' },
]
</script>

<template>
  <!-- Chargement -->
  <div v-if="isLoading" class="flex items-center justify-center py-16">
    <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-4xl text-blue-600" />
  </div>

  <!-- 404 -->
  <div v-else-if="notFound" class="flex flex-col items-center justify-center py-16">
    <font-awesome-icon :icon="['fas', 'folder-open']" class="h-16 w-16 text-gray-300 dark:text-gray-600" />
    <h1 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Projet non trouvé</h1>
    <p class="mt-2 text-gray-500 dark:text-gray-400">
      {{ error || "Le projet demandé n'existe pas ou a été supprimé." }}
    </p>
    <NuxtLink
      to="/admin/projets/liste"
      class="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
      Retour à la liste
    </NuxtLink>
  </div>

  <!-- Formulaire -->
  <div v-else class="mx-auto max-w-4xl space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Modifier le projet
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ form.title || 'Projet' }}
          </p>
        </div>
      </div>
      <div class="flex gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          Annuler
        </button>
        <button
          :disabled="isSaving"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="saveDraft"
        >
          Enregistrer brouillon
        </button>
        <button
          :disabled="isSaving"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          @click="saveAndPublish"
        >
          <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="animate-spin" />
          <font-awesome-icon v-else :icon="['fas', 'save']" />
          Publier
        </button>
      </div>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-4 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
          @click="activeTab = tab.id as typeof activeTab"
        >
          <font-awesome-icon :icon="tab.icon.split(' ')" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <!-- Onglet Général -->
      <div v-show="activeTab === 'general'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <!-- Titre -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Titre du projet"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <!-- Slug -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.slug"
              type="text"
              placeholder="slug-du-projet"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">URL: /projets/{{ form.slug || 'slug' }}</p>
          </div>

          <!-- Image de couverture -->
          <div class="sm:col-span-2">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image de couverture
            </label>
            <!-- Loading state -->
            <div
              v-if="isUploadingCover"
              class="mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
            >
              <div class="text-center">
                <font-awesome-icon :icon="['fas', 'spinner']" class="mb-2 h-8 w-8 animate-spin text-blue-500" />
                <p class="text-sm text-gray-500 dark:text-gray-400">Téléversement en cours...</p>
              </div>
            </div>
            <!-- Image preview -->
            <div
              v-else-if="coverImagePreview"
              class="relative mb-4"
            >
              <img
                :src="coverImagePreview"
                alt="Image de couverture"
                class="h-48 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                class="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white transition-colors hover:bg-red-700"
                @click="removeCoverImage"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" class="h-4 w-4" />
              </button>
            </div>
            <div class="flex items-center gap-4">
              <label
                class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :class="{ 'pointer-events-none opacity-50': isUploadingCover }"
              >
                <font-awesome-icon :icon="['fas', 'upload']" class="h-4 w-4" />
                {{ coverImagePreview ? 'Changer l\'image' : 'Télécharger une image' }}
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  :disabled="isUploadingCover"
                  @change="handleCoverImageUpload"
                />
              </label>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Format 16:9 recommandé (1200x675)
              </span>
            </div>
          </div>

          <!-- Résumé -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Résumé
            </label>
            <textarea
              v-model="form.summary"
              rows="3"
              placeholder="Brève description du projet..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Description -->
          <div class="sm:col-span-2">
            <AdminRichTextEditor
              v-model="form.description"
              label="Description détaillée"
              placeholder="Description complète du projet : contexte, objectifs, méthodologie..."
              :show-card="false"
              :min-height="250"
            />
          </div>

          <!-- Bénéficiaires -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bénéficiaires
            </label>
            <textarea
              v-model="form.beneficiaries"
              rows="2"
              placeholder="Décrivez les bénéficiaires du projet..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Onglet Classification -->
      <div v-show="activeTab === 'classification'" class="space-y-6">
        <!-- Catégories -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Catégories
          </label>
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label
              v-for="category in categories"
              :key="category.id"
              class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
              :class="form.category_ids.includes(category.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'"
            >
              <input
                type="checkbox"
                :checked="form.category_ids.includes(category.id)"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                @change="toggleCategory(category.id)"
              />
              <font-awesome-icon v-if="category.icon" :icon="['fas', category.icon.replace('fa-', '')]" class="text-gray-500" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ category.name }}</span>
            </label>
          </div>
        </div>

        <!-- Département -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Département porteur
          </label>
          <select
            v-model="form.sector_external_id"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option :value="null">Sélectionnez un secteur</option>
            <option v-for="sec in sectors" :key="sec.id" :value="sec.id">
              {{ sec.name }}
            </option>
          </select>
        </div>

        <!-- Responsable du projet -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Responsable du projet
          </label>
          <select
            v-model="form.manager_external_id"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option :value="null">Sélectionnez un responsable</option>
            <option v-for="user in usersForSelect" :key="user.id" :value="user.id">
              {{ user.full_name }} ({{ user.email }})
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500">
            La personne en charge de la coordination du projet
          </p>
        </div>
      </div>

      <!-- Onglet Dates & Budget -->
      <div v-show="activeTab === 'dates'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <!-- Date de début -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de début
            </label>
            <input
              v-model="form.start_date"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Date de fin -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de fin prévue
            </label>
            <input
              v-model="form.end_date"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Budget -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget
            </label>
            <input
              v-model.number="form.budget"
              type="number"
              min="0"
              step="1000"
              placeholder="500000"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Devise -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Devise
            </label>
            <select
              v-model="form.currency"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dollar US</option>
              <option value="XOF">XOF - Franc CFA</option>
              <option value="EGP">EGP - Livre égyptienne</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Onglet Associations -->
      <div v-show="activeTab === 'associations'" class="space-y-6">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Gérez les partenaires et les albums associés à ce projet.
        </p>

        <!-- Partenaires -->
        <AdminProjetsProjectPartnersSection :project-id="projectId" />

        <!-- Albums / Médiathèque -->
        <AdminProjetsProjectMediaSection :project-id="projectId" />
      </div>

      <!-- Onglet Publication -->
      <div v-show="activeTab === 'publication'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <!-- Statut du projet -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut du projet
            </label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="(label, key) in projectStatusLabels" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- Statut de publication -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut de publication
            </label>
            <select
              v-model="form.publication_status"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="(label, key) in publicationStatusLabels" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="sticky bottom-0 -mx-4 -mb-4 border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900 sm:-mx-6 sm:px-6">
      <div class="flex justify-end gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          Annuler
        </button>
        <button
          :disabled="isSaving"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="saveDraft"
        >
          Enregistrer brouillon
        </button>
        <button
          :disabled="isSaving"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          @click="saveAndPublish"
        >
          <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="animate-spin" />
          <font-awesome-icon v-else :icon="['fas', 'save']" />
          Publier
        </button>
      </div>
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
              :aspect-ratio="16 / 9"
              @save="saveEditedCover"
              @cancel="cancelCoverEditor"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
