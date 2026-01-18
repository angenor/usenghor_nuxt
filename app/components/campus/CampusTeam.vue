<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const { getCampusTeam } = useMockData()

const teamMembers = computed(() => getCampusTeam(props.campusId))

// Get localized role
const getLocalizedRole = (member: any) => {
  if (locale.value === 'ar' && member.role_ar) return member.role_ar
  if (locale.value === 'en' && member.role_en) return member.role_en
  return member.role_fr
}
</script>

<template>
  <div class="py-8">
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
      <span class="relative inline-block">
        {{ t('partners.campus.team.title') }}
        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
      </span>
    </h2>

    <div v-if="teamMembers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="member in teamMembers"
        :key="member.id"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
      >
        <!-- Photo -->
        <div class="relative aspect-square overflow-hidden">
          <img
            :src="member.photo"
            :alt="member.name"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <!-- Info -->
        <div class="p-4">
          <h4 class="font-bold text-gray-900 dark:text-white mb-1">
            {{ member.name }}
          </h4>
          <p class="text-sm text-brand-red-600 dark:text-brand-red-400 mb-3">
            {{ getLocalizedRole(member) }}
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

    <div v-else class="text-center py-12">
      <font-awesome-icon icon="fa-solid fa-users" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noTeam') }}</p>
    </div>
  </div>
</template>
