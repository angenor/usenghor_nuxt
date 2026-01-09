<script setup lang="ts">
interface Props {
  activeTab: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const route = useRoute()

const tabs = [
  { id: 'calls', label: () => t('partners.campus.tabs.calls'), icon: 'fa-solid fa-bullhorn' },
  { id: 'partners', label: () => t('partners.campus.tabs.partners'), icon: 'fa-solid fa-handshake' },
  { id: 'team', label: () => t('partners.campus.tabs.team'), icon: 'fa-solid fa-users' },
  { id: 'events', label: () => t('partners.campus.tabs.events'), icon: 'fa-solid fa-calendar-alt' },
  { id: 'news', label: () => t('partners.campus.tabs.news'), icon: 'fa-solid fa-newspaper' },
  { id: 'media', label: () => t('partners.campus.tabs.media'), icon: 'fa-solid fa-photo-film' }
]

// Build tab URL with hash anchor
const getTabUrl = (tabId: string) => {
  return `${route.path}#${tabId}`
}
</script>

<template>
  <div class="sticky top-20 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav class="flex overflow-x-auto scrollbar-hide -mb-px">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="getTabUrl(tab.id)"
          class="flex-shrink-0 flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="[
            activeTab === tab.id
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          ]"
        >
          <font-awesome-icon :icon="tab.icon" class="w-4 h-4" />
          <span class="hidden sm:inline">{{ tab.label() }}</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
