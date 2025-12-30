<script setup lang="ts">
interface StrategicAxis {
  id: string
  icon: string
  color: 'amber' | 'blue' | 'emerald' | 'green' | 'purple'
  title: string
  description: string
  objectives: string[]
}

interface Props {
  title: string
  subtitle?: string
  axes: StrategicAxis[]
}

const props = defineProps<Props>()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 lg:mb-16">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          <span class="relative inline-block">
            {{ props.title }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
          </span>
        </h2>
        <p v-if="props.subtitle" class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ props.subtitle }}
        </p>
      </div>

      <!-- Axes Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        <StrategyStrategicAxisCard
          v-for="(axis, index) in props.axes"
          :key="axis.id"
          :icon="axis.icon"
          :color="axis.color"
          :title="axis.title"
          :description="axis.description"
          :objectives="axis.objectives"
          class="transition-all duration-500"
          :style="{ transitionDelay: `${index * 100}ms` }"
        />
      </div>
    </div>
  </section>
</template>
