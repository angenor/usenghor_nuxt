<script setup lang="ts">
/**
 * Anneau du parcours (hero de « Nos activités ») : un segment coloré par dispositif,
 * dans l'ordre du parcours, avec numéro et sigle ; chaque segment mène à l'ancre de sa phase.
 */
export interface JourneyRingStep {
  /** Numéro d'étape affiché (« 01 »). */
  number: string
  /** Libellé court inscrit dans le segment (sigle, sinon titre). */
  label: string
  /** Nom complet (lien accessible, infobulle). */
  title: string
  fill: string
  anchor: string
}

const props = defineProps<{
  steps: JourneyRingStep[]
}>()

const { t } = useI18n()
const { $lenis } = useNuxtApp()

const CENTER = 300
const RADIUS = 205
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP_DEG = 2

const segments = computed(() => {
  const count = props.steps.length
  const span = 360 / Math.max(count, 1)
  const dash = (CIRCUMFERENCE * (span - (count > 1 ? GAP_DEG : 0))) / 360
  return props.steps.map((step, index) => {
    const start = -90 + index * span + (count > 1 ? GAP_DEG / 2 : 0)
    const mid = ((-90 + index * span + span / 2) * Math.PI) / 180
    return {
      ...step,
      dasharray: `${dash.toFixed(1)} ${(CIRCUMFERENCE - dash).toFixed(1)}`,
      rotate: `rotate(${start.toFixed(2)} ${CENTER} ${CENTER})`,
      x: CENTER + RADIUS * Math.cos(mid),
      y: CENTER + RADIUS * Math.sin(mid),
      lines: labelLines(step.label),
    }
  })
})

/** Libellé sur une ou deux lignes, taille selon la longueur (le segment fait 112 px d'épaisseur). */
function labelLines(label: string): { text: string[], size: number } {
  const clean = label.trim()
  if (clean.length <= 5) return { text: [clean], size: 21 }
  if (clean.length <= 8) return { text: [clean], size: 17 }
  if (clean.length <= 13 || !clean.includes(' ')) return { text: [clean], size: 13 }
  const words = clean.split(/\s+/)
  const half = Math.ceil(words.length / 2)
  return { text: [words.slice(0, half).join(' '), words.slice(half).join(' ')], size: 12 }
}

function go(anchor: string) {
  scrollToPageAnchor(`#${anchor}`, { lenis: $lenis })
}
</script>

<template>
  <nav v-if="steps.length" :aria-label="t('pei.activities.ring.label')">
    <svg
      viewBox="0 0 600 600"
      class="block w-full h-auto overflow-visible"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        :cx="CENTER" :cy="CENTER" r="286"
        fill="none" stroke="currentColor" stroke-opacity=".16" stroke-width="1.5" stroke-dasharray="3 9"
        aria-hidden="true"
      />
      <a
        v-for="segment in segments"
        :key="segment.anchor + segment.number"
        :href="`#${segment.anchor}`"
        :aria-label="t('pei.activities.ring.step', { n: segment.number, title: segment.title })"
        class="journey-ring__segment"
        @click.prevent="go(segment.anchor)"
      >
        <title>{{ segment.title }}</title>
        <circle
          :cx="CENTER" :cy="CENTER" :r="RADIUS"
          fill="none" :stroke="segment.fill" stroke-width="112"
          :stroke-dasharray="segment.dasharray" :transform="segment.rotate"
        />
        <g text-anchor="middle" fill="#0e1840" font-family="inherit" aria-hidden="true">
          <text :x="segment.x" :y="segment.y - (segment.lines.text.length > 1 ? 20 : 12)" font-size="13" font-weight="700" opacity=".7">
            {{ segment.number }}
          </text>
          <text
            v-for="(line, index) in segment.lines.text"
            :key="index"
            :x="segment.x"
            :y="segment.y + (segment.lines.text.length > 1 ? 2 : 12) + index * 15"
            :font-size="segment.lines.size"
            font-weight="900"
          >
            {{ line }}
          </text>
        </g>
      </a>
      <g text-anchor="middle" font-family="inherit" aria-hidden="true">
        <text :x="CENTER" y="284" font-size="72" font-weight="900" letter-spacing="-2" fill="currentColor">{{ steps.length }}</text>
        <text :x="CENTER" y="322" font-size="15" font-weight="600" fill="#c7d2fe">{{ t('pei.activities.ring.captionTop', steps.length) }}</text>
        <text :x="CENTER" y="344" font-size="15" font-weight="600" fill="#c7d2fe">{{ t('pei.activities.ring.captionBottom') }}</text>
      </g>
    </svg>
  </nav>
</template>

<style scoped>
.journey-ring__segment {
  cursor: pointer;
  outline: none;
}
.journey-ring__segment circle {
  transition: stroke-width 0.2s ease, opacity 0.2s ease;
}
.journey-ring__segment:hover circle,
.journey-ring__segment:focus-visible circle {
  stroke-width: 122;
}
.journey-ring__segment:focus-visible circle {
  opacity: 0.85;
}
@media (prefers-reduced-motion: reduce) {
  .journey-ring__segment circle {
    transition: none;
  }
}
</style>
