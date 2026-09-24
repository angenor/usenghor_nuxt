// ============================================================================
// MOCK DATA - APERÇU DE L'ACCUEIL DU PÔLE PEI (`/entrepreneuriat?apercu=1`)
// ============================================================================
// Validation visuelle de l'accueil « Entreprendre à Senghor » AVANT la saisie des
// vraies données. Aucun identifiant de média n'est codé en dur (ils diffèrent entre
// local et production) : les exemples sont choisis À L'EXÉCUTION parmi les contenus
// publics existants, selon les règles ci-dessous :
//   - images du hero et du bloc impact : couvertures des dernières actualités publiées
//     (hors bannières de listes / FAQ), puis couvertures des événements publiés ;
//   - actualités : 3 dernières actualités publiées de l'université si le pôle n'en a pas ;
//   - partenaires : familles vides complétées avec des partenaires publics à logo.
// Les données réelles gardent toujours la priorité : l'aperçu ne remplit que le vide.
// Tables lues (via API publique) : news, events, partners (09_content.sql, 06_partner.sql)
// ============================================================================

import type { PeiPartnerFamily, PeiPartnerFamilyPublic, PeiPartnerPublic } from '~/types/api/entrepreneurship'
import type { PartnerType } from '~/types/api/organization'

export const peiHomePreview = {
  /** Nombre d'images du hero (une par mot du slogan). */
  heroImageCount: 3,
  /** Actualités lues pour trouver des couvertures (photos d'étudiants / d'événements). */
  newsFetchLimit: 20,
  /** Événements lus en complément si les actualités ne suffisent pas. */
  eventsFetchLimit: 20,
  /** Actualités de l'université affichées si le pôle n'en a aucune. */
  newsFallbackCount: 3,
  /** Partenaires ajoutés au plus par famille vide. */
  partnersPerFamily: 6,
  /**
   * Titres dont la couverture est une bannière typographique (listes d'admis, FAQ…),
   * écartée pour le hero et le bloc impact.
   */
  excludedCoverTitles: [/^liste\b/i, /questions fréquemment posées/i, /^faq\b/i],
  /** Partenaires jamais proposés en exemple (fiches de test). */
  excludedPartnerNames: /\btest\b/i,
  /** Répartition plausible par famille, sur le nom du partenaire (ordre = priorité). */
  familyRules: [
    {
      family: 'international',
      pattern: /\b(AUF|OIF|AFD|APF|AIMF|FAO|Unesco|IUCN|UICN|Ramsar|CAMES)\b|agence (universitaire|française)|organisation internationale|francophonie/i,
    },
    {
      family: 'academic',
      pattern: /universit|école|ecole|institut|sciences po|business school|\b(ENSSIB|ICHEC|ENAP|ISCAM|UCAC|EAMAU|IDG|IPMD|IBDL|CEAlex|ENAREF)\b/i,
    },
    {
      family: 'support',
      pattern: /\bCCI\b|chambre de commerce|make sense|bioforce|\btrace\b|incubat|\bCMA\b|minist/i,
    },
  ] as { family: PeiPartnerFamily, pattern: RegExp }[],
}

/** Source d'une couverture candidate (actualité ou événement publié). */
export interface PeiPreviewCoverSource {
  title: string
  cover_image_external_id: string | null
}

/** Identifiants de couvertures exploitables, sans doublon, dans l'ordre des sources. */
export function pickPreviewCoverIds(sources: PeiPreviewCoverSource[]): string[] {
  const ids: string[] = []
  for (const source of sources) {
    const id = source.cover_image_external_id
    if (!id || ids.includes(id)) continue
    if (peiHomePreview.excludedCoverTitles.some(pattern => pattern.test(source.title))) continue
    ids.push(id)
  }
  return ids
}

/** Partenaire public minimal (sous-ensemble de `PartnerPublic`). */
export interface PeiPreviewPartnerSource {
  id: string
  name: string
  description: string | null
  description_en: string | null
  description_ar: string | null
  website: string | null
  logo_url: string | null
  type: PartnerType
}

/**
 * Complète UNIQUEMENT les familles vides (ou absentes) avec des partenaires publics à logo,
 * absents des familles réelles : d'abord ceux dont le nom correspond à la famille,
 * puis, s'il en manque, les partenaires restants dans l'ordre du catalogue.
 */
export function fillEmptyPartnerFamilies(
  families: PeiPartnerFamilyPublic[],
  catalog: PeiPreviewPartnerSource[],
  perFamily = peiHomePreview.partnersPerFamily,
): PeiPartnerFamilyPublic[] {
  const taken = new Set(families.flatMap(f => f.partners.flatMap(p => [p.id, p.name.trim().toLowerCase()])))
  const pool = catalog.filter(p =>
    p.logo_url
    && !peiHomePreview.excludedPartnerNames.test(p.name)
    && !taken.has(p.id)
    && !taken.has(p.name.trim().toLowerCase()),
  )
  const used = new Set<string>()
  const toPublic = (p: PeiPreviewPartnerSource, index: number): PeiPartnerPublic => {
    used.add(p.id)
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      description_en: p.description_en,
      description_ar: p.description_ar,
      website: p.website,
      logo_url: p.logo_url,
      type: p.type,
      display_order: index,
    }
  }

  const byFamily = new Map(families.map(f => [f.family, f]))
  const empty = peiHomePreview.familyRules
    .map(rule => rule.family)
    .filter(family => !(byFamily.get(family)?.partners.length))

  const filled = new Map<PeiPartnerFamily, PeiPartnerPublic[]>()
  // 1. Correspondance par nom
  for (const family of empty) {
    const pattern = peiHomePreview.familyRules.find(rule => rule.family === family)!.pattern
    const matches = pool.filter(p => !used.has(p.id) && pattern.test(p.name)).slice(0, perFamily)
    filled.set(family, matches.map(toPublic))
  }
  // 2. Répartition simple pour les familles restées vides
  for (const family of empty) {
    if (filled.get(family)?.length) continue
    filled.set(family, pool.filter(p => !used.has(p.id)).slice(0, perFamily).map(toPublic))
  }

  const result = families.map(f => (filled.get(f.family)?.length ? { ...f, partners: filled.get(f.family)! } : f))
  for (const family of empty) {
    if (!byFamily.has(family) && filled.get(family)?.length) result.push({ family, partners: filled.get(family)! })
  }
  return result
}
