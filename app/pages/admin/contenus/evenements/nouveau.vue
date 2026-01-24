<script setup lang="ts">
import type { Event, EventType, EventStatus } from '~/composables/useMockData'
import type { OutputData } from '@editorjs/editorjs'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  generateEventId,
  generateEventPartnerId,
  slugifyEvent,
  campusExternalises,
  departments,
  getAllProjects,
  partenaires
} = useMockData()

// Onglet actif
const activeTab = ref<'general' | 'datetime' | 'location' | 'registration' | 'associations' | 'options'>('general')

// Contenu EditorJS (séparé du formulaire pour éviter les problèmes de réactivité)
const content = ref<OutputData | undefined>(undefined)
const contentEn = ref<OutputData | undefined>(undefined)
const contentAr = ref<OutputData | undefined>(undefined)

// État du formulaire
const form = ref<Partial<Event>>({
  id: generateEventId(),
  external_id: `ext-${Date.now()}`,
  title: '',
  slug: '',
  type: 'conference',
  type_other: '',
  description: '',
  cover_image: '',
  start_date: '',
  end_date: '',
  is_online: false,
  video_conference_link: '',
  venue: '',
  address: '',
  city: '',
  country: '',
  country_external_id: '',
  latitude: undefined,
  longitude: undefined,
  registration_required: false,
  registration_link: '',
  max_attendees: undefined,
  registrations_count: 0,
  campus_id: '',
  department_id: '',
  project_id: '',
  organizer_id: '',
  album_id: '',
  partners: [],
  status: 'draft'
})

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

// === GESTION DES PARTENAIRES ===
const newPartnerId = ref('')

const availablePartners = computed(() => {
  const usedIds = form.value.partners?.map(p => p.partner_id) || []
  return partenaires.value.filter(p => !usedIds.includes(p.id))
})

const addPartner = () => {
  if (!newPartnerId.value) return
  const partner = partenaires.value.find(p => p.id === newPartnerId.value)
  if (!partner) return

  const partners = form.value.partners || []
  partners.push({
    id: generateEventPartnerId(),
    event_id: form.value.id || '',
    partner_id: partner.id,
    partner_name: partner.name_fr,
    partner_logo: partner.logo_url,
    display_order: partners.length + 1
  })
  form.value.partners = partners
  newPartnerId.value = ''
}

const removePartner = (index: number) => {
  form.value.partners?.splice(index, 1)
}

// === LISTES DE RÉFÉRENCE ===
const campusList = computed(() => [
  { id: 'siege', name: 'Siège - Alexandrie' },
  ...campusExternalises.value.map(c => ({ id: c.id, name: c.name_fr }))
])

const departmentList = computed(() =>
  departments.value.map(d => ({ id: d.id, name: d.name_fr }))
)

const projectList = computed(() =>
  getAllProjects().map(p => ({ id: p.id, name: p.title_fr }))
)

// === SAUVEGARDE ===
const isSaving = ref(false)

const saveForm = async () => {
  isSaving.value = true
  try {
    // Ajout des métadonnées et du contenu EditorJS
    const now = new Date().toISOString()
    const eventData = {
      ...form.value,
      content: content.value,
      content_en: contentEn.value,
      content_ar: contentAr.value,
      created_at: now,
      updated_at: now
    }

    console.log('Creating event:', eventData)
    // En production: POST /api/admin/events
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/admin/contenus/evenements')
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

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image de couverture
            </label>
            <input
              v-model="form.cover_image"
              type="url"
              placeholder="https://..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">URL de l'image (en production: upload via médiathèque)</p>
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
              Pays
            </label>
            <input
              v-model="form.country"
              type="text"
              placeholder="Ex: Égypte"
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
              v-model="form.campus_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun campus</option>
              <option v-for="campus in campusList" :key="campus.id" :value="campus.id">
                {{ campus.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Département
            </label>
            <select
              v-model="form.department_id"
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
              v-model="form.project_id"
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
              Organisateur
            </label>
            <input
              v-model="form.organizer_id"
              type="text"
              placeholder="ID de l'organisateur"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">En production: sélecteur d'utilisateur</p>
          </div>

          <!-- Partenaires -->
          <div class="sm:col-span-2">
            <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Partenaires
            </h3>

            <div v-if="form.partners && form.partners.length > 0" class="mb-4 space-y-2">
              <div
                v-for="(partner, index) in form.partners"
                :key="partner.id"
                class="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div v-if="partner.partner_logo" class="h-8 w-8 flex-shrink-0 overflow-hidden rounded">
                  <img :src="partner.partner_logo" :alt="partner.partner_name" class="h-full w-full object-contain" />
                </div>
                <div v-else class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                  <font-awesome-icon icon="fa-solid fa-building" class="h-4 w-4 text-gray-400" />
                </div>
                <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">{{ partner.partner_name }}</span>
                <button class="text-red-500 hover:text-red-700" @click="removePartner(index)">
                  <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
              <div class="flex items-end gap-3">
                <div class="flex-1">
                  <label class="mb-1 block text-sm text-gray-500">Ajouter un partenaire</label>
                  <select
                    v-model="newPartnerId"
                    class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Sélectionner un partenaire</option>
                    <option v-for="partner in availablePartners" :key="partner.id" :value="partner.id">
                      {{ partner.name_fr }}
                    </option>
                  </select>
                </div>
                <button
                  :disabled="!newPartnerId"
                  class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  @click="addPartner"
                >
                  <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
                  Ajouter
                </button>
              </div>
            </div>
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
              Album photos
            </label>
            <input
              v-model="form.album_id"
              type="text"
              placeholder="ID de l'album"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">En production: sélecteur d'album ou création</p>
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
  </div>
</template>
