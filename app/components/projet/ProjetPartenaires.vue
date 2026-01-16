<script setup lang="ts">
import type { Project } from '~/composables/useMockData'

interface Props {
  project: Project
}

const props = defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="py-8">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
      <font-awesome-icon icon="fa-solid fa-handshake" class="text-brand-blue-500" />
      {{ t('projets.partenaires.title') }}
    </h2>

    <!-- Empty state -->
    <div
      v-if="project.partners.length === 0"
      class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl"
    >
      <font-awesome-icon icon="fa-solid fa-handshake" class="w-12 h-12 text-gray-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ t('projets.partenaires.noPartenaires') }}</p>
    </div>

    <!-- Partners grid -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <template v-for="partner in project.partners" :key="partner.name">
        <!-- Partner with website -->
        <a
          v-if="partner.website"
          :href="partner.website"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-brand-blue-300 dark:hover:border-brand-blue-600 transition-all"
        >
          <!-- Logo -->
          <div class="w-full h-24 flex items-center justify-center mb-4">
            <img
              v-if="partner.logo"
              :src="partner.logo"
              :alt="partner.name"
              class="max-h-full max-w-full object-contain"
            />
            <div
              v-else
              class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            >
              <font-awesome-icon icon="fa-solid fa-building" class="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <!-- Name -->
          <h3 class="text-center font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
            {{ partner.name }}
          </h3>

          <!-- External link indicator -->
          <div class="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400">
            <font-awesome-icon icon="fa-solid fa-external-link-alt" class="w-3 h-3" />
            <span>{{ t('projets.detail.visitWebsite') }}</span>
          </div>
        </a>

        <!-- Partner without website -->
        <div
          v-else
          class="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <!-- Logo -->
          <div class="w-full h-24 flex items-center justify-center mb-4">
            <img
              v-if="partner.logo"
              :src="partner.logo"
              :alt="partner.name"
              class="max-h-full max-w-full object-contain"
            />
            <div
              v-else
              class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            >
              <font-awesome-icon icon="fa-solid fa-building" class="w-10 h-10 text-gray-400" />
            </div>
          </div>

          <!-- Name -->
          <h3 class="text-center font-semibold text-gray-900 dark:text-white">
            {{ partner.name }}
          </h3>
        </div>
      </template>
    </div>
  </div>
</template>
