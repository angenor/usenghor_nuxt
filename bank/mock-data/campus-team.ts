/**
 * Mock Data: Équipes des Campus Externalisés
 */

export interface CampusTeamMember {
  id: string
  campus_id: string
  name: string
  role_fr: string
  role_en?: string
  role_ar?: string
  photo: string
  email?: string
}

export const mockCampusTeam: CampusTeamMember[] = [
  // Campus Dakar
  {
    id: 'team-dakar-1',
    campus_id: 'campus-dakar',
    name: 'Dr. Amadou Diallo',
    role_fr: 'Directeur du campus',
    role_en: 'Campus Director',
    role_ar: 'مدير الفرع',
    photo: 'https://i.pravatar.cc/150?u=team-dakar-1',
    email: 'a.diallo@usenghor.org'
  },
  {
    id: 'team-dakar-2',
    campus_id: 'campus-dakar',
    name: 'Fatou Sow',
    role_fr: 'Responsable administrative',
    role_en: 'Administrative Manager',
    role_ar: 'المسؤولة الإدارية',
    photo: 'https://i.pravatar.cc/150?u=team-dakar-2',
    email: 'f.sow@usenghor.org'
  },
  {
    id: 'team-dakar-3',
    campus_id: 'campus-dakar',
    name: 'Moussa Ndiaye',
    role_fr: 'Coordinateur pédagogique',
    role_en: 'Academic Coordinator',
    role_ar: 'منسق الشؤون الأكاديمية',
    photo: 'https://i.pravatar.cc/150?u=team-dakar-3',
    email: 'm.ndiaye@usenghor.org'
  },

  // Campus Yaoundé
  {
    id: 'team-yaounde-1',
    campus_id: 'campus-yaounde',
    name: 'Prof. Marie-Claire Onana',
    role_fr: 'Directrice du campus',
    role_en: 'Campus Director',
    role_ar: 'مديرة الفرع',
    photo: 'https://i.pravatar.cc/150?u=team-yaounde-1',
    email: 'mc.onana@usenghor.org'
  },
  {
    id: 'team-yaounde-2',
    campus_id: 'campus-yaounde',
    name: 'Jean-Baptiste Mbarga',
    role_fr: 'Responsable des partenariats',
    role_en: 'Partnership Manager',
    role_ar: 'مسؤول الشراكات',
    photo: 'https://i.pravatar.cc/150?u=team-yaounde-2',
    email: 'jb.mbarga@usenghor.org'
  },

  // Campus Abidjan
  {
    id: 'team-abidjan-1',
    campus_id: 'campus-abidjan',
    name: 'Dr. Kouadio Yao',
    role_fr: 'Directeur du campus',
    role_en: 'Campus Director',
    role_ar: 'مدير الفرع',
    photo: 'https://i.pravatar.cc/150?u=team-abidjan-1',
    email: 'k.yao@usenghor.org'
  },
  {
    id: 'team-abidjan-2',
    campus_id: 'campus-abidjan',
    name: 'Adjoua Koffi',
    role_fr: 'Coordinatrice des formations',
    role_en: 'Training Coordinator',
    role_ar: 'منسقة التدريب',
    photo: 'https://i.pravatar.cc/150?u=team-abidjan-2',
    email: 'a.koffi@usenghor.org'
  },

  // Campus Tunis
  {
    id: 'team-tunis-1',
    campus_id: 'campus-tunis',
    name: 'Prof. Leïla Ben Amor',
    role_fr: 'Directrice du campus',
    role_en: 'Campus Director',
    role_ar: 'مديرة الفرع',
    photo: 'https://i.pravatar.cc/150?u=team-tunis-1',
    email: 'l.benamor@usenghor.org'
  },
  {
    id: 'team-tunis-2',
    campus_id: 'campus-tunis',
    name: 'Mohamed Trabelsi',
    role_fr: 'Responsable administratif',
    role_en: 'Administrative Manager',
    role_ar: 'المسؤول الإداري',
    photo: 'https://i.pravatar.cc/150?u=team-tunis-2',
    email: 'm.trabelsi@usenghor.org'
  },

  // Campus Rabat
  {
    id: 'team-rabat-1',
    campus_id: 'campus-rabat',
    name: 'Dr. Nadia El Fassi',
    role_fr: 'Directrice du campus',
    role_en: 'Campus Director',
    role_ar: 'مديرة الفرع',
    photo: 'https://i.pravatar.cc/150?u=team-rabat-1',
    email: 'n.elfassi@usenghor.org'
  },
  {
    id: 'team-rabat-2',
    campus_id: 'campus-rabat',
    name: 'Youssef Bennani',
    role_fr: 'Coordinateur pédagogique',
    role_en: 'Academic Coordinator',
    role_ar: 'منسق الشؤون الأكاديمية',
    photo: 'https://i.pravatar.cc/150?u=team-rabat-2',
    email: 'y.bennani@usenghor.org'
  },

  // Campus Libreville
  {
    id: 'team-libreville-1',
    campus_id: 'campus-libreville',
    name: 'Prof. Pierre Ndong',
    role_fr: 'Directeur du campus',
    role_en: 'Campus Director',
    role_ar: 'مدير الفرع',
    photo: 'https://i.pravatar.cc/150?u=team-libreville-1',
    email: 'p.ndong@usenghor.org'
  },
  {
    id: 'team-libreville-2',
    campus_id: 'campus-libreville',
    name: 'Sylvie Moussavou',
    role_fr: 'Responsable des admissions',
    role_en: 'Admissions Manager',
    role_ar: 'مسؤولة القبول',
    photo: 'https://i.pravatar.cc/150?u=team-libreville-2',
    email: 's.moussavou@usenghor.org'
  },

  // Campus Cotonou
  {
    id: 'team-cotonou-1',
    campus_id: 'campus-cotonou',
    name: 'Dr. Honoré Agossou',
    role_fr: 'Directeur du campus',
    role_en: 'Campus Director',
    role_ar: 'مدير الفرع',
    photo: 'https://i.pravatar.cc/150?u=team-cotonou-1',
    email: 'h.agossou@usenghor.org'
  },
  {
    id: 'team-cotonou-2',
    campus_id: 'campus-cotonou',
    name: 'Fifamè Hounkonnou',
    role_fr: 'Coordinatrice des programmes',
    role_en: 'Programs Coordinator',
    role_ar: 'منسقة البرامج',
    photo: 'https://i.pravatar.cc/150?u=team-cotonou-2',
    email: 'f.hounkonnou@usenghor.org'
  }
]
