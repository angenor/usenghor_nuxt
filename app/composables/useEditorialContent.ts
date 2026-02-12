/**
 * Composable - Editorial Content pour Front-Office
 * =================================================
 *
 * Fournit les contenus éditoriaux avec fallback automatique sur i18n.
 * À utiliser dans les pages et composants front-office.
 *
 * Usage:
 * ```ts
 * const { getContent, loadContent } = useEditorialContent('homepage')
 *
 * onMounted(() => loadContent())
 *
 * // Dans le template: {{ getContent('hero.slide1.title') }}
 * ```
 */

import { frontOfficePages } from '~/composables/editorial-pages-config'
import type { FrontOfficePage, PageSectionField } from '~/composables/editorial-pages-config'
import type { ValueSectionKey } from '~/types/api'

// ============================================================================
// MAPPING I18N KEYS
// ============================================================================

/**
 * Mapping entre les clés éditoriales et les clés i18n
 * Les clés qui ne sont pas dans ce mapping utilisent la même clé pour les deux
 */
const EDITORIAL_TO_I18N_MAP: Partial<Record<string, string>> = {
  // Hero slides (homepage)
  'hero.slide1.title': 'hero.slides.slide1.title',
  'hero.slide1.subtitle': 'hero.slides.slide1.subtitle',
  'hero.slide1.cta1.text': 'hero.slides.slide1.cta1.text',
  'hero.slide1.cta1.link': 'hero.slides.slide1.cta1.link',
  'hero.slide1.cta2.text': 'hero.slides.slide1.cta2.text',
  'hero.slide1.cta2.link': 'hero.slides.slide1.cta2.link',
  'hero.slide2.title': 'hero.slides.slide2.title',
  'hero.slide2.subtitle': 'hero.slides.slide2.subtitle',
  'hero.slide2.cta1.text': 'hero.slides.slide2.cta1.text',
  'hero.slide2.cta1.link': 'hero.slides.slide2.cta1.link',
  'hero.slide2.cta2.text': 'hero.slides.slide2.cta2.text',
  'hero.slide2.cta2.link': 'hero.slides.slide2.cta2.link',
  'hero.slide3.title': 'hero.slides.slide3.title',
  'hero.slide3.subtitle': 'hero.slides.slide3.subtitle',
  'hero.slide3.cta1.text': 'hero.slides.slide3.cta1.text',
  'hero.slide3.cta1.link': 'hero.slides.slide3.cta1.link',
  'hero.slide3.cta2.text': 'hero.slides.slide3.cta2.text',
  'hero.slide3.cta2.link': 'hero.slides.slide3.cta2.link',
  'hero.slide4.title': 'hero.slides.slide4.title',
  'hero.slide4.subtitle': 'hero.slides.slide4.subtitle',
  'hero.slide4.cta1.text': 'hero.slides.slide4.cta1.text',
  'hero.slide4.cta1.link': 'hero.slides.slide4.cta1.link',
  'hero.slide4.cta2.text': 'hero.slides.slide4.cta2.text',
  'hero.slide4.cta2.link': 'hero.slides.slide4.cta2.link',

  // Hero CTA (legacy)
  'hero.cta.discover': 'hero.cta.discover',
  'hero.cta.contact': 'hero.cta.contact',

  // Mission section
  'mission.badge': 'mission.badge',
  'mission.title': 'mission.title',
  'mission.subtitle': 'mission.subtitle',
  'mission.mission.title': 'mission.mission.title',
  'mission.mission.description': 'mission.mission.description',
  'mission.mission.tagline': 'mission.mission.tagline',
  'mission.vision.title': 'mission.vision.title',
  'mission.vision.description': 'mission.vision.description',

  // Experience section
  'experience.badge': 'mission.experience.badge',
  'experience.title': 'mission.experience.title',
  'experience.description': 'mission.experience.description',
  'experience.cta.text': 'mission.experience.cta.text',
  'experience.cta.link': 'mission.experience.cta.link',
  'experience.features.immersion': 'mission.experience.features.immersion',
  'experience.features.creativity': 'mission.experience.features.creativity',
  'experience.features.network': 'mission.experience.features.network',
  'experience.stats.countries': 'mission.experience.stats.countries',
  'experience.stats.graduates': 'mission.experience.stats.graduates',
  'experience.stats.years': 'mission.experience.stats.years',

  // History section
  'history.badge': 'history.badge',
  'history.title': 'history.title',
  'history.subtitle': 'history.subtitle',
  'history.genesis.date': 'history.genesis.date',
  'history.genesis.title': 'history.genesis.title',
  'history.genesis.description': 'history.genesis.description',
  'history.genesis.point1': 'history.genesis.point1',
  'history.genesis.point2': 'history.genesis.point2',
  'history.founders.title': 'history.founders.title',
  'history.founders.subtitle': 'history.founders.subtitle',
  'history.usenghor.since': 'history.usenghor.since',
  'history.usenghor.title': 'history.usenghor.title',
  'history.usenghor.description': 'history.usenghor.description',
  'history.usenghor.milestone1.title': 'history.usenghor.milestone1.title',
  'history.usenghor.milestone1.desc': 'history.usenghor.milestone1.desc',
  'history.usenghor.milestone2.title': 'history.usenghor.milestone2.title',
  'history.usenghor.milestone2.desc': 'history.usenghor.milestone2.desc',
  'history.legacy.badge': 'history.legacy.badge',
  'history.legacy.title': 'history.legacy.title',
  'history.legacy.description': 'history.legacy.description',

  // History timeline images
  'history.timeline.1989.image1': 'history.timeline.1989.image1',
  'history.timeline.1989.image2': 'history.timeline.1989.image2',
  'history.timeline.1989.image3': 'history.timeline.1989.image3',
  'history.timeline.2002.image1': 'history.timeline.2002.image1',
  'history.timeline.2002.image2': 'history.timeline.2002.image2',
  'history.timeline.2002.image3': 'history.timeline.2002.image3',
  'history.timeline.2016.image1': 'history.timeline.2016.image1',
  'history.timeline.2016.image2': 'history.timeline.2016.image2',
  'history.timeline.2016.image3': 'history.timeline.2016.image3',
  'history.timeline.2020.image1': 'history.timeline.2020.image1',
  'history.timeline.2020.image2': 'history.timeline.2020.image2',
  'history.timeline.2020.image3': 'history.timeline.2020.image3',

  // Formations section
  'formations.badge': 'formations.badge',
  'formations.title': 'formations.title',
  'formations.subtitle': 'formations.subtitle',
  'formations.cta': 'formations.cta',

  // About page - Hero
  'about.hero.title': 'about.hero.title',
  'about.hero.subtitle': 'about.hero.subtitle',

  // About page - Mission
  'about.mission.title': 'about.mission.title',
  'about.mission.content': 'about.mission.content',
  'about.mission.cta.history': 'about.mission.discover.history',
  'about.mission.cta.governance': 'about.mission.discover.governance',

  // About page - Stats
  'about.stats.years.label': 'about.stats.years',
  'about.stats.countries.label': 'about.stats.countries',
  'about.stats.alumni.label': 'about.stats.alumni',
  'about.stats.programs.label': 'about.stats.programs',

  // About page - Engagements (values)
  'about.engagements.title': 'about.engagements.title',
  'about.engagements.excellence.title': 'about.engagements.values.excellence.title',
  'about.engagements.excellence.text': 'about.engagements.values.excellence.text',
  'about.engagements.ethics.title': 'about.engagements.values.ethics.title',
  'about.engagements.ethics.text': 'about.engagements.values.ethics.text',
  'about.engagements.inclusion.title': 'about.engagements.values.inclusion.title',
  'about.engagements.inclusion.text': 'about.engagements.values.inclusion.text',
  'about.engagements.innovation.title': 'about.engagements.values.innovation.title',
  'about.engagements.innovation.text': 'about.engagements.values.innovation.text',
  'about.engagements.solidarity.title': 'about.engagements.values.solidarity.title',
  'about.engagements.solidarity.text': 'about.engagements.values.solidarity.text',
  'about.charter.title': 'about.charter.title',
  'about.charter.download': 'about.charter.download',

  // Strategy page
  'strategy.hero.title': 'strategy.hero.title',
  'strategy.hero.subtitle': 'strategy.hero.subtitle',

  // Page Gouvernance
  'governance.badge': 'governance.badge',
  'governance.title': 'governance.title',
  'governance.subtitle': 'governance.subtitle',
  'governance.foundingTexts.badge': 'governance.foundingTexts.badge',
  'governance.foundingTexts.title': 'governance.foundingTexts.title',
  'governance.foundingTexts.description': 'governance.foundingTexts.description',
  'governance.donorCountries.title': 'governance.donorCountries.title',
  'governance.donorCountries.description': 'governance.donorCountries.description',
  'governance.board.title': 'governance.board.title',
  'governance.board.description': 'governance.board.description',

  // Navbar (éléments globaux)
  'navbar.apply.text': 'nav.apply',
  'navbar.apply.link': 'nav.applyLink',
}

// ============================================================================
// TYPES
// ============================================================================

interface UseEditorialContentOptions {
  /** Charger automatiquement au montage du composant */
  immediate?: boolean
}

// ============================================================================
// COMPOSABLE
// ============================================================================

export function useEditorialContent(pageId: string, options: UseEditorialContentOptions = {}) {
  const { t } = useI18n()
  const store = useEditorialContentStore()

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  /**
   * Configuration de la page depuis frontOfficePages
   */
  const pageConfig = computed<FrontOfficePage | undefined>(() =>
    frontOfficePages.find(p => p.id === pageId),
  )

  /**
   * Toutes les clés éditoriales de cette page
   */
  const pageKeys = computed<string[]>(() => {
    if (!pageConfig.value) return []
    return pageConfig.value.sections.flatMap(s => s.editorialKeys as string[])
  })

  /**
   * État de chargement
   */
  const isLoading = computed(() => store.isLoading)

  // ==========================================================================
  // MÉTHODES
  // ==========================================================================

  /**
   * Convertit une clé éditoriale en clé i18n
   */
  function getI18nKey(editorialKey: string): string {
    return EDITORIAL_TO_I18N_MAP[editorialKey] ?? editorialKey
  }

  /**
   * Charge les contenus éditoriaux pour cette page
   */
  async function loadContent(): Promise<void> {
    if (!pageKeys.value.length) return
    await store.loadPageContents(pageId, pageKeys.value)
  }

  /**
   * Récupère un contenu avec fallback automatique sur i18n
   *
   * @param editorialKey - Clé éditoriale (ex: 'hero.slide1.title')
   * @param fallbackKey - Clé i18n de fallback optionnelle (si différente)
   * @returns La valeur éditée ou la traduction i18n
   */
  function getContent(editorialKey: string, fallbackKey?: string): string {
    // Vérifier si une valeur éditée existe
    const content = store.getContent(editorialKey)
    if (content?.value) {
      return content.value
    }

    // Fallback sur i18n
    const i18nKey = fallbackKey ?? getI18nKey(editorialKey)
    return t(i18nKey)
  }

  /**
   * Récupère un contenu HTML (pour v-html)
   */
  function getHtmlContent(editorialKey: string, fallbackKey?: string): string {
    const content = store.getContent(editorialKey)
    if (content?.value && content.value_type === 'html') {
      return content.value
    }

    // Fallback sur i18n
    const i18nKey = fallbackKey ?? getI18nKey(editorialKey)
    return t(i18nKey)
  }

  /**
   * Vérifie si un contenu éditorial existe (a été édité)
   */
  function hasEditorialContent(editorialKey: string): boolean {
    const content = store.getContent(editorialKey)
    return content?.value !== null && content?.value !== undefined
  }

  /**
   * Récupère la valeur brute d'un contenu éditorial (sans fallback i18n)
   * Utile pour les IDs de médias ou autres valeurs non-textuelles
   *
   * @param editorialKey - Clé éditoriale (ex: 'hero.slide1.image')
   * @returns La valeur brute ou null si non définie
   */
  function getRawContent(editorialKey: string): string | null {
    const content = store.getContent(editorialKey)
    return content?.value ?? null
  }

  // ==========================================================================
  // LIFECYCLE
  // ==========================================================================

  // Chargement automatique si demandé
  if (options.immediate) {
    onMounted(() => {
      loadContent()
    })
  }

  return {
    // Configuration
    pageConfig,
    pageKeys,
    isLoading,

    // Méthodes
    loadContent,
    getContent,
    getRawContent,
    getHtmlContent,
    hasEditorialContent,
    getI18nKey,
  }
}
