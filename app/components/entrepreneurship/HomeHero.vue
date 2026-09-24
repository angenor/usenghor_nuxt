<script setup lang="ts">
/**
 * Hero plein écran de l'accueil du pôle PEI : slider photo sous un voile bleu nuit,
 * slogan géant empilé dont la diapositive active « allume » le mot correspondant.
 *
 * - Un mot par image : le mot n allumé pendant la diapositive n. Si le nombre de mots
 *   diffère du nombre d'images (ou si une seule image), tous les mots restent allumés.
 * - Défilement automatique (barre de progression CSS) en pause au survol, au focus
 *   et onglet masqué ; désactivé avec `prefers-reduced-motion`.
 * - Commandes : un bouton par diapositive (numéro + mot), annonce polie au changement manuel.
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
const { $lenis } = useNuxtApp()

// ---------------------------------------------------------------------------
// Diapositives
// ---------------------------------------------------------------------------
const failed = ref<string[]>([])
const slides = computed(() => {
  const list = props.images.filter(src => !!src && !failed.value.includes(src))
  return list.length ? list : [props.fallbackImage]
})
const total = computed(() => slides.value.length)
const hasSlider = computed(() => total.value >= 2)
/** Mots et diapositives appariés (sinon : tous les mots allumés). */
const linked = computed(() => hasSlider.value && props.words.length === total.value)

function onImageError(src: string) {
  if (src !== props.fallbackImage && !failed.value.includes(src)) failed.value.push(src)
}

/** « INNOVER. » → « Innover » (libellé des commandes). */
function wordLabel(word: string): string {
  const bare = word.replace(/[.!?…\s]+$/u, '').trim().toLocaleLowerCase(locale.value)
  return bare.charAt(0).toLocaleUpperCase(locale.value) + bare.slice(1)
}

const pad = (n: number) => String(n).padStart(2, '0')

function slideLabel(index: number): string {
  return linked.value ? wordLabel(props.words[index] ?? '') : ''
}

function imageAlt(index: number): string {
  const label = slideLabel(index)
  return label ? `${props.title} — ${label}` : props.title
}

// ---------------------------------------------------------------------------
// Défilement automatique (piloté par la fin de l'animation de la barre active)
// ---------------------------------------------------------------------------
const SLIDE_DURATION = 6000
const active = ref(0)
const mounted = ref(false)
const reducedMotion = ref(false)
const hovered = ref(false)
const focused = ref(false)
const pageHidden = ref(false)
const liveMessage = ref('')

const autoplay = computed(() => mounted.value && hasSlider.value && !reducedMotion.value)
const paused = computed(() => hovered.value || focused.value || pageHidden.value)

function goTo(index: number, manual = false) {
  if (!total.value) return
  active.value = (index + total.value) % total.value
  if (manual) {
    const label = slideLabel(active.value)
    liveMessage.value = label
      ? t('pei.home.hero.slideAnnounce', { n: active.value + 1, total: total.value, label })
      : t('hero.slider.current', { n: active.value + 1, total: total.value })
  }
}

function onProgressEnd(index: number) {
  if (index === active.value) goTo(active.value + 1)
}

function isLit(index: number): boolean {
  return !linked.value || index === active.value
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
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focused = true"
    @focusout="onFocusOut"
  >
    <!-- Images -->
    <div class="absolute inset-0 -z-10">
      <img
        v-for="(src, index) in slides"
        :key="src"
        :src="src"
        :alt="imageAlt(index)"
        :aria-hidden="index === active ? undefined : 'true'"
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out motion-reduce:transition-none"
        :class="index === active ? 'opacity-100' : 'opacity-0'"
        :fetchpriority="index === 0 ? 'high' : 'auto'"
        :loading="index === 0 ? 'eager' : 'lazy'"
        decoding="async"
        @error="onImageError(src)"
      >
      <div class="absolute inset-0 bg-brand-blue-900/75" aria-hidden="true" />
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-blue-900/80 to-transparent" aria-hidden="true" />
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
              :class="isLit(index)
                ? (index === words.length - 1 ? 'text-brand-red-300' : 'text-white')
                : 'text-[#7584c2]'"
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
                :to="localePath(action.to)"
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
          v-if="hasSlider"
          class="flex w-full gap-4 lg:w-auto"
          role="group"
          :aria-label="linked ? t('pei.home.hero.slides') : t('hero.slider.slides')"
        >
          <button
            v-for="(src, index) in slides"
            :key="src"
            type="button"
            class="flex min-h-[44px] min-w-0 flex-1 flex-col gap-2.5 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:w-[150px] lg:flex-none"
            :aria-current="index === active ? 'true' : undefined"
            :aria-label="linked
              ? t('pei.home.hero.showSlide', { n: index + 1, total, label: slideLabel(index) })
              : t('hero.slider.slide', { n: index + 1, total })"
            @click="goTo(index, true)"
          >
            <span class="relative block h-1 w-full overflow-hidden rounded-full bg-white/30" aria-hidden="true">
              <span
                v-if="index === active"
                class="absolute inset-y-0 start-0 rounded-full bg-white"
                :class="autoplay ? 'pei-progress' : 'w-full'"
                :style="autoplay ? { animationDuration: `${SLIDE_DURATION}ms`, animationPlayState: paused ? 'paused' : 'running' } : undefined"
                @animationend="onProgressEnd(index)"
              />
            </span>
            <span
              class="truncate text-[13px] font-bold"
              :class="index === active ? 'text-white' : 'text-brand-blue-200'"
              aria-hidden="true"
            >
              {{ pad(index + 1) }}<template v-if="slideLabel(index)"> · {{ slideLabel(index) }}</template>
            </span>
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
