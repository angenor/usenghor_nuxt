/**
 * Mock Data: Actualités des Campus Externalisés
 */

export interface CampusNews {
  id: string
  campus_id: string
  title_fr: string
  title_en?: string
  title_ar?: string
  date: string
  excerpt_fr: string
  excerpt_en?: string
  image?: string
  url?: string
}

export const mockCampusNews: CampusNews[] = [
  // Campus Dakar
  {
    id: 'news-dakar-1',
    campus_id: 'campus-dakar',
    title_fr: 'Nouveau partenariat avec l\'Université de Bordeaux',
    title_en: 'New Partnership with University of Bordeaux',
    date: '2025-01-15',
    excerpt_fr: 'Le campus de Dakar signe un accord de coopération avec l\'Université de Bordeaux pour renforcer les échanges académiques.',
    excerpt_en: 'The Dakar campus signs a cooperation agreement with the University of Bordeaux to strengthen academic exchanges.',
    image: 'https://picsum.photos/seed/news-dakar-1/600/400',
    url: '/actualites/partenariat-bordeaux'
  },
  {
    id: 'news-dakar-2',
    campus_id: 'campus-dakar',
    title_fr: 'Succès de la promotion 2024 : 95% d\'insertion professionnelle',
    title_en: '2024 Cohort Success: 95% Employment Rate',
    date: '2024-12-20',
    excerpt_fr: 'Les diplômés du Master Management affichent un taux d\'insertion professionnelle exceptionnel.',
    image: 'https://picsum.photos/seed/news-dakar-2/600/400'
  },

  // Campus Yaoundé
  {
    id: 'news-yaounde-1',
    campus_id: 'campus-yaounde',
    title_fr: 'Lancement du programme de recherche sur les forêts équatoriales',
    title_en: 'Launch of Equatorial Forests Research Program',
    date: '2025-01-10',
    excerpt_fr: 'Le campus de Yaoundé lance un programme de recherche ambitieux sur la préservation des forêts équatoriales.',
    image: 'https://picsum.photos/seed/news-yaounde-1/600/400'
  },
  {
    id: 'news-yaounde-2',
    campus_id: 'campus-yaounde',
    title_fr: 'Visite officielle du Ministre de l\'Environnement',
    title_en: 'Official Visit from the Minister of Environment',
    date: '2024-11-28',
    excerpt_fr: 'Le Ministre de l\'Environnement a visité le campus pour discuter des collaborations futures.',
    image: 'https://picsum.photos/seed/news-yaounde-2/600/400'
  },

  // Campus Abidjan
  {
    id: 'news-abidjan-1',
    campus_id: 'campus-abidjan',
    title_fr: 'Le campus d\'Abidjan accueille le MASA 2025',
    title_en: 'Abidjan Campus Hosts MASA 2025',
    date: '2025-01-05',
    excerpt_fr: 'Le campus sera partenaire officiel du Marché des Arts du Spectacle Africain en mars 2025.',
    image: 'https://picsum.photos/seed/news-abidjan-1/600/400'
  },
  {
    id: 'news-abidjan-2',
    campus_id: 'campus-abidjan',
    title_fr: 'Exposition des travaux d\'étudiants au Musée des Civilisations',
    title_en: 'Student Works Exhibition at Museum of Civilizations',
    date: '2024-12-15',
    excerpt_fr: 'Les étudiants du Master Culture présentent leurs projets de fin d\'études au musée.',
    image: 'https://picsum.photos/seed/news-abidjan-2/600/400'
  },

  // Campus Tunis
  {
    id: 'news-tunis-1',
    campus_id: 'campus-tunis',
    title_fr: 'Accréditation internationale pour le Master Santé Publique',
    title_en: 'International Accreditation for Public Health Master',
    title_ar: 'اعتماد دولي لماجستير الصحة العامة',
    date: '2025-01-08',
    excerpt_fr: 'Le Master Santé Publique du campus de Tunis obtient l\'accréditation de l\'APHEA.',
    excerpt_en: 'The Public Health Master at the Tunis campus receives APHEA accreditation.',
    image: 'https://picsum.photos/seed/news-tunis-1/600/400'
  },
  {
    id: 'news-tunis-2',
    campus_id: 'campus-tunis',
    title_fr: 'Coopération renforcée avec l\'OMS Afrique du Nord',
    title_en: 'Strengthened Cooperation with WHO North Africa',
    date: '2024-12-10',
    excerpt_fr: 'Signature d\'un protocole d\'accord avec le bureau régional de l\'OMS.',
    image: 'https://picsum.photos/seed/news-tunis-2/600/400'
  },

  // Campus Rabat
  {
    id: 'news-rabat-1',
    campus_id: 'campus-rabat',
    title_fr: 'Le campus de Rabat classé parmi les meilleures formations en patrimoine',
    title_en: 'Rabat Campus Ranked Among Top Heritage Programs',
    title_ar: 'تصنيف فرع الرباط ضمن أفضل برامج التراث',
    date: '2025-01-12',
    excerpt_fr: 'Le Master en Gestion du Patrimoine Culturel est reconnu par l\'UNESCO comme formation d\'excellence.',
    image: 'https://picsum.photos/seed/news-rabat-1/600/400'
  },
  {
    id: 'news-rabat-2',
    campus_id: 'campus-rabat',
    title_fr: 'Projet de restauration de la médina de Fès',
    title_en: 'Fez Medina Restoration Project',
    date: '2024-11-20',
    excerpt_fr: 'Les étudiants participent à un projet de restauration dans le cadre de leur formation.',
    image: 'https://picsum.photos/seed/news-rabat-2/600/400'
  },

  // Campus Libreville
  {
    id: 'news-libreville-1',
    campus_id: 'campus-libreville',
    title_fr: 'Nouvelle spécialisation en économie verte',
    title_en: 'New Specialization in Green Economy',
    date: '2025-01-03',
    excerpt_fr: 'Le campus lance une nouvelle spécialisation axée sur l\'économie verte et le développement durable.',
    image: 'https://picsum.photos/seed/news-libreville-1/600/400'
  },
  {
    id: 'news-libreville-2',
    campus_id: 'campus-libreville',
    title_fr: 'Mission de terrain dans les parcs nationaux du Gabon',
    title_en: 'Field Mission in Gabon National Parks',
    date: '2024-12-05',
    excerpt_fr: 'Les étudiants ont participé à une mission de terrain dans les parcs nationaux.',
    image: 'https://picsum.photos/seed/news-libreville-2/600/400'
  },

  // Campus Cotonou
  {
    id: 'news-cotonou-1',
    campus_id: 'campus-cotonou',
    title_fr: 'Partenariat avec le Ministère de la Santé du Bénin',
    title_en: 'Partnership with Benin Ministry of Health',
    date: '2025-01-06',
    excerpt_fr: 'Signature d\'un accord de partenariat pour renforcer la formation des cadres de santé.',
    image: 'https://picsum.photos/seed/news-cotonou-1/600/400'
  },
  {
    id: 'news-cotonou-2',
    campus_id: 'campus-cotonou',
    title_fr: 'Stage hospitalier : retour sur une expérience enrichissante',
    title_en: 'Hospital Internship: A Rewarding Experience',
    date: '2024-11-25',
    excerpt_fr: 'Témoignages des étudiants sur leurs stages dans les hôpitaux partenaires.',
    image: 'https://picsum.photos/seed/news-cotonou-2/600/400'
  }
]
