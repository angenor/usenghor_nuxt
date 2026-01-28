// ============================================================================
// MOCK DATA - VALEURS ÉDITORIAUX (MISSION, VISION, VALEURS FONDAMENTALES)
// ============================================================================
// Basé sur le schéma SQL: 12_editorial.sql
// Tables: editorial_categories, editorial_contents, editorial_contents_history
// ============================================================================

import type { EditorialValueType } from './editorial-statistics'
import type { ValueSectionKey } from '~/types/api'

// Réexportation pour compatibilité
export type { ValueSectionKey }

// Section de contenu éditorial (mission, vision, etc.)
export interface ValueSection {
  id: string
  key: ValueSectionKey
  title: string
  content: string
  value_type: EditorialValueType
  category_id: string
  display_order: number
  admin_editable: boolean
  created_at: string
  updated_at: string
}

// Valeur fondamentale
export interface CoreValue {
  id: string
  title: string
  description: string
  icon: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Historique des modifications
export interface ValueHistory {
  id: string
  content_id: string
  content_type: 'section' | 'core_value'
  field_changed: string
  old_value: string
  new_value: string
  modified_by_external_id: string | null
  modified_by_name?: string
  modified_at: string
}

// Statistiques globales
export interface ValuesGlobalStats {
  sections_count: number
  core_values_count: number
  active_core_values: number
  last_updated: string | null
  history_count: number
}

// Labels pour les sections
export const valueSectionLabels: Record<ValueSectionKey, string> = {
  mission: 'Mission',
  vision: 'Vision',
  history: 'Historique / À propos',
  rector_message: 'Mot du recteur'
}

// Descriptions pour les sections
export const valueSectionDescriptions: Record<ValueSectionKey, string> = {
  mission: 'La mission de l\'Université Senghor et ses objectifs principaux',
  vision: 'La vision à long terme et les aspirations de l\'université',
  history: 'L\'histoire et le contexte de création de l\'université',
  rector_message: 'Le message du recteur aux étudiants et partenaires'
}

// Icônes pour les sections
export const valueSectionIcons: Record<ValueSectionKey, string> = {
  mission: 'bullseye',
  vision: 'eye',
  history: 'book-open',
  rector_message: 'user-tie'
}

// Couleurs pour les sections
export const valueSectionColors: Record<ValueSectionKey, string> = {
  mission: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  vision: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  history: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  rector_message: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
}

// Icônes disponibles pour les valeurs fondamentales
export const availableIcons: Array<{ value: string; label: string }> = [
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
  { value: 'flag', label: 'Drapeau' }
]

// ============================================================================
// DONNÉES MOCK - CATÉGORIE
// ============================================================================

export const mockValuesCategory = {
  id: 'cat_values',
  code: 'values',
  name: 'Valeurs',
  description: 'Contenus de présentation de l\'université : mission, vision, valeurs',
  created_at: '2024-01-01T00:00:00Z'
}

// ============================================================================
// DONNÉES MOCK - SECTIONS
// ============================================================================

export const mockValueSections: ValueSection[] = [
  {
    id: 'vsec_001',
    key: 'mission',
    title: 'Notre Mission',
    content: `<p>L'Université Senghor d'Alexandrie est un opérateur direct de la Francophonie. Elle a pour mission de former des cadres africains de haut niveau en management et développement.</p>

<p>Créée en 1990 par le Sommet des chefs d'État et de gouvernement ayant le français en partage, l'Université Senghor poursuit trois objectifs majeurs :</p>

<ul>
<li><strong>Former</strong> des professionnels africains de haut niveau capables de contribuer au développement de leur pays</li>
<li><strong>Promouvoir</strong> le dialogue des cultures et le rapprochement des peuples</li>
<li><strong>Développer</strong> les échanges scientifiques et techniques entre les pays francophones</li>
</ul>

<p>Située au cœur d'Alexandrie, ville symbole de rencontre entre les civilisations, l'Université Senghor accueille chaque année des étudiants venus de toute l'Afrique francophone.</p>`,
    value_type: 'html',
    category_id: 'cat_values',
    display_order: 1,
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-10-15T14:30:00Z'
  },
  {
    id: 'vsec_002',
    key: 'vision',
    title: 'Notre Vision',
    content: `<p>L'Université Senghor aspire à devenir un <strong>centre d'excellence reconnu internationalement</strong> pour la formation des leaders africains du développement durable.</p>

<p>Notre vision repose sur plusieurs piliers :</p>

<ul>
<li><strong>Excellence académique</strong> : Offrir des formations de qualité internationale répondant aux besoins du continent africain</li>
<li><strong>Innovation pédagogique</strong> : Adopter des méthodes d'enseignement innovantes et adaptées aux défis contemporains</li>
<li><strong>Réseau d'influence</strong> : Constituer un réseau d'anciens étudiants influents dans tous les secteurs clés du développement</li>
<li><strong>Partenariats stratégiques</strong> : Développer des collaborations avec les meilleures institutions mondiales</li>
</ul>

<p>À l'horizon 2030, nous visons à avoir formé plus de 10 000 cadres africains contribuant activement au développement de leur pays.</p>`,
    value_type: 'html',
    category_id: 'cat_values',
    display_order: 2,
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-20T11:00:00Z'
  },
  {
    id: 'vsec_003',
    key: 'history',
    title: 'Notre Histoire',
    content: `<p>L'Université Senghor tire son nom de <strong>Léopold Sédar Senghor</strong> (1906-2001), poète, écrivain et homme d'État sénégalais, premier président de la République du Sénégal et ardent défenseur de la Francophonie.</p>

<h3>Les dates clés</h3>

<ul>
<li><strong>1990</strong> : Création de l'Université par le Sommet des chefs d'État et de gouvernement ayant le français en partage</li>
<li><strong>1992</strong> : Accueil de la première promotion d'étudiants</li>
<li><strong>2000</strong> : Lancement des premiers programmes de formation continue</li>
<li><strong>2010</strong> : Inauguration du nouveau campus à Alexandrie</li>
<li><strong>2015</strong> : Obtention de l'accréditation internationale</li>
<li><strong>2020</strong> : Célébration des 30 ans avec plus de 5000 diplômés</li>
</ul>

<p>Depuis sa création, l'Université Senghor a formé des milliers de cadres africains qui occupent aujourd'hui des postes de responsabilité dans leurs pays respectifs et dans les organisations internationales.</p>`,
    value_type: 'html',
    category_id: 'cat_values',
    display_order: 3,
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-10T09:15:00Z'
  },
  {
    id: 'vsec_004',
    key: 'rector_message',
    title: 'Mot du Recteur',
    content: `<p>Chers étudiants, chers partenaires, chers amis de l'Université Senghor,</p>

<p>C'est avec une grande fierté que je vous accueille au sein de notre institution, <strong>opérateur direct de la Francophonie</strong> dédié à la formation des cadres africains de haut niveau.</p>

<p>Depuis plus de trois décennies, l'Université Senghor s'est imposée comme un acteur incontournable de la coopération universitaire francophone. Notre ambition est claire : former les leaders de demain, capables de relever les défis du développement durable de l'Afrique.</p>

<p>Notre approche pédagogique unique, combinant <strong>excellence académique</strong>, <strong>expérience professionnelle</strong> et <strong>diversité culturelle</strong>, permet à nos étudiants d'acquérir les compétences nécessaires pour transformer positivement leur environnement.</p>

<p>Je vous invite à découvrir nos programmes de formation et à rejoindre notre communauté de plus de 5000 diplômés présents dans toute l'Afrique et au-delà.</p>

<p>Bienvenue à l'Université Senghor !</p>

<p><em>Professeur Jean-Dominique Pénel<br>Recteur de l'Université Senghor</em></p>`,
    value_type: 'html',
    category_id: 'cat_values',
    display_order: 4,
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-10T16:45:00Z'
  }
]

// ============================================================================
// DONNÉES MOCK - VALEURS FONDAMENTALES
// ============================================================================

export const mockCoreValues: CoreValue[] = [
  {
    id: 'cv_001',
    title: 'Excellence',
    description: 'Nous visons l\'excellence dans l\'enseignement, la recherche et le service à la communauté. Nos programmes sont conçus pour atteindre les plus hauts standards internationaux.',
    icon: 'star',
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-08-15T10:00:00Z'
  },
  {
    id: 'cv_002',
    title: 'Intégrité',
    description: 'Nous agissons avec honnêteté, éthique et transparence dans toutes nos activités. L\'intégrité est au cœur de notre engagement envers nos étudiants et partenaires.',
    icon: 'shield-alt',
    display_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-08-15T10:00:00Z'
  },
  {
    id: 'cv_003',
    title: 'Innovation',
    description: 'Nous encourageons la créativité, l\'esprit d\'entreprise et l\'innovation pédagogique. Nous préparons nos étudiants à anticiper et à créer le changement.',
    icon: 'lightbulb',
    display_order: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-20T14:30:00Z'
  },
  {
    id: 'cv_004',
    title: 'Solidarité',
    description: 'Nous cultivons l\'esprit de solidarité et d\'entraide au sein de notre communauté universitaire et avec nos partenaires africains et internationaux.',
    icon: 'handshake',
    display_order: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-08-15T10:00:00Z'
  },
  {
    id: 'cv_005',
    title: 'Diversité',
    description: 'Nous célébrons la diversité culturelle et linguistique de nos étudiants venus de toute l\'Afrique francophone. Cette richesse est notre force.',
    icon: 'globe',
    display_order: 5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-10-05T11:20:00Z'
  },
  {
    id: 'cv_006',
    title: 'Engagement',
    description: 'Nous formons des leaders engagés pour le développement durable de l\'Afrique, conscients de leur responsabilité sociale et environnementale.',
    icon: 'seedling',
    display_order: 6,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-12T09:00:00Z'
  }
]

// ============================================================================
// DONNÉES MOCK - HISTORIQUE DES MODIFICATIONS
// ============================================================================

export const mockValuesHistory: ValueHistory[] = [
  {
    id: 'vhist_001',
    content_id: 'vsec_004',
    content_type: 'section',
    field_changed: 'content',
    old_value: '[Ancien contenu du mot du recteur]',
    new_value: '[Nouveau contenu du mot du recteur]',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2025-01-10T16:45:00Z'
  },
  {
    id: 'vhist_002',
    content_id: 'vsec_001',
    content_type: 'section',
    field_changed: 'content',
    old_value: '[Ancienne version de la mission]',
    new_value: '[Nouvelle version de la mission]',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-10-15T14:30:00Z'
  },
  {
    id: 'vhist_003',
    content_id: 'cv_006',
    content_type: 'core_value',
    field_changed: 'description',
    old_value: 'Ancienne description de l\'engagement',
    new_value: 'Nous formons des leaders engagés pour le développement durable de l\'Afrique...',
    modified_by_external_id: 'user_admin_002',
    modified_by_name: 'Marie Martin',
    modified_at: '2024-11-12T09:00:00Z'
  },
  {
    id: 'vhist_004',
    content_id: 'cv_005',
    content_type: 'core_value',
    field_changed: 'description',
    old_value: 'Ancienne description de la diversité',
    new_value: 'Nous célébrons la diversité culturelle et linguistique...',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-10-05T11:20:00Z'
  },
  {
    id: 'vhist_005',
    content_id: 'cv_003',
    content_type: 'core_value',
    field_changed: 'description',
    old_value: 'Ancienne description de l\'innovation',
    new_value: 'Nous encourageons la créativité, l\'esprit d\'entreprise...',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-09-20T14:30:00Z'
  },
  {
    id: 'vhist_006',
    content_id: 'vsec_002',
    content_type: 'section',
    field_changed: 'content',
    old_value: '[Ancienne version de la vision]',
    new_value: '[Nouvelle version de la vision]',
    modified_by_external_id: 'user_admin_002',
    modified_by_name: 'Marie Martin',
    modified_at: '2024-09-20T11:00:00Z'
  }
]

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Générer un ID unique
export const generateValueSectionId = (): string => {
  return `vsec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateCoreValueId = (): string => {
  return `cv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateValueHistoryId = (): string => {
  return `vhist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Récupérer toutes les sections
export const getAllValueSections = (): ValueSection[] => {
  return [...mockValueSections].sort((a, b) => a.display_order - b.display_order)
}

// Récupérer une section par ID
export const getValueSectionById = (id: string): ValueSection | undefined => {
  return mockValueSections.find(s => s.id === id)
}

// Récupérer une section par clé
export const getValueSectionByKey = (key: ValueSectionKey): ValueSection | undefined => {
  return mockValueSections.find(s => s.key === key)
}

// Récupérer toutes les valeurs fondamentales
export const getAllCoreValues = (includeInactive = false): CoreValue[] => {
  let result = [...mockCoreValues]
  if (!includeInactive) {
    result = result.filter(v => v.is_active)
  }
  return result.sort((a, b) => a.display_order - b.display_order)
}

// Récupérer une valeur fondamentale par ID
export const getCoreValueById = (id: string): CoreValue | undefined => {
  return mockCoreValues.find(v => v.id === id)
}

// Vérifier si un titre de valeur est déjà utilisé
export const isCoreValueTitleTaken = (title: string, excludeId?: string): boolean => {
  return mockCoreValues.some(
    v => v.title.toLowerCase() === title.toLowerCase() && v.id !== excludeId
  )
}

// Récupérer l'historique d'un contenu
export const getValueHistory = (contentId: string): ValueHistory[] => {
  return mockValuesHistory
    .filter(h => h.content_id === contentId)
    .sort((a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime())
}

// Récupérer tout l'historique
export const getAllValueHistory = (): ValueHistory[] => {
  return [...mockValuesHistory].sort(
    (a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
  )
}

// Obtenir le prochain ordre d'affichage pour les valeurs fondamentales
export const getNextCoreValueOrder = (): number => {
  const maxOrder = Math.max(...mockCoreValues.map(v => v.display_order), 0)
  return maxOrder + 1
}

// Statistiques globales
export const getValuesGlobalStats = (): ValuesGlobalStats => {
  const sections = mockValueSections
  const coreValues = mockCoreValues
  const history = mockValuesHistory

  // Dernière mise à jour
  const allDates = [
    ...sections.map(s => s.updated_at),
    ...coreValues.map(v => v.updated_at)
  ]
  const lastUpdated = allDates.length > 0
    ? allDates.reduce((latest, current) =>
        new Date(current) > new Date(latest) ? current : latest
      )
    : null

  return {
    sections_count: sections.length,
    core_values_count: coreValues.length,
    active_core_values: coreValues.filter(v => v.is_active).length,
    last_updated: lastUpdated,
    history_count: history.length
  }
}

// Vérifier si une section peut être modifiée
export const canEditValueSection = (section: ValueSection): boolean => {
  return section.admin_editable
}

// Valider le titre d'une valeur fondamentale
export const validateCoreValueTitle = (title: string): boolean => {
  return title.trim().length >= 2 && title.trim().length <= 50
}

// Valider la description d'une valeur fondamentale
export const validateCoreValueDescription = (description: string): boolean => {
  return description.trim().length >= 10 && description.trim().length <= 500
}
