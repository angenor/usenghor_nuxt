<script setup lang="ts">
/**
 * « Nos activités » du mini-site PEI : un bloc par phase du parcours, événements à venir de la DDE.
 * Spec : specs/023-pei-public-home-activities (US2, US4).
 */
import type { PeiProgramPhase, PeiProgramPublic } from '~/types/api/entrepreneurship'

const { t, locale } = useI18n()
const route = useRoute()
const { public: { siteUrl } } = useRuntimeConfig()

const { loadContent, getRawContent } = useEditorialContent('entrepreneurship')
const { getMediaUrl } = useMediaApi()
const { listPrograms } = usePublicEntrepreneurshipApi()
const { listPublishedEvents } = usePublicEventsApi()
const { getServiceById, getServiceUrl } = usePublicOrganizationApi()
const { buildPeiOrganization, buildWebPage, buildBreadcrumbList } = usePeiJsonLd()

await useAsyncData('editorial-entrepreneurship', () => loadContent().then(() => true))

const text = (key: string): string => getRawContent(`entrepreneurship.${key}`)?.trim() || ''

const ddeServiceId = computed(() => {
  const id = text('dde_service_id')
  return isUuid(id) ? id : null
})

const [{ data: programsData }, { data: ddeService }, { data: eventsData }] = await Promise.all([
  useAsyncData('pei-activities-programs', () => listPrograms().catch(() => [])),
  useAsyncData('pei-activities-dde', () => (ddeServiceId.value ? getServiceById(ddeServiceId.value).catch(() => null) : Promise.resolve(null))),
  useAsyncData('pei-activities-events', () => (ddeServiceId.value
    ? listPublishedEvents({ service_id: ddeServiceId.value, upcoming: true, order: 'asc', limit: 6 }).then(r => r.items).catch(() => [])
    : Promise.resolve([]))),
])

const byOrder = (a: PeiProgramPublic, b: PeiProgramPublic) => a.display_order - b.display_order
const programsOf = (phase: PeiProgramPhase) => (programsData.value ?? []).filter(p => p.phase === phase).sort(byOrder)

const sections = computed(() =>
  PEI_PHASE_ORDER
    .filter(phase => phase !== 'ecosystem')
    .map(phase => ({ phase, programs: programsOf(phase) }))
    .filter(section => section.programs.length > 0),
)
const ecosystemPrograms = computed(() => programsOf('ecosystem'))
const events = computed(() => eventsData.value ?? [])
const chips = computed(() => text('activities.ecosystem.items').split('\n').map(s => s.trim()).filter(Boolean))
const showEcosystem = computed(() => chips.value.length > 0 || events.value.length > 0 || ecosystemPrograms.value.length > 0)

const anchors = computed(() => {
  const list = sections.value.map((section, index) => ({ phase: section.phase, n: index + 1 }))
  if (showEcosystem.value) list.push({ phase: 'ecosystem', n: list.length + 1 })
  return list
})

// Ancre directe (/entrepreneuriat/activites#phase-incubation) : positionnée après hydratation
const { $lenis } = useNuxtApp()
onMounted(() => {
  if (!route.hash) return
  // Après le défilement générique d'app.vue (600 ms, décalage d'en-tête seul)
  setTimeout(() => scrollToPageAnchor(route.hash, { smooth: false, lenis: $lenis }), 900)
})

// Hero
const heroTitle = computed(() => text('activities.hero.title') || t('pei.seo.activitiesTitle'))
const heroSubtitle = computed(() => text('activities.hero.subtitle'))
const heroImage = computed(() => getMediaUrl(text('activities.hero.image') || null, 'medium'))

const ddeLink = computed(() => (ddeService.value ? getServiceUrl(ddeService.value) : null))
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('about.tabs.organization'), to: '/a-propos/organisation' },
  { label: ddeService.value?.sigle || t('pei.breadcrumb.dde'), to: ddeLink.value ?? undefined },
  { label: t('pei.breadcrumb.pole'), to: '/entrepreneuriat' },
  { label: t('pei.nav.activities') },
])

// SEO — après useRoute() et les useAsyncData (gotcha TDZ unhead)
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }
const seoDescription = computed(() => heroSubtitle.value || t('pei.seo.activitiesDescription'))

useSeoMeta({
  title: () => heroTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => heroTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => siteUrl + route.fullPath,
  ogImage: () => (heroImage.value ? siteUrl + heroImage.value : undefined),
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})

useHead(() => ({
  script: [
    { key: 'jsonld-pei-organization', type: 'application/ld+json', innerHTML: JSON.stringify(buildPeiOrganization({ name: text('hero.title') || t('pei.seo.homeTitle'), email: text('contact.email') })) },
    { key: 'jsonld-pei-webpage', type: 'application/ld+json', innerHTML: JSON.stringify(buildWebPage({ path: route.path, name: heroTitle.value, description: seoDescription.value })) },
    { key: 'jsonld-pei-breadcrumb', type: 'application/ld+json', innerHTML: JSON.stringify(buildBreadcrumbList(breadcrumb.value)) },
  ],
}))
</script>

<template>
  <div>
    <PageHero
      :title="heroTitle"
      :subtitle="heroSubtitle || undefined"
      :badge="text('activities.hero.badge') || undefined"
      :images="heroImage ? [heroImage] : []"
      :breadcrumb="breadcrumb"
    />

    <EntrepreneurshipSubNav />

    <!-- Navigation par ancres vers les phases -->
    <nav
      v-if="anchors.length"
      :aria-label="t('pei.activities.anchorsLabel')"
      class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul class="flex gap-2 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          <li v-for="anchor in anchors" :key="anchor.phase" class="shrink-0">
            <a
              :href="`#${PEI_PHASE_ANCHORS[anchor.phase]}`"
              @click.prevent="scrollToPageAnchor(`#${PEI_PHASE_ANCHORS[anchor.phase]}`, { lenis: $lenis })"
              class="block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {{ anchor.n }}. {{ t(`pei.phases.${anchor.phase}`) }}
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EntrepreneurshipProgramSection
          v-for="(section, index) in sections"
          :key="section.phase"
          :phase="section.phase"
          :programs="section.programs"
          :index="index + 1"
        />

        <section
          v-if="showEcosystem"
          :id="PEI_PHASE_ANCHORS.ecosystem"
          aria-labelledby="phase-ecosystem-title"
          class="scroll-mt-40 py-16 border-t border-gray-200 dark:border-gray-700"
          :class="{ 'border-t-0': !sections.length }"
        >
          <div class="flex items-center gap-4 mb-10">
            <span class="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-lg font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
              {{ sections.length + 1 }}
            </span>
            <h2 id="phase-ecosystem-title" class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {{ t('pei.phases.ecosystem') }}
            </h2>
          </div>

          <EntrepreneurshipProgramSection
            v-if="ecosystemPrograms.length"
            class="mb-12"
            phase="ecosystem"
            :programs="ecosystemPrograms"
            :index="sections.length + 1"
            :standalone="false"
          />

          <EntrepreneurshipEcosystemChips
            :title="text('activities.ecosystem.title')"
            :items="chips"
          />

          <EntrepreneurshipEventList
            class="mt-12 max-w-4xl mx-auto"
            :events="events"
          />
        </section>
      </div>
    </div>
  </div>
</template>
