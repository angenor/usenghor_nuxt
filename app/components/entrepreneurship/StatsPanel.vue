<script setup lang="ts">
/**
 * Chiffres clés du pôle : panneau 2 × 2 (accueil, par défaut) ou bandeau pleine largeur
 * à trois colonnes séparées (`variant="band"`, page « Nos alumni »).
 */
interface Stat {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  title?: string
  stats: Stat[]
  variant?: 'panel' | 'band'
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
</script>

<template>
  <div
    v-if="variant === 'band'"
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
