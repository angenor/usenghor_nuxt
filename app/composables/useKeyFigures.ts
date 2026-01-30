/**
 * Composable - Key Figures (Chiffres-clés)
 * ========================================
 *
 * Accès aux chiffres-clés éditables via l'admin.
 * Utilisé par les pages front-office pour afficher les statistiques.
 *
 * @example
 * ```typescript
 * const { getFigure, loadKeyFigures } = useKeyFigures()
 *
 * onMounted(() => loadKeyFigures())
 *
 * const stats = computed(() => [
 *   { value: getFigure('stats_alumni', '4200+'), label: 'Alumni' },
 * ])
 * ```
 */

import { useKeyFiguresStore } from '~/stores/keyFigures'

export function useKeyFigures() {
  const store = useKeyFiguresStore()

  /**
   * Charge les chiffres-clés depuis l'API (non-bloquant)
   * Le store gère le cache et évite les appels multiples
   */
  function loadKeyFigures(): void {
    // Appel non-bloquant - ne pas attendre
    store.fetchFigures()
  }

  /**
   * Récupère un chiffre-clé avec fallback sur la valeur par défaut
   *
   * @param key - Clé du chiffre (ex: 'stats_alumni')
   * @param defaultValue - Valeur par défaut si non trouvé en base
   * @returns La valeur du chiffre ou la valeur par défaut
   */
  function getFigure(key: string, defaultValue: string | number): string {
    const value = store.getFigure(key)
    return value !== undefined ? value : String(defaultValue)
  }

  /**
   * Force le rechargement des chiffres-clés
   */
  function refreshKeyFigures(): void {
    store.invalidateCache()
    store.fetchFigures()
  }

  return {
    loadKeyFigures,
    getFigure,
    refreshKeyFigures,
    isLoading: computed(() => store.isLoading),
    isLoaded: computed(() => store.isLoaded),
  }
}
