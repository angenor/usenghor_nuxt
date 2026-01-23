<script setup lang="ts">
const {
  sidebarItems,
  isCollapsed,
  toggleCollapse,
  toggleMenu,
  isMenuExpanded,
  isRouteActive,
  hasActiveChild
} = useAdminSidebar()

const { isDark, toggle: toggleDarkMode } = useDarkMode()
</script>

<template>
  <aside
    :class="[
      'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out',
      'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
      'flex flex-col',
      isCollapsed ? 'w-20' : 'w-72'
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
      <NuxtLink
        to="/admin"
        class="flex items-center gap-3 overflow-hidden"
      >
        <div class="flex-shrink-0 w-10 h-10 bg-brand-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">U</span>
        </div>
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div v-if="!isCollapsed" class="flex flex-col">
            <span class="font-semibold text-gray-900 dark:text-white text-sm">USenghor</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">Administration</span>
          </div>
        </Transition>
      </NuxtLink>

      <button
        v-if="!isCollapsed"
        @click="toggleCollapse"
        class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
               hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        title="Réduire le menu"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <ul class="space-y-1">
        <li v-for="item in sidebarItems" :key="item.id">
          <!-- Item sans enfants (lien direct) -->
          <NuxtLink
            v-if="!item.children"
            :to="item.route"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              'group relative',
              isRouteActive(item.route)
                ? 'bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            :title="isCollapsed ? item.label : ''"
          >
            <font-awesome-icon
              :icon="item.icon"
              :class="[
                'w-5 h-5 flex-shrink-0 transition-colors',
                isRouteActive(item.route)
                  ? 'text-brand-blue-600 dark:text-brand-blue-400'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
              ]"
            />
            <Transition
              enter-active-class="transition-opacity duration-200"
              leave-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <span v-if="!isCollapsed" class="text-sm font-medium truncate">
                {{ item.label }}
              </span>
            </Transition>

            <!-- Indicateur actif -->
            <span
              v-if="isRouteActive(item.route)"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-blue-600 dark:bg-brand-blue-400 rounded-r-full"
            />
          </NuxtLink>

          <!-- Item avec enfants (menu déroulant) -->
          <div v-else>
            <button
              @click="toggleMenu(item.id)"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'group relative',
                hasActiveChild(item)
                  ? 'bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
              :title="isCollapsed ? item.label : ''"
            >
              <font-awesome-icon
                :icon="item.icon"
                :class="[
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  hasActiveChild(item)
                    ? 'text-brand-blue-600 dark:text-brand-blue-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                ]"
              />
              <Transition
                enter-active-class="transition-opacity duration-200"
                leave-active-class="transition-opacity duration-200"
                enter-from-class="opacity-0"
                leave-to-class="opacity-0"
              >
                <span v-if="!isCollapsed" class="flex-1 text-sm font-medium text-left truncate">
                  {{ item.label }}
                </span>
              </Transition>
              <font-awesome-icon
                v-if="!isCollapsed"
                icon="fa-solid fa-chevron-down"
                :class="[
                  'w-3 h-3 transition-transform duration-200',
                  isMenuExpanded(item.id) ? 'rotate-180' : ''
                ]"
              />

              <!-- Indicateur actif pour parent -->
              <span
                v-if="hasActiveChild(item)"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-blue-600 dark:bg-brand-blue-400 rounded-r-full"
              />
            </button>

            <!-- Sous-menu -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              leave-active-class="transition-all duration-200 ease-in"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0"
            >
              <ul
                v-show="isMenuExpanded(item.id) && !isCollapsed"
                class="mt-1 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1 overflow-hidden"
              >
                <li v-for="child in item.children" :key="child.id">
                  <NuxtLink
                    :to="child.route"
                    :class="[
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                      'group text-sm',
                      isRouteActive(child.route)
                        ? 'bg-brand-blue-50 dark:bg-brand-blue-900/20 text-brand-blue-700 dark:text-brand-blue-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    ]"
                  >
                    <font-awesome-icon
                      :icon="child.icon"
                      :class="[
                        'w-4 h-4 flex-shrink-0',
                        isRouteActive(child.route)
                          ? 'text-brand-blue-600 dark:text-brand-blue-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      ]"
                    />
                    <span class="truncate">{{ child.label }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </Transition>
          </div>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
      <!-- Toggle collapse (visible quand collapsed) -->
      <button
        v-if="isCollapsed"
        @click="toggleCollapse"
        class="w-full flex items-center justify-center p-2.5 text-gray-500 hover:text-gray-700
               dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
               rounded-lg transition-colors"
        title="Étendre le menu"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-4 h-4" />
      </button>

      <!-- Dark mode toggle -->
      <button
        @click="toggleDarkMode"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        ]"
        :title="isCollapsed ? (isDark ? 'Mode clair' : 'Mode sombre') : ''"
      >
        <font-awesome-icon
          :icon="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"
          class="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400"
        />
        <span v-if="!isCollapsed" class="text-sm font-medium">
          {{ isDark ? 'Mode clair' : 'Mode sombre' }}
        </span>
      </button>

      <!-- Lien vers le site public -->
      <NuxtLink
        to="/"
        target="_blank"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        ]"
        :title="isCollapsed ? 'Voir le site' : ''"
      >
        <font-awesome-icon
          icon="fa-solid fa-external-link"
          class="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400"
        />
        <span v-if="!isCollapsed" class="text-sm font-medium">Voir le site</span>
      </NuxtLink>
    </div>
  </aside>
</template>
