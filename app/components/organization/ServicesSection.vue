<script setup lang="ts">
const { t, locale } = useI18n()
const { getServicesByCategory } = useMockData()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Animations staggerées pour chaque catégorie
const categoryRefs = ref<HTMLElement[]>([])

onMounted(() => {
  categoryRefs.value.forEach((el, catIndex) => {
    if (!el) return
    const cards = el.querySelectorAll<HTMLElement>('[data-service]')

    cards.forEach((card, cardIndex) => {
      card.style.opacity = '0'
      card.style.transform = 'translateY(20px)'
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cards.forEach((card, cardIndex) => {
              setTimeout(() => {
                card.classList.add('animate__animated', 'animate__fadeInUp')
                card.style.opacity = '1'
                card.style.transform = 'translateY(0)'
              }, cardIndex * 100)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
  })
})

// Service categories
const categories = ['rectorat', 'academique', 'administratif'] as const

// Category colors
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  rectorat: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800'
  },
  academique: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  administratif: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800'
  }
}

// Map service icons to Font Awesome icons
const iconMap: Record<string, string> = {
  'building-columns': 'fa-solid fa-building-columns',
  megaphone: 'fa-solid fa-bullhorn',
  map: 'fa-solid fa-map',
  rocket: 'fa-solid fa-rocket',
  globe: 'fa-solid fa-globe',
  users: 'fa-solid fa-users',
  lightbulb: 'fa-solid fa-lightbulb',
  'book-open': 'fa-solid fa-book-open',
  'clipboard-list': 'fa-solid fa-clipboard-list',
  server: 'fa-solid fa-server',
  video: 'fa-solid fa-video',
  calculator: 'fa-solid fa-calculator',
  'users-cog': 'fa-solid fa-users-gear',
  'check-circle': 'fa-solid fa-circle-check',
  plane: 'fa-solid fa-plane',
  home: 'fa-solid fa-house'
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
            {{ t('organization.services.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
          </span>
        </h2>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('organization.services.subtitle') }}
        </p>
      </div>

      <!-- Services by Category -->
      <div class="space-y-12">
        <div
          v-for="(category, catIndex) in categories"
          :key="category"
          :ref="(el) => { if (el) categoryRefs[catIndex] = el as HTMLElement }"
        >
          <!-- Category Title -->
          <div class="flex items-center justify-center gap-3 mb-6">
            <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
            <h3 class="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ t(`organization.services.categories.${category}`) }}
            </h3>
            <div class="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <!-- Services Grid -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="service in getServicesByCategory(category)"
              :key="service.id"
              data-service
              class="group bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              :class="categoryColors[category].border"
            >
              <div class="flex items-start gap-4">
                <!-- Icon -->
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  :class="categoryColors[category].bg"
                >
                  <font-awesome-icon
                    :icon="getIcon(service.icon)"
                    class="w-5 h-5"
                    :class="categoryColors[category].text"
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
    </div>
  </section>
</template>
