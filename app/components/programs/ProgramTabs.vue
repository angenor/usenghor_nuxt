<script setup lang="ts">
interface Props {
  activeTab: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const route = useRoute()

const tabs = [
  { id: 'presentation', label: () => t('formations.detail.tabs.presentation'), icon: 'fa-solid fa-file-lines' },
  { id: 'actualites', label: () => t('formations.detail.tabs.actualites'), icon: 'fa-solid fa-newspaper' },
  { id: 'mediatheque', label: () => t('formations.detail.tabs.mediatheque'), icon: 'fa-solid fa-photo-film' },
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
              ? 'border-brand-blue-500 text-brand-blue-600 dark:text-brand-blue-400'
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
