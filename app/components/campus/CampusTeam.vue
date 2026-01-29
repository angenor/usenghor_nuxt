<script setup lang="ts">
import type { CampusTeamMemberPublic } from '~/composables/usePublicCampusApi'

interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCampusTeam, getTeamMemberPhotoUrl, getTeamMemberFullName } = usePublicCampusApi()

// Fetch team members from API
const { data: teamData, pending } = await useAsyncData(
  `campus-team-${props.campusId}`,
  () => getCampusTeam(props.campusId),
  { server: true }
)

const teamMembers = computed(() => teamData.value || [])
</script>

<template>
  <div class="py-8">
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
      <span class="relative inline-block">
        {{ t('partners.campus.team.title') }}
        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
      </span>
    </h2>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-500"></div>
    </div>

    <div v-else-if="teamMembers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="member in teamMembers"
        :key="member.id"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
      >
        <!-- Photo -->
        <div class="relative aspect-square overflow-hidden">
          <img
            :src="getTeamMemberPhotoUrl(member)"
            :alt="getTeamMemberFullName(member)"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <!-- Info -->
        <div class="p-4">
          <h4 class="font-bold text-gray-900 dark:text-white mb-1">
            {{ getTeamMemberFullName(member) }}
          </h4>
          <p class="text-sm text-brand-red-600 dark:text-brand-red-400 mb-3">
            {{ member.position }}
          </p>

          <!-- Contact -->
          <a
            v-if="member.email"
            :href="`mailto:${member.email}`"
            class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-envelope" class="w-4 h-4" />
            {{ t('partners.campus.team.contact') }}
          </a>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!pending" class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <font-awesome-icon icon="fa-solid fa-users" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noTeam') }}</p>
    </div>
  </div>
</template>
