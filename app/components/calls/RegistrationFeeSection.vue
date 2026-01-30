<script setup lang="ts">
interface Props {
  fee: number | null
  currency: string
  labelKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelKey: 'registrationFee',
})

const { t } = useI18n()

const label = computed(() => {
  if (props.labelKey === 'courseFee') {
    return t('actualites.detail.call.courseFee') || 'Frais de formation'
  }
  return t('actualites.detail.call.registrationFee') || "Frais d'inscription"
})
</script>

<template>
  <div v-if="fee" class="mb-8">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <font-awesome-icon icon="fa-solid fa-coins" class="text-brand-blue-500" />
      {{ label }}
    </h3>
    <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
      <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
        {{ fee }} {{ currency }}
      </p>
    </div>
  </div>
</template>
