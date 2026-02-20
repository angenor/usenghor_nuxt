<script setup lang="ts">
import type { ProgramPublic } from '~/composables/usePublicProgramsApi'

interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getCampusPrograms } = usePublicCampusApi()
const { publicProgramTypeLabels, publicProgramTypeColors, formatDuration, programTypeToUrlSlug } = usePublicProgramsApi()
const { getMediaUrl } = useMediaApi()

// Fetch programs
const { data: programs, pending: loading } = useLazyAsyncData(
  `campus-programs-${props.campusId}`,
  () => getCampusPrograms(props.campusId),
  { server: false, default: () => [] },
)
</script>

<template>
  <section class="py-12">
    <div class="mb-8">
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('partners.campus.tabs.formations') }}
      </h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-brand-blue-600 border-t-transparent" />
    </div>

    <!-- Programs grid -->
    <div v-else-if="programs && programs.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="program in programs"
        :key="program.id"
        :to="localePath(`/formations/${programTypeToUrlSlug[program.type] || 'masters'}/${program.slug}`)"
        class="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        <!-- Cover image -->
        <div class="relative h-40 overflow-hidden">
          <img
            v-if="program.cover_image_external_id"
            :src="getMediaUrl(program.cover_image_external_id, 'medium') ?? undefined"
            :alt="program.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
            :class="publicProgramTypeColors[program.type]?.bgColor || 'bg-brand-blue-500'"
          >
            <font-awesome-icon
              :icon="publicProgramTypeColors[program.type]?.icon || 'fa-solid fa-graduation-cap'"
              class="w-12 h-12 text-white/80"
            />
          </div>
          <!-- Type badge -->
          <div class="absolute top-4 right-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700">
              {{ publicProgramTypeLabels[program.type] || program.type }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
            {{ program.title }}
          </h3>
          <p v-if="program.subtitle" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {{ program.subtitle }}
          </p>

          <!-- Meta -->
          <div class="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span v-if="program.duration_months" class="flex items-center gap-1">
              <font-awesome-icon icon="fa-solid fa-clock" class="w-3 h-3" />
              {{ formatDuration(program.duration_months, locale) }}
            </span>
            <span v-if="program.credits" class="flex items-center gap-1">
              <font-awesome-icon icon="fa-solid fa-star" class="w-3 h-3" />
              {{ program.credits }} ECTS
            </span>
            <span v-if="program.degree_awarded" class="flex items-center gap-1">
              <font-awesome-icon icon="fa-solid fa-award" class="w-3 h-3" />
              {{ program.degree_awarded }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
      <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
      <p class="text-gray-500 dark:text-gray-400 text-lg">
        {{ t('partners.campus.noFormations') || 'Aucune formation associée' }}
      </p>
    </div>
  </section>
</template>
