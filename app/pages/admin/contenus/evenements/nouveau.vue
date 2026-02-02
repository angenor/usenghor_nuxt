<script setup lang="ts">
import type { EventCreatePayload, EventType, PublicationStatus, ImageVariants } from '~/types/api'
import type { OutputData } from '@editorjs/editorjs'

const { uploadMediaVariants } = useMediaApi()

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  createEvent,
  slugifyEvent,
  eventTypeLabels,
} = useEventsApi()

const {
  departments,
  getAllProjects,
} = useMockData()

const {
  getCampuses,
  campuses: allCampuses,
} = useReferenceData()

// Onglet actif
const activeTab = ref<'general' | 'datetime' | 'location' | 'registration' | 'associations' | 'options'>('general')

// Contenu EditorJS (séparé du formulaire pour éviter les problèmes de réactivité)
const content = ref<OutputData | undefined>(undefined)
const contentEn = ref<OutputData | undefined>(undefined)
const contentAr = ref<OutputData | undefined>(undefined)

// État pour l'éditeur d'image de couverture
const showCoverEditor = ref(false)
const pendingCoverFile = ref<File | null>(null)
const isUploadingCover = ref(false)
const coverImagePreview = ref('')

// État du formulaire - aligné sur le schéma backend
const form = ref({
  title: '',
  slug: '',
  type: 'conference' as EventType,
  type_other: '',
  description: '',
  cover_image_external_id: '' as string | null,
  start_date: '',
  end_date: '',
  is_online: false,
  video_conference_link: '',
  venue: '',
  address: '',
  city: '',
  country_external_id: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  registration_required: false,
  registration_link: '',
  max_attendees: undefined as number | undefined,
  campus_external_id: '',
  sector_external_id: '',
  project_external_id: '',
  organizer_external_id: '',
  album_external_id: '',
  status: 'draft' as PublicationStatus
})

// Erreur
const error = ref<string | null>(null)

// Auto-génération du slug
watch(() => form.value.title, (newTitle) => {
  if (newTitle) {
    form.value.slug = slugifyEvent(newTitle)
  }
})

// Navigation
const goBack = () => {
  router.push('/admin/contenus/evenements')
}

// === GESTION IMAGE DE COUVERTURE ===
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
    const originalName = pendingCoverFile.value?.name || 'cover.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')

    const response = await uploadMediaVariants(variants, baseName, { folder: 'events/covers' })

    form.value.cover_image_external_id = response.original.id
    coverImagePreview.value = URL.createObjectURL(variants.medium)
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
  coverImagePreview.value = ''
  form.value.cover_image_external_id = null
}

// Charger les données de référence au montage
onMounted(async () => {
  await getCampuses()
})

// === LISTES DE RÉFÉRENCE ===
const departmentList = computed(() =>
  departments.value.map(d => ({ id: d.id, name: d.name_fr }))
)

const projectList = computed(() =>
  getAllProjects().map(p => ({ id: p.id, name: p.title_fr }))
)

// === SAUVEGARDE ===
const isSaving = ref(false)

// Vérifie si une chaîne est un UUID valide
const isValidUuid = (value: string | null | undefined): boolean => {
  if (!value) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

// Retourne la valeur si c'est un UUID valide, sinon null
const toUuidOrNull = (value: string | null | undefined): string | null => {
  return isValidUuid(value) ? value! : null
}

const saveForm = async () => {
  isSaving.value = true
  error.value = null

  try {
    // Préparer les données pour l'API
    // Note: Les champs *_external_id doivent être des UUIDs valides ou null
    const eventData: EventCreatePayload = {
      title: form.value.title,
      slug: form.value.slug,
      description: form.value.description || null,
      content: content.value ? JSON.stringify(content.value) : null,
      type: form.value.type,
      type_other: form.value.type === 'other' ? form.value.type_other : null,
      start_date: form.value.start_date ? new Date(form.value.start_date).toISOString() : '',
      end_date: form.value.end_date ? new Date(form.value.end_date).toISOString() : null,
      is_online: form.value.is_online,
      video_conference_link: form.value.video_conference_link || null,
      venue: form.value.venue || null,
      address: form.value.address || null,
      city: form.value.city || null,
      latitude: form.value.latitude ?? null,
      longitude: form.value.longitude ?? null,
      registration_required: form.value.registration_required,
      registration_link: form.value.registration_link || null,
      max_attendees: form.value.max_attendees ?? null,
      // Les champs external_id doivent être des UUIDs valides ou null
      cover_image_external_id: toUuidOrNull(form.value.cover_image_external_id),
      country_external_id: toUuidOrNull(form.value.country_external_id),
      campus_external_id: toUuidOrNull(form.value.campus_external_id),
      sector_external_id: toUuidOrNull(form.value.sector_external_id),
      project_external_id: toUuidOrNull(form.value.project_external_id),
      organizer_external_id: toUuidOrNull(form.value.organizer_external_id),
      album_external_id: toUuidOrNull(form.value.album_external_id),
      status: form.value.status,
    }

    await createEvent(eventData)
    router.push('/admin/contenus/evenements')
  } catch (e) {
    console.error('Error creating event:', e)
    error.value = 'Erreur lors de la création de l\'événement'
  } finally {
    isSaving.value = false
  }
}

const saveDraft = async () => {
  form.value.status = 'draft'
  await saveForm()
}

const saveAndPublish = async () => {
  form.value.status = 'published'
  await saveForm()
}

// Onglets
const tabs = [
  { id: 'general', label: 'Informations', icon: 'fa-solid fa-info-circle' },
  { id: 'datetime', label: 'Dates', icon: 'fa-solid fa-calendar' },
  { id: 'location', label: 'Lieu', icon: 'fa-solid fa-map-marker-alt' },
  { id: 'registration', label: 'Inscriptions', icon: 'fa-solid fa-user-plus' },
  { id: 'associations', label: 'Associations', icon: 'fa-solid fa-link' },
  { id: 'options', label: 'Options', icon: 'fa-solid fa-cog' }
] as const
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <button
          class="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-4 w-4" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Nouvel événement
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créez une nouvelle conférence, atelier, cérémonie ou autre événement
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="isSaving"
          @click="saveDraft"
        >
          <font-awesome-icon icon="fa-solid fa-save" class="h-4 w-4" />
          Enregistrer
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          :disabled="isSaving"
          @click="saveAndPublish"
        >
          <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-globe" class="h-4 w-4" />
          Publier
        </button>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div
      v-if="error"
      class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
    >
      <div class="flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-4 w-4" />
        {{ error }}
      </div>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="admin-scrollbar -mb-px flex gap-4 overflow-x-auto" data-lenis-prevent>
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors"
          :class="activeTab === tab.id
            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
          @click="activeTab = tab.id"
        >
          <font-awesome-icon :icon="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <!-- Onglet: Informations générales -->
      <div v-show="activeTab === 'general'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre *
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="Ex: Conférence sur le développement durable"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug *
            </label>
            <input
              v-model="form.slug"
              type="text"
              required
              placeholder="conference-developpement-durable-2026"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">Auto-généré depuis le titre</p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type *
            </label>
            <select
              v-model="form.type"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="conference">Conférence</option>
              <option value="workshop">Atelier</option>
              <option value="ceremony">Cérémonie</option>
              <option value="seminar">Séminaire</option>
              <option value="symposium">Colloque</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div v-if="form.type === 'other'">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type personnalisé
            </label>
            <input
              v-model="form.type_other"
              type="text"
              placeholder="Ex: Forum, Hackathon..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description courte
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Brève description de l'événement..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
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
                <font-awesome-icon icon="fa-solid fa-spinner" class="mb-2 h-8 w-8 animate-spin text-blue-500" />
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
                <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
              </button>
            </div>
            <!-- Upload button -->
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
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Cette image sera affichée sur la page de l'événement
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglet: Dates -->
      <div v-show="activeTab === 'datetime'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date et heure de début *
            </label>
            <input
              v-model="form.start_date"
              type="datetime-local"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date et heure de fin
            </label>
            <input
              v-model="form.end_date"
              type="datetime-local"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Onglet: Lieu -->
      <div v-show="activeTab === 'location'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="flex items-center gap-3">
              <input
                v-model="form.is_online"
                type="checkbox"
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span class="font-medium text-gray-700 dark:text-gray-300">Événement en ligne</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">L'événement se déroule en visioconférence</p>
              </div>
            </label>
          </div>

          <div v-if="form.is_online" class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lien de visioconférence
            </label>
            <input
              v-model="form.video_conference_link"
              type="url"
              placeholder="https://zoom.us/j/... ou https://meet.google.com/..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lieu / Salle
            </label>
            <input
              v-model="form.venue"
              type="text"
              placeholder="Ex: Amphithéâtre Léopold Sédar Senghor"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse
            </label>
            <input
              v-model="form.address"
              type="text"
              placeholder="Ex: 1 Place Ahmed Orabi"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ville
            </label>
            <input
              v-model="form.city"
              type="text"
              placeholder="Ex: Alexandrie"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pays (ID)
            </label>
            <input
              v-model="form.country_external_id"
              type="text"
              placeholder="ID du pays"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Latitude
            </label>
            <input
              v-model.number="form.latitude"
              type="number"
              step="0.0001"
              placeholder="Ex: 31.2001"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Longitude
            </label>
            <input
              v-model.number="form.longitude"
              type="number"
              step="0.0001"
              placeholder="Ex: 29.9187"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Onglet: Inscriptions -->
      <div v-show="activeTab === 'registration'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="flex items-center gap-3">
              <input
                v-model="form.registration_required"
                type="checkbox"
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span class="font-medium text-gray-700 dark:text-gray-300">Inscription requise</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">Les participants doivent s'inscrire pour participer</p>
              </div>
            </label>
          </div>

          <div v-if="form.registration_required">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre maximum de participants
            </label>
            <input
              v-model.number="form.max_attendees"
              type="number"
              min="1"
              placeholder="Ex: 200"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div v-if="form.registration_required">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lien d'inscription externe
            </label>
            <input
              v-model="form.registration_link"
              type="url"
              placeholder="https://... (laisser vide pour inscription interne)"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">Laisser vide pour utiliser le système d'inscription interne</p>
          </div>
        </div>
      </div>

      <!-- Onglet: Associations -->
      <div v-show="activeTab === 'associations'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Campus
            </label>
            <select
              v-model="form.campus_external_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun campus</option>
              <option v-for="campus in allCampuses" :key="campus.id" :value="campus.id">
                {{ campus.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Département
            </label>
            <select
              v-model="form.sector_external_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun département</option>
              <option v-for="dept in departmentList" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Projet lié
            </label>
            <select
              v-model="form.project_external_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun projet</option>
              <option v-for="project in projectList" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Organisateur (ID)
            </label>
            <input
              v-model="form.organizer_external_id"
              type="text"
              placeholder="ID de l'organisateur"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">En production: sélecteur d'utilisateur</p>
          </div>
        </div>
      </div>

      <!-- Onglet: Options -->
      <div v-show="activeTab === 'options'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut de publication
            </label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Album photos (ID)
            </label>
            <input
              v-model="form.album_external_id"
              type="text"
              placeholder="ID de l'album"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">En production: sélecteur d'album</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu détaillé -->
    <AdminRichTextEditor
      v-model="content"
      v-model:model-value-en="contentEn"
      v-model:model-value-ar="contentAr"
      title="Contenu détaillé"
      description="Rédigez le contenu complet de l'événement : programme, intervenants, informations pratiques..."
      icon="fa-solid fa-file-lines"
      icon-color="text-indigo-500"
      placeholder="Décrivez en détail l'événement..."
      placeholder-en="Describe the event in detail..."
      placeholder-ar="صف الحدث بالتفصيل..."
      :min-height="400"
    />

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
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="isSaving"
          @click="saveDraft"
        >
          <font-awesome-icon icon="fa-solid fa-save" class="h-4 w-4" />
          Enregistrer
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          :disabled="isSaving"
          @click="saveAndPublish"
        >
          <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-globe" class="h-4 w-4" />
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
              :aspect-ratio="16/9"
              @save="saveEditedCover"
              @cancel="cancelCoverEditor"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
