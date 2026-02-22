<script setup lang="ts">
import type { EditorialContentRead } from '~/types/api'
import type { FrontOfficePage, PageSection, PageSectionField } from '~/composables/editorial-pages-config'

const props = defineProps<{
  pages: FrontOfficePage[]
  allContents: Map<string, EditorialContentRead>
  isSaving: boolean
}>()

const emit = defineEmits<{
  saveField: [key: string, value: string, valueType: 'text' | 'number' | 'html']
  openHistory: [field: PageSectionField]
}>()

const selectedPageId = ref<string | null>(null)
const expandedSections = ref<Set<string>>(new Set())
const editingFieldKey = ref<string | null>(null)

// Page sélectionnée dérivée des props (réactive aux changements de noms de sections)
const selectedPage = computed(() =>
  props.pages.find(p => p.id === selectedPageId.value) ?? null,
)

// Sélectionner la première page par défaut
onMounted(() => {
  if (props.pages.length > 0) {
    selectedPageId.value = props.pages[0]?.id ?? null
  }
})

const toggleSection = (sectionId: string) => {
  if (expandedSections.value.has(sectionId)) {
    expandedSections.value.delete(sectionId)
  }
  else {
    expandedSections.value.add(sectionId)
  }
}

const isSectionExpanded = (sectionId: string) => {
  return expandedSections.value.has(sectionId)
}

const countEditableFields = (pageSection: PageSection) => {
  return pageSection.fields.filter(f => f.editable).length
}

const getFieldValue = (field: PageSectionField): string => {
  if (!field.editorialKey) return ''
  const content = props.allContents.get(field.editorialKey)
  return content?.value || ''
}

function startEditingField(field: PageSectionField) {
  if (!field.editorialKey) return
  editingFieldKey.value = field.editorialKey
}

function cancelEditingField() {
  editingFieldKey.value = null
}

function handleSaveField(field: PageSectionField, value: string, valueType: 'text' | 'number' | 'html') {
  if (!field.editorialKey) return
  emit('saveField', field.editorialKey, value, valueType)
  editingFieldKey.value = null
}

function handleFieldHistory(field: PageSectionField) {
  emit('openHistory', field)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page selector -->
    <div v-if="pages.length > 1" class="flex gap-2 flex-wrap">
      <button
        v-for="page in pages"
        :key="page.id"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
        :class="selectedPage?.id === page.id
          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'"
        @click="selectedPageId = page.id"
      >
        <font-awesome-icon :icon="['fas', page.icon]" class="h-4 w-4" />
        {{ page.name }}
      </button>
    </div>

    <!-- Selected page info -->
    <div v-if="selectedPage" class="space-y-4">
      <div class="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40">
            <font-awesome-icon :icon="['fas', selectedPage.icon]" class="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 class="font-semibold text-primary-900 dark:text-primary-100">{{ selectedPage.name }}</h3>
            <p class="text-sm text-primary-700 dark:text-primary-300">{{ selectedPage.description }}</p>
            <p class="text-xs text-primary-600 dark:text-primary-400 mt-1">
              URL : <code class="bg-primary-100 dark:bg-primary-900/40 px-1 rounded">{{ selectedPage.slug }}</code>
            </p>
          </div>
        </div>
      </div>

      <!-- Sections list -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Sections de la page
        </h3>

        <div class="space-y-3">
          <div
            v-for="pageSection in selectedPage.sections"
            :key="pageSection.id"
            class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden"
          >
            <!-- Section header -->
            <button
              class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              @click="toggleSection(pageSection.id)"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-lg"
                  :class="pageSection.color"
                >
                  <font-awesome-icon :icon="['fas', pageSection.icon]" class="h-5 w-5" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ pageSection.name }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ pageSection.description }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {{ countEditableFields(pageSection) }} champ(s)
                </span>
                <font-awesome-icon
                  :icon="['fas', isSectionExpanded(pageSection.id) ? 'chevron-up' : 'chevron-down']"
                  class="h-4 w-4 text-gray-400"
                />
              </div>
            </button>

            <!-- Section content (expanded) -->
            <div
              v-if="isSectionExpanded(pageSection.id)"
              class="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50"
            >
              <div class="space-y-3">
                <AdminEditorialSectionField
                  v-for="field in pageSection.fields"
                  :key="field.key"
                  :field="field"
                  :value="getFieldValue(field)"
                  :is-editing="editingFieldKey === field.editorialKey"
                  :is-saving="isSaving"
                  @edit="startEditingField(field)"
                  @cancel="cancelEditingField"
                  @save="(value, valueType) => handleSaveField(field, value, valueType)"
                  @history="handleFieldHistory(field)"
                />
              </div>
              <!-- Slot pour contenu supplémentaire par section -->
              <slot :name="`section-${pageSection.id}`" :section="pageSection" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
