/**
 * Mock Data: Médiathèque des Campus Externalisés
 */

export interface CampusMedia {
  id: string
  campus_id: string
  project_id?: string // Optional link to a project
  type: 'video' | 'photo'
  title_fr: string
  title_en?: string
  url: string
  thumbnail?: string
  date: string
}

export const mockCampusMedia: CampusMedia[] = [
  // Campus Dakar
  {
    id: 'media-dakar-1',
    campus_id: 'campus-dakar',
    type: 'video',
    title_fr: 'Présentation du campus de Dakar',
    title_en: 'Dakar Campus Presentation',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-dakar-1/400/225',
    date: '2024-09-15'
  },
  {
    id: 'media-dakar-2',
    campus_id: 'campus-dakar',
    type: 'photo',
    title_fr: 'Cérémonie de remise des diplômes 2024',
    title_en: 'Graduation Ceremony 2024',
    url: 'https://picsum.photos/seed/media-dakar-2/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-dakar-2/400/300',
    date: '2024-11-20'
  },
  {
    id: 'media-dakar-3',
    campus_id: 'campus-dakar',
    type: 'photo',
    title_fr: 'Vie étudiante au campus',
    title_en: 'Student Life on Campus',
    url: 'https://picsum.photos/seed/media-dakar-3/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-dakar-3/400/300',
    date: '2024-10-05'
  },

  // Campus Yaoundé
  {
    id: 'media-yaounde-1',
    campus_id: 'campus-yaounde',
    type: 'video',
    title_fr: 'Documentaire sur les formations environnementales',
    title_en: 'Documentary on Environmental Programs',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-yaounde-1/400/225',
    date: '2024-08-20'
  },
  {
    id: 'media-yaounde-2',
    campus_id: 'campus-yaounde',
    type: 'photo',
    title_fr: 'Mission de terrain forêt équatoriale',
    title_en: 'Equatorial Forest Field Mission',
    url: 'https://picsum.photos/seed/media-yaounde-2/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-yaounde-2/400/300',
    date: '2024-07-15'
  },

  // Campus Abidjan
  {
    id: 'media-abidjan-1',
    campus_id: 'campus-abidjan',
    type: 'video',
    title_fr: 'Témoignages d\'anciens étudiants',
    title_en: 'Alumni Testimonials',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-abidjan-1/400/225',
    date: '2024-10-10'
  },
  {
    id: 'media-abidjan-2',
    campus_id: 'campus-abidjan',
    type: 'photo',
    title_fr: 'Festival des cultures 2024',
    title_en: 'Cultural Festival 2024',
    url: 'https://picsum.photos/seed/media-abidjan-2/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-abidjan-2/400/300',
    date: '2024-03-25'
  },
  {
    id: 'media-abidjan-3',
    campus_id: 'campus-abidjan',
    type: 'photo',
    title_fr: 'Exposition des travaux étudiants',
    title_en: 'Student Works Exhibition',
    url: 'https://picsum.photos/seed/media-abidjan-3/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-abidjan-3/400/300',
    date: '2024-12-15'
  },

  // Campus Tunis
  {
    id: 'media-tunis-1',
    campus_id: 'campus-tunis',
    type: 'video',
    title_fr: 'Conférence internationale santé publique',
    title_en: 'International Public Health Conference',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-tunis-1/400/225',
    date: '2024-05-18'
  },
  {
    id: 'media-tunis-2',
    campus_id: 'campus-tunis',
    type: 'photo',
    title_fr: 'Visite du campus',
    title_en: 'Campus Tour',
    url: 'https://picsum.photos/seed/media-tunis-2/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-tunis-2/400/300',
    date: '2024-09-01'
  },

  // Campus Rabat
  {
    id: 'media-rabat-1',
    campus_id: 'campus-rabat',
    type: 'video',
    title_fr: 'Le Master Patrimoine Culturel en images',
    title_en: 'Cultural Heritage Master in Pictures',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-rabat-1/400/225',
    date: '2024-06-20'
  },
  {
    id: 'media-rabat-2',
    campus_id: 'campus-rabat',
    type: 'photo',
    title_fr: 'Projet de restauration médina de Fès',
    title_en: 'Fez Medina Restoration Project',
    url: 'https://picsum.photos/seed/media-rabat-2/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-rabat-2/400/300',
    date: '2024-11-15'
  },
  {
    id: 'media-rabat-3',
    campus_id: 'campus-rabat',
    type: 'photo',
    title_fr: 'Sortie pédagogique sites historiques',
    title_en: 'Historical Sites Field Trip',
    url: 'https://picsum.photos/seed/media-rabat-3/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-rabat-3/400/300',
    date: '2024-04-10'
  },

  // Campus Libreville
  {
    id: 'media-libreville-1',
    campus_id: 'campus-libreville',
    type: 'video',
    title_fr: 'Mission dans les parcs nationaux',
    title_en: 'National Parks Mission',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-libreville-1/400/225',
    date: '2024-07-25'
  },
  {
    id: 'media-libreville-2',
    campus_id: 'campus-libreville',
    type: 'photo',
    title_fr: 'Biodiversité du bassin du Congo',
    title_en: 'Congo Basin Biodiversity',
    url: 'https://picsum.photos/seed/media-libreville-2/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-libreville-2/400/300',
    date: '2024-08-05'
  },

  // Campus Cotonou
  {
    id: 'media-cotonou-1',
    campus_id: 'campus-cotonou',
    type: 'video',
    title_fr: 'Présentation du Master Santé Publique',
    title_en: 'Public Health Master Presentation',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-cotonou-1/400/225',
    date: '2024-09-10'
  },
  {
    id: 'media-cotonou-2',
    campus_id: 'campus-cotonou',
    type: 'photo',
    title_fr: 'Stage hospitalier des étudiants',
    title_en: 'Student Hospital Internship',
    url: 'https://picsum.photos/seed/media-cotonou-2/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-cotonou-2/400/300',
    date: '2024-11-25'
  },
  {
    id: 'media-cotonou-3',
    campus_id: 'campus-cotonou',
    type: 'photo',
    title_fr: 'Journée mondiale de la santé 2024',
    title_en: 'World Health Day 2024',
    url: 'https://picsum.photos/seed/media-cotonou-3/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-cotonou-3/400/300',
    date: '2024-04-07'
  },

  // ============================================
  // MÉDIAS LIÉS AUX PROJETS
  // ============================================

  // Transform'Action Africa - Médias
  {
    id: 'media-transformaction-1',
    campus_id: 'siege',
    project_id: 'project-transformaction-africa',
    type: 'video',
    title_fr: 'Présentation de Transform\'Action Africa',
    title_en: 'Transform\'Action Africa Presentation',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-ta-1/400/225',
    date: '2024-09-15'
  },
  {
    id: 'media-transformaction-2',
    campus_id: 'siege',
    project_id: 'project-transformaction-africa',
    type: 'video',
    title_fr: 'Témoignages des Transform\'acteurs 2023',
    title_en: 'Transform\'actors 2023 Testimonials',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-ta-2/400/225',
    date: '2024-06-20'
  },
  {
    id: 'media-transformaction-3',
    campus_id: 'siege',
    project_id: 'project-transformaction-africa',
    type: 'photo',
    title_fr: 'Session présentielle Alexandrie 2024',
    title_en: 'Alexandria In-person Session 2024',
    url: 'https://picsum.photos/seed/media-ta-3/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-ta-3/400/300',
    date: '2024-10-05'
  },
  {
    id: 'media-transformaction-4',
    campus_id: 'siege',
    project_id: 'project-transformaction-africa',
    type: 'photo',
    title_fr: 'Cérémonie de clôture Cohorte 2024',
    title_en: '2024 Cohort Closing Ceremony',
    url: 'https://picsum.photos/seed/media-ta-4/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-ta-4/400/300',
    date: '2025-01-10'
  },
  {
    id: 'media-transformaction-5',
    campus_id: 'siege',
    project_id: 'project-transformaction-africa',
    type: 'photo',
    title_fr: 'Ateliers de design thinking',
    title_en: 'Design Thinking Workshops',
    url: 'https://picsum.photos/seed/media-ta-5/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-ta-5/400/300',
    date: '2024-11-18'
  },

  // KreAfrika - Médias
  {
    id: 'media-kreafrika-1',
    campus_id: 'siege',
    project_id: 'project-kreafrika',
    type: 'video',
    title_fr: 'KreAfrika : Former les leaders des industries créatives',
    title_en: 'KreAfrika: Training Creative Industries Leaders',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-kreafrika-1/400/225',
    date: '2024-05-10'
  },
  {
    id: 'media-kreafrika-2',
    campus_id: 'siege',
    project_id: 'project-kreafrika',
    type: 'video',
    title_fr: 'Retour sur le séminaire de Dakar',
    title_en: 'Dakar Seminar Highlights',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://picsum.photos/seed/media-kreafrika-2/400/225',
    date: '2024-03-25'
  },
  {
    id: 'media-kreafrika-3',
    campus_id: 'siege',
    project_id: 'project-kreafrika',
    type: 'photo',
    title_fr: 'Séminaire régional de Kinshasa',
    title_en: 'Kinshasa Regional Seminar',
    url: 'https://picsum.photos/seed/media-kreafrika-3/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-kreafrika-3/400/300',
    date: '2024-12-01'
  },
  {
    id: 'media-kreafrika-4',
    campus_id: 'siege',
    project_id: 'project-kreafrika',
    type: 'photo',
    title_fr: 'Networking au MASA 2024',
    title_en: 'MASA 2024 Networking',
    url: 'https://picsum.photos/seed/media-kreafrika-4/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-kreafrika-4/400/300',
    date: '2024-03-10'
  },
  {
    id: 'media-kreafrika-5',
    campus_id: 'campus-abidjan',
    project_id: 'project-kreafrika',
    type: 'photo',
    title_fr: 'Participants du module e-learning',
    title_en: 'E-learning Module Participants',
    url: 'https://picsum.photos/seed/media-kreafrika-5/1200/800',
    thumbnail: 'https://picsum.photos/seed/media-kreafrika-5/400/300',
    date: '2024-11-05'
  }
]
