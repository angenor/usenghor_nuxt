<script setup lang="ts">
const { t, tm } = useI18n()
const localePath = useLocalePath()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Get translated array
const whyItems = computed(() => tm('careers.students.why.items') as string[])

// Programs cards
const programs = [
  {
    key: 'masters',
    icon: 'fa-solid fa-graduation-cap',
    link: '/formations/masters',
    color: 'blue'
  },
  {
    key: 'doctoral',
    icon: 'fa-solid fa-flask',
    link: '/formations/doctorat',
    color: 'purple'
  },
  {
    key: 'diplomes',
    icon: 'fa-solid fa-certificate',
    link: '/formations/diplomes',
    color: 'amber'
  },
  {
    key: 'certifications',
    icon: 'fa-solid fa-award',
    link: '/formations/certifications',
    color: 'emerald'
  }
]

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800 hover:border-blue-400'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800 hover:border-purple-400'
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800 hover:border-amber-400'
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'
  }
}
</script>

<template>
  <section
    id="etudiants"
    ref="sectionRef"
    class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300 scroll-mt-20"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="max-w-3xl mx-auto text-center mb-12">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-3.5 h-3.5 mr-2" />
          {{ t('careers.opportunities.students.title') }}
        </span>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('careers.students.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          {{ t('careers.students.text') }}
        </p>
      </div>

      <!-- Why study with us -->
      <div class="max-w-3xl mx-auto mb-12">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          {{ t('careers.students.why.title') }}
        </h3>
        <div class="flex flex-wrap justify-center gap-3">
          <span
            v-for="(item, index) in whyItems"
            :key="index"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300"
          >
            <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3 text-blue-500" />
            {{ item }}
          </span>
        </div>
      </div>

      <!-- Programs grid -->
      <div class="mb-12">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
          {{ t('careers.students.programs.title') }}
        </h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="program in programs"
            :key="program.key"
            :to="localePath(program.link)"
            class="group bg-white dark:bg-gray-900 rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            :class="colorClasses[program.color].border"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
              :class="colorClasses[program.color].bg"
            >
              <font-awesome-icon
                :icon="program.icon"
                class="w-5 h-5"
                :class="colorClasses[program.color].icon"
              />
            </div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">
              {{ t(`careers.students.programs.${program.key}.title`) }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {{ t(`careers.students.programs.${program.key}.description`) }}
            </p>
          </NuxtLink>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <div class="inline-block p-8 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ t('careers.students.cta.title') }}
          </h4>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            {{ t('careers.students.cta.text') }}
          </p>
          <NuxtLink
            :to="localePath('/inscription')"
            class="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            <font-awesome-icon icon="fa-solid fa-file-pen" class="w-5 h-5" />
            {{ t('careers.students.cta.button') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
