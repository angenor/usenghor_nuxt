/**
 * Configuration des valeurs éditoriales : constantes, labels legacy et icônes
 */

import type { ValueSectionKey } from '~/types/api'

// Catégorie code pour les valeurs
export const VALUES_CATEGORY_CODE = 'values'

// Préfixe pour les clés de valeurs fondamentales
export const CORE_VALUE_KEY_PREFIX = 'core_value_'

// Labels pour les sections (legacy, utilisé uniquement pour les 4 sections principales)
export const valueSectionLabels: Partial<Record<ValueSectionKey, string>> = {
  mission: 'Mission',
  vision: 'Vision',
  history: 'Historique / À propos',
  rector_message: 'Mot du recteur',
}

// Descriptions pour les sections (legacy)
export const valueSectionDescriptions: Partial<Record<ValueSectionKey, string>> = {
  mission: 'La mission de l\'Université Senghor et ses objectifs principaux',
  vision: 'La vision à long terme et les aspirations de l\'université',
  history: 'L\'histoire et le contexte de création de l\'université',
  rector_message: 'Le message du recteur aux étudiants et partenaires',
}

// Icônes pour les sections (legacy)
export const valueSectionIcons: Partial<Record<ValueSectionKey, string>> = {
  mission: 'bullseye',
  vision: 'eye',
  history: 'book-open',
  rector_message: 'user-tie',
}

// Couleurs pour les sections (legacy)
export const valueSectionColors: Partial<Record<ValueSectionKey, string>> = {
  mission: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  vision: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  history: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  rector_message: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

// Clés des sections (ordre d'affichage)
export const sectionKeys: ValueSectionKey[] = ['mission', 'vision', 'history', 'rector_message']

// Icônes disponibles pour les valeurs fondamentales
export const coreValueAvailableIcons: Array<{ value: string, label: string }> = [
  { value: 'star', label: 'Étoile' },
  { value: 'award', label: 'Récompense' },
  { value: 'heart', label: 'Cœur' },
  { value: 'lightbulb', label: 'Ampoule' },
  { value: 'users', label: 'Utilisateurs' },
  { value: 'globe', label: 'Globe' },
  { value: 'handshake', label: 'Poignée de main' },
  { value: 'graduation-cap', label: 'Chapeau diplômé' },
  { value: 'book', label: 'Livre' },
  { value: 'shield-alt', label: 'Bouclier' },
  { value: 'balance-scale', label: 'Balance' },
  { value: 'seedling', label: 'Pousse' },
  { value: 'rocket', label: 'Fusée' },
  { value: 'compass', label: 'Boussole' },
  { value: 'gem', label: 'Diamant' },
  { value: 'flag', label: 'Drapeau' },
]
