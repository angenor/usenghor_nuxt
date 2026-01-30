/**
 * Composable pour utiliser amCharts 5 dans les composants Vue
 * Gère automatiquement le cycle de vie des graphiques (création/destruction)
 */

import type * as am5 from '@amcharts/amcharts5'

interface UseAmChartsOptions {
  /** Activer le thème sombre */
  darkMode?: boolean
  /** Activer les animations */
  animated?: boolean
  /** Activer le thème responsive */
  responsive?: boolean
}

export function useAmCharts(options: UseAmChartsOptions = {}) {
  const { $am5, $am5xy, $am5percent, $am5map, $am5radar, $am5hierarchy, $am5flow, $am5stock, $am5themes } = useNuxtApp()

  const roots = ref<am5.Root[]>([])

  /**
   * Crée une nouvelle instance Root amCharts
   * @param elementId - L'ID de l'élément DOM conteneur
   * @param customOptions - Options personnalisées pour cette instance
   */
  function createRoot(elementId: string, customOptions?: UseAmChartsOptions): am5.Root | null {
    if (!$am5) {
      console.warn('[useAmCharts] amCharts 5 n\'est pas disponible (côté serveur)')
      return null
    }

    const mergedOptions = { ...options, ...customOptions }

    // Créer la racine
    const root = $am5.Root.new(elementId)

    // Appliquer les thèmes
    const themes: am5.Theme[] = []

    if (mergedOptions.animated !== false) {
      themes.push($am5themes.Animated.new(root))
    }

    if (mergedOptions.darkMode) {
      themes.push($am5themes.Dark.new(root))
    }

    if (mergedOptions.responsive) {
      themes.push($am5themes.Responsive.new(root))
    }

    if (themes.length > 0) {
      root.setThemes(themes)
    }

    // Stocker la référence pour le nettoyage
    roots.value.push(root)

    return root
  }

  /**
   * Dispose une instance Root spécifique
   */
  function disposeRoot(root: am5.Root) {
    if (root && !root.isDisposed()) {
      root.dispose()
      roots.value = roots.value.filter(r => r !== root)
    }
  }

  /**
   * Dispose toutes les instances Root créées
   */
  function disposeAll() {
    roots.value.forEach(root => {
      if (!root.isDisposed()) {
        root.dispose()
      }
    })
    roots.value = []
  }

  // Nettoyage automatique lors du démontage du composant
  onUnmounted(() => {
    disposeAll()
  })

  return {
    // Modules amCharts
    am5: $am5,
    am5xy: $am5xy,
    am5percent: $am5percent,
    am5map: $am5map,
    am5radar: $am5radar,
    am5hierarchy: $am5hierarchy,
    am5flow: $am5flow,
    am5stock: $am5stock,
    themes: $am5themes,

    // Fonctions utilitaires
    createRoot,
    disposeRoot,
    disposeAll,

    // État
    roots: readonly(roots)
  }
}
