/**
 * Mock Data: Pays Bailleurs
 * Table SQL: pays_bailleurs
 */

export interface PaysBailleur {
  id: string
  name_fr: string
  name_en: string
  name_ar: string
  code: string // ISO 3166-1 alpha-2
  contribution_type_fr?: string
  member_since: number
  website?: string
  sort_order: number
  is_active: boolean
  // Nouveaux champs pour section enrichie
  description_fr?: string
  capital?: string
  // Coordonnées GPS de la capitale (pour la carte Leaflet)
  location?: { lat: number; lng: number }
  // Image de drapeau personnalisée (pour les entités non-étatiques sans emoji drapeau)
  flag_image?: string
}

export const mockPaysBailleurs: PaysBailleur[] = [
  {
    id: 'pb-fr',
    name_fr: 'France',
    name_en: 'France',
    name_ar: 'فرنسا',
    code: 'FR',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 1,
    is_active: true,
    description_fr: 'Partenaire fondateur majeur, la France soutient l\'Université à travers la Francophonie et contribue significativement à son financement et à son rayonnement international.',
    capital: 'Paris',
    location: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: 'pb-ca',
    name_fr: 'Canada',
    name_en: 'Canada',
    name_ar: 'كندا',
    code: 'CA',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 2,
    is_active: true,
    description_fr: 'Le Canada, pilier de la Francophonie internationale, soutient l\'Université Senghor à travers ses programmes de coopération et son engagement pour le développement de l\'Afrique francophone.',
    capital: 'Ottawa',
    location: { lat: 45.4215, lng: -75.6972 }
  },
  {
    id: 'pb-be',
    name_fr: 'Wallonie-Bruxelles',
    name_en: 'Wallonia-Brussels',
    name_ar: 'والونيا-بروكسل',
    code: 'BE',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 3,
    is_active: true,
    description_fr: 'La Fédération Wallonie-Bruxelles, communauté francophone de Belgique, soutient l\'Université par ses programmes de coopération universitaire et culturelle.',
    capital: 'Bruxelles',
    location: { lat: 50.8503, lng: 4.3517 },
    flag_image: '/images/flags/wallonie-bruxelles.svg'
  },
  {
    id: 'pb-ch',
    name_fr: 'Suisse',
    name_en: 'Switzerland',
    name_ar: 'سويسرا',
    code: 'CH',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 4,
    is_active: true,
    description_fr: 'La Confédération suisse, reconnue pour son excellence académique et sa neutralité, contribue au financement et au développement de l\'Université Senghor.',
    capital: 'Berne',
    location: { lat: 46.9480, lng: 7.4474 }
  },
  {
    id: 'pb-qc',
    name_fr: 'Québec',
    name_en: 'Quebec',
    name_ar: 'كيبيك',
    code: 'QC',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 5,
    is_active: true,
    description_fr: 'Le Québec, cœur francophone de l\'Amérique du Nord, apporte son expertise en matière d\'éducation et de culture française, contribuant activement à la mission de l\'Université.',
    capital: 'Québec',
    location: { lat: 46.8139, lng: -71.2080 },
    flag_image: '/images/flags/quebec.png'
  },
  {
    id: 'pb-eg',
    name_fr: 'Égypte',
    name_en: 'Egypt',
    name_ar: 'مصر',
    code: 'EG',
    contribution_type_fr: 'Pays hôte et membre fondateur',
    member_since: 1989,
    sort_order: 6,
    is_active: true,
    description_fr: 'Pays hôte de l\'Université depuis sa création, l\'Égypte accueille le campus principal à Alexandrie, ville historique de culture et de savoir au carrefour de l\'Afrique et du Moyen-Orient.',
    capital: 'Le Caire',
    location: { lat: 30.0444, lng: 31.2357 }
  }
]

/**
 * Utilitaire pour obtenir l'emoji drapeau depuis le code pays
 */
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
