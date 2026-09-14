<script setup lang="ts">
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

interface Props {
  title: string
  subtitle?: string
  /** Image unique (prioritaire sur `images`). */
  image?: string
  breadcrumb?: BreadcrumbItem[]
  /** Liste d'images : ≥ 2 = slider, 1 = image simple, vide = motif. */
  images?: string[]
  /** Pilule affichée au-dessus du titre. */
  badge?: string
  badgeIcon?: string
  /** Boutons rendus après le sous-titre. `to` commençant par # = ancre de la page. */
  actions?: HeroAction[]
}

const props = defineProps<Props>()

const localePath = useLocalePath()
const { t } = useI18n()

// ---------------------------------------------------------------------------
// Images : `image` prioritaire, sinon `images` privée des adresses en erreur
// ---------------------------------------------------------------------------
const failedImages = ref<string[]>([])

const slides = computed(() => {
  if (props.image) return []
  return (props.images ?? []).filter(src => !!src && !failedImages.value.includes(src))
})
const hasSlider = computed(() => slides.value.length >= 2)
const singleImage = computed(() => props.image ?? (slides.value.length === 1 ? slides.value[0] : undefined))
/** Hero issu de `images` : plus haut pour accueillir badge et boutons. */
const isTall = computed(() => !props.image && (hasSlider.value || !!singleImage.value))

function onImageError(src: string | undefined) {
  // Une image passée par `image` garde le comportement historique.
  if (!src || props.image) return
  if (!failedImages.value.includes(src)) failedImages.value.push(src)
}

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------
const SLIDE_INTERVAL = 6000
const currentSlide = ref(0)
const liveMessage = ref('')
const reducedMotion = ref(false)
const dotRefs = ref<HTMLButtonElement[]>([])
let slideInterval: ReturnType<typeof setInterval> | null = null
let hovered = false
let focused = false

const total = computed(() => slides.value.length)

function stopTimer() {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

function startTimer() {
  stopTimer()
  if (!import.meta.client || reducedMotion.value || !hasSlider.value) return
  if (hovered || focused || document.hidden) return
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % total.value
  }, SLIDE_INTERVAL)
}

function goToSlide(index: number, manual = false) {
  if (!total.value) return
  currentSlide.value = (index + total.value) % total.value
  if (manual) {
    liveMessage.value = t('hero.slider.current', { n: currentSlide.value + 1, total: total.value })
    startTimer()
  }
}

function focusDot(index: number) {
  goToSlide(index, true)
  nextTick(() => dotRefs.value[currentSlide.value]?.focus())
}

function onDotsKeydown(event: KeyboardEvent) {
  const rtl = document.documentElement.dir === 'rtl'
  const next = rtl ? 'ArrowLeft' : 'ArrowRight'
  const prev = rtl ? 'ArrowRight' : 'ArrowLeft'
  let target: number | null = null
  if (event.key === next) target = currentSlide.value + 1
  else if (event.key === prev) target = currentSlide.value - 1
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = total.value - 1
  if (target === null) return
  event.preventDefault()
  focusDot(target)
}

function onMouseEnter() {
  hovered = true
  stopTimer()
}
function onMouseLeave() {
  hovered = false
  startTimer()
}
function onFocusIn() {
  focused = true
  stopTimer()
}
function onFocusOut(event: FocusEvent) {
  const section = event.currentTarget as HTMLElement | null
  if (section && event.relatedTarget instanceof Node && section.contains(event.relatedTarget)) return
  focused = false
  startTimer()
}
function onVisibilityChange() {
  if (document.hidden) stopTimer()
  else startTimer()
}

// Nombre de slides modifié (image en erreur, données rechargées)
watch(total, (count) => {
  if (currentSlide.value >= count) currentSlide.value = 0
  startTimer()
})

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.addEventListener('visibilitychange', onVisibilityChange)
  startTimer()
})

onUnmounted(() => {
  stopTimer()
  if (import.meta.client) document.removeEventListener('visibilitychange', onVisibilityChange)
})

const { $lenis } = useNuxtApp()

function onAnchorClick(event: MouseEvent, hash: string) {
  if (scrollToPageAnchor(hash, { lenis: $lenis })) event.preventDefault()
}

const sectionClass = computed(() => {
  if (props.image) return 'h-[50vh] min-h-[400px] max-h-[500px]'
  if (isTall.value) return 'min-h-[560px] lg:min-h-[640px] flex flex-col justify-center pt-16 pb-28'
  return 'py-16 md:py-24'
})
</script>

<template>
  <section
    class="relative overflow-hidden"
    :class="[sectionClass, { 'slide-static': reducedMotion }]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <!-- Mode image (quand image est fournie) -->
    <template v-if="props.image">
      <div class="absolute inset-0">
        <img
          :src="props.image"
          :alt="props.title"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gray-900/60"></div>
      </div>
    </template>

    <!-- Mode slider (au moins deux images) -->
    <template v-else-if="hasSlider">
      <div class="absolute inset-0 bg-gray-900">
        <TransitionGroup name="slide">
          <img
            v-for="(src, index) in slides"
            v-show="index === currentSlide"
            :key="src"
            :src="src"
            :alt="props.title"
            class="absolute inset-0 w-full h-full object-cover"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
            :loading="index === 0 ? 'eager' : 'lazy'"
            decoding="async"
            @error="onImageError(src)"
          >
        </TransitionGroup>
        <div class="absolute inset-0 bg-gray-900/60"></div>
      </div>
    </template>

    <!-- Mode image simple issue de `images` -->
    <template v-else-if="singleImage">
      <div class="absolute inset-0">
        <img
          :src="singleImage"
          :alt="props.title"
          class="w-full h-full object-cover"
          fetchpriority="high"
          decoding="async"
          @error="onImageError(singleImage)"
        />
        <div class="absolute inset-0 bg-gray-900/60"></div>
      </div>
    </template>

    <!-- Mode pattern (par défaut, sans image) -->
    <template v-else>
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500"></div>
    </template>

    <!-- Content -->
    <div class="relative z-10" :class="props.image ? 'h-full flex flex-col justify-center' : ''">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <!-- Breadcrumb -->
        <nav v-if="props.breadcrumb?.length" class="mb-6">
          <ol class="flex items-center space-x-2 text-sm">
            <li v-for="(item, index) in props.breadcrumb" :key="index" class="flex items-center">
              <NuxtLink
                v-if="item.to"
                :to="localePath(item.to)"
                class="text-white/70 hover:text-white transition-colors duration-200"
              >
                {{ item.label }}
              </NuxtLink>
              <span v-else class="text-brand-red-400 font-medium">{{ item.label }}</span>
              <font-awesome-icon
                v-if="index < props.breadcrumb.length - 1"
                icon="fa-solid fa-chevron-right"
                class="w-3 h-3 mx-2 text-white/40"
              />
            </li>
          </ol>
        </nav>

        <!-- Badge -->
        <span
          v-if="props.badge"
          class="inline-flex items-center gap-2 mb-4 rounded-full border border-brand-red-400/30 bg-brand-red-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-red-300"
        >
          <font-awesome-icon v-if="props.badgeIcon" :icon="props.badgeIcon" class="w-3.5 h-3.5" />
          {{ props.badge }}
        </span>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          {{ props.title }}
        </h1>

        <!-- Subtitle -->
        <p v-if="props.subtitle" class="text-lg sm:text-xl text-white/80 leading-relaxed max-w-3xl">
          {{ props.subtitle }}
        </p>

        <!-- Actions -->
        <div v-if="props.actions?.length" class="flex flex-wrap gap-4 mt-8">
          <template v-for="action in props.actions" :key="action.to + action.label">
            <a
              v-if="action.to.startsWith('#')"
              :href="action.to"
              @click="onAnchorClick($event, action.to)"
              class="inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white transition-colors duration-200"
              :class="action.variant === 'ghost'
                ? 'border border-white/30 bg-white/15 hover:bg-white/25'
                : 'bg-brand-red-500 hover:bg-brand-red-600'"
            >
              <font-awesome-icon v-if="action.icon" :icon="action.icon" class="w-4 h-4" />
              {{ action.label }}
            </a>
            <NuxtLink
              v-else
              :to="localePath(action.to)"
              class="inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white transition-colors duration-200"
              :class="action.variant === 'ghost'
                ? 'border border-white/30 bg-white/15 hover:bg-white/25'
                : 'bg-brand-red-500 hover:bg-brand-red-600'"
            >
              <font-awesome-icon v-if="action.icon" :icon="action.icon" class="w-4 h-4" />
              {{ action.label }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>

    <!-- Points de navigation du slider -->
    <template v-if="hasSlider">
      <div
        class="absolute bottom-16 md:bottom-20 inset-x-0 z-20 flex justify-center gap-3"
        role="tablist"
        :aria-label="t('hero.slider.slides')"
        @keydown="onDotsKeydown"
      >
        <button
          v-for="(src, index) in slides"
          :key="src"
          ref="dotRefs"
          type="button"
          role="tab"
          :aria-selected="index === currentSlide"
          :tabindex="index === currentSlide ? 0 : -1"
          :aria-label="t('hero.slider.slide', { n: index + 1, total })"
          class="h-3 rounded-full transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="index === currentSlide ? 'w-12 bg-brand-blue-500' : 'w-3 bg-white/40 hover:bg-white/60'"
          @click="goToSlide(index, true)"
        />
      </div>
      <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
    </template>

    <!-- Ligne de séparation oblique -->
    <div class="absolute bottom-0 left-0 right-0">
      <svg class="w-full h-12 md:h-16 text-white dark:text-gray-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
      </svg>
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 1s ease-out;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
.slide-static .slide-enter-active,
.slide-static .slide-leave-active {
  transition: none;
}
</style>
