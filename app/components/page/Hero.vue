<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  title: string
  subtitle?: string
  image?: string
  breadcrumb?: BreadcrumbItem[]
}

const props = defineProps<Props>()

const localePath = useLocalePath()
</script>

<template>
  <section class="relative overflow-hidden" :class="props.image ? 'h-[50vh] min-h-[400px] max-h-[500px]' : 'py-16 md:py-24'">
    <!-- Mode image (quand image est fournie) -->
    <template v-if="props.image">
      <div class="absolute inset-0">
        <img
          :src="props.image"
          :alt="props.title"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gray-900/60"></div>
      </div>
    </template>

    <!-- Mode pattern (par défaut, sans image) -->
    <template v-else>
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500"></div>
    </template>

    <!-- Content -->
    <div class="relative z-10" :class="props.image ? 'h-full flex flex-col justify-center' : ''">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <!-- Breadcrumb -->
        <nav v-if="props.breadcrumb?.length" class="mb-6">
          <ol class="flex items-center space-x-2 text-sm">
            <li v-for="(item, index) in props.breadcrumb" :key="index" class="flex items-center">
              <NuxtLink
                v-if="item.to"
                :to="localePath(item.to)"
                class="text-white/70 hover:text-white transition-colors duration-200"
              >
                {{ item.label }}
              </NuxtLink>
              <span v-else class="text-brand-red-400 font-medium">{{ item.label }}</span>
              <font-awesome-icon
                v-if="index < props.breadcrumb.length - 1"
                icon="fa-solid fa-chevron-right"
                class="w-3 h-3 mx-2 text-white/40"
              />
            </li>
          </ol>
        </nav>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          {{ props.title }}
        </h1>

        <!-- Subtitle -->
        <p v-if="props.subtitle" class="text-lg sm:text-xl text-white/80 leading-relaxed max-w-3xl">
          {{ props.subtitle }}
        </p>
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
