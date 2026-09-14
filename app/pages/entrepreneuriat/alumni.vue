<script setup lang="ts">
/**
 * « Nos alumni » du mini-site PEI : sous-onglets par type de portrait (?type=), bandeau de chiffres,
 * une section par cohorte, encart « Devenir mentor ».
 * Spec : specs/024-pei-public-alumni-resources-news (US1).
 */
const { t } = useI18n()
const route = useRoute()
const { listLaureates } = usePublicEntrepreneurshipApi()

const page = await usePeiPage({ heroPrefix: 'alumni', navKey: 'alumni' })
const { text } = page

const { data: laureatesData } = await useAsyncData('pei-alumni-laureates', () =>
  listLaureates().catch(() => ({ groups: [], stats: { laureates: 0, cohorts: 0, max_grant_amount: null } })),
)

const currentType = computed(() => laureateTypeFromQuery(route.query[PEI_LAUREATE_TAB_QUERY]))

const sections = computed(() => {
  // Table partagée avec le backoffice (useEntrepreneurshipApi)
  const cohortType = cohortTypeForLaureateType[currentType.value]
  return (laureatesData.value?.groups ?? []).filter(g => g.cohort.type === cohortType && g.laureates.length > 0)
})

const tabs = computed(() => [
  { key: 'fse_laureate', label: t('pei.alumni.tabs.fse'), icon: 'fa-solid fa-award', to: { path: '/entrepreneuriat/alumni' } },
  { key: 'student_entrepreneur', label: t('pei.alumni.tabs.see'), icon: 'fa-solid fa-user-graduate', to: { path: '/entrepreneuriat/alumni', query: { [PEI_LAUREATE_TAB_QUERY]: 'student_entrepreneur' } } },
])

const stats = computed(() =>
  [1, 2, 3]
    .map(n => ({ value: text(`alumni.stats.${n}.value`), label: text(`alumni.stats.${n}.label`) }))
    .filter(stat => stat.value),
)

const sectionPrefix = computed(() => (currentType.value === 'student_entrepreneur' ? 'alumni.see' : 'alumni.fse'))
const sectionBadge = computed(() => text(`${sectionPrefix.value}.badge`))
const sectionTitle = computed(() => text(`${sectionPrefix.value}.title`))

const mentorEmail = computed(() => text('contact.email'))
const showMentor = computed(() => !!text('see.mentor.title') && !!mentorEmail.value)
const mentorHref = computed(() => `mailto:${mentorEmail.value}?subject=${encodeURIComponent(t('pei.alumni.mentorSubject'))}`)

page.applySeo()
</script>

<template>
  <div>
    <PageHero v-bind="page.hero.value" :breadcrumb="page.breadcrumb.value" />

    <EntrepreneurshipSubNav />

    <EntrepreneurshipPillTabs
      :aria-label="t('pei.alumni.tabsLabel')"
      :active-key="currentType"
      :tabs="tabs"
    />

    <EntrepreneurshipStatsPanel v-if="stats.length" variant="band" :stats="stats" />

    <div class="bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <template v-if="sections.length">
          <header v-if="sectionTitle" class="mb-4">
            <span
              v-if="sectionBadge"
              class="inline-block rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-1.5"
            >
              {{ sectionBadge }}
            </span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {{ sectionTitle }}
            </h2>
            <div class="mt-4 w-32 h-1 bg-brand-blue-500" aria-hidden="true" />
          </header>

          <EntrepreneurshipCohortSection
            v-for="group in sections"
            :key="group.cohort.id"
            :cohort="group.cohort"
            :laureates="group.laureates"
            :anchor-id="`cohorte-${group.cohort.code}`"
          />
        </template>

        <EntrepreneurshipEmptyState
          v-else
          icon="fa-solid fa-user-graduate"
          :title="t('pei.alumni.empty.title')"
          :description="t('pei.alumni.empty.description')"
          to="/entrepreneuriat"
          :link-label="t('pei.common.backHome')"
        />
      </div>
    </div>

    <section v-if="showMentor" class="bg-gray-50 dark:bg-gray-800/60 py-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <EntrepreneurshipCtaBanner
          :title="text('see.mentor.title')"
          :description="text('see.mentor.description')"
          :button-label="text('see.mentor.button') || t('pei.alumni.mentorSubject')"
          :href="mentorHref"
        />
      </div>
    </section>
  </div>
</template>
