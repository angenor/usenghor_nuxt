<script setup lang="ts">
import type { CoreValue } from '~/types/api'

const props = defineProps<{
  show: boolean
  editingValue: CoreValue | null
  isSaving: boolean
  availableIcons: Array<{ value: string, label: string }>
}>()

const emit = defineEmits<{
  close: []
  save: [data: { title: string, description: string, icon: string, is_active: boolean }]
}>()

const {
  validateCoreValueTitle,
  validateCoreValueDescription,
  isCoreValueTitleTaken: apiIsCoreValueTitleTaken,
} = useEditorialValuesApi()

const form = ref({
  title: '',
  description: '',
  icon: 'star',
  is_active: true,
})

const formErrors = ref<Record<string, string>>({})

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.editingValue) {
      form.value = {
        title: props.editingValue.title,
        description: props.editingValue.description,
        icon: props.editingValue.icon,
        is_active: props.editingValue.is_active,
      }
    }
    else {
      form.value = {
        title: '',
        description: '',
        icon: 'star',
        is_active: true,
      }
    }
    formErrors.value = {}
  }
})

async function validateForm(): Promise<boolean> {
  formErrors.value = {}

  if (!form.value.title.trim()) {
    formErrors.value.title = 'Le titre est requis'
  }
  else if (!validateCoreValueTitle(form.value.title)) {
    formErrors.value.title = 'Le titre doit contenir entre 2 et 50 caractères'
  }
  else {
    const isTaken = await apiIsCoreValueTitleTaken(form.value.title, props.editingValue?.id)
    if (isTaken) {
      formErrors.value.title = 'Ce titre est déjà utilisé'
    }
  }

  if (!form.value.description.trim()) {
    formErrors.value.description = 'La description est requise'
  }
  else if (!validateCoreValueDescription(form.value.description)) {
    formErrors.value.description = 'La description doit contenir entre 10 et 500 caractères'
  }

  return Object.keys(formErrors.value).length === 0
}

async function handleSubmit() {
  const isValid = await validateForm()
  if (!isValid) return
  emit('save', { ...form.value })
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="handleClose"
    >
      <div class="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-800">
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingValue ? 'Modifier la valeur' : 'Ajouter une valeur' }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            @click="handleClose"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-4 p-6" @submit.prevent="handleSubmit">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre *
            </label>
            <input
              v-model="form.title"
              type="text"
              placeholder="ex: Excellence"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': formErrors.title }"
            />
            <p v-if="formErrors.title" class="mt-1 text-sm text-red-500">
              {{ formErrors.title }}
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description *
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Description de la valeur..."
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': formErrors.description }"
            />
            <p v-if="formErrors.description" class="mt-1 text-sm text-red-500">
              {{ formErrors.description }}
            </p>
            <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ form.description.length }}/500 caractères
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Icône
            </label>
            <div class="grid grid-cols-8 gap-2">
              <button
                v-for="iconOption in availableIcons"
                :key="iconOption.value"
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors"
                :class="form.icon === iconOption.value
                  ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-400'"
                :title="iconOption.label"
                @click="form.icon = iconOption.value"
              >
                <font-awesome-icon :icon="['fas', iconOption.value]" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <input
              id="is_active"
              v-model="form.is_active"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 bg-white text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label for="is_active" class="text-sm text-gray-700 dark:text-gray-300">
              Valeur active (visible sur le site public)
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              @click="handleClose"
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
</template>
