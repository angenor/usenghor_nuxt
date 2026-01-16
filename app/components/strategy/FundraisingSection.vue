<script setup lang="ts">
interface Project {
  id: string
  icon: string
  title: string
  description: string
  amount?: string
}

interface Props {
  title: string
  subtitle?: string
  projects: Project[]
  ctaTitle: string
  ctaText: string
  ctaButton: string
  ctaLink: string
}

const props = defineProps<Props>()

const localePath = useLocalePath()
const { locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// Map icon names to Font Awesome icons
const getIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'graduation-cap': 'fa-solid fa-graduation-cap',
    building: 'fa-solid fa-building',
    flask: 'fa-solid fa-flask',
    book: 'fa-solid fa-book',
    heart: 'fa-solid fa-heart',
    users: 'fa-solid fa-users'
  }
  return iconMap[iconName] || 'fa-solid fa-star'
}

// Colors for project cards
const projectColors = [
  { bg: 'bg-brand-blue-100 dark:bg-brand-blue-900/30', icon: 'text-brand-blue-600 dark:text-brand-blue-400', border: 'border-brand-blue-200 dark:border-brand-blue-800' },
  { bg: 'bg-brand-red-100 dark:bg-brand-red-900/30', icon: 'text-brand-red-600 dark:text-brand-red-400', border: 'border-brand-red-200 dark:border-brand-red-800' },
  { bg: 'bg-brand-blue-100 dark:bg-brand-blue-900/30', icon: 'text-brand-blue-600 dark:text-brand-blue-400', border: 'border-brand-blue-200 dark:border-brand-blue-800' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' }
]
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
            {{ props.title }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>
        <p v-if="props.subtitle" class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ props.subtitle }}
        </p>
      </div>

      <!-- Projects Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
        <div
          v-for="(project, index) in props.projects"
          :key="project.id"
          class="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          :class="projectColors[index % projectColors.length].border"
        >
          <!-- Icon -->
          <div
            class="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
            :class="projectColors[index % projectColors.length].bg"
          >
            <font-awesome-icon
              :icon="getIcon(project.icon)"
              class="w-7 h-7"
              :class="projectColors[index % projectColors.length].icon"
            />
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {{ project.title }}
          </h3>

          <!-- Description -->
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            {{ project.description }}
          </p>

          <!-- Amount -->
          <div
            v-if="project.amount"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
            :class="[projectColors[index % projectColors.length].bg, projectColors[index % projectColors.length].icon]"
          >
            {{ project.amount }}
          </div>
        </div>
      </div>

      <!-- CTA Block -->
      <div class="bg-brand-blue-50 dark:bg-brand-blue-900/20 rounded-2xl p-8 lg:p-12 text-center">
        <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {{ props.ctaTitle }}
        </h3>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          {{ props.ctaText }}
        </p>
        <NuxtLink
          :to="localePath(props.ctaLink)"
          class="group inline-flex items-center gap-3 px-8 py-4 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-brand-blue-500/30 hover:-translate-y-0.5"
        >
          <font-awesome-icon icon="fa-solid fa-envelope" class="w-5 h-5" />
          <span>{{ props.ctaButton }}</span>
          <font-awesome-icon
            :icon="isRtl ? 'fa-solid fa-arrow-left' : 'fa-solid fa-arrow-right'"
            class="w-4 h-4 transition-transform duration-300"
            :class="isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
