<script setup lang="ts">
import type { EditorialSectionRead, EditorialItemRead } from '~/types/fundraising'

definePageMeta({
  layout: 'admin'
})

const { t } = useI18n()

const {
  listEditorialSections,
  updateSection,
  createItem,
  updateItem,
  deleteItem: apiDeleteItem,
} = useAdminFundraisingApi()

// === STATE ===
const isLoading = ref(false)
const error = ref<string | null>(null)
const sections = ref<EditorialSectionRead[]>([])

// Accordion
const expandedSections = ref<string[]>([])

// Edit section modal
const showSectionModal = ref(false)
const editingSectionId = ref<string | null>(null)
const sectionForm = reactive({
  title_fr: '',
  title_en: '',
  title_ar: '',
})

// Item modal
const showItemModal = ref(false)
const editingItemId = ref<string | null>(null)
const editingItemSectionId = ref<string | null>(null)
const itemForm = reactive({
  icon: '',
  title_fr: '',
  title_en: '',
  title_ar: '',
  description_fr: '',
  description_en: '',
  description_ar: '',
  display_order: 0,
  is_active: true,
})

// Delete item
const showDeleteModal = ref(false)
const deletingItemId = ref<string | null>(null)
const isDeleting = ref(false)

const isSubmitting = ref(false)

// === DATA FETCHING ===

async function fetchSections() {
  isLoading.value = true
  error.value = null
  try {
    sections.value = await listEditorialSections()
    // Expand all by default
    if (expandedSections.value.length === 0) {
      expandedSections.value = sections.value.map(s => s.id)
    }
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors du chargement des sections'
  } finally {
    isLoading.value = false
  }
}

// === SECTION ACTIONS ===

function toggleSection(sectionId: string) {
  const idx = expandedSections.value.indexOf(sectionId)
  if (idx === -1) {
    expandedSections.value.push(sectionId)
  } else {
    expandedSections.value.splice(idx, 1)
  }
}

function openSectionEdit(section: EditorialSectionRead) {
  editingSectionId.value = section.id
  sectionForm.title_fr = section.title_fr
  sectionForm.title_en = section.title_en || ''
  sectionForm.title_ar = section.title_ar || ''
  showSectionModal.value = true
}

async function saveSectionTitle() {
  if (!editingSectionId.value) return
  isSubmitting.value = true
  try {
    await updateSection(editingSectionId.value, {
      title_fr: sectionForm.title_fr,
      title_en: sectionForm.title_en || null,
      title_ar: sectionForm.title_ar || null,
    })
    showSectionModal.value = false
    await fetchSections()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la mise à jour de la section'
  } finally {
    isSubmitting.value = false
  }
}

// === ITEM ACTIONS ===

function openItemCreate(sectionId: string) {
  editingItemId.value = null
  editingItemSectionId.value = sectionId
  itemForm.icon = 'fa-solid fa-star'
  itemForm.title_fr = ''
  itemForm.title_en = ''
  itemForm.title_ar = ''
  itemForm.description_fr = ''
  itemForm.description_en = ''
  itemForm.description_ar = ''
  itemForm.display_order = 0
  itemForm.is_active = true
  showItemModal.value = true
}

function openItemEdit(sectionId: string, item: EditorialItemRead) {
  editingItemId.value = item.id
  editingItemSectionId.value = sectionId
  itemForm.icon = item.icon
  itemForm.title_fr = item.title_fr
  itemForm.title_en = item.title_en || ''
  itemForm.title_ar = item.title_ar || ''
  itemForm.description_fr = item.description_fr
  itemForm.description_en = item.description_en || ''
  itemForm.description_ar = item.description_ar || ''
  itemForm.display_order = item.display_order
  itemForm.is_active = item.is_active
  showItemModal.value = true
}

async function saveItem() {
  if (!editingItemSectionId.value) return
  isSubmitting.value = true
  try {
    const data = {
      icon: itemForm.icon,
      title_fr: itemForm.title_fr,
      title_en: itemForm.title_en || null,
      title_ar: itemForm.title_ar || null,
      description_fr: itemForm.description_fr,
      description_en: itemForm.description_en || null,
      description_ar: itemForm.description_ar || null,
      display_order: itemForm.display_order,
      is_active: itemForm.is_active,
    }

    if (editingItemId.value) {
      await updateItem(editingItemId.value, data)
    } else {
      await createItem(editingItemSectionId.value, data)
    }
    showItemModal.value = false
    await fetchSections()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la sauvegarde de l\'élément'
  } finally {
    isSubmitting.value = false
  }
}

function confirmDeleteItem(itemId: string) {
  deletingItemId.value = itemId
  showDeleteModal.value = true
}

async function executeDeleteItem() {
  if (!deletingItemId.value) return
  isDeleting.value = true
  try {
    await apiDeleteItem(deletingItemId.value)
    showDeleteModal.value = false
    deletingItemId.value = null
    await fetchSections()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la suppression'
  } finally {
    isDeleting.value = false
  }
}

// Language tab for item modal
const itemLang = ref<'fr' | 'en' | 'ar'>('fr')

const langTabs = [
  { key: 'fr', label: 'Français' },
  { key: 'en', label: 'English' },
  { key: 'ar', label: 'العربية' },
] as const

// === INIT ===

onMounted(() => {
  fetchSections()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Sections éditoriales - Levées de fonds
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Gérez les sections et éléments affichés sur la page publique des levées de fonds
      </p>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
      <i class="fa-solid fa-circle-exclamation mr-2" />
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-brand-blue-500" />
    </div>

    <!-- Sections -->
    <div v-else class="space-y-4">
      <div
        v-for="section in sections"
        :key="section.id"
        class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden"
      >
        <!-- Section header -->
        <div
          class="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          @click="toggleSection(section.id)"
        >
          <div class="flex items-center gap-3">
            <i
              class="fa-solid fa-chevron-right text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-90': expandedSections.includes(section.id) }"
            />
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ section.title_fr }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ section.slug }} - {{ section.items.length }} élément{{ section.items.length > 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-brand-blue-50 hover:border-brand-blue-300 hover:text-brand-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-brand-blue-900/30 dark:hover:border-brand-blue-500 dark:hover:text-brand-blue-400 transition-colors"
              title="Modifier le titre de la section"
              @click.stop="openSectionEdit(section)"
            >
              <i class="fa-solid fa-pen text-[10px]" />
              Modifier le titre
            </button>
          </div>
        </div>

        <!-- Section items -->
        <div v-show="expandedSections.includes(section.id)" class="border-t border-gray-200 dark:border-gray-700">
          <div v-if="section.items.length" class="divide-y divide-gray-100 dark:divide-gray-700">
            <div
              v-for="item in section.items"
              :key="item.id"
              class="flex items-center justify-between px-6 py-3"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                  <i :class="item.icon" class="text-sm text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.title_fr }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {{ item.description_fr }}
                  </p>
                </div>
                <span
                  v-if="!item.is_active"
                  class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                >
                  Inactif
                </span>
              </div>
              <div class="flex items-center gap-1">
                <span class="mr-2 text-xs text-gray-400">{{ item.display_order }}</span>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-brand-blue-400 transition-colors"
                  title="Modifier"
                  @click="openItemEdit(section.id, item)"
                >
                  <i class="fa-solid fa-pen-to-square text-xs" />
                </button>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                  title="Supprimer"
                  @click="confirmDeleteItem(item.id)"
                >
                  <i class="fa-solid fa-trash text-xs" />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucun élément dans cette section
          </div>

          <!-- Add item button -->
          <div class="border-t border-gray-100 px-6 py-3 dark:border-gray-700">
            <button
              type="button"
              class="inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400 dark:hover:text-brand-blue-300"
              @click="openItemCreate(section.id)"
            >
              <i class="fa-solid fa-plus" />
              Ajouter un élément
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!sections.length && !isLoading" class="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
        <i class="fa-solid fa-sliders text-4xl text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Aucune section éditoriale trouvée</p>
      </div>
    </div>

    <!-- Section Edit Modal -->
    <Teleport to="body">
      <div v-if="showSectionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showSectionModal = false" />
        <div class="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Modifier le titre de la section
          </h3>
          <div class="space-y-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Français</label>
              <input
                v-model="sectionForm.title_fr"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">English</label>
              <input
                v-model="sectionForm.title_en"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">العربية</label>
              <input
                v-model="sectionForm.title_ar"
                type="text"
                dir="rtl"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showSectionModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="isSubmitting"
              class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
              @click="saveSectionTitle"
            >
              <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Item Edit/Create Modal -->
    <Teleport to="body">
      <div v-if="showItemModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showItemModal = false" />
        <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingItemId ? 'Modifier l\'élément' : 'Nouvel élément' }}
          </h3>

          <div class="space-y-4">
            <!-- Icon + Order + Active -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Icône (FontAwesome)</label>
                <input
                  v-model="itemForm.icon"
                  type="text"
                  placeholder="fa-solid fa-star"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ordre d'affichage</label>
                <input
                  v-model.number="itemForm.display_order"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div class="flex items-end">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    v-model="itemForm.is_active"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500"
                  >
                  Actif
                </label>
              </div>
            </div>

            <!-- Language tabs -->
            <div class="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
              <button
                v-for="tab in langTabs"
                :key="tab.key"
                type="button"
                :class="itemLang === tab.key
                  ? 'bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
                class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                @click="itemLang = tab.key"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- FR -->
            <div v-show="itemLang === 'fr'" class="space-y-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre (FR)</label>
                <input
                  v-model="itemForm.title_fr"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description (FR)</label>
                <textarea
                  v-model="itemForm.description_fr"
                  rows="3"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <!-- EN -->
            <div v-show="itemLang === 'en'" class="space-y-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title (EN)</label>
                <input
                  v-model="itemForm.title_en"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description (EN)</label>
                <textarea
                  v-model="itemForm.description_en"
                  rows="3"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <!-- AR -->
            <div v-show="itemLang === 'ar'" class="space-y-3" dir="rtl">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">العنوان (AR)</label>
                <input
                  v-model="itemForm.title_ar"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف (AR)</label>
                <textarea
                  v-model="itemForm.description_ar"
                  rows="3"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showItemModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="isSubmitting"
              class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
              @click="saveItem"
            >
              <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin" />
              {{ editingItemId ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Item Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showDeleteModal = false" />
        <div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Confirmer la suppression
          </h3>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="isDeleting"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              @click="executeDeleteItem"
            >
              <i v-if="isDeleting" class="fa-solid fa-spinner fa-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
