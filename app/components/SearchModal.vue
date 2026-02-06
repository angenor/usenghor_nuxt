<script setup lang="ts">
import { refDebounced } from '@vueuse/core'

const { t } = useI18n()
const localePath = useLocalePath()
const { search, popularSuggestions } = useGlobalSearch()

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const searchQuery = ref('')
const selectedIndex = ref(-1)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Recherche avec debounce pour performance
const debouncedQuery = refDebounced(searchQuery, 150)

// Résultats filtrés via le composable de recherche globale
const filteredResults = computed(() => {
  if (!debouncedQuery.value.trim()) return []
  return search(debouncedQuery.value, 8)
})

// Grouper les résultats par type pour l'affichage
const groupedResults = computed(() => {
  const groups: Record<string, typeof filteredResults.value> = {}

  for (const result of filteredResults.value) {
    if (!groups[result.type]) {
      groups[result.type] = []
    }
    groups[result.type].push(result)
  }

  return groups
})

// Labels des types
const typeLabels: Record<string, string> = {
  formation: 'Formations',
  event: 'Événements',
  call: 'Appels',
  news: 'Actualités',
  page: 'Pages'
}

// Couleurs des badges par type
const typeBadgeColors: Record<string, string> = {
  formation: 'bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-900/30 dark:text-brand-blue-400',
  event: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  call: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  news: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  page: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

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
  if (e.key === 'Enter' && selectedIndex.value >= 0 && filteredResults.value[selectedIndex.value]) {
    const route = filteredResults.value[selectedIndex.value].route
    navigateTo(localePath(route))
    closeModal()
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

// Reset selection quand les résultats changent
watch(filteredResults, () => {
  selectedIndex.value = -1
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
        class="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
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
            <div class="max-h-[60vh] overflow-y-auto">
              <!-- Search Results -->
              <div v-if="searchQuery && filteredResults.length > 0" class="p-3">
                <!-- Affichage par groupes -->
                <div v-for="(results, type) in groupedResults" :key="type" class="mb-4 last:mb-0">
                  <!-- En-tête de groupe -->
                  <div class="flex items-center gap-2 px-2 py-1.5 mb-1">
                    <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {{ typeLabels[type] || type }}
                    </span>
                    <span class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {{ results.length }}
                    </span>
                  </div>

                  <!-- Résultats du groupe -->
                  <div class="space-y-1">
                    <NuxtLink
                      v-for="(item, idx) in results"
                      :key="item.id"
                      :to="localePath(item.route)"
                      class="group flex items-start gap-3 p-3 rounded-xl transition-all duration-200"
                      :class="[
                        filteredResults.indexOf(item) === selectedIndex
                          ? 'bg-brand-blue-50 dark:bg-brand-blue-900/20 ring-1 ring-brand-blue-500/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      ]"
                      @click="closeModal"
                    >
                      <!-- Icône ou Image -->
                      <div class="flex-shrink-0">
                        <div
                          v-if="item.image"
                          class="w-12 h-12 rounded-lg overflow-hidden"
                        >
                          <img
                            :src="item.image"
                            :alt="item.title"
                            class="w-full h-full object-cover"
                          />
                        </div>
                        <div
                          v-else
                          class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-colors"
                          :class="filteredResults.indexOf(item) === selectedIndex ? 'bg-brand-blue-100 dark:bg-brand-blue-900/40' : 'group-hover:bg-gray-200 dark:group-hover:bg-gray-700'"
                        >
                          <font-awesome-icon
                            :icon="item.icon"
                            class="w-5 h-5 transition-colors"
                            :class="filteredResults.indexOf(item) === selectedIndex ? 'text-brand-blue-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'"
                          />
                        </div>
                      </div>

                      <!-- Contenu -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                          <p class="font-medium text-gray-900 dark:text-white truncate group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                            {{ item.title }}
                          </p>
                          <span
                            class="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-semibold uppercase rounded"
                            :class="typeBadgeColors[item.type]"
                          >
                            {{ typeLabels[item.type] }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {{ item.subtitle }}
                        </p>
                        <p
                          v-if="item.description"
                          class="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5"
                        >
                          {{ item.description }}
                        </p>
                      </div>

                      <!-- Flèche -->
                      <div class="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 text-gray-400" />
                      </div>
                    </NuxtLink>
                  </div>
                </div>

                <!-- Message d'indication -->
                <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 px-2">
                  <p class="text-xs text-gray-400 dark:text-gray-500">
                    {{ filteredResults.length }} résultat{{ filteredResults.length > 1 ? 's' : '' }} trouvé{{ filteredResults.length > 1 ? 's' : '' }}
                    <span v-if="filteredResults.length >= 8">
                      • Affinez votre recherche pour plus de précision
                    </span>
                  </p>
                </div>
              </div>

              <!-- No Results -->
              <div v-else-if="searchQuery && searchQuery.length >= 2 && !filteredResults.length" class="text-center py-12 px-4">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-search" class="w-8 h-8 text-gray-300 dark:text-gray-600" />
                </div>
                <p class="text-gray-900 dark:text-white font-medium mb-1">{{ t('search.noResultsTitle') }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Aucun résultat pour "{{ searchQuery }}"
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Essayez avec d'autres mots-clés ou vérifiez l'orthographe
                </p>
              </div>

              <!-- Min characters message -->
              <div v-else-if="searchQuery && searchQuery.length < 2" class="text-center py-8 px-4">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Tapez au moins 2 caractères pour rechercher
                </p>
              </div>

              <!-- Popular Suggestions (when empty) -->
              <div v-else class="p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
                  {{ t('search.popularSearches') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="suggestion in popularSuggestions"
                    :key="suggestion.title"
                    :to="localePath(suggestion.route)"
                    class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-brand-blue-500 hover:text-white transition-all duration-200"
                    @click="closeModal"
                  >
                    <font-awesome-icon :icon="suggestion.icon" class="w-4 h-4" />
                    {{ suggestion.title }}
                  </NuxtLink>
                </div>

                <!-- Quick access categories -->
                <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
                    Accès rapide
                  </p>
                  <div class="grid grid-cols-2 gap-2">
                    <NuxtLink
                      :to="localePath('/formations')"
                      class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-brand-blue-50 dark:hover:bg-brand-blue-900/20 transition-colors group"
                      @click="closeModal"
                    >
                      <div class="w-10 h-10 rounded-lg bg-brand-blue-100 dark:bg-brand-blue-900/30 flex items-center justify-center">
                        <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-5 h-5 text-brand-blue-600 dark:text-brand-blue-400" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400">Formations</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Masters, Doctorats, DU</p>
                      </div>
                    </NuxtLink>
                    <NuxtLink
                      :to="localePath('/actualites/appels')"
                      class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                      @click="closeModal"
                    >
                      <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">Appels</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Candidatures, Bourses</p>
                      </div>
                    </NuxtLink>
                    <NuxtLink
                      :to="localePath('/actualites/evenements')"
                      class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                      @click="closeModal"
                    >
                      <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <font-awesome-icon icon="fa-solid fa-calendar-days" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">Événements</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Conférences, Ateliers</p>
                      </div>
                    </NuxtLink>
                    <NuxtLink
                      :to="localePath('/actualites')"
                      class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                      @click="closeModal"
                    >
                      <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <font-awesome-icon icon="fa-solid fa-newspaper" class="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">Actualités</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">News, Annonces</p>
                      </div>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
              <div class="flex items-center justify-between text-xs text-gray-400">
                <span class="flex items-center gap-4">
                  <span class="flex items-center gap-1.5">
                    <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <font-awesome-icon icon="fa-solid fa-arrow-up" class="w-2.5 h-2.5" />
                    </kbd>
                    <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <font-awesome-icon icon="fa-solid fa-arrow-down" class="w-2.5 h-2.5" />
                    </kbd>
                    <span>naviguer</span>
                  </span>
                  <span class="flex items-center gap-1.5">
                    <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <font-awesome-icon icon="fa-solid fa-turn-down fa-rotate-90" class="w-2.5 h-2.5" />
                    </kbd>
                    <span>ouvrir</span>
                  </span>
                </span>
                <span class="flex items-center gap-1.5">
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
