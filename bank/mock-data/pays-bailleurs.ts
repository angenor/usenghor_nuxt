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
    id: 'pb-eg',
    name_fr: 'Égypte',
    name_en: 'Egypt',
    name_ar: 'مصر',
    code: 'EG',
    contribution_type_fr: 'Pays hôte et membre fondateur',
    member_since: 1989,
    sort_order: 2,
    is_active: true,
    description_fr: 'Pays hôte de l\'Université depuis sa création, l\'Égypte accueille le campus principal à Alexandrie, ville historique de culture et de savoir au carrefour de l\'Afrique et du Moyen-Orient.',
    capital: 'Le Caire',
    location: { lat: 30.0444, lng: 31.2357 }
  },
  {
    id: 'pb-ca',
    name_fr: 'Canada',
    name_en: 'Canada',
    name_ar: 'كندا',
    code: 'CA',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 3,
    is_active: true,
    description_fr: 'Le Canada, pilier de la Francophonie internationale, soutient l\'Université Senghor à travers ses programmes de coopération et son engagement pour le développement de l\'Afrique francophone.',
    capital: 'Ottawa',
    location: { lat: 45.4215, lng: -75.6972 }
  },
  {
    id: 'pb-qc',
    name_fr: 'Québec',
    name_en: 'Quebec',
    name_ar: 'كيبيك',
    code: 'QC',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 4,
    is_active: true,
    description_fr: 'Le Québec, cœur francophone de l\'Amérique du Nord, apporte son expertise en matière d\'éducation et de culture française, contribuant activement à la mission de l\'Université.',
    capital: 'Québec',
    location: { lat: 46.8139, lng: -71.2080 }
  },
  {
    id: 'pb-ch',
    name_fr: 'Suisse',
    name_en: 'Switzerland',
    name_ar: 'سويسرا',
    code: 'CH',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 5,
    is_active: true,
    description_fr: 'La Confédération suisse, reconnue pour son excellence académique et sa neutralité, contribue au financement et au développement de l\'Université Senghor.',
    capital: 'Berne',
    location: { lat: 46.9480, lng: 7.4474 }
  },
  {
    id: 'pb-be',
    name_fr: 'Wallonie-Bruxelles',
    name_en: 'Wallonia-Brussels',
    name_ar: 'والونيا-بروكسل',
    code: 'BE',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 6,
    is_active: true,
    description_fr: 'La Fédération Wallonie-Bruxelles, communauté francophone de Belgique, soutient l\'Université par ses programmes de coopération universitaire et culturelle.',
    capital: 'Bruxelles',
    location: { lat: 50.8503, lng: 4.3517 }
  },
  {
    id: 'pb-sn',
    name_fr: 'Sénégal',
    name_en: 'Senegal',
    name_ar: 'السنغال',
    code: 'SN',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 7,
    is_active: true,
    description_fr: 'Berceau de la création de l\'Université lors du Sommet de Dakar en 1989, le Sénégal incarne l\'esprit de la Francophonie africaine et la vision de Léopold Sédar Senghor.',
    capital: 'Dakar',
    location: { lat: 14.6928, lng: -17.4467 }
  },
  {
    id: 'pb-cm',
    name_fr: 'Cameroun',
    name_en: 'Cameroon',
    name_ar: 'الكاميرون',
    code: 'CM',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 8,
    is_active: true,
    description_fr: 'Le Cameroun, pays bilingue au cœur de l\'Afrique centrale, contribue activement au développement de l\'Université et à la formation des cadres africains.',
    capital: 'Yaoundé',
    location: { lat: 3.8480, lng: 11.5021 }
  },
  {
    id: 'pb-ci',
    name_fr: 'Côte d\'Ivoire',
    name_en: 'Ivory Coast',
    name_ar: 'ساحل العاج',
    code: 'CI',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 9,
    is_active: true,
    description_fr: 'Première puissance économique de l\'UEMOA, la Côte d\'Ivoire soutient l\'excellence académique et le rayonnement de la Francophonie en Afrique de l\'Ouest.',
    capital: 'Yamoussoukro',
    location: { lat: 6.8276, lng: -5.2893 }
  },
  {
    id: 'pb-ga',
    name_fr: 'Gabon',
    name_en: 'Gabon',
    name_ar: 'الغابون',
    code: 'GA',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 10,
    is_active: true,
    description_fr: 'Le Gabon, riche de ses ressources naturelles et de son engagement francophone, participe au financement et au développement de l\'Université Senghor.',
    capital: 'Libreville',
    location: { lat: 0.4162, lng: 9.4673 }
  },
  {
    id: 'pb-ma',
    name_fr: 'Maroc',
    name_en: 'Morocco',
    name_ar: 'المغرب',
    code: 'MA',
    member_since: 1990,
    sort_order: 11,
    is_active: true,
    description_fr: 'Le Royaume du Maroc, pont entre l\'Afrique et l\'Europe, enrichit l\'Université de sa tradition académique millénaire et de son engagement envers la Francophonie.',
    capital: 'Rabat',
    location: { lat: 34.0209, lng: -6.8416 }
  },
  {
    id: 'pb-tn',
    name_fr: 'Tunisie',
    name_en: 'Tunisia',
    name_ar: 'تونس',
    code: 'TN',
    member_since: 1990,
    sort_order: 12,
    is_active: true,
    description_fr: 'La Tunisie, héritière de Carthage et berceau du printemps arabe, apporte son expertise en matière d\'éducation et de développement durable.',
    capital: 'Tunis',
    location: { lat: 36.8065, lng: 10.1815 }
  },
  {
    id: 'pb-bj',
    name_fr: 'Bénin',
    name_en: 'Benin',
    name_ar: 'بنين',
    code: 'BJ',
    member_since: 1991,
    sort_order: 13,
    is_active: true,
    description_fr: 'Le Bénin, quartier latin de l\'Afrique, contribue à l\'Université par son engagement pour l\'éducation et la culture francophone.',
    capital: 'Porto-Novo',
    location: { lat: 6.4969, lng: 2.6289 }
  },
  {
    id: 'pb-bf',
    name_fr: 'Burkina Faso',
    name_en: 'Burkina Faso',
    name_ar: 'بوركينا فاسو',
    code: 'BF',
    member_since: 1991,
    sort_order: 14,
    is_active: true,
    description_fr: 'Le Burkina Faso, pays des hommes intègres, soutient la mission de formation des cadres africains au service du développement.',
    capital: 'Ouagadougou',
    location: { lat: 12.3714, lng: -1.5197 }
  },
  {
    id: 'pb-td',
    name_fr: 'Tchad',
    name_en: 'Chad',
    name_ar: 'تشاد',
    code: 'TD',
    member_since: 1992,
    sort_order: 15,
    is_active: true,
    description_fr: 'Le Tchad, cœur géographique de l\'Afrique, participe au renforcement des capacités et à la coopération universitaire francophone.',
    capital: 'N\'Djamena',
    location: { lat: 12.1348, lng: 15.0557 }
  },
  {
    id: 'pb-cg',
    name_fr: 'Congo',
    name_en: 'Congo',
    name_ar: 'الكونغو',
    code: 'CG',
    member_since: 1993,
    sort_order: 16,
    is_active: true,
    description_fr: 'La République du Congo apporte sa contribution au développement de l\'enseignement supérieur francophone en Afrique centrale.',
    capital: 'Brazzaville',
    location: { lat: -4.2634, lng: 15.2429 }
  },
  {
    id: 'pb-mg',
    name_fr: 'Madagascar',
    name_en: 'Madagascar',
    name_ar: 'مدغشقر',
    code: 'MG',
    member_since: 1994,
    sort_order: 17,
    is_active: true,
    description_fr: 'Madagascar, île-continent aux richesses uniques, enrichit la diversité culturelle et linguistique de la communauté universitaire.',
    capital: 'Antananarivo',
    location: { lat: -18.8792, lng: 47.5079 }
  },
  {
    id: 'pb-ne',
    name_fr: 'Niger',
    name_en: 'Niger',
    name_ar: 'النيجر',
    code: 'NE',
    member_since: 1995,
    sort_order: 18,
    is_active: true,
    description_fr: 'Le Niger, carrefour sahélien, contribue à la formation des élites francophones et au développement durable de la région.',
    capital: 'Niamey',
    location: { lat: 13.5116, lng: 2.1254 }
  },
  {
    id: 'pb-tg',
    name_fr: 'Togo',
    name_en: 'Togo',
    name_ar: 'توغو',
    code: 'TG',
    member_since: 1996,
    sort_order: 19,
    is_active: true,
    description_fr: 'Le Togo, porte de l\'Afrique de l\'Ouest, soutient l\'excellence académique et la coopération internationale francophone.',
    capital: 'Lomé',
    location: { lat: 6.1319, lng: 1.2228 }
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
