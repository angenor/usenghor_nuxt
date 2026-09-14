/**
 * Règles de présentation publiques du Pôle Entrepreneuriat et Innovation (PEI).
 * Spec : specs/023-pei-public-home-activities (research R13).
 */

import type { PeiColor, PeiPartnerFamily, PeiProgramPhase } from '~/types/api/entrepreneurship'

/** Ordre du parcours (blocs de « Nos activités »). */
export const PEI_PHASE_ORDER: PeiProgramPhase[] = [
  'awareness',
  'status',
  'pre_incubation',
  'incubation',
  'funding',
  'ecosystem',
]

/** Ancres stables par phase (sans accent ni tiret bas). */
export const PEI_PHASE_ANCHORS: Record<PeiProgramPhase, string> = {
  awareness: 'phase-awareness',
  status: 'phase-status',
  pre_incubation: 'phase-pre-incubation',
  incubation: 'phase-incubation',
  funding: 'phase-funding',
  ecosystem: 'phase-ecosystem',
}

/** Ordre fixe des familles de partenaires du pôle. */
export const PEI_FAMILY_ORDER: PeiPartnerFamily[] = ['academic', 'support', 'international']

export interface PeiColorClasses {
  border: string
  numBg: string
  numText: string
  label: string
}

/** Classes Tailwind (clair / sombre) par couleur nommée d'un dispositif. */
export const PEI_COLOR_CLASSES: Record<PeiColor, PeiColorClasses> = {
  blue: {
    border: 'border-t-brand-blue-500',
    numBg: 'bg-brand-blue-100 dark:bg-brand-blue-900/40',
    numText: 'text-brand-blue-700 dark:text-brand-blue-300',
    label: 'text-brand-blue-700 dark:text-brand-blue-300',
  },
  blue_dark: {
    border: 'border-t-brand-blue-700',
    numBg: 'bg-brand-blue-100 dark:bg-brand-blue-950/50',
    numText: 'text-brand-blue-800 dark:text-brand-blue-200',
    label: 'text-brand-blue-800 dark:text-brand-blue-200',
  },
  red: {
    border: 'border-t-brand-red-500',
    numBg: 'bg-brand-red-100 dark:bg-brand-red-900/40',
    numText: 'text-brand-red-700 dark:text-brand-red-300',
    label: 'text-brand-red-700 dark:text-brand-red-300',
  },
  amber: {
    border: 'border-t-amber-500',
    numBg: 'bg-amber-100 dark:bg-amber-900/40',
    numText: 'text-amber-800 dark:text-amber-300',
    label: 'text-amber-800 dark:text-amber-300',
  },
  teal: {
    border: 'border-t-teal-600',
    numBg: 'bg-teal-100 dark:bg-teal-900/40',
    numText: 'text-teal-800 dark:text-teal-300',
    label: 'text-teal-800 dark:text-teal-300',
  },
}

/** Classes d'une couleur ; valeur inconnue → bleu. */
export function peiColorClasses(color: string | null | undefined): PeiColorClasses {
  return PEI_COLOR_CLASSES[color as PeiColor] ?? PEI_COLOR_CLASSES.blue
}

/** Vrai si la valeur est animable en compteur (« 12 », « 500+ »). */
export function isNumericStat(value: string): boolean {
  return /^\d+[^\d]*$/.test(value.trim())
}

/** Vrai si la chaîne est un UUID. */
export function isUuid(value: string | null | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim())
}

interface LenisLike {
  scrollTo: (target: HTMLElement, options?: { offset?: number, immediate?: boolean, force?: boolean }) => void
}

/**
 * Défile vers une ancre de la page en respectant `scroll-margin-top`
 * (en-tête + sous-navigation collants), sans passer par le routeur.
 * Lenis (plugin gsap) intercepte le défilement natif : il est utilisé s'il est fourni.
 */
export function scrollToPageAnchor(hash: string, options: { smooth?: boolean, lenis?: unknown } = {}): boolean {
  if (!import.meta.client || !hash.startsWith('#')) return false
  const el = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!el) return false
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const smooth = (options.smooth ?? true) && !reduced
  const lenis = options.lenis as LenisLike | undefined
  if (lenis?.scrollTo) {
    const margin = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0
    lenis.scrollTo(el, { offset: -margin, immediate: !smooth, force: true })
  }
  else {
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }
  history.replaceState(history.state, '', hash)
  return true
}
