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
  // Siège - Alexandrie
  {
    id: 'event-siege-1',
    campus_id: 'siege',
    title_fr: 'Conférence inaugurale : L\'avenir de la Francophonie en Afrique',
    title_en: 'Inaugural Conference: The Future of Francophonie in Africa',
    title_ar: 'المؤتمر الافتتاحي: مستقبل الفرانكوفونية في أفريقيا',
    date: '2025-02-15',
    location_fr: 'Amphithéâtre principal, Université Senghor',
    location_en: 'Main Amphitheater, Senghor University',
    description_fr: 'Grande conférence réunissant des experts internationaux pour discuter des enjeux et perspectives de la Francophonie africaine.',
    image: 'https://picsum.photos/seed/event-siege-1/600/400',
    type: 'conference'
  },
  {
    id: 'event-siege-2',
    campus_id: 'siege',
    title_fr: 'Atelier de formation en leadership',
    title_en: 'Leadership Training Workshop',
    title_ar: 'ورشة تدريب على القيادة',
    date: '2025-02-28',
    location_fr: 'Salle de conférence, Bâtiment A',
    location_en: 'Conference Room, Building A',
    description_fr: 'Atelier intensif de trois jours sur le développement du leadership pour les futurs décideurs africains.',
    image: 'https://picsum.photos/seed/event-siege-2/600/400',
    type: 'atelier'
  },
  {
    id: 'event-siege-3',
    campus_id: 'siege',
    title_fr: 'Cérémonie de remise des diplômes 2024',
    title_en: 'Graduation Ceremony 2024',
    title_ar: 'حفل تخرج 2024',
    date: '2025-03-22',
    location_fr: 'Bibliothèque d\'Alexandrie',
    location_en: 'Library of Alexandria',
    description_fr: 'Cérémonie officielle de remise des diplômes pour la promotion 2024 en présence des autorités académiques et des partenaires.',
    image: 'https://picsum.photos/seed/event-siege-3/600/400',
    type: 'ceremonie'
  },
  {
    id: 'event-siege-4',
    campus_id: 'siege',
    title_fr: 'Séminaire international sur la gouvernance',
    title_en: 'International Seminar on Governance',
    title_ar: 'ندوة دولية حول الحوكمة',
    date: '2025-04-10',
    location_fr: 'Amphithéâtre principal, Université Senghor',
    location_en: 'Main Amphitheater, Senghor University',
    description_fr: 'Séminaire réunissant chercheurs et praticiens autour des questions de gouvernance en Afrique francophone.',
    image: 'https://picsum.photos/seed/event-siege-4/600/400',
    type: 'conference'
  },
  {
    id: 'event-siege-5',
    campus_id: 'siege',
    title_fr: 'Journée portes ouvertes',
    title_en: 'Open Day',
    title_ar: 'يوم مفتوح',
    date: '2025-05-05',
    location_fr: 'Université Senghor, Alexandrie',
    location_en: 'Senghor University, Alexandria',
    description_fr: 'Découvrez nos formations et rencontrez nos équipes pédagogiques lors de cette journée exceptionnelle.',
    image: 'https://picsum.photos/seed/event-siege-5/600/400',
    type: 'autre'
  },
  {
    id: 'event-siege-6',
    campus_id: 'siege',
    title_fr: 'Atelier méthodologie de recherche',
    title_en: 'Research Methodology Workshop',
    title_ar: 'ورشة منهجية البحث',
    date: '2025-05-20',
    location_fr: 'Salle de recherche, Bâtiment B',
    location_en: 'Research Room, Building B',
    description_fr: 'Formation intensive sur les méthodologies de recherche appliquées au développement africain.',
    image: 'https://picsum.photos/seed/event-siege-6/600/400',
    type: 'atelier'
  },
  {
    id: 'event-siege-7',
    campus_id: 'siege',
    title_fr: 'Forum des alumni',
    title_en: 'Alumni Forum',
    title_ar: 'منتدى الخريجين',
    date: '2025-06-15',
    location_fr: 'Centre de conférences, Alexandrie',
    location_en: 'Conference Center, Alexandria',
    description_fr: 'Rencontre annuelle des anciens étudiants pour échanger et renforcer le réseau Senghor.',
    image: 'https://picsum.photos/seed/event-siege-7/600/400',
    type: 'autre'
  },
  {
    id: 'event-siege-8',
    campus_id: 'siege',
    title_fr: 'Cérémonie d\'ouverture de l\'année académique 2025-2026',
    title_en: 'Opening Ceremony Academic Year 2025-2026',
    title_ar: 'حفل افتتاح العام الدراسي 2025-2026',
    date: '2025-09-15',
    location_fr: 'Amphithéâtre principal, Université Senghor',
    location_en: 'Main Amphitheater, Senghor University',
    description_fr: 'Cérémonie officielle marquant le début de la nouvelle année académique.',
    image: 'https://picsum.photos/seed/event-siege-8/600/400',
    type: 'ceremonie'
  },
  // Événements passés pour Alexandrie
  {
    id: 'event-siege-past-1',
    campus_id: 'siege',
    title_fr: 'Conférence sur l\'intelligence artificielle et l\'éducation',
    title_en: 'Conference on AI and Education',
    title_ar: 'مؤتمر الذكاء الاصطناعي والتعليم',
    date: '2024-12-05',
    location_fr: 'Amphithéâtre principal, Université Senghor',
    location_en: 'Main Amphitheater, Senghor University',
    description_fr: 'Conférence sur les applications de l\'IA dans l\'enseignement supérieur en Afrique.',
    image: 'https://picsum.photos/seed/event-siege-past-1/600/400',
    type: 'conference'
  },
  {
    id: 'event-siege-past-2',
    campus_id: 'siege',
    title_fr: 'Atelier entrepreneuriat africain',
    title_en: 'African Entrepreneurship Workshop',
    title_ar: 'ورشة ريادة الأعمال الأفريقية',
    date: '2024-11-18',
    location_fr: 'Salle de conférence, Bâtiment A',
    location_en: 'Conference Room, Building A',
    description_fr: 'Atelier pratique sur l\'entrepreneuriat et l\'innovation en Afrique.',
    image: 'https://picsum.photos/seed/event-siege-past-2/600/400',
    type: 'atelier'
  },
  {
    id: 'event-siege-past-3',
    campus_id: 'siege',
    title_fr: 'Séminaire sur les politiques de santé publique',
    title_en: 'Public Health Policy Seminar',
    title_ar: 'ندوة سياسات الصحة العامة',
    date: '2024-10-22',
    location_fr: 'Université Senghor, Alexandrie',
    location_en: 'Senghor University, Alexandria',
    description_fr: 'Séminaire réunissant experts et décideurs sur les politiques de santé en Afrique francophone.',
    image: 'https://picsum.photos/seed/event-siege-past-3/600/400',
    type: 'conference'
  },

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
    description_fr: 'Festival célébrant la diversité culturelle de la francophonie africaine avec des performances artistiques, expositions et rencontres.',
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
    description_fr: 'Masterclass animée par des professionnels des industries créatives africaines sur les tendances et opportunités du secteur.',
    image: 'https://picsum.photos/seed/event-abidjan-2/600/400',
    type: 'atelier'
  },
  {
    id: 'event-abidjan-3',
    campus_id: 'campus-abidjan',
    title_fr: 'Conférence internationale sur l\'économie culturelle africaine',
    title_en: 'International Conference on African Cultural Economy',
    date: '2025-05-15',
    location_fr: 'Hôtel Ivoire, Abidjan',
    location_en: 'Hotel Ivoire, Abidjan',
    description_fr: 'Grande conférence réunissant chercheurs, entrepreneurs et décideurs pour explorer les opportunités économiques du secteur culturel en Afrique.',
    image: 'https://picsum.photos/seed/event-abidjan-3/600/400',
    type: 'conference'
  },
  {
    id: 'event-abidjan-4',
    campus_id: 'campus-abidjan',
    title_fr: 'Cérémonie d\'ouverture de l\'année académique 2025-2026',
    title_en: 'Opening Ceremony Academic Year 2025-2026',
    date: '2025-09-15',
    location_fr: 'Campus d\'Abidjan',
    description_fr: 'Cérémonie officielle marquant le début de la nouvelle année académique avec la présentation des nouveaux programmes et la bienvenue aux étudiants.',
    image: 'https://picsum.photos/seed/event-abidjan-4/600/400',
    type: 'ceremonie'
  },
  {
    id: 'event-abidjan-5',
    campus_id: 'campus-abidjan',
    title_fr: 'Atelier de design thinking pour l\'innovation sociale',
    title_en: 'Design Thinking Workshop for Social Innovation',
    date: '2025-06-08',
    location_fr: 'Espace Innovation, Campus d\'Abidjan',
    description_fr: 'Atelier pratique de deux jours sur les méthodologies de design thinking appliquées aux défis sociaux africains.',
    image: 'https://picsum.photos/seed/event-abidjan-5/600/400',
    type: 'atelier'
  },
  {
    id: 'event-abidjan-6',
    campus_id: 'campus-abidjan',
    title_fr: 'Table ronde : Femmes leaders dans la culture africaine',
    title_en: 'Panel: Women Leaders in African Culture',
    date: '2025-03-08',
    location_fr: 'Auditorium du Campus, Abidjan',
    description_fr: 'À l\'occasion de la Journée internationale des droits des femmes, rencontre avec des femmes qui façonnent le paysage culturel africain.',
    image: 'https://picsum.photos/seed/event-abidjan-6/600/400',
    type: 'conference'
  },
  {
    id: 'event-abidjan-7',
    campus_id: 'campus-abidjan',
    title_fr: 'Hackathon : Solutions numériques pour le patrimoine africain',
    title_en: 'Hackathon: Digital Solutions for African Heritage',
    date: '2025-07-20',
    location_fr: 'Campus d\'Abidjan',
    description_fr: '48 heures pour développer des solutions innovantes de préservation et valorisation du patrimoine culturel africain grâce au numérique.',
    image: 'https://picsum.photos/seed/event-abidjan-7/600/400',
    type: 'atelier'
  },
  {
    id: 'event-abidjan-8',
    campus_id: 'campus-abidjan',
    title_fr: 'Colloque : Politiques culturelles et développement durable',
    title_en: 'Symposium: Cultural Policies and Sustainable Development',
    date: '2025-10-12',
    location_fr: 'Fondation Félix Houphouët-Boigny, Yamoussoukro',
    description_fr: 'Colloque interdisciplinaire explorant le rôle des politiques culturelles dans l\'atteinte des objectifs de développement durable.',
    image: 'https://picsum.photos/seed/event-abidjan-8/600/400',
    type: 'conference'
  },
  {
    id: 'event-abidjan-9',
    campus_id: 'campus-abidjan',
    title_fr: 'Cérémonie de remise des diplômes - Promotion 2025',
    title_en: 'Graduation Ceremony - Class of 2025',
    date: '2025-12-15',
    location_fr: 'Palais de la Culture, Abidjan',
    description_fr: 'Célébration officielle de la promotion 2025 en présence des autorités académiques, des familles et des partenaires institutionnels.',
    image: 'https://picsum.photos/seed/event-abidjan-9/600/400',
    type: 'ceremonie'
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
