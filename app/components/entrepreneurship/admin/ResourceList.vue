<script setup lang="ts">
/**
 * Liste admin des ressources de la boîte à outils PEI (glisser-déposer pour réordonner).
 */
import { VueDraggable } from 'vue-draggable-plus'
import type { PeiResourceAdmin, PeiResourceType } from '~/types/api/entrepreneurship'
import { resourceTypeLabels } from '~/composables/useEntrepreneurshipApi'

const props = withDefaults(defineProps<{
  items: PeiResourceAdmin[]
  loading?: boolean
  canEdit?: boolean
  canDelete?: boolean
  dragDisabled?: boolean
  categories?: string[]
}>(), {
  loading: false,
  canEdit: true,
  canDelete: false,
  dragDisabled: false,
  categories: () => [],
})

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
  togglePublish: [item: PeiResourceAdmin]
  reorder: [ids: string[]]
}>()

const typeIcons: Record<PeiResourceType, string> = {
  document: 'fa-solid fa-file',
  link: 'fa-solid fa-link',
  video: 'fa-solid fa-video',
}

const localItems = ref<PeiResourceAdmin[]>([...props.items])

watch(
  () => props.items,
  (value) => {
    localItems.value = [...value]
  },
)

function sourceHref(item: PeiResourceAdmin): string | null {
  return item.type === 'document' ? item.media_url : item.url
}

function onDragEnd() {
  emit('reorder', localItems.value.map(i => i.id))
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
    <div v-if="loading" class="flex items-center justify-center gap-2 p-8 text-sm text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin" />
      Chargement…
    </div>

    <div v-else-if="!localItems.length" class="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-toolbox" class="mb-2 text-3xl text-gray-300 dark:text-gray-600" />
      <p>Aucune ressource</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/40">
          <tr class="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <th class="w-10 px-3 py-3">
              <span class="sr-only">Ordre</span>
            </th>
            <th class="px-3 py-3">
              Titre
            </th>
            <th class="px-3 py-3">
              Type
            </th>
            <th class="px-3 py-3">
              Catégorie
            </th>
            <th class="px-3 py-3">
              Source
            </th>
            <th class="px-3 py-3">
              Statut
            </th>
            <th class="px-3 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <VueDraggable
          v-model="localItems"
          tag="tbody"
          handle=".drag-handle"
          :animation="150"
          ghost-class="opacity-30"
          :disabled="dragDisabled"
          class="divide-y divide-gray-100 dark:divide-gray-700"
          @end="onDragEnd"
        >
          <tr
            v-for="(item, index) in localItems"
            :key="item.id"
            class="text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/40"
          >
            <td class="px-3 py-3">
              <span
                :class="[
                  'drag-handle inline-flex items-center gap-2 text-gray-400',
                  dragDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-grab hover:text-gray-600 dark:hover:text-gray-200',
                ]"
                :title="dragDisabled ? 'Réordonnancement désactivé pendant une recherche ou un filtre' : 'Glisser pour réordonner'"
              >
                <font-awesome-icon icon="fa-solid fa-grip-vertical" />
                <span class="text-xs">{{ index + 1 }}</span>
              </span>
            </td>
            <td class="px-3 py-3">
              <button
                type="button"
                class="text-left font-medium text-gray-900 hover:text-brand-blue-600 dark:text-white dark:hover:text-brand-blue-400"
                @click="emit('edit', item.id)"
              >
                {{ item.title }}
              </button>
              <p v-if="item.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                {{ item.description }}
              </p>
            </td>
            <td class="whitespace-nowrap px-3 py-3">
              <span class="inline-flex items-center gap-1.5">
                <font-awesome-icon :icon="typeIcons[item.type]" class="text-gray-400" />
                {{ resourceTypeLabels[item.type] }}
              </span>
            </td>
            <td class="px-3 py-3">
              <span v-if="item.category">{{ item.category }}</span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="whitespace-nowrap px-3 py-3">
              <a
                v-if="sourceHref(item)"
                :href="sourceHref(item) ?? undefined"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-brand-blue-600 hover:underline dark:text-brand-blue-400"
              >
                Ouvrir
                <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="h-3 w-3" />
              </a>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="whitespace-nowrap px-3 py-3">
              <span
                v-if="item.is_published"
                class="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
              >
                Publiée
              </span>
              <span
                v-else
                class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Brouillon
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-right">
              <div class="inline-flex items-center gap-1">
                <button
                  v-if="canEdit"
                  type="button"
                  class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-blue-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  title="Modifier"
                  aria-label="Modifier"
                  @click="emit('edit', item.id)"
                >
                  <font-awesome-icon icon="fa-solid fa-pen" />
                </button>
                <button
                  v-if="canEdit"
                  type="button"
                  class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  :title="item.is_published ? 'Dépublier' : 'Publier'"
                  :aria-label="item.is_published ? 'Dépublier' : 'Publier'"
                  @click="emit('togglePublish', item)"
                >
                  <font-awesome-icon :icon="item.is_published ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
                </button>
                <button
                  v-if="canDelete"
                  type="button"
                  class="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20"
                  title="Supprimer"
                  aria-label="Supprimer"
                  @click="emit('delete', item.id)"
                >
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
            </td>
          </tr>
        </VueDraggable>
      </table>
    </div>
  </div>
</template>
