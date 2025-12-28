<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

// Tabs configuration
const tabs = computed(() => [
  { key: 'about', label: t('about.tabs.about'), to: '/a-propos', icon: 'fa-solid fa-info-circle', exact: true },
  { key: 'strategy', label: t('about.tabs.strategy'), to: '/a-propos/strategie', icon: 'fa-solid fa-chess' },
  { key: 'engagements', label: t('about.tabs.engagements'), to: '#engagements', icon: 'fa-solid fa-heart', isAnchor: true, anchorPage: '/a-propos' },
  { key: 'organization', label: t('about.tabs.organization'), to: '/a-propos/organisation', icon: 'fa-solid fa-sitemap' },
  { key: 'careers', label: t('about.tabs.careers'), to: '/carrieres', icon: 'fa-solid fa-briefcase' }
])

// Check if tab is active
const isActive = (tabTo: string, exact = false) => {
  if (tabTo.startsWith('#')) return false
  const currentPath = route.path
  const localizedPath = localePath(tabTo)
  if (exact) {
    return currentPath === localizedPath
  }
  return currentPath === localizedPath || currentPath.startsWith(localizedPath + '/')
}

// Check if we're on the anchor's target page
const isOnAnchorPage = (anchorPage: string) => {
  const currentPath = route.path
  const localizedPath = localePath(anchorPage)
  return currentPath === localizedPath
}

// Scroll to anchor (or navigate then scroll)
const scrollToAnchor = async (anchor: string, anchorPage?: string) => {
  // If we're not on the target page, navigate first
  if (anchorPage && !isOnAnchorPage(anchorPage)) {
    await router.push(localePath(anchorPage) + anchor)
    // Wait for navigation and DOM update
    await nextTick()
    setTimeout(() => {
      const element = document.querySelector(anchor)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  } else {
    // Already on the page, just scroll
    const element = document.querySelector(anchor)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}
</script>

<template>
  <nav
    class="sticky top-20 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-center overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <template v-for="tab in tabs" :key="tab.key">
          <!-- Anchor link -->
          <button
            v-if="tab.isAnchor"
            type="button"
            class="group flex items-center gap-2 px-3 sm:px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
            @click="scrollToAnchor(tab.to, tab.anchorPage)"
          >
            <font-awesome-icon
              :icon="tab.icon"
              class="w-4 h-4 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors duration-200"
            />
            <span class="hidden sm:inline">{{ tab.label }}</span>
          </button>

          <!-- Route link -->
          <NuxtLink
            v-else
            :to="localePath(tab.to)"
            :class="[
              'group flex items-center gap-2 px-3 sm:px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200',
              isActive(tab.to, tab.exact)
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <font-awesome-icon
              :icon="tab.icon"
              :class="[
                'w-4 h-4 transition-colors duration-200',
                isActive(tab.to, tab.exact) ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
              ]"
            />
            <span class="hidden sm:inline">{{ tab.label }}</span>
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Hide scrollbar but allow scrolling */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
