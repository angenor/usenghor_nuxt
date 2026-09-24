<script setup lang="ts">
/**
 * Chiffres clés du pôle : panneau 2 × 2 (accueil, par défaut), bandeau pleine largeur
 * à trois colonnes séparées (`variant="band"`) ou cartes teintées bleu nuit / bleu très clair /
 * rose (`variant="cards"`, page « Nos alumni » : une valeur textuelle s'affiche en plus petit).
 */
interface Stat {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  title?: string
  stats: Stat[]
  variant?: 'panel' | 'band' | 'cards'
}>(), {
  title: undefined,
  variant: 'panel',
})

const panelRef = ref<HTMLElement | null>(null)
const animated = ref<(string | null)[]>(props.stats.map(() => null))
let observer: IntersectionObserver | null = null

function displayValue(index: number): string {
  return animated.value[index] ?? props.stats[index]?.value ?? ''
}

function animate(index: number, value: string) {
  const target = Number.parseInt(value, 10)
  const suffix = value.trim().replace(/^\d+/, '')
  const duration = 1500
  const start = performance.now()
  const ease = (x: number) => 1 - Math.pow(1 - x, 4)
  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    animated.value[index] = `${Math.round(target * ease(progress))}${suffix}`
    if (progress < 1) requestAnimationFrame(step)
    else animated.value[index] = null
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !panelRef.value) return
  const numeric = props.stats.map(s => isNumericStat(s.value))
  if (!numeric.some(Boolean)) return
  // Valeurs remises à zéro seulement côté client, juste avant l'animation
  observer = new IntersectionObserver((entries) => {
    if (!entries.some(e => e.isIntersecting)) return
    observer?.disconnect()
    props.stats.forEach((stat, index) => {
      if (!numeric[index]) return
      animated.value[index] = `0${stat.value.trim().replace(/^\d+/, '')}`
      setTimeout(() => animate(index, stat.value), index * 150)
    })
  }, { threshold: 0.3 })
  observer.observe(panelRef.value)
})

onUnmounted(() => observer?.disconnect())

/** Teintes des cartes (`variant="cards"`), en boucle : bleu nuit, bleu très clair, rose. */
const CARD_TONES = [
  {
    card: 'bg-brand-blue-900 dark:bg-brand-blue-950 dark:ring-1 dark:ring-inset dark:ring-white/10',
    value: 'text-white',
    label: 'text-brand-blue-200',
  },
  {
    card: 'bg-[#f5f7ff] dark:bg-gray-800',
    value: 'text-brand-blue-900 dark:text-white',
    label: 'text-gray-600 dark:text-gray-300',
  },
  {
    card: 'bg-[#fff1f1] dark:bg-brand-red-950/40 dark:ring-1 dark:ring-inset dark:ring-brand-red-900/50',
    value: 'text-brand-red-800 dark:text-brand-red-300',
    label: 'text-gray-600 dark:text-gray-300',
  },
] as const

const cardTone = (index: number) => CARD_TONES[index % CARD_TONES.length]!
</script>

<template>
  <div v-if="variant === 'cards'" ref="panelRef">
    <p v-if="title" class="sr-only">
      {{ title }}
    </p>
    <dl class="grid gap-4 sm:gap-6 md:grid-cols-3">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="flex min-w-0 flex-col-reverse justify-end gap-2 rounded-3xl p-7 sm:p-8"
        :class="cardTone(index).card"
      >
        <dt class="text-base leading-relaxed break-words" :class="cardTone(index).label">
          {{ stat.label }}
        </dt>
        <dd
          class="font-black break-words"
          :class="[
            cardTone(index).value,
            isPeiFigureStat(stat.value)
              ? 'text-6xl lg:text-7xl leading-none tracking-[-0.04em] tabular-nums'
              : 'text-3xl lg:text-[2.5rem] leading-[1.1] tracking-[-0.03em]',
          ]"
        >
          <!-- « 5 000 € » : isolé en LTR, sinon inversé en arabe (« € 000 5 ») -->
          <bdi :dir="isPeiFigureStat(stat.value) ? 'ltr' : 'auto'">{{ displayValue(index) }}</bdi>
        </dd>
      </div>
    </dl>
  </div>
  <div
    v-else-if="variant === 'band'"
    ref="panelRef"
    class="w-full bg-gradient-to-r from-brand-blue-900 via-brand-blue-800 to-brand-blue-900 py-12 sm:py-16"
  >
    <p v-if="title" class="sr-only">
      {{ title }}
    </p>
    <dl class="max-w-7xl mx-auto px-4 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x divide-white/15 rtl:divide-x-reverse">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="flex flex-col-reverse text-center px-6 min-w-0"
      >
        <dt class="mt-2 text-xs uppercase tracking-[0.2em] text-white/70 break-words">
          {{ stat.label }}
        </dt>
        <dd class="text-4xl sm:text-5xl font-bold tabular-nums text-white leading-none">
          {{ displayValue(index) }}
        </dd>
      </div>
    </dl>
  </div>
  <div
    v-else
    ref="panelRef"
    class="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-brand-blue-900 via-brand-blue-800 to-brand-blue-700"
  >
    <p v-if="title" class="text-xs font-semibold uppercase tracking-widest text-white/60 mb-6">
      {{ title }}
    </p>
    <dl class="grid grid-cols-2 gap-4">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="flex flex-col-reverse rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 sm:p-6 text-center min-w-0"
      >
        <dt class="text-sm text-white/70 break-words">
          {{ stat.label }}
        </dt>
        <dd class="text-3xl sm:text-4xl font-bold tabular-nums text-white leading-none mb-1.5">
          {{ displayValue(index) }}
        </dd>
      </div>
    </dl>
  </div>
</template>
