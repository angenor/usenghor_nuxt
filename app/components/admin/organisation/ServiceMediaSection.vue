<script setup lang="ts">
/**
 * Onglet « Médias » de la fiche admin d'un service.
 *
 * Un service possède une LISTE d'albums (table `service_media_library`) et,
 * éventuellement, un « album principal » (colonne `services.album_external_id`).
 *
 * Côté public (`/a-propos/organisation/service/[slug]`, onglet « Médiathèque »,
 * et `/entrepreneuriat/ressources` pour le pôle PEI) : on affiche les albums
 * de la liste qui sont publiés et contiennent au moins un média ; l'album
 * principal n'est utilisé qu'en repli, lorsque la liste est vide.
 *
 * Émet `count` (nombre d'albums de la liste) et `update:primaryAlbumId`.
 */
import type { AlbumRead, AlbumWithMedia } from '~/composables/useAlbumsApi'
import type { MediaRead, PublicationStatus } from '~/types/api'

const props = defineProps<{
  serviceId: string
  primaryAlbumId: string | null
}>()

const emit = defineEmits<{
  'count': [value: number]
  'update:primaryAlbumId': [value: string | null]
}>()

const { getServiceAlbums, addAlbumToService, removeAlbumFromService, updateService } = useServicesApi()
const { getAlbumById, listAlbums } = useAlbumsApi()
const { getMediaUrl } = useMediaApi()

// ============================================================================
// Types locaux
// ============================================================================

interface AlbumCard {
  id: string
  title: string
  description: string | null
  status: PublicationStatus
  mediaCount: number
  imageCount: number
  videoCount: number
  otherCount: number
  cover: string | null
}

/** `null` = album introuvable (supprimé) ou inaccessible. */
type AlbumDetails = AlbumCard | null

// ============================================================================
// État
// ============================================================================

const albumIds = ref<string[]>([])
const details = ref<Record<string, AlbumDetails>>({})
const brokenCovers = ref<Set<string>>(new Set())
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const primaryId = ref<string | null>(props.primaryAlbumId)
const busyAlbumId = ref<string | null>(null)

watch(() => props.primaryAlbumId, async (value) => {
  primaryId.value = value
  if (value && !(value in details.value)) await fetchDetails([value])
})

const feedback = ref<{ type: 'success' | 'error'; text: string } | null>(null)
let feedbackTimer: ReturnType<typeof setTimeout> | null = null

function showFeedback(type: 'success' | 'error', text: string) {
  feedback.value = { type, text }
  if (feedbackTimer) clearTimeout(feedbackTimer)
  if (type === 'success') {
    feedbackTimer = setTimeout(() => {
      feedback.value = null
    }, 4000)
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { data?: { detail?: unknown } })?.data?.detail
  if (typeof detail === 'string' && detail.trim()) return detail
  return fallback
}

function emitCount() {
  emit('count', albumIds.value.length)
}

// ============================================================================
// Chargement
// ============================================================================

function pickCover(items: MediaRead[]): string | null {
  const image = items.find(m => m.type === 'image')
  if (image) return getMediaUrl(image)
  const withThumb = items.find(m => !!m.thumbnail_url)
  return withThumb?.thumbnail_url ?? null
}

function toCard(album: AlbumWithMedia): AlbumCard {
  const items = album.media_items ?? []
  const imageCount = items.filter(m => m.type === 'image').length
  const videoCount = items.filter(m => m.type === 'video').length
  return {
    id: album.id,
    title: album.title,
    description: album.description,
    status: album.status,
    mediaCount: items.length,
    imageCount,
    videoCount,
    otherCount: items.length - imageCount - videoCount,
    cover: pickCover(items),
  }
}

async function fetchDetails(ids: string[]) {
  const missing = [...new Set(ids)].filter(id => id && !(id in details.value))
  if (missing.length === 0) return
  const results = await Promise.allSettled(missing.map(id => getAlbumById(id)))
  const next = { ...details.value }
  results.forEach((result, index) => {
    next[missing[index]!] = result.status === 'fulfilled' ? toCard(result.value) : null
  })
  details.value = next
}

async function loadAlbums(showSpinner = true) {
  if (showSpinner) isLoading.value = true
  loadError.value = null
  try {
    albumIds.value = await getServiceAlbums(props.serviceId)
    emitCount()
    await fetchDetails([...albumIds.value, ...(primaryId.value ? [primaryId.value] : [])])
  }
  catch (error) {
    console.error('Erreur lors du chargement des albums du service :', error)
    loadError.value = extractErrorMessage(error, 'Impossible de charger les albums du service.')
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => loadAlbums())

watch(() => props.serviceId, (next, previous) => {
  if (next && next !== previous) {
    details.value = {}
    loadAlbums()
  }
})

onBeforeUnmount(() => {
  if (feedbackTimer) clearTimeout(feedbackTimer)
  if (searchTimer) clearTimeout(searchTimer)
})

// ============================================================================
// Présentation
// ============================================================================

/** Album principal présent dans la liste ? */
const primaryInList = computed(() => !!primaryId.value && albumIds.value.includes(primaryId.value))

/** Album principal hérité : défini mais absent de la liste. */
const legacyPrimaryId = computed(() => (primaryId.value && !primaryInList.value ? primaryId.value : null))

/** Liste affichée : album principal en tête, puis l'ordre de l'API. */
const orderedIds = computed(() => {
  if (!primaryInList.value) return albumIds.value
  return [primaryId.value!, ...albumIds.value.filter(id => id !== primaryId.value)]
})

function albumTitle(id: string): string {
  return details.value[id]?.title || 'Album introuvable'
}

function coverUrl(card: AlbumDetails): string | null {
  if (!card?.cover || brokenCovers.value.has(card.id)) return null
  return card.cover
}

function markCoverBroken(id: string) {
  const next = new Set(brokenCovers.value)
  next.add(id)
  brokenCovers.value = next
}

const statusLabels: Record<PublicationStatus, string> = {
  published: 'Publié',
  draft: 'Brouillon',
  archived: 'Archivé',
}

const statusClasses: Record<PublicationStatus, string> = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  archived: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

function mediaSummary(card: AlbumCard): string {
  if (card.mediaCount === 0) return 'Aucun média'
  const parts: string[] = []
  if (card.imageCount) parts.push(`${card.imageCount} image${card.imageCount > 1 ? 's' : ''}`)
  if (card.videoCount) parts.push(`${card.videoCount} vidéo${card.videoCount > 1 ? 's' : ''}`)
  if (card.otherCount) parts.push(`${card.otherCount} autre${card.otherCount > 1 ? 's' : ''}`)
  return parts.join(' · ')
}

/**
 * Visibilité publique d'un album, selon la règle de la fiche publique :
 * albums de la liste publiés et non vides ; repli sur l'album principal
 * uniquement si la liste est vide.
 */
function publicVisibility(id: string): { visible: boolean; reason: string } {
  const card = details.value[id]
  if (!card) return { visible: false, reason: 'Album introuvable' }
  const inList = albumIds.value.includes(id)
  if (!inList && albumIds.value.length > 0) {
    return { visible: false, reason: 'Hors liste : non affiché tant que la liste contient des albums' }
  }
  if (card.status !== 'published') return { visible: false, reason: `Non visible : album ${statusLabels[card.status].toLowerCase()}` }
  if (card.mediaCount === 0) return { visible: false, reason: 'Non visible : album vide' }
  return { visible: true, reason: inList ? 'Visible sur la fiche publique' : 'Visible en repli (liste vide)' }
}

const visibleCount = computed(() => albumIds.value.filter(id => publicVisibility(id).visible).length)

// ============================================================================
// Album principal
// ============================================================================

async function setPrimary(id: string | null) {
  const previous = primaryId.value
  busyAlbumId.value = id ?? previous
  try {
    await updateService(props.serviceId, { album_external_id: id })
    primaryId.value = id
    emit('update:primaryAlbumId', id)
    showFeedback('success', id
      ? `« ${albumTitle(id)} » est désormais l'album principal.`
      : 'Le service n\'a plus d\'album principal.')
  }
  catch (error) {
    console.error('Erreur lors de la mise à jour de l\'album principal :', error)
    primaryId.value = previous
    showFeedback('error', extractErrorMessage(error, 'L\'album principal n\'a pas pu être modifié.'))
  }
  finally {
    busyAlbumId.value = null
  }
}

function togglePrimary(id: string) {
  setPrimary(primaryId.value === id ? null : id)
}

async function addLegacyPrimaryToList() {
  const id = legacyPrimaryId.value
  if (!id) return
  busyAlbumId.value = id
  try {
    await addAlbumToService(props.serviceId, id)
    albumIds.value = [...albumIds.value, id]
    emitCount()
    showFeedback('success', `« ${albumTitle(id)} » a été ajouté à la liste des albums.`)
  }
  catch (error) {
    console.error('Erreur lors de l\'ajout de l\'album principal à la liste :', error)
    showFeedback('error', extractErrorMessage(error, 'L\'album n\'a pas pu être ajouté à la liste.'))
  }
  finally {
    busyAlbumId.value = null
  }
}

// ============================================================================
// Modales : accessibilité (focus, Échap, piège de tabulation)
// ============================================================================

let lastFocused: HTMLElement | null = null

function rememberFocus() {
  lastFocused = (document.activeElement as HTMLElement | null) ?? null
}

function restoreFocus() {
  const target = lastFocused
  lastFocused = null
  nextTick(() => target?.focus?.())
}

function trapTab(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== 'Tab' || !container) return
  const focusables = Array.from(container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter(el => el.offsetParent !== null)
  if (focusables.length === 0) return
  const first = focusables[0]!
  const last = focusables[focusables.length - 1]!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// ============================================================================
// Modale d'ajout (sélection multiple)
// ============================================================================

const showAddModal = ref(false)
const addDialogEl = ref<HTMLElement | null>(null)
const albumSearchInput = ref<HTMLInputElement | null>(null)
const albumQuery = ref('')
const albumResults = ref<AlbumRead[]>([])
const albumTotal = ref(0)
const isSearchingAlbums = ref(false)
const albumSearchError = ref<string | null>(null)
const selectedToAdd = ref<string[]>([])
const selectedTitles = ref<Record<string, string>>({})
const isAdding = ref(false)
const addError = ref<string | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null
let searchToken = 0

const SEARCH_LIMIT = 50

async function runAlbumSearch(query: string) {
  const token = ++searchToken
  isSearchingAlbums.value = true
  albumSearchError.value = null
  try {
    const response = await listAlbums({ search: query.trim() || null, limit: SEARCH_LIMIT })
    if (token !== searchToken) return
    albumResults.value = response.items
    albumTotal.value = response.total
  }
  catch (error) {
    if (token !== searchToken) return
    console.error('Erreur lors de la recherche d\'albums :', error)
    albumResults.value = []
    albumSearchError.value = extractErrorMessage(error, 'La recherche d\'albums a échoué.')
  }
  finally {
    if (token === searchToken) isSearchingAlbums.value = false
  }
}

watch(albumQuery, (query) => {
  if (!showAddModal.value) return
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => runAlbumSearch(query), 250)
})

async function openAddModal() {
  rememberFocus()
  albumQuery.value = ''
  selectedToAdd.value = []
  selectedTitles.value = {}
  addError.value = null
  showAddModal.value = true
  runAlbumSearch('')
  await nextTick()
  albumSearchInput.value?.focus()
}

function closeAddModal() {
  if (isAdding.value) return
  showAddModal.value = false
  restoreFocus()
}

function toggleSelection(album: AlbumRead) {
  if (albumIds.value.includes(album.id)) return
  if (selectedToAdd.value.includes(album.id)) {
    selectedToAdd.value = selectedToAdd.value.filter(id => id !== album.id)
  }
  else {
    selectedToAdd.value = [...selectedToAdd.value, album.id]
    selectedTitles.value = { ...selectedTitles.value, [album.id]: album.title }
  }
}

async function confirmAdd() {
  if (selectedToAdd.value.length === 0) return
  isAdding.value = true
  addError.value = null
  const added: string[] = []
  const failed: string[] = []
  // Séquentiel : évite les écritures concurrentes sur la même liaison
  for (const id of selectedToAdd.value) {
    try {
      await addAlbumToService(props.serviceId, id)
      added.push(id)
    }
    catch (error) {
      console.error(`Erreur lors de l'ajout de l'album ${id} :`, error)
      failed.push(id)
    }
  }
  if (added.length > 0) {
    albumIds.value = [...albumIds.value, ...added.filter(id => !albumIds.value.includes(id))]
    emitCount()
    await fetchDetails(added)
  }
  isAdding.value = false
  if (failed.length === 0) {
    showAddModal.value = false
    restoreFocus()
    showFeedback('success', added.length > 1
      ? `${added.length} albums ont été ajoutés au service.`
      : `« ${selectedTitles.value[added[0]!] ?? albumTitle(added[0]!)} » a été ajouté au service.`)
  }
  else {
    // Garde uniquement les albums en échec sélectionnés pour réessayer
    selectedToAdd.value = failed
    addError.value = added.length > 0
      ? `${added.length} album(s) ajouté(s), mais ${failed.length} n'ont pas pu l'être : ${failed.map(id => selectedTitles.value[id] ?? id).join(', ')}.`
      : 'Aucun album n\'a pu être ajouté. Veuillez réessayer.'
  }
}

function onAddDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeAddModal()
    return
  }
  trapTab(event, addDialogEl.value)
}

// ============================================================================
// Modale de retrait
// ============================================================================

const removingId = ref<string | null>(null)
const removeDialogEl = ref<HTMLElement | null>(null)
const removeCancelButton = ref<HTMLButtonElement | null>(null)
const addButton = ref<HTMLButtonElement | null>(null)
const alsoClearPrimary = ref(true)
const isRemoving = ref(false)
const removeError = ref<string | null>(null)

const removingIsPrimary = computed(() => !!removingId.value && removingId.value === primaryId.value)

async function openRemoveModal(id: string) {
  rememberFocus()
  removingId.value = id
  alsoClearPrimary.value = true
  removeError.value = null
  await nextTick()
  removeCancelButton.value?.focus()
}

function closeRemoveModal() {
  if (isRemoving.value) return
  removingId.value = null
  restoreFocus()
}

async function confirmRemove() {
  const id = removingId.value
  if (!id) return
  const title = albumTitle(id)
  const clearPrimary = removingIsPrimary.value && alsoClearPrimary.value
  isRemoving.value = true
  removeError.value = null
  try {
    await removeAlbumFromService(props.serviceId, id)
    albumIds.value = albumIds.value.filter(a => a !== id)
    emitCount()
  }
  catch (error) {
    console.error('Erreur lors du retrait de l\'album :', error)
    removeError.value = extractErrorMessage(error, 'Le retrait a échoué. Veuillez réessayer.')
    isRemoving.value = false
    return
  }

  let primaryWarning = ''
  if (clearPrimary) {
    try {
      await updateService(props.serviceId, { album_external_id: null })
      primaryId.value = null
      emit('update:primaryAlbumId', null)
    }
    catch (error) {
      console.error('Erreur lors du retrait du statut d\'album principal :', error)
      primaryWarning = ' Attention : il reste défini comme album principal (la mise à jour a échoué).'
    }
  }

  isRemoving.value = false
  removingId.value = null
  // La carte d'origine a disparu : on replace le focus sur le bouton d'ajout
  lastFocused = null
  nextTick(() => addButton.value?.focus())
  showFeedback(primaryWarning ? 'error' : 'success', `« ${title} » a été retiré de la liste.${primaryWarning}`)
}

function onRemoveDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeRemoveModal()
    return
  }
  trapTab(event, removeDialogEl.value)
}
</script>

<template>
  <section aria-labelledby="service-media-title" class="space-y-4">
    <!-- En-tête -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 id="service-media-title" class="text-lg font-semibold text-gray-900 dark:text-white">
          Albums du service
        </h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <template v-if="!isLoading && albumIds.length > 0">
            {{ albumIds.length }} album{{ albumIds.length > 1 ? 's' : '' }}
            · {{ visibleCount }} visible{{ visibleCount > 1 ? 's' : '' }} publiquement
          </template>
          <template v-else>
            Photos, vidéos et documents présentés sur la fiche publique du service.
          </template>
        </p>
      </div>
      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <NuxtLink
          to="/admin/mediatheque"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <font-awesome-icon :icon="['fas', 'photo-film']" class="h-4 w-4" aria-hidden="true" />
          Médiathèque
        </NuxtLink>
        <button
          ref="addButton"
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-gray-900"
          :disabled="isLoading"
          @click="openAddModal"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
          Ajouter des albums
        </button>
      </div>
    </div>

    <!-- Aide : ce que voit le public -->
    <div class="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
      <font-awesome-icon :icon="['fas', 'circle-info']" class="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
      <div class="space-y-1">
        <p>
          <strong>Ce que voit le public :</strong> l'onglet « Médiathèque » de la fiche du service présente
          les albums de cette liste qui sont <strong>publiés</strong> et contiennent <strong>au moins un média</strong>.
          L'onglet est masqué si aucun album ne remplit ces conditions.
        </p>
        <p>
          <font-awesome-icon :icon="['fas', 'star']" class="h-3 w-3 text-amber-500" aria-hidden="true" />
          L'<strong>album principal</strong> sert de repli : il n'est affiché que lorsque la liste est vide.
          Il ne modifie pas l'ordre d'affichage public.
        </p>
      </div>
    </div>

    <!-- Bandeau de retour -->
    <div aria-live="polite" role="status">
      <div
        v-if="feedback"
        class="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
        :class="feedback.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'"
      >
        <font-awesome-icon
          :icon="['fas', feedback.type === 'success' ? 'circle-check' : 'triangle-exclamation']"
          class="mt-0.5 h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <p class="flex-1">{{ feedback.text }}</p>
        <button
          type="button"
          class="rounded p-0.5 opacity-70 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label="Fermer le message"
          @click="feedback = null"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <!-- Chargement -->
    <div
      v-if="isLoading"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Chargement des albums"
    >
      <div v-for="i in 3" :key="i" class="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="aspect-video bg-gray-200 dark:bg-gray-700" />
        <div class="space-y-2 p-4">
          <div class="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-700/60" />
        </div>
      </div>
    </div>

    <!-- Erreur de chargement -->
    <div
      v-else-if="loadError"
      class="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
      role="alert"
    >
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="mb-3 h-8 w-8 text-red-500" aria-hidden="true" />
      <p class="text-sm text-red-800 dark:text-red-300">{{ loadError }}</p>
      <button
        type="button"
        class="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/40"
        @click="loadAlbums()"
      >
        <font-awesome-icon :icon="['fas', 'rotate-right']" class="h-4 w-4" aria-hidden="true" />
        Réessayer
      </button>
    </div>

    <template v-else>
      <!-- Album principal hérité (hors liste) -->
      <div
        v-if="legacyPrimaryId"
        class="flex flex-col gap-4 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20 sm:flex-row sm:items-center"
      >
        <div class="relative h-20 w-full shrink-0 overflow-hidden rounded-md bg-amber-100 dark:bg-amber-900/40 sm:w-32">
          <img
            v-if="coverUrl(details[legacyPrimaryId] ?? null)"
            :src="coverUrl(details[legacyPrimaryId] ?? null)!"
            alt=""
            class="h-full w-full object-cover"
            loading="lazy"
            @error="markCoverBroken(legacyPrimaryId!)"
          >
          <div v-else class="flex h-full w-full items-center justify-center">
            <font-awesome-icon :icon="['fas', 'photo-film']" class="h-6 w-6 text-amber-500" aria-hidden="true" />
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            <font-awesome-icon :icon="['fas', 'star']" class="h-3 w-3" aria-hidden="true" />
            Album principal hors liste
          </p>
          <p class="mt-1 truncate font-medium text-gray-900 dark:text-white">
            {{ albumTitle(legacyPrimaryId) }}
          </p>
          <p class="mt-1 text-sm text-amber-800 dark:text-amber-300">
            Cet album est défini comme principal mais ne fait pas partie de la liste.
            {{ albumIds.length > 0
              ? 'Il n\'est donc pas affiché publiquement.'
              : 'Il est affiché publiquement en repli, tant que la liste est vide.' }}
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">
          <button
            v-if="details[legacyPrimaryId]"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-gray-900"
            :disabled="busyAlbumId === legacyPrimaryId"
            @click="addLegacyPrimaryToList"
          >
            <font-awesome-icon
              :icon="['fas', busyAlbumId === legacyPrimaryId ? 'spinner' : 'plus']"
              :class="['h-4 w-4', { 'animate-spin': busyAlbumId === legacyPrimaryId }]"
              aria-hidden="true"
            />
            Ajouter à la liste
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-amber-400 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40"
            :disabled="busyAlbumId === legacyPrimaryId"
            @click="setPrimary(null)"
          >
            Retirer le statut principal
          </button>
        </div>
      </div>

      <!-- État vide -->
      <div
        v-if="albumIds.length === 0"
        class="rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-600 dark:bg-gray-800"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20">
          <font-awesome-icon :icon="['fas', 'images']" class="h-8 w-8 text-purple-500 dark:text-purple-400" aria-hidden="true" />
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          Donnez à voir la vie du service
        </h3>
        <p class="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          Associez des albums de la médiathèque (photos d'activités, vidéos, documents) : ils
          alimenteront l'onglet « Médiathèque » de la fiche publique.
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            @click="openAddModal"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
            Choisir des albums
          </button>
          <NuxtLink
            to="/admin/mediatheque"
            class="text-sm font-medium text-brand-red-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-brand-red-400"
          >
            Créer un album dans la médiathèque
          </NuxtLink>
        </div>
      </div>

      <!-- Cartes -->
      <ul v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Albums associés au service">
        <li
          v-for="id in orderedIds"
          :key="id"
          class="group flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md dark:bg-gray-800"
          :class="primaryId === id
            ? 'border-amber-400 ring-1 ring-amber-400 dark:border-amber-500 dark:ring-amber-500'
            : 'border-gray-200 dark:border-gray-700'"
        >
          <!-- Couverture -->
          <div class="relative aspect-video bg-gray-100 dark:bg-gray-700">
            <img
              v-if="coverUrl(details[id] ?? null)"
              :src="coverUrl(details[id] ?? null)!"
              alt=""
              class="h-full w-full object-cover"
              loading="lazy"
              @error="markCoverBroken(id)"
            >
            <div v-else class="flex h-full w-full items-center justify-center">
              <font-awesome-icon
                :icon="['fas', details[id] ? 'photo-film' : 'circle-question']"
                class="h-10 w-10 text-gray-300 dark:text-gray-500"
                aria-hidden="true"
              />
            </div>
            <span
              v-if="primaryId === id"
              class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white shadow"
            >
              <font-awesome-icon :icon="['fas', 'star']" class="h-3 w-3" aria-hidden="true" />
              Album principal
            </span>
            <span
              v-if="details[id]"
              class="absolute right-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shadow-sm"
              :class="statusClasses[details[id]!.status]"
            >
              {{ statusLabels[details[id]!.status] }}
            </span>
          </div>

          <!-- Contenu -->
          <div class="flex flex-1 flex-col gap-2 p-4">
            <h3 class="line-clamp-2 font-medium text-gray-900 dark:text-white">
              {{ albumTitle(id) }}
            </h3>
            <p v-if="details[id]" class="text-sm text-gray-500 dark:text-gray-400">
              {{ mediaSummary(details[id]!) }}
            </p>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              Cet album a peut-être été supprimé de la médiathèque.
            </p>
            <p
              class="mt-auto inline-flex items-center gap-1.5 text-xs"
              :class="publicVisibility(id).visible ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'"
            >
              <font-awesome-icon :icon="['fas', publicVisibility(id).visible ? 'eye' : 'eye-slash']" class="h-3 w-3" aria-hidden="true" />
              {{ publicVisibility(id).reason }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 border-t border-gray-100 px-2 py-2 dark:border-gray-700">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
              :class="primaryId === id
                ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
                : 'text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-amber-400'"
              :aria-pressed="primaryId === id"
              :aria-label="primaryId === id
                ? `Retirer le statut d'album principal de « ${albumTitle(id)} »`
                : `Définir « ${albumTitle(id)} » comme album principal`"
              :disabled="!details[id] || busyAlbumId !== null"
              @click="togglePrimary(id)"
            >
              <font-awesome-icon
                v-if="busyAlbumId === id"
                :icon="['fas', 'spinner']"
                class="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              <font-awesome-icon
                v-else
                :icon="[primaryId === id ? 'fas' : 'far', 'star']"
                class="h-4 w-4"
                aria-hidden="true"
              />
              <span class="hidden sm:inline">{{ primaryId === id ? 'Principal' : 'Définir principal' }}</span>
            </button>
            <NuxtLink
              v-if="details[id]"
              :to="`/admin/mediatheque/albums/${id}`"
              class="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
              :aria-label="`Gérer « ${albumTitle(id)} » dans la médiathèque`"
              title="Gérer dans la médiathèque"
            >
              <font-awesome-icon :icon="['fas', 'up-right-from-square']" class="h-3.5 w-3.5" aria-hidden="true" />
              <span class="hidden sm:inline">Gérer</span>
            </NuxtLink>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              :class="{ 'ml-auto': !details[id] }"
              :aria-label="`Retirer « ${albumTitle(id)} » de la liste`"
              title="Retirer de la liste"
              @click="openRemoveModal(id)"
            >
              <font-awesome-icon :icon="['fas', 'link-slash']" class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ul>
    </template>

    <!-- Modale d'ajout -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        @click.self="closeAddModal"
      >
        <div
          ref="addDialogEl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="media-add-title"
          aria-describedby="media-add-desc"
          class="flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-xl bg-white shadow-xl dark:bg-gray-800 sm:rounded-xl"
          @keydown="onAddDialogKeydown"
        >
          <div class="flex items-start justify-between gap-4 border-b border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h2 id="media-add-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                Ajouter des albums
              </h2>
              <p id="media-add-desc" class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Cochez un ou plusieurs albums de la médiathèque.
              </p>
            </div>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Fermer"
              :disabled="isAdding"
              @click="closeAddModal"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div class="border-b border-gray-200 p-4 dark:border-gray-700">
            <label for="media-album-search" class="sr-only">Rechercher un album</label>
            <div class="relative">
              <font-awesome-icon
                :icon="['fas', 'magnifying-glass']"
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="media-album-search"
                ref="albumSearchInput"
                v-model="albumQuery"
                type="search"
                autocomplete="off"
                placeholder="Rechercher un album par titre…"
                class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              >
            </div>
          </div>

          <div class="min-h-[12rem] flex-1 overflow-y-auto p-2" aria-live="polite" :aria-busy="isSearchingAlbums">
            <div v-if="isSearchingAlbums" class="flex items-center justify-center gap-2 py-10 text-sm text-gray-500 dark:text-gray-400">
              <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
              Chargement des albums…
            </div>
            <p v-else-if="albumSearchError" class="px-3 py-6 text-center text-sm text-red-600 dark:text-red-400" role="alert">
              {{ albumSearchError }}
            </p>
            <div v-else-if="albumResults.length === 0" class="px-3 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>{{ albumQuery ? `Aucun album ne correspond à « ${albumQuery} ».` : 'La médiathèque ne contient encore aucun album.' }}</p>
              <NuxtLink to="/admin/mediatheque" class="mt-2 inline-block font-medium text-brand-red-600 hover:underline dark:text-brand-red-400">
                Créer un album dans la médiathèque
              </NuxtLink>
            </div>
            <fieldset v-else>
              <legend class="sr-only">Albums disponibles</legend>
              <ul class="space-y-1">
                <li v-for="album in albumResults" :key="album.id">
                  <label
                    class="flex items-center gap-3 rounded-lg px-3 py-2"
                    :class="albumIds.includes(album.id)
                      ? 'cursor-not-allowed opacity-60'
                      : selectedToAdd.includes(album.id)
                        ? 'cursor-pointer bg-brand-red-50 dark:bg-brand-red-900/20'
                        : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                  >
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-brand-red-600 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700"
                      :checked="albumIds.includes(album.id) || selectedToAdd.includes(album.id)"
                      :disabled="albumIds.includes(album.id) || isAdding"
                      @change="toggleSelection(album)"
                    >
                    <span class="min-w-0 flex-1">
                      <span class="block truncate text-sm font-medium text-gray-900 dark:text-white">{{ album.title }}</span>
                      <span v-if="album.description" class="block truncate text-xs text-gray-500 dark:text-gray-400">{{ album.description }}</span>
                    </span>
                    <span
                      v-if="albumIds.includes(album.id)"
                      class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      Déjà dans la liste
                    </span>
                    <span
                      v-else
                      class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="statusClasses[album.status]"
                    >
                      {{ statusLabels[album.status] }}
                    </span>
                  </label>
                </li>
              </ul>
              <p v-if="albumTotal > albumResults.length" class="px-3 pt-3 text-xs text-gray-500 dark:text-gray-400">
                {{ albumResults.length }} albums affichés sur {{ albumTotal }} : affinez la recherche pour trouver les autres.
              </p>
            </fieldset>
          </div>

          <p v-if="addError" class="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300" role="alert">
            {{ addError }}
          </p>

          <div class="flex flex-col-reverse gap-3 border-t border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
              {{ selectedToAdd.length === 0
                ? 'Aucun album sélectionné'
                : `${selectedToAdd.length} album${selectedToAdd.length > 1 ? 's' : ''} sélectionné${selectedToAdd.length > 1 ? 's' : ''}` }}
            </p>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isAdding"
                @click="closeAddModal"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-800"
                :disabled="selectedToAdd.length === 0 || isAdding"
                @click="confirmAdd"
              >
                <font-awesome-icon v-if="isAdding" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
                {{ isAdding ? 'Ajout…' : 'Ajouter' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modale de retrait -->
    <Teleport to="body">
      <div
        v-if="removingId"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeRemoveModal"
      >
        <div
          ref="removeDialogEl"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="media-remove-title"
          aria-describedby="media-remove-desc"
          class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800"
          @keydown="onRemoveDialogKeydown"
        >
          <div class="p-6">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'link-slash']" class="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <h3 id="media-remove-title" class="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-white">
              Retirer cet album de la liste ?
            </h3>
            <p id="media-remove-desc" class="text-center text-sm text-gray-500 dark:text-gray-400">
              <strong class="text-gray-900 dark:text-white">« {{ albumTitle(removingId) }} »</strong>
              ne sera plus associé au service. L'album et ses médias restent dans la médiathèque.
            </p>

            <label
              v-if="removingIsPrimary"
              class="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20"
            >
              <input
                v-model="alsoClearPrimary"
                type="checkbox"
                class="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700"
              >
              <span class="text-sm">
                <span class="block font-medium text-amber-900 dark:text-amber-200">Retirer aussi son statut d'album principal</span>
                <span class="block text-amber-800 dark:text-amber-300">
                  Sinon, il restera album principal hors liste et sera affiché en repli si la liste devient vide.
                </span>
              </span>
            </label>

            <p v-if="removeError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300" role="alert">
              {{ removeError }}
            </p>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              ref="removeCancelButton"
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isRemoving"
              @click="closeRemoveModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-800"
              :disabled="isRemoving"
              @click="confirmRemove"
            >
              <font-awesome-icon v-if="isRemoving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
              {{ isRemoving ? 'Retrait…' : 'Retirer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
