<script setup lang="ts">
/**
 * Accueil du mini-site « Entreprendre à Senghor » (Pôle Entrepreneuriat et Innovation).
 * Specs : specs/023-pei-public-home-activities (US1, US4) ; refonte selon la maquette validée
 * (hero « slogan allumé », manifeste, bandeau de chiffres, parcours en cartes, citation + impact,
 * actualité à la une, partenaires par famille, bandeau final).
 */
import type { PeiEditorialStat } from '~/utils/pei-presentation'
import type { PaginatedResponse } from '~/types/api'
import type { PartnerPublicRaw } from '~/composables/usePublicPartnersApi'
import { fillEmptyPartnerFamilies, peiHomePreview, pickPreviewCoverIds } from '@bank/mock-data/pei-home-preview'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { public: { siteUrl } } = useRuntimeConfig()

const { loadContent, getRawContent } = useEditorialContent('entrepreneurship')
const { getMediaUrl } = useMediaApi()
const { getServiceLink } = usePublicOrganizationApi()
const { listPrograms, listPartners } = usePublicEntrepreneurshipApi()
const { getAllPublishedNews, listPublishedNews } = usePublicNewsApi()
const { listPublishedEvents } = usePublicEventsApi()
const apiBase = useApiBase()
// Mode aperçu (`?apercu=1` uniquement) : données d'exemple pour la validation visuelle
const { preview, previewPath } = usePeiPreview()
const { buildPeiOrganization, buildWebPage, buildBreadcrumbList } = usePeiJsonLd()

// Contenu éditorial d'abord (identifiant du service DDE)
await useAsyncData('editorial-entrepreneurship', () => loadContent().then(() => true))

/** Valeur éditoriale non vide (sans repli i18n : jamais de clé brute). */
const text = (key: string): string => getRawContent(`entrepreneurship.${key}`)?.trim() || ''

const keyServiceId = computed(() => {
  const id = text('dde_service_id')
  return isUuid(id) ? id : null
})

// Fil d'Ariane partagé du mini-site (spec 026) et service DDE unique
// (parent du pôle de page dédiée `/entrepreneuriat`, sinon clé `entrepreneurship.dde_service_id`)
const { breadcrumb, dde, ddeId, ready: breadcrumbReady } = usePeiBreadcrumb(null, keyServiceId)

// Sources indépendantes : une erreur masque la section concernée (FR-023)
const [{ data: programsData }, { data: partnersData }, { data: newsData }, { data: previewData }] = await Promise.all([
  useAsyncData('pei-home-programs', () => listPrograms().catch(() => [])),
  useAsyncData('pei-home-partners', () => listPartners().catch(() => [])),
  useAsyncData('pei-home-news', async () => {
    await breadcrumbReady
    return ddeId.value ? getAllPublishedNews({ service_id: ddeId.value, limit: 3 }).catch(() => []) : []
  }),
  // Aperçu : contenus publics réels servant d'exemples (rien n'est chargé hors aperçu)
  useAsyncData('pei-home-preview', async () => {
    if (!preview.value) return null
    const [latestNews, events, catalog] = await Promise.all([
      listPublishedNews({ limit: peiHomePreview.newsFetchLimit }).then(r => r.items).catch(() => []),
      listPublishedEvents({ limit: peiHomePreview.eventsFetchLimit }).then(r => r.items).catch(() => []),
      // Lecture directe de l'API publique des partenaires (sans l'enrichissement pays de
      // `usePublicPartnersApi`, dont l'appel relatif échoue au rendu serveur)
      $fetch<PaginatedResponse<PartnerPublicRaw>>(`${apiBase}/api/public/partners`, { query: { limit: '500' } })
        .then(r => r.items)
        .catch(() => []),
    ])
    return {
      coverIds: pickPreviewCoverIds([...latestNews, ...events]),
      news: latestNews.slice(0, peiHomePreview.newsFallbackCount),
      partners: catalog.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        description_en: p.description_en,
        description_ar: p.description_ar,
        website: p.website,
        logo_url: getMediaUrl(p.logo_external_id, 'low'),
        type: p.type,
      })),
    }
  }, { watch: [preview] }),
  breadcrumbReady,
])

/** Données d'exemple actives (null hors aperçu) : elles ne remplissent que ce qui est vide. */
const sample = computed(() => (preview.value ? previewData.value : null))
const sampleImages = computed(() => (sample.value?.coverIds ?? []).map(id => getMediaUrl(id, 'medium')).filter((url): url is string => !!url))

const programs = computed(() => [...(programsData.value ?? [])].sort((a, b) => a.display_order - b.display_order))
const partners = computed(() => {
  const real = partnersData.value ?? []
  return sample.value ? fillEmptyPartnerFamilies(real, sample.value.partners) : real
})
const news = computed(() => {
  const real = (newsData.value ?? []).slice(0, 3)
  return real.length || !sample.value ? real : sample.value.news
})
const partnersVisible = computed(() => partners.value.some(f => f.partners.length > 0))

/** Lien « Historique, vision et missions du pôle » : fiche (ou page dédiée) du service DDE. */
const ddeLink = computed(() => (dde.value ? getServiceLink(dde.value) : null))

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
const realSlides = computed(() =>
  [1, 2, 3]
    .map(n => getMediaUrl(text(`hero.slide${n}.image`) || null, 'medium'))
    .filter((url): url is string => !!url),
)
/** Aperçu : diapositives manquantes complétées par des couvertures d'actualités (jusqu'à 3). */
const slides = computed(() => {
  if (!sample.value || realSlides.value.length >= peiHomePreview.heroImageCount) return realSlides.value
  const extra = sampleImages.value.filter(url => !realSlides.value.includes(url))
  return [...realSlides.value, ...extra].slice(0, peiHomePreview.heroImageCount)
})
const heroTitle = computed(() => text('hero.title') || t('pei.seo.homeTitle'))
/** « INNOVER. AGIR. TRANSFORMER. » → trois mots (un par diapositive). */
const sloganWords = computed(() =>
  (text('hero.slogan').match(/[^.]+\.?/g) ?? [])
    .map(word => word.trim())
    .filter(word => word && word !== '.'),
)
const heroActions = computed(() => {
  const actions: { label: string, to: string, variant: 'red' | 'ghost' }[] = []
  if (text('hero.cta1.text')) actions.push({ label: text('hero.cta1.text'), to: '/entrepreneuriat/statut-etudiant-entrepreneur', variant: 'red' })
  if (text('hero.cta2.text') && programs.value.length) actions.push({ label: text('hero.cta2.text'), to: '#parcours', variant: 'ghost' })
  return actions
})

// ---------------------------------------------------------------------------
// Manifeste : fin de la phrase d'accroche soulignée (seconde moitié des mots)
// ---------------------------------------------------------------------------
/** Espace insécable avant « ? ! : ; » et à l'intérieur des guillemets (typographie française). */
const typo = (value: string): string => value.replace(/ ([?!:;»])/g, '\u00A0$1').replace(/« /g, '«\u00A0')

const manifesto = computed(() => {
  const words = typo(text('presentation.title')).split(/ +/).filter(Boolean)
  const cut = Math.floor(words.length / 2)
  return { head: words.slice(0, cut).join(' '), tail: words.slice(cut).join(' ') }
})

// ---------------------------------------------------------------------------
// Chiffres clés : « 500+ » → nombre géant + signe en rouge clair
// ---------------------------------------------------------------------------
/** Chiffres éditoriaux `<prefix>.1..count.{value,label}` non vides, signe (« + », « % ») séparé du nombre. */
function editorialStats(prefix: string, count: number): PeiEditorialStat[] {
  return Array.from({ length: count }, (_, i) => i + 1)
    .map((n) => {
      const value = text(`${prefix}.${n}.value`)
      const match = value.match(/^(\D*?)(\d[\d\s.,]*?)(\D*)$/)
      return {
        value,
        label: text(`${prefix}.${n}.label`),
        prefix: match?.[1]?.trim() ?? '',
        number: match?.[2]?.trim() ?? value,
        suffix: match?.[3]?.trim() ?? '',
        numeric: !!match,
      }
    })
    .filter(s => s.value)
}

const stats = computed(() => editorialStats('stats', 4))

// ---------------------------------------------------------------------------
// Parcours
// ---------------------------------------------------------------------------
const chips = computed(() => text('activities.ecosystem.items').split('\n').map(s => s.trim()).filter(Boolean))
const XL_COLUMNS = ['', 'xl:grid-cols-1', 'xl:grid-cols-2', 'xl:grid-cols-3', 'xl:grid-cols-4', 'xl:grid-cols-5', 'xl:grid-cols-6']
const journeyColumns = computed(() => XL_COLUMNS[Math.min(programs.value.length, 6)] ?? 'xl:grid-cols-5')

// Citation et impact (trois chiffres d'impact facultatifs au-dessus du texte)
const quoteImage = computed(() => getMediaUrl(text('quote.image') || null, 'low'))
/** Aperçu : photo d'impact absente → couverture suivante (distincte du hero si possible). */
const impactImage = computed(() => {
  const real = getMediaUrl(text('impact.image') || null, 'medium')
  if (real || !sample.value) return real
  const unused = sampleImages.value.filter(url => !slides.value.includes(url))
  return unused[0] ?? sampleImages.value.at(-1) ?? null
})
const impactStats = computed(() => editorialStats('impact.stats', 3))

// Partenaires : description éditoriale de chaque famille (accueil et page « Nos partenaires »)
const familyDescriptions = computed(() => peiFamilyDescriptions(text))

// ---------------------------------------------------------------------------
// SEO — après useRoute() et les useAsyncData (gotcha TDZ unhead)
// ---------------------------------------------------------------------------
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }
const seoTitle = computed(() => text('hero.title') || t('pei.seo.homeTitle'))
const seoDescription = computed(() => text('hero.subtitle') || t('pei.seo.homeDescription'))

useSeoMeta({
  robots: () => (preview.value ? 'noindex, nofollow' : undefined),
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => siteUrl + route.fullPath,
  ogImage: () => (slides.value[0] ? siteUrl + slides.value[0] : undefined),
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})

useHead(() => ({
  script: [
    { key: 'jsonld-pei-organization', type: 'application/ld+json', innerHTML: JSON.stringify(buildPeiOrganization({ name: seoTitle.value, email: text('contact.email') })) },
    { key: 'jsonld-pei-webpage', type: 'application/ld+json', innerHTML: JSON.stringify(buildWebPage({ path: route.path, name: seoTitle.value, description: seoDescription.value })) },
    { key: 'jsonld-pei-breadcrumb', type: 'application/ld+json', innerHTML: JSON.stringify(buildBreadcrumbList(breadcrumb.value)) },
  ],
}))
</script>

<template>
  <div>
    <!-- Bandeau du mode aperçu (`?apercu=1`), fixé sous l'en-tête du site -->
    <div
      v-if="preview"
      role="note"
      class="fixed inset-x-0 top-20 z-40 flex h-11 items-center border-b border-amber-300 bg-amber-100 text-amber-950 shadow-sm dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
    >
      <div class="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4 shrink-0" aria-hidden="true" />
        <p class="line-clamp-2 min-w-0 flex-1 text-xs leading-tight sm:text-[13px]">
          <strong class="font-extrabold">{{ t('pei.home.preview.label') }}</strong>
          — {{ t('pei.home.preview.message') }}
        </p>
        <a
          :href="localePath('/entrepreneuriat')"
          class="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-md px-2 text-xs font-bold hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-900 dark:hover:bg-amber-900 dark:focus-visible:outline-amber-100 sm:text-[13px]"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4 sm:hidden" aria-hidden="true" />
          <span class="sr-only underline underline-offset-2 sm:not-sr-only">{{ t('pei.home.preview.exit') }}</span>
        </a>
      </div>
    </div>

    <EntrepreneurshipHomeHero
      :title="heroTitle"
      :words="sloganWords"
      :images="slides"
      :subtitle="text('hero.subtitle') || undefined"
      :breadcrumb="breadcrumb"
      :actions="heroActions"
    />

    <EntrepreneurshipSubNav :below-preview-banner="preview" />

    <!-- Manifeste -->
    <section
      v-if="text('presentation.title') || text('presentation.content')"
      id="presentation"
      :class="preview ? 'scroll-mt-[200px]' : 'scroll-mt-40'"
      class="bg-white py-20 dark:bg-gray-900 lg:pb-[104px] lg:pt-[120px]"
    >
      <div class="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:gap-14 lg:px-8">
        <p v-if="text('presentation.badge')" class="text-[13px] font-bold uppercase tracking-[0.12em] text-brand-red-700 dark:text-brand-red-300">
          {{ text('presentation.badge') }}
        </p>
        <h2
          v-if="text('presentation.title')"
          class="max-w-[1080px] text-[2rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-brand-blue-900 dark:text-white sm:text-5xl lg:text-[54px]"
        >
          <template v-if="manifesto.head">{{ `${manifesto.head} ` }}</template>
          <span class="text-brand-blue-500 underline decoration-brand-red-300 decoration-[5px] underline-offset-[8px] [text-decoration-skip-ink:none] dark:text-brand-blue-300 sm:decoration-[6px] sm:underline-offset-[10px]">{{ manifesto.tail }}</span>
        </h2>
        <div v-if="text('presentation.content') || (ddeLink && text('presentation.link'))" class="gap-16 lg:columns-2">
          <RichTextRenderer
            v-if="text('presentation.content')"
            :html="text('presentation.content')"
            class="text-[17px] leading-[1.8] text-gray-700 dark:text-gray-300 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-[1.8]"
          />
          <NuxtLink
            v-if="ddeLink && text('presentation.link')"
            :to="previewPath(localePath(ddeLink))"
            class="mt-4 inline-flex min-h-[44px] break-inside-avoid items-center gap-2.5 text-base font-bold text-brand-blue-700 hover:underline dark:text-brand-blue-300"
          >
            {{ text('presentation.link') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Chiffres clés -->
    <section v-if="stats.length" class="bg-brand-blue-900 py-14 text-white dark:bg-brand-blue-950 lg:py-[72px]">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 v-if="text('stats.title')" class="sr-only">
          {{ text('stats.title') }}
        </h2>
        <dl class="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="flex min-w-0 flex-col-reverse gap-2.5 pe-4 sm:pe-8"
            :class="[
              index % 2 === 1 ? 'border-s border-white/15 ps-4 sm:ps-8' : 'ps-0',
              index === 0 ? 'lg:ps-0' : 'lg:border-s lg:border-white/15 lg:ps-8',
            ]"
          >
            <dt class="text-[15px] font-semibold text-brand-blue-200 sm:text-[17px]">
              {{ stat.label }}
            </dt>
            <dd dir="ltr" class="flex items-start font-black leading-[.9] tracking-[-0.05em] tabular-nums rtl:justify-end">
              <template v-if="stat.numeric">
                <span v-if="stat.prefix" class="text-[clamp(1.75rem,4vw,3.5rem)] text-brand-red-300">{{ stat.prefix }}</span>
                <span class="text-[clamp(3.5rem,9vw,8rem)]">{{ stat.number }}</span>
                <span v-if="stat.suffix" class="text-[clamp(1.75rem,4vw,3.5rem)] text-brand-red-300">{{ stat.suffix }}</span>
              </template>
              <span v-else class="break-words text-4xl sm:text-5xl">{{ stat.value }}</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Parcours -->
    <section
      v-if="programs.length"
      id="parcours"
      :class="preview ? 'scroll-mt-[200px]' : 'scroll-mt-40'"
      class="bg-[#faf8f4] py-20 dark:bg-gray-950 lg:py-28"
    >
      <div class="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:gap-12 lg:px-8">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div class="flex max-w-3xl flex-col gap-4">
            <p v-if="text('activities.badge')" class="text-[13px] font-bold uppercase tracking-[0.12em] text-brand-red-700 dark:text-brand-red-300">
              {{ text('activities.badge') }}
            </p>
            <h2 v-if="text('activities.title')" class="text-4xl font-black leading-[1.05] tracking-[-0.03em] text-brand-blue-900 dark:text-white lg:text-[52px]">
              {{ text('activities.title') }}
            </h2>
            <p v-if="text('activities.subtitle')" class="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              {{ text('activities.subtitle') }}
            </p>
          </div>
          <NuxtLink
            v-if="text('activities.link')"
            :to="previewPath(localePath('/entrepreneuriat/activites'))"
            class="inline-flex min-h-[52px] shrink-0 items-center gap-2.5 self-start rounded-xl bg-brand-blue-900 px-6 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-800 dark:bg-white dark:text-brand-blue-900 dark:hover:bg-brand-blue-100 lg:self-auto"
          >
            {{ text('activities.link') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </div>

        <!-- Barre segmentée (couleur de la phase de chaque dispositif, alignée sur les cartes en grand écran) -->
        <div class="hidden gap-2 xl:grid" :class="journeyColumns" aria-hidden="true">
          <span
            v-for="program in programs"
            :key="program.id"
            class="h-4 first:rounded-s-lg last:rounded-e-lg"
            :style="{ backgroundColor: peiStepTone(program.phase).fill }"
          />
        </div>

        <ol class="grid gap-5 md:grid-cols-2 lg:grid-cols-3" :class="journeyColumns">
          <li v-for="(program, index) in programs" :key="program.id" class="min-w-0">
            <EntrepreneurshipProgramCard
              :program="program"
              :index="index + 1"
              :to="`/entrepreneuriat/activites#${PEI_PHASE_ANCHORS[program.phase]}`"
              class="border-t-4 border-[color:var(--pei-fill)] xl:border-t-0"
            />
          </li>
        </ol>

        <EntrepreneurshipEcosystemChips
          class="mt-4"
          :title="text('activities.ecosystem.title')"
          :items="chips"
        />
      </div>
    </section>

    <!-- Citation et impact -->
    <EntrepreneurshipQuoteBlock
      v-if="text('quote.text')"
      :quote="text('quote.text')"
      :author="text('quote.author')"
      :role="text('quote.role')"
      :author-image="quoteImage"
      :impact-title="t('pei.home.impactBadge')"
      :impact-text="text('impact.text')"
      :impact-stats="impactStats"
      :impact-image="impactImage"
    />

    <!-- Actualités du pôle : une à la une + deux secondaires -->
    <section v-if="news.length" class="bg-[#f5f7ff] py-20 dark:bg-gray-950 lg:py-28">
      <div class="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div class="flex flex-col gap-4">
            <p class="text-[13px] font-bold uppercase tracking-[0.12em] text-brand-red-700 dark:text-brand-red-300">
              {{ t('pei.home.newsBadge') }}
            </p>
            <h2 class="text-4xl font-black leading-[1.05] tracking-[-0.03em] text-brand-blue-900 dark:text-white lg:text-[52px]">
              {{ t('pei.home.ourNews') }}
            </h2>
          </div>
          <NuxtLink
            :to="previewPath(localePath('/entrepreneuriat/actualites'))"
            class="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-bold text-brand-blue-500 hover:text-brand-blue-700 dark:text-brand-blue-300 dark:hover:text-brand-blue-200"
          >
            {{ t('pei.home.allNews') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </div>
        <div class="grid gap-7" :class="news.length > 1 ? 'lg:grid-cols-[1.4fr_1fr]' : ''">
          <ActualitesNewsCard
            :item="news[0]!"
            variant="featured"
            image-variant="medium"
            :show-associations="false"
          />
          <div v-if="news.length > 1" class="flex flex-col gap-7">
            <ActualitesNewsCard
              v-for="item in news.slice(1)"
              :key="item.id"
              :item="item"
              variant="compact"
              class="flex-1"
              :show-associations="false"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Partenaires par famille -->
    <section v-if="partnersVisible" class="bg-white py-20 dark:bg-gray-900 lg:py-28">
      <div class="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:gap-12 lg:px-8">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div class="flex flex-col gap-4">
            <p class="text-[13px] font-bold uppercase tracking-[0.12em] text-brand-red-700 dark:text-brand-red-300">
              {{ t('pei.home.partnersBadge') }}
            </p>
            <h2 class="text-4xl font-black leading-[1.05] tracking-[-0.03em] text-brand-blue-900 dark:text-white lg:text-[52px]">
              {{ t('pei.home.ourPartners') }}
            </h2>
          </div>
          <NuxtLink
            :to="previewPath(localePath('/entrepreneuriat/partenaires'))"
            class="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-bold text-brand-blue-500 hover:text-brand-blue-700 dark:text-brand-blue-300 dark:hover:text-brand-blue-200"
          >
            {{ t('pei.home.allPartners') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </div>
        <EntrepreneurshipPartnerFamilies :families="partners" variant="columns" :descriptions="familyDescriptions" />
      </div>
    </section>

    <!-- Appel à l'action final -->
    <section v-if="text('cta.title') && text('cta.button')" class="bg-brand-red-700 py-20 text-white dark:bg-brand-red-900 lg:py-[104px]">
      <div class="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-8">
        <h2 class="text-4xl font-black leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-[60px]">
          {{ typo(text('cta.title')) }}
        </h2>
        <div class="flex flex-col gap-5">
          <p v-if="text('cta.description')" class="text-lg leading-relaxed text-brand-red-100 sm:text-[19px]">
            {{ text('cta.description') }}
          </p>
          <div class="flex flex-wrap gap-3">
            <NuxtLink
              :to="previewPath(localePath('/entrepreneuriat/statut-etudiant-entrepreneur'))"
              class="inline-flex min-h-[56px] items-center gap-2 rounded-xl bg-white px-6 font-extrabold text-brand-red-800 transition-colors hover:bg-brand-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {{ text('cta.button') }}
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </NuxtLink>
            <a
              v-if="text('contact.email')"
              :href="`mailto:${text('contact.email')}`"
              class="inline-flex min-h-[56px] max-w-full items-center gap-2 break-all rounded-xl border border-white/50 px-5 text-[15px] font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <font-awesome-icon icon="fa-regular fa-envelope" class="h-4 w-4 shrink-0" aria-hidden="true" />
              {{ text('contact.email') }}
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
