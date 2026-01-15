<script setup lang="ts">
interface Props {
  campusId: string
  size?: 'sm' | 'md'
  showLink?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  showLink: true
})

const { locale } = useI18n()
const { getCampusById, getFlagEmoji } = useMockData()
const localePath = useLocalePath()

const campus = computed(() => getCampusById(props.campusId))

const campusName = computed(() => {
  if (!campus.value) return ''
  if (locale.value === 'en' && campus.value.name_en) return campus.value.name_en
  if (locale.value === 'ar' && campus.value.name_ar) return campus.value.name_ar
  return campus.value.name_fr
})

const flag = computed(() => {
  if (!campus.value) return ''
  return getFlagEmoji(campus.value.country)
})

const campusLink = computed(() => {
  if (!campus.value) return ''
  return localePath(`/a-propos/partenaires/campus/${campus.value.slug}`)
})

const sizeClasses = computed(() => {
  return props.size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-3 py-1'
})
</script>

<template>
  <NuxtLink
    v-if="campus && showLink"
    :to="campusLink"
    class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors duration-200"
    :class="sizeClasses"
  >
    <span>{{ flag }}</span>
    <span class="font-medium">{{ campusName }}</span>
  </NuxtLink>
  <span
    v-else-if="campus"
    class="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
    :class="sizeClasses"
  >
    <span>{{ flag }}</span>
    <span class="font-medium">{{ campusName }}</span>
  </span>
</template>
