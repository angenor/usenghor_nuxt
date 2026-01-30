<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const { isCollapsed } = useAdminSidebar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Breadcrumb basé sur la route
const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(p => p && p !== 'admin')
  const items: { label: string; path: string }[] = [
    { label: 'Dashboard', path: '/admin' }
  ]

  let currentPath = '/admin'
  paths.forEach(segment => {
    currentPath += `/${segment}`
    // Formater le label (kebab-case vers Title Case)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    items.push({ label, path: currentPath })
  })

  return items
})

// Menu utilisateur
const showUserMenu = ref(false)

// TODO: Remplacer par les vraies données utilisateur
const currentUser = ref({
  name: 'Admin User',
  email: 'admin@usenghor.org',
  avatar: null as string | null
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// Fermer le menu au clic extérieur
const userMenuRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

// Déconnexion
const handleLogout = () => {
  authStore.logout()
  router.push('/admin/login')
}

// Recherche globale
const showSearchModal = ref(false)

const openSearchModal = () => {
  showSearchModal.value = true
}

// Raccourci clavier ⌘K / Ctrl+K
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    openSearchModal()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <header
    :class="[
      'fixed top-0 right-0 z-30 h-16 bg-white dark:bg-gray-900',
      'border-b border-gray-200 dark:border-gray-800',
      'transition-all duration-300',
      isCollapsed ? 'left-20' : 'left-72'
    ]"
  >
    <div class="flex items-center justify-between h-full px-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center">
        <ol class="flex items-center space-x-2">
          <li v-for="(item, index) in breadcrumbs" :key="item.path" class="flex items-center">
            <font-awesome-icon
              v-if="index > 0"
              icon="fa-solid fa-chevron-right"
              class="w-3 h-3 mx-2 text-gray-400"
            />
            <NuxtLink
              :to="item.path"
              :class="[
                'text-sm transition-colors',
                index === breadcrumbs.length - 1
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              ]"
            >
              <font-awesome-icon
                v-if="index === 0"
                icon="fa-solid fa-house"
                class="w-4 h-4"
              />
              <span v-else>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ol>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <!-- Recherche globale -->
        <button
          @click="openSearchModal"
          class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400
                 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
                 transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-search" class="w-4 h-4" />
          <span class="hidden sm:inline">Rechercher...</span>
          <kbd class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs
                      bg-gray-200 dark:bg-gray-700 rounded">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </button>

        <!-- Notifications -->
        <button
          class="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700
                 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
                 rounded-lg transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-bell" class="w-5 h-5" />
          <span
            class="absolute top-1 right-1 w-2 h-2 bg-brand-red-500 rounded-full"
          />
        </button>

        <!-- Menu utilisateur -->
        <div ref="userMenuRef" class="relative">
          <button
            @click="toggleUserMenu"
            class="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100
                   dark:hover:bg-gray-800 transition-colors"
          >
            <div
              v-if="currentUser.avatar"
              class="w-8 h-8 rounded-full bg-cover bg-center"
              :style="{ backgroundImage: `url(${currentUser.avatar})` }"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900
                     flex items-center justify-center"
            >
              <span class="text-sm font-medium text-brand-blue-700 dark:text-brand-blue-300">
                {{ currentUser.name.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ currentUser.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ currentUser.email }}
              </p>
            </div>
            <font-awesome-icon
              icon="fa-solid fa-chevron-down"
              :class="[
                'w-3 h-3 text-gray-400 transition-transform duration-200',
                showUserMenu ? 'rotate-180' : ''
              ]"
            />
          </button>

          <!-- Dropdown menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-show="showUserMenu"
              class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg
                     border border-gray-200 dark:border-gray-700 py-1 z-50"
            >
              <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ currentUser.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ currentUser.email }}
                </p>
              </div>

              <div class="py-1">
                <NuxtLink
                  to="/admin/profil"
                  class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <font-awesome-icon icon="fa-solid fa-user" class="w-4 h-4 text-gray-400" />
                  Mon profil
                </NuxtLink>
                <NuxtLink
                  to="/admin/parametres"
                  class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <font-awesome-icon icon="fa-solid fa-cog" class="w-4 h-4 text-gray-400" />
                  Paramètres
                </NuxtLink>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 py-1">
                <button
                  @click="handleLogout"
                  class="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <font-awesome-icon icon="fa-solid fa-right-from-bracket" class="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>

  <!-- Modal de recherche -->
  <AdminSearchModal v-model="showSearchModal" />
</template>
