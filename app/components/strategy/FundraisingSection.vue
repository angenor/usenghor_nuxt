<script setup lang="ts">
interface FundraisingProject {
  id: string
  title: string
  slug: string
  summary: string | null
  cover_image: string | null
  formatted_budget: string
  status: string
}

interface Props {
  title: string
  subtitle?: string
  projects: FundraisingProject[]
  ctaTitle: string
  ctaText: string
  ctaButton: string
  ctaLink: string
  loading?: boolean
  backgroundImage?: string | null
}

const props = defineProps<Props>()

const localePath = useLocalePath()
const { locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// Colors for project cards (cycling)
const projectColors = [
  { bg: 'bg-brand-blue-100 dark:bg-brand-blue-900/30', text: 'text-brand-blue-600 dark:text-brand-blue-400', border: 'border-brand-blue-200 dark:border-brand-blue-800' },
  { bg: 'bg-brand-red-100 dark:bg-brand-red-900/30', text: 'text-brand-red-600 dark:text-brand-red-400', border: 'border-brand-red-200 dark:border-brand-red-800' },
  { bg: 'bg-brand-blue-100 dark:bg-brand-blue-900/30', text: 'text-brand-blue-600 dark:text-brand-blue-400', border: 'border-brand-blue-200 dark:border-brand-blue-800' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
]
</script>

<template>
  <section
    ref="sectionRef"
    class="relative py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <!-- Background image -->
    <div v-if="props.backgroundImage" class="absolute inset-0">
      <img
        :src="props.backgroundImage"
        alt=""
        class="h-full w-full object-cover"
      >
      <div class="absolute inset-0 bg-white/85 dark:bg-gray-900/90" />
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 lg:mb-16">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          <span class="relative inline-block">
            {{ props.title }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full" />
          </span>
        </h2>
        <p v-if="props.subtitle" class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ props.subtitle }}
        </p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="props.loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
        <div v-for="i in 4" :key="i" class="animate-pulse overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700">
          <div class="aspect-[16/10] bg-gray-200 dark:bg-gray-700" />
          <div class="p-5 space-y-3">
            <div class="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
            <div class="h-7 w-1/3 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      <div v-else-if="props.projects.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
        <NuxtLink
          v-for="(project, index) in props.projects"
          :key="project.id"
          :to="localePath(`/projets/${project.slug}`)"
          class="group relative overflow-hidden rounded-xl border-2 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800"
          :class="projectColors[index % projectColors.length].border"
        >
          <!-- Cover image -->
          <div class="aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              v-if="project.cover_image"
              :src="project.cover_image"
              :alt="project.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            >
            <div v-else class="flex h-full items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-folder-open" class="h-12 w-12 text-gray-300 dark:text-gray-600" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
              {{ project.title }}
            </h3>
            <p v-if="project.summary" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
              {{ project.summary }}
            </p>
            <!-- Budget badge -->
            <div
              v-if="project.formatted_budget && project.formatted_budget !== '-'"
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
              :class="[projectColors[index % projectColors.length].bg, projectColors[index % projectColors.length].text]"
            >
              <font-awesome-icon icon="fa-solid fa-coins" class="h-3.5 w-3.5" />
              {{ project.formatted_budget }}
            </div>
          </div>
        </NuxtLink>
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
