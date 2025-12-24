<script setup lang="ts">
interface Value {
  icon: string
  title: string
  text: string
}

interface Charter {
  label: string
  url: string
}

interface Props {
  title?: string
  values: Value[]
  charter?: Charter
}

const props = defineProps<Props>()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

// Map icon names to Font Awesome icons
const getIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    star: 'fa-solid fa-star',
    users: 'fa-solid fa-users',
    globe: 'fa-solid fa-globe',
    handshake: 'fa-solid fa-handshake',
    heart: 'fa-solid fa-heart',
    lightbulb: 'fa-solid fa-lightbulb',
    shield: 'fa-solid fa-shield',
    award: 'fa-solid fa-award'
  }
  return iconMap[iconName] || 'fa-solid fa-check'
}

// Colors for each card
const cardColors = [
  { bg: 'from-amber-400 to-orange-500', light: 'amber', shadow: 'amber-500' },
  { bg: 'from-blue-400 to-indigo-500', light: 'blue', shadow: 'blue-500' },
  { bg: 'from-emerald-400 to-teal-500', light: 'emerald', shadow: 'emerald-500' },
  { bg: 'from-purple-400 to-pink-500', light: 'purple', shadow: 'purple-500' }
]
</script>

<template>
  <section
    id="engagements"
    ref="sectionRef"
    class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 lg:mb-16">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-heart" class="w-3.5 h-3.5 mr-2" />
          Engagements
        </span>
        <h2 v-if="props.title" class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          {{ props.title }}
        </h2>
      </div>

      <!-- Values Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div
          v-for="(value, index) in props.values"
          :key="index"
          class="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <!-- Background Gradient on Hover -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br"
            :class="`${cardColors[index % cardColors.length].bg}`"
          ></div>

          <!-- Icon -->
          <div class="relative mb-6">
            <div
              class="w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
              :class="`${cardColors[index % cardColors.length].bg} shadow-${cardColors[index % cardColors.length].shadow}/30`"
            >
              <font-awesome-icon
                :icon="getIcon(value.icon)"
                class="w-6 h-6 text-white"
              />
            </div>
          </div>

          <!-- Content -->
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {{ value.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ value.text }}
          </p>
        </div>
      </div>

      <!-- Charter Download -->
      <div v-if="props.charter" class="text-center">
        <a
          :href="props.charter.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-gray-200 dark:border-gray-700"
        >
          <font-awesome-icon
            icon="fa-solid fa-file-pdf"
            class="w-5 h-5 text-red-500"
          />
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ props.charter.label }}
          </span>
          <font-awesome-icon
            icon="fa-solid fa-download"
            class="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors duration-300"
          />
        </a>
      </div>
    </div>
  </section>
</template>
