<script setup lang="ts">
/**
 * Admin « Organisation » : arborescence secteurs → services → pôles.
 *
 * - Un seul chargement (secteurs + services avec compteurs calculés par le
 *   serveur) ; les actions mettent à jour l'état local ou rechargent une fois.
 * - Recherche (nom, sigle, code secteur, e-mail) et filtres : l'arbre est
 *   filtré et les secteurs concernés sont dépliés automatiquement.
 * - Réordonnancement (glisser-déposer ou boutons monter / descendre) :
 *   secteurs entre eux, services de premier niveau au sein d'un secteur,
 *   pôles au sein de leur service parent. Désactivé pendant un filtre.
 * - `?secteur=<id>` : déplie ce secteur et le fait défiler à l'écran.
 */
import { createReusableTemplate } from '@vueuse/core'
import type { SectorDisplay, SectorUsage } from '~/composables/useSectorsApi'
import type { ServiceDisplay } from '~/composables/useServicesApi'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const nuxtApp = useNuxtApp()
const { apiFetch } = useApi()
const { hasPermission } = usePermissions()

const {
  getAllSectors,
  getSectorUsage,
  deleteSector: apiDeleteSector,
  duplicateSector: apiDuplicateSector,
  toggleSectorActive: apiToggleSectorActive,
  reorderSectors: apiReorderSectors,
} = useSectorsApi()

const {
  getAllServices,
  toggleServiceActive: apiToggleServiceActive,
  reorderServices: apiReorderServices,
} = useServicesApi({ fallbackToMock: false })

const canEdit = computed(() => hasPermission('organization.edit'))

// ============================================================================
// Données
// ============================================================================

interface UserOption {
  id: string
  name: string
  active: boolean
}

const sectors = ref<SectorDisplay[]>([])
const services = ref<ServiceDisplay[]>([])
const users = ref<UserOption[]>([])

const isLoading = ref(true)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)
// Annonces pour les lecteurs d'écran (région aria-live)
const liveMessage = ref('')

function announce(message: string) {
  liveMessage.value = ''
  nextTick(() => {
    liveMessage.value = message
  })
}

function errorMessage(err: unknown, fallback: string): string {
  const e = err as { data?: { detail?: unknown }, message?: string }
  const detail = e?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const messages = detail
      .map(d => (d && typeof d === 'object' && 'msg' in d ? String((d as { msg: unknown }).msg) : ''))
      .filter(Boolean)
    if (messages.length) return messages.join(' ; ')
  }
  return fallback
}

async function loadSectors() {
  sectors.value = await getAllSectors({ withServicesCount: false, fallbackToMock: false })
}

async function loadAll(silent = false) {
  if (!silent) {
    isLoading.value = true
    loadError.value = null
  }
  try {
    const [sectorsData, servicesData] = await Promise.all([
      getAllSectors({ withServicesCount: false, fallbackToMock: false }),
      getAllServices(),
    ])
    sectors.value = sectorsData
    services.value = servicesData
  }
  catch (err) {
    console.error('Erreur de chargement de l\'organisation :', err)
    if (silent) actionError.value = errorMessage(err, 'Impossible de recharger l\'organisation.')
    else loadError.value = errorMessage(err, 'Impossible de charger l\'organisation.')
  }
  finally {
    if (!silent) isLoading.value = false
  }
}

// Comptes utilisateurs : noms des responsables + choix dans la modale secteur.
// Non bloquant (la permission users.view peut manquer).
async function loadUsers() {
  try {
    const response = await apiFetch<{
      items: Array<{
        id: string
        first_name: string
        last_name: string
        salutation: string | null
        active: boolean
      }>
    }>('/api/admin/users', { query: { limit: 500 } })
    users.value = response.items
      .map(user => ({
        id: user.id,
        name: [user.salutation, user.first_name, user.last_name].filter(Boolean).join(' '),
        active: user.active !== false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }
  catch (err) {
    console.warn('Responsables non résolus (liste des utilisateurs indisponible) :', err)
    users.value = []
  }
}

const usersById = computed(() => new Map(users.value.map(u => [u.id, u])))

// ============================================================================
// Arborescence
// ============================================================================

const NO_SECTOR = 'sans-secteur'

interface TreeNode {
  service: ServiceDisplay
  poles: ServiceDisplay[]
  // Service affiché uniquement pour situer des pôles qui correspondent au filtre
  context: boolean
}

interface TreeGroup {
  key: string
  sector: SectorDisplay | null
  nodes: TreeNode[]
  total: number
  polesTotal: number
}

const byOrder = (a: { display_order: number, name: string }, b: { display_order: number, name: string }) =>
  (a.display_order - b.display_order) || a.name.localeCompare(b.name, 'fr')

const orderedSectors = computed(() => [...sectors.value].sort(byOrder))

const polesCount = computed(() => {
  const counts = new Map<string, number>()
  for (const s of services.value) {
    if (s.parent_id) counts.set(s.parent_id, (counts.get(s.parent_id) || 0) + 1)
  }
  return counts
})

const fullTree = computed<TreeGroup[]>(() => {
  const sectorIds = new Set(sectors.value.map(s => s.id))
  const bySector = new Map<string, ServiceDisplay[]>()
  for (const s of services.value) {
    const key = s.sector_id && sectorIds.has(s.sector_id) ? s.sector_id : NO_SECTOR
    if (!bySector.has(key)) bySector.set(key, [])
    bySector.get(key)!.push(s)
  }

  const build = (key: string, sector: SectorDisplay | null): TreeGroup => {
    const list = bySector.get(key) ?? []
    const ids = new Set(list.map(s => s.id))
    const polesByParent = new Map<string, ServiceDisplay[]>()
    const top: ServiceDisplay[] = []
    for (const s of list) {
      // Un pôle dont le parent est absent du secteur reste au premier niveau
      if (s.parent_id && ids.has(s.parent_id)) {
        if (!polesByParent.has(s.parent_id)) polesByParent.set(s.parent_id, [])
        polesByParent.get(s.parent_id)!.push(s)
      }
      else {
        top.push(s)
      }
    }
    top.sort(byOrder)
    const nodes = top.map(service => ({
      service,
      poles: (polesByParent.get(service.id) ?? []).sort(byOrder),
      context: false,
    }))
    return {
      key,
      sector,
      nodes,
      total: list.length,
      polesTotal: nodes.reduce((n, node) => n + node.poles.length, 0),
    }
  }

  const groups = orderedSectors.value.map(sector => build(sector.id, sector))
  if (bySector.has(NO_SECTOR)) groups.push(build(NO_SECTOR, null))
  return groups
})

// ============================================================================
// Recherche et filtres
// ============================================================================

type StatusFilter = 'all' | 'active' | 'inactive'

const search = ref('')
const statusFilter = ref<StatusFilter>('all')
const headlessOnly = ref(false)

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

const query = computed(() => normalizeText(search.value.trim()))
const isFiltering = computed(() => !!query.value || statusFilter.value !== 'all' || headlessOnly.value)

function textMatch(...values: Array<string | null | undefined>): boolean {
  const q = query.value
  if (!q) return false
  return values.some(v => !!v && normalizeText(v).includes(q))
}

function flagsMatch(s: ServiceDisplay): boolean {
  if (statusFilter.value !== 'all' && (statusFilter.value === 'active') !== s.active) return false
  if (headlessOnly.value && s.head_external_id) return false
  return true
}

const visibleTree = computed<TreeGroup[]>(() => {
  if (!isFiltering.value) return fullTree.value
  const q = query.value
  const result: TreeGroup[] = []
  for (const group of fullTree.value) {
    const sectorText = !!q && !!group.sector && textMatch(group.sector.name, group.sector.code)
    const nodes: TreeNode[] = []
    for (const node of group.nodes) {
      const s = node.service
      const selfText = !q || sectorText || textMatch(s.name, s.sigle, s.email)
      const poles = node.poles.filter(p => flagsMatch(p) && (selfText || textMatch(p.name, p.sigle, p.email)))
      const selfVisible = selfText && flagsMatch(s)
      if (selfVisible || poles.length) nodes.push({ service: s, poles, context: !selfVisible })
    }
    // Un secteur sans service retenu reste affiché s'il correspond lui-même
    const sectorSelf = !!group.sector
      && !headlessOnly.value
      && (statusFilter.value === 'all' || (statusFilter.value === 'active') === group.sector.active)
      && (!q || sectorText)
    if (nodes.length || sectorSelf) {
      result.push({ ...group, nodes, polesTotal: nodes.reduce((n, node) => n + node.poles.length, 0) })
    }
  }
  return result
})

const visibleServicesCount = computed(() =>
  visibleTree.value.reduce(
    (n, g) => n + g.nodes.reduce((m, node) => m + (node.context ? 0 : 1) + node.poles.length, 0),
    0,
  ),
)

function resetFilters() {
  search.value = ''
  statusFilter.value = 'all'
  headlessOnly.value = false
}

const stats = computed(() => ({
  sectors: sectors.value.length,
  services: services.value.length,
  poles: services.value.filter(s => s.parent_id).length,
  headless: services.value.filter(s => !s.head_external_id).length,
  inactive: services.value.filter(s => !s.active).length,
}))

// Surlignage de la correspondance (insensible aux accents et à la casse)
function highlightParts(text: string, q: string): Array<{ text: string, match: boolean }> {
  if (!q || !text) return [{ text, match: false }]
  let normalized = ''
  const map: number[] = []
  for (let i = 0; i < text.length; i++) {
    const n = normalizeText(text[i]!)
    for (let k = 0; k < n.length; k++) {
      normalized += n[k]
      map.push(i)
    }
  }
  const parts: Array<{ text: string, match: boolean }> = []
  let cursor = 0
  let from = normalized.indexOf(q)
  while (from !== -1) {
    const start = map[from]!
    const end = map[from + q.length - 1]! + 1
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false })
    parts.push({ text: text.slice(start, end), match: true })
    cursor = end
    from = normalized.indexOf(q, from + q.length)
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })
  return parts
}

const Hl = defineComponent({
  name: 'OrgHighlight',
  props: { text: { type: String, default: '' } },
  setup(props) {
    return () => h(
      'span',
      highlightParts(props.text, query.value).map(part => part.match
        ? h('mark', { class: 'rounded-sm bg-amber-200 px-0.5 text-inherit dark:bg-amber-500/40' }, part.text)
        : part.text),
    )
  },
})

// ============================================================================
// Secteurs dépliés (mémorisés dans le navigateur)
// ============================================================================

const STORAGE_KEY = 'usenghor.admin.organisation.secteurs-deplies'
const expanded = ref(new Set<string>())
// Pendant un filtre, tout est déplié sauf ce que l'utilisateur replie
const filterCollapsed = ref(new Set<string>())

watch([query, statusFilter, headlessOnly], () => {
  filterCollapsed.value = new Set()
})

function persistExpanded() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded.value]))
  }
  catch {
    // Stockage indisponible (navigation privée, etc.) : sans conséquence
  }
}

function restoreExpanded() {
  const keys = fullTree.value.map(g => g.key)
  let stored: string[] | null = null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) stored = parsed.filter((k): k is string => typeof k === 'string')
    }
  }
  catch {
    stored = null
  }
  expanded.value = stored
    ? new Set(stored.filter(k => keys.includes(k)))
    : new Set(keys.length <= 3 ? keys : keys.slice(0, 1))
}

function isExpanded(key: string): boolean {
  return isFiltering.value ? !filterCollapsed.value.has(key) : expanded.value.has(key)
}

function setExpanded(key: string, open: boolean) {
  if (isFiltering.value) {
    const next = new Set(filterCollapsed.value)
    if (open) next.delete(key)
    else next.add(key)
    filterCollapsed.value = next
    return
  }
  const next = new Set(expanded.value)
  if (open) next.add(key)
  else next.delete(key)
  expanded.value = next
  persistExpanded()
}

function toggleExpanded(key: string) {
  setExpanded(key, !isExpanded(key))
}

function expandAll() {
  if (isFiltering.value) {
    filterCollapsed.value = new Set()
    return
  }
  expanded.value = new Set(fullTree.value.map(g => g.key))
  persistExpanded()
}

function collapseAll() {
  if (isFiltering.value) {
    filterCollapsed.value = new Set(visibleTree.value.map(g => g.key))
    return
  }
  expanded.value = new Set()
  persistExpanded()
}

// ============================================================================
// Mise en évidence d'un secteur (?secteur=<id>, création, duplication)
// ============================================================================

const highlightedKey = ref<string | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | null = null

function scrollToElement(el: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lenis = nuxtApp.$lenis as unknown as { scrollTo?: (target: HTMLElement, options: Record<string, unknown>) => void } | undefined
  if (lenis?.scrollTo) lenis.scrollTo(el, { offset: -88, immediate: reduced, force: true })
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

async function revealSector(key: string) {
  if (!fullTree.value.some(g => g.key === key)) return
  if (isFiltering.value) resetFilters()
  setExpanded(key, true)
  await nextTick()
  const el = document.getElementById(`secteur-${key}`)
  if (el) scrollToElement(el)
  highlightedKey.value = key
  if (highlightTimer) clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => {
    highlightedKey.value = null
  }, 2500)
}

function focusSectorFromQuery() {
  const key = route.query.secteur
  if (typeof key === 'string' && key) revealSector(key)
}

watch(() => route.query.secteur, () => {
  if (!isLoading.value) focusSectorFromQuery()
})

// ============================================================================
// Menu « ⋯ » des secteurs
// ============================================================================

const openMenuKey = ref<string | null>(null)

function toggleMenu(key: string) {
  openMenuKey.value = openMenuKey.value === key ? null : key
}

function closeMenu(event?: KeyboardEvent) {
  openMenuKey.value = null
  const root = (event?.currentTarget as HTMLElement | null)
  root?.querySelector<HTMLButtonElement>('[data-menu-trigger]')?.focus()
}

function onDocumentClick(event: MouseEvent) {
  if (!openMenuKey.value) return
  const target = event.target as HTMLElement | null
  if (target?.closest('[data-org-menu]')) return
  openMenuKey.value = null
}

// ============================================================================
// Actions sur les secteurs
// ============================================================================

const busy = ref(new Set<string>())

function setBusy(key: string, on: boolean) {
  const next = new Set(busy.value)
  if (on) next.add(key)
  else next.delete(key)
  busy.value = next
}

// Modale création / modification
const sectorModalOpen = ref(false)
const editingSector = ref<SectorDisplay | null>(null)

function openCreateSector() {
  editingSector.value = null
  sectorModalOpen.value = true
}

function openEditSector(sector: SectorDisplay) {
  editingSector.value = sector
  sectorModalOpen.value = true
}

function closeSectorModal() {
  sectorModalOpen.value = false
  editingSector.value = null
}

async function onSectorSaved(id: string, created: boolean) {
  closeSectorModal()
  try {
    await loadSectors()
  }
  catch (err) {
    actionError.value = errorMessage(err, 'Secteur enregistré, mais la liste n\'a pas pu être rechargée.')
  }
  announce(created ? 'Secteur créé.' : 'Secteur enregistré.')
  if (created) revealSector(id)
}

async function onDuplicateSector(sector: SectorDisplay) {
  openMenuKey.value = null
  const key = `sector:${sector.id}`
  setBusy(key, true)
  actionError.value = null
  try {
    // Code limité à 20 caractères : préfixe tronqué + suffixe aléatoire
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const newCode = `${sector.code.slice(0, 14)}-${suffix}`
    const res = await apiDuplicateSector(sector.id, newCode)
    await loadSectors()
    announce(`Secteur dupliqué (code ${newCode}).`)
    revealSector(res.id)
  }
  catch (err) {
    actionError.value = errorMessage(err, 'Erreur lors de la duplication du secteur.')
  }
  finally {
    setBusy(key, false)
  }
}

async function onToggleSector(sector: SectorDisplay) {
  openMenuKey.value = null
  const key = `sector:${sector.id}`
  setBusy(key, true)
  actionError.value = null
  try {
    const res = await apiToggleSectorActive(sector.id)
    sector.active = res.active
    announce(`Secteur « ${sector.name} » ${res.active ? 'activé' : 'désactivé'}.`)
  }
  catch (err) {
    actionError.value = errorMessage(err, 'Erreur lors du changement de statut du secteur.')
  }
  finally {
    setBusy(key, false)
  }
}

// Suppression (bloquée tant que le secteur contient des services : la
// suppression d'un secteur supprime ses services en cascade)
const deletingSector = ref<SectorDisplay | null>(null)
const sectorUsage = ref<SectorUsage | null>(null)
const usageLoading = ref(false)
const usageError = ref<string | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

const deletingLocalCount = computed(() =>
  deletingSector.value ? services.value.filter(s => s.sector_id === deletingSector.value!.id).length : 0,
)

const blockingServicesCount = computed(() =>
  Math.max(sectorUsage.value?.services_count ?? 0, deletingLocalCount.value),
)

const canDeleteSector = computed(() =>
  !!deletingSector.value
  && !!sectorUsage.value
  && sectorUsage.value.can_delete
  && blockingServicesCount.value === 0
  && !isDeleting.value,
)

async function openDeleteSector(sector: SectorDisplay) {
  openMenuKey.value = null
  deletingSector.value = sector
  sectorUsage.value = null
  usageError.value = null
  deleteError.value = null
  usageLoading.value = true
  try {
    sectorUsage.value = await getSectorUsage(sector.id)
  }
  catch (err) {
    usageError.value = errorMessage(err, 'Impossible de vérifier le contenu du secteur. Réessayez plus tard.')
  }
  finally {
    usageLoading.value = false
  }
}

function closeDeleteSector() {
  if (isDeleting.value) return
  deletingSector.value = null
  sectorUsage.value = null
}

async function confirmDeleteSector() {
  const sector = deletingSector.value
  if (!sector || !canDeleteSector.value) return
  isDeleting.value = true
  deleteError.value = null
  try {
    await apiDeleteSector(sector.id)
    sectors.value = sectors.value.filter(s => s.id !== sector.id)
    if (expanded.value.has(sector.id)) {
      const next = new Set(expanded.value)
      next.delete(sector.id)
      expanded.value = next
      persistExpanded()
    }
    isDeleting.value = false
    closeDeleteSector()
    announce(`Secteur « ${sector.name} » supprimé.`)
  }
  catch (err) {
    deleteError.value = errorMessage(err, 'Erreur lors de la suppression du secteur.')
  }
  finally {
    isDeleting.value = false
  }
}

// ============================================================================
// Actions sur les services
// ============================================================================

// Désactivation d'un service qui a des pôles : confirmation préalable
const confirmDeactivate = ref<ServiceDisplay | null>(null)

function onToggleService(service: ServiceDisplay) {
  if (service.active && (polesCount.value.get(service.id) ?? 0) > 0) {
    confirmDeactivate.value = service
    return
  }
  doToggleService(service)
}

async function doToggleService(service: ServiceDisplay) {
  confirmDeactivate.value = null
  const key = `service:${service.id}`
  setBusy(key, true)
  actionError.value = null
  try {
    const res = await apiToggleServiceActive(service.id)
    service.active = res.active
    announce(`« ${service.name} » est maintenant ${res.active ? 'actif' : 'inactif'}.`)
  }
  catch (err) {
    actionError.value = errorMessage(err, 'Erreur lors du changement de statut du service.')
  }
  finally {
    setBusy(key, false)
  }
}

// Focus initial des boîtes de dialogue (Échap les ferme depuis ce focus)
let focusBeforeDialog: HTMLElement | null = null
watch(
  () => !!deletingSector.value || !!confirmDeactivate.value,
  (open) => {
    if (!import.meta.client) return
    if (open) {
      focusBeforeDialog = document.activeElement as HTMLElement | null
      nextTick(() => document.querySelector<HTMLElement>('[data-dialog-initial-focus]')?.focus())
    }
    else {
      focusBeforeDialog?.focus?.()
      focusBeforeDialog = null
    }
  },
)

// ============================================================================
// Réordonnancement (glisser-déposer + clavier)
// ============================================================================
// Portées : 'sectors' | 'sector:<clé du secteur>' (services de premier niveau)
// | 'parent:<id du service>' (pôles). L'API attribue display_order = rang
// dans la liste d'IDs envoyée : on envoie la liste complète de la portée.

const canReorder = computed(() => canEdit.value && !isFiltering.value)
const pendingReorders = ref(0)
let reorderChain: Promise<void> = Promise.resolve()

function scopeItems(scope: string): Array<SectorDisplay | ServiceDisplay> {
  if (scope === 'sectors') return orderedSectors.value
  if (scope.startsWith('sector:')) {
    const key = scope.slice('sector:'.length)
    return fullTree.value.find(g => g.key === key)?.nodes.map(n => n.service) ?? []
  }
  if (scope.startsWith('parent:')) {
    const parentId = scope.slice('parent:'.length)
    for (const group of fullTree.value) {
      const node = group.nodes.find(n => n.service.id === parentId)
      if (node) return node.poles
    }
  }
  return []
}

function persistOrder(scope: string, ids: string[]) {
  pendingReorders.value++
  // Enregistrements sérialisés : le dernier ordre local est aussi le dernier envoyé
  reorderChain = reorderChain.then(async () => {
    try {
      if (scope === 'sectors') await apiReorderSectors(ids)
      else await apiReorderServices(ids)
    }
    catch (err) {
      actionError.value = errorMessage(err, 'Erreur lors du réordonnancement : l\'ordre affiché a été rechargé.')
      await loadAll(true)
    }
    finally {
      pendingReorders.value--
    }
  })
}

function moveItem(scope: string, id: string, targetIndex: number): boolean {
  if (!canReorder.value) return false
  const items = [...scopeItems(scope)]
  const from = items.findIndex(i => i.id === id)
  if (from < 0 || targetIndex < 0 || targetIndex >= items.length || from === targetIndex) return false
  const [moved] = items.splice(from, 1)
  items.splice(targetIndex, 0, moved!)
  // Mise à jour locale immédiate (même règle que l'API)
  items.forEach((item, index) => {
    item.display_order = index
  })
  persistOrder(scope, items.map(i => i.id))
  announce(`Position ${targetIndex + 1} sur ${items.length}.`)
  return true
}

function onMoveClick(scope: string, id: string, index: number, dir: 'up' | 'down') {
  if (!moveItem(scope, id, index + (dir === 'up' ? -1 : 1))) return
  // Le bouton a changé de place dans le DOM : lui rendre le focus
  nextTick(() => {
    const find = (d: string) => document.querySelector<HTMLButtonElement>(`[data-move="${scope}|${id}|${d}"]`)
    const btn = find(dir)
    if (btn && !btn.disabled) btn.focus()
    else find(dir === 'up' ? 'down' : 'up')?.focus()
  })
}

const dragging = ref<{ scope: string, id: string } | null>(null)
const dropTargetId = ref<string | null>(null)

function onDragStart(event: DragEvent, scope: string, id: string) {
  if (!canReorder.value) {
    event.preventDefault()
    return
  }
  dragging.value = { scope, id }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
    const row = (event.currentTarget as HTMLElement | null)?.closest<HTMLElement>('[data-drag-row]')
    if (row) event.dataTransfer.setDragImage(row, 24, 20)
  }
}

function onDragOver(event: DragEvent, scope: string, id: string) {
  if (!dragging.value || dragging.value.scope !== scope) return
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  dropTargetId.value = id
}

function onDragLeave(event: DragEvent, id: string) {
  const current = event.currentTarget as HTMLElement | null
  if (dropTargetId.value === id && !current?.contains(event.relatedTarget as Node | null)) {
    dropTargetId.value = null
  }
}

function onDrop(event: DragEvent, scope: string, id: string) {
  if (!dragging.value || dragging.value.scope !== scope) return
  event.preventDefault()
  event.stopPropagation()
  const sourceId = dragging.value.id
  dragging.value = null
  dropTargetId.value = null
  moveItem(scope, sourceId, scopeItems(scope).findIndex(i => i.id === id))
}

function onDragEnd() {
  dragging.value = null
  dropTargetId.value = null
}

function dropClasses(id: string) {
  if (!dragging.value) return ''
  if (dragging.value.id === id) return 'opacity-50'
  if (dropTargetId.value === id) return 'outline-dashed outline-2 outline-offset-[-2px] outline-brand-blue-400'
  return ''
}

// ============================================================================
// Présentation
// ============================================================================

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count > 1 ? pluralForm : singular}`
}

function badgeText(service: ServiceDisplay): string {
  if (service.sigle) return service.sigle.slice(0, 5)
  return service.name
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join('') || service.name.slice(0, 2).toUpperCase()
}

function headLabel(service: ServiceDisplay): string | null {
  if (!service.head_external_id) return null
  return usersById.value.get(service.head_external_id)?.name ?? null
}

function counters(service: ServiceDisplay) {
  return [
    { key: 'obj', value: service.objectives_count, short: 'obj', title: plural(service.objectives_count, 'objectif', 'objectifs') },
    { key: 'real', value: service.achievements_count, short: 'réal', title: plural(service.achievements_count, 'réalisation', 'réalisations') },
    { key: 'proj', value: service.projects_count, short: 'proj', title: plural(service.projects_count, 'projet', 'projets') },
    { key: 'team', value: service.team_count, short: 'pers.', title: plural(service.team_count, 'membre de l\'équipe', 'membres de l\'équipe') },
  ]
}

function serviceLink(service: ServiceDisplay) {
  return `/admin/organisation/services/${service.id}`
}

// Ligne de service réutilisée pour les services de premier niveau et les pôles
const [DefineServiceRow, ServiceRow] = createReusableTemplate<{
  service: ServiceDisplay
  pole: boolean
  scope: string
  index: number
  count: number
  context: boolean
  sectorId: string | null
}>({ inheritAttrs: false })

// ============================================================================
// Cycle de vie
// ============================================================================

onMounted(async () => {
  document.addEventListener('click', onDocumentClick)
  loadUsers()
  await loadAll()
  if (!loadError.value) {
    restoreExpanded()
    focusSectorFromQuery()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  if (highlightTimer) clearTimeout(highlightTimer)
})

async function retryLoad() {
  await loadAll()
  if (!loadError.value) {
    restoreExpanded()
    focusSectorFromQuery()
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Ligne de service (gabarit partagé services / pôles) -->
    <DefineServiceRow v-slot="{ service, pole, scope, index, count, context, sectorId }">
      <div
        data-drag-row
        class="group/row flex items-center gap-1.5 rounded-lg px-1.5 py-2 transition-colors hover:bg-gray-50 sm:gap-2 sm:px-2 dark:hover:bg-gray-700/40"
        :class="{ 'opacity-60': context }"
      >
        <!-- Réordonnancement : poignée (souris) + boutons (clavier) -->
        <div v-if="canReorder && count > 1" class="flex flex-shrink-0 items-center">
          <span
            draggable="true"
            class="hidden cursor-grab touch-none select-none rounded p-1 text-gray-300 hover:text-gray-500 active:cursor-grabbing sm:inline-flex dark:text-gray-600 dark:hover:text-gray-400"
            title="Glisser pour réordonner"
            aria-hidden="true"
            @dragstart="onDragStart($event, scope, service.id)"
            @dragend="onDragEnd"
          >
            <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-3.5 w-3.5" />
          </span>
          <span class="flex flex-col opacity-100 transition-opacity sm:opacity-0 sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100">
            <button
              type="button"
              class="rounded px-1 leading-none text-gray-400 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 disabled:invisible dark:hover:text-gray-200"
              :data-move="`${scope}|${service.id}|up`"
              :disabled="index === 0"
              :aria-label="`Monter « ${service.name} »`"
              @click="onMoveClick(scope, service.id, index, 'up')"
            >
              <font-awesome-icon :icon="['fas', 'caret-up']" class="h-3 w-3" />
            </button>
            <button
              type="button"
              class="rounded px-1 leading-none text-gray-400 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 disabled:invisible dark:hover:text-gray-200"
              :data-move="`${scope}|${service.id}|down`"
              :disabled="index === count - 1"
              :aria-label="`Descendre « ${service.name} »`"
              @click="onMoveClick(scope, service.id, index, 'down')"
            >
              <font-awesome-icon :icon="['fas', 'caret-down']" class="h-3 w-3" />
            </button>
          </span>
        </div>

        <!-- Lien principal vers la page du service -->
        <NuxtLink
          :to="serviceLink(service)"
          class="flex min-w-0 flex-1 items-center gap-3 rounded-md py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500"
        >
          <span
            class="flex flex-shrink-0 items-center justify-center rounded-lg font-bold tracking-tight"
            :class="[
              pole ? 'h-8 w-8 text-[10px]' : 'h-9 w-9 text-[11px]',
              service.color ? 'text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
              service.active ? '' : 'grayscale',
            ]"
            :style="service.color ? { backgroundColor: service.color } : undefined"
            aria-hidden="true"
          >
            {{ badgeText(service) }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex min-w-0 items-center gap-2">
              <span
                class="truncate text-sm font-medium"
                :class="service.active ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
              >
                <Hl :text="service.name" />
              </span>
              <span v-if="service.sigle && textMatch(service.sigle)" class="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                · <Hl :text="service.sigle" />
              </span>
              <span
                v-if="service.landing_path"
                class="flex-shrink-0 text-gray-400 dark:text-gray-500"
                :title="`Page dédiée : ${service.landing_path}`"
              >
                <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="h-3 w-3" />
                <span class="sr-only">(page dédiée {{ service.landing_path }})</span>
              </span>
            </span>
            <span class="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
              <span v-if="headLabel(service)" class="inline-flex min-w-0 items-center gap-1">
                <font-awesome-icon :icon="['fas', 'user-tie']" class="h-3 w-3 flex-shrink-0 text-gray-400" />
                <span class="truncate">{{ headLabel(service) }}</span>
              </span>
              <span v-else-if="service.head_external_id" class="inline-flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'user-tie']" class="h-3 w-3 text-gray-400" />
                Responsable défini
              </span>
              <span v-else class="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <font-awesome-icon :icon="['fas', 'user-slash']" class="h-3 w-3" />
                Sans responsable
              </span>
              <span v-if="service.email" class="min-w-0 truncate">
                <Hl :text="service.email" />
              </span>
              <!-- Compteurs repliés sous le nom sur petit écran -->
              <span class="lg:hidden">
                <template v-for="(c, ci) in counters(service)" :key="c.key">
                  <span v-if="ci > 0" aria-hidden="true"> · </span>
                  <span :class="c.value ? '' : 'text-gray-300 dark:text-gray-600'" :title="c.title">{{ c.value }} {{ c.short }}</span>
                </template>
              </span>
            </span>
          </span>
          <!-- Compteurs en colonne sur grand écran -->
          <span class="hidden flex-shrink-0 items-center gap-1 text-xs tabular-nums text-gray-500 lg:flex dark:text-gray-400">
            <template v-for="(c, ci) in counters(service)" :key="c.key">
              <span v-if="ci > 0" class="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
              <span :class="c.value ? '' : 'text-gray-300 dark:text-gray-600'" :title="c.title">
                {{ c.value }} {{ c.short }}<span class="sr-only"> ({{ c.title }})</span>
              </span>
            </template>
          </span>
        </NuxtLink>

        <!-- Statut basculable -->
        <button
          v-if="canEdit"
          type="button"
          role="switch"
          :aria-checked="service.active"
          :aria-label="`Service « ${service.name} » actif`"
          :disabled="busy.has(`service:${service.id}`)"
          class="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 disabled:cursor-wait disabled:opacity-60"
          :class="service.active
            ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'"
          @click="onToggleService(service)"
        >
          <font-awesome-icon
            :icon="['fas', busy.has(`service:${service.id}`) ? 'spinner' : service.active ? 'circle-check' : 'circle-pause']"
            class="h-3 w-3"
            :class="{ 'animate-spin': busy.has(`service:${service.id}`) }"
          />
          <span class="hidden sm:inline">{{ service.active ? 'Actif' : 'Inactif' }}</span>
        </button>
        <span
          v-else
          class="inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium"
          :class="service.active
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
        >
          {{ service.active ? 'Actif' : 'Inactif' }}
        </span>

        <!-- Ajouter un pôle (service de premier niveau uniquement) -->
        <NuxtLink
          v-if="canEdit && !pole && !service.parent_id && sectorId"
          :to="{ path: '/admin/organisation/services/nouveau', query: { secteur: sectorId, parent: service.id } }"
          class="inline-flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-brand-blue-50 hover:text-brand-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 dark:text-gray-400 dark:hover:bg-brand-blue-900/30 dark:hover:text-brand-blue-300"
          :title="`Ajouter un pôle à « ${service.name} »`"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="h-3 w-3" />
          <span class="hidden md:inline">pôle</span>
          <span class="sr-only md:hidden">Ajouter un pôle à « {{ service.name }} »</span>
        </NuxtLink>

        <!-- Flèche (doublon du lien principal, hors tabulation) -->
        <NuxtLink
          :to="serviceLink(service)"
          tabindex="-1"
          aria-hidden="true"
          class="hidden flex-shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:inline-flex dark:hover:bg-gray-700 dark:hover:text-gray-200"
        >
          <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3.5 w-3.5 rtl:-scale-x-100" />
        </NuxtLink>
      </div>
    </DefineServiceRow>

    <!-- Annonces pour lecteurs d'écran -->
    <p class="sr-only" aria-live="polite" role="status">
      {{ liveMessage }}
    </p>

    <!-- En-tête -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Organisation
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Secteurs, services et pôles de l'université : cliquez sur un service pour gérer sa présentation, son équipe, ses objectifs, réalisations, projets et médias.
        </p>
      </div>
      <button
        v-if="canEdit"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        @click="openCreateSector"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Secteur
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="space-y-3" aria-busy="true">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="h-[68px] animate-pulse rounded-lg bg-gray-200/70 dark:bg-gray-800" />
      </div>
      <div v-for="i in 3" :key="`s${i}`" class="h-16 animate-pulse rounded-xl bg-gray-200/70 dark:bg-gray-800" />
      <span class="sr-only">Chargement de l'organisation…</span>
    </div>

    <!-- Erreur bloquante -->
    <div
      v-else-if="loadError"
      class="rounded-xl border border-red-200 bg-white py-12 text-center dark:border-red-900/50 dark:bg-gray-800"
      role="alert"
    >
      <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="mb-3 h-10 w-10 text-red-400" />
      <p class="mb-4 text-gray-600 dark:text-gray-300">
        {{ loadError }}
      </p>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        @click="retryLoad"
      >
        <font-awesome-icon :icon="['fas', 'rotate-right']" class="h-4 w-4" />
        Réessayer
      </button>
    </div>

    <template v-else>
      <!-- Erreur non bloquante -->
      <div
        v-if="actionError"
        role="alert"
        class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
      >
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span class="flex-1">{{ actionError }}</span>
        <button type="button" class="text-xs font-medium underline hover:no-underline" @click="actionError = null">
          Fermer
        </button>
      </div>

      <!-- Chiffres -->
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <font-awesome-icon :icon="['fas', 'building']" class="h-4 w-4 text-brand-blue-500 dark:text-brand-blue-400" />
          <div>
            <p class="text-xl font-bold leading-tight text-gray-900 dark:text-white">
              {{ stats.sectors }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ stats.sectors > 1 ? 'Secteurs' : 'Secteur' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <font-awesome-icon :icon="['fas', 'sitemap']" class="h-4 w-4 text-purple-500 dark:text-purple-400" />
          <div>
            <p class="text-xl font-bold leading-tight text-gray-900 dark:text-white">
              {{ stats.services }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ stats.services > 1 ? 'Services' : 'Service' }}<template v-if="stats.poles">, dont {{ plural(stats.poles, 'pôle', 'pôles') }}</template>
            </p>
          </div>
        </div>
        <button
          type="button"
          :aria-pressed="headlessOnly"
          :disabled="stats.headless === 0 && !headlessOnly"
          class="flex items-center gap-3 rounded-lg border px-4 py-3 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 disabled:cursor-default"
          :class="headlessOnly
            ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/20'
            : 'border-gray-200 bg-white enabled:hover:border-amber-300 enabled:hover:bg-amber-50/50 dark:border-gray-700 dark:bg-gray-800 dark:enabled:hover:border-amber-700 dark:enabled:hover:bg-amber-900/10'"
          :title="headlessOnly ? 'Retirer ce filtre' : 'Afficher uniquement les services sans responsable'"
          @click="headlessOnly = !headlessOnly"
        >
          <font-awesome-icon :icon="['fas', 'user-slash']" class="h-4 w-4 text-amber-500" />
          <span>
            <span class="block text-xl font-bold leading-tight text-gray-900 dark:text-white">{{ stats.headless }}</span>
            <span class="block text-xs text-gray-500 dark:text-gray-400">Sans responsable</span>
          </span>
          <font-awesome-icon v-if="headlessOnly" :icon="['fas', 'filter']" class="ms-auto h-3 w-3 text-amber-600 dark:text-amber-400" />
        </button>
        <button
          type="button"
          :aria-pressed="statusFilter === 'inactive'"
          :disabled="stats.inactive === 0 && statusFilter !== 'inactive'"
          class="flex items-center gap-3 rounded-lg border px-4 py-3 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 disabled:cursor-default"
          :class="statusFilter === 'inactive'
            ? 'border-gray-400 bg-gray-100 dark:border-gray-500 dark:bg-gray-700/60'
            : 'border-gray-200 bg-white enabled:hover:border-gray-300 enabled:hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:enabled:hover:bg-gray-700/40'"
          :title="statusFilter === 'inactive' ? 'Retirer ce filtre' : 'Afficher uniquement les services inactifs'"
          @click="statusFilter = statusFilter === 'inactive' ? 'all' : 'inactive'"
        >
          <font-awesome-icon :icon="['fas', 'circle-pause']" class="h-4 w-4 text-gray-400" />
          <span>
            <span class="block text-xl font-bold leading-tight text-gray-900 dark:text-white">{{ stats.inactive }}</span>
            <span class="block text-xs text-gray-500 dark:text-gray-400">{{ stats.inactive > 1 ? 'Services inactifs' : 'Service inactif' }}</span>
          </span>
          <font-awesome-icon v-if="statusFilter === 'inactive'" :icon="['fas', 'filter']" class="ms-auto h-3 w-3 text-gray-500" />
        </button>
      </div>

      <!-- Aucun secteur -->
      <div
        v-if="fullTree.length === 0"
        class="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-gray-600 dark:bg-gray-800"
      >
        <font-awesome-icon :icon="['fas', 'sitemap']" class="mb-4 h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p class="font-medium text-gray-900 dark:text-white">
          Aucun secteur pour l'instant
        </p>
        <p class="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
          Les secteurs regroupent les services de l'université. Créez un premier secteur pour y ajouter des services.
        </p>
        <button
          v-if="canEdit"
          type="button"
          class="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700"
          @click="openCreateSector"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
          Créer le premier secteur
        </button>
      </div>

      <template v-else>
        <!-- Barre d'outils -->
        <div class="space-y-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex flex-col gap-3 md:flex-row md:items-center">
            <div class="relative flex-1">
              <label for="org-search" class="sr-only">Rechercher un secteur ou un service</label>
              <font-awesome-icon
                :icon="['fas', 'magnifying-glass']"
                class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
              <input
                id="org-search"
                v-model="search"
                type="search"
                autocomplete="off"
                placeholder="Rechercher : nom, sigle, code secteur, e-mail…"
                class="w-full rounded-lg border border-gray-300 bg-white py-2 pe-9 ps-10 text-sm text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              >
              <button
                v-if="search"
                type="button"
                class="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Effacer la recherche"
                @click="search = ''"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" class="h-4 w-4" />
              </button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <label for="org-status" class="sr-only">Statut des services</label>
              <select
                id="org-status"
                v-model="statusFilter"
                class="rounded-lg border border-gray-300 bg-white py-2 pe-8 ps-3 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">
                  Tous les statuts
                </option>
                <option value="active">
                  Actifs
                </option>
                <option value="inactive">
                  Inactifs
                </option>
              </select>
              <div class="flex items-center rounded-lg border border-gray-200 dark:border-gray-600">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-s-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="expandAll"
                >
                  <font-awesome-icon :icon="['fas', 'angles-down']" class="h-3 w-3" />
                  Tout déplier
                </button>
                <span class="h-5 w-px bg-gray-200 dark:bg-gray-600" aria-hidden="true" />
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-e-lg px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="collapseAll"
                >
                  <font-awesome-icon :icon="['fas', 'angles-up']" class="h-3 w-3" />
                  Tout replier
                </button>
              </div>
            </div>
          </div>

          <!-- Résumé du filtre / aide au réordonnancement -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <template v-if="isFiltering">
              <span role="status">
                {{ plural(visibleServicesCount, 'service correspond', 'services correspondent') }}
                dans {{ plural(visibleTree.length, 'secteur', 'secteurs') }}.
              </span>
              <button type="button" class="font-medium text-brand-red-600 hover:underline dark:text-brand-red-400" @click="resetFilters">
                Réinitialiser
              </button>
              <span v-if="canEdit" class="inline-flex items-center gap-1.5">
                <font-awesome-icon :icon="['fas', 'circle-info']" class="h-3 w-3" />
                Le réordonnancement est désactivé pendant une recherche ou un filtre.
              </span>
            </template>
            <span v-else-if="canEdit" class="inline-flex items-center gap-1.5">
              <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-3 w-3" />
              Glissez la poignée ou utilisez les flèches pour réordonner les secteurs, les services d'un secteur et les pôles d'un service.
            </span>
            <span v-if="pendingReorders > 0" class="inline-flex items-center gap-1.5 text-brand-blue-600 dark:text-brand-blue-400">
              <font-awesome-icon :icon="['fas', 'spinner']" class="h-3 w-3 animate-spin" />
              Enregistrement de l'ordre…
            </span>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div
          v-if="visibleTree.length === 0"
          class="rounded-xl border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800"
        >
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p class="text-gray-600 dark:text-gray-300">
            Aucun secteur ni service ne correspond.
          </p>
          <button type="button" class="mt-2 text-sm font-medium text-brand-red-600 hover:underline dark:text-brand-red-400" @click="resetFilters">
            Réinitialiser la recherche et les filtres
          </button>
        </div>

        <!-- Arborescence -->
        <div v-else class="space-y-3">
          <section
            v-for="(group, gIndex) in visibleTree"
            :id="`secteur-${group.key}`"
            :key="group.key"
            class="scroll-mt-24 rounded-xl border bg-white transition-shadow dark:bg-gray-800"
            :class="[
              highlightedKey === group.key
                ? 'border-brand-blue-400 ring-2 ring-brand-blue-300 dark:border-brand-blue-500 dark:ring-brand-blue-700'
                : 'border-gray-200 dark:border-gray-700',
              group.sector ? dropClasses(group.key) : '',
            ]"
            :aria-label="group.sector ? `Secteur ${group.sector.name}` : 'Services sans secteur'"
            @dragover="group.sector && onDragOver($event, 'sectors', group.key)"
            @dragleave="onDragLeave($event, group.key)"
            @drop="group.sector && onDrop($event, 'sectors', group.key)"
          >
            <!-- Ligne du secteur -->
            <div data-drag-row class="group/row flex items-center gap-1.5 px-2 py-2.5 sm:gap-2 sm:px-3">
              <div v-if="group.sector && canReorder && orderedSectors.length > 1" class="flex flex-shrink-0 items-center">
                <span
                  draggable="true"
                  class="hidden cursor-grab touch-none select-none rounded p-1 text-gray-300 hover:text-gray-500 active:cursor-grabbing sm:inline-flex dark:text-gray-600 dark:hover:text-gray-400"
                  title="Glisser pour réordonner les secteurs"
                  aria-hidden="true"
                  @dragstart="onDragStart($event, 'sectors', group.key)"
                  @dragend="onDragEnd"
                >
                  <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-4 w-4" />
                </span>
                <span class="flex flex-col opacity-100 transition-opacity sm:opacity-0 sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100">
                  <button
                    type="button"
                    class="rounded px-1 leading-none text-gray-400 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 disabled:invisible dark:hover:text-gray-200"
                    :data-move="`sectors|${group.key}|up`"
                    :disabled="gIndex === 0"
                    :aria-label="`Monter le secteur « ${group.sector.name} »`"
                    @click="onMoveClick('sectors', group.key, gIndex, 'up')"
                  >
                    <font-awesome-icon :icon="['fas', 'caret-up']" class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    class="rounded px-1 leading-none text-gray-400 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 disabled:invisible dark:hover:text-gray-200"
                    :data-move="`sectors|${group.key}|down`"
                    :disabled="gIndex === orderedSectors.length - 1"
                    :aria-label="`Descendre le secteur « ${group.sector.name} »`"
                    @click="onMoveClick('sectors', group.key, gIndex, 'down')"
                  >
                    <font-awesome-icon :icon="['fas', 'caret-down']" class="h-3 w-3" />
                  </button>
                </span>
              </div>

              <h2 class="flex min-w-0 flex-1">
                <button
                  type="button"
                  class="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500"
                  :aria-expanded="isExpanded(group.key)"
                  :aria-controls="`secteur-${group.key}-services`"
                  @click="toggleExpanded(group.key)"
                >
                  <font-awesome-icon
                    :icon="['fas', 'chevron-right']"
                    class="h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform rtl:-scale-x-100"
                    :class="{ 'rotate-90': isExpanded(group.key) }"
                  />
                  <span class="min-w-0">
                    <span class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        class="truncate text-base font-semibold"
                        :class="!group.sector || group.sector.active ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'"
                      >
                        <Hl v-if="group.sector" :text="group.sector.name" />
                        <template v-else>Sans secteur</template>
                      </span>
                      <code
                        v-if="group.sector"
                        class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      ><Hl :text="group.sector.code" /></code>
                    </span>
                    <span class="mt-0.5 block text-xs font-normal text-gray-500 dark:text-gray-400">
                      <template v-if="!group.sector">Services non rattachés à un secteur · </template>
                      <template v-if="isFiltering">
                        {{ group.nodes.filter(n => !n.context).length + group.polesTotal }} / {{ plural(group.total, 'service', 'services') }}
                      </template>
                      <template v-else>
                        {{ plural(group.total, 'service', 'services') }}<template v-if="group.polesTotal">, dont {{ plural(group.polesTotal, 'pôle', 'pôles') }}</template>
                      </template>
                    </span>
                  </span>
                </button>
              </h2>

              <span
                v-if="group.sector"
                class="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                :class="group.sector.active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
              >
                <font-awesome-icon
                  :icon="['fas', busy.has(`sector:${group.key}`) ? 'spinner' : group.sector.active ? 'circle-check' : 'circle-pause']"
                  class="h-3 w-3"
                  :class="{ 'animate-spin': busy.has(`sector:${group.key}`) }"
                />
                <span class="hidden sm:inline">{{ group.sector.active ? 'Actif' : 'Inactif' }}</span>
                <span class="sr-only sm:hidden">{{ group.sector.active ? 'Actif' : 'Inactif' }}</span>
              </span>

              <template v-if="group.sector && canEdit">
                <button
                  type="button"
                  class="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-brand-blue-50 hover:text-brand-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 dark:hover:bg-brand-blue-900/30 dark:hover:text-brand-blue-400"
                  :aria-label="`Modifier le secteur « ${group.sector.name} »`"
                  title="Modifier le secteur"
                  @click="openEditSector(group.sector)"
                >
                  <font-awesome-icon :icon="['fas', 'pen']" class="h-3.5 w-3.5" />
                </button>
                <div class="relative flex-shrink-0" data-org-menu @keydown.esc="closeMenu($event)">
                  <button
                    type="button"
                    data-menu-trigger
                    class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    aria-haspopup="menu"
                    :aria-expanded="openMenuKey === group.key"
                    :aria-label="`Autres actions pour le secteur « ${group.sector.name} »`"
                    @click="toggleMenu(group.key)"
                  >
                    <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" class="h-4 w-4" />
                  </button>
                  <div
                    v-if="openMenuKey === group.key"
                    role="menu"
                    class="absolute end-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      class="flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                      @click="onDuplicateSector(group.sector)"
                    >
                      <font-awesome-icon :icon="['fas', 'copy']" class="h-3.5 w-3.5 text-gray-400" />
                      Dupliquer
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      class="flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                      @click="onToggleSector(group.sector)"
                    >
                      <font-awesome-icon :icon="['fas', group.sector.active ? 'circle-pause' : 'circle-check']" class="h-3.5 w-3.5 text-gray-400" />
                      {{ group.sector.active ? 'Désactiver' : 'Activer' }}
                    </button>
                    <div class="my-1 border-t border-gray-100 dark:border-gray-700" role="separator" />
                    <button
                      type="button"
                      role="menuitem"
                      class="flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none dark:text-red-400 dark:hover:bg-red-900/20 dark:focus:bg-red-900/20"
                      @click="openDeleteSector(group.sector)"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" class="h-3.5 w-3.5" />
                      Supprimer…
                    </button>
                  </div>
                </div>
              </template>
            </div>

            <!-- Services du secteur -->
            <div
              v-show="isExpanded(group.key)"
              :id="`secteur-${group.key}-services`"
              class="border-t border-gray-100 dark:border-gray-700"
            >
              <ul v-if="group.nodes.length" class="divide-y divide-gray-100 px-1.5 py-1.5 sm:px-2 dark:divide-gray-700/60">
                <li
                  v-for="(node, nIndex) in group.nodes"
                  :key="node.service.id"
                  class="rounded-lg"
                  :class="dropClasses(node.service.id)"
                  @dragover="onDragOver($event, `sector:${group.key}`, node.service.id)"
                  @dragleave="onDragLeave($event, node.service.id)"
                  @drop="onDrop($event, `sector:${group.key}`, node.service.id)"
                >
                  <ServiceRow
                    :service="node.service"
                    :pole="false"
                    :scope="`sector:${group.key}`"
                    :index="nIndex"
                    :count="group.nodes.length"
                    :context="node.context"
                    :sector-id="group.sector?.id ?? null"
                  />
                  <!-- Pôles du service -->
                  <ul
                    v-if="node.poles.length"
                    class="mb-2 ms-5 space-y-0.5 border-s-2 ps-1.5 sm:ms-9 sm:ps-2"
                    :class="node.service.color ? '' : 'border-gray-200 dark:border-gray-600'"
                    :style="node.service.color ? { borderColor: `${node.service.color}66` } : undefined"
                    :aria-label="`Pôles de « ${node.service.name} »`"
                  >
                    <li
                      v-for="(pole, pIndex) in node.poles"
                      :key="pole.id"
                      class="rounded-lg"
                      :class="dropClasses(pole.id)"
                      @dragover="onDragOver($event, `parent:${node.service.id}`, pole.id)"
                      @dragleave="onDragLeave($event, pole.id)"
                      @drop="onDrop($event, `parent:${node.service.id}`, pole.id)"
                    >
                      <ServiceRow
                        :service="pole"
                        :pole="true"
                        :scope="`parent:${node.service.id}`"
                        :index="pIndex"
                        :count="node.poles.length"
                        :context="false"
                        :sector-id="group.sector?.id ?? null"
                      />
                    </li>
                  </ul>
                </li>
              </ul>
              <p v-else class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ isFiltering ? 'Aucun service de ce secteur ne correspond.' : 'Aucun service dans ce secteur pour l\'instant.' }}
              </p>
              <div v-if="canEdit && group.sector" class="border-t border-gray-100 px-3 py-2 dark:border-gray-700">
                <NuxtLink
                  :to="{ path: '/admin/organisation/services/nouveau', query: { secteur: group.sector.id } }"
                  class="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-brand-blue-600 transition-colors hover:bg-brand-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 dark:text-brand-blue-400 dark:hover:bg-brand-blue-900/20"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" class="h-3.5 w-3.5" />
                  Ajouter un service dans ce secteur
                </NuxtLink>
              </div>
            </div>
          </section>
        </div>
      </template>
    </template>

    <!-- Modale secteur (création / modification) -->
    <AdminOrganisationSectorFormModal
      :open="sectorModalOpen"
      :sector="editingSector"
      :head-candidates="users"
      @close="closeSectorModal"
      @saved="onSectorSaved"
    />

    <!-- Modale de suppression d'un secteur -->
    <Teleport to="body">
      <div
        v-if="deletingSector"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteSector"
        @keydown.esc="closeDeleteSector"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="org-delete-title"
          class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800"
        >
          <div class="p-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 id="org-delete-title" class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le secteur
            </h3>
            <p class="mb-4 text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer <strong class="text-gray-900 dark:text-white">{{ deletingSector.name }}</strong> ?
            </p>

            <p v-if="usageLoading" class="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              Vérification du contenu du secteur…
            </p>

            <div
              v-else-if="usageError"
              class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-start text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              {{ usageError }}
            </div>

            <div
              v-else-if="blockingServicesCount > 0 || (sectorUsage && !sectorUsage.can_delete)"
              class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-start dark:border-amber-800 dark:bg-amber-900/20"
            >
              <div class="flex items-start gap-2">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div class="text-sm">
                  <p class="font-medium text-amber-800 dark:text-amber-200">
                    Ce secteur ne peut pas être supprimé
                  </p>
                  <p class="mt-1 text-amber-700 dark:text-amber-300">
                    Il contient {{ plural(blockingServicesCount, 'service', 'services') }}.
                    Veuillez d'abord supprimer les services ou les rattacher à un autre secteur.
                  </p>
                </div>
              </div>
            </div>

            <p v-if="deleteError" class="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {{ deleteError }}
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              data-dialog-initial-focus
              :disabled="isDeleting"
              @click="closeDeleteSector"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!canDeleteSector"
              @click="confirmDeleteSector"
            >
              <font-awesome-icon v-if="isDeleting" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirmation : désactiver un service qui a des pôles -->
    <Teleport to="body">
      <div
        v-if="confirmDeactivate"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="confirmDeactivate = null"
        @keydown.esc="confirmDeactivate = null"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="org-deactivate-title"
          aria-describedby="org-deactivate-desc"
          class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800"
        >
          <div class="p-6">
            <h3 id="org-deactivate-title" class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Désactiver « {{ confirmDeactivate.name }} » ?
            </h3>
            <p id="org-deactivate-desc" class="text-sm text-gray-600 dark:text-gray-300">
              Ce service a {{ plural(polesCount.get(confirmDeactivate.id) ?? 0, 'pôle', 'pôles') }}.
              Tant qu'il reste inactif, ses pôles n'apparaissent plus sur le site public, même s'ils sont actifs.
            </p>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              data-dialog-initial-focus
              @click="confirmDeactivate = null"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              @click="doToggleService(confirmDeactivate)"
            >
              Désactiver
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
