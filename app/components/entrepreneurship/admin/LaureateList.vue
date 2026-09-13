<script setup lang="ts">
/**
 * Liste des portraits PEI (lauréats FSE / étudiants-entrepreneurs) avec
 * réordonnancement par glisser-déposer au sein d'une cohorte.
 */
import { VueDraggable } from 'vue-draggable-plus'
import type { PeiLaureateAdmin, PeiLaureateType } from '~/types/api/entrepreneurship'
import { laureateTypeLabels } from '~/composables/useEntrepreneurshipApi'

interface Props {
  items: PeiLaureateAdmin[]
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
  (e: 'togglePublish', item: PeiLaureateAdmin): void
  (e: 'toggleFeatured', item: PeiLaureateAdmin): void
  (e: 'reorder', ids: string[]): void
}>()

const { getMediaUrl } = useMediaApi()

const localItems = ref<PeiLaureateAdmin[]>([...props.items])

watch(
  () => props.items,
  (value) => {
    localItems.value = [...value]
  },
)

const typeBadgeClasses: Record<PeiLaureateType, string> = {
  fse_laureate: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
  student_entrepreneur: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
}

function thumbnail(item: PeiLaureateAdmin): string | null {
  return getMediaUrl(item.photo_external_id, 'low') ?? item.photo_url
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

async function onDragEnd() {
  await nextTick()
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
      <font-awesome-icon icon="fa-solid fa-award" class="mb-2 h-6 w-6 text-gray-400" />
      <p>Aucun portrait</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th class="w-10 px-3 py-3" />
            <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Portrait
            </th>
            <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Cohorte
            </th>
            <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Type
            </th>
            <th class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Mis en avant
            </th>
            <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Publication
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
                :title="dragDisabled ? 'Filtrez sur une seule cohorte, sans autre filtre, pour réordonner' : 'Glisser pour réordonner'"
              >
                <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
              </span>
            </td>
            <td class="px-3 py-3 text-sm">
              <div class="flex items-center gap-3">
                <img
                  v-if="thumbnail(item)"
                  :src="thumbnail(item)!"
                  :alt="item.full_name"
                  class="h-10 w-10 shrink-0 rounded-full object-cover"
                  loading="lazy"
                >
                <span
                  v-else
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                >
                  {{ initial(item.full_name) }}
                </span>
                <div class="min-w-0">
                  <button
                    type="button"
                    class="text-left font-medium text-gray-900 hover:text-brand-blue-600 dark:text-white dark:hover:text-brand-blue-400"
                    @click="emit('edit', item.id)"
                  >
                    {{ item.full_name }}
                  </button>
                  <div class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ item.project_name }}
                  </div>
                </div>
              </div>
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-sm">
              <span
                class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                :title="item.cohort.active ? '' : 'Cohorte inactive'"
              >
                {{ item.cohort.label }}
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-sm">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="typeBadgeClasses[item.type]"
              >
                {{ laureateTypeLabels[item.type] }}
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-center text-sm">
              <button
                v-if="canEdit"
                type="button"
                class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                :class="item.is_featured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500 dark:text-gray-600'"
                :title="item.is_featured ? 'Retirer la mise en avant' : 'Mettre en avant'"
                :aria-label="item.is_featured ? 'Retirer la mise en avant' : 'Mettre en avant'"
                :aria-pressed="item.is_featured"
                @click="emit('toggleFeatured', item)"
              >
                <font-awesome-icon icon="fa-solid fa-star" class="h-4 w-4" />
              </button>
              <font-awesome-icon
                v-else-if="item.is_featured"
                icon="fa-solid fa-star"
                class="h-4 w-4 text-amber-500"
                title="Mis en avant"
              />
            </td>
            <td class="whitespace-nowrap px-3 py-3 text-sm">
              <component
                :is="canEdit ? 'button' : 'span'"
                :type="canEdit ? 'button' : undefined"
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                :class="item.is_published
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
                :title="canEdit ? (item.is_published ? 'Dépublier' : 'Publier') : undefined"
                @click="canEdit && emit('togglePublish', item)"
              >
                {{ item.is_published ? 'Publié' : 'Brouillon' }}
              </component>
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
