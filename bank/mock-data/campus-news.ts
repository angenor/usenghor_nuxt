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
    excerpt_fr: 'Le campus sera partenaire officiel du Marché des Arts du Spectacle Africain en mars 2025. Cette collaboration permettra aux étudiants de participer activement à l\'organisation de cet événement majeur de la scène culturelle africaine.',
    excerpt_en: 'The campus will be an official partner of the African Performing Arts Market in March 2025. This collaboration will allow students to actively participate in organizing this major event on the African cultural scene.',
    image: 'https://picsum.photos/seed/news-abidjan-1/800/500',
    url: '/actualites/masa-2025'
  },
  {
    id: 'news-abidjan-2',
    campus_id: 'campus-abidjan',
    title_fr: 'Exposition des travaux d\'étudiants au Musée des Civilisations',
    title_en: 'Student Works Exhibition at Museum of Civilizations',
    date: '2024-12-15',
    excerpt_fr: 'Les étudiants du Master Culture présentent leurs projets de fin d\'études au musée. Une occasion unique de découvrir les talents émergents de la scène culturelle ivoirienne.',
    excerpt_en: 'Master Culture students present their final projects at the museum. A unique opportunity to discover emerging talents from the Ivorian cultural scene.',
    image: 'https://picsum.photos/seed/news-abidjan-2/800/500'
  },
  {
    id: 'news-abidjan-3',
    campus_id: 'campus-abidjan',
    title_fr: 'Signature d\'un accord avec l\'ENA de Côte d\'Ivoire',
    title_en: 'Agreement Signed with ENA of Ivory Coast',
    date: '2024-11-28',
    excerpt_fr: 'Le campus renforce son partenariat stratégique avec l\'École Nationale d\'Administration pour la formation des cadres de la fonction publique ivoirienne.',
    excerpt_en: 'The campus strengthens its strategic partnership with the National School of Administration for training Ivorian civil service executives.',
    image: 'https://picsum.photos/seed/news-abidjan-3/800/500'
  },
  {
    id: 'news-abidjan-4',
    campus_id: 'campus-abidjan',
    title_fr: 'Remise des diplômes de la promotion 2024',
    title_en: '2024 Graduation Ceremony',
    date: '2024-10-20',
    excerpt_fr: 'Cérémonie officielle de remise des diplômes en présence du Ministre de l\'Enseignement Supérieur. 85 diplômés ont été célébrés cette année.',
    excerpt_en: 'Official graduation ceremony in the presence of the Minister of Higher Education. 85 graduates were celebrated this year.',
    image: 'https://picsum.photos/seed/news-abidjan-4/800/500'
  },
  {
    id: 'news-abidjan-5',
    campus_id: 'campus-abidjan',
    title_fr: 'Lancement du programme de mentorat avec les alumni',
    title_en: 'Launch of Alumni Mentorship Program',
    date: '2024-09-15',
    excerpt_fr: 'Un nouveau programme de mentorat connecte les étudiants actuels avec les anciens diplômés occupant des postes stratégiques en Afrique de l\'Ouest.',
    excerpt_en: 'A new mentorship program connects current students with alumni holding strategic positions in West Africa.',
    image: 'https://picsum.photos/seed/news-abidjan-5/800/500'
  },
  {
    id: 'news-abidjan-6',
    campus_id: 'campus-abidjan',
    title_fr: 'Conférence internationale sur le développement durable en Afrique',
    title_en: 'International Conference on Sustainable Development in Africa',
    date: '2024-08-22',
    excerpt_fr: 'Le campus a organisé une conférence réunissant des experts internationaux sur les enjeux du développement durable en Afrique subsaharienne.',
    excerpt_en: 'The campus organized a conference bringing together international experts on sustainable development challenges in sub-Saharan Africa.',
    image: 'https://picsum.photos/seed/news-abidjan-6/800/500'
  },
  {
    id: 'news-abidjan-7',
    campus_id: 'campus-abidjan',
    title_fr: 'Ouverture des inscriptions pour la rentrée 2025',
    title_en: 'Registration Open for 2025 Academic Year',
    date: '2024-07-10',
    excerpt_fr: 'Les candidatures sont ouvertes pour les Masters en Management, Culture et Politiques Publiques. Date limite : 30 septembre 2024.',
    excerpt_en: 'Applications are open for Masters in Management, Culture and Public Policy. Deadline: September 30, 2024.',
    image: 'https://picsum.photos/seed/news-abidjan-7/800/500'
  },
  {
    id: 'news-abidjan-8',
    campus_id: 'campus-abidjan',
    title_fr: 'Visite de la Secrétaire Générale de l\'OIF',
    title_en: 'Visit from OIF Secretary General',
    date: '2024-06-05',
    excerpt_fr: 'La Secrétaire Générale de l\'Organisation Internationale de la Francophonie a visité le campus et rencontré les étudiants.',
    excerpt_en: 'The Secretary General of the International Organization of the Francophonie visited the campus and met with students.',
    image: 'https://picsum.photos/seed/news-abidjan-8/800/500'
  },
  {
    id: 'news-abidjan-9',
    campus_id: 'campus-abidjan',
    title_fr: 'Hackathon Innovation Sociale : 48h pour changer le monde',
    title_en: 'Social Innovation Hackathon: 48 Hours to Change the World',
    date: '2024-05-18',
    excerpt_fr: 'Plus de 100 étudiants ont participé au hackathon pour développer des solutions innovantes aux défis sociaux de la Côte d\'Ivoire.',
    excerpt_en: 'Over 100 students participated in the hackathon to develop innovative solutions to Ivory Coast\'s social challenges.',
    image: 'https://picsum.photos/seed/news-abidjan-9/800/500'
  },
  {
    id: 'news-abidjan-10',
    campus_id: 'campus-abidjan',
    title_fr: 'Nouveau laboratoire numérique inauguré',
    title_en: 'New Digital Lab Inaugurated',
    date: '2024-04-12',
    excerpt_fr: 'Un laboratoire équipé des dernières technologies a été inauguré pour accompagner la transformation digitale de nos formations.',
    excerpt_en: 'A laboratory equipped with the latest technologies was inaugurated to support the digital transformation of our programs.',
    image: 'https://picsum.photos/seed/news-abidjan-10/800/500'
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
