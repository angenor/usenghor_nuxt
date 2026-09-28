<script setup lang="ts">
/**
 * En-tête des sections d'un service : icône, titre, compteur, description courte
 * et bouton « + Ajouter … ».
 */
withDefaults(defineProps<{
  icon: string
  title: string
  description: string
  addLabel: string
  count?: number | null
  /** Classes de la pastille d'icône (couleur de la section) */
  tone?: string
  headingId?: string
  addDisabled?: boolean
}>(), {
  count: null,
  tone: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  headingId: undefined,
  addDisabled: false,
})

const emit = defineEmits<{
  add: []
}>()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="flex min-w-0 items-start gap-3">
      <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" :class="tone">
        <font-awesome-icon :icon="['fas', icon]" class="h-5 w-5" aria-hidden="true" />
      </div>
      <div class="min-w-0">
        <h2 :id="headingId" class="flex flex-wrap items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
          <span
            v-if="count !== null"
            class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {{ count }}
          </span>
        </h2>
        <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {{ description }}
        </p>
      </div>
    </div>
    <button
      type="button"
      class="inline-flex flex-shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-900"
      :disabled="addDisabled"
      @click="emit('add')"
    >
      <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
      {{ addLabel }}
    </button>
  </div>
</template>
