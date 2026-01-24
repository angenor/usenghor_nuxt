/**
 * Mock Data: Catégories de projets (Admin)
 * Gestion des catégories pour classifier les projets institutionnels
 */

import { mockProjects } from './projets'

// Types
export interface ProjectCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  display_order: number
  project_count: number
  created_at: string
}

export interface ProjectCategoryStats {
  total: number
  totalProjectCount: number
  mostUsed: ProjectCategory | null
  leastUsed: ProjectCategory | null
}

export interface ProjectCategoryFilters {
  search?: string
  sort_by?: 'name' | 'project_count' | 'display_order'
  sort_order?: 'asc' | 'desc'
}

// Compter les projets par catégorie (utilise category_ids)
function countProjectsByCategory(categoryId: string): number {
  return mockProjects.filter(p => p.category_ids.includes(categoryId)).length
}

// Données mock des catégories
export const mockProjectCategories: ProjectCategory[] = [
  {
    id: 'cat-1',
    name: 'Éducation',
    slug: 'education',
    description: 'Programmes de formation, bourses d\'excellence et renforcement des capacités académiques',
    icon: 'graduation-cap',
    display_order: 1,
    project_count: countProjectsByCategory('cat-1'),
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'cat-2',
    name: 'Culture',
    slug: 'culture',
    description: 'Industries culturelles et créatives, patrimoine et arts du spectacle',
    icon: 'palette',
    display_order: 2,
    project_count: countProjectsByCategory('cat-2'),
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'cat-3',
    name: 'Entrepreneuriat',
    slug: 'entrepreneuriat',
    description: 'Soutien à l\'innovation et à la création d\'entreprises',
    icon: 'rocket',
    display_order: 3,
    project_count: countProjectsByCategory('cat-3'),
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'cat-4',
    name: 'Recherche',
    slug: 'recherche',
    description: 'Projets de recherche académique et réseaux scientifiques',
    icon: 'microscope',
    display_order: 4,
    project_count: countProjectsByCategory('cat-4'),
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'cat-5',
    name: 'Numérique',
    slug: 'numerique',
    description: 'Transformation digitale et formation aux technologies',
    icon: 'laptop-code',
    display_order: 5,
    project_count: countProjectsByCategory('cat-5'),
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'cat-6',
    name: 'Développement durable',
    slug: 'developpement-durable',
    description: 'Projets environnementaux et transition écologique',
    icon: 'leaf',
    display_order: 6,
    project_count: countProjectsByCategory('cat-6'),
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'cat-7',
    name: 'Santé',
    slug: 'sante',
    description: 'Santé publique et systèmes de santé en Afrique',
    icon: 'heart-pulse',
    display_order: 7,
    project_count: countProjectsByCategory('cat-7'),
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'cat-8',
    name: 'Gouvernance',
    slug: 'gouvernance',
    description: 'Administration publique et renforcement institutionnel',
    icon: 'landmark',
    display_order: 8,
    project_count: countProjectsByCategory('cat-8'),
    created_at: '2024-01-01T10:00:00Z'
  }
]

// Générer un nouvel ID de catégorie
export function generateProjectCategoryId(): string {
  return `cat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Générer un slug à partir du nom
export function slugifyCategory(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '') // Supprime les tirets en début/fin
}

// Récupérer toutes les catégories
export function getAllProjectCategories(): ProjectCategory[] {
  return [...mockProjectCategories].sort((a, b) => a.display_order - b.display_order)
}

// Récupérer une catégorie par ID
export function getProjectCategoryById(id: string): ProjectCategory | undefined {
  return mockProjectCategories.find(c => c.id === id)
}

// Récupérer une catégorie par slug
export function getProjectCategoryBySlug(slug: string): ProjectCategory | undefined {
  return mockProjectCategories.find(c => c.slug === slug)
}

// Récupérer les catégories filtrées
export function getFilteredProjectCategories(filters?: ProjectCategoryFilters): ProjectCategory[] {
  let result = [...mockProjectCategories]

  // Recherche textuelle
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.slug.toLowerCase().includes(search) ||
      c.description?.toLowerCase().includes(search)
    )
  }

  // Tri
  const sortBy = filters?.sort_by || 'display_order'
  const sortOrder = filters?.sort_order || 'asc'

  result.sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'project_count':
        comparison = a.project_count - b.project_count
        break
      case 'display_order':
      default:
        comparison = a.display_order - b.display_order
        break
    }
    return sortOrder === 'desc' ? -comparison : comparison
  })

  return result
}

// Statistiques des catégories
export function getProjectCategoryStats(): ProjectCategoryStats {
  const categories = [...mockProjectCategories]
  const sortedByUsage = categories.sort((a, b) => b.project_count - a.project_count)
  const withProjects = sortedByUsage.filter(c => c.project_count > 0)

  return {
    total: categories.length,
    totalProjectCount: categories.reduce((sum, c) => sum + c.project_count, 0),
    mostUsed: withProjects[0] || null,
    leastUsed: withProjects[withProjects.length - 1] || null
  }
}

// Vérifier si une catégorie est utilisée
export function isProjectCategoryUsed(categoryId: string): boolean {
  const category = getProjectCategoryById(categoryId)
  return category ? category.project_count > 0 : false
}

// Vérifier l'utilisation d'une catégorie (pour la suppression)
export interface CategoryUsage {
  project_count: number
  can_delete: boolean
  projects_sample: Array<{ id: string; title: string }>
}

export function checkProjectCategoryUsage(categoryId: string): CategoryUsage {
  const category = getProjectCategoryById(categoryId)
  if (!category) {
    return { project_count: 0, can_delete: true, projects_sample: [] }
  }

  // Trouver les projets utilisant cette catégorie
  const projectsUsingCategory = mockProjects.filter(p => p.category_ids.includes(categoryId))

  return {
    project_count: projectsUsingCategory.length,
    can_delete: true, // On peut toujours supprimer, les projets seront dissociés
    projects_sample: projectsUsingCategory.slice(0, 3).map(p => ({
      id: p.id,
      title: p.title_fr
    }))
  }
}

// Liste des icônes disponibles pour les catégories
export const categoryIcons = [
  { value: 'graduation-cap', label: 'Éducation' },
  { value: 'palette', label: 'Culture' },
  { value: 'rocket', label: 'Entrepreneuriat' },
  { value: 'microscope', label: 'Recherche' },
  { value: 'laptop-code', label: 'Numérique' },
  { value: 'leaf', label: 'Environnement' },
  { value: 'heart-pulse', label: 'Santé' },
  { value: 'landmark', label: 'Gouvernance' },
  { value: 'briefcase', label: 'Mallette' },
  { value: 'globe', label: 'International' },
  { value: 'users', label: 'Communauté' },
  { value: 'lightbulb', label: 'Innovation' },
  { value: 'building-2', label: 'Infrastructure' },
  { value: 'coins', label: 'Finance' },
  { value: 'handshake', label: 'Partenariat' }
]
