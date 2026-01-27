<script setup lang="ts">
import type { SocialMediaLink, SocialMediaPlatform, SocialMediaStats } from '~/types/api'

definePageMeta({
  layout: 'admin',
})

const {
  getAllSocialMedia,
  getSocialMediaCategory,
  createSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
  toggleSocialMediaActive,
  isPlatformUsed,
  validateSocialMediaUrl,
  getNextDisplayOrder,
  getSocialMediaStats,
  getAvailablePlatforms,
  formatSocialMediaUrl,
  getPlatformIcon,
  platformLabels,
  platformColors,
  platformBadgeColors,
  platformUrlExamples,
} = useSocialNetworksApi()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)
const socialMediaLinks = ref<SocialMediaLink[]>([])
const categoryId = ref<string | null>(null)

// Modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const selectedLink = ref<SocialMediaLink | null>(null)
const linkToDelete = ref<SocialMediaLink | null>(null)

// Formulaire
const formData = ref({
  platform: '' as SocialMediaPlatform | '',
  url: '',
  active: true,
  custom_label: '',
})
const formErrors = ref<Record<string, string>>({})

// Stats
const stats = ref<SocialMediaStats>({
  total_count: 0,
  active_count: 0,
  inactive_count: 0,
  platforms_used: [],
  last_updated: null,
})

// Plateformes disponibles
const availablePlatformsForAdd = ref<SocialMediaPlatform[]>([])
const availablePlatformsForEdit = ref<SocialMediaPlatform[]>([])

// Exemple d'URL selon la plateforme sélectionnée
const urlExample = computed(() => {
  if (!formData.value.platform) return ''
  return platformUrlExamples[formData.value.platform]
})

// === METHODS ===

// Charger les données
async function loadData() {
  isLoading.value = true
  error.value = null

  try {
    // Charger la catégorie pour obtenir son ID
    const category = await getSocialMediaCategory()
    if (category) {
      categoryId.value = category.id
    }

    // Charger les données en parallèle
    const [linksData, statsData, platformsData] = await Promise.all([
      getAllSocialMedia(),
      getSocialMediaStats(),
      getAvailablePlatforms(),
    ])

    socialMediaLinks.value = linksData
    stats.value = statsData
    availablePlatformsForAdd.value = platformsData
  }
  catch (err) {
    console.error('Erreur chargement des données:', err)
    error.value = 'Erreur lors du chargement des données'
  }
  finally {
    isLoading.value = false
  }
}

// Rafraîchir les stats et plateformes disponibles
async function refreshStatsAndPlatforms() {
  try {
    const [statsData, platformsData] = await Promise.all([
      getSocialMediaStats(),
      getAvailablePlatforms(),
    ])
    stats.value = statsData
    availablePlatformsForAdd.value = platformsData
  }
  catch (err) {
    console.error('Erreur rafraîchissement:', err)
  }
}

// Initialisation
onMounted(() => {
  loadData()
})

// Format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Réinitialiser le formulaire
function resetForm() {
  formData.value = {
    platform: '',
    url: '',
    active: true,
    custom_label: '',
  }
  formErrors.value = {}
}

// Valider le formulaire
function validateForm(): boolean {
  formErrors.value = {}

  if (!formData.value.platform) {
    formErrors.value.platform = 'Veuillez sélectionner une plateforme'
  }

  if (!formData.value.url.trim()) {
    formErrors.value.url = 'L\'URL est requise'
  }
  else if (formData.value.platform && !validateSocialMediaUrl(formData.value.url, formData.value.platform)) {
    formErrors.value.url = 'L\'URL n\'est pas valide pour cette plateforme'
  }

  if (formData.value.platform === 'other' && !formData.value.custom_label?.trim()) {
    formErrors.value.custom_label = 'Le libellé est requis pour "Autre"'
  }

  return Object.keys(formErrors.value).length === 0
}

// Ouvrir modal d'ajout
async function openAddModal() {
  resetForm()
  availablePlatformsForAdd.value = await getAvailablePlatforms()
  showAddModal.value = true
}

// Ouvrir modal d'édition
async function openEditModal(link: SocialMediaLink) {
  selectedLink.value = link
  formData.value = {
    platform: link.platform,
    url: link.url,
    active: link.active,
    custom_label: link.custom_label || '',
  }
  formErrors.value = {}
  availablePlatformsForEdit.value = await getAvailablePlatforms(link.id)
  showEditModal.value = true
}

// Ouvrir modal de suppression
function openDeleteModal(link: SocialMediaLink) {
  linkToDelete.value = link
  showDeleteModal.value = true
}

// Enregistrer (ajout)
async function handleAdd() {
  if (!validateForm()) return
  if (!categoryId.value) {
    error.value = 'Catégorie non trouvée'
    return
  }

  isSaving.value = true
  error.value = null

  try {
    const newLink = await createSocialMedia(
      {
        platform: formData.value.platform as SocialMediaPlatform,
        url: formData.value.url,
        active: formData.value.active,
        custom_label: formData.value.platform === 'other' ? formData.value.custom_label : undefined,
      },
      categoryId.value,
    )

    socialMediaLinks.value.push(newLink)
    socialMediaLinks.value.sort((a, b) => a.display_order - b.display_order)

    await refreshStatsAndPlatforms()

    showAddModal.value = false
    resetForm()
  }
  catch (err) {
    console.error('Erreur ajout:', err)
    error.value = 'Erreur lors de l\'ajout du réseau social'
  }
  finally {
    isSaving.value = false
  }
}

// Enregistrer (modification)
async function handleEdit() {
  if (!validateForm() || !selectedLink.value) return

  isSaving.value = true
  error.value = null

  try {
    const updated = await updateSocialMedia(selectedLink.value.id, {
      platform: formData.value.platform as SocialMediaPlatform,
      url: formData.value.url,
      active: formData.value.active,
      custom_label: formData.value.platform === 'other' ? formData.value.custom_label : undefined,
    })

    // Mettre à jour le state local
    const index = socialMediaLinks.value.findIndex(l => l.id === selectedLink.value!.id)
    if (index !== -1) {
      socialMediaLinks.value[index] = updated
    }

    await refreshStatsAndPlatforms()

    showEditModal.value = false
    selectedLink.value = null
    resetForm()
  }
  catch (err) {
    console.error('Erreur modification:', err)
    error.value = 'Erreur lors de la modification du réseau social'
  }
  finally {
    isSaving.value = false
  }
}

// Supprimer
async function handleDelete() {
  if (!linkToDelete.value) return

  isSaving.value = true
  error.value = null

  try {
    await deleteSocialMedia(linkToDelete.value.id)

    // Mettre à jour le state local
    socialMediaLinks.value = socialMediaLinks.value.filter(l => l.id !== linkToDelete.value!.id)

    await refreshStatsAndPlatforms()

    showDeleteModal.value = false
    linkToDelete.value = null
  }
  catch (err) {
    console.error('Erreur suppression:', err)
    error.value = 'Erreur lors de la suppression du réseau social'
  }
  finally {
    isSaving.value = false
  }
}

// Toggle actif/inactif
async function toggleActive(link: SocialMediaLink) {
  try {
    const updated = await toggleSocialMediaActive(link.id)

    // Mettre à jour le state local
    const index = socialMediaLinks.value.findIndex(l => l.id === link.id)
    if (index !== -1) {
      socialMediaLinks.value[index] = updated
    }

    await refreshStatsAndPlatforms()
  }
  catch (err) {
    console.error('Erreur toggle active:', err)
    error.value = 'Erreur lors de la modification du statut'
  }
}

// Déplacer vers le haut
async function moveUp(link: SocialMediaLink) {
  const index = socialMediaLinks.value.findIndex(l => l.id === link.id)
  if (index <= 0) return

  try {
    const prevLink = socialMediaLinks.value[index - 1]
    const currentLink = socialMediaLinks.value[index]

    // Échanger les ordres
    const prevOrder = prevLink.display_order
    const currentOrder = currentLink.display_order

    // Mettre à jour sur le serveur
    await Promise.all([
      updateSocialMedia(prevLink.id, { display_order: currentOrder }),
      updateSocialMedia(currentLink.id, { display_order: prevOrder }),
    ])

    // Mettre à jour localement
    socialMediaLinks.value[index - 1].display_order = currentOrder
    socialMediaLinks.value[index].display_order = prevOrder

    // Réordonner
    socialMediaLinks.value.sort((a, b) => a.display_order - b.display_order)
  }
  catch (err) {
    console.error('Erreur réordonnement:', err)
    // En cas d'erreur, recharger les données
    await loadData()
  }
}

// Déplacer vers le bas
async function moveDown(link: SocialMediaLink) {
  const index = socialMediaLinks.value.findIndex(l => l.id === link.id)
  if (index >= socialMediaLinks.value.length - 1) return

  try {
    const nextLink = socialMediaLinks.value[index + 1]
    const currentLink = socialMediaLinks.value[index]

    // Échanger les ordres
    const nextOrder = nextLink.display_order
    const currentOrder = currentLink.display_order

    // Mettre à jour sur le serveur
    await Promise.all([
      updateSocialMedia(nextLink.id, { display_order: currentOrder }),
      updateSocialMedia(currentLink.id, { display_order: nextOrder }),
    ])

    // Mettre à jour localement
    socialMediaLinks.value[index + 1].display_order = currentOrder
    socialMediaLinks.value[index].display_order = nextOrder

    // Réordonner
    socialMediaLinks.value.sort((a, b) => a.display_order - b.display_order)
  }
  catch (err) {
    console.error('Erreur réordonnement:', err)
    // En cas d'erreur, recharger les données
    await loadData()
  }
}

// Fermer les modales
function closeModals() {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedLink.value = null
  linkToDelete.value = null
  resetForm()
}

// Obtenir le label de la plateforme
function getPlatformLabel(link: SocialMediaLink) {
  if (link.platform === 'other' && link.custom_label) {
    return link.custom_label
  }
  return platformLabels[link.platform]
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Réseaux sociaux
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les liens vers vos réseaux sociaux affichés sur le site
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un réseau
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div class="flex items-center gap-3">
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="h-5 w-5 text-red-600 dark:text-red-400" />
        <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        <button
          class="ml-auto text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
          @click="loadData"
        >
          Réessayer
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Total -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'share-alt']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.total_count }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Réseaux configurés
            </p>
          </div>
        </div>
      </div>

      <!-- Actifs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.active_count }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Actifs
            </p>
          </div>
        </div>
      </div>

      <!-- Inactifs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
            <font-awesome-icon :icon="['fas', 'eye-slash']" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.inactive_count }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Inactifs
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des réseaux sociaux -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <div v-else-if="socialMediaLinks.length === 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
      <font-awesome-icon :icon="['fas', 'share-alt']" class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucun réseau social configuré
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Ajoutez vos réseaux sociaux pour les afficher sur le site.
      </p>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un réseau
      </button>
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Utilisez les flèches pour réordonner l'affichage des réseaux sur le site.
        </p>
      </div>

      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li
          v-for="(link, index) in socialMediaLinks"
          :key="link.id"
          class="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          :class="{ 'opacity-60': !link.active }"
        >
          <!-- Ordre -->
          <div class="flex flex-col gap-1">
            <button
              :disabled="index === 0"
              class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Monter"
              @click="moveUp(link)"
            >
              <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-3 w-3 text-gray-500" />
            </button>
            <button
              :disabled="index === socialMediaLinks.length - 1"
              class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Descendre"
              @click="moveDown(link)"
            >
              <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3 text-gray-500" />
            </button>
          </div>

          <!-- Icône plateforme -->
          <div
            class="flex h-12 w-12 items-center justify-center rounded-lg"
            :class="platformColors[link.platform]"
          >
            <font-awesome-icon
              :icon="getPlatformIcon(link.platform)"
              class="h-6 w-6"
            />
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ getPlatformLabel(link) }}
              </h3>
              <span
                v-if="!link.active"
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                Inactif
              </span>
            </div>
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-primary-600 dark:text-primary-400 hover:underline truncate block"
            >
              {{ formatSocialMediaUrl(link.url) }}
            </a>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Modifié le {{ formatDate(link.updated_at) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Toggle actif -->
            <button
              class="p-2 rounded-lg transition-colors"
              :class="link.active
                ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
              :title="link.active ? 'Désactiver' : 'Activer'"
              @click="toggleActive(link)"
            >
              <font-awesome-icon
                :icon="['fas', link.active ? 'toggle-on' : 'toggle-off']"
                class="h-5 w-5"
              />
            </button>

            <!-- Modifier -->
            <button
              class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Modifier"
              @click="openEditModal(link)"
            >
              <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
            </button>

            <!-- Supprimer -->
            <button
              class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Supprimer"
              @click="openDeleteModal(link)"
            >
              <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
            </button>

            <!-- Ouvrir -->
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <font-awesome-icon :icon="['fas', 'external-link-alt']" class="h-4 w-4" />
            </a>
          </div>
        </li>
      </ul>
    </div>

    <!-- Modal Ajouter -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter un réseau social
            </h3>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="handleAdd">
            <!-- Plateforme -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plateforme *
              </label>
              <select
                v-model="formData.platform"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.platform }"
              >
                <option value="">Sélectionner une plateforme</option>
                <option v-for="platform in availablePlatformsForAdd" :key="platform" :value="platform">
                  {{ platformLabels[platform] }}
                </option>
              </select>
              <p v-if="formErrors.platform" class="mt-1 text-sm text-red-500">{{ formErrors.platform }}</p>
            </div>

            <!-- Libellé personnalisé (pour "Autre") -->
            <div v-if="formData.platform === 'other'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Libellé *
              </label>
              <input
                v-model="formData.custom_label"
                type="text"
                placeholder="ex: Threads, Mastodon..."
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.custom_label }"
              >
              <p v-if="formErrors.custom_label" class="mt-1 text-sm text-red-500">{{ formErrors.custom_label }}</p>
            </div>

            <!-- URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL du profil *
              </label>
              <input
                v-model="formData.url"
                type="url"
                :placeholder="urlExample || 'https://...'"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.url }"
              >
              <p v-if="formErrors.url" class="mt-1 text-sm text-red-500">{{ formErrors.url }}</p>
              <p v-else-if="urlExample" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Exemple : {{ urlExample }}
              </p>
            </div>

            <!-- Actif -->
            <div class="flex items-center gap-3">
              <input
                id="active-add"
                v-model="formData.active"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              >
              <label for="active-add" class="text-sm text-gray-700 dark:text-gray-300">
                Activer immédiatement
              </label>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                :disabled="isSaving"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier -->
    <Teleport to="body">
      <div
        v-if="showEditModal && selectedLink"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier le réseau social
            </h3>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="handleEdit">
            <!-- Plateforme -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plateforme *
              </label>
              <select
                v-model="formData.platform"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.platform }"
              >
                <option v-for="platform in availablePlatformsForEdit" :key="platform" :value="platform">
                  {{ platformLabels[platform] }}
                </option>
              </select>
              <p v-if="formErrors.platform" class="mt-1 text-sm text-red-500">{{ formErrors.platform }}</p>
            </div>

            <!-- Libellé personnalisé (pour "Autre") -->
            <div v-if="formData.platform === 'other'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Libellé *
              </label>
              <input
                v-model="formData.custom_label"
                type="text"
                placeholder="ex: Threads, Mastodon..."
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.custom_label }"
              >
              <p v-if="formErrors.custom_label" class="mt-1 text-sm text-red-500">{{ formErrors.custom_label }}</p>
            </div>

            <!-- URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL du profil *
              </label>
              <input
                v-model="formData.url"
                type="url"
                :placeholder="urlExample || 'https://...'"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.url }"
              >
              <p v-if="formErrors.url" class="mt-1 text-sm text-red-500">{{ formErrors.url }}</p>
            </div>

            <!-- Actif -->
            <div class="flex items-center gap-3">
              <input
                id="active-edit"
                v-model="formData.active"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              >
              <label for="active-edit" class="text-sm text-gray-700 dark:text-gray-300">
                Actif
              </label>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                :disabled="isSaving"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && linkToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Supprimer ce réseau social ?
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Vous êtes sur le point de supprimer le lien vers
              <strong>{{ getPlatformLabel(linkToDelete) }}</strong>.
              Cette action est irréversible.
            </p>
            <div class="flex justify-center gap-3">
              <button
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                :disabled="isSaving"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                :disabled="isSaving"
                @click="handleDelete"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
