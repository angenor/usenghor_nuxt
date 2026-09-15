/**
 * Règles de présentation publiques du Pôle Entrepreneuriat et Innovation (PEI).
 * Specs : specs/023-pei-public-home-activities (research R13),
 * specs/024-pei-public-alumni-resources-news (data-model § 2 et § 5),
 * specs/025-pei-see-status-page (data-model § 2).
 */

import type { ApplicationCallPublicWithDetails, CallScheduleRead } from '~/types/api'

import type {
  PeiColor,
  PeiLaureatePublic,
  PeiLaureateType,
  PeiPartnerFamily,
  PeiProgramPhase,
  PeiResourcePublic,
} from '~/types/api/entrepreneurship'

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

// ============================================================================
// Pages alumni et ressources (feature 024)
// ============================================================================

/** Paramètre d'adresse portant le sous-onglet de « Nos alumni ». */
export const PEI_LAUREATE_TAB_QUERY = 'type'

/** Sous-onglet lu dans l'adresse ; valeur absente ou inconnue → lauréats FSE. */
export function laureateTypeFromQuery(value: unknown): PeiLaureateType {
  return value === 'student_entrepreneur' ? 'student_entrepreneur' : 'fse_laureate'
}

/** Portraits mis en avant d'abord, puis ordre du backoffice (copie, tri stable). */
export function sortLaureatesFeaturedFirst(list: PeiLaureatePublic[]): PeiLaureatePublic[] {
  return [...list].sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.display_order - b.display_order)
}

export interface PeiResourceGroup {
  key: string
  label: string
  items: PeiResourcePublic[]
}

/**
 * Regroupe les ressources par catégorie : clé = catégorie française normalisée,
 * ordre de première apparition, intitulé localisé de la première ressource,
 * ressources sans catégorie regroupées en dernier.
 */
export function groupResourcesByCategory(
  resources: PeiResourcePublic[],
  label: (resource: PeiResourcePublic) => string,
  otherLabel: string,
): PeiResourceGroup[] {
  const groups = new Map<string, PeiResourceGroup>()
  const others: PeiResourcePublic[] = []
  for (const resource of resources) {
    const key = (resource.category ?? '').trim().toLocaleLowerCase('fr').replace(/\s+/g, ' ')
    if (!key) {
      others.push(resource)
      continue
    }
    const group = groups.get(key)
    if (group) group.items.push(resource)
    else groups.set(key, { key, label: label(resource) || resource.category!.trim(), items: [resource] })
  }
  const list = [...groups.values()]
  if (others.length) list.push({ key: '', label: otherLabel, items: others })
  return list
}

/** Identifiant d'une vidéo YouTube (même règle que la médiathèque de projets). */
export function youTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match?.[1] ?? null
}

/** Vrai si la valeur est une adresse http(s) exploitable. */
export function isHttpUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value.trim())
}

// ============================================================================
// Page SEE (feature 025)
// ============================================================================

/** État de l'appel SEE affiché par la page (data-model § 2.1). */
export type SeeCallState = 'open' | 'upcoming' | 'closed' | 'absent'

/**
 * État dérivé de l'appel désigné : absent (clé vide, 404, erreur), ouvert
 * (en cours et date limite non dépassée), à venir (statut saisi), sinon clos.
 */
export function seeCallState(call: ApplicationCallPublicWithDetails | null | undefined, now: Date = new Date()): SeeCallState {
  if (!call) return 'absent'
  if (call.status === 'ongoing' && (!call.deadline || new Date(call.deadline) > now)) return 'open'
  if (call.status === 'upcoming') return 'upcoming'
  return 'closed'
}

/** Cible des boutons « Postuler » : formulaire externe, formulaire du site ou e-mail du pôle. */
export type SeeApplyTarget =
  | { kind: 'external', href: string }
  | { kind: 'internal', to: string }
  | { kind: 'contact', href: string }

/** Priorité externe > interne en état ouvert ; sinon contact si e-mail ; sinon aucun bouton. */
export function seeApplyTarget(
  call: ApplicationCallPublicWithDetails | null | undefined,
  state: SeeCallState,
  email: string,
  subject: string,
): SeeApplyTarget | null {
  if (call && state === 'open') {
    if (isHttpUrl(call.external_form_url)) return { kind: 'external', href: call.external_form_url.trim() }
    if (call.use_internal_form) return { kind: 'internal', to: `/candidatures/postuler/${call.slug}` }
  }
  const address = email.trim()
  return address ? { kind: 'contact', href: `mailto:${address}?subject=${encodeURIComponent(subject)}` } : null
}

/** Année de l'appel : ouverture, sinon date limite, sinon aucune. */
export function seeCallYear(call: ApplicationCallPublicWithDetails | null | undefined): number | null {
  const source = call?.opening_date || call?.deadline
  // Lecture de l'année dans la chaîne ISO : aucun décalage de fuseau au 1ᵉʳ janvier.
  const year = Number.parseInt(source?.slice(0, 4) ?? '', 10)
  return Number.isNaN(year) ? null : year
}

export interface AgendaStep {
  id: string
  label: string
  description: string
  start: string | null
  end: string | null
  isDeadline: boolean
  /** Ligne ajoutée pour la date limite (aucune étape ne tombe ce jour-là). */
  synthetic: boolean
}

/** Jour calendaire AAAA-MM-JJ d'une date dans le fuseau donné. */
function calendarDay(value: string, timeZone: string): string | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

/**
 * Frise de l'agenda : étapes dans l'ordre du backoffice ; la première étape dont le
 * jour (fin, sinon début) est celui de la date limite est distinguée ; à défaut,
 * une ligne « date limite » est insérée à sa place chronologique.
 */
export function seeAgendaSteps(
  schedule: CallScheduleRead[],
  deadline: string | null,
  localize: (step: CallScheduleRead, field: 'step' | 'description') => string,
  deadlineLabel: string,
  timeZone = 'UTC',
): AgendaStep[] {
  const deadlineDay = deadline ? calendarDay(deadline, timeZone) : null
  let marked = false
  const steps: AgendaStep[] = [...schedule]
    .sort((a, b) => a.display_order - b.display_order)
    .map((step) => {
      const reference = step.end_date ?? step.start_date
      const isDeadline = !marked && !!deadlineDay && !!reference && calendarDay(reference, timeZone) === deadlineDay
      if (isDeadline) marked = true
      return {
        id: step.id,
        label: localize(step, 'step'),
        description: localize(step, 'description'),
        start: step.start_date,
        end: step.end_date,
        isDeadline,
        synthetic: false,
      }
    })
  if (!marked && deadline && deadlineDay) {
    const line: AgendaStep = { id: 'deadline', label: deadlineLabel, description: '', start: deadline, end: null, isDeadline: true, synthetic: true }
    const deadlineTime = new Date(deadline).getTime()
    const index = steps.findIndex(step => !!step.start && new Date(step.start).getTime() > deadlineTime)
    steps.splice(index === -1 ? steps.length : index, 0, line)
  }
  return steps
}

/** Valeurs non vides des emplacements éditoriaux `see.<prefix>.1..count`, dans l'ordre. */
export function seeSlots(text: (key: string) => string, prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => text(`see.${prefix}.${i + 1}`)).filter(Boolean)
}

/**
 * Classe Font Awesome d'un levier ; vide, sans `fa-` ou refusée par `exists`
 * (icône absente de la bibliothèque chargée) → icône neutre.
 */
export function seeLeverIcon(value: string | null | undefined, exists?: (icon: string) => boolean): string {
  const icon = (value ?? '').trim()
  return icon.startsWith('fa-') && (!exists || exists(icon)) ? icon : 'fa-solid fa-circle-check'
}
