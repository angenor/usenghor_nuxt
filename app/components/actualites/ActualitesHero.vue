<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  badge?: string
  backgroundImage?: string
}

defineProps<Props>()
</script>

<template>
  <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500"></div>

    <!-- Background image overlay -->
    <div
      v-if="backgroundImage"
      class="absolute inset-0 bg-cover bg-center opacity-20"
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    ></div>

    <!-- Content -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <!-- Badge -->
        <span
          v-if="badge"
          class="inline-block px-4 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full mb-6"
        >
          {{ badge }}
        </span>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          {{ title }}
        </h1>

        <!-- Subtitle -->
        <p
          v-if="subtitle"
          class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto"
        >
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Ligne de séparation droite -->
    <div class="absolute bottom-0 left-0 right-0">
      <svg
        class="w-full h-12 md:h-16 text-white dark:text-gray-950"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
      </svg>
    </div>
  </section>
</template>
