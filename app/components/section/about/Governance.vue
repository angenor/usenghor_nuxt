<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
</script>

<template>
  <section
    id="gouvernance"
    ref="sectionRef"
    class="py-16 lg:py-20 bg-white dark:bg-gray-900 bg-grid-pattern transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Image (droite sur desktop) -->
        <div class="relative order-2 lg:order-2">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl">
            <div class="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-building-columns" class="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-tr from-brand-blue-500/20 to-transparent"></div>
          </div>
          <div class="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl -z-10 bg-brand-blue-500/10"></div>
          <div class="absolute -top-4 -right-4 w-32 h-32 rounded-full -z-10 bg-brand-blue-500/10"></div>
        </div>

        <!-- Content -->
        <div class="order-1 lg:order-1">
          <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400">
            <font-awesome-icon icon="fa-solid fa-building-columns" class="w-3.5 h-3.5 mr-2" />
            {{ t('about.preview.governance.title') }}
          </span>

          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('about.preview.governance.title') }}
          </h2>

          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            {{ t('about.preview.governance.summary') }}
          </p>

          <NuxtLink
            :to="localePath('/a-propos/gouvernance')"
            class="group inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-brand-blue-500 hover:bg-brand-blue-600 hover:shadow-brand-blue-500/30"
          >
            <span>{{ t('common.discover') }}</span>
            <font-awesome-icon
              icon="fa-solid fa-arrow-right"
              class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
