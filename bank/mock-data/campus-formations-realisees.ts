/**
 * Mock Data: Formations Réalisées par Campus
 * Historique des formations diplômantes réalisées sur chaque campus externalisé
 */

export interface CampusFormationRealisee {
  id: string
  campus_id: string
  title_fr: string
  title_en?: string
  title_ar?: string
  formation_type: 'master' | 'du' | 'certifiante'
  promotion: string // ex: "2022-2024", "2023"
  year: number
  graduates_count: number
  description_fr?: string
  description_en?: string
  image?: string
  partner_logos?: string[]
}

export const mockCampusFormationsRealisees: CampusFormationRealisee[] = [
  // Campus Abidjan
  {
    id: 'fr-abidjan-1',
    campus_id: 'campus-abidjan',
    title_fr: 'Master 2 Pilotage et Évaluation des Politiques Publiques',
    title_en: 'Master 2 in Public Policy Management and Evaluation',
    formation_type: 'master',
    promotion: '2022-2024',
    year: 2024,
    graduates_count: 28,
    description_fr: 'Première promotion du Master en partenariat avec l\'ENA de Côte d\'Ivoire.',
    image: 'https://picsum.photos/seed/fr-abidjan-pp/400/250',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/01.jpg'
    ]
  },
  {
    id: 'fr-abidjan-2',
    campus_id: 'campus-abidjan',
    title_fr: 'Master 2 Culture et Industries Créatives',
    title_en: 'Master 2 in Culture and Creative Industries',
    formation_type: 'master',
    promotion: '2021-2023',
    year: 2023,
    graduates_count: 24,
    description_fr: 'Formation axée sur le management culturel et l\'économie créative africaine.',
    image: 'https://picsum.photos/seed/fr-abidjan-culture/400/250',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png',
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/03.png'
    ]
  },
  {
    id: 'fr-abidjan-3',
    campus_id: 'campus-abidjan',
    title_fr: 'DU Entrepreneuriat Social',
    title_en: 'DU in Social Entrepreneurship',
    formation_type: 'du',
    promotion: '2023',
    year: 2023,
    graduates_count: 35,
    description_fr: 'Formation courte pour les porteurs de projets à impact social.',
    image: 'https://picsum.photos/seed/fr-abidjan-du/400/250',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/02.png'
    ]
  },
  {
    id: 'fr-abidjan-4',
    campus_id: 'campus-abidjan',
    title_fr: 'Master 2 Gestion des Ressources Humaines',
    title_en: 'Master 2 in Human Resources Management',
    formation_type: 'master',
    promotion: '2020-2022',
    year: 2022,
    graduates_count: 30,
    description_fr: 'Formation des professionnels RH pour les organisations africaines.',
    image: 'https://picsum.photos/seed/fr-abidjan-rh/400/250',
    partner_logos: [
      'https://usenghor-francophonie.org/wp-content/uploads/2023/09/12.png'
    ]
  }
]
