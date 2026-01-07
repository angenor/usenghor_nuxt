<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCampusEvents } = useMockData()

const events = computed(() => getCampusEvents(props.campusId))

// Split events into upcoming and past
const upcomingEvents = computed(() => {
  const now = new Date()
  return events.value.filter(e => new Date(e.date) >= now)
})

const pastEvents = computed(() => {
  const now = new Date()
  return events.value.filter(e => new Date(e.date) < now)
})
</script>

<template>
  <div class="py-8">
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
      {{ t('partners.campus.events.title') }}
    </h3>

    <!-- Upcoming Events -->
    <div v-if="upcomingEvents.length > 0" class="mb-10">
      <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-green-500"></span>
        {{ t('partners.campus.events.upcoming') }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardEvent
          v-for="event in upcomingEvents"
          :key="event.id"
          :event="event"
        />
      </div>
    </div>

    <!-- Past Events -->
    <div v-if="pastEvents.length > 0">
      <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-gray-400"></span>
        {{ t('partners.campus.events.past') }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardEvent
          v-for="event in pastEvents"
          :key="event.id"
          :event="event"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="events.length === 0" class="text-center py-12">
      <font-awesome-icon icon="fa-solid fa-calendar-alt" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noEvents') }}</p>
    </div>
  </div>
</template>
