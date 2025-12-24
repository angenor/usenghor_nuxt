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
    is_active: true
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
    is_active: true
  },
  {
    id: 'pb-sn',
    name_fr: 'Sénégal',
    name_en: 'Senegal',
    name_ar: 'السنغال',
    code: 'SN',
    contribution_type_fr: 'Membre fondateur',
    member_since: 1989,
    sort_order: 3,
    is_active: true
  },
  {
    id: 'pb-cm',
    name_fr: 'Cameroun',
    name_en: 'Cameroon',
    name_ar: 'الكاميرون',
    code: 'CM',
    member_since: 1989,
    sort_order: 4,
    is_active: true
  },
  {
    id: 'pb-ci',
    name_fr: 'Côte d\'Ivoire',
    name_en: 'Ivory Coast',
    name_ar: 'ساحل العاج',
    code: 'CI',
    member_since: 1989,
    sort_order: 5,
    is_active: true
  },
  {
    id: 'pb-ga',
    name_fr: 'Gabon',
    name_en: 'Gabon',
    name_ar: 'الغابون',
    code: 'GA',
    member_since: 1989,
    sort_order: 6,
    is_active: true
  },
  {
    id: 'pb-ma',
    name_fr: 'Maroc',
    name_en: 'Morocco',
    name_ar: 'المغرب',
    code: 'MA',
    member_since: 1990,
    sort_order: 7,
    is_active: true
  },
  {
    id: 'pb-tn',
    name_fr: 'Tunisie',
    name_en: 'Tunisia',
    name_ar: 'تونس',
    code: 'TN',
    member_since: 1990,
    sort_order: 8,
    is_active: true
  },
  {
    id: 'pb-bj',
    name_fr: 'Bénin',
    name_en: 'Benin',
    name_ar: 'بنين',
    code: 'BJ',
    member_since: 1991,
    sort_order: 9,
    is_active: true
  },
  {
    id: 'pb-bf',
    name_fr: 'Burkina Faso',
    name_en: 'Burkina Faso',
    name_ar: 'بوركينا فاسو',
    code: 'BF',
    member_since: 1991,
    sort_order: 10,
    is_active: true
  },
  {
    id: 'pb-td',
    name_fr: 'Tchad',
    name_en: 'Chad',
    name_ar: 'تشاد',
    code: 'TD',
    member_since: 1992,
    sort_order: 11,
    is_active: true
  },
  {
    id: 'pb-cg',
    name_fr: 'Congo',
    name_en: 'Congo',
    name_ar: 'الكونغو',
    code: 'CG',
    member_since: 1993,
    sort_order: 12,
    is_active: true
  },
  {
    id: 'pb-mg',
    name_fr: 'Madagascar',
    name_en: 'Madagascar',
    name_ar: 'مدغشقر',
    code: 'MG',
    member_since: 1994,
    sort_order: 13,
    is_active: true
  },
  {
    id: 'pb-ne',
    name_fr: 'Niger',
    name_en: 'Niger',
    name_ar: 'النيجر',
    code: 'NE',
    member_since: 1995,
    sort_order: 14,
    is_active: true
  },
  {
    id: 'pb-tg',
    name_fr: 'Togo',
    name_en: 'Togo',
    name_ar: 'توغو',
    code: 'TG',
    member_since: 1996,
    sort_order: 15,
    is_active: true
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
