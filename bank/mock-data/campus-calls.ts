/**
 * Mock Data: Appels en cours des Campus Externalisés
 */

export interface CampusCall {
  id: string
  campus_id: string
  title_fr: string
  title_en?: string
  title_ar?: string
  type: 'candidature' | 'projet' | 'bourse'
  deadline: string
  description_fr: string
  description_en?: string
  description_ar?: string
  image: string
  partner_logos: string[]
  url?: string
  is_active: boolean
}

export const mockCampusCalls: CampusCall[] = [
  // Campus Dakar
  {
    id: 'call-dakar-1',
    campus_id: 'campus-dakar',
    title_fr: 'Appel à candidatures Master Management 2025',
    title_en: 'Call for Applications Master Management 2025',
    title_ar: 'دعوة للتقدم لماجستير الإدارة 2025',
    type: 'candidature',
    deadline: '2025-06-30',
    description_fr: 'Le campus de Dakar lance son appel à candidatures pour le Master en Management des Organisations pour la rentrée 2025.',
    description_en: 'The Dakar campus launches its call for applications for the Master in Organizational Management for the 2025 academic year.',
    image: 'https://picsum.photos/seed/call-dakar-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/20.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ],
    url: 'https://usenghor.org/candidatures/dakar-management',
    is_active: true
  },
  {
    id: 'call-dakar-2',
    campus_id: 'campus-dakar',
    title_fr: 'Bourses d\'excellence UCAD-Senghor',
    title_en: 'UCAD-Senghor Excellence Scholarships',
    title_ar: 'منح التميز UCAD-سنغور',
    type: 'bourse',
    deadline: '2025-05-15',
    description_fr: 'Bourses couvrant les frais de scolarité pour les étudiants méritants du Master Santé Publique.',
    description_en: 'Scholarships covering tuition fees for deserving students in the Public Health Master.',
    image: 'https://picsum.photos/seed/call-dakar-2/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/20.jpg'
    ],
    is_active: true
  },

  // Campus Yaoundé
  {
    id: 'call-yaounde-1',
    campus_id: 'campus-yaounde',
    title_fr: 'Appel à projets environnementaux 2025',
    title_en: 'Environmental Projects Call 2025',
    title_ar: 'دعوة لمشاريع بيئية 2025',
    type: 'projet',
    deadline: '2025-04-30',
    description_fr: 'Le campus de Yaoundé recherche des projets innovants dans le domaine de la gestion environnementale pour l\'Afrique Centrale.',
    description_en: 'The Yaoundé campus seeks innovative projects in environmental management for Central Africa.',
    image: 'https://picsum.photos/seed/call-yaounde-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/17.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ],
    is_active: true
  },

  // Campus Abidjan - Données enrichies
  {
    id: 'call-abidjan-1',
    campus_id: 'campus-abidjan',
    title_fr: 'Master 2 en Pilotage et évaluation des politiques publiques 2025',
    title_en: 'Master 2 in Public Policy Management and Evaluation 2025',
    title_ar: 'ماجستير 2 في قيادة وتقييم السياسات العامة 2025',
    type: 'candidature',
    deadline: '2025-09-15',
    description_fr: 'L\'Université Senghor, en partenariat avec l\'ENA de Côte d\'Ivoire et l\'Université Félix Houphouët-Boigny, ouvre les candidatures pour le Master 2 en Pilotage et Évaluation des Politiques Publiques. Cette formation d\'excellence vise à former des cadres supérieurs capables de concevoir, piloter et évaluer les politiques publiques dans l\'espace francophone africain.',
    description_en: 'Senghor University, in partnership with ENA of Côte d\'Ivoire and Félix Houphouët-Boigny University, opens applications for the Master 2 in Public Policy Management and Evaluation. This program of excellence aims to train senior executives capable of designing, managing and evaluating public policies in the francophone African space.',
    image: 'https://picsum.photos/seed/call-abidjan-pp/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.jpg'
    ],
    url: 'https://usenghor.org/candidatures/abidjan-politiques-publiques',
    is_active: true
  },
  {
    id: 'call-abidjan-2',
    campus_id: 'campus-abidjan',
    title_fr: 'Master 2 Culture et Industries Créatives 2025',
    title_en: 'Master 2 in Culture and Creative Industries 2025',
    title_ar: 'ماجستير 2 في الثقافة والصناعات الإبداعية 2025',
    type: 'candidature',
    deadline: '2025-07-15',
    description_fr: 'Le campus d\'Abidjan lance son appel à candidatures pour le Master 2 en Culture et Industries Créatives, en partenariat avec le Ministère de la Culture et de la Francophonie. Formation axée sur le management culturel, l\'économie créative et la valorisation du patrimoine africain.',
    description_en: 'The Abidjan campus launches its call for applications for the Master 2 in Culture and Creative Industries, in partnership with the Ministry of Culture and Francophonie. Training focused on cultural management, creative economy and the enhancement of African heritage.',
    image: 'https://picsum.photos/seed/call-abidjan-culture/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.jpg'
    ],
    url: 'https://usenghor.org/candidatures/abidjan-culture',
    is_active: true
  },
  {
    id: 'call-abidjan-3',
    campus_id: 'campus-abidjan',
    title_fr: 'Bourses d\'excellence Francophonie - Campus Abidjan 2025',
    title_en: 'Francophonie Excellence Scholarships - Abidjan Campus 2025',
    title_ar: 'منح التميز الفرنكوفونية - حرم أبيدجان 2025',
    type: 'bourse',
    deadline: '2025-06-30',
    description_fr: 'L\'Organisation Internationale de la Francophonie (OIF) et l\'Université Senghor offrent 15 bourses d\'excellence couvrant les frais de scolarité et une allocation mensuelle pour les étudiants méritants souhaitant intégrer les Masters du campus d\'Abidjan.',
    description_en: 'The International Organization of La Francophonie (OIF) and Senghor University offer 15 excellence scholarships covering tuition fees and a monthly allowance for deserving students wishing to join the Masters programs at the Abidjan campus.',
    image: 'https://picsum.photos/seed/call-abidjan-bourse/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.jpg'
    ],
    url: 'https://usenghor.org/bourses/abidjan-excellence',
    is_active: true
  },
  {
    id: 'call-abidjan-4',
    campus_id: 'campus-abidjan',
    title_fr: 'Appel à projets Innovation et Développement Durable 2025',
    title_en: 'Call for Projects Innovation and Sustainable Development 2025',
    title_ar: 'دعوة لمشاريع الابتكار والتنمية المستدامة 2025',
    type: 'projet',
    deadline: '2025-08-31',
    description_fr: 'Le campus d\'Abidjan, avec le soutien de l\'Agence Universitaire de la Francophonie (AUF), lance un appel à projets destiné aux chercheurs et doctorants travaillant sur des solutions innovantes pour le développement durable en Afrique de l\'Ouest.',
    description_en: 'The Abidjan campus, with the support of the Agence Universitaire de la Francophonie (AUF), launches a call for projects for researchers and doctoral students working on innovative solutions for sustainable development in West Africa.',
    image: 'https://picsum.photos/seed/call-abidjan-innovation/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.jpg'
    ],
    url: 'https://usenghor.org/projets/abidjan-innovation',
    is_active: true
  },

  // Campus Tunis
  {
    id: 'call-tunis-1',
    campus_id: 'campus-tunis',
    title_fr: 'Bourses de mobilité Maghreb',
    title_en: 'Maghreb Mobility Scholarships',
    title_ar: 'منح التنقل للمغرب العربي',
    type: 'bourse',
    deadline: '2025-05-31',
    description_fr: 'Programme de bourses pour faciliter la mobilité des étudiants entre les campus du Maghreb.',
    description_en: 'Scholarship program to facilitate student mobility between Maghreb campuses.',
    image: 'https://picsum.photos/seed/call-tunis-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/27.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.jpg'
    ],
    is_active: true
  },

  // Campus Rabat
  {
    id: 'call-rabat-1',
    campus_id: 'campus-rabat',
    title_fr: 'Appel à candidatures Patrimoine Culturel',
    title_en: 'Cultural Heritage Applications Call',
    title_ar: 'دعوة للتقدم للتراث الثقافي',
    type: 'candidature',
    deadline: '2025-06-15',
    description_fr: 'Le campus de Rabat recrute pour son Master en Gestion du Patrimoine Culturel.',
    image: 'https://picsum.photos/seed/call-rabat-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/31.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.jpg'
    ],
    is_active: true
  },

  // Campus Libreville
  {
    id: 'call-libreville-1',
    campus_id: 'campus-libreville',
    title_fr: 'Appel à projets Forêts tropicales',
    title_en: 'Tropical Forests Projects Call',
    type: 'projet',
    deadline: '2025-08-30',
    description_fr: 'Projets de recherche sur la conservation des forêts du bassin du Congo.',
    image: 'https://picsum.photos/seed/call-libreville-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/25.jpg'
    ],
    is_active: true
  },

  // Campus Cotonou
  {
    id: 'call-cotonou-1',
    campus_id: 'campus-cotonou',
    title_fr: 'Master Santé Publique 2025',
    title_en: 'Public Health Master 2025',
    type: 'candidature',
    deadline: '2025-07-01',
    description_fr: 'Ouverture des candidatures pour le Master en Santé Publique, spécialisation Santé Communautaire.',
    image: 'https://picsum.photos/seed/call-cotonou-1/800/400',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/11.jpg',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ],
    is_active: true
  }
]
