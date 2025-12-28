<script setup lang="ts">
import type { PaysBailleur } from '@bank/mock-data/pays-bailleurs'

interface Props {
  paysBailleurs: PaysBailleur[]
  egypte: PaysBailleur | undefined
  otherFounders: PaysBailleur[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  openDrawer: [pays: PaysBailleur]
}>()

const { t } = useI18n()
const { getFlagEmoji } = useMockData()
const { elementRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
</script>

<template>
  <section
    ref="elementRef"
    class="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden"
  >
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-5 dark:opacity-[0.02]">
      <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <pattern id="africa-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.5" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#africa-pattern)" />
      </svg>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <!-- Header avec stats -->
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('governance.donorCountries.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('governance.donorCountries.description') }}
        </p>

        <!-- Stats animées -->
        <div class="flex flex-wrap justify-center gap-8 sm:gap-12 mt-8">
          <div class="text-center">
            <span class="text-4xl sm:text-5xl font-bold text-amber-500">{{ props.paysBailleurs.length }}</span>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pays membres</p>
          </div>
          <div class="text-center">
            <span class="text-4xl sm:text-5xl font-bold text-amber-500">35+</span>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Années de partenariat</p>
          </div>
          <div class="text-center">
            <span class="text-4xl sm:text-5xl font-bold text-amber-500">3</span>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Continents</p>
          </div>
        </div>
      </div>

      <!-- Pays fondateurs 1989 -->
      <div class="mb-16">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-amber-500 rounded-full"></span>
          Pays fondateurs
        </h3>

        <!-- Égypte : Hero card -->
        <div
          v-if="props.egypte"
          class="bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600
                 rounded-3xl p-6 sm:p-8 text-white mb-6 relative overflow-hidden cursor-pointer
                 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300"
          @click="emit('openDrawer', props.egypte)"
        >
          <!-- Decorative elements -->
          <div class="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div class="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <span class="text-6xl sm:text-7xl">{{ getFlagEmoji(props.egypte.code) }}</span>
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-3 mb-2">
                <h4 class="text-2xl sm:text-3xl font-bold">{{ props.egypte.name_fr }}</h4>
                <span class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  Pays hôte
                </span>
              </div>
              <p class="text-white/90 text-sm sm:text-base max-w-2xl">
                {{ props.egypte.description_fr }}
              </p>
              <div class="flex flex-wrap gap-4 mt-4 text-sm text-white/75">
                <span class="flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="text-xs" />
                  Capitale : {{ props.egypte.capital }}
                </span>
                <span class="flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="text-xs" />
                  Membre depuis {{ props.egypte.member_since }}
                </span>
              </div>
            </div>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-white/50 text-xl hidden sm:block" />
          </div>
        </div>

        <!-- 5 autres fondateurs en grille -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <button
            v-for="pays in props.otherFounders"
            :key="pays.id"
            class="founder-card group"
            @click="emit('openDrawer', pays)"
          >
            <span class="text-4xl sm:text-5xl block mb-3 group-hover:scale-110 transition-transform duration-300">
              {{ getFlagEmoji(pays.code) }}
            </span>
            <h4 class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              {{ pays.name_fr }}
            </h4>
            <span class="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
              Membre fondateur
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.founder-card {
  @apply bg-white dark:bg-gray-800 rounded-2xl p-6 text-center
         border border-gray-100 dark:border-gray-700
         hover:border-amber-300 dark:hover:border-amber-600
         hover:shadow-lg hover:-translate-y-1
         transition-all duration-300 cursor-pointer;
}
</style>
