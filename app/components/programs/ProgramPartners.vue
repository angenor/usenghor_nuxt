<script setup lang="ts">
import type { ProgramPartnerPublic } from '~/composables/usePublicProgramsApi'

interface Props {
  partners: ProgramPartnerPublic[]
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
})

const { t } = useI18n()
const baseUrl = useApiBase()

// Mode compact (sidebar) : grille 3 colonnes, 2 lignes max = 6 items
const COMPACT_COLS = 3
const COMPACT_ROWS = 2
const COMPACT_MAX = COMPACT_COLS * COMPACT_ROWS
const showAllCompact = ref(false)

const visiblePartners = computed(() => {
  if (!props.compact || showAllCompact.value) return props.partners
  return props.partners.slice(0, COMPACT_MAX)
})

const hiddenCount = computed(() => {
  if (!props.compact) return 0
  return Math.max(0, props.partners.length - COMPACT_MAX)
})
</script>

<template>
  <div
    v-if="partners.length > 0"
    :class="compact ? 'hidden lg:block bg-gray-50 dark:bg-gray-800 rounded-xl p-6' : 'py-8'"
  >
    <!-- Titre -->
    <component
      :is="compact ? 'h4' : 'h2'"
      :class="compact
        ? 'text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'
        : 'text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3'"
    >
      <font-awesome-icon icon="fa-solid fa-handshake" class="text-brand-blue-500" />
      {{ t('formations.partners.title') }}
      <span :class="compact ? 'text-xs' : 'text-sm'" class="font-normal text-gray-500 dark:text-gray-400">({{ partners.length }})</span>
    </component>

    <!-- Mode compact : grille 3 colonnes -->
    <div v-if="compact" class="grid grid-cols-3 gap-4">
      <template v-for="partner in visiblePartners" :key="partner.partner_external_id">
        <a
          v-if="partner.website"
          :href="partner.website"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex flex-col items-center gap-2"
        >
          <div class="w-16 h-16 p-2 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-brand-blue-500/10 flex items-center justify-center">
            <img
              v-if="partner.logo_external_id"
              :src="`${baseUrl}/api/public/media/${partner.logo_external_id}/download`"
              :alt="partner.name"
              class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <font-awesome-icon v-else icon="fa-solid fa-building" class="w-6 h-6 text-gray-400" />
          </div>
          <span class="text-xs text-center font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors leading-tight">
            {{ partner.name }}
          </span>
        </a>
        <div v-else class="flex flex-col items-center gap-2">
          <div class="w-16 h-16 p-2 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center">
            <img
              v-if="partner.logo_external_id"
              :src="`${baseUrl}/api/public/media/${partner.logo_external_id}/download`"
              :alt="partner.name"
              class="max-w-full max-h-full object-contain"
            />
            <font-awesome-icon v-else icon="fa-solid fa-building" class="w-6 h-6 text-gray-400" />
          </div>
          <span class="text-xs text-center font-medium text-gray-700 dark:text-gray-300 leading-tight">
            {{ partner.name }}
          </span>
        </div>
      </template>
    </div>

    <!-- Bouton "plus" compact : uniquement si > 2 lignes -->
    <button
      v-if="compact && hiddenCount > 0 && !showAllCompact"
      type="button"
      class="mt-3 text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline font-medium"
      @click="showAllCompact = true"
    >
      + {{ hiddenCount }} {{ hiddenCount > 1 ? 'autres' : 'autre' }}
    </button>
    <button
      v-if="compact && showAllCompact && hiddenCount > 0"
      type="button"
      class="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:underline"
      @click="showAllCompact = false"
    >
      Voir moins
    </button>

    <!-- Mode normal (corps) : flex wrap -->
    <div v-if="!compact" class="flex flex-wrap gap-6 lg:gap-8">
      <template v-for="partner in partners" :key="partner.partner_external_id">
        <a
          v-if="partner.website"
          :href="partner.website"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex flex-col items-center gap-2 w-28"
        >
          <div class="w-24 h-24 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-brand-blue-500/10 flex items-center justify-center">
            <img
              v-if="partner.logo_external_id"
              :src="`${baseUrl}/api/public/media/${partner.logo_external_id}/download`"
              :alt="partner.name"
              class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <font-awesome-icon v-else icon="fa-solid fa-building" class="w-8 h-8 text-gray-400" />
          </div>
          <span class="text-sm text-center font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors leading-tight">
            {{ partner.name }}
          </span>
        </a>
        <div v-else class="flex flex-col items-center gap-2 w-28">
          <div class="w-24 h-24 p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center">
            <img
              v-if="partner.logo_external_id"
              :src="`${baseUrl}/api/public/media/${partner.logo_external_id}/download`"
              :alt="partner.name"
              class="max-w-full max-h-full object-contain"
            />
            <font-awesome-icon v-else icon="fa-solid fa-building" class="w-8 h-8 text-gray-400" />
          </div>
          <span class="text-sm text-center font-medium text-gray-700 dark:text-gray-300 leading-tight">
            {{ partner.name }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
