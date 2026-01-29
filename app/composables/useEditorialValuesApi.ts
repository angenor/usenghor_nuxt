/**
 * Composable pour la gestion des valeurs éditoriales (mission, vision, valeurs fondamentales)
 * Aligné sur le backend: app/routers/admin/editorial.py
 */

import type {
  CoreValue,
  CoreValueData,
  EditorialCategoryRead,
  EditorialCategoryWithCount,
  EditorialContentCreate,
  EditorialContentRead,
  EditorialContentUpdate,
  EditorialContentWithCategory,
  EditorialHistoryRead,
  EditorialValuesStats,
  EditorialValueType,
  MessageResponse,
  PaginatedResponse,
  ValueSection,
  ValueSectionKey,
} from '~/types/api'

// Catégorie code pour les valeurs
const VALUES_CATEGORY_CODE = 'values'

// Préfixe pour les clés de valeurs fondamentales
const CORE_VALUE_KEY_PREFIX = 'core_value_'

// ============================================================================
// STRUCTURE PAR PAGES ET SECTIONS DU FRONT-OFFICE
// ============================================================================

// Types pour la structure par page
export interface PageSection {
  id: string
  name: string
  description: string
  icon: string
  color: string
  editorialKeys: ValueSectionKey[] // Clés des contenus éditoriaux associés
  fields: PageSectionField[]
}

export interface PageSectionField {
  key: string
  label: string
  description: string
  type: 'text' | 'textarea' | 'number' | 'html' | 'image' | 'list'
  i18nKey?: string // Clé i18n si le champ utilise les traductions
  editorialKey?: ValueSectionKey // Clé éditoriale si éditable via le backend
  editable: boolean
}

export interface FrontOfficePage {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  sections: PageSection[]
}

// ============================================================================
// DÉFINITION DE LA PAGE D'ACCUEIL - TOUS LES CHAMPS ÉDITABLES
// ============================================================================

export const homepageSections: PageSection[] = [
  {
    id: 'hero',
    name: 'Section Hero (Carrousel)',
    description: 'Bannière principale avec carrousel d\'images et textes d\'accroche',
    icon: 'image',
    color: 'bg-gradient-to-r from-brand-blue-500 to-brand-red-500 text-white',
    editorialKeys: [
      'hero.slide1.title', 'hero.slide1.subtitle',
      'hero.slide2.title', 'hero.slide2.subtitle',
      'hero.slide3.title', 'hero.slide3.subtitle',
      'hero.slide4.title', 'hero.slide4.subtitle',
      'hero.cta.discover', 'hero.cta.contact',
    ],
    fields: [
      { key: 'hero.slide1.title', label: 'Slide 1 - Titre', description: 'Titre du premier slide', type: 'text', editorialKey: 'hero.slide1.title', editable: true },
      { key: 'hero.slide1.subtitle', label: 'Slide 1 - Sous-titre', description: 'Sous-titre du premier slide', type: 'textarea', editorialKey: 'hero.slide1.subtitle', editable: true },
      { key: 'hero.slide2.title', label: 'Slide 2 - Titre', description: 'Titre du deuxième slide', type: 'text', editorialKey: 'hero.slide2.title', editable: true },
      { key: 'hero.slide2.subtitle', label: 'Slide 2 - Sous-titre', description: 'Sous-titre du deuxième slide', type: 'textarea', editorialKey: 'hero.slide2.subtitle', editable: true },
      { key: 'hero.slide3.title', label: 'Slide 3 - Titre', description: 'Titre du troisième slide', type: 'text', editorialKey: 'hero.slide3.title', editable: true },
      { key: 'hero.slide3.subtitle', label: 'Slide 3 - Sous-titre', description: 'Sous-titre du troisième slide', type: 'textarea', editorialKey: 'hero.slide3.subtitle', editable: true },
      { key: 'hero.slide4.title', label: 'Slide 4 - Titre', description: 'Titre du quatrième slide', type: 'text', editorialKey: 'hero.slide4.title', editable: true },
      { key: 'hero.slide4.subtitle', label: 'Slide 4 - Sous-titre', description: 'Sous-titre du quatrième slide', type: 'textarea', editorialKey: 'hero.slide4.subtitle', editable: true },
      { key: 'hero.cta.discover', label: 'Bouton "Découvrir"', description: 'Texte du bouton principal', type: 'text', editorialKey: 'hero.cta.discover', editable: true },
      { key: 'hero.cta.contact', label: 'Bouton "Contact"', description: 'Texte du bouton secondaire', type: 'text', editorialKey: 'hero.cta.contact', editable: true },
    ],
  },
  {
    id: 'mission',
    name: 'Section Mission & Vision',
    description: 'Présentation de la mission, vision et expérience Senghor',
    icon: 'bullseye',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: [
      'mission.badge', 'mission.title', 'mission.subtitle',
      'mission.mission.title', 'mission.mission.description', 'mission.mission.tagline',
      'mission.vision.title', 'mission.vision.description',
    ],
    fields: [
      { key: 'mission.badge', label: 'Badge', description: 'Texte du badge au-dessus du titre', type: 'text', editorialKey: 'mission.badge', editable: true },
      { key: 'mission.title', label: 'Titre de section', description: 'Titre principal de la section', type: 'text', editorialKey: 'mission.title', editable: true },
      { key: 'mission.subtitle', label: 'Sous-titre', description: 'Description courte sous le titre', type: 'textarea', editorialKey: 'mission.subtitle', editable: true },
      { key: 'mission.mission.title', label: 'Titre Mission', description: 'Titre de la carte Mission', type: 'text', editorialKey: 'mission.mission.title', editable: true },
      { key: 'mission.mission.description', label: 'Description Mission', description: 'Contenu de la carte Mission', type: 'html', editorialKey: 'mission.mission.description', editable: true },
      { key: 'mission.mission.tagline', label: 'Tagline Mission', description: 'Phrase d\'accroche de la mission', type: 'text', editorialKey: 'mission.mission.tagline', editable: true },
      { key: 'mission.vision.title', label: 'Titre Vision', description: 'Titre de la carte Vision', type: 'text', editorialKey: 'mission.vision.title', editable: true },
      { key: 'mission.vision.description', label: 'Description Vision', description: 'Contenu de la carte Vision', type: 'html', editorialKey: 'mission.vision.description', editable: true },
    ],
  },
  {
    id: 'experience',
    name: 'L\'expérience Senghor',
    description: 'Bloc présentant l\'expérience étudiante (les statistiques sont gérées dans Chiffres clés)',
    icon: 'graduation-cap',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    editorialKeys: [
      'experience.badge', 'experience.title', 'experience.description', 'experience.cta',
      'experience.stats.countries', 'experience.stats.graduates', 'experience.stats.years',
    ],
    fields: [
      { key: 'experience.badge', label: 'Badge Expérience', description: 'Texte du badge', type: 'text', editorialKey: 'experience.badge', editable: true },
      { key: 'experience.title', label: 'Titre Expérience', description: 'Titre du bloc', type: 'text', editorialKey: 'experience.title', editable: true },
      { key: 'experience.description', label: 'Description', description: 'Texte descriptif', type: 'textarea', editorialKey: 'experience.description', editable: true },
      { key: 'experience.cta', label: 'Bouton CTA', description: 'Texte du bouton d\'action', type: 'text', editorialKey: 'experience.cta', editable: true },
      { key: 'experience.stats.countries', label: 'Stat Pays - Libellé', description: 'Libellé de la statistique pays', type: 'text', editorialKey: 'experience.stats.countries', editable: true },
      { key: 'experience.stats.graduates', label: 'Stat Diplômés - Libellé', description: 'Libellé de la statistique diplômés', type: 'text', editorialKey: 'experience.stats.graduates', editable: true },
      { key: 'experience.stats.years', label: 'Stat Années - Libellé', description: 'Libellé de la statistique années', type: 'text', editorialKey: 'experience.stats.years', editable: true },
    ],
  },
  {
    id: 'formations',
    name: 'Section Formations',
    description: 'Affichage des formations vedettes',
    icon: 'book-open',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['formations.badge', 'formations.title', 'formations.subtitle', 'formations.cta'],
    fields: [
      { key: 'formations.badge', label: 'Badge', description: 'Texte du badge', type: 'text', editorialKey: 'formations.badge', editable: true },
      { key: 'formations.title', label: 'Titre', description: 'Titre de la section', type: 'text', editorialKey: 'formations.title', editable: true },
      { key: 'formations.subtitle', label: 'Sous-titre', description: 'Description sous le titre', type: 'textarea', editorialKey: 'formations.subtitle', editable: true },
      { key: 'formations.cta', label: 'Bouton "Voir tout"', description: 'Texte du bouton CTA', type: 'text', editorialKey: 'formations.cta', editable: true },
    ],
  },
  {
    id: 'history',
    name: 'Section Histoire',
    description: 'Chronologie de l\'histoire de l\'université',
    icon: 'landmark',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    editorialKeys: [
      'history.badge', 'history.title', 'history.subtitle',
      'history.genesis.date', 'history.genesis.title', 'history.genesis.description',
      'history.usenghor.since', 'history.usenghor.title', 'history.usenghor.description',
      'history.legacy.badge', 'history.legacy.title', 'history.legacy.description',
    ],
    fields: [
      { key: 'history.badge', label: 'Badge', description: 'Texte du badge', type: 'text', editorialKey: 'history.badge', editable: true },
      { key: 'history.title', label: 'Titre', description: 'Titre principal', type: 'text', editorialKey: 'history.title', editable: true },
      { key: 'history.subtitle', label: 'Sous-titre', description: 'Description', type: 'textarea', editorialKey: 'history.subtitle', editable: true },
      { key: 'history.genesis.date', label: 'Genèse - Date', description: 'Date de la genèse (ex: 1989)', type: 'text', editorialKey: 'history.genesis.date', editable: true },
      { key: 'history.genesis.title', label: 'Genèse - Titre', description: 'Titre du bloc genèse', type: 'text', editorialKey: 'history.genesis.title', editable: true },
      { key: 'history.genesis.description', label: 'Genèse - Description', description: 'Contenu du bloc genèse', type: 'html', editorialKey: 'history.genesis.description', editable: true },
      { key: 'history.usenghor.since', label: 'USenghor - Depuis', description: 'Date de création (ex: Depuis 1990)', type: 'text', editorialKey: 'history.usenghor.since', editable: true },
      { key: 'history.usenghor.title', label: 'USenghor - Titre', description: 'Titre du bloc université', type: 'text', editorialKey: 'history.usenghor.title', editable: true },
      { key: 'history.usenghor.description', label: 'USenghor - Description', description: 'Contenu du bloc université', type: 'html', editorialKey: 'history.usenghor.description', editable: true },
      { key: 'history.legacy.badge', label: 'Héritage - Badge', description: 'Badge du bloc héritage', type: 'text', editorialKey: 'history.legacy.badge', editable: true },
      { key: 'history.legacy.title', label: 'Héritage - Titre', description: 'Titre du bloc héritage', type: 'text', editorialKey: 'history.legacy.title', editable: true },
      { key: 'history.legacy.description', label: 'Héritage - Description', description: 'Contenu du bloc héritage', type: 'html', editorialKey: 'history.legacy.description', editable: true },
    ],
  },
  {
    id: 'partners',
    name: 'Section Partenaires & Gouvernance',
    description: 'Textes fondateurs et pays bailleurs',
    icon: 'handshake',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    editorialKeys: [
      'governance.badge', 'governance.title', 'governance.subtitle',
      'governance.foundingTexts.badge', 'governance.foundingTexts.title', 'governance.foundingTexts.description',
      'governance.donorCountries.title', 'governance.donorCountries.description',
    ],
    fields: [
      { key: 'governance.badge', label: 'Badge', description: 'Texte du badge', type: 'text', editorialKey: 'governance.badge', editable: true },
      { key: 'governance.title', label: 'Titre', description: 'Titre principal', type: 'text', editorialKey: 'governance.title', editable: true },
      { key: 'governance.subtitle', label: 'Sous-titre', description: 'Description', type: 'textarea', editorialKey: 'governance.subtitle', editable: true },
      { key: 'governance.foundingTexts.badge', label: 'Textes fondateurs - Badge', description: 'Badge du bloc', type: 'text', editorialKey: 'governance.foundingTexts.badge', editable: true },
      { key: 'governance.foundingTexts.title', label: 'Textes fondateurs - Titre', description: 'Titre du bloc', type: 'text', editorialKey: 'governance.foundingTexts.title', editable: true },
      { key: 'governance.foundingTexts.description', label: 'Textes fondateurs - Description', description: 'Contenu du bloc', type: 'html', editorialKey: 'governance.foundingTexts.description', editable: true },
      { key: 'governance.donorCountries.title', label: 'Pays bailleurs - Titre', description: 'Titre du bloc', type: 'text', editorialKey: 'governance.donorCountries.title', editable: true },
      { key: 'governance.donorCountries.description', label: 'Pays bailleurs - Description', description: 'Description du bloc', type: 'textarea', editorialKey: 'governance.donorCountries.description', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE À PROPOS
// ============================================================================

export const aboutPageSections: PageSection[] = [
  {
    id: 'about-hero',
    name: 'Hero À propos',
    description: 'Bannière principale de la page À propos',
    icon: 'image',
    color: 'bg-gradient-to-r from-brand-blue-500 to-brand-red-500 text-white',
    editorialKeys: ['about.hero.title', 'about.hero.subtitle'],
    fields: [
      { key: 'about.hero.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'about.hero.title', editable: true },
      { key: 'about.hero.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'about.hero.subtitle', editable: true },
    ],
  },
  {
    id: 'about-mission',
    name: 'Section Mission',
    description: 'Présentation de la mission de l\'université',
    icon: 'bullseye',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: ['about.mission.title', 'about.mission.content', 'about.mission.cta.history', 'about.mission.cta.governance'],
    fields: [
      { key: 'about.mission.title', label: 'Titre Mission', description: 'Titre de la section mission', type: 'text', editorialKey: 'about.mission.title', editable: true },
      { key: 'about.mission.content', label: 'Contenu Mission', description: 'Texte de présentation de la mission', type: 'html', editorialKey: 'about.mission.content', editable: true },
      { key: 'about.mission.cta.history', label: 'Lien Histoire', description: 'Libellé du lien vers l\'histoire', type: 'text', editorialKey: 'about.mission.cta.history', editable: true },
      { key: 'about.mission.cta.governance', label: 'Lien Gouvernance', description: 'Libellé du lien vers la gouvernance', type: 'text', editorialKey: 'about.mission.cta.governance', editable: true },
    ],
  },
  {
    id: 'about-stats',
    name: 'Section Statistiques',
    description: 'Libellés des statistiques (les valeurs numériques sont dans Chiffres clés)',
    icon: 'chart-bar',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['about.stats.years.label', 'about.stats.countries.label', 'about.stats.alumni.label', 'about.stats.programs.label'],
    fields: [
      { key: 'about.stats.years.label', label: 'Libellé Années', description: 'Ex: "années d\'existence"', type: 'text', editorialKey: 'about.stats.years.label', editable: true },
      { key: 'about.stats.countries.label', label: 'Libellé Pays', description: 'Ex: "pays bailleurs"', type: 'text', editorialKey: 'about.stats.countries.label', editable: true },
      { key: 'about.stats.alumni.label', label: 'Libellé Diplômés', description: 'Ex: "diplômés"', type: 'text', editorialKey: 'about.stats.alumni.label', editable: true },
      { key: 'about.stats.programs.label', label: 'Libellé Formations', description: 'Ex: "formations"', type: 'text', editorialKey: 'about.stats.programs.label', editable: true },
    ],
  },
  {
    id: 'about-engagements',
    name: 'Section Engagements & Valeurs',
    description: 'Les 5 valeurs fondamentales et la charte éthique',
    icon: 'heart',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    editorialKeys: [
      'about.engagements.title',
      'about.engagements.excellence.title', 'about.engagements.excellence.text',
      'about.engagements.ethics.title', 'about.engagements.ethics.text',
      'about.engagements.inclusion.title', 'about.engagements.inclusion.text',
      'about.engagements.innovation.title', 'about.engagements.innovation.text',
      'about.engagements.solidarity.title', 'about.engagements.solidarity.text',
      'about.charter.title', 'about.charter.download',
    ],
    fields: [
      { key: 'about.engagements.title', label: 'Titre Section', description: 'Titre de la section engagements', type: 'text', editorialKey: 'about.engagements.title', editable: true },
      // Excellence
      { key: 'about.engagements.excellence.title', label: 'Excellence - Titre', description: 'Titre de la valeur Excellence', type: 'text', editorialKey: 'about.engagements.excellence.title', editable: true },
      { key: 'about.engagements.excellence.text', label: 'Excellence - Description', description: 'Description de la valeur Excellence', type: 'textarea', editorialKey: 'about.engagements.excellence.text', editable: true },
      // Ethics
      { key: 'about.engagements.ethics.title', label: 'Éthique - Titre', description: 'Titre de la valeur Éthique', type: 'text', editorialKey: 'about.engagements.ethics.title', editable: true },
      { key: 'about.engagements.ethics.text', label: 'Éthique - Description', description: 'Description de la valeur Éthique', type: 'textarea', editorialKey: 'about.engagements.ethics.text', editable: true },
      // Inclusion
      { key: 'about.engagements.inclusion.title', label: 'Inclusion - Titre', description: 'Titre de la valeur Inclusion', type: 'text', editorialKey: 'about.engagements.inclusion.title', editable: true },
      { key: 'about.engagements.inclusion.text', label: 'Inclusion - Description', description: 'Description de la valeur Inclusion', type: 'textarea', editorialKey: 'about.engagements.inclusion.text', editable: true },
      // Innovation
      { key: 'about.engagements.innovation.title', label: 'Innovation - Titre', description: 'Titre de la valeur Innovation', type: 'text', editorialKey: 'about.engagements.innovation.title', editable: true },
      { key: 'about.engagements.innovation.text', label: 'Innovation - Description', description: 'Description de la valeur Innovation', type: 'textarea', editorialKey: 'about.engagements.innovation.text', editable: true },
      // Solidarity
      { key: 'about.engagements.solidarity.title', label: 'Solidarité - Titre', description: 'Titre de la valeur Solidarité', type: 'text', editorialKey: 'about.engagements.solidarity.title', editable: true },
      { key: 'about.engagements.solidarity.text', label: 'Solidarité - Description', description: 'Description de la valeur Solidarité', type: 'textarea', editorialKey: 'about.engagements.solidarity.text', editable: true },
      // Charter
      { key: 'about.charter.title', label: 'Charte - Titre', description: 'Titre de la section charte', type: 'text', editorialKey: 'about.charter.title', editable: true },
      { key: 'about.charter.download', label: 'Charte - Bouton', description: 'Texte du bouton téléchargement', type: 'text', editorialKey: 'about.charter.download', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE STRATÉGIE
// ============================================================================

export const strategyPageSections: PageSection[] = [
  {
    id: 'strategy-hero',
    name: 'Hero Stratégie',
    description: 'Bannière principale de la page Stratégie',
    icon: 'image',
    color: 'bg-gradient-to-r from-brand-blue-500 to-brand-red-500 text-white',
    editorialKeys: ['strategy.hero.title', 'strategy.hero.subtitle'],
    fields: [
      { key: 'strategy.hero.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'strategy.hero.title', editable: true },
      { key: 'strategy.hero.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'strategy.hero.subtitle', editable: true },
    ],
  },
  {
    id: 'strategy-plan',
    name: 'Plan Stratégique',
    description: 'Présentation du plan stratégique 2024-2030',
    icon: 'file-alt',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: ['strategy.plan.title', 'strategy.plan.summary', 'strategy.plan.download'],
    fields: [
      { key: 'strategy.plan.title', label: 'Titre', description: 'Titre de la section', type: 'text', editorialKey: 'strategy.plan.title', editable: true },
      { key: 'strategy.plan.summary', label: 'Résumé', description: 'Texte de présentation du plan', type: 'html', editorialKey: 'strategy.plan.summary', editable: true },
      { key: 'strategy.plan.download', label: 'Bouton téléchargement', description: 'Texte du bouton PDF', type: 'text', editorialKey: 'strategy.plan.download', editable: true },
    ],
  },
  {
    id: 'strategy-axes',
    name: 'Axes Stratégiques',
    description: 'Les 3 axes stratégiques avec leurs objectifs',
    icon: 'compass',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    editorialKeys: [
      'strategy.axes.title', 'strategy.axes.subtitle',
      'strategy.axes.items.a1.code', 'strategy.axes.items.a1.title', 'strategy.axes.items.a1.description',
      'strategy.axes.items.a1.objective1', 'strategy.axes.items.a1.objective2', 'strategy.axes.items.a1.objective3',
      'strategy.axes.items.a2.code', 'strategy.axes.items.a2.title', 'strategy.axes.items.a2.description',
      'strategy.axes.items.a2.objective1', 'strategy.axes.items.a2.objective2', 'strategy.axes.items.a2.objective3',
      'strategy.axes.items.a3.code', 'strategy.axes.items.a3.title', 'strategy.axes.items.a3.description',
      'strategy.axes.items.a3.objective1', 'strategy.axes.items.a3.objective2', 'strategy.axes.items.a3.objective3',
    ],
    fields: [
      { key: 'strategy.axes.title', label: 'Titre section', description: 'Titre de la section axes', type: 'text', editorialKey: 'strategy.axes.title', editable: true },
      { key: 'strategy.axes.subtitle', label: 'Sous-titre section', description: 'Sous-titre de la section', type: 'text', editorialKey: 'strategy.axes.subtitle', editable: true },
      // Axe 1
      { key: 'strategy.axes.items.a1.code', label: 'Axe 1 - Code', description: 'Code de l\'axe (ex: A1)', type: 'text', editorialKey: 'strategy.axes.items.a1.code', editable: true },
      { key: 'strategy.axes.items.a1.title', label: 'Axe 1 - Titre', description: 'Titre de l\'axe 1', type: 'text', editorialKey: 'strategy.axes.items.a1.title', editable: true },
      { key: 'strategy.axes.items.a1.description', label: 'Axe 1 - Description', description: 'Description de l\'axe 1', type: 'textarea', editorialKey: 'strategy.axes.items.a1.description', editable: true },
      { key: 'strategy.axes.items.a1.objective1', label: 'Axe 1 - Objectif 1', description: 'Premier objectif', type: 'text', editorialKey: 'strategy.axes.items.a1.objective1', editable: true },
      { key: 'strategy.axes.items.a1.objective2', label: 'Axe 1 - Objectif 2', description: 'Deuxième objectif', type: 'text', editorialKey: 'strategy.axes.items.a1.objective2', editable: true },
      { key: 'strategy.axes.items.a1.objective3', label: 'Axe 1 - Objectif 3', description: 'Troisième objectif', type: 'text', editorialKey: 'strategy.axes.items.a1.objective3', editable: true },
      // Axe 2
      { key: 'strategy.axes.items.a2.code', label: 'Axe 2 - Code', description: 'Code de l\'axe (ex: A2)', type: 'text', editorialKey: 'strategy.axes.items.a2.code', editable: true },
      { key: 'strategy.axes.items.a2.title', label: 'Axe 2 - Titre', description: 'Titre de l\'axe 2', type: 'text', editorialKey: 'strategy.axes.items.a2.title', editable: true },
      { key: 'strategy.axes.items.a2.description', label: 'Axe 2 - Description', description: 'Description de l\'axe 2', type: 'textarea', editorialKey: 'strategy.axes.items.a2.description', editable: true },
      { key: 'strategy.axes.items.a2.objective1', label: 'Axe 2 - Objectif 1', description: 'Premier objectif', type: 'text', editorialKey: 'strategy.axes.items.a2.objective1', editable: true },
      { key: 'strategy.axes.items.a2.objective2', label: 'Axe 2 - Objectif 2', description: 'Deuxième objectif', type: 'text', editorialKey: 'strategy.axes.items.a2.objective2', editable: true },
      { key: 'strategy.axes.items.a2.objective3', label: 'Axe 2 - Objectif 3', description: 'Troisième objectif', type: 'text', editorialKey: 'strategy.axes.items.a2.objective3', editable: true },
      // Axe 3
      { key: 'strategy.axes.items.a3.code', label: 'Axe 3 - Code', description: 'Code de l\'axe (ex: A3)', type: 'text', editorialKey: 'strategy.axes.items.a3.code', editable: true },
      { key: 'strategy.axes.items.a3.title', label: 'Axe 3 - Titre', description: 'Titre de l\'axe 3', type: 'text', editorialKey: 'strategy.axes.items.a3.title', editable: true },
      { key: 'strategy.axes.items.a3.description', label: 'Axe 3 - Description', description: 'Description de l\'axe 3', type: 'textarea', editorialKey: 'strategy.axes.items.a3.description', editable: true },
      { key: 'strategy.axes.items.a3.objective1', label: 'Axe 3 - Objectif 1', description: 'Premier objectif', type: 'text', editorialKey: 'strategy.axes.items.a3.objective1', editable: true },
      { key: 'strategy.axes.items.a3.objective2', label: 'Axe 3 - Objectif 2', description: 'Deuxième objectif', type: 'text', editorialKey: 'strategy.axes.items.a3.objective2', editable: true },
      { key: 'strategy.axes.items.a3.objective3', label: 'Axe 3 - Objectif 3', description: 'Troisième objectif', type: 'text', editorialKey: 'strategy.axes.items.a3.objective3', editable: true },
    ],
  },
  {
    id: 'strategy-indicators',
    name: 'Indicateurs Cibles 2030',
    description: 'Les objectifs chiffrés pour 2030 (les valeurs numériques sont dans Chiffres clés)',
    icon: 'chart-line',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: [
      'strategy.indicators.title', 'strategy.indicators.subtitle',
      'strategy.indicators.items.students', 'strategy.indicators.items.programs',
      'strategy.indicators.items.women', 'strategy.indicators.items.insertion',
    ],
    fields: [
      { key: 'strategy.indicators.title', label: 'Titre section', description: 'Titre de la section indicateurs', type: 'text', editorialKey: 'strategy.indicators.title', editable: true },
      { key: 'strategy.indicators.subtitle', label: 'Sous-titre section', description: 'Sous-titre de la section', type: 'text', editorialKey: 'strategy.indicators.subtitle', editable: true },
      { key: 'strategy.indicators.items.students', label: 'Libellé Étudiants', description: 'Libellé pour l\'indicateur étudiants', type: 'text', editorialKey: 'strategy.indicators.items.students', editable: true },
      { key: 'strategy.indicators.items.programs', label: 'Libellé Formations', description: 'Libellé pour l\'indicateur formations', type: 'text', editorialKey: 'strategy.indicators.items.programs', editable: true },
      { key: 'strategy.indicators.items.women', label: 'Libellé Femmes', description: 'Libellé pour l\'indicateur parité', type: 'text', editorialKey: 'strategy.indicators.items.women', editable: true },
      { key: 'strategy.indicators.items.insertion', label: 'Libellé Insertion', description: 'Libellé pour l\'indicateur insertion', type: 'text', editorialKey: 'strategy.indicators.items.insertion', editable: true },
    ],
  },
  {
    id: 'strategy-fundraising',
    name: 'Levée de Fonds',
    description: 'Projets de financement et appel aux dons',
    icon: 'hand-holding-usd',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    editorialKeys: [
      'strategy.fundraising.title', 'strategy.fundraising.subtitle',
      'strategy.fundraising.projects.scholarships.title', 'strategy.fundraising.projects.scholarships.description', 'strategy.fundraising.projects.scholarships.amount',
      'strategy.fundraising.projects.campus.title', 'strategy.fundraising.projects.campus.description', 'strategy.fundraising.projects.campus.amount',
      'strategy.fundraising.projects.research.title', 'strategy.fundraising.projects.research.description', 'strategy.fundraising.projects.research.amount',
      'strategy.fundraising.projects.library.title', 'strategy.fundraising.projects.library.description', 'strategy.fundraising.projects.library.amount',
      'strategy.fundraising.cta.title', 'strategy.fundraising.cta.text', 'strategy.fundraising.cta.button',
    ],
    fields: [
      { key: 'strategy.fundraising.title', label: 'Titre section', description: 'Titre de la section levée de fonds', type: 'text', editorialKey: 'strategy.fundraising.title', editable: true },
      { key: 'strategy.fundraising.subtitle', label: 'Sous-titre section', description: 'Sous-titre de la section', type: 'text', editorialKey: 'strategy.fundraising.subtitle', editable: true },
      // Projet Bourses
      { key: 'strategy.fundraising.projects.scholarships.title', label: 'Bourses - Titre', description: 'Titre du projet bourses', type: 'text', editorialKey: 'strategy.fundraising.projects.scholarships.title', editable: true },
      { key: 'strategy.fundraising.projects.scholarships.description', label: 'Bourses - Description', description: 'Description du projet', type: 'textarea', editorialKey: 'strategy.fundraising.projects.scholarships.description', editable: true },
      { key: 'strategy.fundraising.projects.scholarships.amount', label: 'Bourses - Montant', description: 'Montant recherché', type: 'text', editorialKey: 'strategy.fundraising.projects.scholarships.amount', editable: true },
      // Projet Campus
      { key: 'strategy.fundraising.projects.campus.title', label: 'Campus - Titre', description: 'Titre du projet campus', type: 'text', editorialKey: 'strategy.fundraising.projects.campus.title', editable: true },
      { key: 'strategy.fundraising.projects.campus.description', label: 'Campus - Description', description: 'Description du projet', type: 'textarea', editorialKey: 'strategy.fundraising.projects.campus.description', editable: true },
      { key: 'strategy.fundraising.projects.campus.amount', label: 'Campus - Montant', description: 'Montant recherché', type: 'text', editorialKey: 'strategy.fundraising.projects.campus.amount', editable: true },
      // Projet Recherche
      { key: 'strategy.fundraising.projects.research.title', label: 'Recherche - Titre', description: 'Titre du projet recherche', type: 'text', editorialKey: 'strategy.fundraising.projects.research.title', editable: true },
      { key: 'strategy.fundraising.projects.research.description', label: 'Recherche - Description', description: 'Description du projet', type: 'textarea', editorialKey: 'strategy.fundraising.projects.research.description', editable: true },
      { key: 'strategy.fundraising.projects.research.amount', label: 'Recherche - Montant', description: 'Montant recherché', type: 'text', editorialKey: 'strategy.fundraising.projects.research.amount', editable: true },
      // Projet Bibliothèque
      { key: 'strategy.fundraising.projects.library.title', label: 'Bibliothèque - Titre', description: 'Titre du projet bibliothèque', type: 'text', editorialKey: 'strategy.fundraising.projects.library.title', editable: true },
      { key: 'strategy.fundraising.projects.library.description', label: 'Bibliothèque - Description', description: 'Description du projet', type: 'textarea', editorialKey: 'strategy.fundraising.projects.library.description', editable: true },
      { key: 'strategy.fundraising.projects.library.amount', label: 'Bibliothèque - Montant', description: 'Montant recherché', type: 'text', editorialKey: 'strategy.fundraising.projects.library.amount', editable: true },
      // CTA
      { key: 'strategy.fundraising.cta.title', label: 'CTA - Titre', description: 'Titre du bloc appel à l\'action', type: 'text', editorialKey: 'strategy.fundraising.cta.title', editable: true },
      { key: 'strategy.fundraising.cta.text', label: 'CTA - Texte', description: 'Texte d\'accompagnement', type: 'textarea', editorialKey: 'strategy.fundraising.cta.text', editable: true },
      { key: 'strategy.fundraising.cta.button', label: 'CTA - Bouton', description: 'Texte du bouton', type: 'text', editorialKey: 'strategy.fundraising.cta.button', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE ORGANISATION
// ============================================================================

export const organizationPageSections: PageSection[] = [
  {
    id: 'organization-hero',
    name: 'Hero Organisation',
    description: 'Bannière principale de la page Organisation',
    icon: 'image',
    color: 'bg-gradient-to-r from-brand-blue-500 to-brand-red-500 text-white',
    editorialKeys: ['organization.hero.title', 'organization.hero.subtitle'],
    fields: [
      { key: 'organization.hero.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'organization.hero.title', editable: true },
      { key: 'organization.hero.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'organization.hero.subtitle', editable: true },
    ],
  },
  {
    id: 'organization-orgchart',
    name: 'Section Organigramme',
    description: 'Structure organisationnelle avec les catégories de services',
    icon: 'sitemap',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: ['organization.orgchart.title', 'organization.intro.text'],
    fields: [
      { key: 'organization.orgchart.title', label: 'Titre Organigramme', description: 'Titre de la section organigramme', type: 'text', editorialKey: 'organization.orgchart.title', editable: true },
      { key: 'organization.intro.text', label: 'Texte d\'introduction', description: 'Texte de présentation de l\'organisation', type: 'textarea', editorialKey: 'organization.intro.text', editable: true },
    ],
  },
  {
    id: 'organization-cta',
    name: 'Section CTA',
    description: 'Appel à l\'action vers la page équipe',
    icon: 'bullhorn',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['organization.cta.title', 'organization.cta.text', 'organization.cta.button'],
    fields: [
      { key: 'organization.cta.title', label: 'Titre CTA', description: 'Titre du bloc appel à l\'action', type: 'text', editorialKey: 'organization.cta.title', editable: true },
      { key: 'organization.cta.text', label: 'Texte CTA', description: 'Texte d\'accompagnement', type: 'textarea', editorialKey: 'organization.cta.text', editable: true },
      { key: 'organization.cta.button', label: 'Bouton CTA', description: 'Texte du bouton', type: 'text', editorialKey: 'organization.cta.button', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE ÉQUIPE
// ============================================================================

export const teamPageSections: PageSection[] = [
  {
    id: 'team-hero',
    name: 'Hero Équipe',
    description: 'Bannière principale de la page Équipe',
    icon: 'image',
    color: 'bg-gradient-to-r from-brand-blue-500 to-brand-red-500 text-white',
    editorialKeys: ['team.hero.title', 'team.hero.subtitle'],
    fields: [
      { key: 'team.hero.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'team.hero.title', editable: true },
      { key: 'team.hero.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'team.hero.subtitle', editable: true },
    ],
  },
  {
    id: 'team-cta',
    name: 'Section CTA',
    description: 'Appel à l\'action vers la page carrières',
    icon: 'bullhorn',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['team.cta.title', 'team.cta.text', 'team.cta.button'],
    fields: [
      { key: 'team.cta.title', label: 'Titre CTA', description: 'Titre du bloc appel à l\'action', type: 'text', editorialKey: 'team.cta.title', editable: true },
      { key: 'team.cta.text', label: 'Texte CTA', description: 'Texte d\'accompagnement', type: 'textarea', editorialKey: 'team.cta.text', editable: true },
      { key: 'team.cta.button', label: 'Bouton CTA', description: 'Texte du bouton', type: 'text', editorialKey: 'team.cta.button', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE PARTENAIRES
// ============================================================================

export const partnersPageSections: PageSection[] = [
  {
    id: 'partners-hero',
    name: 'Hero Partenaires',
    description: 'Bannière principale de la page Partenaires',
    icon: 'image',
    color: 'bg-gradient-to-r from-brand-blue-500 to-brand-red-500 text-white',
    editorialKeys: ['partners.hero.badge', 'partners.hero.title', 'partners.hero.subtitle'],
    fields: [
      { key: 'partners.hero.badge', label: 'Badge', description: 'Texte du badge au-dessus du titre', type: 'text', editorialKey: 'partners.hero.badge', editable: true },
      { key: 'partners.hero.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'partners.hero.title', editable: true },
      { key: 'partners.hero.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'partners.hero.subtitle', editable: true },
    ],
  },
  {
    id: 'partners-campus',
    name: 'Section Campus Externalisés',
    description: 'Carte interactive des campus et partenaires dans le monde',
    icon: 'globe-africa',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: ['partners.campus.title', 'partners.campus.subtitle'],
    fields: [
      { key: 'partners.campus.title', label: 'Titre section', description: 'Titre de la section campus', type: 'text', editorialKey: 'partners.campus.title', editable: true },
      { key: 'partners.campus.subtitle', label: 'Sous-titre section', description: 'Description de la section', type: 'textarea', editorialKey: 'partners.campus.subtitle', editable: true },
    ],
  },
]

// Pages du front-office
export const frontOfficePages: FrontOfficePage[] = [
  {
    id: 'homepage',
    name: 'Page d\'accueil',
    slug: '/',
    description: 'Page principale du site avec les sections Hero, Mission, Formations, Histoire et Partenaires',
    icon: 'home',
    sections: homepageSections,
  },
  {
    id: 'about',
    name: 'Page À propos',
    slug: '/a-propos',
    description: 'Présentation de l\'université : mission, statistiques et engagements',
    icon: 'info-circle',
    sections: aboutPageSections,
  },
  {
    id: 'strategy',
    name: 'Page Stratégie',
    slug: '/a-propos/strategie',
    description: 'Plan stratégique 2024-2030, axes, indicateurs et levée de fonds',
    icon: 'compass',
    sections: strategyPageSections,
  },
  {
    id: 'organization',
    name: 'Page Organisation',
    slug: '/a-propos/organisation',
    description: 'Organigramme, services et secteurs académiques',
    icon: 'sitemap',
    sections: organizationPageSections,
  },
  {
    id: 'team',
    name: 'Page Équipe',
    slug: '/a-propos/equipe',
    description: 'Présentation de l\'équipe avec filtres par type',
    icon: 'users',
    sections: teamPageSections,
  },
  {
    id: 'partners',
    name: 'Page Partenaires',
    slug: '/a-propos/partenaires',
    description: 'Campus externalisés et partenaires institutionnels',
    icon: 'handshake',
    sections: partnersPageSections,
  },
]

// ============================================================================
// LABELS ET CONFIGURATIONS EXISTANTS (rétrocompatibilité)
// ============================================================================

// Labels pour les sections
export const valueSectionLabels: Record<ValueSectionKey, string> = {
  mission: 'Mission',
  vision: 'Vision',
  history: 'Historique / À propos',
  rector_message: 'Mot du recteur',
}

// Descriptions pour les sections
export const valueSectionDescriptions: Record<ValueSectionKey, string> = {
  mission: 'La mission de l\'Université Senghor et ses objectifs principaux',
  vision: 'La vision à long terme et les aspirations de l\'université',
  history: 'L\'histoire et le contexte de création de l\'université',
  rector_message: 'Le message du recteur aux étudiants et partenaires',
}

// Icônes pour les sections
export const valueSectionIcons: Record<ValueSectionKey, string> = {
  mission: 'bullseye',
  vision: 'eye',
  history: 'book-open',
  rector_message: 'user-tie',
}

// Couleurs pour les sections
export const valueSectionColors: Record<ValueSectionKey, string> = {
  mission: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  vision: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  history: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  rector_message: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

// Clés des sections (ordre d'affichage)
export const sectionKeys: ValueSectionKey[] = ['mission', 'vision', 'history', 'rector_message']

// Icônes disponibles pour les valeurs fondamentales
export const coreValueAvailableIcons: Array<{ value: string, label: string }> = [
  { value: 'star', label: 'Étoile' },
  { value: 'award', label: 'Récompense' },
  { value: 'heart', label: 'Cœur' },
  { value: 'lightbulb', label: 'Ampoule' },
  { value: 'users', label: 'Utilisateurs' },
  { value: 'globe', label: 'Globe' },
  { value: 'handshake', label: 'Poignée de main' },
  { value: 'graduation-cap', label: 'Chapeau diplômé' },
  { value: 'book', label: 'Livre' },
  { value: 'shield-alt', label: 'Bouclier' },
  { value: 'balance-scale', label: 'Balance' },
  { value: 'seedling', label: 'Pousse' },
  { value: 'rocket', label: 'Fusée' },
  { value: 'compass', label: 'Boussole' },
  { value: 'gem', label: 'Diamant' },
  { value: 'flag', label: 'Drapeau' },
]

export function useEditorialValuesApi() {
  const { apiFetch } = useApi()

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  /**
   * Liste les catégories avec le nombre de contenus
   */
  async function listCategoriesWithCount(): Promise<EditorialCategoryWithCount[]> {
    return apiFetch<EditorialCategoryWithCount[]>('/api/admin/editorial/categories/with-count')
  }

  /**
   * Récupère la catégorie "values"
   */
  async function getValuesCategory(): Promise<EditorialCategoryRead | null> {
    try {
      const response = await apiFetch<PaginatedResponse<EditorialCategoryRead>>('/api/admin/editorial/categories', {
        query: { search: VALUES_CATEGORY_CODE, limit: 1 },
      })
      return response.items.find(c => c.code === VALUES_CATEGORY_CODE) || null
    }
    catch {
      return null
    }
  }

  // ============================================================================
  // CONTENTS (Generic)
  // ============================================================================

  /**
   * Liste les contenus avec filtres
   */
  async function listContents(params: {
    page?: number
    limit?: number
    search?: string | null
    category_code?: string | null
    value_type?: EditorialValueType | null
  } = {}): Promise<PaginatedResponse<EditorialContentRead>> {
    // Construire l'objet query en filtrant les valeurs null/undefined
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
    }

    // Ajouter les paramètres optionnels seulement s'ils ont une valeur
    if (params.search) {
      query.search = params.search
    }
    if (params.category_code) {
      query.category_code = params.category_code
    }
    if (params.value_type) {
      query.value_type = params.value_type
    }

    return apiFetch<PaginatedResponse<EditorialContentRead>>('/api/admin/editorial/contents', {
      query,
    })
  }

  /**
   * Récupère un contenu par ID
   */
  async function getContentById(id: string): Promise<EditorialContentWithCategory> {
    return apiFetch<EditorialContentWithCategory>(`/api/admin/editorial/contents/${id}`)
  }

  /**
   * Récupère un contenu par clé
   */
  async function getContentByKey(key: string): Promise<EditorialContentWithCategory> {
    return apiFetch<EditorialContentWithCategory>(`/api/admin/editorial/contents/by-key/${key}`)
  }

  /**
   * Crée un nouveau contenu
   */
  async function createContent(data: EditorialContentCreate): Promise<{ id: string }> {
    return apiFetch<{ id: string }>('/api/admin/editorial/contents', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Met à jour un contenu
   */
  async function updateContent(id: string, data: EditorialContentUpdate): Promise<EditorialContentRead> {
    return apiFetch<EditorialContentRead>(`/api/admin/editorial/contents/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Supprime un contenu
   */
  async function deleteContent(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/editorial/contents/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Récupère l'historique d'un contenu
   */
  async function getContentHistory(contentId: string, limit = 50): Promise<EditorialHistoryRead[]> {
    return apiFetch<EditorialHistoryRead[]>(`/api/admin/editorial/contents/${contentId}/history`, {
      query: { limit },
    })
  }

  // ============================================================================
  // VALUE SECTIONS (Mission, Vision, etc.)
  // ============================================================================

  /**
   * Récupère toutes les sections de valeurs
   * Note: Les sections utilisent maintenant le format EditorJS (JSON)
   */
  async function getValueSections(): Promise<ValueSection[]> {
    const response = await listContents({
      category_code: VALUES_CATEGORY_CODE,
      limit: 20,
    })

    // Filtrer pour garder uniquement les sections connues (par clé, pas par type)
    const sections: ValueSection[] = []
    for (const key of sectionKeys) {
      const content = response.items.find(c => c.key === key)
      if (content) {
        sections.push(contentToValueSection(content))
      }
    }

    return sections.sort((a, b) => a.display_order - b.display_order)
  }

  /**
   * Récupère une section par sa clé
   */
  async function getValueSectionByKey(key: ValueSectionKey): Promise<ValueSection | null> {
    try {
      const content = await getContentByKey(key)
      return contentToValueSection(content)
    }
    catch {
      return null
    }
  }

  /**
   * Met à jour une section
   * @param id - ID du contenu
   * @param data - Données à mettre à jour (title et/ou content)
   * @param data.content - Peut être une string JSON ou un objet OutputData EditorJS
   */
  async function updateValueSection(id: string, data: { title?: string, content?: string | object }): Promise<ValueSection> {
    // Le titre est stocké dans la description, le contenu dans value
    const updateData: EditorialContentUpdate = {}
    if (data.title !== undefined) {
      updateData.description = data.title
    }
    if (data.content !== undefined) {
      // Si c'est un objet (OutputData EditorJS), le sérialiser en JSON
      updateData.value = typeof data.content === 'string'
        ? data.content
        : JSON.stringify(data.content)
    }

    const updated = await updateContent(id, updateData)
    return contentToValueSection(updated)
  }

  // ============================================================================
  // CORE VALUES (Valeurs fondamentales)
  // ============================================================================

  /**
   * Récupère toutes les valeurs fondamentales
   */
  async function getCoreValues(includeInactive = true): Promise<CoreValue[]> {
    const response = await listContents({
      category_code: VALUES_CATEGORY_CODE,
      value_type: 'json',
      limit: 50,
    })

    // Filtrer pour garder uniquement les core values
    const coreValues: CoreValue[] = []
    for (const content of response.items) {
      if (content.key.startsWith(CORE_VALUE_KEY_PREFIX)) {
        const coreValue = contentToCoreValue(content)
        if (coreValue && (includeInactive || coreValue.is_active)) {
          coreValues.push(coreValue)
        }
      }
    }

    return coreValues.sort((a, b) => a.display_order - b.display_order)
  }

  /**
   * Récupère une valeur fondamentale par ID
   */
  async function getCoreValueById(id: string): Promise<CoreValue | null> {
    try {
      const content = await getContentById(id)
      return contentToCoreValue(content)
    }
    catch {
      return null
    }
  }

  /**
   * Crée une nouvelle valeur fondamentale
   */
  async function createCoreValue(data: CoreValueData, categoryId: string): Promise<CoreValue> {
    const key = `${CORE_VALUE_KEY_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    const response = await createContent({
      key,
      value: JSON.stringify(data),
      value_type: 'json',
      category_id: categoryId,
      description: data.title,
      admin_editable: true,
    })

    // Récupérer le contenu créé pour avoir toutes les infos
    const content = await getContentById(response.id)
    return contentToCoreValue(content)!
  }

  /**
   * Met à jour une valeur fondamentale
   */
  async function updateCoreValue(id: string, data: Partial<CoreValueData>): Promise<CoreValue> {
    // Récupérer les données actuelles
    const current = await getCoreValueById(id)
    if (!current) {
      throw new Error('Valeur non trouvée')
    }

    // Fusionner avec les nouvelles données
    const newData: CoreValueData = {
      title: data.title ?? current.title,
      description: data.description ?? current.description,
      icon: data.icon ?? current.icon,
      display_order: data.display_order ?? current.display_order,
      is_active: data.is_active ?? current.is_active,
    }

    const updated = await updateContent(id, {
      value: JSON.stringify(newData),
      description: newData.title,
    })

    return contentToCoreValue(updated)!
  }

  /**
   * Supprime une valeur fondamentale
   */
  async function deleteCoreValue(id: string): Promise<MessageResponse> {
    return deleteContent(id)
  }

  /**
   * Réordonne les valeurs fondamentales
   */
  async function reorderCoreValues(orderedIds: string[]): Promise<void> {
    // Mettre à jour chaque valeur avec son nouvel ordre
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i]
      if (!id) continue
      const current = await getCoreValueById(id)
      if (current && current.display_order !== i + 1) {
        await updateCoreValue(id, { display_order: i + 1 })
      }
    }
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Calcule les statistiques des valeurs
   */
  async function getValuesStats(): Promise<EditorialValuesStats> {
    const [sections, coreValues] = await Promise.all([
      getValueSections(),
      getCoreValues(true),
    ])

    const activeCoreValues = coreValues.filter(v => v.is_active).length

    // Trouver la dernière mise à jour
    const allDates = [
      ...sections.map(s => s.updated_at),
      ...coreValues.map(v => v.updated_at),
    ]
    const lastUpdated = allDates.length > 0
      ? allDates.reduce((latest, current) =>
          new Date(current) > new Date(latest) ? current : latest,
        )
      : null

    return {
      sections_count: sections.length,
      core_values_count: coreValues.length,
      active_core_values: activeCoreValues,
      last_updated: lastUpdated,
    }
  }

  // ============================================================================
  // HISTORY
  // ============================================================================

  /**
   * Récupère l'historique d'une section ou valeur
   */
  async function getValueHistory(contentId: string): Promise<EditorialHistoryRead[]> {
    return getContentHistory(contentId, 50)
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Vérifie si un titre de valeur est déjà utilisé
   */
  async function isCoreValueTitleTaken(title: string, excludeId?: string): Promise<boolean> {
    const coreValues = await getCoreValues(true)
    return coreValues.some(
      v => v.title.toLowerCase() === title.toLowerCase() && v.id !== excludeId,
    )
  }

  /**
   * Valide le titre d'une valeur fondamentale
   */
  function validateCoreValueTitle(title: string): boolean {
    return title.trim().length >= 2 && title.trim().length <= 50
  }

  /**
   * Valide la description d'une valeur fondamentale
   */
  function validateCoreValueDescription(description: string): boolean {
    return description.trim().length >= 10 && description.trim().length <= 500
  }

  /**
   * Vérifie si une section peut être modifiée
   */
  function canEditValueSection(section: ValueSection): boolean {
    return section.admin_editable
  }

  /**
   * Obtient le prochain ordre d'affichage pour les valeurs
   */
  async function getNextCoreValueOrder(): Promise<number> {
    const coreValues = await getCoreValues(true)
    const maxOrder = Math.max(...coreValues.map(v => v.display_order), 0)
    return maxOrder + 1
  }

  // ============================================================================
  // INTERNAL HELPERS
  // ============================================================================

  /**
   * Convertit un EditorialContent en ValueSection
   */
  function contentToValueSection(content: EditorialContentRead): ValueSection {
    const key = content.key as ValueSectionKey
    return {
      id: content.id,
      key,
      title: content.description || valueSectionLabels[key] || content.key,
      content: content.value || '',
      value_type: content.value_type,
      category_id: content.category_id,
      display_order: sectionKeys.indexOf(key) + 1,
      admin_editable: content.admin_editable,
      created_at: content.created_at,
      updated_at: content.updated_at,
    }
  }

  /**
   * Convertit un EditorialContent en CoreValue
   */
  function contentToCoreValue(content: EditorialContentRead): CoreValue | null {
    if (!content.value) return null

    try {
      const data = JSON.parse(content.value) as CoreValueData
      return {
        id: content.id,
        title: data.title,
        description: data.description,
        icon: data.icon,
        display_order: data.display_order,
        is_active: data.is_active,
        created_at: content.created_at,
        updated_at: content.updated_at,
      }
    }
    catch {
      console.error('Erreur de parsing JSON pour core value:', content.key)
      return null
    }
  }

  return {
    // Categories
    listCategoriesWithCount,
    getValuesCategory,

    // Generic contents
    listContents,
    getContentById,
    getContentByKey,
    createContent,
    updateContent,
    deleteContent,
    getContentHistory,

    // Value sections
    getValueSections,
    getValueSectionByKey,
    updateValueSection,

    // Core values
    getCoreValues,
    getCoreValueById,
    createCoreValue,
    updateCoreValue,
    deleteCoreValue,
    reorderCoreValues,

    // Statistics
    getValuesStats,

    // History
    getValueHistory,

    // Validation
    isCoreValueTitleTaken,
    validateCoreValueTitle,
    validateCoreValueDescription,
    canEditValueSection,
    getNextCoreValueOrder,

    // Labels & UI helpers
    valueSectionLabels,
    valueSectionDescriptions,
    valueSectionIcons,
    valueSectionColors,
    sectionKeys,
    coreValueAvailableIcons,

    // Structure par pages (front-office)
    frontOfficePages,
    homepageSections,
    aboutPageSections,
    strategyPageSections,
    organizationPageSections,
    teamPageSections,
    partnersPageSections,
  }
}
