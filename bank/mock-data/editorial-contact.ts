// ============================================================================
// MOCK DATA - INFORMATIONS DE CONTACT (EDITORIAL CONTACT)
// ============================================================================
// Basé sur le schéma SQL: 12_editorial.sql
// Tables: editorial_categories, editorial_contents
// Stockage en JSON pour les structures complexes
// ============================================================================

import type { EditorialValueType } from './editorial-statistics'

// ============================================================================
// INTERFACES - STRUCTURES DE CONTACT
// ============================================================================

// Adresse principale
export interface ContactAddress {
  street: string
  postal_code: string
  city: string
  country: string
  latitude: number
  longitude: number
}

// Numéros de téléphone
export interface ContactPhones {
  main: string
  secondary: string | null
  fax: string | null
}

// Adresses email
export interface ContactEmails {
  general: string
  admissions: string
  partnerships: string
  press: string | null
}

// Horaires d'ouverture
export interface ContactHours {
  days: string
  hours: string
  timezone: string
  closures: string
}

// Configuration du formulaire de contact
export interface ContactFormConfig {
  default_recipients: string[]
  subjects: string[]
  confirmation_message: string
}

// Contact par service (optionnel)
export interface DepartmentContact {
  id: string
  department_name: string
  email: string
  phone: string | null
  responsible_name: string | null
  order: number
}

// Structure complète des informations de contact
export interface ContactInfo {
  address: ContactAddress
  phones: ContactPhones
  emails: ContactEmails
  hours: ContactHours
  contact_form: ContactFormConfig
  department_contacts: DepartmentContact[]
  social_media: SocialMediaLinks
}

// Liens réseaux sociaux
export interface SocialMediaLinks {
  facebook: string | null
  twitter: string | null
  linkedin: string | null
  youtube: string | null
  instagram: string | null
}

// Contenu éditorial pour contact (stocké en base)
export interface EditorialContactContent {
  id: string
  key: string
  value: string // JSON stringified
  value_type: EditorialValueType
  category_id: string
  description: string
  admin_editable: boolean
  created_at: string
  updated_at: string
}

// Historique des modifications
export interface ContactHistory {
  id: string
  content_key: string
  section: string
  old_value: string
  new_value: string
  modified_by_external_id: string | null
  modified_by_name: string
  modified_at: string
}

// ============================================================================
// DONNÉES MOCK - CATÉGORIE CONTACT
// ============================================================================

export const contactCategoryId = 'cat_contact_001'

export const mockContactCategory = {
  id: contactCategoryId,
  code: 'contact',
  name: 'Informations de contact',
  description: 'Coordonnées et informations de contact de l\'université',
  created_at: '2024-01-01T00:00:00Z'
}

// ============================================================================
// DONNÉES MOCK - INFORMATIONS DE CONTACT
// ============================================================================

export const mockContactAddress: ContactAddress = {
  street: '1 Place Ahmed Orabi',
  postal_code: '21131',
  city: 'Alexandrie',
  country: 'Égypte',
  latitude: 31.2001,
  longitude: 29.9187
}

export const mockContactPhones: ContactPhones = {
  main: '+20 3 484 3562',
  secondary: '+20 3 484 3563',
  fax: '+20 3 484 3564'
}

export const mockContactEmails: ContactEmails = {
  general: 'contact@usenghor.org',
  admissions: 'admissions@usenghor.org',
  partnerships: 'partenariats@usenghor.org',
  press: 'presse@usenghor.org'
}

export const mockContactHours: ContactHours = {
  days: 'Dimanche - Jeudi',
  hours: '08h00 - 16h00',
  timezone: 'EET (UTC+2)',
  closures: 'Jours fériés égyptiens et français'
}

export const mockContactFormConfig: ContactFormConfig = {
  default_recipients: ['contact@usenghor.org'],
  subjects: [
    'Demande d\'information générale',
    'Admissions et inscriptions',
    'Partenariat institutionnel',
    'Partenariat entreprise',
    'Presse et médias',
    'Autre'
  ],
  confirmation_message: 'Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.'
}

export const mockDepartmentContacts: DepartmentContact[] = [
  {
    id: 'dept_contact_001',
    department_name: 'Service des admissions',
    email: 'admissions@usenghor.org',
    phone: '+20 3 484 3565',
    responsible_name: 'Dr. Fatima El-Sayed',
    order: 1
  },
  {
    id: 'dept_contact_002',
    department_name: 'Service de la scolarité',
    email: 'scolarite@usenghor.org',
    phone: '+20 3 484 3566',
    responsible_name: 'M. Ahmed Hassan',
    order: 2
  },
  {
    id: 'dept_contact_003',
    department_name: 'Relations internationales',
    email: 'international@usenghor.org',
    phone: '+20 3 484 3567',
    responsible_name: 'Mme Claire Dubois',
    order: 3
  },
  {
    id: 'dept_contact_004',
    department_name: 'Service financier',
    email: 'finances@usenghor.org',
    phone: '+20 3 484 3568',
    responsible_name: 'M. Omar Benali',
    order: 4
  },
  {
    id: 'dept_contact_005',
    department_name: 'Bibliothèque',
    email: 'bibliotheque@usenghor.org',
    phone: '+20 3 484 3569',
    responsible_name: 'Mme Nadia Mansour',
    order: 5
  },
  {
    id: 'dept_contact_006',
    department_name: 'Service informatique',
    email: 'informatique@usenghor.org',
    phone: '+20 3 484 3570',
    responsible_name: null,
    order: 6
  }
]

export const mockSocialMediaLinks: SocialMediaLinks = {
  facebook: 'https://www.facebook.com/UniversiteSenghor',
  twitter: 'https://twitter.com/USenghor',
  linkedin: 'https://www.linkedin.com/school/universite-senghor/',
  youtube: 'https://www.youtube.com/@UniversiteSenghor',
  instagram: null
}

// Structure complète
export const mockContactInfo: ContactInfo = {
  address: mockContactAddress,
  phones: mockContactPhones,
  emails: mockContactEmails,
  hours: mockContactHours,
  contact_form: mockContactFormConfig,
  department_contacts: mockDepartmentContacts,
  social_media: mockSocialMediaLinks
}

// ============================================================================
// DONNÉES MOCK - CONTENUS ÉDITORIAUX (format base de données)
// ============================================================================

export const mockEditorialContactContents: EditorialContactContent[] = [
  {
    id: 'contact_001',
    key: 'contact_address',
    value: JSON.stringify(mockContactAddress),
    value_type: 'json',
    category_id: contactCategoryId,
    description: 'Adresse principale de l\'université',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-15T10:00:00Z'
  },
  {
    id: 'contact_002',
    key: 'contact_phones',
    value: JSON.stringify(mockContactPhones),
    value_type: 'json',
    category_id: contactCategoryId,
    description: 'Numéros de téléphone',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T14:30:00Z'
  },
  {
    id: 'contact_003',
    key: 'contact_emails',
    value: JSON.stringify(mockContactEmails),
    value_type: 'json',
    category_id: contactCategoryId,
    description: 'Adresses email de contact',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-10T09:15:00Z'
  },
  {
    id: 'contact_004',
    key: 'contact_hours',
    value: JSON.stringify(mockContactHours),
    value_type: 'json',
    category_id: contactCategoryId,
    description: 'Horaires d\'ouverture',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 'contact_005',
    key: 'contact_form_config',
    value: JSON.stringify(mockContactFormConfig),
    value_type: 'json',
    category_id: contactCategoryId,
    description: 'Configuration du formulaire de contact',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-11-05T16:45:00Z'
  },
  {
    id: 'contact_006',
    key: 'contact_social_media',
    value: JSON.stringify(mockSocialMediaLinks),
    value_type: 'json',
    category_id: contactCategoryId,
    description: 'Liens vers les réseaux sociaux',
    admin_editable: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-08-22T11:30:00Z'
  }
]

// ============================================================================
// DONNÉES MOCK - HISTORIQUE DES MODIFICATIONS
// ============================================================================

export const mockContactHistory: ContactHistory[] = [
  {
    id: 'contact_hist_001',
    content_key: 'contact_emails',
    section: 'Emails',
    old_value: 'contact@usenghor-alexandrie.org',
    new_value: 'contact@usenghor.org',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-09-10T09:15:00Z'
  },
  {
    id: 'contact_hist_002',
    content_key: 'contact_hours',
    section: 'Horaires',
    old_value: '09h00 - 17h00',
    new_value: '08h00 - 16h00',
    modified_by_external_id: 'user_admin_002',
    modified_by_name: 'Marie Martin',
    modified_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 'contact_hist_003',
    content_key: 'contact_form_config',
    section: 'Formulaire',
    old_value: '4 sujets',
    new_value: '6 sujets',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-11-05T16:45:00Z'
  },
  {
    id: 'contact_hist_004',
    content_key: 'contact_social_media',
    section: 'Réseaux sociaux',
    old_value: 'YouTube: (vide)',
    new_value: 'YouTube: https://www.youtube.com/@UniversiteSenghor',
    modified_by_external_id: 'user_admin_001',
    modified_by_name: 'Jean Dupont',
    modified_at: '2024-08-22T11:30:00Z'
  }
]

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Récupérer les informations de contact complètes
export const getContactInfo = (): ContactInfo => {
  return { ...mockContactInfo }
}

// Récupérer l'adresse
export const getContactAddress = (): ContactAddress => {
  return { ...mockContactAddress }
}

// Récupérer les téléphones
export const getContactPhones = (): ContactPhones => {
  return { ...mockContactPhones }
}

// Récupérer les emails
export const getContactEmails = (): ContactEmails => {
  return { ...mockContactEmails }
}

// Récupérer les horaires
export const getContactHours = (): ContactHours => {
  return { ...mockContactHours }
}

// Récupérer la configuration du formulaire
export const getContactFormConfig = (): ContactFormConfig => {
  return { ...mockContactFormConfig }
}

// Récupérer les contacts par département
export const getDepartmentContacts = (): DepartmentContact[] => {
  return [...mockDepartmentContacts].sort((a, b) => a.order - b.order)
}

// Récupérer un contact de département par ID
export const getDepartmentContactById = (id: string): DepartmentContact | undefined => {
  return mockDepartmentContacts.find(d => d.id === id)
}

// Récupérer les réseaux sociaux
export const getSocialMediaLinks = (): SocialMediaLinks => {
  return { ...mockSocialMediaLinks }
}

// Récupérer l'historique des modifications
export const getContactHistory = (): ContactHistory[] => {
  return [...mockContactHistory].sort(
    (a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
  )
}

// Générer un ID pour un contact de département
export const generateDepartmentContactId = (): string => {
  return `dept_contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Valider une adresse email
export const validateContactEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Valider un numéro de téléphone (format international)
export const validatePhoneNumber = (phone: string): boolean => {
  // Accepte les formats: +20 3 484 3562, +33 1 23 45 67 89, etc.
  const phoneRegex = /^\+?[\d\s-]{8,20}$/
  return phoneRegex.test(phone)
}

// Valider les coordonnées GPS
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// Formater un numéro de téléphone
export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\+\d{2,3})(\d)(\d{3})(\d{4})/, '$1 $2 $3 $4')
}

// Labels pour les sections
export const contactSectionLabels: Record<string, string> = {
  address: 'Adresse',
  phones: 'Téléphones',
  emails: 'Emails',
  hours: 'Horaires',
  contact_form: 'Formulaire de contact',
  department_contacts: 'Contacts par service',
  social_media: 'Réseaux sociaux'
}

// Icônes pour les sections (FontAwesome)
export const contactSectionIcons: Record<string, string> = {
  address: 'map-marker-alt',
  phones: 'phone',
  emails: 'envelope',
  hours: 'clock',
  contact_form: 'paper-plane',
  department_contacts: 'users',
  social_media: 'share-alt'
}

// Labels pour les réseaux sociaux
export const socialMediaLabels: Record<keyof SocialMediaLinks, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  instagram: 'Instagram'
}

// Icônes pour les réseaux sociaux (FontAwesome brands)
export const socialMediaIcons: Record<keyof SocialMediaLinks, string> = {
  facebook: 'facebook',
  twitter: 'twitter',
  linkedin: 'linkedin',
  youtube: 'youtube',
  instagram: 'instagram'
}

// Couleurs pour les réseaux sociaux
export const socialMediaColors: Record<keyof SocialMediaLinks, string> = {
  facebook: 'bg-blue-600 hover:bg-blue-700 text-white',
  twitter: 'bg-black hover:bg-gray-800 text-white',
  linkedin: 'bg-blue-700 hover:bg-blue-800 text-white',
  youtube: 'bg-red-600 hover:bg-red-700 text-white',
  instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white'
}

// Statistiques de contact
export interface ContactStats {
  sections_count: number
  department_contacts_count: number
  social_media_count: number
  last_updated: string
  form_subjects_count: number
}

export const getContactStats = (): ContactStats => {
  const activeSocialMedia = Object.values(mockSocialMediaLinks).filter(v => v !== null).length

  // Trouver la dernière mise à jour
  const lastUpdated = mockEditorialContactContents.reduce(
    (latest, content) =>
      new Date(content.updated_at) > new Date(latest) ? content.updated_at : latest,
    mockEditorialContactContents[0]?.updated_at || new Date().toISOString()
  )

  return {
    sections_count: Object.keys(contactSectionLabels).length,
    department_contacts_count: mockDepartmentContacts.length,
    social_media_count: activeSocialMedia,
    last_updated: lastUpdated,
    form_subjects_count: mockContactFormConfig.subjects.length
  }
}

// Obtenir l'URL Google Maps pour l'adresse
export const getGoogleMapsUrl = (address: ContactAddress): string => {
  const query = encodeURIComponent(
    `${address.street}, ${address.postal_code} ${address.city}, ${address.country}`
  )
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

// Obtenir l'URL Google Maps avec coordonnées
export const getGoogleMapsUrlWithCoords = (address: ContactAddress): string => {
  return `https://www.google.com/maps?q=${address.latitude},${address.longitude}`
}

// Obtenir le lien mailto
export const getMailtoLink = (email: string, subject?: string): string => {
  let link = `mailto:${email}`
  if (subject) {
    link += `?subject=${encodeURIComponent(subject)}`
  }
  return link
}

// Obtenir le lien tel
export const getTelLink = (phone: string): string => {
  // Supprime les espaces pour le lien tel:
  return `tel:${phone.replace(/\s/g, '')}`
}
