/**
 * Types API alignés sur les schemas Pydantic du backend
 *
 * Ce fichier réexporte tous les types pour la rétrocompatibilité.
 * Les types sont maintenant organisés par domaine dans le dossier ./api/
 *
 * @example
 * // Import groupé (fonctionne toujours)
 * import type { UserMe, TokenResponse } from '~/types/api'
 *
 * // Import spécifique (recommandé pour le tree-shaking)
 * import type { UserMe } from '~/types/api/users'
 * import type { TokenResponse } from '~/types/api/auth'
 */

export * from './api/index'
