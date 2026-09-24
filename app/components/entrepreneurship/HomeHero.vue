<script setup lang="ts">
/**
 * Hero plein écran de l'accueil du pôle PEI : slider photo sous un voile bleu nuit,
 * slogan géant empilé dont un mot est « allumé » à la fois (INNOVER → AGIR → TRANSFORMER, en boucle).
 *
 * - Voile en dégradé concentré derrière le texte (à gauche — à droite en arabe — et en bas) :
 *   la photo reste nettement visible du côté opposé ; fondu enchaîné au changement de mot et
 *   léger zoom lent (Ken Burns) sur l'image active, sans mouvement si `prefers-reduced-motion`.
 *
 * - Dès 2 mots, l'accent passe d'un mot au suivant, quel que soit le nombre d'images.
 *   Images : autant d'images que de mots → l'image n suit le mot n ; au moins 2 images
 *   en nombre différent → elles avancent au même rythme (modulo) ; 0 ou 1 image → image fixe.
 *   Sans slogan exploitable (moins de 2 mots) mais avec 2 images ou plus : slider d'images seul.
 * - Défilement automatique (barre de progression CSS) continu au survol ; en pause avec le
 *   bouton pause / lecture (WCAG 2.2.2), au focus clavier (`:focus-visible`) et onglet masqué.
 * - `prefers-reduced-motion` : aucune avance automatique et tous les mots allumés
 *   (le slogan reste lisible d'un coup d'œil) ; un clic sur une commande allume le mot choisi.
 * - Commandes : un bouton par étape (numéro + mot), annonce polie au changement manuel.
 */
interface BreadcrumbItem {
  label: string
  to?: string
}

interface HeroAction {
  label: string
  to: string
  variant?: 'red' | 'ghost'
  icon?: string
}

const props = withDefaults(defineProps<{
  /** Titre de la page (h1 pour les lecteurs d'écran, base des textes alternatifs). */
  title: string
  /** Mots du slogan (« INNOVER. », « AGIR. », …). */
  words?: string[]
  /** Images du slider (déjà résolues) ; vide → `fallbackImage`. */
  images?: string[]
  fallbackImage?: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
  actions?: HeroAction[]
}>(), {
  words: () => [],
  images: () => [],
  fallbackImage: '/images/bg/backgroud_senghor2.jpg',
  subtitle: undefined,
  breadcrumb: () => [],
  actions: () => [],
})

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { previewPath } = usePeiPreview()
const { $lenis } = useNuxtApp()

// ---------------------------------------------------------------------------
// Diapositives et étapes
// ---------------------------------------------------------------------------
const failed = ref<string[]>([])
const slides = computed(() => {
  const list = [...new Set(props.images.filter(src => !!src && !failed.value.includes(src)))]
  return list.length ? list : [props.fallbackImage]
})
const slideCount = computed(() => slides.value.length)
/** Slogan animé : au moins deux mots, indépendamment des images. */
const wordMode = computed(() => props.words.length >= 2)
/** Nombre d'étapes du défilement : un par mot, sinon un par image (slider seul), sinon aucune. */
const total = computed(() => (wordMode.value ? props.words.length : slideCount.value >= 2 ? slideCount.value : 0))
const hasSteps = computed(() => total.value >= 2)
/** Mots et images appariés un à un (l'image n suit le mot n). */
const linked = computed(() => wordMode.value && slideCount.value === props.words.length)

function onImageError(src: string) {
  if (src !== props.fallbackImage && !failed.value.includes(src)) failed.value.push(src)
}

/** « INNOVER. » → « Innover » (libellé des commandes). */
function wordLabel(word: string): string {
  const bare = word.replace(/[.!?…\s]+$/u, '').trim().toLocaleLowerCase(locale.value)
  return bare.charAt(0).toLocaleUpperCase(locale.value) + bare.slice(1)
}

const pad = (n: number) => String(n).padStart(2, '0')

function stepLabel(index: number): string {
  return wordMode.value ? wordLabel(props.words[index] ?? '') : ''
}

function imageAlt(index: number): string {
  const label = linked.value ? stepLabel(index) : ''
  return label ? `${props.title} — ${label}` : props.title
}

// ---------------------------------------------------------------------------
// Défilement automatique (piloté par la fin de l'animation de la barre active)
// ---------------------------------------------------------------------------
const SLIDE_DURATION = 6000
const active = ref(0)
/** Compteur de changements : fait avancer les images au même rythme que les mots (modulo). */
const tick = ref(0)
const mounted = ref(false)
const reducedMotion = ref(false)
/** Une commande a été actionnée (mouvement réduit : un seul mot allumé ensuite). */
const touched = ref(false)
/** Pause demandée par le bouton pause / lecture. */
const userPaused = ref(false)
/** Focus clavier dans le hero (un clic souris ne met pas en pause). */
const focused = ref(false)
const pageHidden = ref(false)
const liveMessage = ref('')

const autoplay = computed(() => mounted.value && hasSteps.value && !reducedMotion.value)
/** Zoom lent de l'image active : après hydratation (le zoom part de l'échelle 1), jamais en mouvement réduit. */
const kenBurns = computed(() => mounted.value && !reducedMotion.value)
const paused = computed(() => userPaused.value || focused.value || pageHidden.value)

/** Image affichée : appariée au mot, sinon rotation au rythme des étapes, sinon fixe. */
const activeImage = computed(() => {
  if (slideCount.value < 2) return 0
  if (linked.value || !wordMode.value) return active.value % slideCount.value
  return tick.value % slideCount.value
})

function goTo(index: number, manual = false) {
  if (!total.value) return
  const next = (index + total.value) % total.value
  if (next !== active.value) tick.value++
  active.value = next
  if (manual) {
    touched.value = true
    const label = stepLabel(active.value)
    liveMessage.value = label
      ? t('pei.home.hero.slideAnnounce', { n: active.value + 1, total: total.value, label })
      : t('hero.slider.current', { n: active.value + 1, total: total.value })
  }
}

function onProgressEnd(index: number) {
  if (index === active.value) goTo(active.value + 1)
}

/** Mouvement réduit sans choix manuel : tous les mots allumés (aussi en CSS, avant hydratation). */
const allLit = computed(() => !wordMode.value || (reducedMotion.value && !touched.value))

function isLit(index: number): boolean {
  return allLit.value || index === active.value
}

/** Commande courante (aucune tant que tout le slogan est allumé en mouvement réduit). */
function isCurrentStep(index: number): boolean {
  return index === active.value && !(wordMode.value && allLit.value)
}

function wordClass(index: number): string {
  const last = index === props.words.length - 1
  if (isLit(index)) return last ? 'text-brand-red-300' : 'text-white'
  // Mot atténué ; `prefers-reduced-motion` le rallume tant qu'aucune commande n'a été actionnée
  if (touched.value) return 'text-[#7584c2]'
  return last ? 'text-[#7584c2] motion-reduce:text-brand-red-300' : 'text-[#7584c2] motion-reduce:text-white'
}

function onFocusIn(event: FocusEvent) {
  const target = event.target as HTMLElement | null
  focused.value = !!target?.matches?.(':focus-visible')
}

function toggleUserPause() {
  userPaused.value = !userPaused.value
}

function onFocusOut(event: FocusEvent) {
  const root = event.currentTarget as HTMLElement | null
  if (root && event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return
  focused.value = false
}

function onVisibilityChange() {
  pageHidden.value = document.hidden
}

watch(total, (count) => {
  if (active.value >= count) active.value = 0
})

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  pageHidden.value = document.hidden
  document.addEventListener('visibilitychange', onVisibilityChange)
  mounted.value = true
})

onUnmounted(() => {
  if (import.meta.client) document.removeEventListener('visibilitychange', onVisibilityChange)
})

function onAnchorClick(event: MouseEvent, hash: string) {
  if (scrollToPageAnchor(hash, { lenis: $lenis })) event.preventDefault()
}

function actionClass(action: HeroAction): string {
  return action.variant === 'ghost'
    ? 'border border-white/40 text-white hover:bg-white/10'
    : 'bg-brand-red-600 text-white hover:bg-brand-red-700'
}
</script>

<template>
  <section
    class="pei-home-hero relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-brand-blue-900 text-white lg:min-h-[max(100svh,760px)]"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <!-- Images (fondu enchaîné calé sur le changement de mot + zoom lent de l'image active) -->
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <img
        v-for="(src, index) in slides"
        :key="src"
        :src="src"
        :alt="imageAlt(index)"
        :aria-hidden="index === activeImage ? undefined : 'true'"
        class="pei-hero-image absolute inset-0 h-full w-full object-cover"
        :class="[
          index === activeImage ? 'opacity-100' : 'opacity-0',
          kenBurns && index === activeImage ? 'scale-[1.08]' : 'scale-100',
        ]"
        :fetchpriority="index === 0 ? 'high' : 'auto'"
        :loading="index === 0 ? 'eager' : 'lazy'"
        decoding="async"
        @error="onImageError(src)"
      >
      <!--
        Voile (`.pei-hero-veil`) : uniforme en mobile (le texte occupe toute la largeur) ; en grand
        écran, dégradé concentré derrière le slogan (côté de début de ligne), photo nettement
        visible de l'autre côté. Opacités mesurées sur les photos les plus claires de la réserve.
      -->
      <div class="pei-hero-veil absolute inset-0" aria-hidden="true" />
      <div class="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-brand-blue-900/[.92] via-brand-blue-900/40 to-transparent" aria-hidden="true" />
      <div class="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-brand-blue-900/70 to-transparent" aria-hidden="true" />
    </div>

    <div class="mx-auto flex w-full max-w-7xl flex-grow flex-col px-4 pb-10 pt-28 sm:px-6 lg:px-8 lg:pb-14 lg:pt-32">
      <!-- Fil d'Ariane + slogan -->
      <div class="flex flex-grow flex-col justify-center gap-7 py-8">
        <nav v-if="breadcrumb.length" :aria-label="t('pei.home.hero.breadcrumbLabel')">
          <ol class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-brand-blue-200">
            <li v-for="(item, index) in breadcrumb" :key="index" class="flex items-center gap-2.5">
              <NuxtLink
                v-if="item.to"
                :to="localePath(item.to)"
                class="hover:text-white transition-colors"
              >
                {{ item.label }}
              </NuxtLink>
              <span v-else class="font-semibold text-brand-red-300" aria-current="page">{{ item.label }}</span>
              <font-awesome-icon
                v-if="index < breadcrumb.length - 1"
                icon="fa-solid fa-chevron-right"
                class="h-2.5 w-2.5 text-brand-blue-300 rtl:rotate-180"
                aria-hidden="true"
              />
            </li>
          </ol>
        </nav>

        <h1 class="flex flex-col font-black uppercase leading-[.92] tracking-[-0.045em] text-[clamp(2.5rem,10.5vw,8.25rem)]">
          <template v-if="words.length">
            <span class="sr-only">{{ title }}. </span>
            <span
              v-for="(word, index) in words"
              :key="index"
              class="break-words transition-colors duration-500 motion-reduce:transition-none"
              :class="wordClass(index)"
            ><bdi>{{ word }}</bdi></span>
          </template>
          <span v-else class="normal-case tracking-tight text-[clamp(2.5rem,7vw,5.5rem)]">{{ title }}</span>
        </h1>
      </div>

      <!-- Sous-titre, actions, commandes du slider -->
      <div class="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div class="flex max-w-xl flex-col gap-5">
          <p v-if="subtitle" class="text-lg leading-relaxed text-brand-blue-100 sm:text-xl">
            {{ subtitle }}
          </p>
          <div v-if="actions.length" class="flex flex-wrap gap-3">
            <template v-for="action in actions" :key="action.to + action.label">
              <a
                v-if="action.to.startsWith('#')"
                :href="action.to"
                class="inline-flex min-h-[52px] items-center gap-2 rounded-xl px-6 font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                :class="actionClass(action)"
                @click="onAnchorClick($event, action.to)"
              >
                <font-awesome-icon v-if="action.icon" :icon="action.icon" class="h-4 w-4" aria-hidden="true" />
                {{ action.label }}
              </a>
              <NuxtLink
                v-else
                :to="previewPath(localePath(action.to))"
                class="inline-flex min-h-[52px] items-center gap-2 rounded-xl px-6 font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                :class="actionClass(action)"
              >
                <font-awesome-icon v-if="action.icon" :icon="action.icon" class="h-4 w-4" aria-hidden="true" />
                {{ action.label }}
              </NuxtLink>
            </template>
          </div>
        </div>

        <div
          v-if="hasSteps"
          class="flex w-full gap-4 lg:w-auto"
          role="group"
          :aria-label="wordMode ? t('pei.home.hero.slides') : t('hero.slider.slides')"
        >
          <button
            v-for="index in total"
            :key="index"
            type="button"
            class="flex min-h-[44px] min-w-0 flex-1 flex-col gap-2.5 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:w-[150px] lg:flex-none"
            :aria-current="isCurrentStep(index - 1) ? 'true' : undefined"
            :aria-label="wordMode
              ? t('pei.home.hero.showSlide', { n: index, total, label: stepLabel(index - 1) })
              : t('hero.slider.slide', { n: index, total })"
            @click="goTo(index - 1, true)"
          >
            <span class="relative block h-1 w-full overflow-hidden rounded-full bg-white/30" aria-hidden="true">
              <span
                v-if="isCurrentStep(index - 1)"
                class="absolute inset-y-0 start-0 rounded-full bg-white"
                :class="autoplay ? 'pei-progress' : 'w-full'"
                :style="autoplay ? { animationDuration: `${SLIDE_DURATION}ms`, animationPlayState: paused ? 'paused' : 'running' } : undefined"
                @animationend="onProgressEnd(index - 1)"
              />
            </span>
            <span
              class="truncate text-[13px] font-bold"
              :class="isCurrentStep(index - 1) ? 'text-white' : 'text-brand-blue-200'"
              aria-hidden="true"
            >
              {{ pad(index) }}<template v-if="stepLabel(index - 1)"> · {{ stepLabel(index - 1) }}</template>
            </span>
          </button>
          <button
            v-if="autoplay"
            type="button"
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-full border border-white/40 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            :aria-label="userPaused ? t('pei.home.hero.resume') : t('pei.home.hero.pause')"
            :aria-pressed="userPaused ? 'true' : 'false'"
            @click="toggleUserPause"
          >
            <font-awesome-icon :icon="userPaused ? 'fa-solid fa-play' : 'fa-solid fa-pause'" class="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <p class="sr-only" aria-live="polite">
      {{ liveMessage }}
    </p>
  </section>
</template>

<style scoped>
/*
 * Voile bleu nuit (brand-blue-900) : contraste mesuré sur les photos claires de la réserve —
 * texte courant et mot allumé ≥ 4.5:1, mots atténués (texte géant) ≥ 3:1.
 */
.pei-hero-veil {
  background: rgb(14 24 64 / 0.86);
}

@media (min-width: 1024px) {
  .pei-hero-veil {
    background: linear-gradient(to right, rgb(14 24 64 / 0.94) 0%, rgb(14 24 64 / 0.9) 50%, rgb(14 24 64 / 0.85) 72%, rgb(14 24 64 / 0.3) 100%);
  }

  [dir='rtl'] .pei-hero-veil {
    background: linear-gradient(to left, rgb(14 24 64 / 0.94) 0%, rgb(14 24 64 / 0.9) 50%, rgb(14 24 64 / 0.85) 72%, rgb(14 24 64 / 0.3) 100%);
  }
}

/* Fondu enchaîné (1,2 s) et zoom lent : l'image quittée revient doucement à l'échelle 1 */
.pei-hero-image {
  transition: opacity 1.2s ease-in-out, transform 9s linear;
}

@media (prefers-reduced-motion: reduce) {
  .pei-hero-image {
    transition: none;
    transform: none;
  }
}

.pei-progress {
  width: 0;
  animation-name: pei-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes pei-progress {
  from { width: 0; }
  to { width: 100%; }
}
</style>
