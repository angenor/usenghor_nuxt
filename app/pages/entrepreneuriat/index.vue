<script setup lang="ts">
/**
 * Accueil du mini-site « Entreprendre à Senghor » (Pôle Entrepreneuriat et Innovation).
 * Spec : specs/023-pei-public-home-activities (US1, US4).
 */
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { public: { siteUrl } } = useRuntimeConfig()

const { loadContent, getRawContent } = useEditorialContent('entrepreneurship')
const { getMediaUrl } = useMediaApi()
const { listPrograms, listPartners } = usePublicEntrepreneurshipApi()
const { getAllPublishedNews } = usePublicNewsApi()
const { buildPeiOrganization, buildWebPage, buildBreadcrumbList } = usePeiJsonLd()

// Contenu éditorial d'abord (identifiant du service DDE)
await useAsyncData('editorial-entrepreneurship', () => loadContent().then(() => true))

/** Valeur éditoriale non vide (sans repli i18n : jamais de clé brute). */
const text = (key: string): string => getRawContent(`entrepreneurship.${key}`)?.trim() || ''

const ddeServiceId = computed(() => {
  const id = text('dde_service_id')
  return isUuid(id) ? id : null
})

// Fil d'Ariane partagé du mini-site (spec 026)
const { breadcrumb, ready: breadcrumbReady } = usePeiBreadcrumb(null, ddeServiceId)

// Sources indépendantes : une erreur masque la section concernée (FR-023)
const [{ data: programsData }, { data: partnersData }, { data: newsData }] = await Promise.all([
  useAsyncData('pei-home-programs', () => listPrograms().catch(() => [])),
  useAsyncData('pei-home-partners', () => listPartners().catch(() => [])),
  useAsyncData('pei-home-news', () => (ddeServiceId.value
    ? getAllPublishedNews({ service_id: ddeServiceId.value, limit: 3 }).catch(() => [])
    : Promise.resolve([]))),
  breadcrumbReady,
])

const programs = computed(() => [...(programsData.value ?? [])].sort((a, b) => a.display_order - b.display_order))
const partners = computed(() => partnersData.value ?? [])
const news = computed(() => (newsData.value ?? []).slice(0, 3))
const partnersVisible = computed(() => partners.value.some(f => f.partners.length > 0))

// Hero
const slides = computed(() =>
  [1, 2, 3]
    .map(n => getMediaUrl(text(`hero.slide${n}.image`) || null, 'medium'))
    .filter((url): url is string => !!url),
)
const heroImages = computed(() => (slides.value.length ? slides.value : ['/images/bg/backgroud_senghor2.jpg']))
const heroTitle = computed(() => text('hero.slogan') || text('hero.title') || t('pei.seo.homeTitle'))
const heroActions = computed(() => {
  const actions: { label: string, to: string, variant: 'red' | 'ghost', icon?: string }[] = []
  if (text('hero.cta1.text')) actions.push({ label: text('hero.cta1.text'), to: '/entrepreneuriat/statut-etudiant-entrepreneur', variant: 'red', icon: 'fa-solid fa-rocket' })
  if (text('hero.cta2.text') && programs.value.length) actions.push({ label: text('hero.cta2.text'), to: '#parcours', variant: 'ghost' })
  return actions
})

// Présentation et chiffres clés
const stats = computed(() =>
  [1, 2, 3, 4]
    .map(n => ({ value: text(`stats.${n}.value`), label: text(`stats.${n}.label`) }))
    .filter(s => s.value),
)

// Parcours
const chips = computed(() => text('activities.ecosystem.items').split('\n').map(s => s.trim()).filter(Boolean))

// Citation
const quoteImage = computed(() => getMediaUrl(text('quote.image') || null, 'low'))
const impactImage = computed(() => getMediaUrl(text('impact.image') || null, 'medium'))

// SEO — après useRoute() et les useAsyncData (gotcha TDZ unhead)
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }
const seoTitle = computed(() => text('hero.title') || t('pei.seo.homeTitle'))
const seoDescription = computed(() => text('hero.subtitle') || t('pei.seo.homeDescription'))

useSeoMeta({
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
    <PageHero
      :title="heroTitle"
      :subtitle="text('hero.subtitle') || undefined"
      :badge="text('hero.badge') || undefined"
      :images="heroImages"
      :actions="heroActions"
      :breadcrumb="breadcrumb"
    />

    <EntrepreneurshipSubNav />

    <!-- Présentation + chiffres clés -->
    <section
      v-if="text('presentation.title') || text('presentation.content') || stats.length"
      id="presentation"
      class="scroll-mt-40 py-16 lg:py-24 bg-white dark:bg-gray-900"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:gap-20 lg:grid-cols-2 items-center">
        <div class="min-w-0">
          <p v-if="text('presentation.badge')" class="text-sm font-semibold uppercase tracking-widest text-brand-red-600 dark:text-brand-red-400 mb-3">
            {{ text('presentation.badge') }}
          </p>
          <h2 v-if="text('presentation.title')" class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            <span class="relative inline-block">
              {{ text('presentation.title') }}
              <span class="absolute -bottom-2 start-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full" />
            </span>
          </h2>
          <RichTextRenderer v-if="text('presentation.content')" :html="text('presentation.content')" />
          <NuxtLink
            v-if="ddeLink && text('presentation.link')"
            :to="localePath(ddeLink)"
            class="mt-6 inline-flex items-center gap-2 font-semibold text-brand-blue-700 dark:text-brand-blue-300 hover:underline"
          >
            {{ text('presentation.link') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </div>
        <EntrepreneurshipStatsPanel
          v-if="stats.length"
          :title="text('stats.title')"
          :stats="stats"
        />
      </div>
    </section>

    <!-- Parcours -->
    <section
      v-if="programs.length"
      id="parcours"
      class="scroll-mt-40 py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center mb-12">
          <p v-if="text('activities.badge')" class="text-sm font-semibold uppercase tracking-widest text-brand-red-600 dark:text-brand-red-400 mb-3">
            {{ text('activities.badge') }}
          </p>
          <h2 v-if="text('activities.title')" class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {{ text('activities.title') }}
          </h2>
          <p v-if="text('activities.subtitle')" class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            {{ text('activities.subtitle') }}
          </p>
        </div>

        <ol class="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <li v-for="(program, index) in programs" :key="program.id" class="min-w-0">
            <EntrepreneurshipProgramCard
              :program="program"
              :index="index + 1"
              :to="`/entrepreneuriat/activites#${PEI_PHASE_ANCHORS[program.phase]}`"
            />
          </li>
        </ol>

        <EntrepreneurshipEcosystemChips
          class="mt-14"
          :title="text('activities.ecosystem.title')"
          :items="chips"
        />

        <div v-if="text('activities.link')" class="mt-12 text-center">
          <NuxtLink
            :to="localePath('/entrepreneuriat/activites')"
            class="inline-flex items-center gap-2 rounded-full border-2 border-brand-blue-200 dark:border-brand-blue-700 bg-white dark:bg-gray-900 px-8 py-4 font-semibold text-brand-blue-700 dark:text-brand-blue-300 hover:border-brand-blue-400 transition-colors"
          >
            {{ text('activities.link') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Citation et impact -->
    <EntrepreneurshipQuoteBlock
      v-if="text('quote.text')"
      :quote="text('quote.text')"
      :author="text('quote.author')"
      :role="text('quote.role')"
      :author-image="quoteImage"
      :impact-text="text('impact.text')"
      :impact-image="impactImage"
    />

    <!-- Actualités du pôle -->
    <section v-if="news.length" class="py-16 lg:py-24 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p class="text-sm font-semibold uppercase tracking-widest text-brand-red-600 dark:text-brand-red-400 mb-3">
              {{ t('pei.home.newsBadge') }}
            </p>
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {{ t('pei.home.ourNews') }}
            </h2>
          </div>
          <NuxtLink
            :to="localePath('/entrepreneuriat/actualites')"
            class="inline-flex items-center gap-1 font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300"
          >
            {{ t('pei.home.allNews') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </div>
        <div class="grid gap-8 md:grid-cols-3">
          <ActualitesNewsCard
            v-for="item in news"
            :key="item.id"
            :item="item"
            :show-associations="false"
          />
        </div>
      </div>
    </section>

    <!-- Partenaires -->
    <section v-if="partnersVisible" class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <p class="text-sm font-semibold uppercase tracking-widest text-brand-red-600 dark:text-brand-red-400 mb-3">
            {{ t('pei.home.partnersBadge') }}
          </p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {{ t('pei.home.ourPartners') }}
          </h2>
        </div>
        <EntrepreneurshipPartnerFamilies :families="partners" />
        <div class="mt-10 text-center">
          <NuxtLink
            :to="localePath('/entrepreneuriat/partenaires')"
            class="inline-flex items-center gap-2 font-semibold text-brand-blue-700 dark:text-brand-blue-300 hover:underline"
          >
            {{ t('pei.home.allPartners') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Appel à l'action -->
    <section v-if="text('cta.title') && text('cta.button')" class="py-16 lg:py-24 bg-white dark:bg-gray-900">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <EntrepreneurshipCtaBanner
          :title="text('cta.title')"
          :description="text('cta.description')"
          :button-label="text('cta.button')"
          to="/entrepreneuriat/statut-etudiant-entrepreneur"
          :email="text('contact.email')"
        />
      </div>
    </section>
  </div>
</template>
