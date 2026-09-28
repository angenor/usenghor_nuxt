<script setup lang="ts">
/**
 * Confirmation de suppression d'un objectif, d'une réalisation ou d'un projet de service.
 */
withDefaults(defineProps<{
  open: boolean
  /** Libellé de la nature de l'élément, ex. « l'objectif » */
  itemLabel: string
  /** Titre de l'élément à supprimer */
  itemTitle?: string
  busy?: boolean
  error?: string | null
}>(), {
  itemTitle: '',
  busy: false,
  error: null,
})

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <AdminOrganisationServiceItemModal
    :open="open"
    title="Confirmer la suppression"
    size="sm"
    role="alertdialog"
    :busy="busy"
    close-on-backdrop
    @close="emit('close')"
  >
    <div class="flex items-start gap-4">
      <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
      </div>
      <div class="min-w-0 text-sm text-gray-600 dark:text-gray-300">
        <p>
          Supprimer {{ itemLabel }}
          <strong v-if="itemTitle" class="break-words font-semibold text-gray-900 dark:text-white">« {{ itemTitle }} »</strong>
          ?
        </p>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          Ses traductions seront également supprimées. Cette action est irréversible.
        </p>
        <p
          v-if="error"
          role="alert"
          class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        >
          {{ error }}
        </p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        data-autofocus
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        :disabled="busy"
        @click="emit('close')"
      >
        Annuler
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-800"
        :disabled="busy"
        @click="emit('confirm')"
      >
        <font-awesome-icon v-if="busy" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
        <font-awesome-icon v-else :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
        {{ busy ? 'Suppression…' : 'Supprimer' }}
      </button>
    </template>
  </AdminOrganisationServiceItemModal>
</template>
