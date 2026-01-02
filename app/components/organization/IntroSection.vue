<script setup lang="ts">
const { t } = useI18n()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })
const { containerRef: cardsRef } = useScrollAnimationGroup({
  animation: 'fadeInUp',
  threshold: 0.1,
  staggerDelay: 150,
  childSelector: '[data-animate]'
})
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 lg:mb-16">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          <span class="relative inline-block">
            {{ t('organization.orgchart.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
          </span>
        </h2>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('organization.intro.text') }}
        </p>
      </div>

      <!-- Organigramme : Direction -->
      <div ref="cardsRef" class="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <!-- Recteur - Card principale -->
        <div data-animate class="lg:col-span-3 flex justify-center">
          <div class="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/40 rounded-2xl p-8 border-2 border-amber-300 dark:border-amber-700 shadow-xl max-w-2xl w-full hover:shadow-2xl transition-shadow duration-300">
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div class="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <font-awesome-icon icon="fa-solid fa-user-tie" class="w-10 h-10 text-white" />
              </div>
              <div class="text-center sm:text-left">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ t('organization.orgchart.recteur') }}
                </h3>
                <p class="text-gray-600 dark:text-gray-300">
                  {{ t('organization.orgchart.recteur_desc') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Cabinet du Recteur -->
        <div data-animate class="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-all duration-300">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <font-awesome-icon icon="fa-solid fa-building-columns" class="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {{ t('organization.orgchart.cabinet') }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('organization.orgchart.cabinet_desc') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Secrétaire Général -->
        <div data-animate class="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800 shadow-md hover:shadow-lg transition-all duration-300">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <font-awesome-icon icon="fa-solid fa-user-gear" class="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {{ t('organization.orgchart.sg') }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('organization.orgchart.sg_desc') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Services rattachés -->
        <div data-animate class="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <font-awesome-icon icon="fa-solid fa-sitemap" class="w-7 h-7 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {{ t('organization.services.title') }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('organization.services.subtitle') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
