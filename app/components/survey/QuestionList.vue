<script setup lang="ts">
interface QuestionChoice {
  value: string
  text: { fr: string; en?: string; ar?: string }
}

interface SurveyQuestion {
  type: string
  name: string
  title: { fr: string; en?: string; ar?: string }
  isRequired: boolean
  choices?: QuestionChoice[]
  inputType?: string
  rateCount?: number
  validators?: Array<{ type: string; [key: string]: any }>
}

const props = defineProps<{
  modelValue: SurveyQuestion[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SurveyQuestion[]]
}>()

const editingIndex = ref<number | null>(null)

const typeIcons: Record<string, string> = {
  text: 'T',
  comment: '¶',
  radiogroup: '◉',
  checkbox: '☑',
  dropdown: '▾',
  tagbox: '⊞',
  rating: '★',
  file: '📎',
  boolean: '⊘',
}

const typeLabels: Record<string, string> = {
  text: 'Texte',
  comment: 'Texte long',
  radiogroup: 'Choix unique',
  checkbox: 'Choix multiples',
  dropdown: 'Liste déroulante',
  tagbox: 'Tags',
  rating: 'Notation',
  file: 'Fichier',
  boolean: 'Oui/Non',
}

function getTypeLabel(q: SurveyQuestion): string {
  if (q.type === 'text' && q.inputType === 'date') return 'Date'
  return typeLabels[q.type] || q.type
}

function getTypeIcon(q: SurveyQuestion): string {
  if (q.type === 'text' && q.inputType === 'date') return '📅'
  return typeIcons[q.type] || '?'
}

function addQuestion() {
  const idx = props.modelValue.length + 1
  const newQuestion: SurveyQuestion = {
    type: 'text',
    name: `question${idx}`,
    title: { fr: '' },
    isRequired: false,
  }
  const updated = [...props.modelValue, newQuestion]
  emit('update:modelValue', updated)
  editingIndex.value = updated.length - 1
}

function removeQuestion(index: number) {
  const updated = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', updated)
  if (editingIndex.value === index) editingIndex.value = null
  else if (editingIndex.value !== null && editingIndex.value > index) editingIndex.value--
}

function moveUp(index: number) {
  if (index <= 0) return
  const updated = [...props.modelValue]
  ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
  emit('update:modelValue', updated)
  if (editingIndex.value === index) editingIndex.value = index - 1
  else if (editingIndex.value === index - 1) editingIndex.value = index
}

function moveDown(index: number) {
  if (index >= props.modelValue.length - 1) return
  const updated = [...props.modelValue]
  ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
  emit('update:modelValue', updated)
  if (editingIndex.value === index) editingIndex.value = index + 1
  else if (editingIndex.value === index + 1) editingIndex.value = index
}

function updateQuestion(index: number, value: SurveyQuestion) {
  const updated = [...props.modelValue]
  updated[index] = value
  emit('update:modelValue', updated)
}

function toggleEdit(index: number) {
  editingIndex.value = editingIndex.value === index ? null : index
}
</script>

<template>
  <div class="space-y-3">
    <!-- Liste des questions -->
    <div
      v-for="(question, index) in modelValue"
      :key="index"
      class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <!-- En-tête de la question (toujours visible) -->
      <div
        class="flex cursor-pointer items-center gap-3 px-4 py-3"
        @click="toggleEdit(index)"
      >
        <!-- Numéro + Type -->
        <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue-100 text-sm font-medium text-brand-blue-700 dark:bg-brand-blue-900/30 dark:text-brand-blue-300">
          {{ index + 1 }}
        </span>
        <span class="flex-shrink-0 text-lg" :title="getTypeLabel(question)">{{ getTypeIcon(question) }}</span>

        <!-- Titre -->
        <div class="min-w-0 flex-1">
          <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
            {{ question.title.fr || '(sans titre)' }}
          </span>
          <span class="ml-2 text-xs text-gray-500">{{ getTypeLabel(question) }}</span>
          <span v-if="question.isRequired" class="ml-1 text-xs text-red-500">*</span>
        </div>

        <!-- Actions -->
        <div class="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            :disabled="index === 0"
            title="Monter"
            @click.stop="moveUp(index)"
          >
            ↑
          </button>
          <button
            type="button"
            class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            :disabled="index === modelValue.length - 1"
            title="Descendre"
            @click.stop="moveDown(index)"
          >
            ↓
          </button>
          <button
            type="button"
            class="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
            title="Supprimer"
            @click.stop="removeQuestion(index)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Édition inline (QuestionBuilder) -->
      <div v-if="editingIndex === index" class="border-t border-gray-200 p-4 dark:border-gray-700">
        <SurveyQuestionBuilder
          :model-value="question"
          @update:model-value="updateQuestion(index, $event)"
          @close="editingIndex = null"
        />
      </div>
    </div>

    <!-- Bouton d'ajout -->
    <button
      type="button"
      class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:border-brand-blue-400 hover:text-brand-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-brand-blue-500 dark:hover:text-brand-blue-400"
      @click="addQuestion"
    >
      + Ajouter une question
    </button>

    <!-- Message si vide -->
    <p v-if="modelValue.length === 0" class="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
      Aucune question ajoutée. Cliquez sur le bouton ci-dessus pour commencer.
    </p>
  </div>
</template>
