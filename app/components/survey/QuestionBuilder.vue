<script setup lang="ts">
const { t } = useI18n()

interface SurveyQuestion {
  type: string
  name: string
  title: { fr: string; en?: string; ar?: string }
  isRequired: boolean
  choices?: Array<{ value: string; text: { fr: string; en?: string; ar?: string } }>
  inputType?: string
  rateCount?: number
  validators?: Array<{ type: string; [key: string]: any }>
}

const props = defineProps<{
  modelValue: SurveyQuestion
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SurveyQuestion]
  close: []
}>()

const questionTypes = [
  { value: 'text', label: 'Texte court', icon: 'T' },
  { value: 'comment', label: 'Texte long', icon: '¶' },
  { value: 'radiogroup', label: 'Choix unique', icon: '◉' },
  { value: 'checkbox', label: 'Choix multiples', icon: '☑' },
  { value: 'dropdown', label: 'Liste déroulante', icon: '▾' },
  { value: 'tagbox', label: 'Tags (multi-select)', icon: '⊞' },
  { value: 'rating', label: 'Notation', icon: '★' },
  { value: 'file', label: 'Fichier', icon: '📎' },
  { value: 'boolean', label: 'Oui/Non', icon: '⊘' },
  { value: 'text-date', label: 'Date', icon: '📅' },
]

const choiceTypes = ['radiogroup', 'checkbox', 'dropdown', 'tagbox']

const question = reactive<SurveyQuestion>({ ...props.modelValue })

// Sync quand le parent change
watch(() => props.modelValue, (val) => {
  Object.assign(question, val)
}, { deep: true })

const hasChoices = computed(() => choiceTypes.includes(question.type))

function setType(type: string) {
  if (type === 'text-date') {
    question.type = 'text'
    question.inputType = 'date'
  } else {
    question.type = type
    question.inputType = undefined
  }
  if (hasChoices.value && (!question.choices || question.choices.length === 0)) {
    question.choices = [{ value: 'option1', text: { fr: 'Option 1' } }]
  }
  emitUpdate()
}

function addChoice() {
  if (!question.choices) question.choices = []
  const idx = question.choices.length + 1
  question.choices.push({ value: `option${idx}`, text: { fr: `Option ${idx}` } })
  emitUpdate()
}

function removeChoice(index: number) {
  question.choices?.splice(index, 1)
  emitUpdate()
}

function emitUpdate() {
  const output: SurveyQuestion = {
    type: question.type,
    name: question.name,
    title: { ...question.title },
    isRequired: question.isRequired,
  }
  if (question.inputType) output.inputType = question.inputType
  if (hasChoices.value && question.choices) {
    output.choices = question.choices.map(c => ({ ...c, text: { ...c.text } }))
  }
  if (question.type === 'rating') {
    output.rateCount = question.rateCount || 5
  }
  emit('update:modelValue', output)
}

const selectedTypeLabel = computed(() => {
  if (question.type === 'text' && question.inputType === 'date') return 'Date'
  return questionTypes.find(t => t.value === question.type)?.label || question.type
})
</script>

<template>
  <div class="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
    <!-- Type de question -->
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type de question</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="qt in questionTypes"
          :key="qt.value"
          type="button"
          :class="[
            'rounded-lg border px-3 py-1.5 text-sm transition-colors',
            (question.type === qt.value || (qt.value === 'text-date' && question.type === 'text' && question.inputType === 'date'))
              ? 'border-brand-blue-500 bg-brand-blue-50 text-brand-blue-700 dark:border-brand-blue-400 dark:bg-brand-blue-900/30 dark:text-brand-blue-300'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300',
          ]"
          @click="setType(qt.value)"
        >
          <span class="mr-1">{{ qt.icon }}</span> {{ qt.label }}
        </button>
      </div>
    </div>

    <!-- Nom technique -->
    <div>
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Identifiant technique</label>
      <input
        v-model="question.name"
        type="text"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        placeholder="ex: nom_complet, email, satisfaction"
        @input="emitUpdate"
      >
    </div>

    <!-- Titre trilingue -->
    <div class="grid gap-3 md:grid-cols-3">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre FR *</label>
        <input
          v-model="question.title.fr"
          type="text"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @input="emitUpdate"
        >
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre EN</label>
        <input
          v-model="question.title.en"
          type="text"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @input="emitUpdate"
        >
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre AR</label>
        <input
          v-model="question.title.ar"
          type="text"
          dir="rtl"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @input="emitUpdate"
        >
      </div>
    </div>

    <!-- Obligatoire -->
    <div class="flex items-center gap-2">
      <input
        id="isRequired"
        v-model="question.isRequired"
        type="checkbox"
        class="h-4 w-4 rounded border-gray-300 text-blue-600"
        @change="emitUpdate"
      >
      <label for="isRequired" class="text-sm text-gray-700 dark:text-gray-300">Question obligatoire</label>
    </div>

    <!-- Notation : nombre d'étoiles -->
    <div v-if="question.type === 'rating'">
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de niveaux</label>
      <input
        v-model.number="question.rateCount"
        type="number"
        min="2"
        max="10"
        class="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        @input="emitUpdate"
      >
    </div>

    <!-- Choix (pour les types à choix) -->
    <div v-if="hasChoices" class="space-y-2">
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Options</label>
      <div
        v-for="(choice, idx) in question.choices"
        :key="idx"
        class="flex items-center gap-2"
      >
        <input
          v-model="choice.value"
          type="text"
          placeholder="Valeur"
          class="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @input="emitUpdate"
        >
        <input
          v-model="choice.text.fr"
          type="text"
          placeholder="Libellé FR"
          class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @input="emitUpdate"
        >
        <input
          v-model="choice.text.en"
          type="text"
          placeholder="EN"
          class="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @input="emitUpdate"
        >
        <input
          v-model="choice.text.ar"
          type="text"
          placeholder="AR"
          dir="rtl"
          class="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          @input="emitUpdate"
        >
        <button
          type="button"
          class="text-red-500 hover:text-red-700"
          @click="removeChoice(idx)"
        >
          ✕
        </button>
      </div>
      <button
        type="button"
        class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
        @click="addChoice"
      >
        + Ajouter une option
      </button>
    </div>

    <!-- Actions -->
    <div class="flex justify-end">
      <button
        type="button"
        class="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
        @click="emit('close')"
      >
        Fermer
      </button>
    </div>
  </div>
</template>
