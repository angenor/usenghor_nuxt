/**
 * Mock Data: Événements des Campus Externalisés
 */

export interface CampusEvent {
  id: string
  campus_id: string
  title_fr: string
  title_en?: string
  title_ar?: string
  date: string
  location_fr: string
  location_en?: string
  description_fr: string
  image?: string
  type: 'conference' | 'atelier' | 'ceremonie' | 'autre'
}

export const mockCampusEvents: CampusEvent[] = [
  // Campus Dakar
  {
    id: 'event-dakar-1',
    campus_id: 'campus-dakar',
    title_fr: 'Conférence sur le développement durable en Afrique de l\'Ouest',
    title_en: 'Conference on Sustainable Development in West Africa',
    date: '2025-03-15',
    location_fr: 'Auditorium UCAD, Dakar',
    location_en: 'UCAD Auditorium, Dakar',
    description_fr: 'Conférence réunissant experts et décideurs pour discuter des enjeux du développement durable dans la sous-région.',
    image: 'https://picsum.photos/seed/event-dakar-1/600/400',
    type: 'conference'
  },
  {
    id: 'event-dakar-2',
    campus_id: 'campus-dakar',
    title_fr: 'Atelier entrepreneuriat social',
    title_en: 'Social Entrepreneurship Workshop',
    date: '2025-04-22',
    location_fr: 'Campus de Dakar',
    description_fr: 'Atelier pratique sur la création et la gestion d\'entreprises sociales.',
    image: 'https://picsum.photos/seed/event-dakar-2/600/400',
    type: 'atelier'
  },
  {
    id: 'event-dakar-3',
    campus_id: 'campus-dakar',
    title_fr: 'Cérémonie de remise des diplômes 2024',
    title_en: 'Graduation Ceremony 2024',
    date: '2025-02-10',
    location_fr: 'Grand Théâtre National, Dakar',
    description_fr: 'Cérémonie officielle de remise des diplômes pour la promotion 2024.',
    image: 'https://picsum.photos/seed/event-dakar-3/600/400',
    type: 'ceremonie'
  },

  // Campus Yaoundé
  {
    id: 'event-yaounde-1',
    campus_id: 'campus-yaounde',
    title_fr: 'Forum environnement Afrique Centrale',
    title_en: 'Central Africa Environment Forum',
    date: '2025-05-18',
    location_fr: 'Université de Yaoundé II',
    description_fr: 'Forum régional sur la protection de l\'environnement et la biodiversité en Afrique Centrale.',
    image: 'https://picsum.photos/seed/event-yaounde-1/600/400',
    type: 'conference'
  },
  {
    id: 'event-yaounde-2',
    campus_id: 'campus-yaounde',
    title_fr: 'Journée portes ouvertes',
    title_en: 'Open Day',
    date: '2025-06-05',
    location_fr: 'Campus de Yaoundé',
    description_fr: 'Découvrez nos formations et rencontrez nos enseignants.',
    image: 'https://picsum.photos/seed/event-yaounde-2/600/400',
    type: 'autre'
  },

  // Campus Abidjan
  {
    id: 'event-abidjan-1',
    campus_id: 'campus-abidjan',
    title_fr: 'Festival des cultures francophones',
    title_en: 'Francophone Cultures Festival',
    date: '2025-03-20',
    location_fr: 'Palais de la Culture, Abidjan',
    description_fr: 'Festival célébrant la diversité culturelle de la francophonie africaine.',
    image: 'https://picsum.photos/seed/event-abidjan-1/600/400',
    type: 'autre'
  },
  {
    id: 'event-abidjan-2',
    campus_id: 'campus-abidjan',
    title_fr: 'Masterclass industries créatives',
    title_en: 'Creative Industries Masterclass',
    date: '2025-04-10',
    location_fr: 'Campus d\'Abidjan',
    description_fr: 'Masterclass animée par des professionnels des industries créatives africaines.',
    image: 'https://picsum.photos/seed/event-abidjan-2/600/400',
    type: 'atelier'
  },

  // Campus Tunis
  {
    id: 'event-tunis-1',
    campus_id: 'campus-tunis',
    title_fr: 'Colloque santé publique Maghreb',
    title_en: 'Maghreb Public Health Symposium',
    title_ar: 'ندوة الصحة العامة المغاربية',
    date: '2025-04-25',
    location_fr: 'Cité des Sciences, Tunis',
    description_fr: 'Colloque international sur les défis de la santé publique au Maghreb.',
    image: 'https://picsum.photos/seed/event-tunis-1/600/400',
    type: 'conference'
  },
  {
    id: 'event-tunis-2',
    campus_id: 'campus-tunis',
    title_fr: 'Atelier e-santé et innovation',
    title_en: 'E-health and Innovation Workshop',
    date: '2025-05-12',
    location_fr: 'Campus de Tunis',
    description_fr: 'Atelier sur les innovations numériques dans le secteur de la santé.',
    image: 'https://picsum.photos/seed/event-tunis-2/600/400',
    type: 'atelier'
  },

  // Campus Rabat
  {
    id: 'event-rabat-1',
    campus_id: 'campus-rabat',
    title_fr: 'Conférence patrimoine et tourisme durable',
    title_en: 'Heritage and Sustainable Tourism Conference',
    title_ar: 'مؤتمر التراث والسياحة المستدامة',
    date: '2025-05-08',
    location_fr: 'Bibliothèque Nationale, Rabat',
    description_fr: 'Conférence sur la valorisation du patrimoine culturel par le tourisme durable.',
    image: 'https://picsum.photos/seed/event-rabat-1/600/400',
    type: 'conference'
  },
  {
    id: 'event-rabat-2',
    campus_id: 'campus-rabat',
    title_fr: 'Visite des sites historiques de Rabat',
    title_en: 'Rabat Historical Sites Visit',
    date: '2025-03-28',
    location_fr: 'Centre historique de Rabat',
    description_fr: 'Sortie pédagogique pour les étudiants du Master Patrimoine.',
    image: 'https://picsum.photos/seed/event-rabat-2/600/400',
    type: 'autre'
  },

  // Campus Libreville
  {
    id: 'event-libreville-1',
    campus_id: 'campus-libreville',
    title_fr: 'Séminaire biodiversité du bassin du Congo',
    title_en: 'Congo Basin Biodiversity Seminar',
    date: '2025-06-12',
    location_fr: 'Campus de Libreville',
    description_fr: 'Séminaire sur la conservation de la biodiversité dans le bassin du Congo.',
    image: 'https://picsum.photos/seed/event-libreville-1/600/400',
    type: 'conference'
  },
  {
    id: 'event-libreville-2',
    campus_id: 'campus-libreville',
    title_fr: 'Cérémonie de rentrée académique',
    title_en: 'Academic Year Opening Ceremony',
    date: '2025-10-01',
    location_fr: 'Campus de Libreville',
    description_fr: 'Cérémonie officielle de rentrée pour la nouvelle année académique.',
    image: 'https://picsum.photos/seed/event-libreville-2/600/400',
    type: 'ceremonie'
  },

  // Campus Cotonou
  {
    id: 'event-cotonou-1',
    campus_id: 'campus-cotonou',
    title_fr: 'Journée mondiale de la santé',
    title_en: 'World Health Day',
    date: '2025-04-07',
    location_fr: 'Campus de Cotonou',
    description_fr: 'Événement spécial avec conférences et stands d\'information santé.',
    image: 'https://picsum.photos/seed/event-cotonou-1/600/400',
    type: 'autre'
  },
  {
    id: 'event-cotonou-2',
    campus_id: 'campus-cotonou',
    title_fr: 'Atelier gestion hospitalière',
    title_en: 'Hospital Management Workshop',
    date: '2025-05-20',
    location_fr: 'CHU de Cotonou',
    description_fr: 'Atelier pratique sur la gestion des établissements de santé.',
    image: 'https://picsum.photos/seed/event-cotonou-2/600/400',
    type: 'atelier'
  }
]
