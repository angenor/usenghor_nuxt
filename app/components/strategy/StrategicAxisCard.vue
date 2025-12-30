<script setup lang="ts">
interface Props {
  icon: string
  color: 'amber' | 'blue' | 'emerald' | 'green' | 'purple'
  title: string
  description: string
  objectives: string[]
}

const props = defineProps<Props>()

// Map icon names to Font Awesome icons
const getIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    star: 'fa-solid fa-star',
    lightbulb: 'fa-solid fa-lightbulb',
    globe: 'fa-solid fa-globe',
    leaf: 'fa-solid fa-leaf',
    building: 'fa-solid fa-building-columns'
  }
  return iconMap[iconName] || 'fa-solid fa-check'
}

// Color classes mapping
const colorClasses: Record<string, { bg: string; accent: string; icon: string }> = {
  amber: {
    bg: 'bg-amber-400',
    accent: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'text-amber-600 dark:text-amber-400'
  },
  blue: {
    bg: 'bg-blue-400',
    accent: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  emerald: {
    bg: 'bg-emerald-400',
    accent: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'text-emerald-600 dark:text-emerald-400'
  },
  green: {
    bg: 'bg-green-400',
    accent: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-400',
    accent: 'bg-purple-100 dark:bg-purple-900/30',
    icon: 'text-purple-600 dark:text-purple-400'
  }
}

const colors = computed(() => colorClasses[props.color] || colorClasses.amber)
</script>

<template>
  <div class="group relative">
    <!-- Colored background offset -->
    <div
      class="absolute -right-3 -bottom-3 h-full w-full rounded-xl transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"
      :class="colors.bg"
    ></div>

    <!-- Main card -->
    <div class="relative h-full bg-white dark:bg-gray-900 rounded-xl p-6 lg:p-8 space-y-4 transition-all duration-300 group-hover:shadow-lg border border-gray-100 dark:border-gray-700">
      <!-- Accent line -->
      <div
        class="h-1.5 w-16 rounded-full"
        :class="colors.bg"
      ></div>

      <!-- Icon -->
      <div
        class="w-12 h-12 rounded-lg flex items-center justify-center"
        :class="colors.accent"
      >
        <font-awesome-icon
          :icon="getIcon(props.icon)"
          class="w-6 h-6"
          :class="colors.icon"
        />
      </div>

      <!-- Title -->
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        {{ props.title }}
      </h3>

      <!-- Description -->
      <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
        {{ props.description }}
      </p>

      <!-- Objectives list -->
      <ul v-if="props.objectives && props.objectives.length > 0" class="space-y-2 pt-2">
        <li
          v-for="(objective, index) in props.objectives"
          :key="index"
          class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <font-awesome-icon
            icon="fa-solid fa-check"
            class="w-4 h-4 mt-0.5 flex-shrink-0"
            :class="colors.icon"
          />
          <span>{{ objective }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
