/**
 * Mock Data: Conseil d'Administration
 * Table SQL: conseil_administration
 */

export type CARole = 'president' | 'vice_president' | 'membre' | 'observateur'
export type Civility = 'M.' | 'Mme' | 'Dr' | 'Pr' | 'S.E.'

export interface CAMember {
  id: string
  civility: Civility
  first_name: string
  last_name: string
  title_fr: string
  title_en?: string
  title_ar?: string
  ca_role: CARole
  representing_fr: string
  representing_en?: string
  country_code: string
  photo?: string
  bio_fr?: string
  sort_order: number
  is_active: boolean
  mandate_start?: string // Date ISO
}

export const mockConseilAdministration: CAMember[] = [
  {
    id: 'ca-001',
    civility: 'S.E.',
    first_name: 'Amadou',
    last_name: 'Bâ',
    title_fr: 'Président du Conseil d\'Administration',
    title_en: 'Chairman of the Board',
    ca_role: 'president',
    representing_fr: 'République du Sénégal',
    representing_en: 'Republic of Senegal',
    country_code: 'SN',
    photo: null,
    bio_fr: 'Son Excellence Amadou Bâ préside le Conseil d\'Administration depuis 2022.',
    sort_order: 1,
    is_active: true,
    mandate_start: '2022-01-01'
  },
  {
    id: 'ca-002',
    civility: 'S.E.',
    first_name: 'Nadia',
    last_name: 'El Khatib',
    title_fr: 'Vice-Présidente',
    ca_role: 'vice_president',
    representing_fr: 'République Arabe d\'Égypte',
    country_code: 'EG',
    photo: null,
    sort_order: 2,
    is_active: true
  },
  {
    id: 'ca-003',
    civility: 'M.',
    first_name: 'Jean-Pierre',
    last_name: 'Lefebvre',
    title_fr: 'Représentant de la France',
    ca_role: 'membre',
    representing_fr: 'République Française',
    country_code: 'FR',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'ca-004',
    civility: 'Mme',
    first_name: 'Aminata',
    last_name: 'Koné',
    title_fr: 'Représentante de la Côte d\'Ivoire',
    ca_role: 'membre',
    representing_fr: 'République de Côte d\'Ivoire',
    country_code: 'CI',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'ca-005',
    civility: 'M.',
    first_name: 'Paul',
    last_name: 'Biya Fils',
    title_fr: 'Représentant du Cameroun',
    ca_role: 'membre',
    representing_fr: 'République du Cameroun',
    country_code: 'CM',
    sort_order: 5,
    is_active: true
  },
  {
    id: 'ca-006',
    civility: 'Mme',
    first_name: 'Fatima',
    last_name: 'Zahra Bennis',
    title_fr: 'Représentante du Maroc',
    ca_role: 'membre',
    representing_fr: 'Royaume du Maroc',
    country_code: 'MA',
    sort_order: 6,
    is_active: true
  },
  {
    id: 'ca-007',
    civility: 'M.',
    first_name: 'Ali',
    last_name: 'Bongo',
    title_fr: 'Représentant du Gabon',
    ca_role: 'membre',
    representing_fr: 'République Gabonaise',
    country_code: 'GA',
    sort_order: 7,
    is_active: true
  },
  {
    id: 'ca-010',
    civility: 'Dr',
    first_name: 'Louise',
    last_name: 'Mushikiwabo',
    title_fr: 'Secrétaire Générale de l\'OIF',
    ca_role: 'observateur',
    representing_fr: 'Organisation Internationale de la Francophonie',
    country_code: 'RW',
    sort_order: 20,
    is_active: true
  }
]
