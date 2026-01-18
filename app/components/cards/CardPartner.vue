<script setup lang="ts">
import type { Partenaire } from '~/composables/useMockData'

interface Props {
  partner: Partenaire
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

// Get localized name
const getLocalizedName = computed(() => {
  if (locale.value === 'en' && props.partner.name_en) {
    return props.partner.name_en
  }
  return props.partner.name_fr
})

// Badge color based on partner type
const typeColors: Record<string, string> = {
  academique: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  institutionnel: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  entreprise: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ong: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
}

const typeLabel = computed(() => {
  const typeMap: Record<string, string> = {
    academique: t('partners.filters.academic'),
    institutionnel: t('partners.filters.institutional'),
    entreprise: t('partners.filters.corporate'),
    ong: t('partners.filters.ngo')
  }
  return typeMap[props.partner.partner_type] || props.partner.partner_type
})
</script>

<template>
  <div
    class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
  >
    <!-- Logo Container -->
    <div class="relative h-40 bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-6">
      <img
        :src="partner.logo"
        :alt="getLocalizedName"
        class="max-h-24 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
      >
      <!-- Strategic Badge -->
      <div
        v-if="partner.is_strategic"
        class="absolute top-3 right-3 px-2 py-1 bg-brand-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1"
      >
        <font-awesome-icon icon="fa-solid fa-star" class="w-3 h-3" />
        <span class="hidden sm:inline">{{ t('partners.card.strategic') }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col">
      <!-- Type Badge -->
      <span
        class="self-start px-3 py-1 text-xs font-medium rounded-full mb-3"
        :class="typeColors[partner.partner_type]"
      >
        {{ typeLabel }}
      </span>

      <!-- Name -->
      <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
        {{ getLocalizedName }}
      </h3>

      <!-- Description -->
      <p
        v-if="partner.description_fr"
        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1"
      >
        {{ partner.description_fr }}
      </p>

      <!-- Actions -->
      <div class="mt-auto">
        <a
          v-if="partner.website"
          :href="partner.website"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-external-link-alt" class="w-3.5 h-3.5" />
          {{ t('partners.card.visitWebsite') }}
        </a>
      </div>
    </div>
  </div>
</template>
