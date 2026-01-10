<script setup lang="ts">
import type { CampusExternalise } from '~/composables/useMockData'

interface Props {
  campus: CampusExternalise
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const { getFlagEmoji } = useMockData()

// Get localized name
const getLocalizedName = computed(() => {
  if (locale.value === 'ar' && props.campus.name_ar) return props.campus.name_ar
  if (locale.value === 'en' && props.campus.name_en) return props.campus.name_en
  return props.campus.name_fr
})

// Get localized city
const getLocalizedCity = computed(() => {
  if (locale.value === 'ar' && props.campus.city_ar) return props.campus.city_ar
  if (locale.value === 'en' && props.campus.city_en) return props.campus.city_en
  return props.campus.city_fr
})

// Get localized description
const getLocalizedDescription = computed(() => {
  if (locale.value === 'en' && props.campus.description_en) return props.campus.description_en
  return props.campus.description_fr
})

// Expose title ref for intersection observer
const titleRef = ref<HTMLElement | null>(null)
defineExpose({ titleRef })
</script>

<template>
  <section class="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img
        v-if="campus.image"
        :src="campus.image"
        :alt="getLocalizedName"
        class="w-full h-full object-cover opacity-30"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent"></div>
    </div>

    <!-- Decorative elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <!-- Text Content -->
        <div>
          <!-- Badge -->
          <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-blue-500/30 backdrop-blur-sm mb-6">
            <span class="text-xl">{{ getFlagEmoji(campus.country) }}</span>
            {{ t('partners.campus.externalCampus') }}
          </span>

          <!-- Title -->
          <h1 ref="titleRef" class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            {{ getLocalizedName }}
          </h1>

          <!-- Location -->
          <div class="flex items-center gap-2 text-xl text-blue-200 mb-6">
            <font-awesome-icon icon="fa-solid fa-location-dot" class="w-5 h-5" />
            {{ getLocalizedCity }}, {{ campus.country }}
          </div>

          <!-- Description -->
          <p class="text-lg text-gray-200 leading-relaxed mb-8 max-w-2xl">
            {{ getLocalizedDescription }}
          </p>

          <!-- Contact -->
          <div class="flex flex-wrap gap-4">
            <a
              v-if="campus.contact_email"
              :href="`mailto:${campus.contact_email}`"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-envelope" class="w-4 h-4" />
              {{ campus.contact_email }}
            </a>
            <a
              v-if="campus.website"
              :href="campus.website"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-external-link-alt" class="w-4 h-4" />
              {{ t('partners.card.visitWebsite') }}
            </a>
          </div>
        </div>

        <!-- Image Card -->
        <div class="relative">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              v-if="campus.image"
              :src="campus.image"
              :alt="getLocalizedName"
              class="w-full aspect-[4/3] object-cover"
            >
            <div v-else class="w-full aspect-[4/3] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-building-columns" class="w-24 h-24 text-white/30" />
            </div>
          </div>
          <!-- Decorative frame -->
          <div class="absolute -bottom-4 -right-4 w-full h-full border-2 border-amber-500/30 rounded-2xl -z-10"></div>
        </div>
      </div>
    </div>
  </section>
</template>
