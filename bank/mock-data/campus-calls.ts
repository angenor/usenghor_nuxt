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
    is_active: true
  },

  // Campus Abidjan
  {
    id: 'call-abidjan-1',
    campus_id: 'campus-abidjan',
    title_fr: 'Master Culture et Industries Créatives 2025',
    title_en: 'Master in Culture and Creative Industries 2025',
    type: 'candidature',
    deadline: '2025-07-15',
    description_fr: 'Candidatures ouvertes pour le Master en Culture et Industries Créatives, en partenariat avec le Ministère de la Culture.',
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
    is_active: true
  }
]
