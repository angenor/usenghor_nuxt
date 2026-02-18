<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const { sidebarItems } = useAdminSidebar()

const searchQuery = ref('')
const selectedIndex = ref(0)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Aplatir tous les items de navigation en une liste searchable
interface SearchableItem {
  id: string
  label: string
  description?: string
  route: string
  icon: string
  parent?: string
}

const searchableItems = computed<SearchableItem[]>(() => {
  const items: SearchableItem[] = []

  sidebarItems.value.forEach(section => {
    if (section.route) {
      items.push({
        id: section.id,
        label: section.label,
        description: section.description,
        route: section.route,
        icon: section.icon
      })
    }

    if (section.children) {
      section.children.forEach(child => {
        if (child.route) {
          items.push({
            id: child.id,
            label: child.label,
            description: child.description,
            route: child.route,
            icon: child.icon,
            parent: section.label
          })
        }
      })
    }
  })

  return items
})

// Filtrer les résultats selon la recherche
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return searchableItems.value
  }

  const query = searchQuery.value.toLowerCase()
  return searchableItems.value.filter(item => {
    const labelMatch = item.label.toLowerCase().includes(query)
    const descMatch = item.description?.toLowerCase().includes(query)
    const parentMatch = item.parent?.toLowerCase().includes(query)
    return labelMatch || descMatch || parentMatch
  })
})

// Réinitialiser la sélection quand les résultats changent
watch(filteredItems, () => {
  selectedIndex.value = 0
})

// Focus sur l'input quand le modal s'ouvre
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
    searchQuery.value = ''
    selectedIndex.value = 0
  }
})

// Fermer le modal
const closeModal = () => {
  emit('update:modelValue', false)
}

// Naviguer vers un item
const navigateToItem = (item: SearchableItem) => {
  router.push(item.route)
  closeModal()
}

// Gestion du clavier
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (selectedIndex.value < filteredItems.value.length - 1) {
        selectedIndex.value++
        scrollToSelected()
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (selectedIndex.value > 0) {
        selectedIndex.value--
        scrollToSelected()
      }
      break
    case 'Enter':
      event.preventDefault()
      if (filteredItems.value[selectedIndex.value]) {
        navigateToItem(filteredItems.value[selectedIndex.value])
      }
      break
    case 'Escape':
      closeModal()
      break
  }
}

// Scroll vers l'élément sélectionné
const scrollToSelected = () => {
  nextTick(() => {
    const selectedEl = document.querySelector('[data-selected="true"]')
    selectedEl?.scrollIntoView({ block: 'nearest' })
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
        @click.self="closeModal"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" @click="closeModal" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl
                 border border-gray-200 dark:border-gray-700 overflow-hidden"
          @keydown="handleKeydown"
        >
          <!-- Search input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <font-awesome-icon
              icon="fa-solid fa-search"
              class="w-5 h-5 text-gray-400"
            />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une page..."
              class="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400
                     outline-none text-base"
            />
            <kbd class="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-400
                        bg-gray-100 dark:bg-gray-700 rounded">
              ESC
            </kbd>
          </div>

          <!-- Results -->
          <div class="max-h-80 overflow-y-auto">
            <div v-if="filteredItems.length === 0" class="px-4 py-8 text-center">
              <font-awesome-icon
                icon="fa-solid fa-search"
                class="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Aucun résultat pour "{{ searchQuery }}"
              </p>
            </div>

            <ul v-else class="py-2">
              <li
                v-for="(item, index) in filteredItems"
                :key="item.id"
                :data-selected="index === selectedIndex"
              >
                <button
                  @click="navigateToItem(item)"
                  @mouseenter="selectedIndex = index"
                  :class="[
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    index === selectedIndex
                      ? 'bg-brand-blue-50 dark:bg-brand-blue-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  ]"
                >
                  <div
                    :class="[
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      index === selectedIndex
                        ? 'bg-brand-blue-100 dark:bg-brand-blue-800'
                        : 'bg-gray-100 dark:bg-gray-700'
                    ]"
                  >
                    <font-awesome-icon
                      :icon="item.icon"
                      :class="[
                        'w-5 h-5',
                        index === selectedIndex
                          ? 'text-brand-blue-600 dark:text-brand-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      ]"
                    />
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span
                        :class="[
                          'font-medium truncate',
                          index === selectedIndex
                            ? 'text-brand-blue-700 dark:text-brand-blue-300'
                            : 'text-gray-900 dark:text-white'
                        ]"
                      >
                        {{ item.label }}
                      </span>
                      <span
                        v-if="item.parent"
                        class="text-xs text-gray-400 dark:text-gray-500"
                      >
                        {{ item.parent }}
                      </span>
                    </div>
                    <p
                      v-if="item.description"
                      class="text-sm text-gray-500 dark:text-gray-400 truncate"
                    >
                      {{ item.description }}
                    </p>
                  </div>

                  <font-awesome-icon
                    v-if="index === selectedIndex"
                    icon="fa-solid fa-arrow-right"
                    class="w-4 h-4 text-brand-blue-500 dark:text-brand-blue-400 flex-shrink-0"
                  />
                </button>
              </li>
            </ul>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                  <font-awesome-icon icon="fa-solid fa-arrow-up" class="w-2.5 h-2.5" />
                </kbd>
                <kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                  <font-awesome-icon icon="fa-solid fa-arrow-down" class="w-2.5 h-2.5" />
                </kbd>
                naviguer
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                  Entrée
                </kbd>
                ouvrir
              </span>
            </div>
            <span class="text-xs text-gray-400">
              {{ filteredItems.length }} résultat{{ filteredItems.length > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
