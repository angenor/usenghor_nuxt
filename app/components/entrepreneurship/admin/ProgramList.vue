<script setup lang="ts">
/**
 * Liste admin des dispositifs du parcours PEI (tableau réordonnable par glisser-déposer).
 */
import { VueDraggable } from 'vue-draggable-plus'
import type { PeiColor, PeiProgramAdmin } from '~/types/api/entrepreneurship'
import { colorOptions, programPhaseLabels } from '~/composables/useEntrepreneurshipApi'

const props = withDefaults(defineProps<{
  items: PeiProgramAdmin[]
  loading?: boolean
  canEdit?: boolean
  canDelete?: boolean
  dragDisabled?: boolean
}>(), {
  loading: false,
  canEdit: false,
  canDelete: false,
  dragDisabled: false,
})

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
  toggleActive: [item: PeiProgramAdmin]
  reorder: [ids: string[]]
}>()

const localItems = ref<PeiProgramAdmin[]>([...props.items])

watch(
  () => props.items,
  (items) => {
    localItems.value = [...items]
  },
)

const isDragDisabled = computed(() => props.dragDisabled || !props.canEdit)

function swatchClass(color: PeiColor): string {
  return colorOptions.find(option => option.value === color)?.swatchClass ?? 'bg-gray-400'
}

function colorLabel(color: PeiColor): string {
  return colorOptions.find(option => option.value === color)?.label ?? color
}

function onDragEnd() {
  // Laisser vue-draggable-plus appliquer le déplacement au v-model avant d'émettre l'ordre
  nextTick(() => {
    emit('reorder', localItems.value.map(item => item.id))
  })
}
</script>

<template>
  <div>
    <div
      v-if="loading && !localItems.length"
      class="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-12 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      <font-awesome-icon icon="fa-solid fa-spinner" class="mr-2 animate-spin" />
      Chargement des dispositifs…
    </div>

    <div
      v-else-if="!localItems.length"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-12 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      <font-awesome-icon icon="fa-solid fa-route" class="mb-3 text-3xl text-gray-300 dark:text-gray-600" />
      Aucun dispositif
    </div>

    <div
      v-else
      class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      :class="{ 'opacity-60': loading }"
    >
      <p
        v-if="dragDisabled && canEdit"
        class="border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400"
      >
        <font-awesome-icon icon="fa-solid fa-circle-info" class="mr-1" />
        Le glisser-déposer est désactivé tant qu'une recherche ou un filtre est actif.
      </p>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th scope="col" class="w-10 px-3 py-3">
                <span class="sr-only">Déplacer</span>
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                N°
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Dispositif
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Phase
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Chiffre mis en avant
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                État
              </th>
              <th scope="col" class="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
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
            :disabled="isDragDisabled"
            class="divide-y divide-gray-200 dark:divide-gray-700"
            @end="onDragEnd"
          >
            <tr
              v-for="(item, index) in localItems"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/40"
            >
              <td class="px-3 py-3 text-center">
                <span
                  class="drag-handle inline-flex h-7 w-7 items-center justify-center rounded text-gray-400"
                  :class="isDragDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-grab hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'"
                  title="Glisser pour réordonner"
                >
                  <font-awesome-icon icon="fa-solid fa-grip-vertical" />
                </span>
              </td>
              <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ index + 1 }}
              </td>
              <td class="px-3 py-3">
                <div class="flex items-center gap-3">
                  <span
                    class="inline-block h-4 w-4 flex-shrink-0 rounded-full ring-2 ring-white dark:ring-gray-800"
                    :class="swatchClass(item.color)"
                    :title="colorLabel(item.color)"
                    :aria-label="`Couleur : ${colorLabel(item.color)}`"
                  />
                  <div class="min-w-0">
                    <button
                      type="button"
                      class="text-left text-sm font-medium text-gray-900 hover:text-brand-blue-600 dark:text-white dark:hover:text-brand-blue-400"
                      @click="emit('edit', item.id)"
                    >
                      <span v-if="item.sigle" class="mr-1 font-bold text-brand-blue-700 dark:text-brand-blue-300">{{ item.sigle }}</span>
                      <span v-if="item.sigle" class="text-gray-400">·</span>
                      {{ item.title }}
                    </button>
                    <p class="font-mono text-xs text-gray-500 dark:text-gray-400">
                      {{ item.code }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                {{ programPhaseLabels[item.phase] ?? item.phase }}
              </td>
              <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                <span v-if="item.highlight">{{ item.highlight }}</span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <td class="whitespace-nowrap px-3 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="item.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
                >
                  {{ item.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-3 py-3 text-right">
                <div class="inline-flex items-center gap-1">
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-brand-blue-400"
                    :title="canEdit ? 'Modifier' : 'Voir'"
                    @click="emit('edit', item.id)"
                  >
                    <font-awesome-icon :icon="canEdit ? 'fa-solid fa-pen' : 'fa-solid fa-eye'" />
                  </button>
                  <button
                    v-if="canEdit"
                    type="button"
                    class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    :class="item.active ? 'hover:text-amber-600' : 'hover:text-green-600'"
                    :title="item.active ? 'Désactiver' : 'Activer'"
                    @click="emit('toggleActive', item)"
                  >
                    <font-awesome-icon :icon="item.active ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off'" />
                  </button>
                  <button
                    v-if="canDelete"
                    type="button"
                    class="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Supprimer"
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
  </div>
</template>
