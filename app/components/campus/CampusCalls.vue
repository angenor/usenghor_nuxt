<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCampusCalls } = useMockData()

const calls = computed(() => {
  const result = getCampusCalls(props.campusId)
  console.log('CampusCalls - campusId:', props.campusId, '- found:', result.length, 'calls')
  return result
})
</script>

<template>
  <div class="py-8">
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
      {{ t('partners.campus.calls.title') }}
    </h3>

    <div v-if="calls.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardsCardCall
        v-for="call in calls"
        :key="call.id"
        :call="call"
      />
    </div>

    <div v-else class="text-center py-12">
      <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noCalls') }}</p>
    </div>
  </div>
</template>
