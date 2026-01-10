<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCampusCalls, getCampusFormationsRealisees, getCampusClosedCalls, getCampusRecruitments } = useMockData()

// Active filter
type FilterType = 'all' | 'calls' | 'formations' | 'closed' | 'recruitments'
const activeFilter = ref<FilterType>('all')

// Filter options with counts
const filters = computed(() => [
  { id: 'all' as FilterType, label: t('partners.campus.calls.filters.all'), icon: 'fa-solid fa-layer-group' },
  { id: 'calls' as FilterType, label: t('partners.campus.calls.filters.calls'), icon: 'fa-solid fa-bullhorn', count: calls.value.length },
  { id: 'formations' as FilterType, label: t('partners.campus.calls.filters.formations'), icon: 'fa-solid fa-graduation-cap', count: formationsRealisees.value.length },
  { id: 'closed' as FilterType, label: t('partners.campus.calls.filters.closed'), icon: 'fa-solid fa-folder-closed', count: closedCalls.value.length },
  { id: 'recruitments' as FilterType, label: t('partners.campus.calls.filters.recruitments'), icon: 'fa-solid fa-user-plus', count: recruitments.value.length }
])

const calls = computed(() => {
  return getCampusCalls(props.campusId)
})

const formationsRealisees = computed(() => {
  return getCampusFormationsRealisees(props.campusId)
})

const closedCalls = computed(() => {
  return getCampusClosedCalls(props.campusId)
})

const recruitments = computed(() => {
  return getCampusRecruitments(props.campusId)
})

// Check if section should be visible
const showSection = (section: FilterType) => {
  return activeFilter.value === 'all' || activeFilter.value === section
}
</script>

<template>
  <div class="py-8 space-y-8">
    <!-- Filters -->
    <div class="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="filter in filters"
        :key="filter.id"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
        :class="[
          activeFilter === filter.id
            ? 'bg-amber-500 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        ]"
        @click="activeFilter = filter.id"
      >
        <font-awesome-icon :icon="filter.icon" class="w-4 h-4" />
        <span>{{ filter.label }}</span>
        <span
          v-if="filter.count !== undefined"
          class="px-2 py-0.5 text-xs rounded-full"
          :class="[
            activeFilter === filter.id
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          ]"
        >
          {{ filter.count }}
        </span>
      </button>
    </div>

    <!-- Section 1: Appels en cours -->
    <section v-if="showSection('calls')">
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
        <span class="relative inline-block">
          {{ t('partners.campus.calls.title') }}
          <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
        </span>
      </h2>

      <div v-if="calls.length > 0" class="flex flex-col gap-6">
        <CardsCardCall
          v-for="call in calls"
          :key="call.id"
          :call="call"
        />
      </div>

      <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noCalls') }}</p>
      </div>
    </section>

    <!-- Section 2: Formations réalisées -->
    <section v-if="showSection('formations')">
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
        <span class="relative inline-block">
          {{ t('partners.campus.formations.title') }}
          <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
        </span>
      </h2>

      <div v-if="formationsRealisees.length > 0" class="flex flex-col gap-6">
        <CardsCardFormationRealisee
          v-for="formation in formationsRealisees"
          :key="formation.id"
          :formation="formation"
        />
      </div>

      <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.formations.noFormations') }}</p>
      </div>
    </section>

    <!-- Section 3: Appels clos -->
    <section v-if="showSection('closed')">
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
        <span class="relative inline-block">
          {{ t('partners.campus.calls.closedTitle') }}
          <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-gray-500 to-gray-300 rounded-full"></span>
        </span>
      </h2>

      <div v-if="closedCalls.length > 0" class="flex flex-col gap-6">
        <CardsCardCall
          v-for="call in closedCalls"
          :key="call.id"
          :call="call"
        />
      </div>

      <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <font-awesome-icon icon="fa-solid fa-folder-closed" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.calls.noClosedCalls') }}</p>
      </div>
    </section>

    <!-- Section 4: Recrutements -->
    <section v-if="showSection('recruitments')">
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
        <span class="relative inline-block">
          {{ t('partners.campus.calls.recruitmentsTitle') }}
          <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full"></span>
        </span>
      </h2>

      <div v-if="recruitments.length > 0" class="flex flex-col gap-6">
        <CardsCardCall
          v-for="recruitment in recruitments"
          :key="recruitment.id"
          :call="recruitment"
        />
      </div>

      <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.calls.noRecruitments') }}</p>
      </div>
    </section>
  </div>
</template>
