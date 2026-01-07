<script setup lang="ts">
import type { Partenaire } from '~/composables/useMockData'

interface Props {
  modelValue: Partenaire['partner_type'] | 'all'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: Partenaire['partner_type'] | 'all']
}>()

const { t } = useI18n()

const filters = [
  { value: 'all', label: () => t('partners.filters.all'), icon: 'fa-solid fa-grip' },
  { value: 'academique', label: () => t('partners.filters.academic'), icon: 'fa-solid fa-graduation-cap' },
  { value: 'institutionnel', label: () => t('partners.filters.institutional'), icon: 'fa-solid fa-building-columns' },
  { value: 'entreprise', label: () => t('partners.filters.corporate'), icon: 'fa-solid fa-briefcase' },
  { value: 'ong', label: () => t('partners.filters.ngo'), icon: 'fa-solid fa-heart' }
] as const

const selectFilter = (value: Partenaire['partner_type'] | 'all') => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
    <button
      v-for="filter in filters"
      :key="filter.value"
      class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
      :class="[
        modelValue === filter.value
          ? 'bg-amber-500 text-white shadow-md'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      ]"
      @click="selectFilter(filter.value)"
    >
      <font-awesome-icon :icon="filter.icon" class="w-4 h-4" />
      <span class="hidden sm:inline">{{ filter.label() }}</span>
    </button>
  </div>
</template>
