<script setup lang="ts">
/**
 * Partenaires du pôle en grille unique logo + nom (style de /a-propos/partenaires), dans l'ordre des familles.
 * Variante `logos` (accueil, par défaut) : grille seule ; `detailed` (page « Nos partenaires ») : filtres par famille.
 */
import type { PeiPartnerFamily, PeiPartnerFamilyPublic } from '~/types/api/entrepreneurship'

const props = withDefaults(defineProps<{
  families: PeiPartnerFamilyPublic[]
  variant?: 'logos' | 'detailed'
}>(), {
  variant: 'logos',
})

const { t } = useI18n()
const { localized } = useLocalizedField()

const visible = computed(() =>
  PEI_FAMILY_ORDER
    .map(family => props.families.find(f => f.family === family))
    .filter((f): f is PeiPartnerFamilyPublic => !!f && f.partners.length > 0),
)

// Filtre par famille de la variante détaillée (« Tous » par défaut, rendu serveur complet)
type FamilyFilter = 'all' | PeiPartnerFamily
const FAMILY_ICONS: Record<PeiPartnerFamily, string> = {
  academic: 'fa-solid fa-building-columns',
  support: 'fa-solid fa-hands-holding',
  international: 'fa-solid fa-earth-africa',
}
const selectedFamily = ref<FamilyFilter>('all')

const filterOptions = computed(() => [
  { value: 'all' as FamilyFilter, label: t('pei.partners.all'), icon: 'fa-solid fa-globe', count: visible.value.reduce((n, f) => n + f.partners.length, 0) },
  ...visible.value.map(f => ({ value: f.family as FamilyFilter, label: t(`pei.families.${f.family}`), icon: FAMILY_ICONS[f.family], count: f.partners.length })),
])

const filteredPartners = computed(() =>
  visible.value
    .filter(f => selectedFamily.value === 'all' || f.family === selectedFamily.value)
    .flatMap(f => f.partners),
)
</script>

<template>
  <div v-if="visible.length">
    <!-- Filtres par famille (page « Nos partenaires » uniquement) -->
    <div v-if="variant === 'detailed'" class="mb-10 flex flex-wrap justify-center gap-3" role="group" :aria-label="t('pei.partners.filterLabel')">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        type="button"
        :aria-pressed="selectedFamily === option.value"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
        :class="selectedFamily === option.value
          ? 'bg-brand-blue-600 text-white shadow-lg shadow-brand-blue-500/25'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-brand-blue-300 dark:hover:border-brand-blue-700'"
        @click="selectedFamily = option.value"
      >
        <font-awesome-icon :icon="option.icon" class="w-4 h-4" aria-hidden="true" />
        {{ option.label }}
        <span
          class="px-2 py-0.5 text-xs rounded-full font-semibold"
          :class="selectedFamily === option.value ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'"
        >
          {{ option.count }}
        </span>
      </button>
    </div>

    <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
      <li v-for="partner in filteredPartners" :key="partner.id" class="flex">
        <component
          :is="partner.website ? 'a' : 'div'"
          :href="partner.website || undefined"
          :target="partner.website ? '_blank' : undefined"
          :rel="partner.website ? 'noopener noreferrer' : undefined"
          :title="localized(partner, 'description') || undefined"
          class="group relative flex w-full flex-col items-center p-4 lg:p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-300"
          :class="partner.website ? 'cursor-pointer' : 'cursor-default'"
        >
          <div class="relative w-16 h-16 lg:w-20 lg:h-20 mb-3 flex items-center justify-center rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
            <img
              v-if="partner.logo_url"
              :src="partner.logo_url"
              :alt="partner.name"
              class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            >
            <font-awesome-icon v-else icon="fa-solid fa-handshake" class="w-7 h-7 text-gray-300 dark:text-gray-500" aria-hidden="true" />
          </div>
          <h3 class="text-xs lg:text-sm font-medium text-center line-clamp-2 text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {{ partner.name }}
          </h3>
          <span v-if="partner.website" class="sr-only">{{ t('pei.common.openInNewTab') }}</span>
          <span v-if="partner.website" class="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
            <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="w-3 h-3 text-cyan-500 rtl:-scale-x-100" />
          </span>
        </component>
      </li>
    </ul>
  </div>
</template>
