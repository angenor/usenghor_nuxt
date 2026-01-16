<script setup lang="ts">
interface NavCard {
  title: string
  description?: string
  to: string
  icon: string
}

interface Props {
  title?: string
  cards: NavCard[]
}

const props = defineProps<Props>()
const localePath = useLocalePath()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

// Map icon names to Font Awesome icons
const getIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    clock: 'fa-solid fa-clock-rotate-left',
    building: 'fa-solid fa-building-columns',
    sitemap: 'fa-solid fa-sitemap',
    handshake: 'fa-solid fa-handshake',
    users: 'fa-solid fa-users',
    globe: 'fa-solid fa-globe',
    graduation: 'fa-solid fa-graduation-cap',
    book: 'fa-solid fa-book',
    map: 'fa-solid fa-map-location-dot',
    chart: 'fa-solid fa-chart-line',
    briefcase: 'fa-solid fa-briefcase'
  }
  return iconMap[iconName] || 'fa-solid fa-arrow-right'
}

// Colors for each card (alternating brand colors)
const cardColors = [
  { gradient: 'from-brand-blue-500 to-brand-blue-600', hover: 'group-hover:text-brand-blue-500' },
  { gradient: 'from-brand-red-500 to-brand-red-600', hover: 'group-hover:text-brand-red-500' },
  { gradient: 'from-brand-blue-400 to-brand-blue-500', hover: 'group-hover:text-brand-blue-500' },
  { gradient: 'from-purple-500 to-purple-600', hover: 'group-hover:text-purple-500' },
  { gradient: 'from-brand-red-400 to-brand-red-500', hover: 'group-hover:text-brand-red-500' },
  { gradient: 'from-brand-blue-500 to-brand-blue-700', hover: 'group-hover:text-brand-blue-500' },
  { gradient: 'from-brand-red-500 to-brand-red-700', hover: 'group-hover:text-brand-red-500' }
]
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div v-if="props.title" class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {{ props.title }}
        </h2>
      </div>

      <!-- Cards Grid -->
      <div class="grid sm:grid-cols-2 gap-6">
        <NuxtLink
          v-for="(card, index) in props.cards"
          :key="index"
          :to="localePath(card.to)"
          class="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
        >
          <!-- Background Gradient on Hover -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br"
            :class="cardColors[index % cardColors.length].gradient"
          ></div>

          <div class="relative flex items-center gap-5">
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
              :class="cardColors[index % cardColors.length].gradient"
            >
              <font-awesome-icon
                :icon="getIcon(card.icon)"
                class="w-6 h-6 text-white"
              />
            </div>

            <!-- Content -->
            <div class="flex-grow">
              <h3 class="text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300" :class="cardColors[index % cardColors.length].hover">
                {{ card.title }}
              </h3>
              <p v-if="card.description" class="text-sm text-gray-600 dark:text-gray-400">
                {{ card.description }}
              </p>
            </div>

            <!-- Arrow -->
            <div class="flex-shrink-0">
              <font-awesome-icon
                icon="fa-solid fa-arrow-right"
                class="w-5 h-5 text-gray-300 dark:text-gray-600 transition-all duration-300 group-hover:translate-x-1"
                :class="cardColors[index % cardColors.length].hover"
              />
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
