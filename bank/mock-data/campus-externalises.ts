/**
 * Mock Data: Campus Externalisés
 * Table SQL: campus_externalises
 */

export interface CampusExternalise {
  id: string
  slug: string
  name_fr: string
  name_en: string
  name_ar: string
  country: string // ISO code
  country_fr: string
  country_en: string
  country_ar?: string
  city_fr: string
  city_en: string
  city_ar?: string
  address_fr?: string
  description_fr: string
  description_en?: string
  description_ar?: string
  image?: string
  logo?: string
  website?: string
  contact_email?: string
  latitude: number
  longitude: number
  is_active: boolean
  sort_order: number
}

export const mockCampusExternalises: CampusExternalise[] = [
  {
    id: 'campus-dakar',
    slug: 'dakar',
    name_fr: 'Campus de Dakar',
    name_en: 'Dakar Campus',
    name_ar: 'حرم داكار',
    country: 'SN',
    country_fr: 'Sénégal',
    country_en: 'Senegal',
    country_ar: 'السنغال',
    city_fr: 'Dakar',
    city_en: 'Dakar',
    address_fr: 'Université Cheikh Anta Diop, Dakar-Fann',
    description_fr: 'Le campus de Dakar est notre plus ancien campus externalisé. Il accueille des formations en Management et en Santé en partenariat avec l\'UCAD.',
    description_en: 'The Dakar campus is our oldest external campus. It hosts Management and Health programs in partnership with UCAD.',
    image: 'https://picsum.photos/seed/campus-dakar/800/500',
    contact_email: 'dakar@usenghor.org',
    latitude: 14.6928,
    longitude: -17.4467,
    is_active: true,
    sort_order: 1
  },
  {
    id: 'campus-yaounde',
    slug: 'yaounde',
    name_fr: 'Campus de Yaoundé',
    name_en: 'Yaoundé Campus',
    name_ar: 'حرم ياوندي',
    country: 'CM',
    country_fr: 'Cameroun',
    country_en: 'Cameroon',
    country_ar: 'الكاميرون',
    city_fr: 'Yaoundé',
    city_en: 'Yaoundé',
    address_fr: 'Université de Yaoundé II, Soa',
    description_fr: 'Le campus de Yaoundé propose des formations en Management et en Environnement pour l\'Afrique Centrale.',
    image: 'https://picsum.photos/seed/campus-yaounde/800/500',
    contact_email: 'yaounde@usenghor.org',
    latitude: 3.8667,
    longitude: 11.5167,
    is_active: true,
    sort_order: 2
  },
  {
    id: 'campus-abidjan',
    slug: 'abidjan',
    name_fr: 'Campus d\'Abidjan',
    name_en: 'Abidjan Campus',
    name_ar: 'حرم أبيدجان',
    country: 'CI',
    country_fr: 'Côte d\'Ivoire',
    country_en: 'Ivory Coast',
    country_ar: 'ساحل العاج',
    city_fr: 'Abidjan',
    city_en: 'Abidjan',
    address_fr: 'Cocody, Abidjan',
    description_fr: 'Le campus d\'Abidjan est spécialisé dans les formations en Culture et Management.',
    image: 'https://picsum.photos/seed/campus-abidjan/800/500',
    contact_email: 'abidjan@usenghor.org',
    latitude: 5.3600,
    longitude: -4.0083,
    is_active: true,
    sort_order: 3
  },
  {
    id: 'campus-tunis',
    slug: 'tunis',
    name_fr: 'Campus de Tunis',
    name_en: 'Tunis Campus',
    name_ar: 'حرم تونس',
    country: 'TN',
    country_fr: 'Tunisie',
    country_en: 'Tunisia',
    country_ar: 'تونس',
    city_fr: 'Tunis',
    city_en: 'Tunis',
    city_ar: 'تونس',
    description_fr: 'Le campus de Tunis offre des programmes en Management et Santé pour le Maghreb.',
    image: 'https://picsum.photos/seed/campus-tunis/800/500',
    contact_email: 'tunis@usenghor.org',
    latitude: 36.8065,
    longitude: 10.1815,
    is_active: true,
    sort_order: 4
  },
  {
    id: 'campus-rabat',
    slug: 'rabat',
    name_fr: 'Campus de Rabat',
    name_en: 'Rabat Campus',
    name_ar: 'حرم الرباط',
    country: 'MA',
    country_fr: 'Maroc',
    country_en: 'Morocco',
    country_ar: 'المغرب',
    city_fr: 'Rabat',
    city_en: 'Rabat',
    city_ar: 'الرباط',
    address_fr: 'Université Mohammed V, Agdal',
    description_fr: 'Le campus de Rabat propose des formations en Culture et Patrimoine.',
    image: 'https://picsum.photos/seed/campus-rabat/800/500',
    contact_email: 'rabat@usenghor.org',
    latitude: 34.0209,
    longitude: -6.8416,
    is_active: true,
    sort_order: 5
  },
  {
    id: 'campus-libreville',
    slug: 'libreville',
    name_fr: 'Campus de Libreville',
    name_en: 'Libreville Campus',
    name_ar: 'حرم ليبرفيل',
    country: 'GA',
    country_fr: 'Gabon',
    country_en: 'Gabon',
    country_ar: 'الغابون',
    city_fr: 'Libreville',
    city_en: 'Libreville',
    description_fr: 'Le campus de Libreville est spécialisé dans les formations en Environnement et développement durable.',
    image: 'https://picsum.photos/seed/campus-libreville/800/500',
    contact_email: 'libreville@usenghor.org',
    latitude: 0.4162,
    longitude: 9.4673,
    is_active: true,
    sort_order: 6
  },
  {
    id: 'campus-cotonou',
    slug: 'cotonou',
    name_fr: 'Campus de Cotonou',
    name_en: 'Cotonou Campus',
    name_ar: 'حرم كوتونو',
    country: 'BJ',
    country_fr: 'Bénin',
    country_en: 'Benin',
    country_ar: 'بنين',
    city_fr: 'Cotonou',
    city_en: 'Cotonou',
    description_fr: 'Le campus de Cotonou propose des programmes en Santé et Management.',
    image: 'https://picsum.photos/seed/campus-cotonou/800/500',
    contact_email: 'cotonou@usenghor.org',
    latitude: 6.3703,
    longitude: 2.3912,
    is_active: true,
    sort_order: 7
  },
  {
    id: 'campus-budapest',
    slug: 'budapest',
    name_fr: 'Campus de Budapest',
    name_en: 'Budapest Campus',
    name_ar: 'حرم بودابست',
    country: 'HU',
    country_fr: 'Hongrie',
    country_en: 'Hungary',
    country_ar: 'المجر',
    city_fr: 'Budapest',
    city_en: 'Budapest',
    city_ar: 'بودابست',
    description_fr: 'Le campus de Budapest propose des formations en coopération avec les universités hongroises, offrant une porte vers l\'Europe centrale.',
    description_en: 'The Budapest campus offers programs in cooperation with Hungarian universities, providing a gateway to Central Europe.',
    image: 'https://picsum.photos/seed/campus-budapest/800/500',
    contact_email: 'budapest@usenghor.org',
    latitude: 47.4979,
    longitude: 19.0402,
    is_active: true,
    sort_order: 8
  },
  {
    id: 'campus-hanoi',
    slug: 'hanoi',
    name_fr: 'Campus de Hanoï',
    name_en: 'Hanoi Campus',
    name_ar: 'حرم هانوي',
    country: 'VN',
    country_fr: 'Vietnam',
    country_en: 'Vietnam',
    country_ar: 'فيتنام',
    city_fr: 'Hanoï',
    city_en: 'Hanoi',
    city_ar: 'هانوي',
    description_fr: 'Le campus de Hanoï renforce les liens avec l\'Asie francophone, proposant des formations adaptées au contexte vietnamien.',
    description_en: 'The Hanoi campus strengthens ties with French-speaking Asia, offering programs adapted to the Vietnamese context.',
    image: 'https://picsum.photos/seed/campus-hanoi/800/500',
    contact_email: 'hanoi@usenghor.org',
    latitude: 21.0285,
    longitude: 105.8542,
    is_active: true,
    sort_order: 9
  }
]

/**
 * Campus principal (Alexandrie) - pour référence sur la carte
 */
export const campusPrincipal = {
  name_fr: 'Siège - Alexandrie',
  name_en: 'Headquarters - Alexandria',
  city_fr: 'Alexandrie',
  country: 'EG',
  latitude: 31.0183,
  longitude: 29.7614,
  address_fr: '1 Place Ahmed Orabi, El Mancheya, Alexandrie'
}
