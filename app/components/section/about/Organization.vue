<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })
</script>

<template>
  <section
    id="organisation"
    ref="sectionRef"
    class="py-16 lg:py-20 bg-white dark:bg-gray-900 bg-grid-pattern transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Image (droite) -->
        <div class="relative order-2 lg:order-2">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://picsum.photos/seed/preview-organization/800/600"
              :alt="t('about.preview.organization.title')"
              class="w-full h-auto object-cover aspect-[4/3]"
            />
            <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent"></div>
          </div>
          <div class="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl -z-10 bg-purple-500/10"></div>
          <div class="absolute -top-4 -right-4 w-32 h-32 rounded-full -z-10 bg-purple-500/10"></div>
        </div>

        <!-- Content -->
        <div class="order-1 lg:order-1">
          <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
            <font-awesome-icon icon="fa-solid fa-sitemap" class="w-3.5 h-3.5 mr-2" />
            {{ t('about.preview.organization.title') }}
          </span>

          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('about.preview.organization.title') }}
          </h2>

          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            {{ t('about.preview.organization.summary') }}
          </p>

          <NuxtLink
            :to="localePath('/a-propos/organisation')"
            class="group inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-purple-500 hover:bg-purple-600 hover:shadow-purple-500/30"
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
