/**
 * Règles de présentation de « Nos alumni » (mini-site PEI) : teinte par rang de cohorte,
 * ordre chronologique des promotions, découpe des libellés et du titre du hero.
 * Palette reprise de `PEI_PHASE_TONES` (même famille de couleurs que « Nos activités ») :
 * `ink` pour le texte sur fond clair, `fill` en mode sombre (≥ 4.5:1, cf. pei-presentation.ts).
 */

import type { PeiCohortPublic, PeiLaureatePublic } from '~/types/api/entrepreneurship'
import type { PeiStepTone } from '~/utils/pei-presentation'
import { isHttpUrl, PEI_PHASE_TONES } from '~/utils/pei-presentation'

/** Promotions FSE : orange, violet, turquoise, puis rouge, vert, bleu de la marque. */
const COHORT_TONE_ORDER = ['awareness', 'status', 'funding', 'pre_incubation', 'incubation', 'ecosystem'] as const

/** Parcours SEE (étiquettes) : rouge puis vert, comme la maquette, puis le reste de la palette. */
const SEE_TONE_ORDER = ['pre_incubation', 'incubation', 'status', 'funding', 'awareness', 'ecosystem'] as const

/** Teinte d'une promotion FSE selon son rang chronologique (en boucle au-delà de six). */
export function peiCohortTone(rank: number): PeiStepTone {
  return PEI_PHASE_TONES[COHORT_TONE_ORDER[rank % COHORT_TONE_ORDER.length]!]
}

/** Teinte de l'étiquette d'un parcours SEE selon le rang de sa cohorte. */
export function peiSeeTrackTone(rank: number): PeiStepTone {
  return PEI_PHASE_TONES[SEE_TONE_ORDER[rank % SEE_TONE_ORDER.length]!]
}

/** Promotions dans l'ordre chronologique (frise) : année, puis ordre du backoffice. */
export function sortCohortsChronologically<T extends Pick<PeiCohortPublic, 'year' | 'display_order'>>(cohorts: T[]): T[] {
  return [...cohorts].sort((a, b) => a.year - b.year || a.display_order - b.display_order)
}

/** « FSE 1 · Lancement 2023 » → { short: « FSE 1 », tag: « Lancement 2023 » } (tag vide sans séparateur). */
export function splitCohortLabel(label: string): { short: string, tag: string } {
  const [short, ...rest] = label.split(/\s+[·•|]\s+/)
  return { short: (short ?? label).trim(), tag: rest.join(' · ').trim() }
}

/**
 * Titre de hero sur deux lignes (seconde en couleur) : saut de ligne saisi, sinon fin de la
 * première phrase, sinon première ponctuation (, : ; —), sinon dernier mot (règle de « Nos activités »).
 */
export function splitPeiTitle(title: string): [string, string] {
  const value = title.trim()
  const newline = value.indexOf('\n')
  if (newline > 0) return [value.slice(0, newline).trim(), value.slice(newline + 1).trim()]
  const sentence = value.match(/^(.+?[.!?])\s+(.+)$/)
  if (sentence) return [sentence[1]!, sentence[2]!]
  const punctuation = value.match(/^(.+?[,:;—–])\s+(.+)$/)
  if (punctuation) return [punctuation[1]!, punctuation[2]!]
  const words = value.split(/\s+/)
  if (words.length < 2) return [value, '']
  return [words.slice(0, -1).join(' '), words.at(-1)!]
}

/** Vrai si la valeur d'un chiffre clé se lit comme un nombre (« 15 », « 5 000 € », « 500+ ») et non comme un texte. */
export function isPeiFigureStat(value: string): boolean {
  return /\d/.test(value) && value.replace(/[^\p{L}]/gu, '').length <= 3
}

const LAUREATE_LINKS = [
  { field: 'website_url', key: 'website', icon: 'fa-solid fa-globe' },
  { field: 'linkedin_url', key: 'linkedin', icon: 'fa-brands fa-linkedin-in' },
  { field: 'instagram_url', key: 'instagram', icon: 'fa-brands fa-instagram' },
  { field: 'facebook_url', key: 'facebook', icon: 'fa-brands fa-facebook-f' },
  { field: 'video_url', key: 'video', icon: 'fa-solid fa-play' },
] as const

export interface PeiLaureateLink {
  /** Clé i18n `pei.alumni.links.<key>`. */
  key: (typeof LAUREATE_LINKS)[number]['key']
  icon: string
  url: string
}

/** Liens d'un portrait (site, LinkedIn, Instagram, Facebook, vidéo) ; `#` accepté pour un exemple de l'aperçu. */
export function peiLaureateLinks(laureate: PeiLaureatePublic, sample = false): PeiLaureateLink[] {
  return LAUREATE_LINKS
    .map(link => ({ key: link.key, icon: link.icon, url: laureate[link.field] ?? '' }))
    .filter(link => (sample ? link.url === '#' || isHttpUrl(link.url) : isHttpUrl(link.url)))
}
