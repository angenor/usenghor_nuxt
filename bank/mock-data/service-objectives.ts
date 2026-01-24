/**
 * Mock Data: Objectifs, Réalisations et Projets de Services
 * Tables SQL: service_objectives, service_achievements, service_projects (04_organization.sql)
 */

import { mockServices } from './services'

// === TYPES ===

export type ServiceProjectStatus = 'planned' | 'ongoing' | 'completed' | 'suspended'

export interface ServiceObjective {
  id: string
  service_id: string
  title: string
  description?: string
  display_order: number
}

export interface ServiceAchievement {
  id: string
  service_id: string
  title: string
  description?: string
  type?: string
  cover_image?: string
  achievement_date: string
  created_at: string
}

export interface ServiceProject {
  id: string
  service_id: string
  title: string
  description?: string
  cover_image?: string
  progress: number
  status: ServiceProjectStatus
  start_date?: string
  expected_end_date?: string
  created_at: string
  updated_at: string
}

export interface ServiceOverview {
  service_id: string
  service_name: string
  department_name: string
  objectives_count: number
  achievements_count: number
  projects: {
    total: number
    planned: number
    ongoing: number
    completed: number
    suspended: number
  }
}

// === LABELS ET COULEURS ===

export const serviceProjectStatusLabels: Record<ServiceProjectStatus, string> = {
  planned: 'Planifié',
  ongoing: 'En cours',
  completed: 'Terminé',
  suspended: 'Suspendu'
}

export const serviceProjectStatusColors: Record<ServiceProjectStatus, string> = {
  planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  ongoing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
}

// === MOCK DATA: OBJECTIFS ===

export const mockServiceObjectives: ServiceObjective[] = [
  // Cabinet du Recteur
  {
    id: 'obj-001',
    service_id: 'srv-cabinet',
    title: 'Assurer la coordination des activités stratégiques',
    description: 'Coordination et suivi des projets prioritaires de l\'Université avec les parties prenantes.',
    display_order: 1
  },
  {
    id: 'obj-002',
    service_id: 'srv-cabinet',
    title: 'Renforcer les relations institutionnelles',
    description: 'Développer et maintenir les relations avec les partenaires institutionnels et académiques.',
    display_order: 2
  },
  // Communication
  {
    id: 'obj-003',
    service_id: 'srv-communication',
    title: 'Améliorer la visibilité de l\'Université',
    description: 'Augmenter la présence médiatique et numérique de l\'institution.',
    display_order: 1
  },
  {
    id: 'obj-004',
    service_id: 'srv-communication',
    title: 'Moderniser les outils de communication interne',
    description: 'Déployer de nouveaux canaux de communication pour le personnel et les étudiants.',
    display_order: 2
  },
  {
    id: 'obj-005',
    service_id: 'srv-communication',
    title: 'Développer la stratégie digitale',
    description: 'Optimiser la présence sur les réseaux sociaux et le site web.',
    display_order: 3
  },
  // Scolarité
  {
    id: 'obj-006',
    service_id: 'srv-scolarite',
    title: 'Digitaliser les processus d\'inscription',
    description: 'Mettre en place un système d\'inscription en ligne entièrement dématérialisé.',
    display_order: 1
  },
  {
    id: 'obj-007',
    service_id: 'srv-scolarite',
    title: 'Améliorer le suivi des étudiants',
    description: 'Développer des outils de suivi personnalisé du parcours académique.',
    display_order: 2
  },
  // Bibliothèque
  {
    id: 'obj-008',
    service_id: 'srv-bibliotheque',
    title: 'Enrichir le fonds documentaire numérique',
    description: 'Augmenter le catalogue de ressources numériques accessibles à distance.',
    display_order: 1
  },
  {
    id: 'obj-009',
    service_id: 'srv-bibliotheque',
    title: 'Créer des espaces de travail collaboratif',
    description: 'Aménager de nouveaux espaces de coworking pour les étudiants.',
    display_order: 2
  },
  // Relations extérieures
  {
    id: 'obj-010',
    service_id: 'srv-relations-ext',
    title: 'Développer les partenariats internationaux',
    description: 'Établir de nouvelles conventions avec des universités africaines et européennes.',
    display_order: 1
  },
  // CIFIP
  {
    id: 'obj-011',
    service_id: 'srv-cifip',
    title: 'Innover dans les pratiques pédagogiques',
    description: 'Expérimenter et déployer de nouvelles méthodes d\'enseignement.',
    display_order: 1
  },
  {
    id: 'obj-012',
    service_id: 'srv-cifip',
    title: 'Former les enseignants aux outils numériques',
    description: 'Organiser des sessions de formation continue sur les technologies éducatives.',
    display_order: 2
  },
  // Informatique
  {
    id: 'obj-013',
    service_id: 'srv-informatique',
    title: 'Moderniser l\'infrastructure réseau',
    description: 'Améliorer la couverture WiFi et la bande passante sur le campus.',
    display_order: 1
  },
  {
    id: 'obj-014',
    service_id: 'srv-informatique',
    title: 'Sécuriser les systèmes d\'information',
    description: 'Renforcer la cybersécurité et la protection des données.',
    display_order: 2
  }
]

// === MOCK DATA: RÉALISATIONS ===

export const mockServiceAchievements: ServiceAchievement[] = [
  // Communication
  {
    id: 'ach-001',
    service_id: 'srv-communication',
    title: 'Refonte complète du site web institutionnel',
    description: 'Nouveau site web responsive avec une meilleure expérience utilisateur et un design moderne.',
    type: 'Innovation',
    cover_image: 'https://picsum.photos/seed/ach-001/800/400',
    achievement_date: '2024-09-15',
    created_at: '2024-09-16T10:00:00Z'
  },
  {
    id: 'ach-002',
    service_id: 'srv-communication',
    title: 'Lancement de la chaîne YouTube officielle',
    description: 'Création et animation d\'une chaîne YouTube avec des contenus pédagogiques et institutionnels.',
    type: 'Digital',
    cover_image: 'https://picsum.photos/seed/ach-002/800/400',
    achievement_date: '2024-06-20',
    created_at: '2024-06-21T14:00:00Z'
  },
  {
    id: 'ach-003',
    service_id: 'srv-communication',
    title: 'Organisation du 30ème anniversaire de l\'Université',
    description: 'Événement majeur célébrant les 30 ans de l\'Université Senghor avec conférences et expositions.',
    type: 'Événement',
    cover_image: 'https://picsum.photos/seed/ach-003/800/400',
    achievement_date: '2024-11-10',
    created_at: '2024-11-11T09:00:00Z'
  },
  // Scolarité
  {
    id: 'ach-004',
    service_id: 'srv-scolarite',
    title: 'Déploiement du portail étudiant en ligne',
    description: 'Mise en service d\'un portail permettant aux étudiants de suivre leur parcours et consulter leurs notes.',
    type: 'Digitalisation',
    cover_image: 'https://picsum.photos/seed/ach-004/800/400',
    achievement_date: '2024-02-01',
    created_at: '2024-02-02T08:00:00Z'
  },
  {
    id: 'ach-005',
    service_id: 'srv-scolarite',
    title: 'Certification ISO 9001',
    description: 'Obtention de la certification qualité pour les processus de gestion des inscriptions.',
    type: 'Certification',
    achievement_date: '2023-12-15',
    created_at: '2023-12-16T10:00:00Z'
  },
  // Bibliothèque
  {
    id: 'ach-006',
    service_id: 'srv-bibliotheque',
    title: 'Accès à 50 000 ressources numériques',
    description: 'Partenariat avec des éditeurs pour offrir un accès élargi aux bases de données scientifiques.',
    type: 'Partenariat',
    cover_image: 'https://picsum.photos/seed/ach-006/800/400',
    achievement_date: '2024-03-01',
    created_at: '2024-03-02T11:00:00Z'
  },
  {
    id: 'ach-007',
    service_id: 'srv-bibliotheque',
    title: 'Rénovation de l\'espace de lecture',
    description: 'Modernisation de la salle de lecture principale avec nouveau mobilier et éclairage.',
    type: 'Infrastructure',
    cover_image: 'https://picsum.photos/seed/ach-007/800/400',
    achievement_date: '2024-08-25',
    created_at: '2024-08-26T09:00:00Z'
  },
  // Relations extérieures
  {
    id: 'ach-008',
    service_id: 'srv-relations-ext',
    title: 'Convention avec 10 nouvelles universités partenaires',
    description: 'Signature de conventions de coopération avec des universités en Afrique de l\'Ouest.',
    type: 'Partenariat',
    cover_image: 'https://picsum.photos/seed/ach-008/800/400',
    achievement_date: '2024-05-15',
    created_at: '2024-05-16T14:00:00Z'
  },
  // CIFIP
  {
    id: 'ach-009',
    service_id: 'srv-cifip',
    title: 'Formation de 50 enseignants aux méthodes actives',
    description: 'Programme de formation intensive sur les pédagogies innovantes.',
    type: 'Formation',
    achievement_date: '2024-07-10',
    created_at: '2024-07-11T10:00:00Z'
  },
  {
    id: 'ach-010',
    service_id: 'srv-cifip',
    title: 'Création du studio de production e-learning',
    description: 'Mise en place d\'un studio professionnel pour la création de contenus pédagogiques.',
    type: 'Infrastructure',
    cover_image: 'https://picsum.photos/seed/ach-010/800/400',
    achievement_date: '2024-04-20',
    created_at: '2024-04-21T08:00:00Z'
  },
  // Informatique
  {
    id: 'ach-011',
    service_id: 'srv-informatique',
    title: 'Couverture WiFi 100% du campus',
    description: 'Déploiement de bornes WiFi haute performance sur l\'ensemble du campus.',
    type: 'Infrastructure',
    cover_image: 'https://picsum.photos/seed/ach-011/800/400',
    achievement_date: '2024-01-15',
    created_at: '2024-01-16T10:00:00Z'
  },
  // Cabinet
  {
    id: 'ach-012',
    service_id: 'srv-cabinet',
    title: 'Adoption du plan stratégique 2024-2028',
    description: 'Validation par le Conseil d\'Administration du nouveau plan stratégique quinquennal.',
    type: 'Stratégie',
    achievement_date: '2024-01-20',
    created_at: '2024-01-21T09:00:00Z'
  }
]

// === MOCK DATA: PROJETS INTERNES ===

export const mockServiceProjects: ServiceProject[] = [
  // Communication
  {
    id: 'sproj-001',
    service_id: 'srv-communication',
    title: 'Refonte de l\'identité visuelle',
    description: 'Modernisation du logo et de la charte graphique de l\'Université.',
    cover_image: 'https://picsum.photos/seed/sproj-001/800/400',
    progress: 75,
    status: 'ongoing',
    start_date: '2024-09-01',
    expected_end_date: '2025-03-31',
    created_at: '2024-09-01T08:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 'sproj-002',
    service_id: 'srv-communication',
    title: 'Application mobile USenghor',
    description: 'Développement d\'une application mobile pour les étudiants et le personnel.',
    cover_image: 'https://picsum.photos/seed/sproj-002/800/400',
    progress: 30,
    status: 'ongoing',
    start_date: '2024-11-01',
    expected_end_date: '2025-06-30',
    created_at: '2024-11-01T08:00:00Z',
    updated_at: '2025-01-10T14:00:00Z'
  },
  // Scolarité
  {
    id: 'sproj-003',
    service_id: 'srv-scolarite',
    title: 'Dématérialisation des diplômes',
    description: 'Mise en place de la certification numérique des diplômes avec blockchain.',
    progress: 100,
    status: 'completed',
    start_date: '2024-03-01',
    expected_end_date: '2024-12-31',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-12-20T16:00:00Z'
  },
  {
    id: 'sproj-004',
    service_id: 'srv-scolarite',
    title: 'Système d\'inscription en ligne v2',
    description: 'Amélioration du portail d\'inscription avec paiement intégré.',
    cover_image: 'https://picsum.photos/seed/sproj-004/800/400',
    progress: 60,
    status: 'ongoing',
    start_date: '2024-10-01',
    expected_end_date: '2025-04-30',
    created_at: '2024-10-01T08:00:00Z',
    updated_at: '2025-01-12T11:00:00Z'
  },
  // Bibliothèque
  {
    id: 'sproj-005',
    service_id: 'srv-bibliotheque',
    title: 'Numérisation des archives',
    description: 'Numérisation et indexation des documents historiques de l\'Université.',
    progress: 45,
    status: 'ongoing',
    start_date: '2024-06-01',
    expected_end_date: '2025-12-31',
    created_at: '2024-06-01T08:00:00Z',
    updated_at: '2025-01-08T09:00:00Z'
  },
  {
    id: 'sproj-006',
    service_id: 'srv-bibliotheque',
    title: 'Extension des horaires d\'ouverture',
    description: 'Étude et mise en place d\'horaires étendus avec permanences.',
    progress: 0,
    status: 'planned',
    start_date: '2025-02-01',
    expected_end_date: '2025-05-31',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z'
  },
  // CIFIP
  {
    id: 'sproj-007',
    service_id: 'srv-cifip',
    title: 'Plateforme de cours en ligne',
    description: 'Déploiement d\'un LMS avec contenus interactifs.',
    cover_image: 'https://picsum.photos/seed/sproj-007/800/400',
    progress: 85,
    status: 'ongoing',
    start_date: '2024-04-01',
    expected_end_date: '2025-02-28',
    created_at: '2024-04-01T08:00:00Z',
    updated_at: '2025-01-18T10:00:00Z'
  },
  {
    id: 'sproj-008',
    service_id: 'srv-cifip',
    title: 'Programme de mentorat pédagogique',
    description: 'Mise en place d\'un système de parrainage entre enseignants expérimentés et nouveaux.',
    progress: 100,
    status: 'completed',
    start_date: '2024-01-15',
    expected_end_date: '2024-07-31',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-08-01T09:00:00Z'
  },
  // Informatique
  {
    id: 'sproj-009',
    service_id: 'srv-informatique',
    title: 'Migration vers le cloud',
    description: 'Migration des serveurs vers une infrastructure cloud hybride.',
    cover_image: 'https://picsum.photos/seed/sproj-009/800/400',
    progress: 50,
    status: 'ongoing',
    start_date: '2024-07-01',
    expected_end_date: '2025-06-30',
    created_at: '2024-07-01T08:00:00Z',
    updated_at: '2025-01-15T14:00:00Z'
  },
  {
    id: 'sproj-010',
    service_id: 'srv-informatique',
    title: 'Audit de cybersécurité',
    description: 'Audit complet et plan de remédiation des vulnérabilités.',
    progress: 20,
    status: 'suspended',
    start_date: '2024-09-01',
    expected_end_date: '2025-01-31',
    created_at: '2024-09-01T08:00:00Z',
    updated_at: '2024-11-15T10:00:00Z'
  },
  // Relations extérieures
  {
    id: 'sproj-011',
    service_id: 'srv-relations-ext',
    title: 'Réseau des universités francophones',
    description: 'Création d\'un consortium avec 5 universités partenaires.',
    progress: 65,
    status: 'ongoing',
    start_date: '2024-05-01',
    expected_end_date: '2025-05-31',
    created_at: '2024-05-01T08:00:00Z',
    updated_at: '2025-01-05T11:00:00Z'
  },
  // Alumni
  {
    id: 'sproj-012',
    service_id: 'srv-alumni',
    title: 'Plateforme de networking alumni',
    description: 'Développement d\'une plateforme de mise en relation des anciens étudiants.',
    cover_image: 'https://picsum.photos/seed/sproj-012/800/400',
    progress: 40,
    status: 'ongoing',
    start_date: '2024-08-01',
    expected_end_date: '2025-04-30',
    created_at: '2024-08-01T08:00:00Z',
    updated_at: '2025-01-12T09:00:00Z'
  }
]

// === TYPES D'ACHIEVEMENTS (pour filtres) ===

export const achievementTypes = [
  'Innovation',
  'Digital',
  'Événement',
  'Digitalisation',
  'Certification',
  'Partenariat',
  'Infrastructure',
  'Formation',
  'Stratégie'
]

// === FONCTIONS HELPER ===

// Générer un nouvel ID
export function generateServiceObjectiveId(): string {
  return `obj-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function generateServiceAchievementId(): string {
  return `ach-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function generateServiceProjectId(): string {
  return `sproj-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// === FONCTIONS CRUD OBJECTIFS ===

export function getServiceObjectives(serviceId: string): ServiceObjective[] {
  return mockServiceObjectives
    .filter(o => o.service_id === serviceId)
    .sort((a, b) => a.display_order - b.display_order)
}

export function getServiceObjectiveById(id: string): ServiceObjective | undefined {
  return mockServiceObjectives.find(o => o.id === id)
}

// === FONCTIONS CRUD RÉALISATIONS ===

export function getServiceAchievements(serviceId: string): ServiceAchievement[] {
  return mockServiceAchievements
    .filter(a => a.service_id === serviceId)
    .sort((a, b) => new Date(b.achievement_date).getTime() - new Date(a.achievement_date).getTime())
}

export function getServiceAchievementById(id: string): ServiceAchievement | undefined {
  return mockServiceAchievements.find(a => a.id === id)
}

export function getServiceAchievementsByType(serviceId: string, type: string): ServiceAchievement[] {
  return getServiceAchievements(serviceId).filter(a => a.type === type)
}

// === FONCTIONS CRUD PROJETS ===

export function getServiceProjects(serviceId: string): ServiceProject[] {
  return mockServiceProjects
    .filter(p => p.service_id === serviceId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}

export function getServiceProjectById(id: string): ServiceProject | undefined {
  return mockServiceProjects.find(p => p.id === id)
}

export function getServiceProjectsByStatus(serviceId: string, status: ServiceProjectStatus): ServiceProject[] {
  return getServiceProjects(serviceId).filter(p => p.status === status)
}

// === FONCTIONS OVERVIEW ===

export function getServiceOverview(serviceId: string): ServiceOverview | undefined {
  const service = mockServices.find(s => s.id === serviceId)
  if (!service) return undefined

  const objectives = getServiceObjectives(serviceId)
  const achievements = getServiceAchievements(serviceId)
  const projects = getServiceProjects(serviceId)

  return {
    service_id: serviceId,
    service_name: service.name_fr,
    department_name: getCategoryLabel(service.category),
    objectives_count: objectives.length,
    achievements_count: achievements.length,
    projects: {
      total: projects.length,
      planned: projects.filter(p => p.status === 'planned').length,
      ongoing: projects.filter(p => p.status === 'ongoing').length,
      completed: projects.filter(p => p.status === 'completed').length,
      suspended: projects.filter(p => p.status === 'suspended').length
    }
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    rectorat: 'Rectorat',
    academique: 'Services académiques',
    administratif: 'Services administratifs'
  }
  return labels[category] || category
}

// === STATISTIQUES GLOBALES ===

export interface ServiceObjectivesStats {
  totalServices: number
  totalObjectives: number
  totalAchievements: number
  totalProjects: number
  projectsByStatus: {
    planned: number
    ongoing: number
    completed: number
    suspended: number
  }
  averageProgress: number
  recentAchievements: ServiceAchievement[]
}

export function getServiceObjectivesStats(): ServiceObjectivesStats {
  const servicesWithData = new Set([
    ...mockServiceObjectives.map(o => o.service_id),
    ...mockServiceAchievements.map(a => a.service_id),
    ...mockServiceProjects.map(p => p.service_id)
  ])

  const ongoingProjects = mockServiceProjects.filter(p => p.status === 'ongoing')
  const averageProgress = ongoingProjects.length > 0
    ? Math.round(ongoingProjects.reduce((sum, p) => sum + p.progress, 0) / ongoingProjects.length)
    : 0

  return {
    totalServices: servicesWithData.size,
    totalObjectives: mockServiceObjectives.length,
    totalAchievements: mockServiceAchievements.length,
    totalProjects: mockServiceProjects.length,
    projectsByStatus: {
      planned: mockServiceProjects.filter(p => p.status === 'planned').length,
      ongoing: mockServiceProjects.filter(p => p.status === 'ongoing').length,
      completed: mockServiceProjects.filter(p => p.status === 'completed').length,
      suspended: mockServiceProjects.filter(p => p.status === 'suspended').length
    },
    averageProgress,
    recentAchievements: [...mockServiceAchievements]
      .sort((a, b) => new Date(b.achievement_date).getTime() - new Date(a.achievement_date).getTime())
      .slice(0, 5)
  }
}

// === SERVICES AVEC DONNÉES ===

export interface ServiceWithData {
  id: string
  name: string
  category: string
  categoryLabel: string
  objectivesCount: number
  achievementsCount: number
  projectsCount: number
  ongoingProjectsCount: number
}

export function getServicesWithData(): ServiceWithData[] {
  return mockServices
    .filter(s => s.is_active)
    .map(s => {
      const objectives = getServiceObjectives(s.id)
      const achievements = getServiceAchievements(s.id)
      const projects = getServiceProjects(s.id)

      return {
        id: s.id,
        name: s.name_fr,
        category: s.category,
        categoryLabel: getCategoryLabel(s.category),
        objectivesCount: objectives.length,
        achievementsCount: achievements.length,
        projectsCount: projects.length,
        ongoingProjectsCount: projects.filter(p => p.status === 'ongoing').length
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getServicesGroupedByCategory(): Record<string, ServiceWithData[]> {
  const services = getServicesWithData()
  const grouped: Record<string, ServiceWithData[]> = {}

  for (const service of services) {
    if (!grouped[service.category]) {
      grouped[service.category] = []
    }
    grouped[service.category].push(service)
  }

  return grouped
}
