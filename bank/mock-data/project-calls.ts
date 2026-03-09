/**
 * Mock Data: Appels à projets (Admin)
 * Gestion des appels liés aux projets institutionnels
 */

// Types d'appels (alignés avec la BDD)
export type ProjectCallType = 'application' | 'scholarship' | 'project' | 'recruitment' | 'training'
export type ProjectCallStatus = 'upcoming' | 'ongoing' | 'closed'

export interface ProjectCall {
  id: string
  project_id: string
  project_title?: string  // Dénormalisé pour l'affichage
  title: string
  description?: string
  /** Description riche HTML */
  description_html?: string
  /** Description riche Markdown */
  description_md?: string
  /** Conditions de participation HTML */
  conditions_html?: string
  /** Conditions de participation Markdown */
  conditions_md?: string
  type: ProjectCallType
  status: ProjectCallStatus
  deadline?: string
  created_at: string
  updated_at: string
}

export interface ProjectCallStats {
  total: number
  upcoming: number
  ongoing: number
  closed: number
  byType: Record<ProjectCallType, number>
}

export interface ProjectCallFilters {
  project_id?: string
  type?: ProjectCallType
  status?: ProjectCallStatus
  deadline_from?: string
  deadline_to?: string
  search?: string
}

// Labels pour les types
export const projectCallTypeLabels: Record<ProjectCallType, string> = {
  application: 'Candidature',
  scholarship: 'Bourse',
  project: 'Projet',
  recruitment: 'Recrutement',
  training: 'Formation'
}

// Couleurs pour les types
export const projectCallTypeColors: Record<ProjectCallType, string> = {
  application: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  scholarship: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  project: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  recruitment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  training: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
}

// Labels pour les statuts
export const projectCallStatusLabels: Record<ProjectCallStatus, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  closed: 'Clôturé'
}

// Couleurs pour les statuts
export const projectCallStatusColors: Record<ProjectCallStatus, string> = {
  upcoming: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// Générateur d'ID
let callIdCounter = 1
export function generateProjectCallId(): string {
  return `proj-call-${Date.now()}-${callIdCounter++}`
}

// Mock data
export const mockProjectCalls: ProjectCall[] = [
  {
    id: 'proj-call-001',
    project_id: 'project-transformaction-africa',
    project_title: "Transform'Action Africa",
    title: "Appel à candidatures - Cohorte 2025",
    description: "Recrutement de 30 cadres dirigeants du secteur public africain pour la cohorte 2025 du programme Transform'Action Africa.",
    description_html: '<p>L\'Université Senghor lance un appel à candidatures pour la cohorte 2025 du programme Transform\'Action Africa.</p><p>Ce programme de formation vise à renforcer les compétences managériales et de leadership des cadres du secteur public en Afrique francophone.</p><h3>Profil recherché</h3><ul><li>Cadres dirigeants du secteur public</li><li>Minimum 5 ans d\'expérience</li><li>Projet de transformation identifié</li></ul>',
    conditions_html: '<p>Pour être éligible, les candidats doivent :</p><ol><li>Être cadre dirigeant d\'une organisation publique africaine</li><li>Avoir au minimum 5 années d\'expérience professionnelle</li><li>Maîtriser le français (niveau C1 minimum)</li><li>Avoir l\'accord de son employeur pour participer aux sessions</li></ol>',
    type: 'training',
    status: 'ongoing',
    deadline: '2025-03-31T23:59:59Z',
    created_at: '2025-01-10T09:00:00Z',
    updated_at: '2025-01-10T09:00:00Z'
  },
  {
    id: 'proj-call-002',
    project_id: 'project-kreafrika',
    project_title: 'KreAfrika',
    title: "Appel à participation - Bootcamp Marseille 2025",
    description: "Sélection de 25 professionnels des industries créatives africaines pour le Bootcamp de Marseille.",
    description_html: '<p>Le projet KreAfrika organise son premier Bootcamp européen à Marseille en juin 2025.</p><p>Ce Bootcamp de 5 jours réunira 25 professionnels des industries culturelles et créatives africaines pour des sessions de formation, networking et développement de projets.</p>',
    type: 'application',
    status: 'upcoming',
    deadline: '2025-04-15T23:59:59Z',
    created_at: '2025-01-15T14:30:00Z',
    updated_at: '2025-01-15T14:30:00Z'
  },
  {
    id: 'proj-call-003',
    project_id: 'project-bourses-excellence',
    project_title: "Programme de bourses d'excellence",
    title: "Bourses d'excellence 2025-2026",
    description: "Attribution de 100 bourses d'excellence pour l'année académique 2025-2026.",
    description_html: '<p>L\'Université Senghor ouvre les candidatures pour ses bourses d\'excellence 2025-2026.</p><h3>Types de bourses disponibles</h3><ul><li>Bourses complètes (frais de scolarité + hébergement)</li><li>Bourses partielles (frais de scolarité)</li><li>Bourses de mobilité</li></ul>',
    conditions_html: '<p>Critères d\'éligibilité :</p><ol><li>Être ressortissant d\'un pays membre de l\'OIF</li><li>Être titulaire d\'un diplôme de niveau Bac+4 minimum</li><li>Avoir moins de 35 ans au 1er octobre 2025</li><li>Maîtriser parfaitement le français</li></ol>',
    type: 'scholarship',
    status: 'ongoing',
    deadline: '2025-05-15T23:59:59Z',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-20T11:30:00Z'
  },
  {
    id: 'proj-call-004',
    project_id: 'project-africa-digital',
    project_title: 'Africa Digital Leaders',
    title: "Recrutement formateurs - Africa Digital Leaders",
    description: "Recrutement de 10 formateurs experts pour le programme Africa Digital Leaders.",
    description_html: '<p>Dans le cadre du lancement du programme Africa Digital Leaders, l\'Université Senghor recrute des formateurs experts.</p><h3>Domaines recherchés</h3><ul><li>Intelligence artificielle et machine learning</li><li>Cybersécurité</li><li>Stratégie digitale</li><li>Leadership tech</li><li>Entrepreneuriat numérique</li></ul>',
    type: 'recruitment',
    status: 'upcoming',
    deadline: '2025-02-28T23:59:59Z',
    created_at: '2025-01-18T16:00:00Z',
    updated_at: '2025-01-18T16:00:00Z'
  },
  {
    id: 'proj-call-005',
    project_id: 'project-recherche-francophone',
    project_title: 'Réseau de recherche francophone',
    title: "Appel à projets de recherche 2025",
    description: "Financement de 15 projets de recherche collaborative sur les thématiques du développement durable.",
    description_html: '<p>Le Réseau de recherche francophone lance son appel à projets annuel pour 2025.</p><p>Cet appel vise à financer des projets de recherche collaborative entre institutions membres du réseau.</p><h3>Thématiques prioritaires</h3><ul><li>Changement climatique et adaptation</li><li>Santé publique et épidémiologie</li><li>Gouvernance et politiques publiques</li><li>Transformation digitale</li><li>Industries culturelles et créatives</li></ul>',
    conditions_html: '<p>Conditions de participation :</p><ol><li>Projet porté par au moins 2 institutions de pays différents</li><li>Budget demandé entre 10 000 et 50 000 EUR</li><li>Durée du projet : 12 à 24 mois</li><li>Implication d\'au moins un doctorant</li></ol>',
    type: 'project',
    status: 'closed',
    deadline: '2024-12-15T23:59:59Z',
    created_at: '2024-09-01T08:00:00Z',
    updated_at: '2024-12-20T10:00:00Z'
  },
  {
    id: 'proj-call-006',
    project_id: 'project-transformaction-africa',
    project_title: "Transform'Action Africa",
    title: "Appel à candidatures - Cohorte 2024 (Clôturé)",
    description: "Recrutement de 25 cadres dirigeants pour la cohorte 2024 - CLÔTURÉ",
    type: 'training',
    status: 'closed',
    deadline: '2024-02-28T23:59:59Z',
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-03-01T08:00:00Z'
  }
]

// === Fonctions utilitaires ===

export function getAllProjectCalls(): ProjectCall[] {
  return mockProjectCalls
}

export function getProjectCallById(id: string): ProjectCall | undefined {
  return mockProjectCalls.find(call => call.id === id)
}

export function getProjectCallsByProjectId(projectId: string): ProjectCall[] {
  return mockProjectCalls.filter(call => call.project_id === projectId)
}

export function getProjectCallStats(): ProjectCallStats {
  const stats: ProjectCallStats = {
    total: mockProjectCalls.length,
    upcoming: 0,
    ongoing: 0,
    closed: 0,
    byType: {
      application: 0,
      scholarship: 0,
      project: 0,
      recruitment: 0,
      training: 0
    }
  }

  for (const call of mockProjectCalls) {
    stats[call.status]++
    stats.byType[call.type]++
  }

  return stats
}

export function getFilteredProjectCalls(filters?: ProjectCallFilters): ProjectCall[] {
  if (!filters) return mockProjectCalls

  return mockProjectCalls.filter(call => {
    // Filtre par projet
    if (filters.project_id && call.project_id !== filters.project_id) {
      return false
    }

    // Filtre par type
    if (filters.type && call.type !== filters.type) {
      return false
    }

    // Filtre par statut
    if (filters.status && call.status !== filters.status) {
      return false
    }

    // Filtre par deadline (from)
    if (filters.deadline_from && call.deadline) {
      const deadlineDate = new Date(call.deadline)
      const fromDate = new Date(filters.deadline_from)
      if (deadlineDate < fromDate) return false
    }

    // Filtre par deadline (to)
    if (filters.deadline_to && call.deadline) {
      const deadlineDate = new Date(call.deadline)
      const toDate = new Date(filters.deadline_to)
      if (deadlineDate > toDate) return false
    }

    // Recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = call.title.toLowerCase().includes(searchLower)
      const matchesDescription = call.description?.toLowerCase().includes(searchLower) || false
      const matchesProject = call.project_title?.toLowerCase().includes(searchLower) || false
      if (!matchesTitle && !matchesDescription && !matchesProject) {
        return false
      }
    }

    return true
  })
}

// Liste des projets pour le select (dénormalisé)
export function getProjectsForSelect(): Array<{ id: string; title: string }> {
  const uniqueProjects = new Map<string, string>()

  for (const call of mockProjectCalls) {
    if (call.project_id && call.project_title) {
      uniqueProjects.set(call.project_id, call.project_title)
    }
  }

  return Array.from(uniqueProjects, ([id, title]) => ({ id, title }))
}
