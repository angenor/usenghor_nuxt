<script setup lang="ts">
/**
 * « Entreprendre et étudier à Senghor » : guide du Statut Étudiant-Entrepreneur (SEE),
 * panneau agenda de l'appel désigné (ouvert / à venir / clos / absent), FAQ `see-*`, CTA.
 * Spec : specs/025-pei-see-status-page (US1–US5).
 */
import type { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core'
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { FaqLang } from '~/utils/faq-jsonld'

const { t, locale } = useI18n()
const { localized } = useLocalizedField()

const page = await usePeiPage({ heroPrefix: 'see', navKey: 'see' })
const { text } = page

// Appel désigné : 404 (introuvable ou non publié) et erreurs → état « absent », page 200.
const { data: call } = await useAsyncData('pei-see-call', () => {
  const slug = text('see.call_slug')
  return slug ? usePublicCallsApi().getCallBySlug(slug).catch(() => null) : Promise.resolve(null)
})

const { data: faqTree } = await useAsyncData('pei-see-faq', () =>
  usePublicFaqApi().getTree({ categoryPrefix: 'see-' }).catch(() => ({ categories: [] })),
)

// --- Appel -----------------------------------------------------------------
const state = computed(() => seeCallState(call.value))
const year = computed(() => (state.value === 'absent' ? null : seeCallYear(call.value)))
const email = computed(() => text('contact.email'))
const target = computed(() => seeApplyTarget(call.value, state.value, email.value, t('pei.see.contactSubject')))
const isFormTarget = computed(() => target.value?.kind === 'internal' || target.value?.kind === 'external')

const heroBadge = computed(() => {
  const badge = page.hero.value.badge
  if (!badge) return undefined
  return year.value ? t('pei.see.heroBadgeYear', { badge, year: year.value }) : badge
})

const steps = computed(() =>
  call.value
    ? seeAgendaSteps(call.value.schedule ?? [], call.value.deadline, (step, field) => localized(step, field), t('pei.see.deadline'))
    : [],
)

// --- Guide éditorial -------------------------------------------------------
const intro = computed(() => ({
  eyebrow: text('see.intro.eyebrow'),
  title: text('see.intro.title'),
  lead: text('see.intro.lead'),
  body: text('see.intro.body'),
}))
const showIntroText = computed(() => !!(intro.value.title || intro.value.lead || intro.value.body))
const what = computed(() => ({ label: text('see.what.label'), text: text('see.what.text') }))

const tracks = computed(() =>
  [
    { n: 1, card: 'border-brand-blue-200 dark:border-brand-blue-800', badge: 'bg-brand-blue-500 text-white' },
    { n: 2, card: 'border-brand-red-200 dark:border-brand-red-800', badge: 'bg-brand-red-500 text-white' },
  ]
    .map(track => ({
      ...track,
      label: text(`see.tracks.${track.n}.badge`),
      title: text(`see.tracks.${track.n}.title`),
      text: text(`see.tracks.${track.n}.text`),
    }))
    .filter(track => track.title),
)
const showIntro = computed(() => showIntroText.value || !!(what.value.label || what.value.text) || tracks.value.length > 0)

// Icône saisie dans « Valeurs » : style (solid / regular / brands) + nom présent dans la bibliothèque.
const FA_STYLES: Record<string, IconPrefix> = { 'fa-solid': 'fas', 'fa-regular': 'far', 'fa-brands': 'fab', 'fas': 'fas', 'far': 'far', 'fab': 'fab' }
function iconExists(icon: string): boolean {
  const tokens = icon.split(/\s+/)
  const prefix = tokens.map(token => FA_STYLES[token]).find(Boolean) ?? 'fas'
  const name = tokens.find(token => token.startsWith('fa-') && !FA_STYLES[token])?.slice(3)
  return !!name && !!findIconDefinition({ prefix, iconName: name as IconName })
}

const levers = computed(() =>
  [1, 2, 3, 4, 5, 6]
    .map(n => ({
      n,
      icon: seeLeverIcon(text(`see.levers.${n}.icon`), iconExists),
      title: text(`see.levers.${n}.title`),
      text: text(`see.levers.${n}.text`),
    }))
    .filter(lever => lever.title),
)

// Conditions et pièces : l'appel d'abord, les textes éditoriaux en secours, bloc par bloc (research R8).
interface ListItem { label: string, description: string, note: string }

const conditions = computed<ListItem[]>(() => {
  const criteria = [...(call.value?.eligibility_criteria ?? [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map(c => ({ label: localized(c, 'criterion'), description: '', note: c.is_mandatory ? '' : t('pei.see.wished') }))
    .filter(item => item.label)
  return criteria.length ? criteria : seeSlots(text, 'conditions', 3).map(label => ({ label, description: '', note: '' }))
})

const documents = computed<ListItem[]>(() => {
  const required = [...(call.value?.required_documents ?? [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map(d => ({
      label: localized(d, 'document_name'),
      description: localized(d, 'description'),
      note: d.is_mandatory ? '' : t('pei.see.optional'),
    }))
    .filter(item => item.label)
  return required.length ? required : seeSlots(text, 'documents', 4).map(label => ({ label, description: '', note: '' }))
})

const jury = computed(() => seeSlots(text, 'jury', 4))

// --- FAQ -------------------------------------------------------------------
const lang = computed<FaqLang>(() => (locale.value === 'en' || locale.value === 'ar' ? locale.value : 'fr'))
const faqCategories = computed(() => (faqTree.value?.categories ?? []).filter(c => c.entries.length > 0))
const faqJsonLd = computed(() => buildFaqPageJsonLd(faqCategories.value, lang.value))

const pepite = computed(() => ({ intro: text('see.pepite.intro'), label: text('see.pepite.label'), url: text('see.pepite.url') }))
const showPepite = computed(() => isHttpUrl(pepite.value.url) && !!pepite.value.label)

// --- CTA final ---------------------------------------------------------------
const ctaTitle = computed(() => text('see.cta.title'))
const ctaButtonLabel = computed(() => (isFormTarget.value ? text('see.cta.button') || text('see.agenda.button') : t('pei.see.contactButton')))

// SEO en dernier (gotcha TDZ unhead)
page.applySeo({ type: 'WebPage' })
useHead(() => ({
  script: faqJsonLd.value
    ? [{ key: 'jsonld-pei-faq', type: 'application/ld+json', innerHTML: JSON.stringify(faqJsonLd.value) }]
    : [],
}))
</script>

<template>
  <div>
    <PageHero
      v-bind="page.hero.value"
      :badge="heroBadge"
      badge-icon="fa-solid fa-rocket"
      :breadcrumb="page.breadcrumb.value"
    />

    <EntrepreneurshipSubNav />

    <!-- Intro, « Le SEE, c'est quoi ? », parcours SEE 1 / SEE 2 -->
    <section v-if="showIntro" class="py-16 lg:py-24 bg-white dark:bg-gray-950 bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start">
        <div v-if="showIntroText" class="lg:col-span-7">
          <p v-if="intro.eyebrow" class="text-sm font-semibold uppercase tracking-wider text-brand-blue-600 dark:text-brand-blue-400">
            {{ intro.eyebrow }}
          </p>
          <template v-if="intro.title">
            <h2 class="mt-4 text-3xl sm:text-4xl font-bold leading-tight text-gray-900 dark:text-white">
              {{ intro.title }}
            </h2>
            <div class="mt-4 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" aria-hidden="true" />
          </template>
          <p v-if="intro.lead" class="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            {{ intro.lead }}
          </p>
          <p v-if="intro.body" class="mt-4 leading-relaxed text-gray-600 dark:text-gray-300">
            {{ intro.body }}
          </p>
        </div>

        <div :class="['space-y-4', showIntroText ? 'lg:col-span-5' : 'lg:col-span-12']">
          <div
            v-if="what.label || what.text"
            class="rounded-2xl bg-gradient-to-br from-brand-blue-900 to-brand-blue-800 p-6 text-white"
          >
            <p v-if="what.label" class="text-xs font-semibold uppercase tracking-widest text-brand-blue-300">
              {{ what.label }}
            </p>
            <p v-if="what.text" class="mt-3 leading-relaxed text-white/85">
              {{ what.text }}
            </p>
          </div>

          <div
            v-for="track in tracks"
            :key="track.n"
            :class="['flex items-start gap-4 rounded-xl border-2 bg-white dark:bg-gray-800 p-5', track.card]"
          >
            <span
              v-if="track.label"
              :class="['shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', track.badge]"
            >
              {{ track.label }}
            </span>
            <div>
              <p class="font-bold text-gray-900 dark:text-white">
                {{ track.title }}
              </p>
              <p v-if="track.text" class="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {{ track.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pourquoi postuler ? -->
    <section v-if="levers.length" class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p v-if="text('see.levers.eyebrow')" class="text-sm font-semibold uppercase tracking-wider text-brand-blue-600 dark:text-brand-blue-400">
          {{ text('see.levers.eyebrow') }}
        </p>
        <template v-if="text('see.levers.title')">
          <h2 class="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {{ text('see.levers.title') }}
          </h2>
          <div class="mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" aria-hidden="true" />
        </template>

        <ul class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="lever in levers"
            :key="lever.n"
            class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
          >
            <div class="flex items-center gap-4">
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue-100 dark:bg-brand-blue-900/40 text-brand-blue-600 dark:text-brand-blue-300">
                <font-awesome-icon :icon="lever.icon" class="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 class="text-[17px] font-bold text-gray-900 dark:text-white">
                {{ lever.title }}
              </h3>
            </div>
            <p v-if="lever.text" class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {{ lever.text }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Suis-je le bon candidat ? + agenda -->
    <section id="candidater" class="scroll-mt-40 py-16 lg:py-24 bg-white dark:bg-gray-950 bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div class="lg:col-span-7">
          <p v-if="text('see.apply.eyebrow')" class="text-sm font-semibold uppercase tracking-wider text-brand-blue-600 dark:text-brand-blue-400">
            {{ text('see.apply.eyebrow') }}
          </p>
          <template v-if="text('see.apply.title')">
            <h2 class="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {{ text('see.apply.title') }}
            </h2>
            <div class="mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" aria-hidden="true" />
          </template>
          <p v-if="text('see.apply.intro')" class="mt-6 leading-relaxed text-gray-600 dark:text-gray-300">
            {{ text('see.apply.intro') }}
          </p>

          <div v-if="conditions.length || jury.length" class="mt-8 grid gap-5 sm:grid-cols-2">
            <div v-if="conditions.length" class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 v-if="text('see.conditions.title')" class="font-bold text-gray-900 dark:text-white">
                {{ text('see.conditions.title') }}
              </h3>
              <ul class="mt-4 space-y-3">
                <li v-for="(item, i) in conditions" :key="i" class="flex gap-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  <font-awesome-icon icon="fa-solid fa-check" class="mt-1 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                  <span>
                    {{ item.label }}
                    <span v-if="item.note" class="text-xs text-gray-500 dark:text-gray-400">({{ item.note }})</span>
                  </span>
                </li>
              </ul>
            </div>

            <div v-if="jury.length" class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 v-if="text('see.jury.title')" class="font-bold text-gray-900 dark:text-white">
                {{ text('see.jury.title') }}
              </h3>
              <ol class="mt-4 space-y-3">
                <li v-for="(criterion, i) in jury" :key="i" class="flex gap-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/40 text-xs font-semibold text-brand-blue-700 dark:text-brand-blue-300" aria-hidden="true">
                    {{ i + 1 }}
                  </span>
                  <span>{{ criterion }}</span>
                </li>
              </ol>
            </div>
          </div>

          <div
            v-if="documents.length"
            class="mt-5 rounded-2xl border border-brand-blue-100 dark:border-brand-blue-900/50 bg-brand-blue-50 dark:bg-brand-blue-900/20 p-6"
          >
            <h3 v-if="text('see.documents.title')" class="font-bold text-gray-900 dark:text-white">
              {{ text('see.documents.title') }}
            </h3>
            <ul class="mt-4 grid gap-3 sm:grid-cols-2">
              <li v-for="(item, i) in documents" :key="i" class="flex gap-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                <font-awesome-icon icon="fa-regular fa-file-lines" class="mt-1 h-4 w-4 shrink-0 text-brand-blue-600 dark:text-brand-blue-300" aria-hidden="true" />
                <span>
                  {{ item.label }}
                  <span v-if="item.note" class="text-xs text-gray-500 dark:text-gray-400">({{ item.note }})</span>
                  <span v-if="item.description" class="mt-0.5 block text-gray-500 dark:text-gray-400">{{ item.description }}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div class="lg:col-span-5 lg:sticky lg:top-40 lg:self-start">
          <EntrepreneurshipSeeAgenda
            :state="state"
            :year="year"
            :steps="steps"
            :opening-date="call?.opening_date ?? null"
            :target="target"
            :button-label="text('see.agenda.button') || text('see.cta.button')"
            :cc-note="text('see.agenda.cc_note')"
            :closed-title="text('see.closed.title')"
            :closed-text="text('see.closed.text')"
          />
        </div>
      </div>
    </section>

    <!-- FAQ + PÉPITE France -->
    <section
      v-if="faqCategories.length || showPepite"
      id="faq"
      :class="['scroll-mt-40', faqCategories.length ? 'py-16 lg:py-24 bg-gray-50 dark:bg-gray-900' : 'pb-4 bg-white dark:bg-gray-950']"
    >
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <template v-if="faqCategories.length">
          <div class="text-center">
            <p v-if="text('see.faq.eyebrow')" class="text-sm font-semibold uppercase tracking-wider text-brand-blue-600 dark:text-brand-blue-400">
              {{ text('see.faq.eyebrow') }}
            </p>
            <template v-if="text('see.faq.title')">
              <h2 class="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {{ text('see.faq.title') }}
              </h2>
              <div class="mx-auto mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" aria-hidden="true" />
            </template>
          </div>
          <!-- Marge d'ancre des questions : en-tête + sous-navigation collants (scrollToPageAnchor la lit) -->
          <FaqAccordion
            class="mt-10 [&_[id^='see-']]:scroll-mt-40"
            :tree="{ categories: faqCategories }"
            :searchable="false"
            group-titles="always"
            heading-level="h3"
            multiple
          />
        </template>

        <p
          v-if="showPepite"
          :class="['flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm text-gray-500 dark:text-gray-400', faqCategories.length ? 'mt-10' : '']"
        >
          <span v-if="pepite.intro">{{ pepite.intro }}</span>
          <a
            :href="pepite.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 font-semibold text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
          >
            <font-awesome-icon icon="fa-solid fa-link" class="h-4 w-4" aria-hidden="true" />
            {{ pepite.label }}
            <span class="sr-only">{{ t('pei.common.openInNewTab') }}</span>
          </a>
        </p>
      </div>
    </section>

    <!-- CTA final -->
    <section v-if="ctaTitle" class="py-16 lg:py-24 bg-white dark:bg-gray-950">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <EntrepreneurshipCtaBanner
          :title="ctaTitle"
          :description="text('see.cta.text')"
          :button-label="ctaButtonLabel"
          :to="target?.kind === 'internal' ? target.to : undefined"
          :href="target && target.kind !== 'internal' ? target.href : undefined"
          :external="target?.kind === 'external'"
          :email="email || null"
        >
          <template v-if="state === 'open' && isFormTarget && text('see.agenda.cc_note')" #note>
            {{ text('see.agenda.cc_note') }}
          </template>
        </EntrepreneurshipCtaBanner>
      </div>
    </section>
  </div>
</template>
