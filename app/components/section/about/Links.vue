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
    icon: 'fa-solid fa-chess'
  },
  {
    key: 'engagements',
    title: t('about.tabs.engagements'),
    summary: t('about.preview.governance.summary'),
    to: '#engagements',
    icon: 'fa-solid fa-heart',
    isAnchor: true
  },
  {
    key: 'organization',
    title: t('about.tabs.organization'),
    summary: t('about.preview.organization.summary'),
    to: '/a-propos/organisation',
    icon: 'fa-solid fa-sitemap'
  },
  {
    key: 'careers',
    title: t('about.tabs.careers'),
    summary: t('about.preview.careers.summary'),
    to: '/carrieres',
    icon: 'fa-solid fa-briefcase'
  }
])

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
    class="py-16 lg:py-20 bg-gray-50 dark:bg-gray-800 bg-grid-pattern transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          <span class="relative inline-block">
            {{ t('about.preview.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>
      </div>

      <!-- Links Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <template v-for="link in links" :key="link.key">
          <!-- Anchor Card -->
          <button
            v-if="link.isAnchor"
            type="button"
            class="group text-center p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-400 dark:hover:border-gray-500"
            @click="scrollToAnchor(link.to)"
          >
            <div class="mb-4 flex justify-center">
              <font-awesome-icon
                :icon="link.icon"
                class="w-6 h-6 text-gray-500 dark:text-gray-400"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200">
              {{ link.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ link.summary }}
            </p>
            <div class="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <span>{{ t('common.discover') }}</span>
              <font-awesome-icon icon="fa-solid fa-arrow-down" class="w-3 h-3" />
            </div>
          </button>

          <!-- Route Card -->
          <NuxtLink
            v-else
            :to="localePath(link.to)"
            class="group text-center p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-400 dark:hover:border-gray-500"
          >
            <div class="mb-4 flex justify-center">
              <font-awesome-icon
                :icon="link.icon"
                class="w-6 h-6 text-gray-500 dark:text-gray-400"
              />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200">
              {{ link.title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ link.summary }}
            </p>
            <div class="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
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
