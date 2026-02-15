<script setup lang="ts">
import type { ApplicationCallPublicWithDetails, CallType } from '~/types/api'

interface Props {
  call: ApplicationCallPublicWithDetails
  typeBadgeColor: string
  typeLabel: string
  heroImage: string
}

defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="relative h-[50vh] min-h-[400px] max-h-[500px] overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img
        :src="heroImage"
        :alt="call.title"
        class="w-full h-full object-cover"
      >
      <!-- Gradient Overlays -->
      <div class="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/40"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-gray-900/30"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 h-full flex flex-col justify-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <!-- Breadcrumb -->
        <nav class="mb-6">
          <ol class="flex items-center space-x-2 text-sm">
            <li>
              <NuxtLink :to="localePath('/')" class="text-white/70 hover:text-white transition-colors duration-200">
                {{ t('nav.home') }}
              </NuxtLink>
            </li>
            <li class="flex items-center">
              <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 mx-2 text-white/40" />
              <NuxtLink :to="localePath('/actualites/appels')" class="text-white/70 hover:text-white transition-colors duration-200">
                {{ t('actualites.calls.title') }}
              </NuxtLink>
            </li>
            <li class="flex items-center">
              <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 mx-2 text-white/40" />
              <span class="text-brand-red-400 font-medium truncate max-w-xs">{{ call.title }}</span>
            </li>
          </ol>
        </nav>

        <!-- Badges -->
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <span
            class="inline-block px-3 py-1 text-sm font-medium text-white rounded-full"
            :class="typeBadgeColor"
          >
            {{ typeLabel }}
          </span>
          <span
            v-if="call.status === 'ongoing'"
            class="inline-block px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full"
          >
            {{ t('actualites.detail.call.statusOpen') }}
          </span>
          <span
            v-else-if="call.status === 'upcoming'"
            class="inline-block px-3 py-1 text-sm font-medium bg-yellow-600 text-white rounded-full"
          >
            {{ t('actualites.calls.status.upcoming') || 'À venir' }}
          </span>
          <span
            v-else
            class="inline-block px-3 py-1 text-sm font-medium bg-gray-600 text-white rounded-full"
          >
            {{ t('actualites.detail.call.statusClosed') }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          {{ call.title }}
        </h1>
      </div>
    </div>

    <!-- Ligne de séparation oblique -->
    <div class="absolute bottom-0 left-0 right-0">
      <svg class="w-full h-12 md:h-16 text-white dark:text-gray-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
      </svg>
    </div>
  </section>
</template>
