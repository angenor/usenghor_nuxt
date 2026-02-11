<script setup lang="ts">
const { t } = useI18n()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Stats data
const stats = [
  { value: 5, key: 'positions', icon: 'fa-solid fa-briefcase' },
  { value: 40, key: 'nationalities', icon: 'fa-solid fa-globe-africa' },
  { value: 30, key: 'years', icon: 'fa-solid fa-award', suffix: '+' }
]
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 bg-grid-pattern transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Title -->
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          <span class="relative inline-block">
            {{ t('careers.intro.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-lime-500 to-lime-300 rounded-full"></span>
          </span>
        </h2>

        <!-- Description -->
        <p class="text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12">
          {{ t('careers.intro.text') }}
        </p>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-6 lg:gap-12">
          <div
            v-for="stat in stats"
            :key="stat.key"
            class="text-center"
          >
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-100 dark:bg-lime-900/30 mb-4">
              <font-awesome-icon
                :icon="stat.icon"
                class="w-6 h-6 text-lime-600 dark:text-lime-400"
              />
            </div>
            <p class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {{ stat.value }}{{ stat.suffix || '' }}
            </p>
            <p class="text-sm lg:text-base text-gray-500 dark:text-gray-400">
              {{ t(`careers.intro.stats.${stat.key}`) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
