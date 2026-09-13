<script setup lang="ts">
/**
 * Liste des cohortes PEI (backoffice) avec réordonnancement par glisser-déposer.
 */
import { VueDraggable } from 'vue-draggable-plus'
import type { PeiCohortAdmin, PeiCohortType } from '~/types/api/entrepreneurship'
import { cohortTypeOptions } from '~/composables/useEntrepreneurshipApi'

interface Props {
  items: PeiCohortAdmin[]
  loading?: boolean
  canEdit?: boolean
  canDelete?: boolean
  dragDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  canEdit: false,
  canDelete: false,
  dragDisabled: false,
})

const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'toggleActive', item: PeiCohortAdmin): void
  (e: 'reorder', ids: string[]): void
}>()

const localItems = ref<PeiCohortAdmin[]>([...props.items])

watch(
  () => props.items,
  (value) => {
    localItems.value = [...value]
  },
)

const typeBadgeClasses: Record<PeiCohortType, string> = {
  fse: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
  see: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
}

function typeLabel(type: PeiCohortType): string {
  return cohortTypeOptions.find(o => o.value === type)?.label ?? type
}

function truncate(text: string | null, max = 90): string {
  if (!text) return '—'
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function onDragEnd() {
  emit('reorder', localItems.value.map(i => i.id))
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
    <div v-if="loading" class="flex items-center justify-center gap-2 py-12 text-sm text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
      Chargement…
    </div>

    <div v-else-if="!localItems.length" class="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
      <font-awesome-icon icon="fa-solid fa-people-group" class="mb-2 h-6 w-6 text-gray-400" />
      <p>Aucune cohorte</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th class="w-10 px-3 py-3" />
            <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Cohorte
            </th>
            <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Année
            </th>
            <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Type
            </th>
            <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Focus
            </th>
            <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              État
            </th>
            <th class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
          class="divide-y divide-gray-200 dark:divide-gray-700"
          @end="onDragEnd"
        >
          <tr
            v-for="item in localItems"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/40"
          >
            <td class="px-3 py-3 text-gray-400">
              <span
                class="drag-handle inline-flex p-1"
                :class="dragDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-move hover:text-gray-600 dark:hover:text-gray-200'"
                :title="dragDisabled ? 'Réinitialisez la recherche et les filtres pour réordonner' : 'Glisser pour réordonner'"
              >
                <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
              </span>
            </td>
            <td class="px-3 py-3 text-sm">
              <button
                type="button"
                class="text-left font-medium text-gray-900 hover:text-brand-blue-600 dark:text-white dark:hover:text-brand-blue-400"
                @click="emit('edit', item.id)"
              >
                {{ item.label }}
              </button>
              <div class="font-mono text-xs text-gray-500 dark:text-gray-400">
                {{ item.code }}
              </div>
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
              {{ item.year }}
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-sm">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="typeBadgeClasses[item.type]"
              >
                {{ typeLabel(item.type) }}
              </span>
            </td>
            <td class="max-w-xs px-3 py-3 text-sm text-gray-600 dark:text-gray-400" :title="item.focus ?? ''">
              {{ truncate(item.focus) }}
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-sm">
              <span
                v-if="item.active"
                class="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
              >
                Actif
              </span>
              <span
                v-else
                class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                Inactif
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-right text-sm">
              <div class="inline-flex items-center gap-1">
                <button
                  type="button"
                  class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-brand-blue-400"
                  title="Modifier"
                  aria-label="Modifier"
                  @click="emit('edit', item.id)"
                >
                  <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
                </button>
                <button
                  v-if="canEdit"
                  type="button"
                  class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-amber-400"
                  :title="item.active ? 'Désactiver' : 'Activer'"
                  :aria-label="item.active ? 'Désactiver' : 'Activer'"
                  @click="emit('toggleActive', item)"
                >
                  <font-awesome-icon :icon="item.active ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" class="h-4 w-4" />
                </button>
                <button
                  v-if="canDelete"
                  type="button"
                  class="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  title="Supprimer"
                  aria-label="Supprimer"
                  @click="emit('delete', item.id)"
                >
                  <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </VueDraggable>
      </table>
    </div>
  </div>
</template>
