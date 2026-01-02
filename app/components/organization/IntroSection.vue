<script setup lang="ts">
const { t, locale } = useI18n()
const { getServicesByCategory } = useMockData()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })
const { containerRef: cardsRef } = useScrollAnimationGroup({
  animation: 'fadeInUp',
  threshold: 0.1,
  staggerDelay: 100,
  childSelector: '[data-animate]'
})

// Services du Rectorat
const rectoratServices = computed(() => getServicesByCategory('rectorat'))

// Map icons
const iconMap: Record<string, string> = {
  'building-columns': 'fa-solid fa-building-columns',
  megaphone: 'fa-solid fa-bullhorn',
  map: 'fa-solid fa-map',
  rocket: 'fa-solid fa-rocket',
  globe: 'fa-solid fa-globe',
  users: 'fa-solid fa-users'
}

const getIcon = (icon: string) => iconMap[icon] || 'fa-solid fa-building'

// Get service name based on locale
const getServiceName = (service: any) => {
  if (locale.value === 'ar') return service.name_ar
  if (locale.value === 'en') return service.name_en
  return service.name_fr
}
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
      <div ref="cardsRef" class="space-y-8 max-w-5xl mx-auto">
        <!-- Recteur - Card principale -->
        <div data-animate class="flex justify-center">
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

        <!-- Rectorat Services - Title -->
        <div data-animate class="flex items-center justify-center gap-3">
          <div class="h-px flex-1 bg-amber-200 dark:bg-amber-800"></div>
          <h3 class="text-lg font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            {{ t('organization.services.categories.rectorat') }}
          </h3>
          <div class="h-px flex-1 bg-amber-200 dark:bg-amber-800"></div>
        </div>

        <!-- Rectorat Services Grid -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="service in rectoratServices"
            :key="service.id"
            data-animate
            class="group bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-amber-200 dark:border-amber-800 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <font-awesome-icon
                  :icon="getIcon(service.icon)"
                  class="w-5 h-5 text-amber-600 dark:text-amber-400"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {{ getServiceName(service) }}
                </h4>

                <!-- Email -->
                <a
                  v-if="service.email"
                  :href="`mailto:${service.email}`"
                  class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <font-awesome-icon icon="fa-solid fa-envelope" class="w-3 h-3" />
                  <span class="truncate">{{ service.email }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
