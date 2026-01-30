<script setup lang="ts">
interface Props {
  targetAudience: string | null
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div v-if="targetAudience" class="mb-8">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <font-awesome-icon icon="fa-solid fa-users" class="text-brand-blue-500" />
      {{ t('actualites.detail.call.targetAudience') || 'Public cible' }}
    </h3>
    <p class="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      {{ targetAudience }}
    </p>
  </div>
</template>
