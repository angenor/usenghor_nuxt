<script setup lang="ts">
/**
 * Sous-onglets pilule du mini-site PEI, portés par l'adresse (style des sous-onglets
 * « Nous connaître » de section/about/TabsNav.vue).
 */
import type { RouteLocationRaw } from 'vue-router'

interface PillTab {
  key: string
  label: string
  icon?: string
  to: RouteLocationRaw
}

defineProps<{
  tabs: PillTab[]
  activeKey: string
  ariaLabel?: string
}>()

const localePath = useLocalePath()
</script>

<template>
  <nav
    :aria-label="ariaLabel"
    class="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center sm:justify-center gap-1 py-2 overflow-x-auto scrollbar-hide">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.key"
        :to="localePath(tab.to)"
        :aria-current="tab.key === activeKey ? 'page' : undefined"
        :class="[
          'group flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200',
          tab.key === activeKey
            ? 'bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200',
        ]"
      >
        <font-awesome-icon
          v-if="tab.icon"
          :icon="tab.icon"
          aria-hidden="true"
          :class="[
            'w-3.5 h-3.5 transition-colors duration-200',
            tab.key === activeKey ? 'text-brand-blue-600 dark:text-brand-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300',
          ]"
        />
        <span>{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
