<script setup lang="ts">
/**
 * Partenaires rattachés au pôle PEI, présentés par famille (ordre fixe),
 * chaque famille étant réordonnable indépendamment par glisser-déposer.
 */
import { VueDraggable } from 'vue-draggable-plus'
import type { PeiPartnerFamily, PeiPartnerLinkAdmin } from '~/types/api/entrepreneurship'
import { partnerFamilyOptions } from '~/composables/useEntrepreneurshipApi'
import { partnerTypeColors, partnerTypeLabels } from '~/composables/usePartnersApi'

interface Props {
  links: PeiPartnerLinkAdmin[]
  loading?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  canEdit: false,
  canDelete: false,
})

const emit = defineEmits<{
  (e: 'changeFamily', partnerId: string, family: PeiPartnerFamily): void
  (e: 'unlink', partnerId: string): void
  (e: 'reorder', family: PeiPartnerFamily, ids: string[]): void
}>()

type Groups = Record<PeiPartnerFamily, PeiPartnerLinkAdmin[]>

function groupLinks(links: PeiPartnerLinkAdmin[]): Groups {
  const groups: Groups = { academic: [], support: [], international: [] }
  for (const link of links) groups[link.family]?.push(link)
  for (const family of Object.keys(groups) as PeiPartnerFamily[]) {
    groups[family].sort((a, b) => a.display_order - b.display_order)
  }
  return groups
}

// Copies locales par famille (manipulées par VueDraggable)
const groups = reactive<Groups>(groupLinks(props.links))

watch(
  () => props.links,
  (value) => {
    Object.assign(groups, groupLinks(value))
  },
)

async function onDragEnd(family: PeiPartnerFamily) {
  await nextTick()
  emit('reorder', family, groups[family].map(l => l.partner_id))
}

function onFamilyChange(link: PeiPartnerLinkAdmin, event: Event) {
  const value = (event.target as HTMLSelectElement).value as PeiPartnerFamily
  if (value !== link.family) emit('changeFamily', link.partner_id, value)
}

function onUnlink(link: PeiPartnerLinkAdmin) {
  if (!window.confirm('Retirer ce partenaire du pôle ? Il reste dans le backoffice Partenaires.')) return
  emit('unlink', link.partner_id)
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-12 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
    <font-awesome-icon icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
    Chargement…
  </div>

  <div v-else class="space-y-6">
    <section
      v-for="option in partnerFamilyOptions"
      :key="option.value"
      class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <header class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ option.label }}
        </h2>
        <span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {{ groups[option.value].length }}
        </span>
      </header>

      <p v-if="!groups[option.value].length" class="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Aucun partenaire rattaché
      </p>

      <VueDraggable
        v-else
        v-model="groups[option.value]"
        tag="ul"
        handle=".drag-handle"
        :animation="150"
        ghost-class="opacity-30"
        :disabled="!canEdit"
        class="divide-y divide-gray-200 dark:divide-gray-700"
        @end="onDragEnd(option.value)"
      >
        <li
          v-for="link in groups[option.value]"
          :key="link.partner_id"
          class="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40"
        >
          <span
            class="drag-handle inline-flex p-1 text-gray-400"
            :class="canEdit ? 'cursor-move hover:text-gray-600 dark:hover:text-gray-200' : 'cursor-not-allowed opacity-40'"
            :title="canEdit ? 'Glisser pour réordonner' : 'Permission de modification requise'"
          >
            <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
          </span>

          <img
            v-if="link.partner.logo_url"
            :src="link.partner.logo_url"
            :alt="link.partner.name"
            class="h-10 w-10 shrink-0 rounded bg-white object-contain"
            loading="lazy"
          >
          <span
            v-else
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-300"
          >
            {{ link.partner.name.charAt(0).toUpperCase() }}
          </span>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
              {{ link.partner.name }}
            </p>
            <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="partnerTypeColors[link.partner.type]"
              >
                {{ partnerTypeLabels[link.partner.type] }}
              </span>
              <span
                v-if="!link.partner.active"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                title="Non visible publiquement"
              >
                Inactif
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <select
              v-if="canEdit"
              :value="link.family"
              class="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :aria-label="`Famille de ${link.partner.name}`"
              @change="onFamilyChange(link, $event)"
            >
              <option v-for="opt in partnerFamilyOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <NuxtLink
              to="/admin/partenaires"
              target="_blank"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-brand-blue-400"
              title="Ouvrir dans Partenaires"
              aria-label="Ouvrir dans Partenaires"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="h-4 w-4" />
            </NuxtLink>
            <button
              v-if="canDelete"
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="Retirer du pôle"
              aria-label="Retirer du pôle"
              @click="onUnlink(link)"
            >
              <font-awesome-icon icon="fa-solid fa-link-slash" class="h-4 w-4" />
            </button>
          </div>
        </li>
      </VueDraggable>
    </section>
  </div>
</template>
