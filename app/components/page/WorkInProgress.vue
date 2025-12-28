<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'fa-solid fa-hard-hat'
})

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="py-20 lg:py-40 bg-gradient-to-b from-amber-50 to-white dark:from-gray-800 dark:to-gray-900">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <!-- Icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30">
          <font-awesome-icon
            :icon="props.icon"
            class="w-12 h-12 text-amber-500"
          />
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        {{ props.title || t('wip.title') }}
      </h1>

      <!-- Message -->
      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
        {{ t('wip.message') }}
      </p>

      <!-- Progress indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <font-awesome-icon icon="fa-solid fa-code" class="w-4 h-4" />
          <span>En cours de développement</span>
        </div>
        <div class="w-full max-w-xs mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-pulse" style="width: 35%"></div>
        </div>
      </div>

      <!-- Back button -->
      <NuxtLink
        :to="localePath('/')"
        class="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-full transition-all duration-300 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
        <span>{{ t('wip.backHome') }}</span>
      </NuxtLink>
    </div>
  </section>
</template>
