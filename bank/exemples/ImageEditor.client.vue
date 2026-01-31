<script setup lang="ts">
interface Props {
  imageFile: File
  aspectRatio?: number | null
  maxFileSize?: number
  minQuality?: number
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: null,
  maxFileSize: 0, // Pas de limite (0 = illimité)
  minQuality: 10
})

const emit = defineEmits<{
  (e: 'save', blob: Blob): void
  (e: 'cancel'): void
}>()

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null)
const previewCanvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

// State
const imageUrl = ref('')
const originalImage = ref<HTMLImageElement | null>(null)
const quality = ref(85)
const outputFormat = ref<'jpeg' | 'png' | 'webp'>('jpeg')

// Crop state
const cropX = ref(0)
const cropY = ref(0)
const cropWidth = ref(100)
const cropHeight = ref(100)
const isDragging = ref(false)
const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)
const dragStartX = ref(0)
const dragStartY = ref(0)
const cropStartX = ref(0)
const cropStartY = ref(0)
const cropStartWidth = ref(0)
const cropStartHeight = ref(0)

// Cursor state
const currentCursor = ref('default')

// Canvas offset cache
const canvasOffset = ref({ x: 0, y: 0 })

// Computed values
const estimatedSize = ref(0)
const isProcessing = ref(false)

const sizeWarning = computed(() => {
  // Pas de limite si maxFileSize = 0
  if (props.maxFileSize > 0 && estimatedSize.value > props.maxFileSize) {
    return `Fichier trop lourd (${formatSize(estimatedSize.value)}). Maximum: ${formatSize(props.maxFileSize)}`
  }
  return null
})

const qualityWarning = computed(() => {
  if (quality.value < props.minQuality) {
    return `Qualité très basse - l'image risque d'être pixelisée`
  }
  return null
})

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

onMounted(async () => {
  imageUrl.value = URL.createObjectURL(props.imageFile)

  const img = new Image()
  img.onload = () => {
    originalImage.value = img
    initializeCrop()
    drawCanvas()
    updatePreview()
  }
  img.src = imageUrl.value
})

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
})

function getDisplayParams() {
  if (!originalImage.value || !containerRef.value) return null

  const img = originalImage.value
  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = 400

  const scale = Math.min(containerWidth / img.width, containerHeight / img.height)
  const displayWidth = img.width * scale
  const displayHeight = img.height * scale
  const offsetX = (containerWidth - displayWidth) / 2
  const offsetY = (containerHeight - displayHeight) / 2

  return { containerWidth, containerHeight, scale, displayWidth, displayHeight, offsetX, offsetY }
}

function initializeCrop() {
  const params = getDisplayParams()
  if (!params) return

  const { displayWidth, displayHeight } = params

  if (props.aspectRatio) {
    const targetRatio = props.aspectRatio
    const imageRatio = displayWidth / displayHeight

    if (imageRatio > targetRatio) {
      cropHeight.value = displayHeight
      cropWidth.value = displayHeight * targetRatio
      cropX.value = (displayWidth - cropWidth.value) / 2
      cropY.value = 0
    } else {
      cropWidth.value = displayWidth
      cropHeight.value = displayWidth / targetRatio
      cropX.value = 0
      cropY.value = (displayHeight - cropHeight.value) / 2
    }
  } else {
    cropX.value = 0
    cropY.value = 0
    cropWidth.value = displayWidth
    cropHeight.value = displayHeight
  }
}

function drawCanvas() {
  if (!canvasRef.value || !originalImage.value || !containerRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const params = getDisplayParams()
  if (!params) return

  const { containerWidth, containerHeight, displayWidth, displayHeight, offsetX, offsetY } = params
  const img = originalImage.value

  canvasOffset.value = { x: offsetX, y: offsetY }

  canvas.width = containerWidth
  canvas.height = containerHeight

  // Draw darkened background
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(0, 0, containerWidth, containerHeight)

  // Draw darkened image
  ctx.globalAlpha = 0.4
  ctx.drawImage(img, offsetX, offsetY, displayWidth, displayHeight)
  ctx.globalAlpha = 1.0

  // Draw crop area (full brightness)
  ctx.save()
  ctx.beginPath()
  ctx.rect(offsetX + cropX.value, offsetY + cropY.value, cropWidth.value, cropHeight.value)
  ctx.clip()
  ctx.drawImage(img, offsetX, offsetY, displayWidth, displayHeight)
  ctx.restore()

  // Draw crop border
  ctx.strokeStyle = '#3695d8'
  ctx.lineWidth = 2
  ctx.strokeRect(offsetX + cropX.value, offsetY + cropY.value, cropWidth.value, cropHeight.value)

  // Draw corner handles
  const handleSize = 12
  const corners = [
    { x: cropX.value, y: cropY.value },
    { x: cropX.value + cropWidth.value, y: cropY.value },
    { x: cropX.value, y: cropY.value + cropHeight.value },
    { x: cropX.value + cropWidth.value, y: cropY.value + cropHeight.value }
  ]

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#3695d8'
  ctx.lineWidth = 2

  corners.forEach(corner => {
    ctx.beginPath()
    ctx.arc(offsetX + corner.x, offsetY + corner.y, handleSize / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  })

  // Draw edge handles (middle of each side)
  const edges = [
    { x: cropX.value + cropWidth.value / 2, y: cropY.value },
    { x: cropX.value + cropWidth.value / 2, y: cropY.value + cropHeight.value },
    { x: cropX.value, y: cropY.value + cropHeight.value / 2 },
    { x: cropX.value + cropWidth.value, y: cropY.value + cropHeight.value / 2 }
  ]

  edges.forEach(edge => {
    ctx.beginPath()
    ctx.arc(offsetX + edge.x, offsetY + edge.y, handleSize / 2 - 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  })

  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1

  for (let i = 1; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(offsetX + cropX.value + (cropWidth.value * i / 3), offsetY + cropY.value)
    ctx.lineTo(offsetX + cropX.value + (cropWidth.value * i / 3), offsetY + cropY.value + cropHeight.value)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(offsetX + cropX.value, offsetY + cropY.value + (cropHeight.value * i / 3))
    ctx.lineTo(offsetX + cropX.value + cropWidth.value, offsetY + cropY.value + (cropHeight.value * i / 3))
    ctx.stroke()
  }
}

async function updatePreview() {
  if (!previewCanvasRef.value || !originalImage.value || !containerRef.value) return

  const preview = previewCanvasRef.value
  const ctx = preview.getContext('2d')
  if (!ctx) return

  const params = getDisplayParams()
  if (!params) return

  const { scale } = params
  const img = originalImage.value

  const actualCropX = cropX.value / scale
  const actualCropY = cropY.value / scale
  const actualCropWidth = cropWidth.value / scale
  const actualCropHeight = cropHeight.value / scale

  const previewScale = Math.min(300 / actualCropWidth, 200 / actualCropHeight)
  preview.width = actualCropWidth * previewScale
  preview.height = actualCropHeight * previewScale

  ctx.drawImage(
    img,
    actualCropX, actualCropY, actualCropWidth, actualCropHeight,
    0, 0, preview.width, preview.height
  )

  await calculateSize()
}

async function calculateSize() {
  const params = getDisplayParams()
  if (!params || !originalImage.value) return

  const { scale } = params
  const img = originalImage.value

  const tempCanvas = document.createElement('canvas')
  const ctx = tempCanvas.getContext('2d')
  if (!ctx) return

  const actualCropX = cropX.value / scale
  const actualCropY = cropY.value / scale
  const actualCropWidth = cropWidth.value / scale
  const actualCropHeight = cropHeight.value / scale

  tempCanvas.width = actualCropWidth
  tempCanvas.height = actualCropHeight

  ctx.drawImage(
    img,
    actualCropX, actualCropY, actualCropWidth, actualCropHeight,
    0, 0, actualCropWidth, actualCropHeight
  )

  const mimeType = outputFormat.value === 'png' ? 'image/png' :
                   outputFormat.value === 'webp' ? 'image/webp' : 'image/jpeg'
  const qualityValue = outputFormat.value === 'png' ? undefined : quality.value / 100

  tempCanvas.toBlob((blob) => {
    if (blob) {
      estimatedSize.value = blob.size
    }
  }, mimeType, qualityValue)
}

// Detect which handle or area the mouse is over
function getInteractionType(x: number, y: number): { type: string; cursor: string } {
  const params = getDisplayParams()
  if (!params) return { type: 'none', cursor: 'default' }

  const { offsetX, offsetY } = params
  const handleRadius = 12

  // Relative to image
  const rx = x - offsetX
  const ry = y - offsetY

  // Check corner handles
  const corners = [
    { x: cropX.value, y: cropY.value, name: 'nw', cursor: 'nwse-resize' },
    { x: cropX.value + cropWidth.value, y: cropY.value, name: 'ne', cursor: 'nesw-resize' },
    { x: cropX.value, y: cropY.value + cropHeight.value, name: 'sw', cursor: 'nesw-resize' },
    { x: cropX.value + cropWidth.value, y: cropY.value + cropHeight.value, name: 'se', cursor: 'nwse-resize' }
  ]

  for (const corner of corners) {
    const dist = Math.sqrt((rx - corner.x) ** 2 + (ry - corner.y) ** 2)
    if (dist < handleRadius) {
      return { type: corner.name, cursor: corner.cursor }
    }
  }

  // Check edge handles
  const edges = [
    { x: cropX.value + cropWidth.value / 2, y: cropY.value, name: 'n', cursor: 'ns-resize' },
    { x: cropX.value + cropWidth.value / 2, y: cropY.value + cropHeight.value, name: 's', cursor: 'ns-resize' },
    { x: cropX.value, y: cropY.value + cropHeight.value / 2, name: 'w', cursor: 'ew-resize' },
    { x: cropX.value + cropWidth.value, y: cropY.value + cropHeight.value / 2, name: 'e', cursor: 'ew-resize' }
  ]

  for (const edge of edges) {
    const dist = Math.sqrt((rx - edge.x) ** 2 + (ry - edge.y) ** 2)
    if (dist < handleRadius) {
      return { type: edge.name, cursor: edge.cursor }
    }
  }

  // Check if inside crop area
  if (
    rx >= cropX.value &&
    rx <= cropX.value + cropWidth.value &&
    ry >= cropY.value &&
    ry <= cropY.value + cropHeight.value
  ) {
    return { type: 'move', cursor: 'move' }
  }

  return { type: 'none', cursor: 'default' }
}

// Convert mouse coordinates to canvas coordinates (accounting for CSS scaling)
function getCanvasCoordinates(e: MouseEvent): { x: number; y: number } | null {
  if (!canvasRef.value) return null

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()

  // Scale factor between rendered size and internal canvas size
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function handleMouseDown(e: MouseEvent) {
  const coords = getCanvasCoordinates(e)
  if (!coords) return

  const { x, y } = coords
  const interaction = getInteractionType(x, y)

  if (interaction.type === 'move') {
    isDragging.value = true
    dragStartX.value = x
    dragStartY.value = y
    cropStartX.value = cropX.value
    cropStartY.value = cropY.value
  } else if (interaction.type !== 'none') {
    isResizing.value = true
    resizeHandle.value = interaction.type
    dragStartX.value = x
    dragStartY.value = y
    cropStartX.value = cropX.value
    cropStartY.value = cropY.value
    cropStartWidth.value = cropWidth.value
    cropStartHeight.value = cropHeight.value
  }
}

function handleMouseMove(e: MouseEvent) {
  const coords = getCanvasCoordinates(e)
  if (!coords) return

  const { x, y } = coords

  // Update cursor
  if (!isDragging.value && !isResizing.value) {
    const interaction = getInteractionType(x, y)
    currentCursor.value = interaction.cursor
  }

  if (!isDragging.value && !isResizing.value) return

  const params = getDisplayParams()
  if (!params) return

  const { displayWidth, displayHeight } = params

  const deltaX = x - dragStartX.value
  const deltaY = y - dragStartY.value

  if (isDragging.value) {
    cropX.value = Math.max(0, Math.min(displayWidth - cropWidth.value, cropStartX.value + deltaX))
    cropY.value = Math.max(0, Math.min(displayHeight - cropHeight.value, cropStartY.value + deltaY))
  } else if (isResizing.value) {
    let newX = cropStartX.value
    let newY = cropStartY.value
    let newWidth = cropStartWidth.value
    let newHeight = cropStartHeight.value

    const handle = resizeHandle.value

    // Handle horizontal resizing
    if (handle?.includes('e')) {
      newWidth = Math.max(50, cropStartWidth.value + deltaX)
    } else if (handle?.includes('w')) {
      const proposedWidth = cropStartWidth.value - deltaX
      if (proposedWidth >= 50) {
        newWidth = proposedWidth
        newX = cropStartX.value + deltaX
      }
    }

    // Handle vertical resizing
    if (handle?.includes('s')) {
      newHeight = Math.max(50, cropStartHeight.value + deltaY)
    } else if (handle?.includes('n')) {
      const proposedHeight = cropStartHeight.value - deltaY
      if (proposedHeight >= 50) {
        newHeight = proposedHeight
        newY = cropStartY.value + deltaY
      }
    }

    // Apply aspect ratio constraint if set
    if (props.aspectRatio && (handle?.length === 2)) {
      // Corner resize with aspect ratio
      const targetRatio = props.aspectRatio
      if (newWidth / newHeight > targetRatio) {
        newWidth = newHeight * targetRatio
      } else {
        newHeight = newWidth / targetRatio
      }
    }

    // Constrain to bounds
    newX = Math.max(0, newX)
    newY = Math.max(0, newY)
    if (newX + newWidth > displayWidth) newWidth = displayWidth - newX
    if (newY + newHeight > displayHeight) newHeight = displayHeight - newY

    cropX.value = newX
    cropY.value = newY
    cropWidth.value = newWidth
    cropHeight.value = newHeight
  }

  drawCanvas()
  updatePreview()
}

function handleMouseUp() {
  isDragging.value = false
  isResizing.value = false
  resizeHandle.value = null
}

watch([quality, outputFormat], () => {
  updatePreview()
})

async function save() {
  const params = getDisplayParams()
  if (!params || !originalImage.value) return

  isProcessing.value = true

  try {
    const { scale } = params
    const img = originalImage.value

    const actualCropX = cropX.value / scale
    const actualCropY = cropY.value / scale
    const actualCropWidth = cropWidth.value / scale
    const actualCropHeight = cropHeight.value / scale

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = actualCropWidth
    canvas.height = actualCropHeight

    ctx.drawImage(
      img,
      actualCropX, actualCropY, actualCropWidth, actualCropHeight,
      0, 0, actualCropWidth, actualCropHeight
    )

    const mimeType = outputFormat.value === 'png' ? 'image/png' :
                     outputFormat.value === 'webp' ? 'image/webp' : 'image/jpeg'
    const qualityValue = outputFormat.value === 'png' ? undefined : quality.value / 100

    canvas.toBlob((blob) => {
      if (blob) {
        emit('save', blob)
      }
      isProcessing.value = false
    }, mimeType, qualityValue)
  } catch (error) {
    console.error('Error saving image:', error)
    isProcessing.value = false
  }
}

const aspectRatios = [
  { label: 'Libre', value: null },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16/9 },
  { label: '4:3', value: 4/3 },
  { label: '3:2', value: 3/2 }
]

const outputFormats: Array<'jpeg' | 'png' | 'webp'> = ['jpeg', 'png', 'webp']

function setOutputFormat(fmt: 'jpeg' | 'png' | 'webp') {
  outputFormat.value = fmt
}

function setAspectRatio(ratio: number | null) {
  const params = getDisplayParams()
  if (!params) return

  const { displayWidth, displayHeight } = params

  if (ratio === null) return

  const centerX = cropX.value + cropWidth.value / 2
  const centerY = cropY.value + cropHeight.value / 2

  let newWidth: number
  let newHeight: number

  if (cropWidth.value / cropHeight.value > ratio) {
    newHeight = cropHeight.value
    newWidth = newHeight * ratio
  } else {
    newWidth = cropWidth.value
    newHeight = newWidth / ratio
  }

  if (newWidth > displayWidth) {
    newWidth = displayWidth
    newHeight = newWidth / ratio
  }
  if (newHeight > displayHeight) {
    newHeight = displayHeight
    newWidth = newHeight * ratio
  }

  cropWidth.value = newWidth
  cropHeight.value = newHeight
  cropX.value = Math.max(0, Math.min(displayWidth - newWidth, centerX - newWidth / 2))
  cropY.value = Math.max(0, Math.min(displayHeight - newHeight, centerY - newHeight / 2))

  drawCanvas()
  updatePreview()
}
</script>

<template>
  <div class="image-editor bg-gray-900 rounded-xl overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-400">Ratio:</span>
        <div class="flex gap-1">
          <button
            v-for="ar in aspectRatios"
            :key="ar.label"
            @click="setAspectRatio(ar.value)"
            class="px-2 py-1 text-xs rounded transition-colors cursor-pointer bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            {{ ar.label }}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="emit('cancel')"
          class="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          Annuler
        </button>
        <button
          @click="save"
          :disabled="isProcessing || !!sizeWarning"
          class="px-4 py-1.5 text-sm bg-ti-blue text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <font-awesome-icon v-if="isProcessing" icon="spinner" class="animate-spin" />
          Appliquer
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col lg:flex-row">
      <!-- Canvas area -->
      <div ref="containerRef" class="flex-1 p-4">
        <canvas
          ref="canvasRef"
          class="w-full rounded-lg block"
          :style="{ cursor: currentCursor, height: '400px' }"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        />
      </div>

      <!-- Sidebar -->
      <div class="w-full lg:w-72 bg-gray-800 p-4 space-y-6">
        <!-- Preview -->
        <div>
          <h4 class="text-sm font-medium text-white mb-2">Aperçu</h4>
          <div class="bg-gray-900 rounded-lg p-2 flex items-center justify-center min-h-[150px]">
            <canvas ref="previewCanvasRef" class="max-w-full max-h-[150px] rounded" />
          </div>
        </div>

        <!-- Format -->
        <div>
          <h4 class="text-sm font-medium text-white mb-2">Format</h4>
          <div class="flex gap-2">
            <button
              v-for="fmt in outputFormats"
              :key="fmt"
              @click="setOutputFormat(fmt)"
              class="px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer"
              :class="[
                outputFormat === fmt
                  ? 'bg-ti-blue text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]"
            >
              {{ fmt.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Quality -->
        <div v-if="outputFormat !== 'png'">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium text-white">Qualité</h4>
            <span class="text-sm text-gray-400">{{ quality }}%</span>
          </div>
          <input
            v-model="quality"
            type="range"
            min="10"
            max="100"
            step="5"
            class="w-full accent-ti-blue"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Compressé</span>
            <span>Original</span>
          </div>
        </div>

        <!-- File size -->
        <div>
          <h4 class="text-sm font-medium text-white mb-2">Taille estimée</h4>
          <div
            class="text-lg font-mono"
            :class="[sizeWarning ? 'text-red-400' : 'text-green-400']"
          >
            {{ formatSize(estimatedSize) }}
          </div>
          <div v-if="maxFileSize > 0" class="text-xs text-gray-500 mt-1">
            Maximum: {{ formatSize(maxFileSize) }}
          </div>
        </div>

        <!-- Warnings -->
        <div v-if="sizeWarning || qualityWarning" class="space-y-2">
          <div v-if="sizeWarning" class="p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <div class="flex items-start gap-2">
              <font-awesome-icon icon="circle-exclamation" class="text-red-400 mt-0.5" />
              <p class="text-sm text-red-300">{{ sizeWarning }}</p>
            </div>
          </div>
          <div v-if="qualityWarning" class="p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg">
            <div class="flex items-start gap-2">
              <font-awesome-icon icon="triangle-exclamation" class="text-yellow-400 mt-0.5" />
              <p class="text-sm text-yellow-300">{{ qualityWarning }}</p>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div class="text-xs text-gray-500 border-t border-gray-700 pt-4">
          <p class="font-medium mb-1 text-gray-400">Astuces:</p>
          <ul class="space-y-1">
            <li>- Glissez le centre pour déplacer</li>
            <li>- Tirez les coins pour redimensionner</li>
            <li>- Tirez les bords pour ajuster</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-editor {
  max-width: 100%;
  overflow: hidden;
}

canvas {
  display: block;
}

input[type="range"] {
  height: 6px;
  border-radius: 3px;
  background: #374151;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3695d8;
  cursor: pointer;
  border: 2px solid #fff;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3695d8;
  cursor: pointer;
  border: 2px solid #fff;
}
</style>
