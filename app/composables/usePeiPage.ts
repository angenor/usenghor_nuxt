/**
 * Cadre commun des rubriques du mini-site PEI (alumni, partenaires, ressources, actualités,
 * statut étudiant-entrepreneur) : copie éditoriale, service DDE, hero, fil d'Ariane, SEO et JSON-LD.
 * Specs : specs/024-pei-public-alumni-resources-news (research R1, contracts/frontend.md),
 * specs/025-pei-see-status-page (research R1 : rubrique `see`, `applySeo({ type: 'WebPage' })`).
 *
 * Usage : `const page = await usePeiPage({ heroPrefix: 'alumni', navKey: 'alumni' })` en tête de page,
 * puis les useAsyncData de la page, puis `page.applySeo()` en dernier
 * (gotcha TDZ unhead : useSeoMeta après useRoute() et les useAsyncData).
 */

import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { ServicePublic, ServicePublicWithDetails } from '~/composables/usePublicOrganizationApi'
import type { PeiBreadcrumbItem } from '~/composables/usePeiJsonLd'

type PeiRubric = 'alumni' | 'partners' | 'resources' | 'news' | 'see'

export interface PeiPageOptions {
  /** Préfixe des clés `entrepreneurship.<heroPrefix>.hero.*` */
  heroPrefix: PeiRubric
  /** Clé `pei.nav.<navKey>` (fil d'Ariane) et `pei.seo.<navKey>Title|Description` */
  navKey: PeiRubric
}

export interface PeiPageContext {
  text: (key: string) => string
  ddeServiceId: ComputedRef<string | null>
  ddeService: Ref<ServicePublicWithDetails | null | undefined>
  hero: ComputedRef<{ badge?: string, title: string, subtitle?: string, images: string[] }>
  breadcrumb: ComputedRef<PeiBreadcrumbItem[]>
  applySeo: (options?: { type?: 'WebPage' | 'CollectionPage' }) => void
}

/**
 * Fil d'Ariane unique des sept pages du mini-site (spec 026, FR-023 à FR-025) :
 * Accueil › Nous connaître › Organisation › {DDE} › Pôle (› rubrique).
 * Le niveau DDE est le parent du pôle de page dédiée `/entrepreneuriat`, sinon le service
 * désigné par la clé `entrepreneurship.dde_service_id`, sinon omis.
 */
export function usePeiBreadcrumb(
  current: MaybeRefOrGetter<string | null>,
  ddeServiceId: MaybeRefOrGetter<string | null>,
): {
  breadcrumb: ComputedRef<PeiBreadcrumbItem[]>
  dde: ComputedRef<ServicePublic | null>
  /** Identifiant du service DDE à utiliser pour les contenus (actualités, événements, albums) : DDE résolue, sinon clé éditoriale. */
  ddeId: ComputedRef<string | null>
  ready: Promise<unknown>
} {
  const { t } = useI18n()
  const { listServices, getServiceUrl } = usePublicOrganizationApi()

  const servicesAsync = useAsyncData('pei-org-services', () => listServices().catch(() => [] as ServicePublic[]))

  /** Service DDE résolu (parent du pôle, sinon clé éditoriale), exposé aussi pour les liens de page. */
  const dde = computed<ServicePublic | null>(() => {
    const services = servicesAsync.data.value ?? []
    const pole = services.find(s => s.landing_path === '/entrepreneuriat')
    return (pole?.parent_id && services.find(s => s.id === pole.parent_id))
      || services.find(s => s.id === toValue(ddeServiceId))
      || null
  })

  const ddeId = computed<string | null>(() => dde.value?.id ?? toValue(ddeServiceId) ?? null)

  const breadcrumb = computed<PeiBreadcrumbItem[]>(() => {
    const currentLabel = toValue(current)

    const items: PeiBreadcrumbItem[] = [
      { label: t('nav.home'), to: '/' },
      { label: t('nav.about'), to: '/a-propos' },
      { label: t('about.tabs.organization'), to: '/a-propos/organisation' },
    ]
    if (dde.value) items.push({ label: dde.value.sigle || t('pei.breadcrumb.dde'), to: getServiceUrl(dde.value) })
    items.push({ label: t('pei.breadcrumb.pole'), to: currentLabel ? '/entrepreneuriat' : undefined })
    if (currentLabel) items.push({ label: currentLabel })
    return items
  })

  return { breadcrumb, dde, ddeId, ready: servicesAsync }
}

export function usePeiPage(options: PeiPageOptions): Promise<PeiPageContext> {
  const { heroPrefix, navKey } = options
  const { t, locale } = useI18n()
  const route = useRoute()
  const { public: { siteUrl } } = useRuntimeConfig()

  const { loadContent, getRawContent } = useEditorialContent('entrepreneurship')
  const { getMediaUrl } = useMediaApi()
  const { getServiceById } = usePublicOrganizationApi()
  const { buildPeiOrganization, buildWebPage, buildBreadcrumbList } = usePeiJsonLd()

  // Aucun `await` avant la fin des appels de composables (contexte Nuxt perdu hors <script setup>) :
  // les lectures sont enregistrées tout de suite, le service DDE attend l'éditorial et la liste des services.
  const editorial = useAsyncData('editorial-entrepreneurship', () => loadContent().then(() => true))

  const text = (key: string): string => getRawContent(`entrepreneurship.${key}`)?.trim() || ''

  /** Clé éditoriale `entrepreneurship.dde_service_id` (repli quand le pôle n'a pas de service parent). */
  const keyServiceId = computed(() => {
    const id = text('dde_service_id')
    return isUuid(id) ? id : null
  })

  // Fil d'Ariane partagé et DDE unique du mini-site : parent du pôle `/entrepreneuriat`, sinon la clé
  const { breadcrumb, ddeId: ddeServiceId, ready: breadcrumbReady } = usePeiBreadcrumb(() => t(`pei.nav.${navKey}`), keyServiceId)

  const ddeAsync = useAsyncData(`pei-${heroPrefix}-dde`, async () => {
    await Promise.all([editorial, breadcrumbReady])
    return ddeServiceId.value ? getServiceById(ddeServiceId.value).catch(() => null) : null
  })
  const ddeService = ddeAsync.data

  const heroImage = computed(() => getMediaUrl(text(`${heroPrefix}.hero.image`) || null, 'medium'))

  const hero = computed(() => ({
    badge: text(`${heroPrefix}.hero.badge`) || undefined,
    title: text(`${heroPrefix}.hero.title`) || t(`pei.seo.${navKey}Title`),
    subtitle: text(`${heroPrefix}.hero.subtitle`) || undefined,
    images: heroImage.value ? [heroImage.value] : [],
  }))

  function applySeo(seoOptions: { type?: 'WebPage' | 'CollectionPage' } = {}) {
    const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }
    const seoDescription = computed(() => hero.value.subtitle || t(`pei.seo.${navKey}Description`))

    useSeoMeta({
      title: () => hero.value.title,
      description: () => seoDescription.value,
      ogTitle: () => hero.value.title,
      ogDescription: () => seoDescription.value,
      ogUrl: () => siteUrl + route.fullPath,
      ogImage: () => (heroImage.value ? siteUrl + heroImage.value : undefined),
      ogLocale: () => localeMap[locale.value] || 'fr_FR',
      ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
    })

    useHead(() => ({
      script: [
        { key: 'jsonld-pei-organization', type: 'application/ld+json', innerHTML: JSON.stringify(buildPeiOrganization({ name: text('hero.title') || t('pei.seo.homeTitle'), email: text('contact.email') })) },
        { key: 'jsonld-pei-webpage', type: 'application/ld+json', innerHTML: JSON.stringify(buildWebPage({ path: route.path, name: hero.value.title, description: seoDescription.value, type: seoOptions.type ?? 'CollectionPage' })) },
        { key: 'jsonld-pei-breadcrumb', type: 'application/ld+json', innerHTML: JSON.stringify(buildBreadcrumbList(breadcrumb.value)) },
      ],
    }))
  }

  return Promise.all([editorial, ddeAsync, breadcrumbReady]).then(() => ({ text, ddeServiceId, ddeService, hero, breadcrumb, applySeo }))
}
