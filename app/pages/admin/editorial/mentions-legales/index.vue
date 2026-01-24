<script setup lang="ts">
import type { LegalPage, LegalPageKey, LegalPageHistory } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getAllLegalPages,
  getLegalPageByKey,
  getLegalPageHistory,
  getLegalPagesStats,
  canEditLegalPage,
  generateLegalHistoryId,
  legalPageLabels,
  legalPageDescriptions,
  legalPageIcons,
  legalPageColors,
  legalPageKeys
} = useMockData()

// === STATE ===
const isLoading = ref(true)

// Modals
const showEditModal = ref(false)
const showHistoryModal = ref(false)
const showPreviewModal = ref(false)

const selectedPage = ref<LegalPage | null>(null)
const pageHistory = ref<LegalPageHistory[]>([])

// Formulaire
const formData = ref({
  title: '',
  content: ''
})
const formErrors = ref<Record<string, string>>({})
const isSaving = ref(false)

// === COMPUTED ===

// Statistiques globales
const stats = computed(() => getLegalPagesStats())

// Liste des pages légales
const legalPages = computed(() => getAllLegalPages())

// === METHODS ===

// Initialisation
onMounted(() => {
  isLoading.value = false
})

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format date courte
const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Réinitialiser le formulaire
const resetForm = () => {
  formData.value = {
    title: '',
    content: ''
  }
  formErrors.value = {}
}

// Valider le formulaire
const validateForm = (): boolean => {
  formErrors.value = {}

  if (!formData.value.title.trim()) {
    formErrors.value.title = 'Le titre est requis'
  }

  if (!formData.value.content.trim()) {
    formErrors.value.content = 'Le contenu est requis'
  }

  return Object.keys(formErrors.value).length === 0
}

// Ouvrir modal d'édition
const openEditModal = (page: LegalPage) => {
  selectedPage.value = page
  formData.value = {
    title: page.title,
    content: page.content
  }
  formErrors.value = {}
  showEditModal.value = true
}

// Ouvrir modal d'historique
const openHistoryModal = (page: LegalPage) => {
  selectedPage.value = page
  pageHistory.value = getLegalPageHistory(page.id)
  showHistoryModal.value = true
}

// Ouvrir modal de prévisualisation
const openPreviewModal = (page: LegalPage) => {
  selectedPage.value = page
  showPreviewModal.value = true
}

// Enregistrer (modification)
const handleSave = async () => {
  if (!validateForm() || !selectedPage.value) return

  isSaving.value = true

  // Simulation de la sauvegarde (en mode réel, appel API)
  await new Promise(resolve => setTimeout(resolve, 500))

  console.log('Modification de la page légale:', {
    id: selectedPage.value.id,
    key: selectedPage.value.key,
    title: formData.value.title,
    content: formData.value.content,
    updated_at: new Date().toISOString()
  })

  // Créer une entrée dans l'historique
  console.log('Nouvelle entrée historique:', {
    id: generateLegalHistoryId(),
    content_id: selectedPage.value.id,
    old_value: selectedPage.value.content,
    new_value: formData.value.content,
    modified_by_external_id: 'current_user_id',
    modified_by_name: 'Admin',
    modified_at: new Date().toISOString()
  })

  isSaving.value = false
  showEditModal.value = false
  selectedPage.value = null
  resetForm()
}

// Restaurer une version
const restoreVersion = (historyEntry: LegalPageHistory) => {
  if (!selectedPage.value) return

  // En mode réel, appel API pour restaurer
  console.log('Restauration de la version:', {
    content_id: historyEntry.content_id,
    restored_from: historyEntry.id,
    content: historyEntry.new_value
  })

  showHistoryModal.value = false
  selectedPage.value = null
}

// Fermer les modales
const closeModals = () => {
  showEditModal.value = false
  showHistoryModal.value = false
  showPreviewModal.value = false
  selectedPage.value = null
  pageHistory.value = []
  resetForm()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Mentions légales
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les pages légales obligatoires du site
        </p>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Nombre de pages -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'file-alt']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.total_pages }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Pages légales
            </p>
          </div>
        </div>
      </div>

      <!-- Dernière mise à jour -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ stats.last_updated ? formatDateShort(stats.last_updated) : '-' }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Dernière mise à jour
            </p>
          </div>
        </div>
      </div>

      <!-- Historique -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'history']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.history_count }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Versions enregistrées
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerte conformité -->
    <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
      <div class="flex gap-3">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 class="text-sm font-medium text-amber-800 dark:text-amber-300">
            Important - Conformité légale
          </h4>
          <p class="mt-1 text-sm text-amber-700 dark:text-amber-400">
            Ces pages sont obligatoires et doivent être maintenues à jour conformément au RGPD et à la législation en vigueur.
            Toutes les modifications sont historisées pour des raisons de conformité.
          </p>
        </div>
      </div>
    </div>

    <!-- Liste des pages -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="page in legalPages"
        :key="page.id"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Header de la carte -->
        <div class="p-5 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start gap-4">
            <!-- Icône -->
            <div
              class="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0"
              :class="legalPageColors[page.key]"
            >
              <font-awesome-icon :icon="legalPageIcons[page.key]" class="h-6 w-6" />
            </div>

            <!-- Titre et description -->
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ legalPageLabels[page.key] }}
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ legalPageDescriptions[page.key] }}
              </p>
            </div>
          </div>
        </div>

        <!-- Contenu aperçu -->
        <div class="p-5">
          <div class="prose prose-sm dark:prose-invert max-w-none line-clamp-4 text-gray-600 dark:text-gray-400" v-html="page.content.substring(0, 300) + '...'" />
        </div>

        <!-- Footer -->
        <div class="px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <!-- Date de mise à jour -->
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <font-awesome-icon :icon="['fas', 'clock']" class="h-4 w-4" />
              <span>Mis à jour le {{ formatDateShort(page.updated_at) }}</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <!-- Prévisualiser -->
              <button
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title="Prévisualiser"
                @click="openPreviewModal(page)"
              >
                <font-awesome-icon :icon="['fas', 'eye']" class="h-4 w-4" />
                <span class="hidden sm:inline">Voir</span>
              </button>

              <!-- Historique -->
              <button
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title="Historique des versions"
                @click="openHistoryModal(page)"
              >
                <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
                <span class="hidden sm:inline">Historique</span>
              </button>

              <!-- Modifier -->
              <button
                v-if="canEditLegalPage()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                title="Modifier"
                @click="openEditModal(page)"
              >
                <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                <span class="hidden sm:inline">Modifier</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Modifier -->
    <Teleport to="body">
      <div
        v-if="showEditModal && selectedPage"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg"
                :class="legalPageColors[selectedPage.key]"
              >
                <font-awesome-icon :icon="legalPageIcons[selectedPage.key]" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Modifier : {{ legalPageLabels[selectedPage.key] }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Les modifications seront historisées
                </p>
              </div>
            </div>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <form class="flex-1 overflow-y-auto p-6 space-y-4" @submit.prevent="handleSave">
            <!-- Titre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre de la page *
              </label>
              <input
                v-model="formData.title"
                type="text"
                placeholder="Titre affiché en haut de la page"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.title }"
              >
              <p v-if="formErrors.title" class="mt-1 text-sm text-red-500">{{ formErrors.title }}</p>
            </div>

            <!-- Contenu -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contenu (HTML) *
              </label>
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Vous pouvez utiliser les balises HTML : &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;table&gt;
              </div>
              <textarea
                v-model="formData.content"
                rows="15"
                placeholder="<h2>Section</h2><p>Contenu...</p>"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono"
                :class="{ 'border-red-500': formErrors.content }"
              />
              <p v-if="formErrors.content" class="mt-1 text-sm text-red-500">{{ formErrors.content }}</p>
            </div>

            <!-- Aperçu rapide -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Aperçu
              </label>
              <div class="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 max-h-48 overflow-y-auto">
                <div class="prose prose-sm dark:prose-invert max-w-none" v-html="formData.content || '<p class=\'text-gray-400\'>Aucun contenu</p>'" />
              </div>
            </div>
          </form>

          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSaving"
              @click="handleSave"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Historique -->
    <Teleport to="body">
      <div
        v-if="showHistoryModal && selectedPage"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg"
                :class="legalPageColors[selectedPage.key]"
              >
                <font-awesome-icon :icon="['fas', 'history']" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Historique des versions
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ legalPageLabels[selectedPage.key] }}
                </p>
              </div>
            </div>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <!-- Version actuelle -->
            <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div class="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <font-awesome-icon :icon="['fas', 'check-circle']" class="h-4 w-4" />
                <span class="text-sm font-medium">Version actuelle</span>
              </div>
              <p class="text-sm text-green-800 dark:text-green-300">
                Dernière modification le {{ formatDate(selectedPage.updated_at) }}
              </p>
            </div>

            <!-- Liste des versions -->
            <div v-if="pageHistory.length === 0" class="text-center py-8">
              <font-awesome-icon :icon="['fas', 'history']" class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">
                Aucune version antérieure enregistrée
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(entry, index) in pageHistory"
                :key="entry.id"
                class="relative pl-6 pb-4"
                :class="{ 'border-l-2 border-gray-200 dark:border-gray-700': index < pageHistory.length - 1 }"
              >
                <div class="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />

                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ formatDate(entry.modified_at) }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        par {{ entry.modified_by_name || 'Inconnu' }}
                      </p>
                    </div>
                    <button
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                      @click="restoreVersion(entry)"
                    >
                      <font-awesome-icon :icon="['fas', 'undo']" class="h-3 w-3" />
                      Restaurer
                    </button>
                  </div>

                  <details class="group">
                    <summary class="cursor-pointer text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                      <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3 mr-1 transition-transform group-open:rotate-90" />
                      Voir le contenu de cette version
                    </summary>
                    <div class="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 max-h-48 overflow-y-auto">
                      <p class="text-xs text-gray-500 dark:text-gray-400 italic">
                        Contenu enregistré (aperçu non disponible en mode mock)
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              class="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              @click="closeModals"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Prévisualisation -->
    <Teleport to="body">
      <div
        v-if="showPreviewModal && selectedPage"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg"
                :class="legalPageColors[selectedPage.key]"
              >
                <font-awesome-icon :icon="legalPageIcons[selectedPage.key]" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Prévisualisation
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ legalPageLabels[selectedPage.key] }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="openEditModal(selectedPage)"
              >
                <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                Modifier
              </button>
              <button
                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                @click="closeModals"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <!-- Simulation de la page publique -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div class="max-w-3xl mx-auto">
                <!-- Titre -->
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ selectedPage.title }}
                </h1>

                <!-- Date de mise à jour -->
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">
                  Dernière mise à jour : {{ formatDate(selectedPage.updated_at) }}
                </p>

                <!-- Contenu -->
                <div class="prose prose-lg dark:prose-invert max-w-none" v-html="selectedPage.content" />
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Cette prévisualisation montre le rendu sur le site public
              </p>
              <button
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="closeModals"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
