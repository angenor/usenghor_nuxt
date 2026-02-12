/**
 * Types pour le contenu éditorial (catégories, contenus, valeurs)
 */

// ============================================================================
// Enums
// ============================================================================

export type EditorialValueType = 'text' | 'number' | 'json' | 'html' | 'markdown'

// ============================================================================
// Categories
// ============================================================================

export interface EditorialCategoryRead {
  id: string
  code: string
  name: string
  description: string | null
  created_at: string
}

export interface EditorialCategoryWithCount extends EditorialCategoryRead {
  contents_count: number
}

export interface EditorialCategoryCreate {
  code: string
  name: string
  description?: string | null
}

export interface EditorialCategoryUpdate {
  name?: string
  description?: string | null
}

// ============================================================================
// Contents
// ============================================================================

export interface EditorialContentRead {
  id: string
  key: string
  value: string | null
  value_type: EditorialValueType
  category_id: string | null
  year: number | null
  description: string | null
  admin_editable: boolean
  created_at: string
  updated_at: string
}

export interface EditorialContentWithCategory extends EditorialContentRead {
  category: EditorialCategoryRead | null
}

export interface EditorialContentCreate {
  key: string
  value?: string | null
  value_type?: EditorialValueType
  category_id?: string | null
  year?: number | null
  description?: string | null
  admin_editable?: boolean
}

export interface EditorialContentUpdate {
  value?: string | null
  value_type?: EditorialValueType
  category_id?: string | null
  year?: number | null
  description?: string | null
  admin_editable?: boolean
}

// ============================================================================
// History
// ============================================================================

export interface EditorialHistoryRead {
  id: string
  content_id: string
  old_value: string | null
  new_value: string | null
  modified_by_external_id: string | null
  modified_at: string
}

export interface EditorialContentWithHistory extends EditorialContentRead {
  history: EditorialHistoryRead[]
}

// ============================================================================
// Bulk Operations
// ============================================================================

export interface EditorialBulkContentUpdate {
  key: string
  value: string
}

export interface EditorialBulkUpdateRequest {
  updates: EditorialBulkContentUpdate[]
}

export interface EditorialBulkUpdateResult {
  total: number
  updated: number
  errors: number
  not_found: number
}

// ============================================================================
// Value Sections (Frontend-specific types)
// ============================================================================

export type ValueSectionKey =
  | 'mission'
  | 'vision'
  | 'history'
  | 'rector_message'
  // Hero section
  | 'hero.slide1.title'
  | 'hero.slide1.subtitle'
  | 'hero.slide1.cta1.text'
  | 'hero.slide1.cta1.link'
  | 'hero.slide1.cta2.text'
  | 'hero.slide1.cta2.link'
  | 'hero.slide2.title'
  | 'hero.slide2.subtitle'
  | 'hero.slide2.cta1.text'
  | 'hero.slide2.cta1.link'
  | 'hero.slide2.cta2.text'
  | 'hero.slide2.cta2.link'
  | 'hero.slide3.title'
  | 'hero.slide3.subtitle'
  | 'hero.slide3.cta1.text'
  | 'hero.slide3.cta1.link'
  | 'hero.slide3.cta2.text'
  | 'hero.slide3.cta2.link'
  | 'hero.slide4.title'
  | 'hero.slide4.subtitle'
  | 'hero.slide4.cta1.text'
  | 'hero.slide4.cta1.link'
  | 'hero.slide4.cta2.text'
  | 'hero.slide4.cta2.link'
  | 'hero.cta.discover'
  | 'hero.cta.contact'
  // Mission section
  | 'mission.badge'
  | 'mission.title'
  | 'mission.subtitle'
  | 'mission.mission.title'
  | 'mission.mission.description'
  | 'mission.mission.tagline'
  | 'mission.vision.title'
  | 'mission.vision.description'
  // Experience section
  | 'experience.badge'
  | 'experience.title'
  | 'experience.description'
  | 'experience.cta.text'
  | 'experience.cta.link'
  | 'experience.stats.countries'
  | 'experience.stats.countries.value'
  | 'experience.stats.graduates'
  | 'experience.stats.graduates.value'
  | 'experience.stats.years'
  | 'experience.stats.years.value'
  // Formations section
  | 'formations.badge'
  | 'formations.title'
  | 'formations.subtitle'
  | 'formations.cta'
  // History section
  | 'history.badge'
  | 'history.title'
  | 'history.subtitle'
  | 'history.genesis.date'
  | 'history.genesis.title'
  | 'history.genesis.description'
  | 'history.genesis.point1'
  | 'history.usenghor.since'
  | 'history.usenghor.title'
  | 'history.usenghor.description'
  | 'history.legacy.badge'
  | 'history.legacy.title'
  | 'history.legacy.description'
  // History timeline
  | 'history.timeline.1989.title'
  | 'history.timeline.1989.description'
  | 'history.timeline.1989.phase'
  | 'history.timeline.1989.image1'
  | 'history.timeline.1989.image2'
  | 'history.timeline.1989.image3'
  | 'history.timeline.2002.title'
  | 'history.timeline.2002.description'
  | 'history.timeline.2002.phase'
  | 'history.timeline.2002.image1'
  | 'history.timeline.2002.image2'
  | 'history.timeline.2002.image3'
  | 'history.timeline.2016.title'
  | 'history.timeline.2016.description'
  | 'history.timeline.2016.phase'
  | 'history.timeline.2016.image1'
  | 'history.timeline.2016.image2'
  | 'history.timeline.2016.image3'
  | 'history.timeline.2020.title'
  | 'history.timeline.2020.description'
  | 'history.timeline.2020.phase'
  | 'history.timeline.2020.image1'
  | 'history.timeline.2020.image2'
  | 'history.timeline.2020.image3'
  // Page Gouvernance - Hero
  | 'governance.badge'
  | 'governance.title'
  | 'governance.subtitle'
  | 'governance.image'
  // Page Gouvernance - Textes fondateurs
  | 'governance.foundingTexts.badge'
  | 'governance.foundingTexts.title'
  | 'governance.foundingTexts.description'
  | 'governance.foundingTexts.documents'
  // Page Gouvernance - Pays bailleurs
  | 'governance.donorCountries.title'
  | 'governance.donorCountries.description'
  | 'governance.donorCountries.countries'
  // Page Gouvernance - Conseil d'Administration
  | 'governance.board.title'
  | 'governance.board.description'
  // Page À propos - Hero
  | 'about.hero.title'
  | 'about.hero.subtitle'
  // Page À propos - Mission
  | 'about.mission.title'
  | 'about.mission.content'
  | 'about.mission.image'
  | 'about.mission.cta.history'
  | 'about.mission.cta.governance'
  // Page À propos - Stats
  | 'about.stats.years.label'
  | 'about.stats.countries.label'
  | 'about.stats.alumni.label'
  | 'about.stats.programs.label'
  // Page À propos - Engagements
  | 'about.engagements.title'
  | 'about.engagements.excellence.title'
  | 'about.engagements.excellence.text'
  | 'about.engagements.ethics.title'
  | 'about.engagements.ethics.text'
  | 'about.engagements.inclusion.title'
  | 'about.engagements.inclusion.text'
  | 'about.engagements.innovation.title'
  | 'about.engagements.innovation.text'
  | 'about.engagements.solidarity.title'
  | 'about.engagements.solidarity.text'
  | 'about.charter.title'
  | 'about.charter.download'
  | 'about.charter.download_url'
  // Page Stratégie - Hero
  | 'strategy.hero.title'
  | 'strategy.hero.subtitle'
  // Page Stratégie - Plan stratégique
  | 'strategy.plan.title'
  | 'strategy.plan.summary'
  | 'strategy.plan.image'
  | 'strategy.plan.download'
  | 'strategy.plan.download_url'
  // Page Stratégie - Axes stratégiques
  | 'strategy.axes.title'
  | 'strategy.axes.subtitle'
  | 'strategy.axes.items.a1.code'
  | 'strategy.axes.items.a1.title'
  | 'strategy.axes.items.a1.description'
  | 'strategy.axes.items.a1.objective1'
  | 'strategy.axes.items.a1.objective2'
  | 'strategy.axes.items.a1.objective3'
  | 'strategy.axes.items.a2.code'
  | 'strategy.axes.items.a2.title'
  | 'strategy.axes.items.a2.description'
  | 'strategy.axes.items.a2.objective1'
  | 'strategy.axes.items.a2.objective2'
  | 'strategy.axes.items.a2.objective3'
  | 'strategy.axes.items.a3.code'
  | 'strategy.axes.items.a3.title'
  | 'strategy.axes.items.a3.description'
  | 'strategy.axes.items.a3.objective1'
  | 'strategy.axes.items.a3.objective2'
  | 'strategy.axes.items.a3.objective3'
  // Page Stratégie - Indicateurs cibles 2030
  | 'strategy.indicators.title'
  | 'strategy.indicators.subtitle'
  | 'strategy.indicators.items.students'
  | 'strategy.indicators.items.programs'
  | 'strategy.indicators.items.women'
  | 'strategy.indicators.items.insertion'
  // Page Stratégie - Levée de fonds
  | 'strategy.fundraising.title'
  | 'strategy.fundraising.subtitle'
  | 'strategy.fundraising.projects.scholarships.title'
  | 'strategy.fundraising.projects.scholarships.description'
  | 'strategy.fundraising.projects.scholarships.amount'
  | 'strategy.fundraising.projects.campus.title'
  | 'strategy.fundraising.projects.campus.description'
  | 'strategy.fundraising.projects.campus.amount'
  | 'strategy.fundraising.projects.research.title'
  | 'strategy.fundraising.projects.research.description'
  | 'strategy.fundraising.projects.research.amount'
  | 'strategy.fundraising.projects.library.title'
  | 'strategy.fundraising.projects.library.description'
  | 'strategy.fundraising.projects.library.amount'
  | 'strategy.fundraising.cta.title'
  | 'strategy.fundraising.cta.text'
  | 'strategy.fundraising.cta.button'
  | 'strategy.fundraising.image'
  // Page Organisation - Hero
  | 'organization.hero.title'
  | 'organization.hero.subtitle'
  // Page Organisation - Organigramme
  | 'organization.orgchart.title'
  | 'organization.intro.text'
  // Page Organisation - CTA
  | 'organization.cta.title'
  | 'organization.cta.text'
  | 'organization.cta.button'
  // Page Équipe - Hero
  | 'team.hero.title'
  | 'team.hero.subtitle'
  // Page Équipe - CTA
  | 'team.cta.title'
  | 'team.cta.text'
  | 'team.cta.button'
  // Page Partenaires - Hero
  | 'partners.hero.badge'
  | 'partners.hero.title'
  | 'partners.hero.subtitle'
  // Page Partenaires - Section Campus
  | 'partners.campus.title'
  | 'partners.campus.subtitle'
  // Page Partenaires - Section Liste des partenaires
  | 'partners.list.badge'
  | 'partners.list.title'
  | 'partners.list.subtitle'
  // Page Carrières - Hero
  | 'careers.hero.title'
  | 'careers.hero.subtitle'
  // Page Carrières - Introduction
  | 'careers.intro.title'
  | 'careers.intro.text'
  | 'careers.intro.stats.positions.label'
  | 'careers.intro.stats.nationalities.label'
  | 'careers.intro.stats.years.label'
  // Page Carrières - Opportunités
  | 'careers.opportunities.title'
  | 'careers.opportunities.subtitle'
  // Page Carrières - Enseignants
  | 'careers.teachers.title'
  | 'careers.teachers.text'
  | 'careers.teachers.benefits.title'
  | 'careers.teachers.positions.title'
  | 'careers.teachers.cta.title'
  | 'careers.teachers.cta.text'
  | 'careers.teachers.cta.email'
  | 'careers.teachers.cta.button'
  | 'careers.teachers.image'
  // Page Carrières - Étudiants
  | 'careers.students.title'
  | 'careers.students.text'
  | 'careers.students.why.title'
  | 'careers.students.cta.title'
  | 'careers.students.cta.text'
  | 'careers.students.cta.button'
  | 'careers.students.programs.title'
  | 'careers.students.image'
  // Page Carrières - Partenaires
  | 'careers.partners.title'
  | 'careers.partners.text'
  | 'careers.partners.types.title'
  | 'careers.partners.form.title'
  | 'careers.partners.form.text'
  // Page Projets - Hero
  | 'projects.hero.badge'
  | 'projects.hero.title'
  | 'projects.hero.subtitle'
  // Page Projets - Introduction
  | 'projects.intro.title'
  | 'projects.intro.description'
  | 'projects.intro.stats.projects.label'
  | 'projects.intro.stats.countries.label'
  | 'projects.intro.stats.beneficiaries.label'
  // Page Projets - Projets à la une
  | 'projects.featured.title'
  | 'projects.featured.badge'
  // Page Projets - Liste des projets
  | 'projects.list.title'
  // Page Projets - CTA
  | 'projects.cta.title'
  | 'projects.cta.description'
  | 'projects.cta.button'
  // Page Alumni - Hero
  | 'alumni.hero.badge'
  | 'alumni.hero.title'
  | 'alumni.hero.subtitle'
  // Page Alumni - Section Stats
  | 'alumni.stats.title'
  | 'alumni.stats.alumni.label'
  | 'alumni.stats.countries.label'
  | 'alumni.stats.sectors.label'
  | 'alumni.stats.promotions.label'
  // Page Alumni - Témoignages
  | 'alumni.testimonials.title'
  | 'alumni.testimonials.subtitle'
  // Page Alumni - Liste
  | 'alumni.list.title'
  // Page Alumni - CTA
  | 'alumni.cta.title'
  | 'alumni.cta.description'
  | 'alumni.cta.button'
  // Page Site - Hero
  | 'site.hero.badge'
  | 'site.hero.title'
  | 'site.hero.subtitle'
  // Page Site - Présentation
  | 'site.presentation.title'
  | 'site.presentation.description'
  | 'site.presentation.address'
  | 'site.presentation.stats.surface.label'
  | 'site.presentation.stats.rooms.label'
  | 'site.presentation.stats.capacity.label'
  | 'site.presentation.stats.founded.label'
  // Page Site - Infrastructures (titres de section)
  | 'site.facilities.title'
  | 'site.facilities.subtitle'
  | 'site.facilities.capacity'
  // Page Site - Installation: Hébergement
  | 'site.facility.housing.name'
  | 'site.facility.housing.description'
  | 'site.facility.housing.features'
  | 'site.facility.housing.capacity'
  | 'site.facility.housing.images'
  // Page Site - Installation: Bibliothèque
  | 'site.facility.library.name'
  | 'site.facility.library.description'
  | 'site.facility.library.features'
  | 'site.facility.library.capacity'
  | 'site.facility.library.images'
  // Page Site - Installation: Salles de Conférence
  | 'site.facility.conference.name'
  | 'site.facility.conference.description'
  | 'site.facility.conference.features'
  | 'site.facility.conference.capacity'
  | 'site.facility.conference.images'
  // Page Site - Installation: Espaces Académiques
  | 'site.facility.academic.name'
  | 'site.facility.academic.description'
  | 'site.facility.academic.features'
  | 'site.facility.academic.capacity'
  | 'site.facility.academic.images'
  // Page Site - Installation: Installations Sportives
  | 'site.facility.sports.name'
  | 'site.facility.sports.description'
  | 'site.facility.sports.features'
  | 'site.facility.sports.images'
  // Page Site - Installation: Piscine
  | 'site.facility.pool.name'
  | 'site.facility.pool.description'
  | 'site.facility.pool.features'
  | 'site.facility.pool.capacity'
  | 'site.facility.pool.images'
  // Page Site - Installation: Hôtel
  | 'site.facility.hotel.name'
  | 'site.facility.hotel.description'
  | 'site.facility.hotel.features'
  | 'site.facility.hotel.capacity'
  | 'site.facility.hotel.images'
  // Page Site - Localisation : utilise les données centralisées de Contact (/admin/editorial/contact)
  // Page Site - CTA
  | 'site.cta.title'
  | 'site.cta.description'
  | 'site.cta.contactButton'
  // Page Histoire - Hero & Intro
  | 'historypage.hero.badge'
  | 'historypage.hero.title'
  | 'historypage.hero.subtitle'
  | 'historypage.intro.text'
  // Page Histoire - Genèse
  | 'historypage.genesis.date'
  | 'historypage.genesis.title'
  | 'historypage.genesis.description'
  | 'historypage.genesis.point1'
  | 'historypage.genesis.point2'
  // Page Histoire - Fondateurs
  | 'historypage.founders.title'
  | 'historypage.founders.subtitle'
  | 'historypage.founders.senghor.role'
  | 'historypage.founders.druon.role'
  | 'historypage.founders.boutros.role'
  | 'historypage.founders.dupuy.role'
  // Page Histoire - USenghor
  | 'historypage.usenghor.since'
  | 'historypage.usenghor.title'
  | 'historypage.usenghor.description'
  | 'historypage.usenghor.milestone1.title'
  | 'historypage.usenghor.milestone1.desc'
  | 'historypage.usenghor.milestone2.title'
  | 'historypage.usenghor.milestone2.desc'
  // Page Histoire - Timeline 1989
  | 'historypage.timeline.1989.title'
  | 'historypage.timeline.1989.description'
  | 'historypage.timeline.1989.rector'
  | 'historypage.timeline.1989.president'
  // Page Histoire - Timeline 1991
  | 'historypage.timeline.1991.title'
  | 'historypage.timeline.1991.description'
  | 'historypage.timeline.1991.rector'
  | 'historypage.timeline.1991.president'
  // Page Histoire - Timeline 1993
  | 'historypage.timeline.1993.title'
  | 'historypage.timeline.1993.description'
  | 'historypage.timeline.1993.rector'
  | 'historypage.timeline.1993.president'
  // Page Histoire - Timeline 2002
  | 'historypage.timeline.2002.title'
  | 'historypage.timeline.2002.description'
  | 'historypage.timeline.2002.rector'
  | 'historypage.timeline.2002.president'
  // Page Histoire - Timeline 2004
  | 'historypage.timeline.2004.title'
  | 'historypage.timeline.2004.description'
  | 'historypage.timeline.2004.rector'
  | 'historypage.timeline.2004.president'
  // Page Histoire - Timeline 2009
  | 'historypage.timeline.2009.title'
  | 'historypage.timeline.2009.description'
  | 'historypage.timeline.2009.rector'
  | 'historypage.timeline.2009.president'
  // Page Histoire - Timeline 2016
  | 'historypage.timeline.2016.title'
  | 'historypage.timeline.2016.description'
  | 'historypage.timeline.2016.rector'
  | 'historypage.timeline.2016.president'
  // Page Histoire - Timeline 2020
  | 'historypage.timeline.2020.title'
  | 'historypage.timeline.2020.description'
  // Page Histoire - Direction actuelle
  | 'historypage.leadership.title'
  | 'historypage.leadership.rector.name'
  | 'historypage.leadership.rector.title'
  | 'historypage.leadership.rector.since'
  | 'historypage.leadership.president.name'
  | 'historypage.leadership.president.title'
  // Page Histoire - Héritage
  | 'historypage.legacy.badge'
  | 'historypage.legacy.title'
  | 'historypage.legacy.description'
  | 'historypage.legacy.tags'
  // Éléments globaux - Navbar
  | 'navbar.apply.text'
  | 'navbar.apply.link'

export interface ValueSection {
  id: string
  key: ValueSectionKey
  title: string
  content: string
  value_type: EditorialValueType
  category_id: string | null
  display_order: number
  admin_editable: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// Core Values (Frontend-specific types, stored as JSON in backend)
// ============================================================================

export interface CoreValueData {
  title: string
  description: string
  icon: string
  display_order: number
  is_active: boolean
}

export interface CoreValue extends CoreValueData {
  id: string
  created_at: string
  updated_at: string
}

// ============================================================================
// Statistics
// ============================================================================

export interface EditorialValuesStats {
  sections_count: number
  core_values_count: number
  active_core_values: number
  last_updated: string | null
}
