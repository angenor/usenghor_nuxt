<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { departments, getFormationsByDepartment } = useMockData()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// Map department icons to Font Awesome icons
const iconMap: Record<string, string> = {
  palette: 'fa-solid fa-palette',
  leaf: 'fa-solid fa-leaf',
  briefcase: 'fa-solid fa-briefcase',
  'heart-pulse': 'fa-solid fa-heart-pulse',
  'graduation-cap': 'fa-solid fa-graduation-cap'
}

// Color classes mapping
const colorClasses: Record<string, { bg: string; bgLight: string; text: string }> = {
  '#8B5CF6': {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400'
  },
  '#10B981': {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
  '#F59E0B': {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400'
  },
  '#EF4444': {
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-600 dark:text-rose-400'
  },
  '#6366F1': {
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400'
  }
}

const getIcon = (icon: string) => iconMap[icon] || 'fa-solid fa-building'
const getColors = (hexColor: string) => colorClasses[hexColor] || colorClasses['#F59E0B']

// Get department name based on locale
const getDeptName = (dept: any) => {
  if (locale.value === 'ar') return dept.name_ar
  if (locale.value === 'en') return dept.name_en
  return dept.name_fr
}

// Get department description based on locale
const getDeptDescription = (dept: any) => {
  if (locale.value === 'ar') return dept.description_ar || dept.description_fr
  if (locale.value === 'en') return dept.description_en || dept.description_fr
  return dept.description_fr
}

// Get formation name based on locale
const getFormationName = (formation: any) => {
  if (locale.value === 'ar') return formation.title_ar || formation.title_fr
  if (locale.value === 'en') return formation.title_en || formation.title_fr
  return formation.title_fr
}
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300"
  >
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 lg:mb-16">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          <span class="relative inline-block">
            {{ t('organization.departments.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
          </span>
        </h2>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('organization.departments.subtitle') }}
        </p>
      </div>

      <!-- Departments as mini-sections -->
      <div class="space-y-12">
        <div
          v-for="(dept, index) in departments"
          :key="dept.id"
        >
          <!-- Department header with icon -->
          <div class="flex items-center gap-4 mb-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="getColors(dept.color).bg"
            >
              <font-awesome-icon
                :icon="getIcon(dept.icon)"
                class="w-6 h-6 text-white"
              />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ getDeptName(dept) }}
              </h3>
            </div>
          </div>

          <!-- Description -->
          <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {{ getDeptDescription(dept) }}
          </p>

          <!-- Formations list -->
          <div v-if="getFormationsByDepartment(dept.id).length > 0">
            <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              {{ t('organization.departments.view_programs') }}
            </h4>
            <div class="flex flex-wrap gap-3">
              <NuxtLink
                v-for="formation in getFormationsByDepartment(dept.id)"
                :key="formation.id"
                :to="localePath(`/formations/${formation.slug}`)"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md"
                :class="[getColors(dept.color).bgLight, getColors(dept.color).text]"
              >
                <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-3.5 h-3.5" />
                {{ getFormationName(formation) }}
              </NuxtLink>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
            {{ t('organization.departments.no_programs') }}
          </p>

          <!-- Separator -->
          <div
            v-if="index < departments.length - 1"
            class="mt-12 border-b border-gray-200 dark:border-gray-700"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>
