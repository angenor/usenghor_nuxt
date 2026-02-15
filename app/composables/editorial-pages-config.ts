/**
 * Configuration des pages et sections du front-office pour l'éditeur éditorial
 * Définit la structure de chaque page avec ses sections et champs éditables
 */

import type { ValueSectionKey } from '~/types/api'

// ============================================================================
// TYPES
// ============================================================================

export interface PageSection {
  id: string
  name: string
  description: string
  icon: string
  color: string
  editorialKeys: ValueSectionKey[]
  fields: PageSectionField[]
}

export interface PageSectionField {
  key: string
  label: string
  description: string
  type: 'text' | 'textarea' | 'number' | 'html' | 'image' | 'file' | 'list' | 'documents' | 'countries' | 'gallery'
  i18nKey?: string
  editorialKey?: ValueSectionKey
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
// DÉFINITION DE LA PAGE D'ACCUEIL
// ============================================================================

export const homepageSections: PageSection[] = [
  {
    id: 'hero',
    name: 'Section Hero (Carrousel)',
    description: 'Bannière principale avec carrousel d\'images et textes d\'accroche. Chaque slide peut avoir 0, 1 ou 2 boutons.',
    icon: 'image',
    color: 'bg-gradient-to-r from-brand-blue-500 to-brand-red-500 text-white',
    editorialKeys: [
      'hero.slide1.title', 'hero.slide1.subtitle', 'hero.slide1.image',
      'hero.slide1.cta1.text', 'hero.slide1.cta1.link', 'hero.slide1.cta2.text', 'hero.slide1.cta2.link',
      'hero.slide2.title', 'hero.slide2.subtitle', 'hero.slide2.image',
      'hero.slide2.cta1.text', 'hero.slide2.cta1.link', 'hero.slide2.cta2.text', 'hero.slide2.cta2.link',
      'hero.slide3.title', 'hero.slide3.subtitle', 'hero.slide3.image',
      'hero.slide3.cta1.text', 'hero.slide3.cta1.link', 'hero.slide3.cta2.text', 'hero.slide3.cta2.link',
      'hero.slide4.title', 'hero.slide4.subtitle', 'hero.slide4.image',
      'hero.slide4.cta1.text', 'hero.slide4.cta1.link', 'hero.slide4.cta2.text', 'hero.slide4.cta2.link',
      'hero.cta.discover', 'hero.cta.contact',
    ],
    fields: [
      // Slide 1
      { key: 'hero.slide1.image', label: 'Slide 1 - Image', description: 'Image de fond du premier slide (ratio 16:9)', type: 'image', editorialKey: 'hero.slide1.image', editable: true },
      { key: 'hero.slide1.title', label: 'Slide 1 - Titre', description: 'Titre du premier slide', type: 'text', editorialKey: 'hero.slide1.title', editable: true },
      { key: 'hero.slide1.subtitle', label: 'Slide 1 - Sous-titre', description: 'Sous-titre du premier slide', type: 'textarea', editorialKey: 'hero.slide1.subtitle', editable: true },
      { key: 'hero.slide1.cta1.text', label: 'Slide 1 - Bouton 1 (texte)', description: 'Texte du bouton primaire (laisser vide pour masquer)', type: 'text', editorialKey: 'hero.slide1.cta1.text', editable: true },
      { key: 'hero.slide1.cta1.link', label: 'Slide 1 - Bouton 1 (lien)', description: 'URL du bouton primaire (ex: /formations)', type: 'text', editorialKey: 'hero.slide1.cta1.link', editable: true },
      { key: 'hero.slide1.cta2.text', label: 'Slide 1 - Bouton 2 (texte)', description: 'Texte du bouton secondaire (laisser vide pour masquer)', type: 'text', editorialKey: 'hero.slide1.cta2.text', editable: true },
      { key: 'hero.slide1.cta2.link', label: 'Slide 1 - Bouton 2 (lien)', description: 'URL du bouton secondaire (ex: /contact)', type: 'text', editorialKey: 'hero.slide1.cta2.link', editable: true },
      // Slide 2
      { key: 'hero.slide2.image', label: 'Slide 2 - Image', description: 'Image de fond du deuxième slide (ratio 16:9)', type: 'image', editorialKey: 'hero.slide2.image', editable: true },
      { key: 'hero.slide2.title', label: 'Slide 2 - Titre', description: 'Titre du deuxième slide', type: 'text', editorialKey: 'hero.slide2.title', editable: true },
      { key: 'hero.slide2.subtitle', label: 'Slide 2 - Sous-titre', description: 'Sous-titre du deuxième slide', type: 'textarea', editorialKey: 'hero.slide2.subtitle', editable: true },
      { key: 'hero.slide2.cta1.text', label: 'Slide 2 - Bouton 1 (texte)', description: 'Texte du bouton primaire (laisser vide pour masquer)', type: 'text', editorialKey: 'hero.slide2.cta1.text', editable: true },
      { key: 'hero.slide2.cta1.link', label: 'Slide 2 - Bouton 1 (lien)', description: 'URL du bouton primaire', type: 'text', editorialKey: 'hero.slide2.cta1.link', editable: true },
      { key: 'hero.slide2.cta2.text', label: 'Slide 2 - Bouton 2 (texte)', description: 'Texte du bouton secondaire (laisser vide pour masquer)', type: 'text', editorialKey: 'hero.slide2.cta2.text', editable: true },
      { key: 'hero.slide2.cta2.link', label: 'Slide 2 - Bouton 2 (lien)', description: 'URL du bouton secondaire', type: 'text', editorialKey: 'hero.slide2.cta2.link', editable: true },
      // Slide 3
      { key: 'hero.slide3.image', label: 'Slide 3 - Image', description: 'Image de fond du troisième slide (ratio 16:9)', type: 'image', editorialKey: 'hero.slide3.image', editable: true },
      { key: 'hero.slide3.title', label: 'Slide 3 - Titre', description: 'Titre du troisième slide', type: 'text', editorialKey: 'hero.slide3.title', editable: true },
      { key: 'hero.slide3.subtitle', label: 'Slide 3 - Sous-titre', description: 'Sous-titre du troisième slide', type: 'textarea', editorialKey: 'hero.slide3.subtitle', editable: true },
      { key: 'hero.slide3.cta1.text', label: 'Slide 3 - Bouton 1 (texte)', description: 'Texte du bouton primaire (laisser vide pour masquer)', type: 'text', editorialKey: 'hero.slide3.cta1.text', editable: true },
      { key: 'hero.slide3.cta1.link', label: 'Slide 3 - Bouton 1 (lien)', description: 'URL du bouton primaire', type: 'text', editorialKey: 'hero.slide3.cta1.link', editable: true },
      { key: 'hero.slide3.cta2.text', label: 'Slide 3 - Bouton 2 (texte)', description: 'Texte du bouton secondaire (laisser vide pour masquer)', type: 'text', editorialKey: 'hero.slide3.cta2.text', editable: true },
      { key: 'hero.slide3.cta2.link', label: 'Slide 3 - Bouton 2 (lien)', description: 'URL du bouton secondaire', type: 'text', editorialKey: 'hero.slide3.cta2.link', editable: true },
      // Slide 4
      { key: 'hero.slide4.image', label: 'Slide 4 - Image', description: 'Image de fond du quatrième slide (ratio 16:9)', type: 'image', editorialKey: 'hero.slide4.image', editable: true },
      { key: 'hero.slide4.title', label: 'Slide 4 - Titre', description: 'Titre du quatrième slide', type: 'text', editorialKey: 'hero.slide4.title', editable: true },
      { key: 'hero.slide4.subtitle', label: 'Slide 4 - Sous-titre', description: 'Sous-titre du quatrième slide', type: 'textarea', editorialKey: 'hero.slide4.subtitle', editable: true },
      { key: 'hero.slide4.cta1.text', label: 'Slide 4 - Bouton 1 (texte)', description: 'Texte du bouton primaire (laisser vide pour masquer)', type: 'text', editorialKey: 'hero.slide4.cta1.text', editable: true },
      { key: 'hero.slide4.cta1.link', label: 'Slide 4 - Bouton 1 (lien)', description: 'URL du bouton primaire', type: 'text', editorialKey: 'hero.slide4.cta1.link', editable: true },
      { key: 'hero.slide4.cta2.text', label: 'Slide 4 - Bouton 2 (texte)', description: 'Texte du bouton secondaire (laisser vide pour masquer)', type: 'text', editorialKey: 'hero.slide4.cta2.text', editable: true },
      { key: 'hero.slide4.cta2.link', label: 'Slide 4 - Bouton 2 (lien)', description: 'URL du bouton secondaire', type: 'text', editorialKey: 'hero.slide4.cta2.link', editable: true },
      // Legacy CTA buttons (rétrocompatibilité)
      { key: 'hero.cta.discover', label: 'Bouton "Découvrir" (legacy)', description: 'Texte du bouton principal - non utilisé si boutons par slide définis', type: 'text', editorialKey: 'hero.cta.discover', editable: true },
      { key: 'hero.cta.contact', label: 'Bouton "Contact" (legacy)', description: 'Texte du bouton secondaire - non utilisé si boutons par slide définis', type: 'text', editorialKey: 'hero.cta.contact', editable: true },
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
      'experience.badge', 'experience.title', 'experience.description', 'experience.cta.text', 'experience.cta.link',
      'experience.features.immersion', 'experience.features.creativity', 'experience.features.network',
      'experience.stats.countries', 'experience.stats.graduates', 'experience.stats.years',
    ],
    fields: [
      { key: 'experience.badge', label: 'Badge Expérience', description: 'Texte du badge', type: 'text', editorialKey: 'experience.badge', editable: true },
      { key: 'experience.title', label: 'Titre Expérience', description: 'Titre du bloc', type: 'text', editorialKey: 'experience.title', editable: true },
      { key: 'experience.description', label: 'Description', description: 'Texte descriptif', type: 'textarea', editorialKey: 'experience.description', editable: true },
      { key: 'experience.cta.text', label: 'Bouton CTA (libellé)', description: 'Texte du bouton « En savoir plus »', type: 'text', editorialKey: 'experience.cta.text', editable: true },
      { key: 'experience.cta.link', label: 'Bouton CTA (lien)', description: 'URL de destination du bouton', type: 'text', editorialKey: 'experience.cta.link', editable: true },
      { key: 'experience.features.immersion', label: 'Badge Immersion', description: 'Texte du badge Immersion professionnelle', type: 'text', editorialKey: 'experience.features.immersion', editable: true },
      { key: 'experience.features.creativity', label: 'Badge Créativité', description: 'Texte du badge Projets créatifs', type: 'text', editorialKey: 'experience.features.creativity', editable: true },
      { key: 'experience.features.network', label: 'Badge Réseau', description: 'Texte du badge Réseau international', type: 'text', editorialKey: 'experience.features.network', editable: true },
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
      'history.usenghor.milestone1.title', 'history.usenghor.milestone1.desc',
      'history.usenghor.milestone2.title', 'history.usenghor.milestone2.desc',
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
      { key: 'history.usenghor.milestone1.title', label: 'Jalon 1 - Titre', description: 'Titre du premier jalon (ex: Ouverture à Alexandrie)', type: 'text', editorialKey: 'history.usenghor.milestone1.title', editable: true },
      { key: 'history.usenghor.milestone1.desc', label: 'Jalon 1 - Description', description: 'Description du premier jalon', type: 'text', editorialKey: 'history.usenghor.milestone1.desc', editable: true },
      { key: 'history.usenghor.milestone2.title', label: 'Jalon 2 - Titre', description: 'Titre du second jalon (ex: Référence en formation)', type: 'text', editorialKey: 'history.usenghor.milestone2.title', editable: true },
      { key: 'history.usenghor.milestone2.desc', label: 'Jalon 2 - Description', description: 'Description du second jalon', type: 'text', editorialKey: 'history.usenghor.milestone2.desc', editable: true },
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
      'governance.badge', 'governance.title', 'governance.subtitle', 'governance.image',
      'governance.foundingTexts.badge', 'governance.foundingTexts.title', 'governance.foundingTexts.description',
      'governance.donorCountries.title', 'governance.donorCountries.description',
    ],
    fields: [
      { key: 'governance.badge', label: 'Badge', description: 'Texte du badge', type: 'text', editorialKey: 'governance.badge', editable: true },
      { key: 'governance.title', label: 'Titre', description: 'Titre principal', type: 'text', editorialKey: 'governance.title', editable: true },
      { key: 'governance.subtitle', label: 'Sous-titre', description: 'Description', type: 'textarea', editorialKey: 'governance.subtitle', editable: true },
      { key: 'governance.image', label: 'Image Gouvernance', description: 'Image illustrative de la section Textes Fondateurs (ratio 1:1)', type: 'image', editorialKey: 'governance.image', editable: true },
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
    editorialKeys: ['about.mission.title', 'about.mission.content', 'about.mission.image', 'about.mission.cta.history', 'about.mission.cta.governance'],
    fields: [
      { key: 'about.mission.image', label: 'Image Mission', description: 'Illustration de la section mission (format carré ou portrait recommandé)', type: 'image', editorialKey: 'about.mission.image', editable: true },
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
      'about.charter.title', 'about.charter.download', 'about.charter.download_url',
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
      { key: 'about.charter.download_url', label: 'Charte - Fichier', description: 'Fichier PDF de la charte éthique (upload ou URL)', type: 'file', editorialKey: 'about.charter.download_url', editable: true },
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
    editorialKeys: ['strategy.plan.title', 'strategy.plan.summary', 'strategy.plan.image', 'strategy.plan.download', 'strategy.plan.download_url'],
    fields: [
      { key: 'strategy.plan.title', label: 'Titre', description: 'Titre de la section', type: 'text', editorialKey: 'strategy.plan.title', editable: true },
      { key: 'strategy.plan.summary', label: 'Résumé', description: 'Texte de présentation du plan', type: 'html', editorialKey: 'strategy.plan.summary', editable: true },
      { key: 'strategy.plan.image', label: 'Image de couverture', description: 'Image illustrant le plan stratégique (ratio 4:3 recommandé)', type: 'image', editorialKey: 'strategy.plan.image', editable: true },
      { key: 'strategy.plan.download', label: 'Bouton téléchargement', description: 'Texte du bouton PDF', type: 'text', editorialKey: 'strategy.plan.download', editable: true },
      { key: 'strategy.plan.download_url', label: 'Fichier PDF', description: 'Fichier PDF du plan stratégique (upload ou URL)', type: 'file', editorialKey: 'strategy.plan.download_url', editable: true },
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
  {
    id: 'partners-list',
    name: 'Section Liste des Partenaires',
    description: 'Grille des partenaires institutionnels avec filtres',
    icon: 'handshake',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['partners.list.badge', 'partners.list.title', 'partners.list.subtitle'],
    fields: [
      { key: 'partners.list.badge', label: 'Badge', description: 'Texte du badge de la section', type: 'text', editorialKey: 'partners.list.badge', editable: true },
      { key: 'partners.list.title', label: 'Titre section', description: 'Titre de la section partenaires', type: 'text', editorialKey: 'partners.list.title', editable: true },
      { key: 'partners.list.subtitle', label: 'Sous-titre section', description: 'Description de la section', type: 'textarea', editorialKey: 'partners.list.subtitle', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE CARRIÈRES
// ============================================================================

export const careersPageSections: PageSection[] = [
  {
    id: 'careers-hero',
    name: 'Hero Carrières',
    description: 'Bannière principale de la page Carrières',
    icon: 'image',
    color: 'bg-gradient-to-r from-lime-500 to-lime-400 text-white',
    editorialKeys: ['careers.hero.title', 'careers.hero.subtitle'],
    fields: [
      { key: 'careers.hero.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'careers.hero.title', editable: true },
      { key: 'careers.hero.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'careers.hero.subtitle', editable: true },
    ],
  },
  {
    id: 'careers-intro',
    name: 'Section Introduction',
    description: 'Introduction avec statistiques clés',
    icon: 'info-circle',
    color: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
    editorialKeys: [
      'careers.intro.title', 'careers.intro.text',
      'careers.intro.stats.positions.label', 'careers.intro.stats.nationalities.label', 'careers.intro.stats.years.label',
    ],
    fields: [
      { key: 'careers.intro.title', label: 'Titre', description: 'Titre de la section introduction', type: 'text', editorialKey: 'careers.intro.title', editable: true },
      { key: 'careers.intro.text', label: 'Texte', description: 'Texte de présentation', type: 'textarea', editorialKey: 'careers.intro.text', editable: true },
      { key: 'careers.intro.stats.positions.label', label: 'Label Postes', description: 'Libellé pour le nombre de postes (valeur dans Chiffres clés)', type: 'text', editorialKey: 'careers.intro.stats.positions.label', editable: true },
      { key: 'careers.intro.stats.nationalities.label', label: 'Label Nationalités', description: 'Libellé pour les nationalités (valeur dans Chiffres clés)', type: 'text', editorialKey: 'careers.intro.stats.nationalities.label', editable: true },
      { key: 'careers.intro.stats.years.label', label: 'Label Années', description: 'Libellé pour les années (valeur dans Chiffres clés)', type: 'text', editorialKey: 'careers.intro.stats.years.label', editable: true },
    ],
  },
  {
    id: 'careers-opportunities',
    name: 'Section Opportunités',
    description: 'Cartes des 3 types d\'opportunités (enseignants, étudiants, partenaires)',
    icon: 'door-open',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: [
      'careers.opportunities.title', 'careers.opportunities.subtitle', 'careers.opportunities.discover',
      'careers.opportunities.teachers.title', 'careers.opportunities.teachers.description',
      'careers.opportunities.students.title', 'careers.opportunities.students.description',
      'careers.opportunities.partners.title', 'careers.opportunities.partners.description',
    ],
    fields: [
      { key: 'careers.opportunities.title', label: 'Titre', description: 'Titre de la section (ex: "Rejoignez-nous")', type: 'text', editorialKey: 'careers.opportunities.title', editable: true },
      { key: 'careers.opportunities.subtitle', label: 'Sous-titre', description: 'Sous-titre de la section', type: 'textarea', editorialKey: 'careers.opportunities.subtitle', editable: true },
      { key: 'careers.opportunities.discover', label: 'Bouton Découvrir', description: 'Texte du bouton sur chaque carte', type: 'text', editorialKey: 'careers.opportunities.discover', editable: true },
      // Carte Enseignants
      { key: 'careers.opportunities.teachers.title', label: 'Enseignants - Titre', description: 'Titre de la carte enseignants (ex: "En tant qu\'enseignant")', type: 'text', editorialKey: 'careers.opportunities.teachers.title', editable: true },
      { key: 'careers.opportunities.teachers.description', label: 'Enseignants - Description', description: 'Description de la carte enseignants', type: 'textarea', editorialKey: 'careers.opportunities.teachers.description', editable: true },
      // Carte Étudiants
      { key: 'careers.opportunities.students.title', label: 'Étudiants - Titre', description: 'Titre de la carte étudiants (ex: "En tant qu\'étudiant")', type: 'text', editorialKey: 'careers.opportunities.students.title', editable: true },
      { key: 'careers.opportunities.students.description', label: 'Étudiants - Description', description: 'Description de la carte étudiants', type: 'textarea', editorialKey: 'careers.opportunities.students.description', editable: true },
      // Carte Partenaires
      { key: 'careers.opportunities.partners.title', label: 'Partenaires - Titre', description: 'Titre de la carte partenaires (ex: "En tant que partenaire")', type: 'text', editorialKey: 'careers.opportunities.partners.title', editable: true },
      { key: 'careers.opportunities.partners.description', label: 'Partenaires - Description', description: 'Description de la carte partenaires', type: 'textarea', editorialKey: 'careers.opportunities.partners.description', editable: true },
    ],
  },
  {
    id: 'careers-teachers',
    name: 'Section Enseignants',
    description: 'Opportunités pour les enseignants et chercheurs',
    icon: 'chalkboard-user',
    color: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
    editorialKeys: [
      'careers.teachers.title', 'careers.teachers.text',
      'careers.teachers.benefits.title',
      'careers.teachers.benefits.item1.icon', 'careers.teachers.benefits.item1.title', 'careers.teachers.benefits.item1.text',
      'careers.teachers.benefits.item2.icon', 'careers.teachers.benefits.item2.title', 'careers.teachers.benefits.item2.text',
      'careers.teachers.benefits.item3.icon', 'careers.teachers.benefits.item3.title', 'careers.teachers.benefits.item3.text',
      'careers.teachers.benefits.item4.icon', 'careers.teachers.benefits.item4.title', 'careers.teachers.benefits.item4.text',
      'careers.teachers.positions.title',
      'careers.teachers.positions.item1.title', 'careers.teachers.positions.item1.text',
      'careers.teachers.positions.item2.title', 'careers.teachers.positions.item2.text',
      'careers.teachers.positions.item3.title', 'careers.teachers.positions.item3.text',
      'careers.teachers.cta.title', 'careers.teachers.cta.text', 'careers.teachers.cta.email', 'careers.teachers.cta.button',
      'careers.teachers.image',
    ],
    fields: [
      { key: 'careers.teachers.image', label: 'Image', description: 'Image illustrant la section enseignants (ratio 4:3 recommandé)', type: 'image', editorialKey: 'careers.teachers.image', editable: true },
      { key: 'careers.teachers.title', label: 'Titre', description: 'Titre de la section enseignants', type: 'text', editorialKey: 'careers.teachers.title', editable: true },
      { key: 'careers.teachers.text', label: 'Texte', description: 'Texte de présentation', type: 'textarea', editorialKey: 'careers.teachers.text', editable: true },
      { key: 'careers.teachers.benefits.title', label: 'Titre Avantages', description: 'Titre de la sous-section "Pourquoi nous rejoindre ?"', type: 'text', editorialKey: 'careers.teachers.benefits.title', editable: true },
      // Avantage 1
      { key: 'careers.teachers.benefits.item1.icon', label: 'Avantage 1 - Icône', description: 'Icône FontAwesome (ex: fa-solid fa-globe-africa)', type: 'text', editorialKey: 'careers.teachers.benefits.item1.icon', editable: true },
      { key: 'careers.teachers.benefits.item1.title', label: 'Avantage 1 - Titre', description: 'Titre du premier avantage', type: 'text', editorialKey: 'careers.teachers.benefits.item1.title', editable: true },
      { key: 'careers.teachers.benefits.item1.text', label: 'Avantage 1 - Texte', description: 'Description du premier avantage', type: 'textarea', editorialKey: 'careers.teachers.benefits.item1.text', editable: true },
      // Avantage 2
      { key: 'careers.teachers.benefits.item2.icon', label: 'Avantage 2 - Icône', description: 'Icône FontAwesome (ex: fa-solid fa-network-wired)', type: 'text', editorialKey: 'careers.teachers.benefits.item2.icon', editable: true },
      { key: 'careers.teachers.benefits.item2.title', label: 'Avantage 2 - Titre', description: 'Titre du deuxième avantage', type: 'text', editorialKey: 'careers.teachers.benefits.item2.title', editable: true },
      { key: 'careers.teachers.benefits.item2.text', label: 'Avantage 2 - Texte', description: 'Description du deuxième avantage', type: 'textarea', editorialKey: 'careers.teachers.benefits.item2.text', editable: true },
      // Avantage 3
      { key: 'careers.teachers.benefits.item3.icon', label: 'Avantage 3 - Icône', description: 'Icône FontAwesome (ex: fa-solid fa-lightbulb)', type: 'text', editorialKey: 'careers.teachers.benefits.item3.icon', editable: true },
      { key: 'careers.teachers.benefits.item3.title', label: 'Avantage 3 - Titre', description: 'Titre du troisième avantage', type: 'text', editorialKey: 'careers.teachers.benefits.item3.title', editable: true },
      { key: 'careers.teachers.benefits.item3.text', label: 'Avantage 3 - Texte', description: 'Description du troisième avantage', type: 'textarea', editorialKey: 'careers.teachers.benefits.item3.text', editable: true },
      // Avantage 4
      { key: 'careers.teachers.benefits.item4.icon', label: 'Avantage 4 - Icône', description: 'Icône FontAwesome (ex: fa-solid fa-sun)', type: 'text', editorialKey: 'careers.teachers.benefits.item4.icon', editable: true },
      { key: 'careers.teachers.benefits.item4.title', label: 'Avantage 4 - Titre', description: 'Titre du quatrième avantage', type: 'text', editorialKey: 'careers.teachers.benefits.item4.title', editable: true },
      { key: 'careers.teachers.benefits.item4.text', label: 'Avantage 4 - Texte', description: 'Description du quatrième avantage', type: 'textarea', editorialKey: 'careers.teachers.benefits.item4.text', editable: true },
      { key: 'careers.teachers.positions.title', label: 'Titre Postes', description: 'Titre de la sous-section types de postes', type: 'text', editorialKey: 'careers.teachers.positions.title', editable: true },
      // Poste 1
      { key: 'careers.teachers.positions.item1.title', label: 'Poste 1 - Titre', description: 'Titre du premier type de poste', type: 'text', editorialKey: 'careers.teachers.positions.item1.title', editable: true },
      { key: 'careers.teachers.positions.item1.text', label: 'Poste 1 - Texte', description: 'Description du premier type de poste', type: 'textarea', editorialKey: 'careers.teachers.positions.item1.text', editable: true },
      // Poste 2
      { key: 'careers.teachers.positions.item2.title', label: 'Poste 2 - Titre', description: 'Titre du deuxième type de poste', type: 'text', editorialKey: 'careers.teachers.positions.item2.title', editable: true },
      { key: 'careers.teachers.positions.item2.text', label: 'Poste 2 - Texte', description: 'Description du deuxième type de poste', type: 'textarea', editorialKey: 'careers.teachers.positions.item2.text', editable: true },
      // Poste 3
      { key: 'careers.teachers.positions.item3.title', label: 'Poste 3 - Titre', description: 'Titre du troisième type de poste', type: 'text', editorialKey: 'careers.teachers.positions.item3.title', editable: true },
      { key: 'careers.teachers.positions.item3.text', label: 'Poste 3 - Texte', description: 'Description du troisième type de poste', type: 'textarea', editorialKey: 'careers.teachers.positions.item3.text', editable: true },
      { key: 'careers.teachers.cta.title', label: 'CTA - Titre', description: 'Titre du bloc appel à l\'action', type: 'text', editorialKey: 'careers.teachers.cta.title', editable: true },
      { key: 'careers.teachers.cta.text', label: 'CTA - Texte', description: 'Texte d\'accompagnement', type: 'textarea', editorialKey: 'careers.teachers.cta.text', editable: true },
      { key: 'careers.teachers.cta.email', label: 'CTA - Email', description: 'Adresse email de contact', type: 'text', editorialKey: 'careers.teachers.cta.email', editable: true },
      { key: 'careers.teachers.cta.button', label: 'CTA - Bouton', description: 'Texte du bouton', type: 'text', editorialKey: 'careers.teachers.cta.button', editable: true },
    ],
  },
  {
    id: 'careers-students',
    name: 'Section Étudiants',
    description: 'Opportunités pour les futurs étudiants',
    icon: 'graduation-cap',
    color: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
    editorialKeys: [
      'careers.students.title', 'careers.students.text',
      'careers.students.why.title', 'careers.students.programs.title',
      'careers.students.cta.title', 'careers.students.cta.text', 'careers.students.cta.button',
      'careers.students.image',
    ],
    fields: [
      { key: 'careers.students.image', label: 'Image', description: 'Image illustrant la section futurs étudiants (ratio 4:3 recommandé)', type: 'image', editorialKey: 'careers.students.image', editable: true },
      { key: 'careers.students.title', label: 'Titre', description: 'Titre de la section étudiants', type: 'text', editorialKey: 'careers.students.title', editable: true },
      { key: 'careers.students.text', label: 'Texte', description: 'Texte de présentation', type: 'textarea', editorialKey: 'careers.students.text', editable: true },
      { key: 'careers.students.why.title', label: 'Titre "Pourquoi nous"', description: 'Titre de la sous-section pourquoi étudier chez nous', type: 'text', editorialKey: 'careers.students.why.title', editable: true },
      { key: 'careers.students.programs.title', label: 'Titre Programmes', description: 'Titre de la sous-section programmes', type: 'text', editorialKey: 'careers.students.programs.title', editable: true },
      { key: 'careers.students.cta.title', label: 'CTA - Titre', description: 'Titre du bloc appel à l\'action', type: 'text', editorialKey: 'careers.students.cta.title', editable: true },
      { key: 'careers.students.cta.text', label: 'CTA - Texte', description: 'Texte d\'accompagnement', type: 'textarea', editorialKey: 'careers.students.cta.text', editable: true },
      { key: 'careers.students.cta.button', label: 'CTA - Bouton', description: 'Texte du bouton inscription', type: 'text', editorialKey: 'careers.students.cta.button', editable: true },
    ],
  },
  {
    id: 'careers-partners',
    name: 'Section Partenaires (Carrières)',
    description: 'Opportunités de partenariat et formulaire de contact',
    icon: 'handshake',
    color: 'bg-brand-red-100 text-brand-red-800 dark:bg-brand-red-900/30 dark:text-brand-red-300',
    editorialKeys: [
      'careers.partners.title', 'careers.partners.text',
      'careers.partners.types.title', 'careers.partners.form.title', 'careers.partners.form.text',
    ],
    fields: [
      { key: 'careers.partners.title', label: 'Titre', description: 'Titre de la section partenaires', type: 'text', editorialKey: 'careers.partners.title', editable: true },
      { key: 'careers.partners.text', label: 'Texte', description: 'Texte de présentation', type: 'textarea', editorialKey: 'careers.partners.text', editable: true },
      { key: 'careers.partners.types.title', label: 'Titre Types', description: 'Titre de la sous-section types de partenariats', type: 'text', editorialKey: 'careers.partners.types.title', editable: true },
      { key: 'careers.partners.form.title', label: 'Formulaire - Titre', description: 'Titre du formulaire de contact', type: 'text', editorialKey: 'careers.partners.form.title', editable: true },
      { key: 'careers.partners.form.text', label: 'Formulaire - Texte', description: 'Texte d\'accompagnement du formulaire', type: 'textarea', editorialKey: 'careers.partners.form.text', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE PROJETS
// ============================================================================

export const projectsPageSections: PageSection[] = [
  {
    id: 'projects-hero',
    name: 'Hero Projets',
    description: 'Bannière principale de la page Projets',
    icon: 'image',
    color: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white',
    editorialKeys: ['projects.hero.badge', 'projects.hero.title', 'projects.hero.subtitle'],
    fields: [
      { key: 'projects.hero.badge', label: 'Badge', description: 'Texte du badge au-dessus du titre', type: 'text', editorialKey: 'projects.hero.badge', editable: true },
      { key: 'projects.hero.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'projects.hero.title', editable: true },
      { key: 'projects.hero.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'projects.hero.subtitle', editable: true },
    ],
  },
  {
    id: 'projects-intro',
    name: 'Section Introduction',
    description: 'Introduction avec statistiques clés',
    icon: 'info-circle',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: [
      'projects.intro.title', 'projects.intro.description',
      'projects.intro.stats.projects.label', 'projects.intro.stats.countries.label', 'projects.intro.stats.beneficiaries.label',
    ],
    fields: [
      { key: 'projects.intro.title', label: 'Titre', description: 'Titre de la section introduction', type: 'text', editorialKey: 'projects.intro.title', editable: true },
      { key: 'projects.intro.description', label: 'Description', description: 'Texte de présentation', type: 'textarea', editorialKey: 'projects.intro.description', editable: true },
      { key: 'projects.intro.stats.projects.label', label: 'Label Projets', description: 'Libellé pour le nombre de projets (valeur dynamique)', type: 'text', editorialKey: 'projects.intro.stats.projects.label', editable: true },
      { key: 'projects.intro.stats.countries.label', label: 'Label Pays', description: 'Libellé pour les pays (valeur dans Chiffres clés)', type: 'text', editorialKey: 'projects.intro.stats.countries.label', editable: true },
      { key: 'projects.intro.stats.beneficiaries.label', label: 'Label Bénéficiaires', description: 'Libellé pour les bénéficiaires (valeur dans Chiffres clés)', type: 'text', editorialKey: 'projects.intro.stats.beneficiaries.label', editable: true },
    ],
  },
  {
    id: 'projects-featured',
    name: 'Section Projets à la une',
    description: 'Projets phares mis en avant',
    icon: 'star',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    editorialKeys: ['projects.featured.title', 'projects.featured.badge'],
    fields: [
      { key: 'projects.featured.title', label: 'Titre', description: 'Titre de la section projets à la une', type: 'text', editorialKey: 'projects.featured.title', editable: true },
      { key: 'projects.featured.badge', label: 'Badge', description: 'Badge à côté du titre', type: 'text', editorialKey: 'projects.featured.badge', editable: true },
    ],
  },
  {
    id: 'projects-list',
    name: 'Section Liste des projets',
    description: 'Grille des projets avec filtres par catégorie et statut',
    icon: 'th-large',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['projects.list.title'],
    fields: [
      { key: 'projects.list.title', label: 'Titre', description: 'Titre de la section liste', type: 'text', editorialKey: 'projects.list.title', editable: true },
    ],
  },
  {
    id: 'projects-cta',
    name: 'Section CTA',
    description: 'Appel à l\'action pour contacter l\'université',
    icon: 'bullhorn',
    color: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
    editorialKeys: ['projects.cta.title', 'projects.cta.description', 'projects.cta.button'],
    fields: [
      { key: 'projects.cta.title', label: 'Titre', description: 'Titre du bloc CTA', type: 'text', editorialKey: 'projects.cta.title', editable: true },
      { key: 'projects.cta.description', label: 'Description', description: 'Texte d\'accompagnement', type: 'textarea', editorialKey: 'projects.cta.description', editable: true },
      { key: 'projects.cta.button', label: 'Bouton', description: 'Texte du bouton', type: 'text', editorialKey: 'projects.cta.button', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE ALUMNI
// ============================================================================

export const alumniPageSections: PageSection[] = [
  {
    id: 'alumni-hero',
    name: 'Hero Alumni',
    description: 'Bannière principale de la page Alumni',
    icon: 'image',
    color: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white',
    editorialKeys: ['alumni.hero.badge', 'alumni.hero.title', 'alumni.hero.subtitle'],
    fields: [
      { key: 'alumni.hero.badge', label: 'Badge', description: 'Texte du badge au-dessus du titre', type: 'text', editorialKey: 'alumni.hero.badge', editable: true },
      { key: 'alumni.hero.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'alumni.hero.title', editable: true },
      { key: 'alumni.hero.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'alumni.hero.subtitle', editable: true },
    ],
  },
  {
    id: 'alumni-stats',
    name: 'Section Statistiques',
    description: 'Titre et libellés des statistiques (les valeurs numériques sont dans Chiffres clés)',
    icon: 'chart-bar',
    color: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
    editorialKeys: [
      'alumni.stats.title',
      'alumni.stats.alumni.label', 'alumni.stats.countries.label',
      'alumni.stats.sectors.label', 'alumni.stats.promotions.label',
    ],
    fields: [
      { key: 'alumni.stats.title', label: 'Titre', description: 'Titre de la section statistiques', type: 'text', editorialKey: 'alumni.stats.title', editable: true },
      { key: 'alumni.stats.alumni.label', label: 'Label Diplômés', description: 'Libellé pour le nombre de diplômés (valeur dans Chiffres clés)', type: 'text', editorialKey: 'alumni.stats.alumni.label', editable: true },
      { key: 'alumni.stats.countries.label', label: 'Label Pays', description: 'Libellé pour le nombre de pays (valeur dans Chiffres clés)', type: 'text', editorialKey: 'alumni.stats.countries.label', editable: true },
      { key: 'alumni.stats.sectors.label', label: 'Label Secteurs', description: 'Libellé pour le nombre de secteurs (valeur dans Chiffres clés)', type: 'text', editorialKey: 'alumni.stats.sectors.label', editable: true },
      { key: 'alumni.stats.promotions.label', label: 'Label Promotions', description: 'Libellé pour le nombre de promotions (valeur dans Chiffres clés)', type: 'text', editorialKey: 'alumni.stats.promotions.label', editable: true },
    ],
  },
  {
    id: 'alumni-testimonials',
    name: 'Section Témoignages',
    description: 'Histoires de réussite des anciens diplômés (les témoignages viennent de la BDD)',
    icon: 'quote-left',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    editorialKeys: ['alumni.testimonials.title', 'alumni.testimonials.subtitle'],
    fields: [
      { key: 'alumni.testimonials.title', label: 'Titre', description: 'Titre de la section témoignages', type: 'text', editorialKey: 'alumni.testimonials.title', editable: true },
      { key: 'alumni.testimonials.subtitle', label: 'Sous-titre', description: 'Sous-titre de la section', type: 'textarea', editorialKey: 'alumni.testimonials.subtitle', editable: true },
    ],
  },
  {
    id: 'alumni-list',
    name: 'Section Liste Alumni',
    description: 'Grille des anciens diplômés avec filtres (les données viennent de la BDD)',
    icon: 'users',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['alumni.list.title'],
    fields: [
      { key: 'alumni.list.title', label: 'Titre', description: 'Titre de la section liste', type: 'text', editorialKey: 'alumni.list.title', editable: true },
    ],
  },
  {
    id: 'alumni-cta',
    name: 'Section CTA',
    description: 'Appel à l\'action pour rejoindre le réseau alumni',
    icon: 'bullhorn',
    color: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
    editorialKeys: ['alumni.cta.title', 'alumni.cta.description', 'alumni.cta.button'],
    fields: [
      { key: 'alumni.cta.title', label: 'Titre', description: 'Titre du bloc CTA', type: 'text', editorialKey: 'alumni.cta.title', editable: true },
      { key: 'alumni.cta.description', label: 'Description', description: 'Texte d\'accompagnement', type: 'textarea', editorialKey: 'alumni.cta.description', editable: true },
      { key: 'alumni.cta.button', label: 'Bouton', description: 'Texte du bouton', type: 'text', editorialKey: 'alumni.cta.button', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE SITE (CAMPUS)
// ============================================================================

export const sitePageSections: PageSection[] = [
  {
    id: 'site-hero',
    name: 'Hero Site',
    description: 'Bannière principale de la page Site/Campus',
    icon: 'image',
    color: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white',
    editorialKeys: ['site.hero.badge', 'site.hero.title', 'site.hero.subtitle'],
    fields: [
      { key: 'site.hero.badge', label: 'Badge', description: 'Texte du badge au-dessus du titre', type: 'text', editorialKey: 'site.hero.badge', editable: true },
      { key: 'site.hero.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'site.hero.title', editable: true },
      { key: 'site.hero.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'site.hero.subtitle', editable: true },
    ],
  },
  {
    id: 'site-presentation',
    name: 'Section Présentation',
    description: 'Présentation du campus avec statistiques (les valeurs numériques sont dans Chiffres clés)',
    icon: 'building',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: [
      'site.presentation.title', 'site.presentation.description', 'site.presentation.address',
      'site.presentation.stats.surface.label', 'site.presentation.stats.rooms.label',
      'site.presentation.stats.capacity.label', 'site.presentation.stats.founded.label',
    ],
    fields: [
      { key: 'site.presentation.title', label: 'Titre', description: 'Titre de la section présentation', type: 'text', editorialKey: 'site.presentation.title', editable: true },
      { key: 'site.presentation.description', label: 'Description', description: 'Texte de présentation du campus', type: 'textarea', editorialKey: 'site.presentation.description', editable: true },
      { key: 'site.presentation.address', label: 'Adresse courte', description: 'Adresse affichée dans la section présentation', type: 'text', editorialKey: 'site.presentation.address', editable: true },
      { key: 'site.presentation.stats.surface.label', label: 'Label Surface', description: 'Libellé pour la surface (valeur dans Chiffres clés)', type: 'text', editorialKey: 'site.presentation.stats.surface.label', editable: true },
      { key: 'site.presentation.stats.rooms.label', label: 'Label Salles', description: 'Libellé pour le nombre de salles (valeur dans Chiffres clés)', type: 'text', editorialKey: 'site.presentation.stats.rooms.label', editable: true },
      { key: 'site.presentation.stats.capacity.label', label: 'Label Capacité', description: 'Libellé pour la capacité (valeur dans Chiffres clés)', type: 'text', editorialKey: 'site.presentation.stats.capacity.label', editable: true },
      { key: 'site.presentation.stats.founded.label', label: 'Label Fondation', description: 'Libellé pour l\'année de fondation (valeur dans Chiffres clés)', type: 'text', editorialKey: 'site.presentation.stats.founded.label', editable: true },
    ],
  },
  {
    id: 'site-facilities',
    name: 'Section Infrastructures (Titres)',
    description: 'Titre et sous-titre de la section infrastructures',
    icon: 'warehouse',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    editorialKeys: ['site.facilities.title', 'site.facilities.subtitle', 'site.facilities.capacity'],
    fields: [
      { key: 'site.facilities.title', label: 'Titre', description: 'Titre de la section infrastructures', type: 'text', editorialKey: 'site.facilities.title', editable: true },
      { key: 'site.facilities.subtitle', label: 'Sous-titre', description: 'Sous-titre de la section', type: 'textarea', editorialKey: 'site.facilities.subtitle', editable: true },
      { key: 'site.facilities.capacity', label: 'Label Capacité', description: 'Libellé pour la capacité des infrastructures', type: 'text', editorialKey: 'site.facilities.capacity', editable: true },
    ],
  },
  {
    id: 'site-facility-housing',
    name: 'Installation: Hébergement',
    description: 'Cité universitaire et résidences étudiantes',
    icon: 'home',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    editorialKeys: ['site.facility.housing.name', 'site.facility.housing.description', 'site.facility.housing.features', 'site.facility.housing.capacity', 'site.facility.housing.images'],
    fields: [
      { key: 'site.facility.housing.name', label: 'Nom', description: 'Nom de l\'installation (ex: Hébergement)', type: 'text', editorialKey: 'site.facility.housing.name', editable: true },
      { key: 'site.facility.housing.description', label: 'Description', description: 'Description détaillée de l\'hébergement', type: 'textarea', editorialKey: 'site.facility.housing.description', editable: true },
      { key: 'site.facility.housing.features', label: 'Caractéristiques', description: 'Liste des caractéristiques (une par ligne)', type: 'list', editorialKey: 'site.facility.housing.features', editable: true },
      { key: 'site.facility.housing.capacity', label: 'Capacité', description: 'Capacité d\'accueil (ex: 200 chambres)', type: 'text', editorialKey: 'site.facility.housing.capacity', editable: true },
      { key: 'site.facility.housing.images', label: 'Images', description: 'Galerie d\'images de l\'installation (format 4:3 recommandé)', type: 'gallery', editorialKey: 'site.facility.housing.images', editable: true },
    ],
  },
  {
    id: 'site-facility-library',
    name: 'Installation: Bibliothèque',
    description: 'Centre de ressources documentaires',
    icon: 'book',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: ['site.facility.library.name', 'site.facility.library.description', 'site.facility.library.features', 'site.facility.library.capacity', 'site.facility.library.images'],
    fields: [
      { key: 'site.facility.library.name', label: 'Nom', description: 'Nom de l\'installation (ex: Bibliothèque)', type: 'text', editorialKey: 'site.facility.library.name', editable: true },
      { key: 'site.facility.library.description', label: 'Description', description: 'Description détaillée de la bibliothèque', type: 'textarea', editorialKey: 'site.facility.library.description', editable: true },
      { key: 'site.facility.library.features', label: 'Caractéristiques', description: 'Liste des caractéristiques (une par ligne)', type: 'list', editorialKey: 'site.facility.library.features', editable: true },
      { key: 'site.facility.library.capacity', label: 'Capacité', description: 'Capacité d\'accueil (ex: 150 places assises)', type: 'text', editorialKey: 'site.facility.library.capacity', editable: true },
      { key: 'site.facility.library.images', label: 'Images', description: 'Galerie d\'images de l\'installation (format 4:3 recommandé)', type: 'gallery', editorialKey: 'site.facility.library.images', editable: true },
    ],
  },
  {
    id: 'site-facility-conference',
    name: 'Installation: Salles de Conférence',
    description: 'Espaces événementiels et amphithéâtres',
    icon: 'microphone',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    editorialKeys: ['site.facility.conference.name', 'site.facility.conference.description', 'site.facility.conference.features', 'site.facility.conference.capacity', 'site.facility.conference.images'],
    fields: [
      { key: 'site.facility.conference.name', label: 'Nom', description: 'Nom de l\'installation (ex: Salles de Conférence)', type: 'text', editorialKey: 'site.facility.conference.name', editable: true },
      { key: 'site.facility.conference.description', label: 'Description', description: 'Description détaillée des salles de conférence', type: 'textarea', editorialKey: 'site.facility.conference.description', editable: true },
      { key: 'site.facility.conference.features', label: 'Caractéristiques', description: 'Liste des caractéristiques (une par ligne)', type: 'list', editorialKey: 'site.facility.conference.features', editable: true },
      { key: 'site.facility.conference.capacity', label: 'Capacité', description: 'Capacité totale (ex: 500 places)', type: 'text', editorialKey: 'site.facility.conference.capacity', editable: true },
      { key: 'site.facility.conference.images', label: 'Images', description: 'Galerie d\'images de l\'installation (format 4:3 recommandé)', type: 'gallery', editorialKey: 'site.facility.conference.images', editable: true },
    ],
  },
  {
    id: 'site-facility-academic',
    name: 'Installation: Espaces Académiques',
    description: 'Salles de cours et laboratoires',
    icon: 'chalkboard',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    editorialKeys: ['site.facility.academic.name', 'site.facility.academic.description', 'site.facility.academic.features', 'site.facility.academic.capacity', 'site.facility.academic.images'],
    fields: [
      { key: 'site.facility.academic.name', label: 'Nom', description: 'Nom de l\'installation (ex: Espaces Académiques)', type: 'text', editorialKey: 'site.facility.academic.name', editable: true },
      { key: 'site.facility.academic.description', label: 'Description', description: 'Description détaillée des espaces académiques', type: 'textarea', editorialKey: 'site.facility.academic.description', editable: true },
      { key: 'site.facility.academic.features', label: 'Caractéristiques', description: 'Liste des caractéristiques (une par ligne)', type: 'list', editorialKey: 'site.facility.academic.features', editable: true },
      { key: 'site.facility.academic.capacity', label: 'Capacité', description: 'Capacité totale (ex: 600 étudiants)', type: 'text', editorialKey: 'site.facility.academic.capacity', editable: true },
      { key: 'site.facility.academic.images', label: 'Images', description: 'Galerie d\'images de l\'installation (format 4:3 recommandé)', type: 'gallery', editorialKey: 'site.facility.academic.images', editable: true },
    ],
  },
  {
    id: 'site-facility-sports',
    name: 'Installation: Installations Sportives',
    description: 'Équipements sportifs du campus',
    icon: 'futbol',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['site.facility.sports.name', 'site.facility.sports.description', 'site.facility.sports.features', 'site.facility.sports.images'],
    fields: [
      { key: 'site.facility.sports.name', label: 'Nom', description: 'Nom de l\'installation (ex: Installations Sportives)', type: 'text', editorialKey: 'site.facility.sports.name', editable: true },
      { key: 'site.facility.sports.description', label: 'Description', description: 'Description détaillée des installations sportives', type: 'textarea', editorialKey: 'site.facility.sports.description', editable: true },
      { key: 'site.facility.sports.features', label: 'Caractéristiques', description: 'Liste des caractéristiques (une par ligne)', type: 'list', editorialKey: 'site.facility.sports.features', editable: true },
      { key: 'site.facility.sports.images', label: 'Images', description: 'Galerie d\'images de l\'installation (format 4:3 recommandé)', type: 'gallery', editorialKey: 'site.facility.sports.images', editable: true },
    ],
  },
  {
    id: 'site-facility-pool',
    name: 'Installation: Piscine',
    description: 'Piscine semi-olympique du campus',
    icon: 'water-ladder',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    editorialKeys: ['site.facility.pool.name', 'site.facility.pool.description', 'site.facility.pool.features', 'site.facility.pool.capacity', 'site.facility.pool.images'],
    fields: [
      { key: 'site.facility.pool.name', label: 'Nom', description: 'Nom de l\'installation (ex: Piscine)', type: 'text', editorialKey: 'site.facility.pool.name', editable: true },
      { key: 'site.facility.pool.description', label: 'Description', description: 'Description détaillée de la piscine', type: 'textarea', editorialKey: 'site.facility.pool.description', editable: true },
      { key: 'site.facility.pool.features', label: 'Caractéristiques', description: 'Liste des caractéristiques (une par ligne)', type: 'list', editorialKey: 'site.facility.pool.features', editable: true },
      { key: 'site.facility.pool.capacity', label: 'Capacité', description: 'Capacité d\'accueil (ex: 50 nageurs)', type: 'text', editorialKey: 'site.facility.pool.capacity', editable: true },
      { key: 'site.facility.pool.images', label: 'Images', description: 'Galerie d\'images de l\'installation (format 4:3 recommandé)', type: 'gallery', editorialKey: 'site.facility.pool.images', editable: true },
    ],
  },
  {
    id: 'site-facility-hotel',
    name: 'Installation: Hôtel',
    description: 'Hébergement pour visiteurs et partenaires',
    icon: 'hotel',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    editorialKeys: ['site.facility.hotel.name', 'site.facility.hotel.description', 'site.facility.hotel.features', 'site.facility.hotel.capacity', 'site.facility.hotel.images'],
    fields: [
      { key: 'site.facility.hotel.name', label: 'Nom', description: 'Nom de l\'installation (ex: Hôtel)', type: 'text', editorialKey: 'site.facility.hotel.name', editable: true },
      { key: 'site.facility.hotel.description', label: 'Description', description: 'Description détaillée de l\'hôtel', type: 'textarea', editorialKey: 'site.facility.hotel.description', editable: true },
      { key: 'site.facility.hotel.features', label: 'Caractéristiques', description: 'Liste des caractéristiques (une par ligne)', type: 'list', editorialKey: 'site.facility.hotel.features', editable: true },
      { key: 'site.facility.hotel.capacity', label: 'Capacité', description: 'Capacité d\'accueil (ex: 30 chambres)', type: 'text', editorialKey: 'site.facility.hotel.capacity', editable: true },
      { key: 'site.facility.hotel.images', label: 'Images', description: 'Galerie d\'images de l\'installation (format 4:3 recommandé)', type: 'gallery', editorialKey: 'site.facility.hotel.images', editable: true },
    ],
  },
  // NOTE: La section Localisation utilise les données centralisées de Contact (/admin/editorial/contact)
  {
    id: 'site-cta',
    name: 'Section CTA',
    description: 'Appel à l\'action pour visiter ou contacter le campus',
    icon: 'bullhorn',
    color: 'bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900/30 dark:text-brand-blue-300',
    editorialKeys: ['site.cta.title', 'site.cta.description', 'site.cta.contactButton'],
    fields: [
      { key: 'site.cta.title', label: 'Titre', description: 'Titre du bloc CTA', type: 'text', editorialKey: 'site.cta.title', editable: true },
      { key: 'site.cta.description', label: 'Description', description: 'Texte d\'accompagnement', type: 'textarea', editorialKey: 'site.cta.description', editable: true },
      { key: 'site.cta.contactButton', label: 'Bouton Contact', description: 'Texte du bouton contact', type: 'text', editorialKey: 'site.cta.contactButton', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE HISTOIRE
// ============================================================================

export const historyPageSections: PageSection[] = [
  {
    id: 'historypage-hero',
    name: 'Hero & Introduction',
    description: 'Bannière et introduction de la page Histoire',
    icon: 'landmark',
    color: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
    editorialKeys: ['history.badge', 'history.title', 'history.subtitle', 'history.genesis.point1'],
    fields: [
      { key: 'history.badge', label: 'Badge', description: 'Badge affiché dans le hero (ex: Notre Histoire)', type: 'text', editorialKey: 'history.badge', editable: true },
      { key: 'history.title', label: 'Titre', description: 'Titre principal de la page', type: 'text', editorialKey: 'history.title', editable: true },
      { key: 'history.subtitle', label: 'Sous-titre', description: 'Description dans le hero et introduction', type: 'textarea', editorialKey: 'history.subtitle', editable: true },
      { key: 'history.genesis.point1', label: 'Texte d\'introduction', description: 'Paragraphe d\'introduction sous le titre', type: 'textarea', editorialKey: 'history.genesis.point1', editable: true },
    ],
  },
  {
    id: 'historypage-timeline-1989',
    name: 'Timeline - 1989',
    description: 'Création de l\'Université',
    icon: 'calendar',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    editorialKeys: ['history.timeline.1989.title', 'history.timeline.1989.description', 'history.timeline.1989.phase', 'history.timeline.1989.image1', 'history.timeline.1989.image2', 'history.timeline.1989.image3'],
    fields: [
      { key: 'history.timeline.1989.title', label: 'Titre', description: 'Titre de l\'événement 1989', type: 'text', editorialKey: 'history.timeline.1989.title', editable: true },
      { key: 'history.timeline.1989.description', label: 'Description', description: 'Description de l\'événement', type: 'textarea', editorialKey: 'history.timeline.1989.description', editable: true },
      { key: 'history.timeline.1989.phase', label: 'Phase', description: 'Phase historique (ex: Fondation)', type: 'text', editorialKey: 'history.timeline.1989.phase', editable: true },
      { key: 'history.timeline.1989.image1', label: 'Image 1', description: 'Première image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.1989.image1', editable: true },
      { key: 'history.timeline.1989.image2', label: 'Image 2', description: 'Deuxième image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.1989.image2', editable: true },
      { key: 'history.timeline.1989.image3', label: 'Image 3', description: 'Troisième image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.1989.image3', editable: true },
    ],
  },
  {
    id: 'historypage-timeline-2002',
    name: 'Timeline - 2002',
    description: 'Nouvelle direction',
    icon: 'calendar',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['history.timeline.2002.title', 'history.timeline.2002.description', 'history.timeline.2002.phase', 'history.timeline.2002.image1', 'history.timeline.2002.image2', 'history.timeline.2002.image3'],
    fields: [
      { key: 'history.timeline.2002.title', label: 'Titre', description: 'Titre de l\'événement 2002', type: 'text', editorialKey: 'history.timeline.2002.title', editable: true },
      { key: 'history.timeline.2002.description', label: 'Description', description: 'Description de l\'événement', type: 'textarea', editorialKey: 'history.timeline.2002.description', editable: true },
      { key: 'history.timeline.2002.phase', label: 'Phase', description: 'Phase historique (ex: Développement)', type: 'text', editorialKey: 'history.timeline.2002.phase', editable: true },
      { key: 'history.timeline.2002.image1', label: 'Image 1', description: 'Première image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.2002.image1', editable: true },
      { key: 'history.timeline.2002.image2', label: 'Image 2', description: 'Deuxième image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.2002.image2', editable: true },
      { key: 'history.timeline.2002.image3', label: 'Image 3', description: 'Troisième image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.2002.image3', editable: true },
    ],
  },
  {
    id: 'historypage-timeline-2016',
    name: 'Timeline - 2016',
    description: 'Direction actuelle',
    icon: 'calendar',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: ['history.timeline.2016.title', 'history.timeline.2016.description', 'history.timeline.2016.phase', 'history.timeline.2016.image1', 'history.timeline.2016.image2', 'history.timeline.2016.image3'],
    fields: [
      { key: 'history.timeline.2016.title', label: 'Titre', description: 'Titre de l\'événement 2016', type: 'text', editorialKey: 'history.timeline.2016.title', editable: true },
      { key: 'history.timeline.2016.description', label: 'Description', description: 'Description de l\'événement', type: 'textarea', editorialKey: 'history.timeline.2016.description', editable: true },
      { key: 'history.timeline.2016.phase', label: 'Phase', description: 'Phase historique (ex: Rayonnement)', type: 'text', editorialKey: 'history.timeline.2016.phase', editable: true },
      { key: 'history.timeline.2016.image1', label: 'Image 1', description: 'Première image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.2016.image1', editable: true },
      { key: 'history.timeline.2016.image2', label: 'Image 2', description: 'Deuxième image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.2016.image2', editable: true },
      { key: 'history.timeline.2016.image3', label: 'Image 3', description: 'Troisième image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.2016.image3', editable: true },
    ],
  },
  {
    id: 'historypage-timeline-2020',
    name: 'Timeline - 2020',
    description: '30 ans d\'excellence',
    icon: 'calendar',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    editorialKeys: ['history.timeline.2020.title', 'history.timeline.2020.description', 'history.timeline.2020.phase', 'history.timeline.2020.image1', 'history.timeline.2020.image2', 'history.timeline.2020.image3'],
    fields: [
      { key: 'history.timeline.2020.title', label: 'Titre', description: 'Titre de l\'événement 2020', type: 'text', editorialKey: 'history.timeline.2020.title', editable: true },
      { key: 'history.timeline.2020.description', label: 'Description', description: 'Description de l\'événement', type: 'textarea', editorialKey: 'history.timeline.2020.description', editable: true },
      { key: 'history.timeline.2020.phase', label: 'Phase', description: 'Phase historique (ex: Actuel)', type: 'text', editorialKey: 'history.timeline.2020.phase', editable: true },
      { key: 'history.timeline.2020.image1', label: 'Image 1', description: 'Première image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.2020.image1', editable: true },
      { key: 'history.timeline.2020.image2', label: 'Image 2', description: 'Deuxième image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.2020.image2', editable: true },
      { key: 'history.timeline.2020.image3', label: 'Image 3', description: 'Troisième image illustrative (ratio 16:9)', type: 'image', editorialKey: 'history.timeline.2020.image3', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DE LA PAGE GOUVERNANCE
// ============================================================================

export const governancePageSections: PageSection[] = [
  {
    id: 'governance-hero',
    name: 'Hero Gouvernance',
    description: 'Bannière principale de la page Gouvernance',
    icon: 'landmark',
    color: 'bg-gradient-to-r from-brand-blue-500 to-brand-red-500 text-white',
    editorialKeys: ['governance.badge', 'governance.title', 'governance.subtitle'],
    fields: [
      { key: 'governance.badge', label: 'Badge', description: 'Texte du badge (ex: Notre structure)', type: 'text', editorialKey: 'governance.badge', editable: true },
      { key: 'governance.title', label: 'Titre', description: 'Titre principal du hero', type: 'text', editorialKey: 'governance.title', editable: true },
      { key: 'governance.subtitle', label: 'Sous-titre', description: 'Sous-titre du hero', type: 'textarea', editorialKey: 'governance.subtitle', editable: true },
    ],
  },
  {
    id: 'governance-founding-texts',
    name: 'Section Textes Fondateurs',
    description: 'Introduction et liste dynamique des textes fondateurs (documents PDF)',
    icon: 'file-alt',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    editorialKeys: [
      'governance.foundingTexts.badge',
      'governance.foundingTexts.title',
      'governance.foundingTexts.description',
      'governance.foundingTexts.documents',
    ],
    fields: [
      { key: 'governance.foundingTexts.badge', label: 'Badge', description: 'Texte du badge de la section', type: 'text', editorialKey: 'governance.foundingTexts.badge', editable: true },
      { key: 'governance.foundingTexts.title', label: 'Titre', description: 'Titre de la section textes fondateurs', type: 'text', editorialKey: 'governance.foundingTexts.title', editable: true },
      { key: 'governance.foundingTexts.description', label: 'Description', description: 'Texte de présentation des textes fondateurs', type: 'html', editorialKey: 'governance.foundingTexts.description', editable: true },
      { key: 'governance.foundingTexts.documents', label: 'Documents fondateurs', description: 'Liste dynamique des documents (PDF, chartes, conventions). Ajoutez, modifiez ou supprimez les documents.', type: 'documents', editorialKey: 'governance.foundingTexts.documents', editable: true },
    ],
  },
  {
    id: 'governance-donor-countries',
    name: 'Section Pays Bailleurs',
    description: 'Introduction et liste dynamique des pays fondateurs/bailleurs',
    icon: 'globe-africa',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    editorialKeys: ['governance.donorCountries.title', 'governance.donorCountries.description', 'governance.donorCountries.countries'],
    fields: [
      { key: 'governance.donorCountries.title', label: 'Titre', description: 'Titre de la section pays bailleurs', type: 'text', editorialKey: 'governance.donorCountries.title', editable: true },
      { key: 'governance.donorCountries.description', label: 'Description', description: 'Texte de présentation des pays bailleurs', type: 'textarea', editorialKey: 'governance.donorCountries.description', editable: true },
      { key: 'governance.donorCountries.countries', label: 'Pays fondateurs', description: 'Liste dynamique des pays fondateurs et bailleurs. Ajoutez, modifiez ou supprimez les pays.', type: 'countries', editorialKey: 'governance.donorCountries.countries', editable: true },
    ],
  },
  {
    id: 'governance-board',
    name: 'Section Conseil d\'Administration',
    description: 'Introduction du Conseil d\'Administration (les membres sont gérés via la BDD)',
    icon: 'users',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    editorialKeys: ['governance.board.title', 'governance.board.description'],
    fields: [
      { key: 'governance.board.title', label: 'Titre', description: 'Titre de la section Conseil d\'Administration', type: 'text', editorialKey: 'governance.board.title', editable: true },
      { key: 'governance.board.description', label: 'Description', description: 'Texte de présentation du Conseil', type: 'textarea', editorialKey: 'governance.board.description', editable: true },
    ],
  },
]

// ============================================================================
// DÉFINITION DES ÉLÉMENTS GLOBAUX (NAVBAR, FOOTER, etc.)
// ============================================================================

export const globalElementsSections: PageSection[] = [
  {
    id: 'navbar',
    name: 'Barre de navigation',
    description: 'Éléments de la barre de navigation principale',
    icon: 'bars',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    editorialKeys: ['navbar.apply.text', 'navbar.apply.link'],
    fields: [
      { key: 'navbar.apply.text', label: 'Bouton Candidater - Texte', description: 'Texte affiché sur le bouton principal de candidature', type: 'text', editorialKey: 'navbar.apply.text', editable: true },
      { key: 'navbar.apply.link', label: 'Bouton Candidater - Lien', description: 'URL de destination du bouton (ex: /carrieres, /formations/postuler)', type: 'text', editorialKey: 'navbar.apply.link', editable: true },
    ],
  },
]

// ============================================================================
// ASSEMBLAGE DES PAGES DU FRONT-OFFICE
// ============================================================================

export const frontOfficePages: FrontOfficePage[] = [
  {
    id: 'global',
    name: 'Éléments globaux',
    slug: '*',
    description: 'Éléments communs à toutes les pages : navigation, pied de page',
    icon: 'globe',
    sections: globalElementsSections,
  },
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
    description: 'Plan stratégique 2024-2030, axes et indicateurs',
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
  {
    id: 'history',
    name: 'Page Histoire',
    slug: '/a-propos/histoire',
    description: 'Timeline historique de l\'université avec les étapes clés et les dirigeants',
    icon: 'landmark',
    sections: historyPageSections,
  },
  {
    id: 'governance',
    name: 'Page Gouvernance',
    slug: '/a-propos/gouvernance',
    description: 'Textes fondateurs, pays bailleurs et Conseil d\'Administration',
    icon: 'landmark',
    sections: governancePageSections,
  },
  {
    id: 'careers',
    name: 'Page Carrières',
    slug: '/carrieres',
    description: 'Opportunités pour enseignants, étudiants et partenaires',
    icon: 'briefcase',
    sections: careersPageSections,
  },
  {
    id: 'projects',
    name: 'Page Projets',
    slug: '/projets',
    description: 'Projets de recherche et développement de l\'université',
    icon: 'project-diagram',
    sections: projectsPageSections,
  },
  {
    id: 'alumni',
    name: 'Page Alumni',
    slug: '/alumni',
    description: 'Réseau des anciens diplômés et histoires de réussite',
    icon: 'user-graduate',
    sections: alumniPageSections,
  },
  {
    id: 'site',
    name: 'Page Site / Campus',
    slug: '/site',
    description: 'Présentation du campus, infrastructures et localisation',
    icon: 'building',
    sections: sitePageSections,
  },
]
