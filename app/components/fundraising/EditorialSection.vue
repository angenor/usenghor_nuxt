<script setup lang="ts">
defineProps<{
  title: string
  items: Array<{
    icon: string
    title: string
    description: string
  }>
}>()
</script>

<template>
  <section class="py-16 lg:py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section title -->
      <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center rtl:text-right">
        {{ title }}
      </h2>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-6 lg:p-8 transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
        >
          <!-- Icon -->
          <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-600 dark:text-brand-blue-400 mb-5 group-hover:scale-110 transition-transform duration-300">
            <font-awesome-icon :icon="item.icon" class="w-6 h-6" />
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 rtl:text-right">
            {{ item.title }}
          </h3>

          <!-- Description -->
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-sm rtl:text-right">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
