/**
 * Mode aperçu du mini-site « Entreprendre à Senghor » (validation visuelle avant saisie).
 *
 * Pendant la phase de validation, l'aperçu est ACTIF PAR DÉFAUT (`PEI_PREVIEW_DEFAULT`) :
 * les blocs vides sont complétés par des contenus d'exemple et un bandeau le signale.
 * `?apercu=0` affiche l'état réel, `?apercu=1` force l'aperçu. À l'ouverture du mini-site,
 * passer `PEI_PREVIEW_DEFAULT` à `false` (et retirer la règle noindex de `nuxt.config.ts`).
 */
export const PEI_PREVIEW_QUERY = 'apercu'
export const PEI_PREVIEW_DEFAULT = true

/**
 * Accès publics au mini-site PEI (pôle dans l'organigramme, pages secteur et fiches service,
 * entrée du menu, lien du pied de page, plan du site) : masqués tant que le mini-site n'est
 * pas ouvert. Passer à `true` à l'ouverture (le mini-site reste joignable par son adresse).
 */
export const PEI_PUBLICLY_LISTED = false

/** Chemin localisé du mini-site (`/entrepreneuriat`, `/en/entrepreneuriat/…`, `/ar/…`). */
const PEI_PATH = /^\/(?:[a-z]{2}\/)?entrepreneuriat(?:[/?#]|$)/

/** Lien vers le mini-site PEI à masquer tant qu'il n'est pas ouvert (`PEI_PUBLICLY_LISTED`). */
export function isUnlistedPeiPath(path?: string | null): boolean {
  return !PEI_PUBLICLY_LISTED && !!path && PEI_PATH.test(path)
}

/** Service de page dédiée au mini-site PEI (le pôle), à masquer de l'organigramme avant l'ouverture. */
export function isUnlistedPeiService(service: { landing_path?: string | null }): boolean {
  return isUnlistedPeiPath(service.landing_path)
}

export function usePeiPreview() {
  const route = useRoute()

  /** Valeur explicite du paramètre d'adresse (`'0'`, `'1'`), sinon null. */
  const explicit = computed(() => {
    const value = route.query[PEI_PREVIEW_QUERY]
    return value === '0' || value === '1' ? value : null
  })

  const preview = computed(() => (explicit.value ? explicit.value === '1' : PEI_PREVIEW_DEFAULT))

  /**
   * Propage un choix explicite (`?apercu=0|1`, avant l'ancre) sur les liens internes du
   * mini-site ; sans choix explicite, le chemin est rendu tel quel.
   */
  function previewPath(path: string): string {
    if (!explicit.value || !PEI_PATH.test(path)) return path
    const hashIndex = path.indexOf('#')
    const base = hashIndex === -1 ? path : path.slice(0, hashIndex)
    const hash = hashIndex === -1 ? '' : path.slice(hashIndex)
    if (new RegExp(`[?&]${PEI_PREVIEW_QUERY}=`).test(base)) return path
    return `${base}${base.includes('?') ? '&' : '?'}${PEI_PREVIEW_QUERY}=${explicit.value}${hash}`
  }

  return { preview, previewPath }
}
