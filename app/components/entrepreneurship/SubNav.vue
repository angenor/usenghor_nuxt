<script setup lang="ts">
/**
 * Sous-navigation collante du mini-site « Entreprendre à Senghor ».
 * Calquée sur SectionAboutTabsNav (research R2) ; réutilisée par toutes les rubriques du pôle.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const tabs = computed(() => [
  { key: 'presentation', to: '/entrepreneuriat', icon: 'fa-solid fa-circle-info', exact: true },
  { key: 'activities', to: '/entrepreneuriat/activites', icon: 'fa-solid fa-route' },
  { key: 'alumni', to: '/entrepreneuriat/alumni', icon: 'fa-solid fa-user-graduate' },
  { key: 'partners', to: '/entrepreneuriat/partenaires', icon: 'fa-solid fa-handshake' },
  { key: 'resources', to: '/entrepreneuriat/ressources', icon: 'fa-solid fa-toolbox' },
  { key: 'news', to: '/entrepreneuriat/actualites', icon: 'fa-solid fa-newspaper' },
])

const isActive = (to: string, exact = false) => {
  const currentPath = route.path.replace(/\/$/, '') || '/'
  const localizedPath = localePath(to)
  if (exact) return currentPath === localizedPath
  return currentPath === localizedPath || currentPath.startsWith(localizedPath + '/')
}

// Bouton rouge : « page courante » sur la page du statut (spec 025, research R3).
const ctaPath = '/entrepreneuriat/statut-etudiant-entrepreneur'
const ctaActive = computed(() => isActive(ctaPath))
</script>

<template>
  <div class="sticky top-20 z-40">
    <nav
      :aria-label="t('pei.nav.label')"
      class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.key"
            :to="localePath(tab.to)"
            :aria-current="isActive(tab.to, tab.exact) ? 'page' : undefined"
            :class="[
              'group flex shrink-0 items-center gap-2 px-3 sm:px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200',
              isActive(tab.to, tab.exact)
                ? 'border-brand-blue-500 text-brand-blue-600 dark:text-brand-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
            ]"
          >
            <font-awesome-icon
              :icon="tab.icon"
              :class="[
                'w-4 h-4 transition-colors duration-200',
                isActive(tab.to, tab.exact) ? 'text-brand-blue-500' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
              ]"
            />
            <span>{{ t(`pei.nav.${tab.key}`) }}</span>
          </NuxtLink>

          <NuxtLink
            :to="localePath(ctaPath)"
            :aria-current="ctaActive ? 'page' : undefined"
            :class="[
              'ms-auto shrink-0 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-brand-red-500 hover:bg-brand-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200',
              { 'ring-4 ring-brand-red-100 dark:ring-brand-red-900/40': ctaActive },
            ]"
          >
            <font-awesome-icon icon="fa-solid fa-rocket" class="w-4 h-4" />
            <span>{{ t('pei.nav.cta') }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>
  </div>
</template>
