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
const currentCursor = ref('crosshair')
const hoveredHandle = ref<string | null>(null)

// Map
const map = World
const allLocations = map.locations

// ============================================================================
// SYNC PROPS → LOCAL (seulement si pas en cours d'interaction)
// ============================================================================

watch(() => props.viewBox, (vb) => {
  if (!isDragging.value && !isResizing.value) {
    cropX.value = vb.x
    cropY.value = vb.y
    cropW.value = vb.width
    cropH.value = vb.height
  }
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

const HANDLE_RADIUS = 14

function getInteractionType(svgX: number, svgY: number): { type: string, cursor: string } {
  const cx = cropX.value
  const cy = cropY.value
  const cw = cropW.value
  const ch = cropH.value
  const r = HANDLE_RADIUS

  // Coins (priorité haute)
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

  // Bords — détection sur toute la longueur du bord, pas juste au centre
  const edgeTolerance = 8
  if (svgX >= cx - edgeTolerance && svgX <= cx + cw + edgeTolerance) {
    if (Math.abs(svgY - cy) < edgeTolerance) return { type: 'n', cursor: 'ns-resize' }
    if (Math.abs(svgY - (cy + ch)) < edgeTolerance) return { type: 's', cursor: 'ns-resize' }
  }
  if (svgY >= cy - edgeTolerance && svgY <= cy + ch + edgeTolerance) {
    if (Math.abs(svgX - cx) < edgeTolerance) return { type: 'w', cursor: 'ew-resize' }
    if (Math.abs(svgX - (cx + cw)) < edgeTolerance) return { type: 'e', cursor: 'ew-resize' }
  }

  // Intérieur → déplacement
  if (svgX >= cx && svgX <= cx + cw && svgY >= cy && svgY <= cy + ch) {
    return { type: 'move', cursor: 'grab' }
  }

  return { type: 'none', cursor: 'crosshair' }
}

// ============================================================================
// MOUSE HANDLERS (window-level pour ne jamais perdre le drag)
// ============================================================================

function handleMouseDown(e: MouseEvent) {
  const pt = screenToSVG(e)
  const { type } = getInteractionType(pt.x, pt.y)
  if (type === 'none') return

  e.preventDefault()
  e.stopPropagation()
  dragStartSVG.value = pt
  cropStart.value = { x: cropX.value, y: cropY.value, w: cropW.value, h: cropH.value }

  if (type === 'move') {
    isDragging.value = true
    currentCursor.value = 'grabbing'
  }
  else {
    isResizing.value = true
    resizeHandle.value = type
  }

  window.addEventListener('mousemove', handleWindowMouseMove)
  window.addEventListener('mouseup', handleWindowMouseUp)
}

function handleSVGMouseMove(e: MouseEvent) {
  if (isDragging.value || isResizing.value) return
  const pt = screenToSVG(e)
  const { type, cursor } = getInteractionType(pt.x, pt.y)
  currentCursor.value = cursor
  hoveredHandle.value = (type !== 'none' && type !== 'move') ? type : null
}

function handleWindowMouseMove(e: MouseEvent) {
  if (!isDragging.value && !isResizing.value) return

  e.preventDefault()
  const pt = screenToSVG(e)
  const dx = pt.x - dragStartSVG.value.x
  const dy = pt.y - dragStartSVG.value.y
  const { x: sx, y: sy, w: sw, h: sh } = cropStart.value
  const maxW = FULL_MAP_VIEWBOX.width
  const maxH = FULL_MAP_VIEWBOX.height
  const MIN_SIZE = 60

  if (isDragging.value) {
    cropX.value = clamp(sx + dx, 0, maxW - sw)
    cropY.value = clamp(sy + dy, 0, maxH - sh)
  }
  else if (isResizing.value) {
    const h = resizeHandle.value!
    let newX = sx, newY = sy, newW = sw, newH = sh

    if (h.includes('w') || h === 'w') {
      newW = Math.max(MIN_SIZE, sw - dx)
      newX = sx + sw - newW
      if (newX < 0) { newW += newX; newX = 0 }
    }
    if (h.includes('e') || h === 'e') {
      newW = Math.max(MIN_SIZE, sw + dx)
      if (sx + newW > maxW) newW = maxW - sx
    }
    if (h.includes('n') || h === 'n') {
      newH = Math.max(MIN_SIZE, sh - dy)
      newY = sy + sh - newH
      if (newY < 0) { newH += newY; newY = 0 }
    }
    if (h.includes('s') || h === 's') {
      newH = Math.max(MIN_SIZE, sh + dy)
      if (sy + newH > maxH) newH = maxH - sy
    }

    cropX.value = newX
    cropY.value = newY
    cropW.value = newW
    cropH.value = newH
  }
}

function handleWindowMouseUp() {
  if (isDragging.value || isResizing.value) {
    isDragging.value = false
    isResizing.value = false
    resizeHandle.value = null
    currentCursor.value = 'crosshair'
    emitViewBox()
  }
  window.removeEventListener('mousemove', handleWindowMouseMove)
  window.removeEventListener('mouseup', handleWindowMouseUp)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', handleWindowMouseMove)
  window.removeEventListener('mouseup', handleWindowMouseUp)
})

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

// ============================================================================
// COUNTRY COLORS & EXCLUSION
// ============================================================================

function getCountryFill(id: string): string {
  const idLower = id.toLowerCase()
  if (props.excludedCountries.includes(idLower)) return '#d1d5db'

  const campus = props.campuses.find(c => c.country_iso_code?.toLowerCase() === idLower)
  if (campus) return campus.is_headquarters ? '#2b4bbf' : '#f32525'
  return '#e5e7eb'
}

function getCountryOpacity(id: string): number {
  return props.excludedCountries.includes(id.toLowerCase()) ? 0.3 : 1
}

function toggleExcluded(e: MouseEvent, id: string) {
  if (isDragging.value || isResizing.value) return
  // Ne pas toggler si le clic est dans la zone de crop (priorité au crop)
  const pt = screenToSVG(e)
  const { type } = getInteractionType(pt.x, pt.y)
  if (type !== 'none') return

  const idLower = id.toLowerCase()
  const current = [...props.excludedCountries]
  const idx = current.indexOf(idLower)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(idLower)
  emit('update:excludedCountries', current)
}

// ============================================================================
// CAMPUS DOTS (lat/lng → SVG coords)
// ============================================================================

function geoToSVG(lat: number, lng: number): { x: number, y: number } {
  const x = ((lng + 180) / 360) * 1010
  const y = ((90 - lat) / 180) * 666
  return { x, y }
}

const campusDots = computed(() => {
  return props.campuses
    .filter(c => c.latitude != null && c.longitude != null)
    .map(c => ({ code: c.code, is_headquarters: c.is_headquarters, ...geoToSVG(c.latitude!, c.longitude!) }))
})

// ============================================================================
// HANDLES (positions SVG)
// ============================================================================

const cornerHandles = computed(() => [
  { name: 'nw', x: cropX.value, y: cropY.value, cursor: 'nwse-resize' },
  { name: 'ne', x: cropX.value + cropW.value, y: cropY.value, cursor: 'nesw-resize' },
  { name: 'sw', x: cropX.value, y: cropY.value + cropH.value, cursor: 'nesw-resize' },
  { name: 'se', x: cropX.value + cropW.value, y: cropY.value + cropH.value, cursor: 'nwse-resize' },
])

const edgeHandles = computed(() => [
  { name: 'n', x: cropX.value + cropW.value / 2, y: cropY.value, cursor: 'ns-resize' },
  { name: 's', x: cropX.value + cropW.value / 2, y: cropY.value + cropH.value, cursor: 'ns-resize' },
  { name: 'w', x: cropX.value, y: cropY.value + cropH.value / 2, cursor: 'ew-resize' },
  { name: 'e', x: cropX.value + cropW.value, y: cropY.value + cropH.value / 2, cursor: 'ew-resize' },
])

// Grille de tiers
const gridLines = computed(() => {
  const cx = cropX.value, cy = cropY.value, cw = cropW.value, ch = cropH.value
  return [
    { x1: cx + cw / 3, y1: cy, x2: cx + cw / 3, y2: cy + ch },
    { x1: cx + 2 * cw / 3, y1: cy, x2: cx + 2 * cw / 3, y2: cy + ch },
    { x1: cx, y1: cy + ch / 3, x2: cx + cw, y2: cy + ch / 3 },
    { x1: cx, y1: cy + 2 * ch / 3, x2: cx + cw, y2: cy + 2 * ch / 3 },
  ]
})

// Dimensions affichées pendant le drag
const displayInfo = computed(() => `${Math.round(cropW.value)} × ${Math.round(cropH.value)}`)

const isInteracting = computed(() => isDragging.value || isResizing.value)

// Helper: poignée active ?
function isHandleActive(name: string): boolean {
  return hoveredHandle.value === name || (isResizing.value && resizeHandle.value === name)
}
</script>

<template>
  <div class="relative select-none">
    <!-- Conteneur avec bordure réactive -->
    <div
      class="relative rounded-xl overflow-hidden shadow-lg border-2 transition-colors duration-200"
      :class="isInteracting ? 'border-blue-400 dark:border-blue-500 shadow-blue-500/20' : 'border-gray-200 dark:border-gray-700'"
    >
      <svg
        ref="svgRef"
        viewBox="0 0 1010 666"
        class="w-full h-auto bg-[#f8fafc] dark:bg-[#0f172a] block"
        :style="{ cursor: currentCursor }"
        @mousedown="handleMouseDown"
        @mousemove="handleSVGMouseMove"
      >
        <!-- ═══ FILTRES SVG ═══ -->
        <defs>
          <filter id="handleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.3)" />
          </filter>
        </defs>

        <!-- ═══ COUCHE 1 : Pays ═══ -->
        <path
          v-for="location in allLocations"
          :key="location.id"
          :d="location.path"
          :fill="getCountryFill(location.id)"
          :opacity="getCountryOpacity(location.id)"
          stroke="#fff"
          stroke-width="0.5"
          class="country-path"
          @click.stop="toggleExcluded($event, location.id)"
        />

        <!-- ═══ COUCHE 2 : Overlay assombri (hors crop) ═══ -->
        <g pointer-events="none">
          <rect x="0" y="0" width="1010" :height="Math.max(0, cropY)" class="overlay-rect" />
          <rect x="0" :y="cropY" :width="Math.max(0, cropX)" :height="cropH" class="overlay-rect" />
          <rect :x="cropX + cropW" :y="cropY" :width="Math.max(0, 1010 - cropX - cropW)" :height="cropH" class="overlay-rect" />
          <rect x="0" :y="cropY + cropH" width="1010" :height="Math.max(0, 666 - cropY - cropH)" class="overlay-rect" />
        </g>

        <!-- ═══ COUCHE 3 : Grille de tiers ═══ -->
        <g pointer-events="none" :opacity="isInteracting ? 0.5 : 0.15">
          <line
            v-for="(line, i) in gridLines"
            :key="i"
            :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2"
            stroke="#fff" stroke-width="0.8" stroke-dasharray="4,4"
          />
        </g>

        <!-- ═══ COUCHE 4 : Bordure crop ═══ -->
        <g pointer-events="none">
          <!-- Glow -->
          <rect
            :x="cropX" :y="cropY" :width="cropW" :height="cropH"
            fill="none" stroke="rgba(59,130,246,0.25)"
            :stroke-width="isInteracting ? 6 : 4"
          />
          <!-- Bordure -->
          <rect
            :x="cropX" :y="cropY" :width="cropW" :height="cropH"
            fill="none" stroke="#3b82f6" stroke-width="2"
          />

          <!-- Coins renforcés (L-shapes blancs + bleus) -->
          <g stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none">
            <polyline :points="`${cropX},${cropY + 20} ${cropX},${cropY} ${cropX + 20},${cropY}`" />
            <polyline :points="`${cropX + cropW - 20},${cropY} ${cropX + cropW},${cropY} ${cropX + cropW},${cropY + 20}`" />
            <polyline :points="`${cropX},${cropY + cropH - 20} ${cropX},${cropY + cropH} ${cropX + 20},${cropY + cropH}`" />
            <polyline :points="`${cropX + cropW - 20},${cropY + cropH} ${cropX + cropW},${cropY + cropH} ${cropX + cropW},${cropY + cropH - 20}`" />
          </g>
          <g stroke="#3b82f6" stroke-width="2" stroke-linecap="round" fill="none">
            <polyline :points="`${cropX},${cropY + 20} ${cropX},${cropY} ${cropX + 20},${cropY}`" />
            <polyline :points="`${cropX + cropW - 20},${cropY} ${cropX + cropW},${cropY} ${cropX + cropW},${cropY + 20}`" />
            <polyline :points="`${cropX},${cropY + cropH - 20} ${cropX},${cropY + cropH} ${cropX + 20},${cropY + cropH}`" />
            <polyline :points="`${cropX + cropW - 20},${cropY + cropH} ${cropX + cropW},${cropY + cropH} ${cropX + cropW},${cropY + cropH - 20}`" />
          </g>
        </g>

        <!-- ═══ COUCHE 5 : Poignées coins ═══ -->
        <g v-for="h in cornerHandles" :key="'c-' + h.name" :style="{ cursor: h.cursor }">
          <!-- Hit area élargie -->
          <circle :cx="h.x" :cy="h.y" r="14" fill="transparent" />
          <!-- Halo au hover -->
          <circle
            :cx="h.x" :cy="h.y"
            :r="isHandleActive(h.name) ? 11 : 0"
            fill="rgba(59,130,246,0.15)"
            class="handle-halo"
          />
          <!-- Cercle visible -->
          <circle
            :cx="h.x" :cy="h.y"
            :r="isHandleActive(h.name) ? 7 : 5.5"
            fill="#fff"
            stroke="#3b82f6"
            :stroke-width="isHandleActive(h.name) ? 2.5 : 2"
            class="handle-circle"
            filter="url(#handleShadow)"
          />
        </g>

        <!-- ═══ COUCHE 5b : Poignées bords ═══ -->
        <g v-for="h in edgeHandles" :key="'e-' + h.name" :style="{ cursor: h.cursor }">
          <circle :cx="h.x" :cy="h.y" r="12" fill="transparent" />
          <circle
            :cx="h.x" :cy="h.y"
            :r="isHandleActive(h.name) ? 5.5 : 4"
            fill="#fff"
            stroke="#3b82f6"
            :stroke-width="isHandleActive(h.name) ? 2 : 1.5"
            class="handle-circle"
            filter="url(#handleShadow)"
          />
        </g>

        <!-- ═══ COUCHE 6 : Points campus (avec pulsation) ═══ -->
        <g pointer-events="none">
          <g v-for="dot in campusDots" :key="dot.code">
            <circle
              :cx="dot.x" :cy="dot.y" r="8"
              :fill="dot.is_headquarters ? 'rgba(43,75,191,0.3)' : 'rgba(243,37,37,0.3)'"
              class="campus-pulse"
            />
            <circle
              :cx="dot.x" :cy="dot.y" r="4.5"
              :fill="dot.is_headquarters ? '#2b4bbf' : '#f32525'"
              stroke="#fff" stroke-width="1.5"
            />
          </g>
        </g>

        <!-- ═══ COUCHE 7 : Indicateur dimensions (pendant interaction) ═══ -->
        <g v-if="isInteracting" pointer-events="none">
          <rect
            :x="cropX + cropW / 2 - 42" :y="cropY + cropH / 2 - 11"
            width="84" height="22" rx="4"
            fill="rgba(0,0,0,0.75)"
          />
          <text
            :x="cropX + cropW / 2" :y="cropY + cropH / 2 + 4"
            text-anchor="middle" fill="#fff"
            font-size="11" font-family="ui-monospace, monospace" font-weight="500"
          >
            {{ displayInfo }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Légende -->
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-[#2b4bbf] inline-block shadow-sm"></span>
        Siège
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-[#f32525] inline-block shadow-sm"></span>
        Campus externalisé
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 inline-block rounded-sm border-2 border-blue-500"></span>
        Zone visible (glisser / redimensionner)
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 inline-block rounded-sm bg-gray-300 opacity-40"></span>
        Pays exclu (clic pour basculer)
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Pays */
.country-path {
  transition: opacity 0.15s ease, fill 0.15s ease;
  cursor: pointer;
}
.country-path:hover {
  opacity: 0.7 !important;
}

/* Overlay assombri */
.overlay-rect {
  fill: rgba(0, 0, 0, 0.45);
}

/* Poignées */
.handle-circle {
  transition: r 0.15s ease, stroke-width 0.15s ease;
}
.handle-halo {
  transition: r 0.2s ease;
}

/* Pulsation campus */
.campus-pulse {
  animation: pulse-ring 2.5s ease-out infinite;
}
@keyframes pulse-ring {
  0% { r: 4.5; opacity: 0.6; }
  70% { r: 12; opacity: 0; }
  100% { r: 12; opacity: 0; }
}
</style>
