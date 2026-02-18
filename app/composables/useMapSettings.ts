/**
 * Composable - Configuration de la carte du monde
 * ================================================
 *
 * Charge/sauvegarde les paramètres d'affichage de la carte (viewBox, pays exclus)
 * via le système éditorial existant.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MapViewBox {
  x: number
  y: number
  width: number
  height: number
}

export interface MapSettings {
  viewBox: MapViewBox
  excludedCountries: string[]
}

// ============================================================================
// CONSTANTES
// ============================================================================

/** ViewBox par défaut (fallback si API indisponible) */
export const DEFAULT_VIEWBOX: MapViewBox = { x: 420, y: 55, width: 590, height: 540 }

/** Pays exclus par défaut (Amériques + Groenland) */
export const DEFAULT_EXCLUDED_COUNTRIES: string[] = [
  'gl',
  'us', 'ca', 'mx',
  'gt', 'bz', 'hn', 'sv', 'ni', 'cr', 'pa',
  'cu', 'jm', 'ht', 'do', 'pr', 'bs', 'tt', 'bb', 'gd', 'vc', 'lc', 'dm', 'ag', 'kn',
  'br', 'ar', 'co', 'pe', 've', 'cl', 'ec', 'bo', 'py', 'uy', 'gy', 'sr', 'gf',
]

/** Dimensions complètes de la carte SVG (@svg-maps/world) */
export const FULL_MAP_VIEWBOX: MapViewBox = { x: 0, y: 0, width: 1010, height: 666 }

// ============================================================================
// COMPOSABLE
// ============================================================================

export function useMapSettings() {
  /**
   * Convertit un MapViewBox en string SVG viewBox
   */
  function viewBoxToString(vb: MapViewBox): string {
    return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`
  }

  /**
   * Charge les paramètres de la carte (lecture publique, sans auth)
   */
  async function loadMapSettings(): Promise<MapSettings> {
    const { getContentsByKeys } = usePublicEditorialApi()

    try {
      const contents = await getContentsByKeys(['map_viewbox', 'map_excluded_countries'])

      let viewBox = DEFAULT_VIEWBOX
      let excludedCountries = DEFAULT_EXCLUDED_COUNTRIES

      for (const content of contents) {
        if (content.key === 'map_viewbox' && content.value) {
          try {
            viewBox = JSON.parse(content.value)
          }
          catch { /* fallback */ }
        }
        if (content.key === 'map_excluded_countries' && content.value) {
          try {
            excludedCountries = JSON.parse(content.value)
          }
          catch { /* fallback */ }
        }
      }

      return { viewBox, excludedCountries }
    }
    catch {
      return { viewBox: DEFAULT_VIEWBOX, excludedCountries: DEFAULT_EXCLUDED_COUNTRIES }
    }
  }

  /**
   * Sauvegarde les paramètres de la carte (écriture admin, nécessite auth)
   */
  async function saveMapSettings(settings: MapSettings): Promise<void> {
    const { apiFetch } = useApi()

    await apiFetch('/api/admin/editorial/contents/bulk-update', {
      method: 'POST',
      body: {
        updates: [
          { key: 'map_viewbox', value: JSON.stringify(settings.viewBox) },
          { key: 'map_excluded_countries', value: JSON.stringify(settings.excludedCountries) },
        ],
      },
    })
  }

  return {
    loadMapSettings,
    saveMapSettings,
    viewBoxToString,
  }
}
