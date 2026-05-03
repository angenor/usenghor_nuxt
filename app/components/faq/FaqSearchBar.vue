<script setup lang="ts">
interface Props {
  search: string
  placeholder?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:search': [value: string]
}>()

const local = ref(props.search)
let timeout: ReturnType<typeof setTimeout> | null = null

watch(() => props.search, (v) => { local.value = v })

watch(local, (v) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => emit('update:search', v), 100)
})
</script>

<template>
  <div class="relative w-full">
    <span class="absolute inset-y-0 left-3 flex items-center text-gray-400" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M21 20.3 16.7 16a7 7 0 1 0-1.4 1.4l4.3 4.3 1.4-1.4ZM4 11a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z"/>
      </svg>
    </span>
    <input
      v-model="local"
      type="search"
      :placeholder="placeholder"
      class="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      :aria-label="placeholder"
    >
  </div>
</template>
