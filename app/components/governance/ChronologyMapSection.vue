<script setup lang="ts">
import type { PaysBailleur } from '@bank/mock-data/pays-bailleurs'

interface Props {
  countries: PaysBailleur[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  openDrawer: [pays: PaysBailleur]
}>()

const { getFlagEmoji } = useMockData()

// Utiliser le composable scrollytelling
const { mapRef, activeStep } = useScrollytellingMap({
  countries: computed(() => props.countries),
  getFlagEmoji
})
</script>

<template>
  <section class="relative">
    <!-- Header HORS de la carte -->
    <div class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
        Chronologie des adhésions
      </h3>
      <p class="text-gray-600 dark:text-gray-300 max-w-2xl">
        Découvrez les pays qui ont rejoint l'Université Senghor après sa fondation.
      </p>
    </div>

    <ClientOnly>
      <!-- Carte Leaflet (sticky background) -->
      <div class="scroll__graphic sticky top-0 w-full h-screen z-0">
        <div class="absolute inset-0 bg-white/20 dark:bg-gray-900/40 z-10"></div>
        <div id="map-chronologie" ref="mapRef" class="w-full h-full"></div>
      </div>

      <!-- Step Cards (scrolling content) -->
      <div class="scroll__text relative z-20 -mt-[100vh] pb-[50vh]">
        <div class="flex flex-col items-end px-4 sm:px-6 lg:px-8 pt-[20vh] space-y-[30vh]">
          <div
            v-for="(pays, index) in props.countries"
            :key="pays.id"
            :data-step="index + 1"
            class="step-card"
            :class="{ 'step-active': activeStep === index }"
            @click="emit('openDrawer', pays)"
          >
            <h3 class="text-lg font-bold text-amber-600 dark:text-amber-400">
              {{ pays.member_since }}
            </h3>
            <h4 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
              <span class="text-3xl">{{ getFlagEmoji(pays.code) }}</span>
              {{ pays.name_fr }}
            </h4>
            <p class="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed text-sm">
              {{ pays.description_fr }}
            </p>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-3">
              <font-awesome-icon icon="fa-solid fa-location-dot" class="text-xs" />
              <span>{{ pays.capital }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #fallback>
        <!-- Fallback pour SSR : timeline simple -->
        <div class="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            Chronologie des adhésions
          </h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="pays in props.countries"
              :key="pays.id"
              class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <span class="text-3xl">{{ getFlagEmoji(pays.code) }}</span>
              <h4 class="font-semibold mt-2">{{ pays.name_fr }}</h4>
              <p class="text-sm text-gray-500">Membre depuis {{ pays.member_since }}</p>
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </section>
</template>

<style scoped>
/* Step Cards */
.step-card {
  background-color: #fdf3d7;
  background-image: url("https://assets.codepen.io/252820/soft-wallpaper.png");
  background-size: cover;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.2);
  border: 1px solid #d1a878;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  max-width: 100%;
  width: 380px;
  position: relative;
  cursor: pointer;
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: 4px 8px 16px rgba(0, 0, 0, 0.25);
}

/* Numéro en badge */
.step-card::before {
  content: attr(data-step);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 1.1em;
  font-weight: 700;
  width: 36px;
  height: 36px;
  background-color: #f59e0b;
  color: white;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 12px;
  top: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* État actif */
.step-card.step-active {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px #f59e0b, 2px 4px 15px rgba(245, 158, 11, 0.35);
}

/* Dark mode */
:is(.dark) .step-card {
  background-color: #1f2937;
  background-image: none;
  border-color: #374151;
}

:is(.dark) .step-card:hover {
  border-color: #4b5563;
}

:is(.dark) .step-card.step-active {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px #f59e0b, 2px 4px 15px rgba(245, 158, 11, 0.3);
}
</style>

<!-- Styles globaux pour Leaflet -->
<style>
.number-icon {
  background: #f59e0b;
  color: white;
  border-radius: 50%;
  width: 28px !important;
  height: 28px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  font-family: system-ui, -apple-system, sans-serif;
}

.number-icon div {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.leaflet-popup-content-wrapper {
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.leaflet-popup-content {
  margin: 12px 16px;
  font-family: system-ui, -apple-system, sans-serif;
}

.leaflet-control-attribution {
  font-size: 10px;
  opacity: 0.6;
}
</style>
