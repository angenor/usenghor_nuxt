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
    <div class="absolute inset-0 opacity-10 heropattern-topography-amber-500"></div>

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
          class="inline-block px-4 py-1.5 text-sm font-semibold text-amber-900 bg-amber-400 rounded-full mb-6"
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

    <!-- Decorative bottom wave -->
    <div class="absolute bottom-0 left-0 right-0">
      <svg
        class="w-full h-12 md:h-16 text-white dark:text-gray-950"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z"
          fill="currentColor"
        ></path>
      </svg>
    </div>
  </section>
</template>
