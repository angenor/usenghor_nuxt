<script setup lang="ts">
interface Props {
  projectId: string
  projectSlug: string
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getProjectCalls, getProjectClosedCalls } = useMockData()

// Get calls for this project
const openCalls = computed(() => getProjectCalls(props.projectId))
const closedCalls = computed(() => getProjectClosedCalls(props.projectId))

// Localization helpers
const getLocalizedTitle = (call: any) => {
  if (locale.value === 'en' && call.title_en) return call.title_en
  if (locale.value === 'ar' && call.title_ar) return call.title_ar
  return call.title_fr
}

const getLocalizedDescription = (call: any) => {
  if (locale.value === 'en' && call.description_en) return call.description_en
  if (locale.value === 'ar' && call.description_ar) return call.description_ar
  return call.description_fr
}

// Format deadline
const formatDeadline = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Check if deadline is near (within 14 days)
const isDeadlineNear = (dateStr: string) => {
  const deadline = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays > 0 && diffDays <= 14
}

// Type badge classes
const getTypeBadgeClasses = (type: string) => {
  switch (type) {
    case 'candidature':
      return 'bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400'
    case 'bourse':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    case 'projet':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    case 'recrutement':
      return 'bg-brand-red-100 dark:bg-brand-red-900/30 text-brand-red-700 dark:text-brand-red-400'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
  }
}
</script>

<template>
  <div class="py-8">
    <!-- Open Calls -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
        <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-brand-blue-500" />
        {{ t('projets.appels.title') }}
      </h2>

      <!-- Empty state -->
      <div
        v-if="openCalls.length === 0"
        class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl"
      >
        <font-awesome-icon icon="fa-solid fa-inbox" class="w-12 h-12 text-gray-400 mb-4" />
        <p class="text-gray-600 dark:text-gray-400">{{ t('projets.appels.noAppels') }}</p>
      </div>

      <!-- Calls list -->
      <div v-else class="space-y-4">
        <article
          v-for="call in openCalls"
          :key="call.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col md:flex-row">
            <!-- Image -->
            <div class="md:w-1/3 h-48 md:h-auto">
              <img
                :src="call.image"
                :alt="getLocalizedTitle(call)"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Content -->
            <div class="flex-1 p-6">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <!-- Type badge -->
                <span
                  class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
                  :class="getTypeBadgeClasses(call.type)"
                >
                  {{ t(`projets.appels.type.${call.type}`) }}
                </span>

                <!-- Deadline badge -->
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
                  :class="isDeadlineNear(call.deadline) ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
                >
                  <font-awesome-icon icon="fa-solid fa-clock" class="w-3 h-3" />
                  {{ t('projets.appels.deadline') }}: {{ formatDeadline(call.deadline) }}
                </span>
              </div>

              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {{ getLocalizedTitle(call) }}
              </h3>

              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {{ getLocalizedDescription(call) }}
              </p>

              <!-- Partners logos -->
              <div v-if="call.partner_logos.length > 0" class="flex items-center gap-3 mb-4">
                <img
                  v-for="(logo, idx) in call.partner_logos.slice(0, 3)"
                  :key="idx"
                  :src="logo"
                  alt="Partner"
                  class="h-8 w-auto object-contain"
                />
              </div>

              <!-- Action button -->
              <NuxtLink
                v-if="call.slug"
                :to="localePath(`/projets/${projectSlug}/appels/${call.slug}`)"
                class="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {{ t('projets.appels.seeDetails') }}
                <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
              </NuxtLink>
              <a
                v-else-if="call.url"
                :href="call.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {{ t('projets.appels.seeDetails') }}
                <font-awesome-icon icon="fa-solid fa-external-link-alt" class="w-4 h-4" />
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Closed Calls -->
    <section v-if="closedCalls.length > 0">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
        <font-awesome-icon icon="fa-solid fa-archive" class="text-gray-400" />
        {{ t('projets.appels.closedTitle') }}
      </h2>

      <div class="space-y-3">
        <article
          v-for="call in closedCalls"
          :key="call.id"
          class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-start gap-4">
            <img
              :src="call.image"
              :alt="getLocalizedTitle(call)"
              class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="getTypeBadgeClasses(call.type)"
                >
                  {{ t(`projets.appels.type.${call.type}`) }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t('projets.appels.deadline') }}: {{ formatDeadline(call.deadline) }}
                </span>
              </div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
                {{ getLocalizedTitle(call) }}
              </h3>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
