// ============================================================================
// MOCK DATA - APERÇU DU MINI-SITE PEI (`/entrepreneuriat`, `/entrepreneuriat/activites`)
// ============================================================================
// Validation visuelle de l'accueil « Entreprendre à Senghor » AVANT la saisie des
// vraies données. Aucun identifiant de média n'est codé en dur (ils diffèrent entre
// local et production) : les exemples sont choisis À L'EXÉCUTION parmi les contenus
// publics existants, selon les règles ci-dessous :
//   - photos (hero, bloc impact, visuels des dispositifs, mosaïque de l'écosystème) :
//     réserve partagée `usePeiPreviewImages()` = couvertures des dernières actualités
//     publiées (hors bannières de listes / FAQ), puis des événements publiés ;
//   - portrait de la citation : photo de l'auteur dans l'équipe publique de la DDE s'il y
//     figure (donnée réelle), sinon cadre « Portrait à fournir » — jamais un autre visage ;
//   - actualités : 3 dernières actualités publiées de l'université si le pôle n'en a pas ;
//   - agenda de « Nos activités » : événements publiés de l'université (à venir, sinon les
//     plus récents) si la DDE n'en a aucun à venir ;
//   - partenaires : familles vides complétées avec des partenaires publics à logo.
// Les données réelles gardent toujours la priorité : l'aperçu ne remplit que le vide.
// Tables lues (via API publique) : news, events, partners, service_team
// (09_content.sql, 06_partner.sql, 04_organization.sql)
// ============================================================================

import type { PeiPartnerFamily, PeiPartnerFamilyPublic, PeiPartnerPublic } from '~/types/api/entrepreneurship'
import type { PartnerType } from '~/types/api/organization'

export const peiHomePreview = {
  /** Nombre d'images du hero (une par mot du slogan). */
  heroImageCount: 3,
  /**
   * Numéros d'emplacement dans la réserve `usePeiPreviewImages()` : un numéro distinct par
   * photo de l'accueil (hero : une image par mot du slogan ; bloc impact).
   */
  slots: {
    hero: [0, 1, 2],
    impact: [3],
  },
  /** Actualités lues pour trouver des couvertures (photos d'étudiants / d'événements). */
  newsFetchLimit: 20,
  /** Événements lus en complément si les actualités ne suffisent pas. */
  eventsFetchLimit: 20,
  /** Actualités de l'université affichées si le pôle n'en a aucune. */
  newsFallbackCount: 3,
  /** Partenaires ajoutés au plus par famille vide. */
  partnersPerFamily: 6,
  /**
   * Titres dont la couverture est une bannière typographique (listes d'admis, FAQ, vœux de
   * fêtes…), écartée de la réserve d'images d'exemple.
   */
  excludedCoverTitles: [
    /^liste\b/i,
    /questions fréquemment posées/i,
    /^faq\b/i,
    /\bramadan\b|\bkareem\b|\b(a[iï]d|eid) (el|al|moubarak|mubarak)\b|bonne année|meilleurs vœux|joyeuses? fêtes/i,
  ],
  /**
   * Photos du site (dossier `public/`, vraies photos de l'université) complétant la réserve
   * quand elle compte trop peu de couvertures distinctes (ex. base locale) : le hero garde
   * toujours une image par mot du slogan et une photo n'est pas répétée sur la page.
   */
  fallbackImages: [
    '/images/bg/backgroud_senghor1.jpg',
    '/images/bg/backgroud_senghor4.jpg',
    '/images/bg/backgroud_senghor2.jpg',
  ],
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

/**
 * Aperçu de « Nos activités » (`/entrepreneuriat/activites`).
 * Numéros d'emplacement dans la réserve `usePeiPreviewImages()` : un numéro distinct par
 * photo de la page, pour ne jamais répéter la même image côte à côte.
 */
export const peiActivitiesPreview = {
  slots: {
    /** Visuels des étapes 01 et 02 (grand format). */
    features: [0, 1],
    /** Bande de 3 photos sous les cartes des phases. */
    supportBand: [2, 3, 4],
    /** Mosaïque de l'écosystème : grande 2×2, deux petites, large 2×1. */
    mosaic: [5, 6, 7, 8],
  },
  /** Photos de la mosaïque de l'écosystème (maquette). */
  mosaicCount: 4,
  /**
   * Paragraphe de l'écosystème (cahier des charges, « L'animation de l'écosystème ») affiché
   * si aucun dispositif de phase `ecosystem` n'est publié. Copie éditoriale FR (comme les
   * clés `entrepreneurship.*`, affichées telles quelles dans les trois langues).
   */
  ecosystemText: 'Enfin, la vie du Pôle est rythmée par des événements de haut niveau qui connectent nos talents au monde professionnel. Des Hackathons internationaux sur l\'innovation francophone aux Bootcamps intensifs en passant par les Afterworks, nous créons des ponts permanents entre nos étudiants et les réseaux d\'affaires africains et internationaux.',
  /** Événements d'exemple de l'agenda « Prochains rendez-vous » (maquette : 3 lignes). */
  agendaCount: 3,
}

/** Clé de comparaison d'une photo (chemin sans paramètre `?variant=…`). */
const photoKey = (src: string): string => src.split('?')[0] ?? src

/**
 * Une photo d'exemple par emplacement de la réserve (`image(slot)` de `usePeiPreviewImages`),
 * sans répéter une photo déjà utilisée sur la page : `used` (photos réelles et emplacements
 * précédents) est complété au fil de l'eau. Photo déjà prise → photos suivantes de la réserve
 * (`poolSize` = taille de la réserve), puis photos du site (`fallbackImages`) ; tout est pris
 * → répétition en dernier recours.
 */
export function pickPreviewPhotos(
  slots: number[],
  image: (slot: number) => string | null,
  used: Set<string>,
  poolSize = 1,
): string[] {
  return slots.map((slot) => {
    const pool = Array.from({ length: Math.max(poolSize, 1) }, (_, k) => image(slot + k))
    const candidates = [...pool, ...peiHomePreview.fallbackImages].filter((src): src is string => !!src)
    const src = candidates.find(c => !used.has(photoKey(c))) ?? candidates[0]
    if (src) used.add(photoKey(src))
    return src
  }).filter((src): src is string => !!src)
}

/** Ensemble de départ de `pickPreviewPhotos` : photos réelles déjà affichées sur la page. */
export function usedPhotos(sources: (string | null | undefined)[]): Set<string> {
  return new Set(sources.filter((src): src is string => !!src).map(photoKey))
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
