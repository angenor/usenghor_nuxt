<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { departments, getServicesByCategory } = useMockData()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Services par catégorie
const rectoratServices = computed(() => getServicesByCategory('rectorat'))
const academiqueServices = computed(() => getServicesByCategory('academique'))
const administratifServices = computed(() => getServicesByCategory('administratif'))

// Animations staggerées pour chaque groupe
const groupRefs = ref<HTMLElement[]>([])

onMounted(() => {
  groupRefs.value.forEach((el) => {
    if (!el) return
    const cards = el.querySelectorAll<HTMLElement>('[data-card]')

    cards.forEach((card) => {
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
              }, cardIndex * 80)
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

// Couleurs par groupe
const groupColors = {
  rectorat: {
    bg: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
    text: 'text-brand-blue-600 dark:text-brand-blue-400',
    border: 'border-brand-blue-200 dark:border-brand-blue-800',
    line: 'bg-brand-blue-200 dark:bg-brand-blue-800'
  },
  departements: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    line: 'bg-purple-200 dark:bg-purple-800'
  },
  academique: {
    bg: 'bg-brand-red-100 dark:bg-brand-red-900/30',
    text: 'text-brand-red-600 dark:text-brand-red-400',
    border: 'border-brand-red-200 dark:border-brand-red-800',
    line: 'bg-brand-red-200 dark:bg-brand-red-800'
  },
  administratif: {
    bg: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
    text: 'text-brand-blue-600 dark:text-brand-blue-400',
    border: 'border-brand-blue-200 dark:border-brand-blue-800',
    line: 'bg-brand-blue-200 dark:bg-brand-blue-800'
  }
}

// Map icons pour services
const serviceIconMap: Record<string, string> = {
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

// Map icons pour départements
const deptIconMap: Record<string, string> = {
  palette: 'fa-solid fa-palette',
  leaf: 'fa-solid fa-leaf',
  briefcase: 'fa-solid fa-briefcase',
  'heart-pulse': 'fa-solid fa-heart-pulse',
  'graduation-cap': 'fa-solid fa-graduation-cap'
}

const getServiceIcon = (icon: string) => serviceIconMap[icon] || 'fa-solid fa-building'
const getDeptIcon = (icon: string) => deptIconMap[icon] || 'fa-solid fa-building'

// Get localized names
const getServiceName = (service: any) => {
  if (locale.value === 'ar') return service.name_ar
  if (locale.value === 'en') return service.name_en
  return service.name_fr
}

const getDeptName = (dept: any) => {
  if (locale.value === 'ar') return dept.name_ar
  if (locale.value === 'en') return dept.name_en
  return dept.name_fr
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
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('organization.intro.text') }}
        </p>
      </div>

      <!-- 4 Groupes -->
      <div class="space-y-12">

        <!-- 1. RECTORAT -->
        <div :ref="(el) => { if (el) groupRefs[0] = el as HTMLElement }">
          <!-- Category Title -->
          <div class="flex items-center justify-center gap-3 mb-6">
            <div class="h-px flex-1" :class="groupColors.rectorat.line"></div>
            <h3 class="text-lg font-semibold uppercase tracking-wider" :class="groupColors.rectorat.text">
              {{ t('organization.services.categories.rectorat') }}
            </h3>
            <div class="h-px flex-1" :class="groupColors.rectorat.line"></div>
          </div>

          <!-- Services Grid -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="service in rectoratServices"
              :key="service.id"
              :to="localePath(`/a-propos/organisation/service/${service.slug}`)"
              data-card
              class="group bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              :class="groupColors.rectorat.border"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  :class="groupColors.rectorat.bg"
                >
                  <font-awesome-icon
                    :icon="getServiceIcon(service.icon)"
                    class="w-5 h-5"
                    :class="groupColors.rectorat.text"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {{ getServiceName(service) }}
                  </h4>
                  <span class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
                    <span>{{ t('organization.departments.view_programs') }}</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- 2. DÉPARTEMENTS -->
        <div :ref="(el) => { if (el) groupRefs[1] = el as HTMLElement }">
          <!-- Category Title -->
          <div class="flex items-center justify-center gap-3 mb-6">
            <div class="h-px flex-1" :class="groupColors.departements.line"></div>
            <h3 class="text-lg font-semibold uppercase tracking-wider" :class="groupColors.departements.text">
              {{ t('organization.services.categories.departements') }}
            </h3>
            <div class="h-px flex-1" :class="groupColors.departements.line"></div>
          </div>

          <!-- Departments Grid -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="dept in departments"
              :key="dept.id"
              :to="localePath(`/a-propos/organisation/departement/${dept.slug}`)"
              data-card
              class="group bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              :class="groupColors.departements.border"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  :class="groupColors.departements.bg"
                >
                  <font-awesome-icon
                    :icon="getDeptIcon(dept.icon)"
                    class="w-5 h-5"
                    :class="groupColors.departements.text"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {{ getDeptName(dept) }}
                  </h4>
                  <span class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
                    <span>{{ t('organization.departments.view_programs') }}</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- 3. SERVICES ACADÉMIQUES -->
        <div :ref="(el) => { if (el) groupRefs[2] = el as HTMLElement }">
          <!-- Category Title -->
          <div class="flex items-center justify-center gap-3 mb-6">
            <div class="h-px flex-1" :class="groupColors.academique.line"></div>
            <h3 class="text-lg font-semibold uppercase tracking-wider" :class="groupColors.academique.text">
              {{ t('organization.services.categories.academique') }}
            </h3>
            <div class="h-px flex-1" :class="groupColors.academique.line"></div>
          </div>

          <!-- Services Grid -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="service in academiqueServices"
              :key="service.id"
              :to="localePath(`/a-propos/organisation/service/${service.slug}`)"
              data-card
              class="group bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              :class="groupColors.academique.border"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  :class="groupColors.academique.bg"
                >
                  <font-awesome-icon
                    :icon="getServiceIcon(service.icon)"
                    class="w-5 h-5"
                    :class="groupColors.academique.text"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {{ getServiceName(service) }}
                  </h4>
                  <span class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-brand-red-600 dark:group-hover:text-brand-red-400 transition-colors">
                    <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
                    <span>{{ t('organization.departments.view_programs') }}</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- 4. SERVICES ADMINISTRATIFS -->
        <div :ref="(el) => { if (el) groupRefs[3] = el as HTMLElement }">
          <!-- Category Title -->
          <div class="flex items-center justify-center gap-3 mb-6">
            <div class="h-px flex-1" :class="groupColors.administratif.line"></div>
            <h3 class="text-lg font-semibold uppercase tracking-wider" :class="groupColors.administratif.text">
              {{ t('organization.services.categories.administratif') }}
            </h3>
            <div class="h-px flex-1" :class="groupColors.administratif.line"></div>
          </div>

          <!-- Services Grid -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="service in administratifServices"
              :key="service.id"
              :to="localePath(`/a-propos/organisation/service/${service.slug}`)"
              data-card
              class="group bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              :class="groupColors.administratif.border"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  :class="groupColors.administratif.bg"
                >
                  <font-awesome-icon
                    :icon="getServiceIcon(service.icon)"
                    class="w-5 h-5"
                    :class="groupColors.administratif.text"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {{ getServiceName(service) }}
                  </h4>
                  <span class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
                    <span>{{ t('organization.departments.view_programs') }}</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
