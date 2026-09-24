/**
 * Mode aperçu du mini-site « Entreprendre à Senghor » (validation visuelle avant saisie).
 *
 * Activé UNIQUEMENT par le paramètre d'adresse `?apercu=1` : sans lui, tout est inchangé
 * (`previewPath` rend le chemin tel quel). En aperçu, `previewPath` propage le paramètre
 * sur les liens internes du mini-site (`/entrepreneuriat…`, quelle que soit la langue).
 */
export const PEI_PREVIEW_QUERY = 'apercu'

/** Chemin localisé du mini-site (`/entrepreneuriat`, `/en/entrepreneuriat/…`, `/ar/…`). */
const PEI_PATH = /^\/(?:[a-z]{2}\/)?entrepreneuriat(?:[/?#]|$)/

export function usePeiPreview() {
  const route = useRoute()

  const preview = computed(() => route.query[PEI_PREVIEW_QUERY] === '1')

  /** Ajoute `?apercu=1` (avant l'ancre) à un chemin localisé du mini-site, en aperçu seulement. */
  function previewPath(path: string): string {
    if (!preview.value || !PEI_PATH.test(path)) return path
    const hashIndex = path.indexOf('#')
    const base = hashIndex === -1 ? path : path.slice(0, hashIndex)
    const hash = hashIndex === -1 ? '' : path.slice(hashIndex)
    if (new RegExp(`[?&]${PEI_PREVIEW_QUERY}=`).test(base)) return path
    return `${base}${base.includes('?') ? '&' : '?'}${PEI_PREVIEW_QUERY}=1${hash}`
  }

  return { preview, previewPath }
}
