<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

// Links configuration matching TabsNav (excluding current page)
const links = computed(() => [
  {
    key: 'strategy',
    title: t('about.tabs.strategy'),
    summary: t('about.preview.strategy.summary'),
    to: '/a-propos/strategie',
    icon: 'fa-solid fa-chess',
    color: 'emerald'
  },
  {
    key: 'engagements',
    title: t('about.tabs.engagements'),
    summary: t('about.preview.governance.summary'),
    to: '#engagements',
    icon: 'fa-solid fa-heart',
    color: 'rose',
    isAnchor: true
  },
  {
    key: 'organization',
    title: t('about.tabs.organization'),
    summary: t('about.preview.organization.summary'),
    to: '/a-propos/organisation',
    icon: 'fa-solid fa-sitemap',
    color: 'purple'
  },
  {
    key: 'careers',
    title: t('about.tabs.careers'),
    summary: t('about.preview.careers.summary'),
    to: '/carrieres',
    icon: 'fa-solid fa-briefcase',
    color: 'amber'
  }
])

// Color classes mapping
const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    hover: 'hover:border-emerald-400 dark:hover:border-emerald-600'
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    hover: 'hover:border-rose-400 dark:hover:border-rose-600'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    hover: 'hover:border-purple-400 dark:hover:border-purple-600'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    hover: 'hover:border-amber-400 dark:hover:border-amber-600'
  }
}

// Scroll to anchor
const scrollToAnchor = (anchor: string) => {
  const element = document.querySelector(anchor)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {{ t('about.preview.title') }}
        </h2>
      </div>

      <!-- Links Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <template v-for="link in links" :key="link.key">
          <!-- Anchor Card -->
          <button
            v-if="link.isAnchor"
            type="button"
            class="group text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            :class="[
              colorClasses[link.color].border,
              colorClasses[link.color].hover,
              'bg-white dark:bg-gray-900'
            ]"
            @click="scrollToAnchor(link.to)"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              :class="colorClasses[link.color].bg"
            >
              <font-awesome-icon
                :icon="link.icon"
                class="w-5 h-5"
                :class="colorClasses[link.color].text"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200">
              {{ link.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ link.summary }}
            </p>
            <div class="mt-4 flex items-center gap-2 text-sm font-medium" :class="colorClasses[link.color].text">
              <span>{{ t('common.discover') }}</span>
              <font-awesome-icon icon="fa-solid fa-arrow-down" class="w-3 h-3" />
            </div>
          </button>

          <!-- Route Card -->
          <NuxtLink
            v-else
            :to="localePath(link.to)"
            class="group p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            :class="[
              colorClasses[link.color].border,
              colorClasses[link.color].hover,
              'bg-white dark:bg-gray-900'
            ]"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              :class="colorClasses[link.color].bg"
            >
              <font-awesome-icon
                :icon="link.icon"
                class="w-5 h-5"
                :class="colorClasses[link.color].text"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200">
              {{ link.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ link.summary }}
            </p>
            <div class="mt-4 flex items-center gap-2 text-sm font-medium" :class="colorClasses[link.color].text">
              <span>{{ t('common.discover') }}</span>
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </NuxtLink>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
