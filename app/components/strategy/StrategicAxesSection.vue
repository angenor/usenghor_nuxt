<script setup lang="ts">
interface StrategicAxis {
  id: string
  code?: string
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

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.1 })

// Map icon names to Font Awesome icons
const getIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    star: 'fa-solid fa-star',
    lightbulb: 'fa-solid fa-lightbulb',
    globe: 'fa-solid fa-globe',
    leaf: 'fa-solid fa-leaf',
    building: 'fa-solid fa-building-columns',
    'graduation-cap': 'fa-solid fa-graduation-cap'
  }
  return iconMap[iconName] || 'fa-solid fa-check'
}

// Color classes mapping
const colorClasses: Record<string, { bg: string; bgLight: string; border: string; text: string }> = {
  amber: {
    bg: 'bg-brand-blue-500',
    bgLight: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
    border: 'border-brand-blue-300 dark:border-brand-blue-700',
    text: 'text-brand-blue-600 dark:text-brand-blue-400'
  },
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-600 dark:text-blue-400'
  },
  emerald: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-100 dark:bg-emerald-900/30',
    border: 'border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
  green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-600 dark:text-purple-400'
  }
}

const getColors = (color: string) => colorClasses[color] || colorClasses.amber
</script>

<template>
  <section
    ref="sectionRef"
    class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300 heropattern-jigsaw-gray-100 dark:heropattern-jigsaw-gray-700"
    style="background-attachment: fixed;"
  >
    <div class="max-w-5xl mx-auto  px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12 lg:mb-16">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          <span class="relative inline-block">
            {{ props.title }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>
        <p v-if="props.subtitle" class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ props.subtitle }}
        </p>
      </div>

      <!-- Timeline Axes -->
      <div>
        <template v-for="(axis, index) in props.axes" :key="axis.id">
          <!-- Left-aligned step (odd: 0, 2, 4) -->
          <div v-if="index % 2 === 0" class="flex flex-row">
            <!-- Step indicator (desktop) -->
            <div class="hidden md:flex flex-col items-center">
              <div
                class="w-32 py-5 border rounded-xl mr-4 uppercase flex flex-col items-center justify-center"
                :class="getColors(axis.color).border"
              >
                <div class="text-3xl font-black" :class="getColors(axis.color).text">
                  {{ axis.code || String(index + 1).padStart(2, '0') }}
                </div>
                <div class="text-gray-500 dark:text-gray-400 text-sm">Axe</div>
              </div>
              <div v-if="index < props.axes.length - 1" class="h-full border-l-4 border-transparent">
                <div class="border-l-4 mr-4 h-full border-gray-300 dark:border-gray-600 border-dashed"></div>
              </div>
            </div>

            <!-- Content card -->
            <div class="flex-auto border rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div class="flex md:flex-row flex-col items-center">
                <div class="flex-auto p-6">
                  <!-- Mobile step indicator -->
                  <div class="md:hidden text-sm font-normal uppercase mb-2" :class="getColors(axis.color).text">
                    <span class="font-black">Axe {{ axis.code || index + 1 }}</span>
                  </div>
                  <!-- Title -->
                  <div class="flex items-center gap-3 mb-3">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                      :class="getColors(axis.color).bgLight"
                    >
                      <font-awesome-icon
                        :icon="getIcon(axis.icon)"
                        class="w-5 h-5"
                        :class="getColors(axis.color).text"
                      />
                    </div>
                    <h3 class="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      {{ axis.title }}
                    </h3>
                  </div>
                  <!-- Description -->
                  <p class="text-gray-600 dark:text-gray-400 mb-4">
                    {{ axis.description }}
                  </p>
                  <!-- Objectives -->
                  <ul v-if="axis.objectives && axis.objectives.length > 0" class="space-y-2">
                    <li
                      v-for="(objective, objIndex) in axis.objectives"
                      :key="objIndex"
                      class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <font-awesome-icon
                        icon="fa-solid fa-check-circle"
                        class="w-4 h-4 mt-0.5 flex-shrink-0"
                        :class="getColors(axis.color).text"
                      />
                      <span>{{ objective }}</span>
                    </li>
                  </ul>
                </div>
                <!-- Icon illustration -->
                <div class="md:w-48 w-full p-5 flex items-center justify-center">
                  <div
                    class="w-24 h-24 rounded-2xl flex items-center justify-center"
                    :class="getColors(axis.color).bgLight"
                  >
                    <font-awesome-icon
                      :icon="getIcon(axis.icon)"
                      class="w-12 h-12"
                      :class="getColors(axis.color).text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connector from left to right (after odd steps, except last) -->
          <div v-if="index % 2 === 0 && index < props.axes.length - 1" class="flex items-start flex-row">
            <div class="border-t-4 border-r-4 border-transparent">
              <div class="w-16 ml-16 h-16 border-l-4 border-gray-300 dark:border-gray-600 border-dashed border-b-4 rounded-bl-full"></div>
            </div>
            <div class="border-t-4 border-transparent flex-auto">
              <div class="h-16 border-b-4 border-gray-300 dark:border-gray-600 border-dashed"></div>
            </div>
            <div class="w-16 mt-16 mr-16 h-16 border-r-4 border-gray-300 dark:border-gray-600 border-dashed border-t-4 rounded-tr-full"></div>
          </div>

          <!-- Right-aligned step (even: 1, 3) -->
          <div v-if="index % 2 === 1" class="flex flex-row-reverse">
            <!-- Step indicator (desktop) -->
            <div class="hidden md:flex flex-col items-center">
              <div
                class="w-32 py-5 border rounded-xl ml-4 uppercase flex flex-col items-center justify-center"
                :class="getColors(axis.color).border"
              >
                <div class="text-3xl font-black" :class="getColors(axis.color).text">
                  {{ axis.code || String(index + 1).padStart(2, '0') }}
                </div>
                <div class="text-gray-500 dark:text-gray-400 text-sm">Axe</div>
              </div>
              <div v-if="index < props.axes.length - 1" class="h-full border-r-4 border-transparent">
                <div class="border-l-4 ml-4 h-full border-gray-300 dark:border-gray-600 border-dashed"></div>
              </div>
            </div>

            <!-- Content card -->
            <div class="flex-auto border rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div class="flex md:flex-row flex-col items-center">
                <div class="flex-auto p-6">
                  <!-- Mobile step indicator -->
                  <div class="md:hidden text-sm font-normal uppercase mb-2" :class="getColors(axis.color).text">
                    <span class="font-black">Axe {{ axis.code || index + 1 }}</span>
                  </div>
                  <!-- Title -->
                  <div class="flex items-center gap-3 mb-3">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                      :class="getColors(axis.color).bgLight"
                    >
                      <font-awesome-icon
                        :icon="getIcon(axis.icon)"
                        class="w-5 h-5"
                        :class="getColors(axis.color).text"
                      />
                    </div>
                    <h3 class="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                      {{ axis.title }}
                    </h3>
                  </div>
                  <!-- Description -->
                  <p class="text-gray-600 dark:text-gray-400 mb-4">
                    {{ axis.description }}
                  </p>
                  <!-- Objectives -->
                  <ul v-if="axis.objectives && axis.objectives.length > 0" class="space-y-2">
                    <li
                      v-for="(objective, objIndex) in axis.objectives"
                      :key="objIndex"
                      class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <font-awesome-icon
                        icon="fa-solid fa-check-circle"
                        class="w-4 h-4 mt-0.5 flex-shrink-0"
                        :class="getColors(axis.color).text"
                      />
                      <span>{{ objective }}</span>
                    </li>
                  </ul>
                </div>
                <!-- Icon illustration -->
                <div class="md:w-48 w-full p-5 flex items-center justify-center">
                  <div
                    class="w-24 h-24 rounded-2xl flex items-center justify-center"
                    :class="getColors(axis.color).bgLight"
                  >
                    <font-awesome-icon
                      :icon="getIcon(axis.icon)"
                      class="w-12 h-12"
                      :class="getColors(axis.color).text"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connector from right to left (after even steps, except last) -->
          <div v-if="index % 2 === 1 && index < props.axes.length - 1" class="flex items-start flex-row-reverse">
            <div class="border-t-4 border-l-4 border-transparent">
              <div class="w-16 mr-16 h-16 border-r-4 border-gray-300 dark:border-gray-600 border-dashed border-b-4 rounded-br-full"></div>
            </div>
            <div class="border-t-4 border-transparent flex-auto">
              <div class="h-16 border-b-4 border-gray-300 dark:border-gray-600 border-dashed"></div>
            </div>
            <div class="w-16 mt-16 ml-16 h-16 border-l-4 border-gray-300 dark:border-gray-600 border-dashed border-t-4 rounded-tl-full"></div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
