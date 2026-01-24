<script setup lang="ts">
import type {
  ValueSectionKey,
  ValueSection,
  CoreValue,
  ValueHistory,
  ValuesGlobalStats
} from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getAllValueSections,
  getValueSectionById,
  getValueSectionByKey,
  getAllCoreValues,
  getCoreValueById,
  isCoreValueTitleTaken,
  getValueHistory,
  getAllValueHistory,
  getNextCoreValueOrder,
  getValuesGlobalStats,
  canEditValueSection,
  validateCoreValueTitle,
  validateCoreValueDescription,
  valueSectionLabels,
  valueSectionDescriptions,
  valueSectionIcons,
  valueSectionColors,
  coreValueAvailableIcons,
  generateCoreValueId
} = useMockData()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const activeTab = ref<'sections' | 'values'>('sections')

// Sections state
const sections = ref<ValueSection[]>([])
const editingSection = ref<ValueSectionKey | null>(null)
const sectionForm = ref({
  title: '',
  content: ''
})

// Core values state
const coreValues = ref<CoreValue[]>([])
const showValueModal = ref(false)
const showDeleteModal = ref(false)
const editingValue = ref<CoreValue | null>(null)
const valueToDelete = ref<CoreValue | null>(null)
const valueForm = ref({
  title: '',
  description: '',
  icon: 'star',
  is_active: true
})
const valueFormErrors = ref<Record<string, string>>({})

// History state
const showHistoryModal = ref(false)
const selectedHistoryItem = ref<{ id: string; type: 'section' | 'value'; name: string } | null>(null)
const historyItems = ref<ValueHistory[]>([])

// === COMPUTED ===

const globalStats = computed<ValuesGlobalStats>(() => getValuesGlobalStats())

const sectionKeys: ValueSectionKey[] = ['mission', 'vision', 'history', 'rector_message']

// === METHODS ===

// Initialisation
onMounted(() => {
  loadData()
})

const loadData = () => {
  sections.value = getAllValueSections()
  coreValues.value = getAllCoreValues(true)
  isLoading.value = false
}

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

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// === SECTIONS METHODS ===

const getSection = (key: ValueSectionKey): ValueSection | undefined => {
  return sections.value.find(s => s.key === key)
}

const startEditingSection = (key: ValueSectionKey) => {
  const section = getSection(key)
  if (section && canEditValueSection(section)) {
    editingSection.value = key
    sectionForm.value = {
      title: section.title,
      content: section.content
    }
  }
}

const cancelEditingSection = () => {
  editingSection.value = null
  sectionForm.value = { title: '', content: '' }
}

const saveSection = async () => {
  if (!editingSection.value) return

  isSaving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('Sauvegarde de la section:', {
      key: editingSection.value,
      ...sectionForm.value
    })

    // Update local state
    const index = sections.value.findIndex(s => s.key === editingSection.value)
    if (index !== -1) {
      sections.value[index] = {
        ...sections.value[index],
        title: sectionForm.value.title,
        content: sectionForm.value.content,
        updated_at: new Date().toISOString()
      }
    }

    editingSection.value = null
    sectionForm.value = { title: '', content: '' }
  } finally {
    isSaving.value = false
  }
}

// === CORE VALUES METHODS ===

const resetValueForm = () => {
  valueForm.value = {
    title: '',
    description: '',
    icon: 'star',
    is_active: true
  }
  valueFormErrors.value = {}
}

const validateValueForm = (): boolean => {
  valueFormErrors.value = {}

  if (!valueForm.value.title.trim()) {
    valueFormErrors.value.title = 'Le titre est requis'
  } else if (!validateCoreValueTitle(valueForm.value.title)) {
    valueFormErrors.value.title = 'Le titre doit contenir entre 2 et 50 caractères'
  } else if (isCoreValueTitleTaken(valueForm.value.title, editingValue.value?.id)) {
    valueFormErrors.value.title = 'Ce titre est déjà utilisé'
  }

  if (!valueForm.value.description.trim()) {
    valueFormErrors.value.description = 'La description est requise'
  } else if (!validateCoreValueDescription(valueForm.value.description)) {
    valueFormErrors.value.description = 'La description doit contenir entre 10 et 500 caractères'
  }

  return Object.keys(valueFormErrors.value).length === 0
}

const openAddValueModal = () => {
  editingValue.value = null
  resetValueForm()
  showValueModal.value = true
}

const openEditValueModal = (value: CoreValue) => {
  editingValue.value = value
  valueForm.value = {
    title: value.title,
    description: value.description,
    icon: value.icon,
    is_active: value.is_active
  }
  valueFormErrors.value = {}
  showValueModal.value = true
}

const openDeleteValueModal = (value: CoreValue) => {
  valueToDelete.value = value
  showDeleteModal.value = true
}

const saveValue = async () => {
  if (!validateValueForm()) return

  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    if (editingValue.value) {
      // Update existing
      console.log('Modification de la valeur:', {
        id: editingValue.value.id,
        ...valueForm.value
      })

      const index = coreValues.value.findIndex(v => v.id === editingValue.value?.id)
      if (index !== -1) {
        coreValues.value[index] = {
          ...coreValues.value[index],
          ...valueForm.value,
          updated_at: new Date().toISOString()
        }
      }
    } else {
      // Create new
      const newValue: CoreValue = {
        id: generateCoreValueId(),
        ...valueForm.value,
        display_order: getNextCoreValueOrder(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      console.log('Création de la valeur:', newValue)
      coreValues.value.push(newValue)
    }

    showValueModal.value = false
    editingValue.value = null
    resetValueForm()
  } finally {
    isSaving.value = false
  }
}

const deleteValue = async () => {
  if (!valueToDelete.value) return

  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('Suppression de la valeur:', valueToDelete.value.id)
    coreValues.value = coreValues.value.filter(v => v.id !== valueToDelete.value?.id)

    showDeleteModal.value = false
    valueToDelete.value = null
  } finally {
    isSaving.value = false
  }
}

// Reorder values
const moveValue = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex >= 0 && newIndex < coreValues.value.length) {
    const items = [...coreValues.value]
    ;[items[index], items[newIndex]] = [items[newIndex], items[index]]
    // Update display_order
    items.forEach((item, i) => {
      item.display_order = i + 1
    })
    coreValues.value = items
  }
}

// === HISTORY METHODS ===

const openSectionHistory = (section: ValueSection) => {
  selectedHistoryItem.value = {
    id: section.id,
    type: 'section',
    name: section.title
  }
  historyItems.value = getValueHistory(section.id)
  showHistoryModal.value = true
}

const openValueHistory = (value: CoreValue) => {
  selectedHistoryItem.value = {
    id: value.id,
    type: 'value',
    name: value.title
  }
  historyItems.value = getValueHistory(value.id)
  showHistoryModal.value = true
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  selectedHistoryItem.value = null
  historyItems.value = []
}

// Close modals
const closeModals = () => {
  showValueModal.value = false
  showDeleteModal.value = false
  showHistoryModal.value = false
  editingValue.value = null
  valueToDelete.value = null
  selectedHistoryItem.value = null
  resetValueForm()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Valeurs de l'université
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les contenus de présentation : mission, vision, valeurs fondamentales
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <template v-else>
      <!-- Statistics cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <font-awesome-icon :icon="['fas', 'file-alt']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.sections_count }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Sections</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <font-awesome-icon :icon="['fas', 'star']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.core_values_count }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Valeurs fondamentales</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.active_core_values }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Valeurs actives</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ globalStats.last_updated ? formatDateShort(globalStats.last_updated) : '-' }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button
            class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors"
            :class="activeTab === 'sections'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = 'sections'"
          >
            <font-awesome-icon :icon="['fas', 'file-alt']" class="mr-2 h-4 w-4" />
            Sections de présentation
          </button>
          <button
            class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors"
            :class="activeTab === 'values'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = 'values'"
          >
            <font-awesome-icon :icon="['fas', 'star']" class="mr-2 h-4 w-4" />
            Valeurs fondamentales
            <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
              {{ coreValues.length }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Sections Tab -->
      <div v-if="activeTab === 'sections'" class="space-y-6">
        <div
          v-for="key in sectionKeys"
          :key="key"
          class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg"
                  :class="valueSectionColors[key]"
                >
                  <font-awesome-icon :icon="['fas', valueSectionIcons[key]]" class="h-5 w-5" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ valueSectionLabels[key] }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ valueSectionDescriptions[key] }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="getSection(key)"
                  class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Voir l'historique"
                  @click="openSectionHistory(getSection(key)!)"
                >
                  <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
                </button>
                <button
                  v-if="editingSection !== key && getSection(key)"
                  class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                  @click="startEditingSection(key)"
                >
                  <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                  Modifier
                </button>
              </div>
            </div>
          </div>

          <!-- Section content or editing form -->
          <div class="p-4">
            <template v-if="editingSection === key">
              <!-- Edit form -->
              <div class="space-y-4">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Titre
                  </label>
                  <input
                    v-model="sectionForm.title"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Titre de la section"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contenu (HTML)
                  </label>
                  <textarea
                    v-model="sectionForm.content"
                    rows="12"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="<p>Contenu HTML de la section...</p>"
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Utilisez les balises HTML : &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;h3&gt;
                  </p>
                </div>
                <div class="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    :disabled="isSaving"
                    @click="cancelEditingSection"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    :disabled="isSaving"
                    @click="saveSection"
                  >
                    <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                    <font-awesome-icon v-else :icon="['fas', 'save']" class="h-4 w-4" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </template>
            <template v-else-if="getSection(key)">
              <!-- Preview -->
              <div class="prose prose-sm max-w-none dark:prose-invert" v-html="getSection(key)!.content" />
              <div class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Dernière modification : {{ formatDate(getSection(key)!.updated_at) }}
                </p>
              </div>
            </template>
            <template v-else>
              <p class="text-gray-500 dark:text-gray-400">
                Aucun contenu pour cette section.
              </p>
            </template>
          </div>
        </div>
      </div>

      <!-- Core Values Tab -->
      <div v-if="activeTab === 'values'" class="space-y-6">
        <!-- Add button -->
        <div class="flex justify-end">
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            @click="openAddValueModal"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
            Ajouter une valeur
          </button>
        </div>

        <!-- Values list -->
        <div v-if="coreValues.length === 0" class="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <font-awesome-icon :icon="['fas', 'star']" class="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            Aucune valeur fondamentale
          </h3>
          <p class="mb-6 text-gray-500 dark:text-gray-400">
            Commencez par ajouter vos valeurs fondamentales.
          </p>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            @click="openAddValueModal"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
            Ajouter une valeur
          </button>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(value, index) in coreValues"
            :key="value.id"
            class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            :class="{ 'opacity-60': !value.is_active }"
          >
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <font-awesome-icon :icon="['fas', value.icon]" class="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>

              <!-- Content -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ value.title }}
                  </h3>
                  <span
                    v-if="!value.is_active"
                    class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  >
                    Inactif
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {{ value.description }}
                </p>
                <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Modifié le {{ formatDateShort(value.updated_at) }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1">
                <!-- Move up -->
                <button
                  class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Monter"
                  :disabled="index === 0"
                  @click="moveValue(index, 'up')"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-4 w-4" />
                </button>
                <!-- Move down -->
                <button
                  class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Descendre"
                  :disabled="index === coreValues.length - 1"
                  @click="moveValue(index, 'down')"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-4 w-4" />
                </button>
                <!-- History -->
                <button
                  class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Historique"
                  @click="openValueHistory(value)"
                >
                  <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
                </button>
                <!-- Edit -->
                <button
                  class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Modifier"
                  @click="openEditValueModal(value)"
                >
                  <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                </button>
                <!-- Delete -->
                <button
                  class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Supprimer"
                  @click="openDeleteValueModal(value)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal: Add/Edit Value -->
    <Teleport to="body">
      <div
        v-if="showValueModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModals"
      >
        <div class="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingValue ? 'Modifier la valeur' : 'Ajouter une valeur' }}
            </h3>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <form class="space-y-4 p-6" @submit.prevent="saveValue">
            <!-- Title -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre *
              </label>
              <input
                v-model="valueForm.title"
                type="text"
                placeholder="ex: Excellence"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': valueFormErrors.title }"
              />
              <p v-if="valueFormErrors.title" class="mt-1 text-sm text-red-500">
                {{ valueFormErrors.title }}
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <textarea
                v-model="valueForm.description"
                rows="4"
                placeholder="Description de la valeur..."
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': valueFormErrors.description }"
              />
              <p v-if="valueFormErrors.description" class="mt-1 text-sm text-red-500">
                {{ valueFormErrors.description }}
              </p>
              <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ valueForm.description.length }}/500 caractères
              </p>
            </div>

            <!-- Icon -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Icône
              </label>
              <div class="grid grid-cols-8 gap-2">
                <button
                  v-for="iconOption in coreValueAvailableIcons"
                  :key="iconOption.value"
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors"
                  :class="valueForm.icon === iconOption.value
                    ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-400'"
                  :title="iconOption.label"
                  @click="valueForm.icon = iconOption.value"
                >
                  <font-awesome-icon :icon="['fas', iconOption.value]" class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- Active -->
            <div class="flex items-center gap-3">
              <input
                id="is_active"
                v-model="valueForm.is_active"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 bg-white text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label for="is_active" class="text-sm text-gray-700 dark:text-gray-300">
                Valeur active (visible sur le site public)
              </label>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                {{ editingValue ? 'Enregistrer' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Delete Confirmation -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && valueToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModals"
      >
        <div class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer cette valeur ?
            </h3>
            <p class="mb-6 text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer la valeur
              <span class="font-medium text-gray-700 dark:text-gray-300">« {{ valueToDelete.title }} »</span> ?
              Cette action est irréversible.
            </p>
            <div class="flex justify-center gap-3">
              <button
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                :disabled="isSaving"
                @click="deleteValue"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: History -->
    <Teleport to="body">
      <div
        v-if="showHistoryModal && selectedHistoryItem"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeHistoryModal"
      >
        <div class="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Historique des modifications
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedHistoryItem.name }}
              </p>
            </div>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeHistoryModal"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="historyItems.length === 0" class="py-8 text-center">
              <font-awesome-icon :icon="['fas', 'history']" class="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p class="text-gray-500 dark:text-gray-400">
                Aucune modification enregistrée
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(entry, index) in historyItems"
                :key="entry.id"
                class="relative pb-4 pl-6"
                :class="{ 'border-l-2 border-gray-200 dark:border-gray-700': index < historyItems.length - 1 }"
              >
                <div class="absolute left-0 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatDate(entry.modified_at) }}
                    </span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">
                      par {{ entry.modified_by_name || 'Inconnu' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Champ modifié : <span class="font-medium">{{ entry.field_changed }}</span>
                  </p>
                  <div class="text-sm">
                    <p class="text-gray-500 dark:text-gray-400 line-clamp-2">
                      {{ entry.old_value.substring(0, 100) }}{{ entry.old_value.length > 100 ? '...' : '' }}
                    </p>
                    <font-awesome-icon :icon="['fas', 'arrow-down']" class="my-1 h-3 w-3 text-gray-400" />
                    <p class="font-medium text-gray-900 dark:text-white line-clamp-2">
                      {{ entry.new_value.substring(0, 100) }}{{ entry.new_value.length > 100 ? '...' : '' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              @click="closeHistoryModal"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Last updated info -->
    <div v-if="!isLoading" class="text-center text-sm text-gray-500 dark:text-gray-400">
      Dernière modification : {{ globalStats.last_updated ? formatDate(globalStats.last_updated) : '-' }}
    </div>
  </div>
</template>
