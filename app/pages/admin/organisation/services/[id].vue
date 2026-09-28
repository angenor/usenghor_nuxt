<script setup lang="ts">
/**
 * Page complète d'un service (admin « Organisation »), à onglets :
 * Général | Présentation | Équipe | Objectifs | Réalisations | Projets | Médias.
 *
 * - Général et Présentation partagent un seul formulaire (`AdminOrganisationServiceForm`)
 *   et un seul bouton « Enregistrer » (PUT, champs du formulaire uniquement).
 * - Les autres onglets sont des sections autonomes qui enregistrent immédiatement
 *   et remontent leur nombre d'éléments via `count`.
 * - Onglet actif dans l'adresse : `?onglet=general|presentation|equipe|objectifs|realisations|projets|medias`.
 */
import { onClickOutside } from '@vueuse/core'
import type { ServiceDisplay, ServiceUsage, ServiceWithDetails } from '~/composables/useServicesApi'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const {
  getServiceById,
  getAllServices,
  getSectorsForSelect,
  getServiceUsage,
  deleteService,
  duplicateService,
  toggleServiceActive,
} = useServicesApi({ fallbackToMock: false })
const { getServiceUrl } = usePublicOrganizationApi()
const { hasPermission } = usePermissions()

const canEdit = computed(() => hasPermission('organization.edit'))

// ============================================================================
// Onglets
// ============================================================================

type TabKey = 'general' | 'presentation' | 'equipe' | 'objectifs' | 'realisations' | 'projets' | 'medias'
type CountKey = Exclude<TabKey, 'general' | 'presentation'>

const TAB_KEYS: TabKey[] = ['general', 'presentation', 'equipe', 'objectifs', 'realisations', 'projets', 'medias']
const FORM_TABS: TabKey[] = ['general', 'presentation']

const tabs: Array<{ key: TabKey, label: string, icon: string }> = [
  { key: 'general', label: 'Général', icon: 'info-circle' },
  { key: 'presentation', label: 'Présentation', icon: 'align-left' },
  { key: 'equipe', label: 'Équipe', icon: 'users' },
  { key: 'objectifs', label: 'Objectifs', icon: 'bullseye' },
  { key: 'realisations', label: 'Réalisations', icon: 'trophy' },
  { key: 'projets', label: 'Projets', icon: 'diagram-project' },
  { key: 'medias', label: 'Médias', icon: 'images' },
]

function parseTab(value: unknown): TabKey {
  const v = Array.isArray(value) ? value[0] : value
  return TAB_KEYS.includes(v as TabKey) ? v as TabKey : 'general'
}

const activeTab = ref<TabKey>(parseTab(route.query.onglet))
/** Sections déjà ouvertes : montées à la première visite, puis conservées. */
const visitedTabs = reactive(new Set<TabKey>([activeTab.value]))
const isFormTab = computed(() => FORM_TABS.includes(activeTab.value))

function setTab(key: TabKey) {
  if (activeTab.value === key) return
  activeTab.value = key
  visitedTabs.add(key)
  const query = { ...route.query }
  if (key === 'general') delete query.onglet
  else query.onglet = key
  router.replace({ query })
}

// Navigation arrière / avant dans l'historique
watch(() => route.query.onglet, (value) => {
  const key = parseTab(value)
  if (key !== activeTab.value) {
    activeTab.value = key
    visitedTabs.add(key)
  }
})

const counts = reactive<Record<CountKey, number | null>>({
  equipe: null,
  objectifs: null,
  realisations: null,
  projets: null,
  medias: null,
})

function setCount(key: CountKey, n: number) {
  counts[key] = n
}

/** Navigation clavier entre onglets (flèches, Début, Fin). */
function onTabKeydown(event: KeyboardEvent, index: number) {
  let next = -1
  if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
  else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = tabs.length - 1
  if (next < 0) return
  event.preventDefault()
  const key = tabs[next]!.key
  setTab(key)
  nextTick(() => document.getElementById(`service-tab-${key}`)?.focus())
}

// ============================================================================
// Chargement
// ============================================================================

const serviceId = computed(() => route.params.id as string)
const service = ref<ServiceWithDetails | null>(null)
const allServices = ref<ServiceDisplay[]>([])
const sectors = ref<Array<{ id: string, name: string, code: string }>>([])
const isLoading = ref(true)
const loadError = ref<'not-found' | 'error' | null>(null)
const pageError = ref<string | null>(null)

async function loadService(): Promise<boolean> {
  try {
    service.value = await getServiceById(serviceId.value)
    loadError.value = null
    return true
  }
  catch (err) {
    const status = (err as { status?: number, statusCode?: number })?.status
      ?? (err as { statusCode?: number })?.statusCode
    console.error('Erreur lors du chargement du service:', err)
    service.value = null
    loadError.value = status === 404 || status === 422 ? 'not-found' : 'error'
    return false
  }
}

async function loadServicesList() {
  try {
    allServices.value = await getAllServices()
  }
  catch (err) {
    console.error('Erreur chargement de la liste des services:', err)
  }
}

async function loadAll() {
  isLoading.value = true
  pageError.value = null
  const [found] = await Promise.all([
    loadService(),
    loadServicesList(),
    getSectorsForSelect().then(list => (sectors.value = list)).catch((err) => {
      console.error('Erreur chargement des secteurs:', err)
    }),
  ])
  if (found && service.value) {
    // Compteurs initiaux ; les sections les mettent à jour à leur montage
    counts.equipe = service.value.team?.length ?? 0
    counts.objectifs = service.value.objectives?.length ?? 0
    counts.realisations = service.value.achievements?.length ?? 0
    counts.projets = service.value.projects?.length ?? 0
    counts.medias = allServices.value.find(s => s.id === serviceId.value)?.albums_count ?? null
  }
  isLoading.value = false
}

// Message transmis par la page précédente (création, duplication)
const flash = useState<{ type: 'success' | 'info', text: string } | null>('admin-organisation-service-flash', () => null)
const notice = ref<{ type: 'success' | 'info' | 'error', text: string } | null>(null)
let noticeTimer: ReturnType<typeof setTimeout> | null = null

function showNotice(type: 'success' | 'info' | 'error', text: string, duration = 6000) {
  notice.value = { type, text }
  if (noticeTimer) clearTimeout(noticeTimer)
  if (type !== 'error') noticeTimer = setTimeout(() => (notice.value = null), duration)
}

function consumeFlash() {
  if (flash.value) {
    showNotice(flash.value.type, flash.value.text, 8000)
    flash.value = null
  }
}

onMounted(async () => {
  consumeFlash()
  await loadAll()
})

// Si Nuxt réutilise la page pour un autre service (lien vers un pôle, par exemple)
watch(serviceId, (id, old) => {
  if (!id || id === old) return
  isDirty.value = false
  visitedTabs.clear()
  activeTab.value = parseTab(route.query.onglet)
  visitedTabs.add(activeTab.value)
  for (const key of Object.keys(counts) as CountKey[]) counts[key] = null
  notice.value = null
  consumeFlash()
  loadAll()
})

onBeforeUnmount(() => {
  if (noticeTimer) clearTimeout(noticeTimer)
})

// ============================================================================
// Hiérarchie et fil d'Ariane
// ============================================================================

const sector = computed(() =>
  service.value?.sector_id ? sectors.value.find(s => s.id === service.value!.sector_id) || null : null,
)

const parentService = computed(() => {
  const parentId = service.value?.parent_id
  return parentId ? allServices.value.find(s => s.id === parentId) || null : null
})

const childServices = computed(() =>
  service.value
    ? allServices.value
        .filter(s => s.parent_id === service.value!.id)
        .sort((a, b) => (a.display_order - b.display_order) || a.name.localeCompare(b.name))
    : [],
)

const organisationLink = (sectorId?: string | null) =>
  sectorId ? `/admin/organisation?secteur=${sectorId}` : '/admin/organisation'

const backLink = computed(() => organisationLink(service.value?.sector_id))

const addPoleLink = computed(() => {
  if (!service.value) return ''
  const params = new URLSearchParams()
  if (service.value.sector_id) params.set('secteur', service.value.sector_id)
  params.set('parent', service.value.id)
  return `/admin/organisation/services/nouveau?${params.toString()}`
})

/** Fiche publique du service (celle que l'admin édite), même si une page dédiée existe. */
const publicUrl = computed(() => (service.value ? getServiceUrl({ name: service.value.name }) : ''))

// ============================================================================
// Formulaire (Général + Présentation)
// ============================================================================

interface ServiceFormHandle {
  save: () => Promise<boolean>
  isSaving: boolean
}
const formRef = ref<ServiceFormHandle | null>(null)
const isDirty = ref(false)
const isSaving = computed(() => formRef.value?.isSaving ?? false)

async function saveForm() {
  if (!formRef.value || !canEdit.value) return
  await formRef.value.save()
}

async function onSaved() {
  // Recharge le service : traductions remplies côté serveur, secteur / parent modifiés.
  // Un échec de rechargement ne doit pas masquer la page (l'enregistrement a réussi).
  await Promise.all([
    getServiceById(serviceId.value)
      .then(fresh => (service.value = fresh))
      .catch(err => console.error('Erreur lors du rechargement du service:', err)),
    loadServicesList(),
  ])
  isDirty.value = false
  showNotice('success', 'Modifications enregistrées.')
}

function onRequestTab(tab: 'general' | 'presentation') {
  setTab(tab)
}

// Raccourci Ctrl / Cmd + S sur les onglets du formulaire ; Échap ferme menu et modale
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (showDeleteModal.value) closeDeleteModal()
    showMenu.value = false
    return
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's' && isFormTab.value && service.value) {
    event.preventDefault()
    saveForm()
  }
}

// ============================================================================
// Garde « modifications non enregistrées »
// ============================================================================

const LEAVE_MESSAGE = 'Des modifications du service n\'ont pas été enregistrées. Quitter la page quand même ?'
let bypassLeaveGuard = false

function confirmLeave(): boolean {
  if (!isDirty.value || bypassLeaveGuard) return true
  return window.confirm(LEAVE_MESSAGE)
}

onBeforeRouteLeave(() => {
  if (!confirmLeave()) return false
})

onBeforeRouteUpdate((to, from) => {
  // Les changements d'onglet (requête seule) ne sont pas concernés
  if (to.path !== from.path && !confirmLeave()) return false
})

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (isDirty.value && !bypassLeaveGuard) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
  window.removeEventListener('keydown', onKeydown)
})

// ============================================================================
// Statut actif
// ============================================================================

const isToggling = ref(false)

async function toggleActive() {
  if (!service.value || !canEdit.value || isToggling.value) return
  isToggling.value = true
  try {
    const res = await toggleServiceActive(service.value.id)
    // Mutation en place : l'état du formulaire n'est pas réinitialisé
    service.value.active = res.active
    const item = allServices.value.find(s => s.id === service.value!.id)
    if (item) item.active = res.active
    showNotice('success', res.active ? 'Service activé : il est visible sur le site public.' : 'Service désactivé : il n\'apparaît plus sur le site public.')
  }
  catch (err) {
    console.error('Erreur lors du changement de statut:', err)
    const detail = (err as { data?: { detail?: unknown } })?.data?.detail
    showNotice('error', typeof detail === 'string' ? detail : 'Impossible de modifier le statut du service.')
  }
  finally {
    isToggling.value = false
  }
}

// ============================================================================
// Menu « ⋯ » : dupliquer, supprimer
// ============================================================================

const showMenu = ref(false)
const menuRef = ref<HTMLElement | null>(null)
onClickOutside(menuRef, () => (showMenu.value = false))

const isDuplicating = ref(false)

async function duplicateCurrent() {
  showMenu.value = false
  if (!service.value || !canEdit.value) return
  if (isDirty.value && !window.confirm('La copie reprend la dernière version enregistrée : vos modifications en cours ne seront pas copiées et seront perdues. Continuer ?')) {
    return
  }
  isDuplicating.value = true
  try {
    const newName = `${service.value.name} (copie)`
    const res = await duplicateService(service.value.id, newName)
    flash.value = { type: 'success', text: `Service dupliqué : vous modifiez maintenant « ${newName} ».` }
    bypassLeaveGuard = true
    await navigateTo(`/admin/organisation/services/${res.id}`)
  }
  catch (err) {
    console.error('Erreur lors de la duplication:', err)
    const detail = (err as { data?: { detail?: unknown } })?.data?.detail
    showNotice('error', typeof detail === 'string' ? detail : 'Impossible de dupliquer le service.')
  }
  finally {
    bypassLeaveGuard = false
    isDuplicating.value = false
  }
}

const showDeleteModal = ref(false)
const usage = ref<ServiceUsage | null>(null)
const isLoadingUsage = ref(false)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

async function openDeleteModal() {
  showMenu.value = false
  if (!service.value) return
  deleteError.value = null
  usage.value = null
  showDeleteModal.value = true
  isLoadingUsage.value = true
  try {
    usage.value = await getServiceUsage(service.value.id)
  }
  catch {
    deleteError.value = 'Impossible de vérifier le contenu du service. Réessayez avant de le supprimer.'
  }
  finally {
    isLoadingUsage.value = false
  }
}

function closeDeleteModal() {
  if (isDeleting.value) return
  showDeleteModal.value = false
}

async function confirmDelete() {
  // Sans vérification réussie, pas de suppression (elle part en cascade).
  if (!service.value || !usage.value || !usage.value.can_delete) return
  isDeleting.value = true
  deleteError.value = null
  const target = organisationLink(service.value.sector_id)
  try {
    await deleteService(service.value.id)
    bypassLeaveGuard = true
    showDeleteModal.value = false
    await navigateTo(target)
  }
  catch (err) {
    console.error('Erreur lors de la suppression:', err)
    const detail = (err as { data?: { detail?: unknown } })?.data?.detail
    deleteError.value = typeof detail === 'string' ? detail : 'Impossible de supprimer le service.'
  }
  finally {
    bypassLeaveGuard = false
    isDeleting.value = false
  }
}

// ============================================================================
// Médias : album principal géré par la section
// ============================================================================

function setPrimaryAlbum(albumId: string | null) {
  if (service.value) service.value.album_external_id = albumId
}

useHead(() => ({
  title: service.value ? `${service.value.name} · Organisation` : 'Service · Organisation',
}))
</script>

<template>
  <div>
    <!-- Chargement -->
    <div v-if="isLoading" class="flex min-h-[400px] items-center justify-center">
      <div class="text-center">
        <font-awesome-icon :icon="['fas', 'spinner']" class="mb-4 h-8 w-8 animate-spin text-brand-red-600" />
        <p class="text-gray-500 dark:text-gray-400">
          Chargement du service…
        </p>
      </div>
    </div>

    <!-- Service introuvable / erreur -->
    <div v-else-if="!service" class="flex flex-col items-center justify-center py-16 text-center">
      <font-awesome-icon
        :icon="['fas', loadError === 'not-found' ? 'sitemap' : 'exclamation-triangle']"
        class="h-16 w-16 text-gray-300 dark:text-gray-600"
      />
      <h1 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
        {{ loadError === 'not-found' ? 'Service introuvable' : 'Impossible de charger le service' }}
      </h1>
      <p class="mt-2 max-w-md text-gray-500 dark:text-gray-400">
        {{ loadError === 'not-found'
          ? 'Le service demandé n\'existe pas ou a été supprimé.'
          : 'Une erreur est survenue lors du chargement. Vérifiez votre connexion puis réessayez.' }}
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <button
          v-if="loadError === 'error'"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="loadAll"
        >
          <font-awesome-icon :icon="['fas', 'rotate-right']" class="h-4 w-4" />
          Réessayer
        </button>
        <NuxtLink
          to="/admin/organisation"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4 rtl:-scale-x-100" />
          Retour à l'organisation
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <!-- Fil d'Ariane -->
      <nav aria-label="Fil d'Ariane" class="mb-4">
        <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <NuxtLink to="/admin/organisation" class="hover:text-brand-red-600 hover:underline dark:hover:text-brand-red-400">
              Organisation
            </NuxtLink>
          </li>
          <template v-if="sector">
            <li aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3 rtl:-scale-x-100" />
            </li>
            <li>
              <NuxtLink :to="organisationLink(sector.id)" class="hover:text-brand-red-600 hover:underline dark:hover:text-brand-red-400">
                {{ sector.name }}
              </NuxtLink>
            </li>
          </template>
          <template v-if="service.parent_id">
            <li aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3 rtl:-scale-x-100" />
            </li>
            <li>
              <NuxtLink :to="`/admin/organisation/services/${service.parent_id}`" class="hover:text-brand-red-600 hover:underline dark:hover:text-brand-red-400">
                {{ parentService?.sigle || parentService?.name || 'Service parent' }}
              </NuxtLink>
            </li>
          </template>
          <li aria-hidden="true">
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3 rtl:-scale-x-100" />
          </li>
          <li aria-current="page" class="max-w-full truncate font-medium text-gray-900 dark:text-white">
            {{ service.name }}
          </li>
        </ol>
      </nav>

      <!-- En-tête -->
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex min-w-0 items-start gap-4">
          <NuxtLink
            :to="backLink"
            class="mt-1 flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="Retour à l'organisation"
            aria-label="Retour à l'organisation"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5 rtl:-scale-x-100" />
          </NuxtLink>
          <span
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            :class="service.color ? '' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'"
            :style="service.color ? { backgroundColor: service.color } : undefined"
            aria-hidden="true"
          >
            <template v-if="service.sigle">{{ service.sigle.slice(0, 5) }}</template>
            <font-awesome-icon v-else :icon="['fas', 'sitemap']" class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ service.name }}
              <span v-if="service.sigle" class="ms-1 text-base font-medium text-gray-400 dark:text-gray-500">({{ service.sigle }})</span>
            </h1>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed"
                :class="service.active
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'"
                :disabled="!canEdit || isToggling"
                :title="canEdit ? (service.active ? 'Cliquer pour désactiver le service' : 'Cliquer pour activer le service') : undefined"
                :aria-pressed="service.active"
                @click="toggleActive"
              >
                <font-awesome-icon
                  :icon="['fas', isToggling ? 'spinner' : (service.active ? 'check-circle' : 'pause-circle')]"
                  :class="{ 'animate-spin': isToggling }"
                  class="h-3 w-3"
                />
                {{ service.active ? 'Actif' : 'Inactif' }}
              </button>
              <NuxtLink
                v-if="parentService"
                :to="`/admin/organisation/services/${parentService.id}`"
                class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
              >
                <font-awesome-icon icon="fa-solid fa-turn-up" class="fa-rotate-90 h-3 w-3 rtl:-scale-x-100" />
                Pôle de {{ parentService.sigle || parentService.name }}
              </NuxtLink>
              <span
                v-if="childServices.length > 0"
                class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                <font-awesome-icon :icon="['fas', 'code-branch']" class="h-3 w-3" />
                {{ childServices.length }} pôle{{ childServices.length > 1 ? 's' : '' }}
              </span>
              <span
                v-if="service.landing_path"
                class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-mono text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                title="Page dédiée"
              >
                <font-awesome-icon :icon="['fas', 'link']" class="h-3 w-3" />
                {{ service.landing_path }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-shrink-0 flex-wrap items-center gap-2">
          <button
            v-if="isDirty"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            :class="isFormTab ? 'cursor-default' : 'hover:bg-amber-200 dark:hover:bg-amber-900/50'"
            :title="isFormTab ? undefined : 'Revenir à l\'onglet Général pour enregistrer'"
            role="status"
            @click="!isFormTab && setTab('general')"
          >
            <span class="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
            Modifications non enregistrées
          </button>
          <a
            :href="publicUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            :title="service.active ? 'Ouvrir la fiche publique dans un nouvel onglet' : 'Service inactif : la fiche publique n\'est pas accessible aux visiteurs'"
          >
            Voir sur le site
            <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="h-3 w-3" />
            <span class="sr-only">(nouvel onglet)</span>
          </a>

          <!-- Menu ⋯ -->
          <div v-if="canEdit" ref="menuRef" class="relative">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Autres actions"
              aria-haspopup="menu"
              :aria-expanded="showMenu"
              @click="showMenu = !showMenu"
            >
              <font-awesome-icon :icon="['fas', isDuplicating ? 'spinner' : 'ellipsis']" :class="{ 'animate-spin': isDuplicating }" class="h-4 w-4" />
            </button>
            <div
              v-if="showMenu"
              role="menu"
              class="absolute end-0 z-30 mt-2 w-60 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              @keydown.escape="showMenu = false"
            >
              <button
                type="button"
                role="menuitem"
                class="flex w-full items-center gap-3 px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                :disabled="isDuplicating"
                @click="duplicateCurrent"
              >
                <font-awesome-icon :icon="['fas', 'copy']" class="h-4 w-4 text-gray-400" />
                Dupliquer
              </button>
              <a
                v-if="service.landing_path"
                :href="service.landing_path"
                target="_blank"
                rel="noopener"
                role="menuitem"
                class="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                @click="showMenu = false"
              >
                <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="h-4 w-4 text-gray-400" />
                Ouvrir la page dédiée
              </a>
              <div class="my-1 border-t border-gray-100 dark:border-gray-700" />
              <button
                type="button"
                role="menuitem"
                class="flex w-full items-center gap-3 px-4 py-2 text-start text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                @click="openDeleteModal"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                Supprimer
              </button>
            </div>
          </div>

          <button
            v-if="canEdit && isFormTab"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSaving"
            title="Enregistrer les onglets Général et Présentation (Ctrl + S)"
            @click="saveForm"
          >
            <font-awesome-icon :icon="['fas', isSaving ? 'spinner' : 'save']" :class="{ 'animate-spin': isSaving }" class="h-4 w-4" />
            {{ isSaving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-if="notice"
        :role="notice.type === 'error' ? 'alert' : 'status'"
        class="mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm"
        :class="{
          'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300': notice.type === 'success',
          'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300': notice.type === 'info',
          'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400': notice.type === 'error',
        }"
      >
        <font-awesome-icon
          :icon="['fas', notice.type === 'error' ? 'exclamation-circle' : (notice.type === 'success' ? 'check-circle' : 'info-circle')]"
          class="mt-0.5 h-4 w-4 flex-shrink-0"
        />
        <span class="flex-1">{{ notice.text }}</span>
        <button type="button" class="opacity-70 hover:opacity-100" aria-label="Fermer le message" @click="notice = null">
          <font-awesome-icon :icon="['fas', 'times']" class="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        v-if="!canEdit"
        class="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      >
        <font-awesome-icon :icon="['fas', 'lock']" class="mt-0.5 h-4 w-4 flex-shrink-0" />
        Consultation seule : la permission « Modifier l'organisation » est nécessaire pour enregistrer des changements.
      </div>

      <!-- Onglets -->
      <div class="sticky top-16 z-20 -mx-6 mb-6 border-b border-gray-200 bg-gray-50/95 px-6 backdrop-blur dark:border-gray-700 dark:bg-gray-950/95">
        <div class="flex items-center gap-4">
          <nav
            role="tablist"
            aria-label="Rubriques du service"
            class="admin-scrollbar -mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto"
          >
            <button
              v-for="(tab, index) in tabs"
              :id="`service-tab-${tab.key}`"
              :key="tab.key"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.key"
              :aria-controls="`service-panel-${tab.key}`"
              :tabindex="activeTab === tab.key ? 0 : -1"
              class="flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors"
              :class="activeTab === tab.key
                ? 'border-brand-red-600 text-brand-red-600 dark:text-brand-red-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
              @click="setTab(tab.key)"
              @keydown="onTabKeydown($event, index)"
            >
              <font-awesome-icon :icon="['fas', tab.icon]" class="h-4 w-4" />
              {{ tab.label }}
              <span
                v-if="FORM_TABS.includes(tab.key) && isDirty"
                class="h-1.5 w-1.5 rounded-full bg-amber-500"
                title="Modifications non enregistrées"
              />
              <span
                v-else-if="!FORM_TABS.includes(tab.key) && counts[tab.key as CountKey] !== null"
                class="rounded-full px-2 py-0.5 text-xs"
                :class="activeTab === tab.key
                  ? 'bg-brand-red-100 text-brand-red-700 dark:bg-brand-red-900/30 dark:text-brand-red-300'
                  : 'bg-gray-200/70 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
              >
                {{ counts[tab.key as CountKey] }}
              </span>
            </button>
          </nav>
          <p v-if="!isFormTab" class="hidden flex-shrink-0 items-center gap-1.5 text-xs text-gray-500 md:flex dark:text-gray-400">
            <font-awesome-icon :icon="['fas', 'bolt']" class="h-3 w-3" />
            Enregistrement immédiat
          </p>
        </div>
      </div>

      <!-- Général + Présentation : un seul formulaire -->
      <div
        v-show="isFormTab"
        :id="`service-panel-${isFormTab ? activeTab : 'general'}`"
        role="tabpanel"
        :aria-labelledby="`service-tab-${isFormTab ? activeTab : 'general'}`"
      >
        <AdminOrganisationServiceForm
          ref="formRef"
          :service-id="service.id"
          :initial="service"
          :tab="activeTab === 'presentation' ? 'presentation' : 'general'"
          :sectors="sectors"
          :services="allServices"
          :disabled="!canEdit"
          @saved="onSaved"
          @dirty-change="v => (isDirty = v)"
          @request-tab="onRequestTab"
        >
          <template #general-after>
            <!-- Pôles d'un service de premier niveau -->
            <section
              v-if="!service.parent_id"
              class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                    <font-awesome-icon :icon="['fas', 'code-branch']" class="h-4 w-4 text-gray-400" />
                    Pôles
                    <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {{ childServices.length }}
                    </span>
                  </h2>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Sous-structures rattachées à ce service, affichées en retrait sous lui dans l'organigramme.
                  </p>
                </div>
                <NuxtLink
                  v-if="canEdit"
                  :to="addPoleLink"
                  class="inline-flex items-center gap-2 rounded-lg border border-brand-red-200 px-3 py-1.5 text-sm font-medium text-brand-red-700 transition-colors hover:bg-brand-red-50 dark:border-brand-red-800 dark:text-brand-red-300 dark:hover:bg-brand-red-900/20"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" class="h-3.5 w-3.5" />
                  Ajouter un pôle
                </NuxtLink>
              </div>
              <ul v-if="childServices.length > 0" class="divide-y divide-gray-100 dark:divide-gray-700">
                <li v-for="child in childServices" :key="child.id">
                  <NuxtLink
                    :to="`/admin/organisation/services/${child.id}`"
                    class="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    :class="{ 'opacity-60': !child.active }"
                  >
                    <span
                      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                      :class="child.color ? '' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'"
                      :style="child.color ? { backgroundColor: child.color } : undefined"
                      aria-hidden="true"
                    >
                      <template v-if="child.sigle">{{ child.sigle.slice(0, 4) }}</template>
                      <font-awesome-icon v-else :icon="['fas', 'sitemap']" class="h-3.5 w-3.5" />
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block truncate text-sm font-medium text-gray-900 group-hover:text-brand-red-600 dark:text-white dark:group-hover:text-brand-red-400">
                        {{ child.name }}
                      </span>
                      <span v-if="child.landing_path" class="block truncate font-mono text-xs text-gray-400">
                        {{ child.landing_path }}
                      </span>
                    </span>
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="child.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
                    >
                      {{ child.active ? 'Actif' : 'Inactif' }}
                    </span>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3 text-gray-300 rtl:-scale-x-100 dark:text-gray-600" />
                  </NuxtLink>
                </li>
              </ul>
              <p v-else class="rounded-lg bg-gray-50 px-3 py-4 text-center text-sm text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
                Aucun pôle rattaché à ce service.
              </p>
            </section>
          </template>
        </AdminOrganisationServiceForm>

        <!-- Barre d'enregistrement en bas du formulaire -->
        <div v-if="canEdit" class="mt-6 flex flex-wrap items-center justify-end gap-3">
          <span v-if="isDirty" class="text-xs text-amber-700 dark:text-amber-400">
            Modifications non enregistrées
          </span>
          <NuxtLink
            :to="backLink"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Retour à l'organisation
          </NuxtLink>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSaving"
            @click="saveForm"
          >
            <font-awesome-icon :icon="['fas', isSaving ? 'spinner' : 'save']" :class="{ 'animate-spin': isSaving }" class="h-4 w-4" />
            {{ isSaving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </div>

      <!-- Sections autonomes : montées à la première visite, puis conservées -->
      <div
        v-if="visitedTabs.has('equipe')"
        v-show="activeTab === 'equipe'"
        id="service-panel-equipe"
        role="tabpanel"
        aria-labelledby="service-tab-equipe"
      >
        <AdminOrganisationServiceTeamSection
          :service-id="service.id"
          @count="(n: number) => setCount('equipe', n)"
        />
      </div>

      <div
        v-if="visitedTabs.has('objectifs')"
        v-show="activeTab === 'objectifs'"
        id="service-panel-objectifs"
        role="tabpanel"
        aria-labelledby="service-tab-objectifs"
      >
        <AdminOrganisationServiceObjectivesSection
          :service-id="service.id"
          @count="(n: number) => setCount('objectifs', n)"
        />
      </div>

      <div
        v-if="visitedTabs.has('realisations')"
        v-show="activeTab === 'realisations'"
        id="service-panel-realisations"
        role="tabpanel"
        aria-labelledby="service-tab-realisations"
      >
        <AdminOrganisationServiceAchievementsSection
          :service-id="service.id"
          @count="(n: number) => setCount('realisations', n)"
        />
      </div>

      <div
        v-if="visitedTabs.has('projets')"
        v-show="activeTab === 'projets'"
        id="service-panel-projets"
        role="tabpanel"
        aria-labelledby="service-tab-projets"
      >
        <AdminOrganisationServiceProjectsSection
          :service-id="service.id"
          @count="(n: number) => setCount('projets', n)"
        />
      </div>

      <div
        v-if="visitedTabs.has('medias')"
        v-show="activeTab === 'medias'"
        id="service-panel-medias"
        role="tabpanel"
        aria-labelledby="service-tab-medias"
      >
        <AdminOrganisationServiceMediaSection
          :service-id="service.id"
          :primary-album-id="service.album_external_id"
          @update:primary-album-id="setPrimaryAlbum"
          @count="(n: number) => setCount('medias', n)"
        />
      </div>
    </template>

    <!-- Modale de suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && service"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-service-title"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 id="delete-service-title" class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le service
            </h3>
            <p class="mb-4 text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer <strong class="text-gray-900 dark:text-white">{{ service.name }}</strong> ?
              Cette action est irréversible.
            </p>

            <div v-if="isLoadingUsage" class="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              Vérification des contenus rattachés…
            </div>

            <!-- Pôles : ils repasseront au premier niveau -->
            <div
              v-if="childServices.length > 0"
              class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-start dark:border-blue-800 dark:bg-blue-900/20"
            >
              <div class="flex items-start gap-2">
                <font-awesome-icon :icon="['fas', 'info-circle']" class="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  Ses {{ childServices.length }} pôle(s) repasseront au premier niveau du secteur.
                </p>
              </div>
            </div>

            <!-- Blocage : objectifs, réalisations, projets -->
            <div
              v-if="usage && !usage.can_delete"
              class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-start dark:border-amber-800 dark:bg-amber-900/20"
            >
              <div class="flex items-start gap-2">
                <font-awesome-icon :icon="['fas', 'warning']" class="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div class="text-sm">
                  <p class="font-medium text-amber-800 dark:text-amber-200">
                    Ce service ne peut pas être supprimé
                  </p>
                  <p class="mt-1 text-amber-700 dark:text-amber-300">
                    Il contient {{ usage.objectives_count }} objectif(s),
                    {{ usage.achievements_count }} réalisation(s) et
                    {{ usage.projects_count }} projet(s). Supprimez-les d'abord depuis leurs onglets.
                  </p>
                  <ul v-if="usage.items_sample.length > 0" class="mt-2 space-y-1 text-amber-700 dark:text-amber-300">
                    <li v-for="(item, index) in usage.items_sample" :key="index">
                      • {{ item.type }} : {{ item.title }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p v-if="deleteError" role="alert" class="rounded-lg bg-red-50 p-3 text-start text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {{ deleteError }}
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isDeleting"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoadingUsage || !usage || !usage.can_delete || isDeleting"
              @click="confirmDelete"
            >
              {{ isDeleting ? 'Suppression…' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
