<script setup lang="ts">
interface Props {
  title: string
  summary: string
  image: string
  to: string
  icon?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'amber'
})

const localePath = useLocalePath()

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
    briefcase: 'fa-solid fa-briefcase'
  }
  return iconMap[iconName] || 'fa-solid fa-arrow-right'
}

// Color classes for icon badge
const colorClasses: Record<string, string> = {
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  purple: 'bg-purple-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
  lime: 'bg-lime-500'
}

const badgeColor = computed(() => colorClasses[props.color] || colorClasses.amber)
</script>

<template>
  <NuxtLink
    :to="localePath(props.to)"
    class="group relative block overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
  >
    <!-- Image Container -->
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        :src="props.image"
        :alt="props.title"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      >
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

      <!-- Icon Badge -->
      <div
        v-if="props.icon"
        class="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
        :class="badgeColor"
      >
        <font-awesome-icon
          :icon="getIcon(props.icon)"
          class="w-5 h-5 text-white"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="absolute bottom-0 left-0 right-0 p-5 text-white">
      <h3 class="text-xl font-bold mb-1 transition-colors duration-300 group-hover:text-amber-300">
        {{ props.title }}
      </h3>
      <p class="text-sm text-gray-200 line-clamp-2">
        {{ props.summary }}
      </p>

      <!-- Arrow indicator -->
      <div class="mt-3 flex items-center gap-2 text-sm font-medium text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span>Découvrir</span>
        <font-awesome-icon
          icon="fa-solid fa-arrow-right"
          class="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </div>
  </NuxtLink>
</template>
