/**
 * Mock Data: Équipes des Campus
 * Table SQL: campus_team (05_campus.sql)
 */

// User embedded dans la réponse API (référence vers IDENTITY.users)
export interface CampusTeamUser {
  id: string
  first_name: string
  last_name: string
  email: string
  photo_url?: string
}

// Interface alignée sur le schéma SQL
export interface CampusTeamMember {
  id: string
  campus_id: string
  user_external_id: string
  // Données utilisateur enrichies (jointure API)
  user: CampusTeamUser
  position: string
  display_order: number
  start_date: string | null
  end_date: string | null
  active: boolean
  created_at: string
}

// Interface pour les filtres admin
export interface CampusTeamFilters {
  campus_id?: string
  active?: boolean
  search?: string
  sort_by?: 'display_order' | 'name' | 'position' | 'start_date'
  sort_order?: 'asc' | 'desc'
}

// Données mock des membres d'équipe
export const mockCampusTeam: CampusTeamMember[] = [
  // === Campus Dakar ===
  {
    id: 'team-dakar-1',
    campus_id: 'campus-dakar',
    user_external_id: 'user-dakar-1',
    user: {
      id: 'user-dakar-1',
      first_name: 'Amadou',
      last_name: 'Diallo',
      email: 'a.diallo@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-dakar-1'
    },
    position: 'Directeur du campus',
    display_order: 1,
    start_date: '2018-09-01',
    end_date: null,
    active: true,
    created_at: '2018-09-01T10:00:00Z'
  },
  {
    id: 'team-dakar-2',
    campus_id: 'campus-dakar',
    user_external_id: 'user-dakar-2',
    user: {
      id: 'user-dakar-2',
      first_name: 'Fatou',
      last_name: 'Sow',
      email: 'f.sow@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-dakar-2'
    },
    position: 'Responsable administrative',
    display_order: 2,
    start_date: '2019-01-15',
    end_date: null,
    active: true,
    created_at: '2019-01-15T10:00:00Z'
  },
  {
    id: 'team-dakar-3',
    campus_id: 'campus-dakar',
    user_external_id: 'user-dakar-3',
    user: {
      id: 'user-dakar-3',
      first_name: 'Moussa',
      last_name: 'Ndiaye',
      email: 'm.ndiaye@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-dakar-3'
    },
    position: 'Coordinateur pédagogique',
    display_order: 3,
    start_date: '2020-03-01',
    end_date: null,
    active: true,
    created_at: '2020-03-01T10:00:00Z'
  },
  {
    id: 'team-dakar-4',
    campus_id: 'campus-dakar',
    user_external_id: 'user-dakar-4',
    user: {
      id: 'user-dakar-4',
      first_name: 'Aïssatou',
      last_name: 'Ba',
      email: 'a.ba@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-dakar-4'
    },
    position: 'Assistante administrative',
    display_order: 4,
    start_date: '2021-06-01',
    end_date: '2023-08-31',
    active: false,
    created_at: '2021-06-01T10:00:00Z'
  },

  // === Campus Yaoundé ===
  {
    id: 'team-yaounde-1',
    campus_id: 'campus-yaounde',
    user_external_id: 'user-yaounde-1',
    user: {
      id: 'user-yaounde-1',
      first_name: 'Marie-Claire',
      last_name: 'Onana',
      email: 'mc.onana@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-yaounde-1'
    },
    position: 'Directrice du campus',
    display_order: 1,
    start_date: '2017-09-01',
    end_date: null,
    active: true,
    created_at: '2017-09-01T10:00:00Z'
  },
  {
    id: 'team-yaounde-2',
    campus_id: 'campus-yaounde',
    user_external_id: 'user-yaounde-2',
    user: {
      id: 'user-yaounde-2',
      first_name: 'Jean-Baptiste',
      last_name: 'Mbarga',
      email: 'jb.mbarga@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-yaounde-2'
    },
    position: 'Responsable des partenariats',
    display_order: 2,
    start_date: '2019-09-01',
    end_date: null,
    active: true,
    created_at: '2019-09-01T10:00:00Z'
  },
  {
    id: 'team-yaounde-3',
    campus_id: 'campus-yaounde',
    user_external_id: 'user-yaounde-3',
    user: {
      id: 'user-yaounde-3',
      first_name: 'Paul',
      last_name: 'Essomba',
      email: 'p.essomba@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-yaounde-3'
    },
    position: 'Coordinateur des formations',
    display_order: 3,
    start_date: '2022-01-10',
    end_date: null,
    active: true,
    created_at: '2022-01-10T10:00:00Z'
  },

  // === Campus Abidjan ===
  {
    id: 'team-abidjan-1',
    campus_id: 'campus-abidjan',
    user_external_id: 'user-abidjan-1',
    user: {
      id: 'user-abidjan-1',
      first_name: 'Kouadio',
      last_name: 'Yao',
      email: 'k.yao@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-abidjan-1'
    },
    position: 'Directeur du campus',
    display_order: 1,
    start_date: '2016-09-01',
    end_date: null,
    active: true,
    created_at: '2016-09-01T10:00:00Z'
  },
  {
    id: 'team-abidjan-2',
    campus_id: 'campus-abidjan',
    user_external_id: 'user-abidjan-2',
    user: {
      id: 'user-abidjan-2',
      first_name: 'Adjoua',
      last_name: 'Koffi',
      email: 'a.koffi@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-abidjan-2'
    },
    position: 'Coordinatrice des formations',
    display_order: 2,
    start_date: '2018-01-15',
    end_date: null,
    active: true,
    created_at: '2018-01-15T10:00:00Z'
  },

  // === Campus Tunis ===
  {
    id: 'team-tunis-1',
    campus_id: 'campus-tunis',
    user_external_id: 'user-tunis-1',
    user: {
      id: 'user-tunis-1',
      first_name: 'Leïla',
      last_name: 'Ben Amor',
      email: 'l.benamor@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-tunis-1'
    },
    position: 'Directrice du campus',
    display_order: 1,
    start_date: '2019-09-01',
    end_date: null,
    active: true,
    created_at: '2019-09-01T10:00:00Z'
  },
  {
    id: 'team-tunis-2',
    campus_id: 'campus-tunis',
    user_external_id: 'user-tunis-2',
    user: {
      id: 'user-tunis-2',
      first_name: 'Mohamed',
      last_name: 'Trabelsi',
      email: 'm.trabelsi@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-tunis-2'
    },
    position: 'Responsable administratif',
    display_order: 2,
    start_date: '2020-02-01',
    end_date: null,
    active: true,
    created_at: '2020-02-01T10:00:00Z'
  },

  // === Campus Rabat ===
  {
    id: 'team-rabat-1',
    campus_id: 'campus-rabat',
    user_external_id: 'user-rabat-1',
    user: {
      id: 'user-rabat-1',
      first_name: 'Nadia',
      last_name: 'El Fassi',
      email: 'n.elfassi@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-rabat-1'
    },
    position: 'Directrice du campus',
    display_order: 1,
    start_date: '2018-09-01',
    end_date: null,
    active: true,
    created_at: '2018-09-01T10:00:00Z'
  },
  {
    id: 'team-rabat-2',
    campus_id: 'campus-rabat',
    user_external_id: 'user-rabat-2',
    user: {
      id: 'user-rabat-2',
      first_name: 'Youssef',
      last_name: 'Bennani',
      email: 'y.bennani@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-rabat-2'
    },
    position: 'Coordinateur pédagogique',
    display_order: 2,
    start_date: '2019-09-01',
    end_date: null,
    active: true,
    created_at: '2019-09-01T10:00:00Z'
  },

  // === Campus Libreville ===
  {
    id: 'team-libreville-1',
    campus_id: 'campus-libreville',
    user_external_id: 'user-libreville-1',
    user: {
      id: 'user-libreville-1',
      first_name: 'Pierre',
      last_name: 'Ndong',
      email: 'p.ndong@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-libreville-1'
    },
    position: 'Directeur du campus',
    display_order: 1,
    start_date: '2017-09-01',
    end_date: null,
    active: true,
    created_at: '2017-09-01T10:00:00Z'
  },
  {
    id: 'team-libreville-2',
    campus_id: 'campus-libreville',
    user_external_id: 'user-libreville-2',
    user: {
      id: 'user-libreville-2',
      first_name: 'Sylvie',
      last_name: 'Moussavou',
      email: 's.moussavou@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-libreville-2'
    },
    position: 'Responsable des admissions',
    display_order: 2,
    start_date: '2018-01-15',
    end_date: null,
    active: true,
    created_at: '2018-01-15T10:00:00Z'
  },

  // === Campus Cotonou ===
  {
    id: 'team-cotonou-1',
    campus_id: 'campus-cotonou',
    user_external_id: 'user-cotonou-1',
    user: {
      id: 'user-cotonou-1',
      first_name: 'Honoré',
      last_name: 'Agossou',
      email: 'h.agossou@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-cotonou-1'
    },
    position: 'Directeur du campus',
    display_order: 1,
    start_date: '2019-09-01',
    end_date: null,
    active: true,
    created_at: '2019-09-01T10:00:00Z'
  },
  {
    id: 'team-cotonou-2',
    campus_id: 'campus-cotonou',
    user_external_id: 'user-cotonou-2',
    user: {
      id: 'user-cotonou-2',
      first_name: 'Fifamè',
      last_name: 'Hounkonnou',
      email: 'f.hounkonnou@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-cotonou-2'
    },
    position: 'Coordinatrice des programmes',
    display_order: 2,
    start_date: '2020-01-10',
    end_date: null,
    active: true,
    created_at: '2020-01-10T10:00:00Z'
  },

  // === Campus Budapest ===
  {
    id: 'team-budapest-1',
    campus_id: 'campus-budapest',
    user_external_id: 'user-budapest-1',
    user: {
      id: 'user-budapest-1',
      first_name: 'László',
      last_name: 'Kovács',
      email: 'l.kovacs@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-budapest-1'
    },
    position: 'Directeur du campus',
    display_order: 1,
    start_date: '2021-09-01',
    end_date: null,
    active: true,
    created_at: '2021-09-01T10:00:00Z'
  },

  // === Campus Hanoï ===
  {
    id: 'team-hanoi-1',
    campus_id: 'campus-hanoi',
    user_external_id: 'user-hanoi-1',
    user: {
      id: 'user-hanoi-1',
      first_name: 'Nguyen',
      last_name: 'Thi Mai',
      email: 'n.thimai@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-hanoi-1'
    },
    position: 'Directrice du campus',
    display_order: 1,
    start_date: '2020-09-01',
    end_date: null,
    active: true,
    created_at: '2020-09-01T10:00:00Z'
  },

  // === Campus Antananarivo ===
  {
    id: 'team-antananarivo-1',
    campus_id: 'campus-antananarivo',
    user_external_id: 'user-antananarivo-1',
    user: {
      id: 'user-antananarivo-1',
      first_name: 'Hery',
      last_name: 'Rakotomalala',
      email: 'h.rakotomalala@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-antananarivo-1'
    },
    position: 'Directeur du campus',
    display_order: 1,
    start_date: '2019-09-01',
    end_date: null,
    active: true,
    created_at: '2019-09-01T10:00:00Z'
  },
  {
    id: 'team-antananarivo-2',
    campus_id: 'campus-antananarivo',
    user_external_id: 'user-antananarivo-2',
    user: {
      id: 'user-antananarivo-2',
      first_name: 'Volatiana',
      last_name: 'Rasoarivony',
      email: 'v.rasoarivony@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-antananarivo-2'
    },
    position: 'Responsable pédagogique',
    display_order: 2,
    start_date: '2021-01-15',
    end_date: null,
    active: true,
    created_at: '2021-01-15T10:00:00Z'
  },

  // === Campus Kinshasa ===
  {
    id: 'team-kinshasa-1',
    campus_id: 'campus-kinshasa',
    user_external_id: 'user-kinshasa-1',
    user: {
      id: 'user-kinshasa-1',
      first_name: 'Patrick',
      last_name: 'Mukendi',
      email: 'p.mukendi@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-kinshasa-1'
    },
    position: 'Directeur du campus',
    display_order: 1,
    start_date: '2022-09-01',
    end_date: null,
    active: true,
    created_at: '2022-09-01T10:00:00Z'
  },
  {
    id: 'team-kinshasa-2',
    campus_id: 'campus-kinshasa',
    user_external_id: 'user-kinshasa-2',
    user: {
      id: 'user-kinshasa-2',
      first_name: 'Grace',
      last_name: 'Kalala',
      email: 'g.kalala@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-kinshasa-2'
    },
    position: 'Coordinatrice administrative',
    display_order: 2,
    start_date: '2023-01-10',
    end_date: null,
    active: true,
    created_at: '2023-01-10T10:00:00Z'
  },

  // === Siège (Alexandrie) ===
  {
    id: 'team-siege-1',
    campus_id: 'siege',
    user_external_id: 'user-siege-1',
    user: {
      id: 'user-siege-1',
      first_name: 'Ahmed',
      last_name: 'Hassan',
      email: 'a.hassan@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-siege-1'
    },
    position: 'Recteur',
    display_order: 1,
    start_date: '2015-09-01',
    end_date: null,
    active: true,
    created_at: '2015-09-01T10:00:00Z'
  },
  {
    id: 'team-siege-2',
    campus_id: 'siege',
    user_external_id: 'user-siege-2',
    user: {
      id: 'user-siege-2',
      first_name: 'Maryam',
      last_name: 'El-Sayed',
      email: 'm.elsayed@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-siege-2'
    },
    position: 'Vice-Rectrice',
    display_order: 2,
    start_date: '2017-09-01',
    end_date: null,
    active: true,
    created_at: '2017-09-01T10:00:00Z'
  },
  {
    id: 'team-siege-3',
    campus_id: 'siege',
    user_external_id: 'user-siege-3',
    user: {
      id: 'user-siege-3',
      first_name: 'Omar',
      last_name: 'Farouk',
      email: 'o.farouk@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-siege-3'
    },
    position: 'Secrétaire général',
    display_order: 3,
    start_date: '2016-09-01',
    end_date: null,
    active: true,
    created_at: '2016-09-01T10:00:00Z'
  },
  {
    id: 'team-siege-4',
    campus_id: 'siege',
    user_external_id: 'user-siege-4',
    user: {
      id: 'user-siege-4',
      first_name: 'Fatma',
      last_name: 'Ibrahim',
      email: 'f.ibrahim@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-siege-4'
    },
    position: 'Directrice des études',
    display_order: 4,
    start_date: '2018-09-01',
    end_date: null,
    active: true,
    created_at: '2018-09-01T10:00:00Z'
  },
  {
    id: 'team-siege-5',
    campus_id: 'siege',
    user_external_id: 'user-siege-5',
    user: {
      id: 'user-siege-5',
      first_name: 'Khaled',
      last_name: 'Mansour',
      email: 'k.mansour@usenghor.org',
      photo_url: 'https://i.pravatar.cc/150?u=team-siege-5'
    },
    position: 'Directeur des relations internationales',
    display_order: 5,
    start_date: '2019-01-15',
    end_date: null,
    active: true,
    created_at: '2019-01-15T10:00:00Z'
  }
]

// ============================================================================
// FONCTIONS UTILITAIRES ADMIN
// ============================================================================

// Générer un nouvel ID
export function generateCampusTeamId(): string {
  return `team-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Récupérer tous les membres (admin)
export function getAllCampusTeamMembers(filters?: CampusTeamFilters): CampusTeamMember[] {
  let result = [...mockCampusTeam]

  if (filters?.campus_id) {
    result = result.filter(m => m.campus_id === filters.campus_id)
  }

  if (filters?.active !== undefined) {
    result = result.filter(m => m.active === filters.active)
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(m =>
      m.user.first_name.toLowerCase().includes(searchLower) ||
      m.user.last_name.toLowerCase().includes(searchLower) ||
      m.position.toLowerCase().includes(searchLower) ||
      m.user.email.toLowerCase().includes(searchLower)
    )
  }

  // Tri
  const sortBy = filters?.sort_by || 'display_order'
  const sortOrder = filters?.sort_order || 'asc'

  result.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = `${a.user.last_name} ${a.user.first_name}`.localeCompare(`${b.user.last_name} ${b.user.first_name}`)
        break
      case 'position':
        comparison = a.position.localeCompare(b.position)
        break
      case 'start_date':
        comparison = (a.start_date || '').localeCompare(b.start_date || '')
        break
      default:
        comparison = a.display_order - b.display_order
    }

    return sortOrder === 'desc' ? -comparison : comparison
  })

  return result
}

// Récupérer un membre par ID
export function getCampusTeamMemberById(id: string): CampusTeamMember | undefined {
  return mockCampusTeam.find(m => m.id === id)
}

// Récupérer les membres d'un campus
export function getCampusTeamByCampus(campusId: string, activeOnly = true): CampusTeamMember[] {
  return mockCampusTeam
    .filter(m => m.campus_id === campusId && (!activeOnly || m.active))
    .sort((a, b) => a.display_order - b.display_order)
}

// Compter les membres par campus
export function countTeamMembersByCampus(campusId: string, activeOnly = true): number {
  return mockCampusTeam.filter(m => m.campus_id === campusId && (!activeOnly || m.active)).length
}

// Statistiques globales
export function getCampusTeamStats() {
  const total = mockCampusTeam.length
  const active = mockCampusTeam.filter(m => m.active).length
  const inactive = total - active

  // Grouper par campus
  const byCampus: Record<string, number> = {}
  mockCampusTeam.forEach(m => {
    if (m.active) {
      byCampus[m.campus_id] = (byCampus[m.campus_id] || 0) + 1
    }
  })

  return {
    total,
    active,
    inactive,
    by_campus: byCampus
  }
}

// Mock des utilisateurs disponibles (pour l'autocomplete)
export const mockAvailableUsers: CampusTeamUser[] = [
  { id: 'user-new-1', first_name: 'Jean', last_name: 'Dupont', email: 'j.dupont@usenghor.org', photo_url: 'https://i.pravatar.cc/150?u=user-new-1' },
  { id: 'user-new-2', first_name: 'Marie', last_name: 'Martin', email: 'm.martin@usenghor.org', photo_url: 'https://i.pravatar.cc/150?u=user-new-2' },
  { id: 'user-new-3', first_name: 'Pierre', last_name: 'Bernard', email: 'p.bernard@usenghor.org', photo_url: 'https://i.pravatar.cc/150?u=user-new-3' },
  { id: 'user-new-4', first_name: 'Sophie', last_name: 'Petit', email: 's.petit@usenghor.org', photo_url: 'https://i.pravatar.cc/150?u=user-new-4' },
  { id: 'user-new-5', first_name: 'Abdou', last_name: 'Diop', email: 'a.diop@usenghor.org', photo_url: 'https://i.pravatar.cc/150?u=user-new-5' },
  { id: 'user-new-6', first_name: 'Amina', last_name: 'Traoré', email: 'a.traore@usenghor.org', photo_url: 'https://i.pravatar.cc/150?u=user-new-6' },
  { id: 'user-new-7', first_name: 'Kofi', last_name: 'Asante', email: 'k.asante@usenghor.org', photo_url: 'https://i.pravatar.cc/150?u=user-new-7' },
  { id: 'user-new-8', first_name: 'Fatou', last_name: 'Camara', email: 'f.camara@usenghor.org', photo_url: 'https://i.pravatar.cc/150?u=user-new-8' }
]

// Rechercher des utilisateurs (pour autocomplete)
export function searchAvailableUsers(query: string): CampusTeamUser[] {
  if (!query || query.length < 2) return []

  const queryLower = query.toLowerCase()
  return mockAvailableUsers.filter(u =>
    u.first_name.toLowerCase().includes(queryLower) ||
    u.last_name.toLowerCase().includes(queryLower) ||
    u.email.toLowerCase().includes(queryLower)
  )
}

// Liste des postes courants (suggestions)
export const commonPositions = [
  'Directeur du campus',
  'Directrice du campus',
  'Vice-Directeur',
  'Vice-Directrice',
  'Responsable administratif',
  'Responsable administrative',
  'Coordinateur pédagogique',
  'Coordinatrice pédagogique',
  'Responsable des partenariats',
  'Responsable des admissions',
  'Coordinateur des formations',
  'Coordinatrice des formations',
  'Secrétaire général',
  'Secrétaire générale',
  'Assistant administratif',
  'Assistante administrative'
]
