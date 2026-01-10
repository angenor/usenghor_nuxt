<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCampusCalls, getCampusFormationsRealisees, getCampusClosedCalls, getCampusRecruitments } = useMockData()

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
</script>

<template>
  <div class="py-8 space-y-16">
    <!-- Section 1: Appels en cours -->
    <section>
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
    <section>
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
    <section>
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
    <section>
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
