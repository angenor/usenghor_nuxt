<script setup lang="ts">
/**
 * « Nos alumni » du mini-site PEI, selon la maquette validée : hero bleu nuit + mosaïque de
 * portraits, sous-onglets segmentés (?type=), cartes de chiffres, puis
 * - lauréats FSE : frise des promotions, portrait à la une, une section par promotion
 *   (affichée même sans portrait : « Portraits à venir ») ;
 * - étudiants-entrepreneurs : grille à étiquettes de parcours et lien vers le statut ;
 * et encart « Devenir mentor ».
 * Mode aperçu (`usePeiPreview`, actif par défaut ; `?apercu=0` = état réel) : les zones vides
 * sont complétées par `@bank/mock-data/pei-alumni-preview` et les photos de `usePeiPreviewImages`.
 * Spec d'origine : specs/024-pei-public-alumni-resources-news (US1).
 */
import type { PeiCohortPublic, PeiCohortType, PeiLaureatePublic, PeiLaureatesPublic } from '~/types/api/entrepreneurship'
import type { PeiStepTone } from '~/utils/pei-presentation'
import type { CohortTimelineItem } from '~/components/entrepreneurship/CohortTimeline.vue'
import {
  buildPreviewFeatured,
  buildPreviewFseCohorts,
  buildPreviewLaureates,
  buildPreviewSeeCohorts,
  buildPreviewSeeGroups,
  peiAlumniPreview,
  peiAlumniPreviewCohortText,
  previewText,
} from '@bank/mock-data/pei-alumni-preview'

const { t, te, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { listLaureates, listCohorts } = usePublicEntrepreneurshipApi()
const { localized } = useLocalizedField()
const { previewPath } = usePeiPreview()

const EMPTY_LAUREATES: PeiLaureatesPublic = { groups: [], stats: { laureates: 0, cohorts: 0, max_grant_amount: null } }
const STATUS_PAGE = '/entrepreneuriat/statut-etudiant-entrepreneur'
/** Emplacements de la réserve d'images de l'aperçu : mosaïque (0-2), à la une (3), cartes (4+). */
const PHOTO_SLOTS = { hero: 0, featured: 3, cards: 4 }

const [page, { preview, image }, { data: laureatesData }, { data: cohortsData }] = await Promise.all([
  usePeiPage({ heroPrefix: 'alumni', navKey: 'alumni' }),
  usePeiPreviewImages(),
  useAsyncData('pei-alumni-laureates', () => listLaureates().catch(() => EMPTY_LAUREATES)),
  // Toutes les cohortes actives : une promotion sans portrait publié garde sa section
  useAsyncData('pei-alumni-cohorts', () => listCohorts().catch(() => [] as PeiCohortPublic[])),
])
const { text } = page

const groups = computed(() => laureatesData.value?.groups ?? [])
const laureatesByCohort = computed(() => new Map(groups.value.map(g => [g.cohort.id, g.laureates])))

/** Cohortes actives d'un type (liste publique ∪ cohortes des portraits), dans l'ordre chronologique. */
function cohortsOfType(type: PeiCohortType): PeiCohortPublic[] {
  const byId = new Map<string, PeiCohortPublic>()
  for (const cohort of cohortsData.value ?? []) if (cohort.type === type) byId.set(cohort.id, cohort)
  for (const group of groups.value) if (group.cohort.type === type && !byId.has(group.cohort.id)) byId.set(group.cohort.id, group.cohort)
  return sortCohortsChronologically([...byId.values()])
}

const currentType = computed(() => laureateTypeFromQuery(route.query[PEI_LAUREATE_TAB_QUERY]))

// ---------------------------------------------------------------------------
// Lauréats FSE : une section par promotion
// ---------------------------------------------------------------------------
interface FseSection {
  cohort: PeiCohortPublic
  laureates: PeiLaureatePublic[]
  tone: PeiStepTone
  anchor: string
  short: string
  focusFallback: string
  note: { title: string, text: string } | null
  sample: boolean
  sampleCohort: boolean
}

/** Texte comparable (casse, apostrophes, espaces) : évite de répéter en aperçu un texte déjà présent dans le focus réel. */
const normalize = (value: string) => value.toLocaleLowerCase().replace(/[’']/g, '\'').replace(/\s+/g, ' ').trim()

const fseSections = computed<FseSection[]>(() => {
  const real = cohortsOfType('fse')
  const sampleCohorts = !real.length && preview.value
  const cohorts = sampleCohorts ? buildPreviewFseCohorts() : real
  return cohorts.map((cohort, rank) => {
    const published = laureatesByCohort.value.get(cohort.id) ?? []
    const sample = preview.value && !published.length
    const mock = preview.value ? peiAlumniPreviewCohortText(cohort, rank) : null
    const count = peiAlumniPreview.fsePortraitsPerCohort
    const realFocus = normalize(localized(cohort, 'focus'))
    const noteText = mock ? previewText(mock.note.text, locale.value) : ''
    return {
      cohort,
      laureates: sample
        ? buildPreviewLaureates(cohort, count, { type: 'fse_laureate', offset: rank * count, photo: n => image(PHOTO_SLOTS.cards + n) })
        : published,
      tone: peiCohortTone(rank),
      anchor: `cohorte-${cohort.code}`,
      short: splitCohortLabel(localized(cohort, 'label')).short,
      focusFallback: mock ? previewText(mock.focus, locale.value) : '',
      note: mock && !localized(cohort, 'summary_html') && !(realFocus && realFocus.includes(normalize(noteText)))
        ? { title: t(`pei.alumni.cohort.${mock.note.kind}`), text: noteText }
        : null,
      sample,
      sampleCohort: sampleCohorts,
    }
  })
})

const timelineItems = computed<CohortTimelineItem[]>(() =>
  fseSections.value.map(section => ({
    id: section.cohort.id,
    anchor: section.anchor,
    short: section.short,
    year: section.cohort.year,
    focus: localized(section.cohort, 'focus') || section.focusFallback,
    tone: section.tone,
  })),
)

/** Titre de la vue FSE : éditorial, sinon « Trois promotions, une même ambition. ». */
const fseTitle = computed(() => {
  const editorial = text('alumni.fse.title')
  if (editorial) return editorial
  const n = fseSections.value.length
  const word = ['', '', 'two', 'three', 'four', 'five', 'six'][n]
  const key = `pei.alumni.timeline.numbers.${word}`
  return t('pei.alumni.timeline.title', { count: word && te(key) ? t(key) : n }, n)
})

/** Portrait à la une : premier portrait FSE mis en avant avec verbatim ; aperçu : exemple du cahier des charges. */
const featured = computed(() => {
  for (const section of fseSections.value) {
    if (section.sample) continue
    const laureate = sortLaureatesFeaturedFirst(section.laureates).find(l => l.is_featured && localized(l, 'quote'))
    if (laureate) return { laureate, section, sample: false }
  }
  if (!preview.value || !fseSections.value.length) return null
  const section = fseSections.value.find((s, rank) => peiAlumniPreviewCohortText(s.cohort, rank)?.number === 1) ?? fseSections.value[0]!
  return { laureate: buildPreviewFeatured(section.cohort, image(PHOTO_SLOTS.featured)), section, sample: true }
})

// ---------------------------------------------------------------------------
// Étudiants-entrepreneurs : grille unique, étiquette = cohorte SEE
// ---------------------------------------------------------------------------
interface SeeItem {
  laureate: PeiLaureatePublic
  track: { label: string, tone: PeiStepTone }
  sample: boolean
}

const seeItems = computed<SeeItem[]>(() => {
  const cohorts = cohortsOfType('see')
  const trackOf = (cohort: PeiCohortPublic, rank: number) => ({ label: localized(cohort, 'label'), tone: peiSeeTrackTone(rank) })
  const real = cohorts.flatMap((cohort, rank) =>
    sortLaureatesFeaturedFirst(laureatesByCohort.value.get(cohort.id) ?? [])
      .map(laureate => ({ laureate, track: trackOf(cohort, rank), sample: false })),
  )
  if (real.length || !preview.value) return real
  // Aperçu : 8 exemples en alternance sur les cohortes SEE réelles, sinon sur SEE 1 / SEE 2 d'exemple
  const trackCohorts = cohorts.length ? cohorts : buildPreviewSeeCohorts()
  return buildPreviewSeeGroups(trackCohorts, n => image(PHOTO_SLOTS.cards + n))
    .flatMap((group, rank) => group.laureates.map(laureate => ({ laureate, track: trackOf(group.cohort, rank), sample: true })))
    .sort((a, b) => a.laureate.display_order - b.laureate.display_order)
})

const seeTitle = computed(() => text('alumni.see.title') || t('pei.alumni.see.title'))

// ---------------------------------------------------------------------------
// Onglets (?type=, ancre #portraits pour rester sur les onglets) et chiffres
// ---------------------------------------------------------------------------
const explicitPreview = computed(() => {
  const value = route.query[PEI_PREVIEW_QUERY]
  return value === '0' || value === '1' ? value : null
})

function tabLink(type?: string) {
  const query: Record<string, string> = {}
  if (type) query[PEI_LAUREATE_TAB_QUERY] = type
  if (explicitPreview.value) query[PEI_PREVIEW_QUERY] = explicitPreview.value
  return { path: '/entrepreneuriat/alumni', query, hash: '#portraits' }
}

const fseCount = computed(() => fseSections.value.reduce((total, section) => total + section.laureates.length, 0))

const tabs = computed(() => [
  { key: 'fse_laureate', label: t('pei.alumni.tabs.fse'), count: fseCount.value, to: tabLink() },
  { key: 'student_entrepreneur', label: t('pei.alumni.tabs.see'), count: seeItems.value.length, to: tabLink('student_entrepreneur') },
])

const stats = computed(() =>
  [1, 2, 3]
    .map((n, index) => {
      const value = text(`alumni.stats.${n}.value`)
      if (value) return { value, label: text(`alumni.stats.${n}.label`) }
      return preview.value ? peiAlumniPreview.stats[index] ?? null : null
    })
    .filter((stat): stat is { value: string, label: string } => !!stat),
)

// ---------------------------------------------------------------------------
// Hero : titre éditorial, mosaïque = portraits publiés, image éditoriale, puis exemples (aperçu)
// ---------------------------------------------------------------------------
const heroTitle = computed(() => text('alumni.hero.title') || (preview.value ? peiAlumniPreview.heroTitle : '') || page.hero.value.title)
const heroSubtitle = computed(() => page.hero.value.subtitle || (preview.value ? peiAlumniPreview.heroSubtitle : undefined))

const heroPortraits = computed(() => {
  const urls: string[] = []
  const published = sortLaureatesFeaturedFirst(groups.value.flatMap(g => g.laureates))
  for (const url of [...published.map(l => l.photo_url), page.hero.value.images[0]]) {
    if (url && !urls.includes(url) && urls.length < 3) urls.push(url)
  }
  for (let slot = PHOTO_SLOTS.hero; preview.value && urls.length < 3 && slot < PHOTO_SLOTS.hero + 3; slot++) {
    const url = image(slot)
    if (url) urls.push(url)
  }
  return urls
})

// ---------------------------------------------------------------------------
// Encart « Devenir mentor » (e-mail du pôle)
// ---------------------------------------------------------------------------
const mentorTitle = computed(() => text('see.mentor.title') || (preview.value ? peiAlumniPreview.mentor.title : ''))
const mentorDescription = computed(() => text('see.mentor.description') || (preview.value ? peiAlumniPreview.mentor.description : ''))
const mentorButton = computed(() => text('see.mentor.button') || t('pei.alumni.mentorButton'))
const mentorHref = computed(() => {
  const email = text('contact.email')
  if (email) return `mailto:${email}?subject=${encodeURIComponent(t('pei.alumni.mentorSubject'))}`
  return preview.value ? '#' : ''
})
const showMentor = computed(() => !!mentorTitle.value && !!mentorHref.value)

// SEO — après useRoute() et les useAsyncData (gotcha TDZ unhead)
page.applySeo()
useSeoMeta({ robots: () => (preview.value ? 'noindex, nofollow' : undefined) })
</script>

<template>
  <div>
    <EntrepreneurshipPreviewBanner />

    <EntrepreneurshipAlumniHero
      :title="heroTitle"
      :subtitle="heroSubtitle"
      :breadcrumb="page.breadcrumb.value"
      :portraits="heroPortraits"
      :below-preview-banner="preview"
    />

    <EntrepreneurshipSubNav :below-preview-banner="preview" />

    <div class="bg-white dark:bg-gray-900">
      <!-- Onglets + chiffres -->
      <section class="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-12 sm:gap-14 sm:px-6 sm:pt-16 lg:px-8">
        <!-- Cible des onglets : le défilement générique (décalage d'en-tête seul) les laisse sous la sous-navigation -->
        <span
          id="portraits"
          aria-hidden="true"
          class="pointer-events-none absolute inset-x-0"
          :class="preview ? '-top-[4.75rem] sm:-top-[3.75rem]' : '-top-8 sm:-top-4'"
        />
        <EntrepreneurshipPillTabs
          variant="segmented"
          :aria-label="t('pei.alumni.tabsLabel')"
          :active-key="currentType"
          :tabs="tabs"
        />
        <EntrepreneurshipStatsPanel v-if="stats.length" variant="cards" :stats="stats" :title="t('pei.alumni.statsLabel')" />
      </section>

      <!-- ===================== LAURÉATS FSE ===================== -->
      <template v-if="currentType === 'fse_laureate'">
        <template v-if="fseSections.length">
          <section aria-labelledby="pei-alumni-fse-title" class="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
            <h2 id="pei-alumni-fse-title" class="max-w-4xl text-[2.25rem] font-black leading-[1.05] tracking-[-0.03em] text-brand-blue-900 dark:text-white sm:text-[3rem]">
              {{ fseTitle }}
            </h2>
            <EntrepreneurshipCohortTimeline :items="timelineItems" :aria-label="t('pei.alumni.timeline.label')" />
          </section>

          <div v-if="featured" class="mx-auto max-w-7xl px-4 pb-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
            <EntrepreneurshipLaureateSpotlight
              :laureate="featured.laureate"
              :badge="t('pei.alumni.spotlight.badge', { cohort: featured.section.short })"
              :sample="featured.sample"
            />
          </div>

          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <EntrepreneurshipCohortSection
              v-for="section in fseSections"
              :key="section.cohort.id"
              :cohort="section.cohort"
              :laureates="section.laureates"
              :anchor-id="section.anchor"
              :tone="section.tone"
              :focus-fallback="section.focusFallback"
              :note="section.note"
              :sample="section.sample"
              :sample-cohort="section.sampleCohort"
              :below-preview-banner="preview"
            />
          </div>
        </template>

        <div v-else class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EntrepreneurshipEmptyState
            icon="fa-solid fa-award"
            :title="t('pei.alumni.empty.title')"
            :description="t('pei.alumni.empty.description')"
            to="/entrepreneuriat"
            :link-label="t('pei.common.backHome')"
          />
        </div>
      </template>

      <!-- ===================== ÉTUDIANTS-ENTREPRENEURS ===================== -->
      <section
        v-else
        aria-labelledby="pei-alumni-see-title"
        class="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-8 pt-16 sm:px-6 sm:pt-24 lg:px-8"
      >
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <h2 id="pei-alumni-see-title" class="max-w-4xl text-[2.25rem] font-black leading-[1.05] tracking-[-0.03em] text-brand-blue-900 dark:text-white sm:text-[3rem]">
            {{ seeTitle }}
          </h2>
          <NuxtLink
            :to="previewPath(localePath(STATUS_PAGE))"
            class="inline-flex min-h-[3rem] shrink-0 items-center gap-2 self-start rounded-xl border-2 border-violet-200 px-5 text-[0.9375rem] font-bold text-violet-800 transition-colors hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/40 lg:self-auto"
          >
            {{ t('pei.alumni.see.statusLink') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </div>

        <div v-if="seeItems.length" class="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <EntrepreneurshipLaureateCard
            v-for="item in seeItems"
            :key="item.laureate.id"
            :laureate="item.laureate"
            :track="item.track"
            :sample="item.sample"
            heading-tag="h3"
            compact
          />
        </div>
        <EntrepreneurshipEmptyState
          v-else
          icon="fa-solid fa-user-graduate"
          :title="t('pei.alumni.empty.title')"
          :description="t('pei.alumni.empty.description')"
          to="/entrepreneuriat"
          :link-label="t('pei.common.backHome')"
        />
      </section>

      <!-- ===================== DEVENIR MENTOR ===================== -->
      <section v-if="showMentor" class="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
        <EntrepreneurshipCtaBanner
          variant="rose"
          :title="mentorTitle"
          :description="mentorDescription"
          :button-label="mentorButton"
          :href="mentorHref"
        />
      </section>
      <div v-else class="pb-16 sm:pb-24" />
    </div>
  </div>
</template>
