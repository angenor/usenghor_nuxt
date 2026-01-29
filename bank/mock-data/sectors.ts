/**
 * Mock Data: Secteurs
 * Table SQL: sectors
 */

export interface Sector {
  id: string
  slug: string
  name_fr: string
  name_en: string
  name_ar: string
  description_fr: string
  description_en?: string
  description_ar?: string
  icon: string
  color: string
  head_id?: string
  sort_order: number
  is_active: boolean
}

export const mockSectors: Sector[] = [
  {
    id: 'sec-culture',
    slug: 'culture',
    name_fr: 'Culture',
    name_en: 'Culture',
    name_ar: 'الثقافة',
    description_fr: 'Le secteur Culture forme des professionnels capables de concevoir et mettre en œuvre des politiques culturelles adaptées aux réalités africaines.',
    description_en: 'The Culture sector trains professionals capable of designing and implementing cultural policies adapted to African realities.',
    icon: 'palette',
    color: '#8B5CF6',
    head_id: 'staff-001',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'sec-environnement',
    slug: 'environnement',
    name_fr: 'Environnement',
    name_en: 'Environment',
    name_ar: 'البيئة',
    description_fr: 'Le secteur Environnement forme des cadres spécialisés dans la gestion durable des ressources naturelles et l\'adaptation au changement climatique.',
    description_en: 'The Environment sector trains executives specialized in sustainable natural resource management and climate change adaptation.',
    icon: 'leaf',
    color: '#10B981',
    head_id: 'staff-002',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'sec-management',
    slug: 'management',
    name_fr: 'Management',
    name_en: 'Management',
    name_ar: 'الإدارة',
    description_fr: 'Le secteur Management forme des dirigeants et gestionnaires capables de piloter des organisations publiques et privées en Afrique.',
    description_en: 'The Management sector trains leaders and managers capable of leading public and private organizations in Africa.',
    icon: 'briefcase',
    color: '#F59E0B',
    head_id: 'staff-003',
    sort_order: 3,
    is_active: true
  },
  {
    id: 'sec-sante',
    slug: 'sante',
    name_fr: 'Santé',
    name_en: 'Health',
    name_ar: 'الصحة',
    description_fr: 'Le secteur Santé forme des professionnels de santé publique et des gestionnaires de systèmes de santé pour l\'Afrique.',
    description_en: 'The Health sector trains public health professionals and health system managers for Africa.',
    icon: 'heart-pulse',
    color: '#EF4444',
    head_id: 'staff-004',
    sort_order: 4,
    is_active: true
  },
  {
    id: 'sec-doctoral',
    slug: 'ecole-doctorale',
    name_fr: 'École doctorale',
    name_en: 'Doctoral School',
    name_ar: 'مدرسة الدكتوراه',
    description_fr: 'L\'École doctorale coordonne les programmes de doctorat et encadre les travaux de recherche des doctorants.',
    description_en: 'The Doctoral School coordinates doctoral programs and supervises doctoral research.',
    icon: 'graduation-cap',
    color: '#6366F1',
    head_id: 'staff-005',
    sort_order: 5,
    is_active: true
  }
]
