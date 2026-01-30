/**
 * Composable pour gérer les URLs de l'API selon le contexte d'exécution
 *
 * - Côté serveur (SSR): utilise l'URL interne Docker (http://backend:8000)
 * - Côté client (navigateur): utilise des URLs relatives (proxied par nginx)
 */
export function useApiBase(): string {
  // En SSR (Node.js), on utilise l'URL interne Docker
  if (import.meta.server) {
    return process.env.NUXT_INTERNAL_API_BASE || 'http://backend:8000'
  }

  // Côté client (navigateur), on utilise des URLs relatives
  // Ces requêtes passent par nginx qui les proxy vers le backend
  return ''
}
