<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const searchQuery = ref('')
const selectedIndex = ref(-1)
const searchInputRef = ref<HTMLInputElement | null>(null)

const searchData = [
  { id: 1, type: 'formation', title: 'Master Administration des Entreprises', subtitle: 'Formation • 2 ans', icon: 'fa-solid fa-graduation-cap', route: '/formations/masters' },
  { id: 2, type: 'formation', title: 'Master Gestion du Patrimoine Culturel', subtitle: 'Formation • 2 ans', icon: 'fa-solid fa-graduation-cap', route: '/formations/masters' },
  { id: 3, type: 'news', title: 'Appel à candidatures Master 2025', subtitle: 'Actualité', icon: 'fa-solid fa-bullhorn', route: '/actualites/appels' },
  { id: 4, type: 'about', title: 'Campus d\'Alexandrie', subtitle: 'À propos', icon: 'fa-solid fa-map-location-dot', route: '/site' }
]

const popularSuggestions = [
  { title: 'Masters', icon: 'fa-solid fa-graduation-cap', route: '/formations/masters' },
  { title: 'Candidatures', icon: 'fa-solid fa-bullhorn', route: '/actualites/appels' },
  { title: 'Alumni', icon: 'fa-solid fa-user-graduate', route: '/alumni' },
  { title: 'Campus', icon: 'fa-solid fa-map-location-dot', route: '/site' }
]

const filteredResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return searchData.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.subtitle.toLowerCase().includes(query)
  ).slice(0, 6)
})

const closeModal = () => {
  searchQuery.value = ''
  selectedIndex.value = -1
  emit('close')
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeModal()
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredResults.value.length - 1)
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => searchInputRef.value?.focus())
  } else {
    searchQuery.value = ''
    selectedIndex.value = -1
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
        @click.self="closeModal"
      >
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-md"></div>

        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <!-- Search Input -->
            <div class="border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center px-5 py-4">
                <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="w-5 h-5 text-gray-400 mr-4" />
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  :placeholder="t('search.placeholder')"
                  class="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-lg"
                  @keydown="handleKeydown"
                />
                <button
                  @click="closeModal"
                  class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Results -->
            <div class="max-h-[60vh] overflow-y-auto p-4">
              <!-- Search Results -->
              <div v-if="searchQuery && filteredResults.length > 0" class="space-y-2">
                <NuxtLink
                  v-for="(item, idx) in filteredResults"
                  :key="item.id"
                  :to="item.route"
                  class="flex items-center gap-4 p-3 rounded-xl transition-colors"
                  :class="[
                    idx === selectedIndex
                      ? 'bg-brand-blue-50 dark:bg-brand-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  ]"
                  @click="closeModal"
                >
                  <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <font-awesome-icon :icon="item.icon" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.title }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.subtitle }}</p>
                  </div>
                </NuxtLink>
              </div>

              <!-- No Results -->
              <div v-else-if="searchQuery && !filteredResults.length" class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">{{ t('search.noResultsTitle') }}</p>
              </div>

              <!-- Popular Suggestions -->
              <div v-else class="space-y-4">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                  {{ t('search.popularSearches') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="suggestion in popularSuggestions"
                    :key="suggestion.title"
                    :to="suggestion.route"
                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-brand-blue-500 hover:text-white transition-colors"
                    @click="closeModal"
                  >
                    <font-awesome-icon :icon="suggestion.icon" class="w-3.5 h-3.5" />
                    {{ suggestion.title }}
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
              <div class="flex items-center justify-between text-xs text-gray-400">
                <span class="flex items-center gap-2">
                  <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">ESC</kbd>
                  {{ t('search.close') }}
                </span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
