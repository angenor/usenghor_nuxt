// ============================================================================
// MOCK DATA - APERÇU DE « NOS ALUMNI » DU PÔLE PEI (`/entrepreneuriat/alumni`)
// ============================================================================
// Validation visuelle de la page AVANT la saisie des vrais portraits (`usePeiPreview`).
// Les données réelles gardent toujours la priorité : l'aperçu ne remplit que le vide.
//   - cohorte FSE sans portrait publié : 3 portraits d'exemple ;
//   - aucun portrait d'étudiant-entrepreneur : 8 portraits d'exemple (alternance SEE 1 / SEE 2,
//     sur les cohortes SEE réelles si elles existent, sinon sur deux cohortes d'exemple) ;
//   - aucun portrait FSE mis en avant avec verbatim : portrait à la une d'exemple
//     (verbatim type du cahier des charges) ;
//   - focus / profil type / bilan d'une cohorte vides : textes du cahier des charges ;
//   - aucune cohorte FSE : trois cohortes d'exemple (FSE 1, 2, 3) ;
//   - clés éditoriales vides (chiffres, titre, encart mentor) : textes de la maquette.
// Noms et projets NEUTRES et visiblement fictifs, liens `#`, photos choisies à l'exécution
// par la page (`usePeiPreviewImages().image(n)`) : aucun identifiant de média en dur.
// Tables miroir : pei_cohorts, pei_laureates (16_entrepreneurship.sql)
// ============================================================================

import type { PeiCohortPublic, PeiCohortType, PeiLaureatePublic, PeiLaureateType } from '~/types/api/entrepreneurship'

/** Préfixe des identifiants d'exemple (jamais un UUID : impossible à confondre avec une vraie ligne). */
export const PEI_ALUMNI_PREVIEW_ID_PREFIX = 'apercu-'

/** Vrai si l'identifiant désigne une cohorte ou un portrait d'exemple. */
export function isPeiAlumniPreviewId(id: string): boolean {
  return id.startsWith(PEI_ALUMNI_PREVIEW_ID_PREFIX)
}

interface Translated {
  fr: string
  en: string
  ar: string
}

/** Texte d'exemple dans la langue active (repli français). */
export function previewText(value: Translated, locale: string): string {
  return (locale === 'en' || locale === 'ar' ? value[locale] : '') || value.fr
}

/** Nature du second paragraphe d'une cohorte (maquette : « Profil type » ou « Bilan »). */
export type PeiAlumniCohortNoteKind = 'profile' | 'assessment'

export interface PeiAlumniPreviewCohortText {
  /** Numéro de la promotion (FSE n). */
  number: number
  label: Translated
  year: number
  focus: Translated
  note: { kind: PeiAlumniCohortNoteKind, text: Translated }
}

/** Textes du cahier des charges, par promotion FSE. */
const FSE_COHORT_TEXTS: PeiAlumniPreviewCohortText[] = [
  {
    number: 1,
    label: { fr: 'FSE 1 · Lancement', en: 'FSE 1 · Launch', ar: 'FSE 1 · الانطلاق' },
    year: 2023,
    focus: {
      fr: 'Projets en phase d’amorçage ayant validé leur preuve de concept',
      en: 'Early-stage projects that have validated their proof of concept',
      ar: 'مشاريع في مرحلة الانطلاق أثبتت صحة مفهومها',
    },
    note: {
      kind: 'profile',
      text: {
        fr: 'Étudiants issus des départements Santé, Environnement ou Management',
        en: 'Students from the Health, Environment or Management departments',
        ar: 'طلاب من أقسام الصحة أو البيئة أو الإدارة',
      },
    },
  },
  {
    number: 2,
    label: { fr: 'FSE 2 · Consolidation', en: 'FSE 2 · Consolidation', ar: 'FSE 2 · التعزيز' },
    year: 2024,
    focus: {
      fr: 'Projets à fort impact social et technologique sur le continent',
      en: 'Projects with a strong social and technological impact across the continent',
      ar: 'مشاريع ذات أثر اجتماعي وتكنولوجي قوي في القارة',
    },
    note: {
      kind: 'assessment',
      text: {
        fr: 'Sur les 15 projets financés au total, cette cohorte a renforcé la dimension intrapreneuriale',
        en: 'Of the 15 projects funded in total, this cohort strengthened the intrapreneurial dimension',
        ar: 'من بين 15 مشروعاً مُموَّلاً في المجموع، عزّزت هذه الدفعة البعد الريادي الداخلي',
      },
    },
  },
  {
    number: 3,
    label: { fr: 'FSE 3 · Promotion 2025', en: 'FSE 3 · Class of 2025', ar: 'FSE 3 · دفعة 2025' },
    year: 2025,
    focus: {
      fr: 'Innovation et passage à l’échelle (scale-up)',
      en: 'Innovation and scaling up',
      ar: 'الابتكار والتوسّع (scale-up)',
    },
    note: {
      kind: 'profile',
      text: {
        fr: 'Projets incubés via Senghor’Innov',
        en: 'Projects incubated through Senghor’Innov',
        ar: 'مشاريع محتضنة عبر Senghor’Innov',
      },
    },
  },
]

/** Parcours SEE d'exemple (maquette : « SEE 1 · Idéation », « SEE 2 · Accélération »). */
const SEE_TRACKS: { label: Translated, year: number }[] = [
  { label: { fr: 'SEE 1 · Idéation', en: 'SEE 1 · Ideation', ar: 'SEE 1 · توليد الأفكار' }, year: 2025 },
  { label: { fr: 'SEE 2 · Accélération', en: 'SEE 2 · Acceleration', ar: 'SEE 2 · التسريع' }, year: 2025 },
]

/** Thèmes des projets et départements d'exemple (plausibles, sans personne réelle). */
const THEMES: { project: string, department: Translated, master: Translated }[] = [
  {
    project: 'santé',
    department: { fr: 'Département Santé', en: 'Health Department', ar: 'قسم الصحة' },
    master: { fr: 'Master Santé', en: 'Master’s in Health', ar: 'ماستر الصحة' },
  },
  {
    project: 'environnement',
    department: { fr: 'Département Environnement', en: 'Environment Department', ar: 'قسم البيئة' },
    master: { fr: 'Master Environnement', en: 'Master’s in Environment', ar: 'ماستر البيئة' },
  },
  {
    project: 'management',
    department: { fr: 'Département Management', en: 'Management Department', ar: 'قسم الإدارة' },
    master: { fr: 'Master Management', en: 'Master’s in Management', ar: 'ماستر الإدارة' },
  },
  {
    project: 'culture',
    department: { fr: 'Département Culture', en: 'Culture Department', ar: 'قسم الثقافة' },
    master: { fr: 'Master Culture', en: 'Master’s in Culture', ar: 'ماستر الثقافة' },
  },
]

const FEATURED_QUOTE: Translated = {
  fr: 'Grâce au FSE 1, j’ai pu passer de la théorie à la pratique. La subvention de 5 000 € a été le catalyseur pour produire mon premier prototype et tester mon marché localement avant la fin de mon Master.',
  en: 'Thanks to FSE 1, I was able to move from theory to practice. The €5,000 grant was the catalyst that let me build my first prototype and test my market locally before finishing my Master’s.',
  ar: 'بفضل FSE 1، تمكّنت من الانتقال من النظرية إلى التطبيق. كانت المنحة البالغة 5000 يورو المحفّز لإنتاج نموذجي الأولي واختبار سوقي محلياً قبل نهاية الماستر.',
}

const SAMPLE_NAME = 'Nom Prénom'

export const peiAlumniPreview = {
  /** Portraits d'exemple par cohorte FSE sans portrait publié. */
  fsePortraitsPerCohort: 3,
  /** Portraits d'exemple d'étudiants-entrepreneurs. */
  seePortraitCount: 8,
  /** Titre du hero (clé `entrepreneurship.alumni.hero.title` vide). */
  heroTitle: 'Ils ont osé.\nIls entreprennent.',
  heroSubtitle: 'Portraits et témoignages des lauréats du Fonds de Soutien à l’Entrepreneuriat et des étudiants-entrepreneurs de l’Université Senghor.',
  /** Chiffres (clés `entrepreneurship.alumni.stats.{1,2,3}` vides), valeurs de la maquette. */
  stats: [
    { value: '15', label: 'projets financés depuis 2023' },
    { value: '5 000 €', label: 'de subvention d’amorçage maximum par projet' },
    { value: 'Un réseau de mentors', label: 'Nos alumni entrepreneurs accompagnent désormais les nouvelles cohortes SEE 1 et SEE 2.' },
  ],
  /** Encart « Devenir mentor » (clés `entrepreneurship.see.mentor.*` vides). */
  mentor: {
    title: 'Vous êtes alumni entrepreneur ?',
    description: 'Rejoignez le réseau des mentors et accompagnez les nouvelles cohortes SEE 1 et SEE 2.',
    button: 'Devenir mentor',
  },
}

/**
 * Textes du cahier des charges d'une cohorte FSE : code `fse-n`, sinon numéro lu dans le
 * libellé (« FSE 2 · … »), sinon rang chronologique.
 */
export function peiAlumniPreviewCohortText(
  cohort: Pick<PeiCohortPublic, 'code' | 'label'>,
  rank: number,
): PeiAlumniPreviewCohortText | null {
  const number = Number(cohort.code.match(/^fse-(\d+)$/i)?.[1] ?? cohort.label.match(/\bFSE\s*(\d+)/i)?.[1] ?? rank + 1)
  return FSE_COHORT_TEXTS.find(text => text.number === number) ?? null
}

function sampleCohort(type: PeiCohortType, key: string, label: Translated, year: number, order: number, focus: Translated | null): PeiCohortPublic {
  return {
    id: `${PEI_ALUMNI_PREVIEW_ID_PREFIX}cohorte-${key}`,
    code: `${PEI_ALUMNI_PREVIEW_ID_PREFIX}${key}`,
    label: label.fr,
    label_en: label.en,
    label_ar: label.ar,
    year,
    type,
    focus: focus?.fr ?? null,
    focus_en: focus?.en ?? null,
    focus_ar: focus?.ar ?? null,
    summary_html: null,
    summary_en_html: null,
    summary_ar_html: null,
    display_order: order,
  }
}

/** Cohortes FSE d'exemple (aucune cohorte FSE active). */
export function buildPreviewFseCohorts(): PeiCohortPublic[] {
  return FSE_COHORT_TEXTS.map((text, index) => sampleCohort('fse', `fse-${text.number}`, text.label, text.year, index, text.focus))
}

/** Cohortes SEE d'exemple (aucune cohorte SEE active). */
export function buildPreviewSeeCohorts(): PeiCohortPublic[] {
  return SEE_TRACKS.map((track, index) => sampleCohort('see', `see-${index + 1}`, track.label, track.year, index, null))
}

interface SampleOptions {
  type: PeiLaureateType
  /** Index du premier portrait (varie les thèmes et les identifiants). */
  offset: number
  /** Photo de l'emplacement n (réserve d'images de l'aperçu). */
  photo: (index: number) => string | null
}

function sampleLaureate(cohort: PeiCohortPublic, index: number, options: SampleOptions): PeiLaureatePublic {
  const theme = THEMES[index % THEMES.length]!
  const department = options.type === 'student_entrepreneur' ? theme.master : theme.department
  return {
    id: `${PEI_ALUMNI_PREVIEW_ID_PREFIX}portrait-${options.type}-${index}`,
    type: options.type,
    full_name: SAMPLE_NAME,
    project_name: `Projet d’exemple — ${theme.project}`,
    department_label: department.fr,
    department_label_en: department.en,
    department_label_ar: department.ar,
    quote: null,
    quote_en: null,
    quote_ar: null,
    photo_url: options.photo(index),
    website_url: options.type === 'fse_laureate' ? '#' : null,
    linkedin_url: options.type === 'fse_laureate' ? '#' : null,
    instagram_url: null,
    facebook_url: null,
    video_url: null,
    is_featured: false,
    cohort_label: cohort.label,
    cohort_label_en: cohort.label_en,
    cohort_label_ar: cohort.label_ar,
    display_order: index,
  }
}

/** `count` portraits d'exemple d'une cohorte (maquette : 3 par promotion FSE). */
export function buildPreviewLaureates(cohort: PeiCohortPublic, count: number, options: SampleOptions): PeiLaureatePublic[] {
  return Array.from({ length: count }, (_, k) => sampleLaureate(cohort, options.offset + k, options))
}

/**
 * Portraits d'exemple d'étudiants-entrepreneurs répartis en alternance sur les cohortes
 * données (SEE 1, SEE 2, SEE 1…) : groupes prêts à fusionner avec les groupes réels.
 */
export function buildPreviewSeeGroups(
  cohorts: PeiCohortPublic[],
  photo: (index: number) => string | null,
  count = peiAlumniPreview.seePortraitCount,
): { cohort: PeiCohortPublic, laureates: PeiLaureatePublic[] }[] {
  const tracks = cohorts.slice(0, 2)
  if (!tracks.length) return []
  const groups = tracks.map(cohort => ({ cohort, laureates: [] as PeiLaureatePublic[] }))
  for (let index = 0; index < count; index++) {
    const group = groups[index % groups.length]!
    group.laureates.push(sampleLaureate(group.cohort, index, { type: 'student_entrepreneur', offset: 0, photo }))
  }
  return groups
}

/** Portrait à la une d'exemple : verbatim type du cahier des charges, liens `#`. */
export function buildPreviewFeatured(cohort: PeiCohortPublic, photoUrl: string | null): PeiLaureatePublic {
  return {
    ...sampleLaureate(cohort, 0, { type: 'fse_laureate', offset: 0, photo: () => photoUrl }),
    id: `${PEI_ALUMNI_PREVIEW_ID_PREFIX}portrait-a-la-une`,
    quote: FEATURED_QUOTE.fr,
    quote_en: FEATURED_QUOTE.en,
    quote_ar: FEATURED_QUOTE.ar,
    video_url: '#',
    is_featured: true,
  }
}
