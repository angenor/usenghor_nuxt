<script setup lang="ts">
const { t } = useI18n()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Opportunities cards
const opportunities = [
  {
    key: 'teachers',
    icon: 'fa-solid fa-chalkboard-user',
    anchor: '#enseignants',
    color: {
      bg: 'bg-lime-100 dark:bg-lime-900/30',
      iconBg: 'bg-lime-500',
      text: 'text-lime-600 dark:text-lime-400',
      border: 'border-lime-200 dark:border-lime-800',
      hover: 'hover:border-lime-400 dark:hover:border-lime-600'
    }
  },
  {
    key: 'students',
    icon: 'fa-solid fa-graduation-cap',
    anchor: '#etudiants',
    color: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      iconBg: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      hover: 'hover:border-blue-400 dark:hover:border-blue-600'
    }
  },
  {
    key: 'partners',
    icon: 'fa-solid fa-handshake',
    anchor: '#partenaires',
    color: {
      bg: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
      iconBg: 'bg-brand-blue-500',
      text: 'text-brand-blue-600 dark:text-brand-blue-400',
      border: 'border-brand-blue-200 dark:border-brand-blue-800',
      hover: 'hover:border-brand-blue-400 dark:hover:border-brand-blue-600'
    }
  }
]

// Scroll to anchor
const scrollToAnchor = (anchor: string) => {
  const element = document.querySelector(anchor)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 bg-grid-pattern transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="relative inline-block">
            {{ t('careers.opportunities.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          {{ t('careers.opportunities.subtitle') }}
        </p>
      </div>

      <!-- Cards -->
      <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
        <button
          v-for="opp in opportunities"
          :key="opp.key"
          type="button"
          class="group bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
          :class="[opp.color.border, opp.color.hover]"
          @click="scrollToAnchor(opp.anchor)"
        >
          <!-- Icon -->
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
            :class="opp.color.iconBg"
          >
            <font-awesome-icon
              :icon="opp.icon"
              class="w-8 h-8 text-white"
            />
          </div>

          <!-- Content -->
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {{ t(`careers.opportunities.${opp.key}.title`) }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {{ t(`careers.opportunities.${opp.key}.description`) }}
          </p>

          <!-- CTA -->
          <span
            class="inline-flex items-center gap-2 font-medium transition-colors duration-300"
            :class="opp.color.text"
          >
            {{ t('careers.opportunities.discover') }}
            <font-awesome-icon
              icon="fa-solid fa-arrow-down"
              class="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1"
            />
          </span>
        </button>
      </div>
    </div>
  </section>
</template>
