<script setup lang="ts">
/**
 * « Nos activités » du mini-site PEI — mise en page éditoriale (maquette validée) :
 * hero bleu nuit + anneau du parcours, bandeau des chiffres mis en avant, étapes 01-02 en grand format,
 * accompagnement opérationnel en cartes « escalier », animation de l'écosystème, agenda DDE, appel à l'action.
 * Toutes les données viennent des dispositifs (`pei_programs`), des clés éditoriales `entrepreneurship.*`
 * et des événements à venir de la DDE ; les libellés fixes sont dans l'i18n `pei.activities.*`.
 * Specs : specs/023-pei-public-home-activities (US2, US4), specs/026 (fil d'Ariane partagé).
 */
import type { PeiProgramPhase, PeiProgramPublic } from '~/types/api/entrepreneurship'
import type { PeiStepTone } from '~/utils/pei-presentation'
import type { JourneyRingStep } from '~/components/entrepreneurship/JourneyRing.vue'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { public: { siteUrl } } = useRuntimeConfig()

const { loadContent, getRawContent } = useEditorialContent('entrepreneurship')
const { getMediaUrl, getImageVariantUrl } = useMediaApi()
const { listPrograms } = usePublicEntrepreneurshipApi()
const { listPublishedEvents } = usePublicEventsApi()
const { localized } = useLocalizedField()
const { buildPeiOrganization, buildWebPage, buildBreadcrumbList } = usePeiJsonLd()

await useAsyncData('editorial-entrepreneurship', () => loadContent().then(() => true))

const text = (key: string): string => getRawContent(`entrepreneurship.${key}`)?.trim() || ''

const keyServiceId = computed(() => {
  const id = text('dde_service_id')
  return isUuid(id) ? id : null
})

// Fil d'Ariane partagé du mini-site (spec 026) et service DDE unique
// (parent du pôle de page dédiée `/entrepreneuriat`, sinon clé `entrepreneurship.dde_service_id`)
const { breadcrumb, ddeId, ready: breadcrumbReady } = usePeiBreadcrumb(() => t('pei.nav.activities'), keyServiceId)

const [{ data: programsData }, { data: eventsData }] = await Promise.all([
  useAsyncData('pei-activities-programs', () => listPrograms().catch(() => [])),
  useAsyncData('pei-activities-events', async () => {
    await breadcrumbReady
    return ddeId.value
      ? listPublishedEvents({ service_id: ddeId.value, upcoming: true, order: 'asc', limit: 6 }).then(r => r.items).catch(() => [])
      : []
  }),
  breadcrumbReady,
])

// ---------------------------------------------------------------------------
// Étapes du parcours : dispositifs hors écosystème, dans l'ordre des phases
// ---------------------------------------------------------------------------
interface JourneyStep {
  program: PeiProgramPublic
  number: string
  tone: PeiStepTone
  /** Ancre `#phase-*` portée par le premier dispositif de chaque phase. */
  anchor?: string
}

/** Phases présentées en grand format éditorial ; les suivantes forment l'accompagnement opérationnel. */
const FEATURE_PHASES: PeiProgramPhase[] = ['awareness', 'status']
const STATUS_PAGE = '/entrepreneuriat/statut-etudiant-entrepreneur'

const phaseRank = (phase: PeiProgramPhase) => PEI_PHASE_ORDER.indexOf(phase)
const byJourney = (a: PeiProgramPublic, b: PeiProgramPublic) =>
  phaseRank(a.phase) - phaseRank(b.phase) || a.display_order - b.display_order

const steps = computed<JourneyStep[]>(() => {
  const seen = new Set<PeiProgramPhase>()
  return (programsData.value ?? [])
    .filter(p => p.phase !== 'ecosystem')
    .sort(byJourney)
    .map((program, index) => {
      const first = !seen.has(program.phase)
      seen.add(program.phase)
      return {
        program,
        number: String(index + 1).padStart(2, '0'),
        tone: peiStepTone(program.phase),
        anchor: first ? PEI_PHASE_ANCHORS[program.phase] : undefined,
      }
    })
})

const featureSteps = computed(() => steps.value.filter(s => FEATURE_PHASES.includes(s.program.phase)))
const supportSteps = computed(() => steps.value.filter(s => !FEATURE_PHASES.includes(s.program.phase)))
const supportPhases = computed(() => [...new Set(supportSteps.value.map(s => s.program.phase))])
const ecosystemPrograms = computed(() =>
  (programsData.value ?? []).filter(p => p.phase === 'ecosystem').sort((a, b) => a.display_order - b.display_order))

const ringSteps = computed<JourneyRingStep[]>(() => steps.value.map(step => ({
  number: step.number,
  label: (step.program.sigle || localized(step.program, 'title')).toUpperCase(),
  title: localized(step.program, 'title'),
  fill: step.tone.fill,
  anchor: PEI_PHASE_ANCHORS[step.program.phase],
})))

/** Bandeau : chiffres mis en avant (`highlight`) des dispositifs, dans l'ordre du parcours. */
const figures = computed(() => steps.value
  .map(step => ({ value: localized(step.program, 'highlight'), label: localized(step.program, 'title'), code: step.program.code }))
  .filter(f => !!f.value))
const figuresCols: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }

/** Escalier : la dernière carte (blanche) est la plus haute ; désactivé en mobile et au-delà de 3 cartes. */
function supportCardLayout(index: number): { variant: 'dark' | 'darker' | 'light', offset: string } {
  const total = supportSteps.value.length
  const fromEnd = total - 1 - index
  const variant = fromEnd === 0 && total > 1 ? 'light' : fromEnd === 1 ? 'darker' : 'dark'
  const offsets = ['', 'lg:mt-16', 'lg:mt-32']
  return { variant, offset: total <= 3 ? offsets[fromEnd] ?? '' : '' }
}

const supportCovers = computed(() => supportSteps.value
  .filter(s => s.program.cover_image_url)
  .map(s => ({ src: getImageVariantUrl(s.program.cover_image_url!, 'medium'), alt: localized(s.program, 'title'), key: s.program.id })))

// ---------------------------------------------------------------------------
// Écosystème et agenda
// ---------------------------------------------------------------------------
const events = computed(() => eventsData.value ?? [])
const ecosystemItems = computed(() => text('activities.ecosystem.items').split('\n').map(s => s.trim()).filter(Boolean))
const WALL_COLORS = [
  'text-brand-blue-900 dark:text-white',
  'text-brand-blue-500 dark:text-brand-blue-300',
  'text-brand-red-700 dark:text-brand-red-300',
]

/** Mosaïque : visuels des dispositifs d'écosystème puis des prochains événements (4 au plus). */
const mosaic = computed(() => [
  ...ecosystemPrograms.value
    .filter(p => p.cover_image_url)
    .map(p => ({ key: p.id, src: getImageVariantUrl(p.cover_image_url!, 'medium'), alt: localized(p, 'title') })),
  ...events.value
    .filter(e => e.cover_image)
    .map(e => ({ key: e.id, src: getImageVariantUrl(e.cover_image!, 'medium'), alt: localized(e, 'title') })),
].slice(0, 4))
const MOSAIC_LAYOUTS: Record<number, string[]> = {
  1: ['col-span-2 lg:col-span-4 lg:row-span-2'],
  2: ['col-span-2 lg:row-span-2', 'col-span-2 lg:row-span-2'],
  3: ['col-span-2 lg:row-span-2', 'lg:col-span-2', 'lg:col-span-2'],
  4: ['col-span-2 lg:row-span-2', '', '', 'col-span-2'],
}
const failedMosaic = ref<string[]>([])
const mosaicShown = computed(() => mosaic.value.filter(m => !failedMosaic.value.includes(m.key)))

const showEcosystem = computed(() => ecosystemItems.value.length > 0 || ecosystemPrograms.value.length > 0 || mosaicShown.value.length > 0)
const ecosystemTitle = computed(() => text('activities.ecosystem.title') || t('pei.phases.ecosystem'))

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
const heroTitle = computed(() => text('activities.hero.title') || t('pei.seo.activitiesTitle'))
const heroSubtitle = computed(() => text('activities.hero.subtitle'))
const heroImage = computed(() => getMediaUrl(text('activities.hero.image') || null, 'medium'))
const heroImageFailed = ref(false)

/** Titre sur deux lignes : saut de ligne saisi, sinon première ponctuation (, : ; —), sinon dernier mot. */
const heroTitleParts = computed<[string, string]>(() => {
  const title = heroTitle.value
  const newline = title.indexOf('\n')
  if (newline > 0) return [title.slice(0, newline).trim(), title.slice(newline + 1).trim()]
  const match = title.match(/^(.+?[,:;—–])\s+(.+)$/)
  if (match) return [match[1]!, match[2]!]
  const words = title.split(/\s+/)
  if (words.length < 2) return [title, '']
  return [words.slice(0, -1).join(' '), words.at(-1)!]
})

const heroSecondaryLabel = computed(() => t('pei.activities.discoverJourney'))
const heroPrimaryLabel = computed(() => t('pei.nav.cta'))
const journeyTarget = computed(() => (featureSteps.value.length ? 'parcours' : supportSteps.value.length ? 'accompagnement' : null))

const ctaTitle = computed(() => text('cta.title'))
const contactEmail = computed(() => text('contact.email'))

// Ancre directe (/entrepreneuriat/activites#phase-incubation) : positionnée après hydratation
const { $lenis } = useNuxtApp()
function goTo(hash: string) {
  scrollToPageAnchor(hash, { lenis: $lenis })
}
onMounted(() => {
  if (!route.hash) return
  // Après le défilement générique d'app.vue (600 ms, décalage d'en-tête seul)
  setTimeout(() => scrollToPageAnchor(route.hash, { smooth: false, lenis: $lenis }), 900)
})

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
    <!-- ===================== HERO ===================== -->
    <section class="relative overflow-hidden bg-brand-blue-900 dark:bg-brand-blue-950 text-white" aria-labelledby="pei-activities-title">
      <img
        v-if="heroImage && !heroImageFailed"
        :src="heroImage"
        alt=""
        class="absolute inset-0 h-full w-full object-cover opacity-15"
        fetchpriority="high"
        decoding="async"
        @error="heroImageFailed = true"
      >
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] items-center">
        <div class="min-w-0 flex flex-col gap-7">
          <nav v-if="breadcrumb.length" :aria-label="t('pei.breadcrumb.label')">
            <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-brand-blue-200">
              <li v-for="(item, index) in breadcrumb" :key="index" class="flex items-center gap-2">
                <NuxtLink v-if="item.to" :to="localePath(item.to)" class="hover:text-white transition-colors">
                  {{ item.label }}
                </NuxtLink>
                <span v-else class="font-semibold text-brand-red-300" aria-current="page">{{ item.label }}</span>
                <font-awesome-icon
                  v-if="index < breadcrumb.length - 1"
                  icon="fa-solid fa-chevron-right"
                  class="w-2.5 h-2.5 text-white/40 rtl:rotate-180"
                  aria-hidden="true"
                />
              </li>
            </ol>
          </nav>

          <span
            v-if="text('activities.hero.badge')"
            class="self-start rounded-full border border-white/25 px-3.5 py-2 text-xs sm:text-[0.8125rem] font-semibold uppercase tracking-widest text-brand-blue-100"
          >
            {{ text('activities.hero.badge') }}
          </span>

          <h1 id="pei-activities-title" class="text-5xl sm:text-6xl xl:text-[5.25rem] font-black leading-[0.98] tracking-tight break-words">
            {{ heroTitleParts[0] }}<template v-if="heroTitleParts[1]">
              <br><span class="text-[#ff7a7a]">{{ heroTitleParts[1] }}</span>
            </template>
          </h1>

          <p v-if="heroSubtitle" class="max-w-xl text-lg sm:text-xl leading-relaxed text-brand-blue-100">
            {{ heroSubtitle }}
          </p>

          <div class="flex flex-wrap gap-3 pt-2">
            <a
              v-if="journeyTarget"
              :href="`#${journeyTarget}`"
              class="inline-flex min-h-[3.25rem] items-center gap-2.5 rounded-xl bg-white px-6 font-bold text-brand-blue-900 hover:bg-brand-blue-50 transition-colors"
              @click.prevent="goTo(`#${journeyTarget}`)"
            >
              {{ heroSecondaryLabel }}
              <font-awesome-icon icon="fa-solid fa-arrow-down" class="w-4 h-4" aria-hidden="true" />
            </a>
            <NuxtLink
              :to="localePath(STATUS_PAGE)"
              class="inline-flex min-h-[3.25rem] items-center rounded-xl bg-brand-red-500 px-6 font-bold text-white hover:bg-brand-red-600 transition-colors"
            >
              {{ heroPrimaryLabel }}
            </NuxtLink>
          </div>
        </div>

        <EntrepreneurshipJourneyRing
          v-if="ringSteps.length"
          :steps="ringSteps"
          class="w-full max-w-[22rem] sm:max-w-md lg:max-w-none mx-auto text-white"
        />
      </div>
    </section>

    <EntrepreneurshipSubNav />

    <!-- ===================== CHIFFRES ===================== -->
    <section
      v-if="figures.length"
      :aria-label="t('pei.activities.figuresLabel')"
      class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
    >
      <dl
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8"
        :class="figuresCols[Math.min(figures.length, 5)]"
      >
        <div v-for="figure in figures" :key="figure.code" class="flex flex-col-reverse gap-1.5 min-w-0">
          <dt class="text-[0.9375rem] text-gray-600 dark:text-gray-400">
            {{ figure.label }}
          </dt>
          <dd class="text-4xl sm:text-5xl font-black tracking-tight text-brand-blue-900 dark:text-white break-words">
            {{ figure.value }}
          </dd>
        </div>
      </dl>
    </section>

    <!-- ===================== ÉTAPES 01-02 (grand format) ===================== -->
    <section
      v-if="featureSteps.length"
      id="parcours"
      aria-labelledby="pei-journey-title"
      class="scroll-mt-40 bg-white dark:bg-gray-900"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-28 lg:pb-24 flex flex-col gap-16 lg:gap-24">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-12">
          <h2 id="pei-journey-title" class="max-w-3xl text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.05] tracking-tight text-brand-blue-900 dark:text-white">
            {{ t('pei.activities.journey.title') }}
          </h2>
          <p class="max-w-md text-[1.0625rem] leading-relaxed text-gray-600 dark:text-gray-400">
            {{ t('pei.activities.journey.intro', { n: steps.length }, steps.length) }}
          </p>
        </div>

        <EntrepreneurshipStepFeature
          v-for="(step, index) in featureSteps"
          :key="step.program.id"
          :program="step.program"
          :number="step.number"
          :tone="step.tone"
          :reverse="index % 2 === 1"
          :anchor-id="step.anchor"
        >
          <NuxtLink
            v-if="step.program.phase === 'status'"
            :to="localePath(STATUS_PAGE)"
            class="self-start inline-flex min-h-[3rem] items-center gap-2.5 rounded-xl border-2 px-5 font-bold transition-colors border-[color:var(--pei-fill)] text-[color:var(--pei-ink)] hover:bg-[color:var(--pei-soft)] dark:border-[color:var(--pei-fill)] dark:text-[color:var(--pei-fill)] dark:hover:bg-[color:var(--pei-soft-dark)]"
          >
            {{ t('pei.activities.statusLink') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </EntrepreneurshipStepFeature>
      </div>
    </section>

    <!-- ===================== ACCOMPAGNEMENT OPÉRATIONNEL ===================== -->
    <section
      v-if="supportSteps.length"
      id="accompagnement"
      aria-labelledby="pei-support-title"
      class="scroll-mt-40 bg-brand-blue-900 dark:bg-brand-blue-950 text-white"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:pt-28 lg:pb-28 flex flex-col gap-12 lg:gap-16">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-12">
          <div class="flex flex-col gap-4">
            <p class="text-xs sm:text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-brand-blue-200">
              {{ t('pei.activities.support.eyebrow') }}
            </p>
            <h2 id="pei-support-title" class="max-w-3xl text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.05] tracking-tight">
              {{ t('pei.activities.support.title', { n: supportPhases.length }, supportPhases.length) }}
            </h2>
          </div>
          <p class="flex items-center gap-3 text-sm font-semibold text-brand-blue-100">
            <span>{{ t('pei.activities.support.from') }}</span>
            <svg class="w-28 sm:w-40 h-4 shrink-0 rtl:-scale-x-100" viewBox="0 0 160 16" fill="none" aria-hidden="true">
              <path d="M2 8h150" stroke="#9fb0e8" stroke-width="2" stroke-dasharray="4 6" />
              <path d="M146 2l8 6-8 6" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="text-white">{{ t('pei.activities.support.to') }}</span>
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <EntrepreneurshipPhaseCard
            v-for="(step, index) in supportSteps"
            :key="step.program.id"
            :program="step.program"
            :number="step.number"
            :phase-rank="supportPhases.indexOf(step.program.phase) + 1"
            :tone="step.tone"
            :variant="supportCardLayout(index).variant"
            :anchor-id="step.anchor"
            :class="supportCardLayout(index).offset"
          />
        </div>

        <div
          v-if="supportCovers.length"
          class="grid gap-6"
          :class="{ 'sm:grid-cols-2': supportCovers.length === 2, 'sm:grid-cols-3': supportCovers.length >= 3 }"
        >
          <img
            v-for="cover in supportCovers"
            :key="cover.key"
            :src="cover.src"
            :alt="cover.alt"
            class="h-52 sm:h-60 w-full rounded-2xl object-cover"
            loading="lazy"
            decoding="async"
          >
        </div>
      </div>
    </section>

    <!-- ===================== ÉCOSYSTÈME ===================== -->
    <section
      v-if="showEcosystem"
      :id="PEI_PHASE_ANCHORS.ecosystem"
      aria-labelledby="pei-ecosystem-title"
      class="scroll-mt-40 bg-[#faf8f4] dark:bg-gray-950"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28 flex flex-col gap-12 lg:gap-14">
        <div class="grid gap-8 lg:gap-20 lg:items-end" :class="{ 'lg:grid-cols-2': ecosystemPrograms.length }">
          <div class="flex flex-col gap-4">
            <p class="text-xs sm:text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-brand-red-700 dark:text-brand-red-300">
              {{ t('pei.activities.ecosystemEyebrow') }}
            </p>
            <h2 id="pei-ecosystem-title" class="max-w-3xl text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.05] tracking-tight text-brand-blue-900 dark:text-white">
              {{ ecosystemTitle }}
            </h2>
          </div>
          <div v-if="ecosystemPrograms.length" class="flex flex-col gap-6">
            <div v-for="program in ecosystemPrograms" :key="program.id">
              <h3 class="text-xl font-extrabold text-brand-blue-900 dark:text-white">
                {{ localized(program, 'title') }}
              </h3>
              <RichTextRenderer
                v-if="localized(program, 'content_html')"
                :html="localized(program, 'content_html')"
                class="mt-2 text-gray-700 dark:text-gray-300"
              />
              <p v-else-if="localized(program, 'tagline')" class="mt-2 leading-relaxed text-gray-700 dark:text-gray-300">
                {{ localized(program, 'tagline') }}
              </p>
            </div>
          </div>
        </div>

        <ul
          v-if="ecosystemItems.length"
          class="text-3xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-black leading-[1.12] tracking-tight"
        >
          <li v-for="(item, index) in ecosystemItems" :key="item" class="inline">
            <span :class="WALL_COLORS[index % WALL_COLORS.length]">{{ item }}</span>
            <!-- Espace insécable avant le point, espace sécable après : coupure possible entre deux éléments -->
            <span v-if="index < ecosystemItems.length - 1" class="text-[#f7a64a]" aria-hidden="true">&nbsp;&nbsp;·&nbsp; </span>
          </li>
        </ul>

        <div
          v-if="mosaicShown.length"
          class="grid grid-cols-2 gap-4 lg:gap-5 auto-rows-[9rem] sm:auto-rows-[12rem] lg:grid-cols-4 lg:auto-rows-[13.75rem]"
        >
          <img
            v-for="(tile, index) in mosaicShown"
            :key="tile.key"
            :src="tile.src"
            :alt="tile.alt"
            class="h-full w-full object-cover"
            :class="[MOSAIC_LAYOUTS[mosaicShown.length]?.[index], index === 0 ? 'rounded-3xl' : 'rounded-2xl']"
            loading="lazy"
            decoding="async"
            @error="failedMosaic.push(tile.key)"
          >
        </div>
      </div>
    </section>

    <!-- ===================== PROCHAINS RENDEZ-VOUS ===================== -->
    <section
      v-if="events.length"
      :id="showEcosystem ? undefined : PEI_PHASE_ANCHORS.ecosystem"
      aria-labelledby="pei-agenda-title"
      class="scroll-mt-40 bg-white dark:bg-gray-900"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <EntrepreneurshipEventList
          variant="agenda"
          heading-id="pei-agenda-title"
          :events="events"
          more-to="/entrepreneuriat/actualites"
        />
      </div>
    </section>

    <!-- ===================== APPEL À L'ACTION ===================== -->
    <section
      v-if="ctaTitle"
      aria-labelledby="pei-activities-cta-title"
      class="bg-brand-blue-900 dark:bg-brand-blue-950 text-white"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-12">
        <div class="flex flex-col gap-4 max-w-3xl">
          <h2 id="pei-activities-cta-title" class="text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.05] tracking-tight">
            {{ ctaTitle }}
          </h2>
          <p v-if="text('cta.description')" class="text-lg sm:text-[1.1875rem] leading-relaxed text-brand-blue-100">
            {{ text('cta.description') }}
          </p>
        </div>
        <div class="flex flex-col gap-3 w-full sm:w-auto lg:w-[21.25rem] shrink-0">
          <NuxtLink
            :to="localePath(STATUS_PAGE)"
            class="flex min-h-[3.5rem] items-center justify-center rounded-xl bg-brand-red-500 px-6 font-extrabold text-white hover:bg-brand-red-600 transition-colors"
          >
            {{ text('cta.button') || t('pei.nav.cta') }}
          </NuxtLink>
          <a
            v-if="contactEmail"
            :href="`mailto:${contactEmail}`"
            class="flex min-h-[3.5rem] items-center justify-center gap-2 rounded-xl border border-white/30 px-6 font-bold text-white hover:bg-white/10 transition-colors break-all"
          >
            <font-awesome-icon icon="fa-regular fa-envelope" class="w-4 h-4 shrink-0" aria-hidden="true" />
            {{ contactEmail }}
          </a>
        </div>
      </div>
    </section>

    <!-- État vide : aucun dispositif ni contenu d'écosystème -->
    <section v-if="!steps.length && !showEcosystem && !events.length" class="bg-white dark:bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 py-16">
        <EntrepreneurshipEmptyState
          icon="fa-solid fa-route"
          :title="t('pei.activities.empty.title')"
          :description="t('pei.activities.empty.description')"
          to="/entrepreneuriat"
          :link-label="t('pei.common.backHome')"
        />
      </div>
    </section>
  </div>
</template>
