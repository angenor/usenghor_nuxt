<script setup lang="ts">
import World from '@svg-maps/world'
import type { MapViewBox } from '~/composables/useMapSettings'
import { FULL_MAP_VIEWBOX } from '~/composables/useMapSettings'
import type { CampusPublic } from '~/composables/usePublicCampusApi'

interface Props {
  viewBox: MapViewBox
  excludedCountries: string[]
  campuses: CampusPublic[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:viewBox', value: MapViewBox): void
  (e: 'update:excludedCountries', value: string[]): void
}>()

// ============================================================================
// STATE
// ============================================================================

const svgRef = ref<SVGSVGElement | null>(null)

// Crop rect en coordonnées SVG (0-1010, 0-666)
const cropX = ref(props.viewBox.x)
const cropY = ref(props.viewBox.y)
const cropW = ref(props.viewBox.width)
const cropH = ref(props.viewBox.height)

// Interaction
const isDragging = ref(false)
const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)
const dragStartSVG = ref({ x: 0, y: 0 })
const cropStart = ref({ x: 0, y: 0, w: 0, h: 0 })
const currentCursor = ref('default')

// Map
const map = World
const allLocations = map.locations

// ============================================================================
// SYNC PROPS → LOCAL
// ============================================================================

watch(() => props.viewBox, (vb) => {
  cropX.value = vb.x
  cropY.value = vb.y
  cropW.value = vb.width
  cropH.value = vb.height
}, { deep: true })

// ============================================================================
// EMIT CHANGES
// ============================================================================

function emitViewBox() {
  emit('update:viewBox', {
    x: Math.round(cropX.value),
    y: Math.round(cropY.value),
    width: Math.round(cropW.value),
    height: Math.round(cropH.value),
  })
}

// ============================================================================
// SVG COORDINATE CONVERSION
// ============================================================================

function screenToSVG(e: MouseEvent): { x: number, y: number } {
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const ctm = svg.getScreenCTM()?.inverse()
  if (!ctm) return { x: 0, y: 0 }
  const svgPt = pt.matrixTransform(ctm)
  return { x: svgPt.x, y: svgPt.y }
}

// ============================================================================
// HANDLE DETECTION
// ============================================================================

const HANDLE_RADIUS = 12 // rayon en SVG units pour la détection

function getInteractionType(svgX: number, svgY: number): { type: string, cursor: string } {
  const cx = cropX.value
  const cy = cropY.value
  const cw = cropW.value
  const ch = cropH.value
  const r = HANDLE_RADIUS

  // Coins
  const corners = [
    { name: 'nw', x: cx, y: cy, cursor: 'nwse-resize' },
    { name: 'ne', x: cx + cw, y: cy, cursor: 'nesw-resize' },
    { name: 'sw', x: cx, y: cy + ch, cursor: 'nesw-resize' },
    { name: 'se', x: cx + cw, y: cy + ch, cursor: 'nwse-resize' },
  ]
  for (const c of corners) {
    if (Math.hypot(svgX - c.x, svgY - c.y) < r) {
      return { type: c.name, cursor: c.cursor }
    }
  }

  // Bords
  const edges = [
    { name: 'n', x: cx + cw / 2, y: cy, cursor: 'ns-resize' },
    { name: 's', x: cx + cw / 2, y: cy + ch, cursor: 'ns-resize' },
    { name: 'w', x: cx, y: cy + ch / 2, cursor: 'ew-resize' },
    { name: 'e', x: cx + cw, y: cy + ch / 2, cursor: 'ew-resize' },
  ]
  for (const edge of edges) {
    if (Math.hypot(svgX - edge.x, svgY - edge.y) < r) {
      return { type: edge.name, cursor: edge.cursor }
    }
  }

  // Intérieur → déplacement
  if (svgX >= cx && svgX <= cx + cw && svgY >= cy && svgY <= cy + ch) {
    return { type: 'move', cursor: 'move' }
  }

  return { type: 'none', cursor: 'default' }
}

// ============================================================================
// MOUSE HANDLERS
// ============================================================================

function handleMouseDown(e: MouseEvent) {
  const pt = screenToSVG(e)
  const { type } = getInteractionType(pt.x, pt.y)
  if (type === 'none') return

  e.preventDefault()
  dragStartSVG.value = pt
  cropStart.value = { x: cropX.value, y: cropY.value, w: cropW.value, h: cropH.value }

  if (type === 'move') {
    isDragging.value = true
  }
  else {
    isResizing.value = true
    resizeHandle.value = type
  }
}

function handleMouseMove(e: MouseEvent) {
  const pt = screenToSVG(e)

  if (!isDragging.value && !isResizing.value) {
    const { cursor } = getInteractionType(pt.x, pt.y)
    currentCursor.value = cursor
    return
  }

  e.preventDefault()
  const dx = pt.x - dragStartSVG.value.x
  const dy = pt.y - dragStartSVG.value.y
  const { x: sx, y: sy, w: sw, h: sh } = cropStart.value
  const maxW = FULL_MAP_VIEWBOX.width
  const maxH = FULL_MAP_VIEWBOX.height
  const MIN_SIZE = 80

  if (isDragging.value) {
    cropX.value = clamp(sx + dx, 0, maxW - sw)
    cropY.value = clamp(sy + dy, 0, maxH - sh)
  }
  else if (isResizing.value) {
    const h = resizeHandle.value!

    let newX = sx
    let newY = sy
    let newW = sw
    let newH = sh

    if (h.includes('w')) {
      newW = Math.max(MIN_SIZE, sw - dx)
      newX = sx + sw - newW
      if (newX < 0) { newW += newX; newX = 0 }
    }
    if (h.includes('e')) {
      newW = Math.max(MIN_SIZE, sw + dx)
      if (sx + newW > maxW) newW = maxW - sx
    }
    if (h.includes('n')) {
      newH = Math.max(MIN_SIZE, sh - dy)
      newY = sy + sh - newH
      if (newY < 0) { newH += newY; newY = 0 }
    }
    if (h.includes('s')) {
      newH = Math.max(MIN_SIZE, sh + dy)
      if (sy + newH > maxH) newH = maxH - sy
    }

    cropX.value = newX
    cropY.value = newY
    cropW.value = newW
    cropH.value = newH
  }
}

function handleMouseUp() {
  if (isDragging.value || isResizing.value) {
    isDragging.value = false
    isResizing.value = false
    resizeHandle.value = null
    emitViewBox()
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

// ============================================================================
// COUNTRY COLORS & EXCLUSION
// ============================================================================

function getCountryFill(id: string): string {
  const idLower = id.toLowerCase()
  const isExcluded = props.excludedCountries.includes(idLower)

  if (isExcluded) return '#d1d5db'

  const campus = props.campuses.find(c => c.country_iso_code?.toLowerCase() === idLower)
  if (campus) {
    return campus.is_headquarters ? '#2b4bbf' : '#f32525'
  }
  return '#e5e7eb'
}

function getCountryOpacity(id: string): number {
  return props.excludedCountries.includes(id.toLowerCase()) ? 0.35 : 1
}

function toggleExcluded(id: string) {
  if (isDragging.value || isResizing.value) return

  const idLower = id.toLowerCase()
  const current = [...props.excludedCountries]
  const idx = current.indexOf(idLower)
  if (idx >= 0) {
    current.splice(idx, 1)
  }
  else {
    current.push(idLower)
  }
  emit('update:excludedCountries', current)
}

// ============================================================================
// CAMPUS DOTS (lat/lng → SVG coords)
// ============================================================================

function geoToSVG(lat: number, lng: number): { x: number, y: number } {
  // Projection simplifiée (suffisante pour le positionnement des points)
  const x = ((lng + 180) / 360) * 1010
  const y = ((90 - lat) / 180) * 666
  return { x, y }
}

const campusDots = computed(() => {
  return props.campuses
    .filter(c => c.latitude != null && c.longitude != null)
    .map(c => ({
      code: c.code,
      is_headquarters: c.is_headquarters,
      ...geoToSVG(c.latitude!, c.longitude!),
    }))
})

// ============================================================================
// HANDLES (positions SVG)
// ============================================================================

const cornerHandles = computed(() => [
  { name: 'nw', x: cropX.value, y: cropY.value },
  { name: 'ne', x: cropX.value + cropW.value, y: cropY.value },
  { name: 'sw', x: cropX.value, y: cropY.value + cropH.value },
  { name: 'se', x: cropX.value + cropW.value, y: cropY.value + cropH.value },
])

const edgeHandles = computed(() => [
  { name: 'n', x: cropX.value + cropW.value / 2, y: cropY.value },
  { name: 's', x: cropX.value + cropW.value / 2, y: cropY.value + cropH.value },
  { name: 'w', x: cropX.value, y: cropY.value + cropH.value / 2 },
  { name: 'e', x: cropX.value + cropW.value, y: cropY.value + cropH.value / 2 },
])
</script>

<template>
  <div class="relative select-none">
    <svg
      ref="svgRef"
      viewBox="0 0 1010 666"
      class="w-full h-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900"
      :style="{ cursor: currentCursor }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <!-- Pays -->
      <path
        v-for="location in allLocations"
        :key="location.id"
        :d="location.path"
        :fill="getCountryFill(location.id)"
        :opacity="getCountryOpacity(location.id)"
        stroke="#fff"
        stroke-width="0.5"
        class="cursor-pointer"
        @click.stop="toggleExcluded(location.id)"
      />

      <!-- Overlay semi-transparent en dehors du crop -->
      <rect x="0" y="0" width="1010" :height="cropY" fill="rgba(0,0,0,0.4)" pointer-events="none" />
      <rect x="0" :y="cropY" :width="cropX" :height="cropH" fill="rgba(0,0,0,0.4)" pointer-events="none" />
      <rect :x="cropX + cropW" :y="cropY" :width="1010 - cropX - cropW" :height="cropH" fill="rgba(0,0,0,0.4)" pointer-events="none" />
      <rect x="0" :y="cropY + cropH" width="1010" :height="666 - cropY - cropH" fill="rgba(0,0,0,0.4)" pointer-events="none" />

      <!-- Bordure du crop -->
      <rect
        :x="cropX" :y="cropY" :width="cropW" :height="cropH"
        fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="8,4"
        pointer-events="none"
      />

      <!-- Poignées coins -->
      <circle
        v-for="h in cornerHandles"
        :key="h.name"
        :cx="h.x" :cy="h.y" r="6"
        fill="#fff" stroke="#3b82f6" stroke-width="2"
        pointer-events="none"
      />

      <!-- Poignées bords -->
      <circle
        v-for="h in edgeHandles"
        :key="h.name"
        :cx="h.x" :cy="h.y" r="4.5"
        fill="#fff" stroke="#3b82f6" stroke-width="1.5"
        pointer-events="none"
      />

      <!-- Points campus -->
      <circle
        v-for="dot in campusDots"
        :key="dot.code"
        :cx="dot.x" :cy="dot.y"
        r="5"
        :fill="dot.is_headquarters ? '#2b4bbf' : '#f32525'"
        stroke="#fff" stroke-width="1.5"
        pointer-events="none"
      />
    </svg>

    <!-- Légende -->
    <div class="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-brand-blue-500 inline-block"></span>
        Siège
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-brand-red-500 inline-block"></span>
        Campus externalisé
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 inline-block rounded border border-dashed border-blue-500"></span>
        Zone visible
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 inline-block rounded bg-gray-300 opacity-40"></span>
        Pays exclu (clic pour basculer)
      </span>
    </div>
  </div>
</template>
