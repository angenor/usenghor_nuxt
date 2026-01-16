<script setup lang="ts">
interface Props {
  title: string
  summary: string
  image: string
  to: string
  icon?: string
  badge?: string
  color?: string
  imagePosition?: 'left' | 'right'
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  imagePosition: 'left',
  icon: 'arrow-right'
})

const localePath = useLocalePath()
const { t } = useI18n()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

// Map icon names to Font Awesome icons
const getIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    clock: 'fa-solid fa-clock-rotate-left',
    building: 'fa-solid fa-building-columns',
    sitemap: 'fa-solid fa-sitemap',
    handshake: 'fa-solid fa-handshake',
    users: 'fa-solid fa-users',
    globe: 'fa-solid fa-globe',
    graduation: 'fa-solid fa-graduation-cap',
    chart: 'fa-solid fa-chart-line',
    briefcase: 'fa-solid fa-briefcase',
    'arrow-right': 'fa-solid fa-arrow-right'
  }
  return iconMap[iconName] || 'fa-solid fa-arrow-right'
}

// Color classes
const colorClasses: Record<string, { badge: string, button: string, overlay: string, decoration: string }> = {
  blue: {
    badge: 'bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400',
    button: 'bg-brand-blue-500 hover:bg-brand-blue-600 hover:shadow-brand-blue-500/30',
    overlay: 'from-brand-blue-500/20',
    decoration: 'bg-brand-blue-500/10'
  },
  red: {
    badge: 'bg-brand-red-100 dark:bg-brand-red-900/30 text-brand-red-700 dark:text-brand-red-400',
    button: 'bg-brand-red-500 hover:bg-brand-red-600 hover:shadow-brand-red-500/30',
    overlay: 'from-brand-red-500/20',
    decoration: 'bg-brand-red-500/10'
  },
  purple: {
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    button: 'bg-purple-500 hover:bg-purple-600 hover:shadow-purple-500/30',
    overlay: 'from-purple-500/20',
    decoration: 'bg-purple-500/10'
  },
  cyan: {
    badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    button: 'bg-cyan-500 hover:bg-cyan-600 hover:shadow-cyan-500/30',
    overlay: 'from-cyan-500/20',
    decoration: 'bg-cyan-500/10'
  }
}

const colors = computed(() => colorClasses[props.color] || colorClasses.blue)
</script>

<template>
  <section
    :id="props.id"
    ref="sectionRef"
    class="py-16 lg:py-20 bg-white dark:bg-gray-900 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Image -->
        <div
          class="relative"
          :class="props.imagePosition === 'right' ? 'order-2 lg:order-2' : 'order-2 lg:order-1'"
        >
          <div class="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              :src="props.image"
              :alt="props.title"
              class="w-full h-auto object-cover aspect-[4/3]"
            />
            <!-- Decorative overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-tr to-transparent"
              :class="colors.overlay"
            ></div>
          </div>
          <!-- Decorative elements -->
          <div
            class="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl -z-10"
            :class="colors.decoration"
          ></div>
          <div
            class="absolute -top-4 -right-4 w-32 h-32 rounded-full -z-10"
            :class="colors.decoration"
          ></div>
        </div>

        <!-- Content -->
        <div :class="props.imagePosition === 'right' ? 'order-1 lg:order-1' : 'order-1 lg:order-2'">
          <!-- Badge -->
          <span
            v-if="props.badge"
            class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            :class="colors.badge"
          >
            <font-awesome-icon :icon="getIcon(props.icon)" class="w-3.5 h-3.5 mr-2" />
            {{ props.badge }}
          </span>

          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ props.title }}
          </h2>

          <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            {{ props.summary }}
          </p>

          <NuxtLink
            :to="localePath(props.to)"
            class="group inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            :class="colors.button"
          >
            <span>{{ t('common.discover') }}</span>
            <font-awesome-icon
              icon="fa-solid fa-arrow-right"
              class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
