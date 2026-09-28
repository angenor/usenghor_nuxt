<script setup lang="ts">
/**
 * Onglet « Équipe » de la fiche admin d'un service.
 *
 * - Liste ordonnée des membres (photo, nom, e-mail, poste, période, statut)
 * - Ordre d'affichage par glisser-déposer ou boutons monter / descendre
 *   (persisté via `reorderServiceTeamMembers` avec la liste complète,
 *   rollback en cas d'échec)
 * - Ajout / modification dans une modale avec sélecteur d'utilisateur
 *   à recherche (nom, e-mail) côté serveur
 * - Suppression avec confirmation
 *
 * Émet `count` (nombre de membres) après chargement et chaque mutation.
 */
import type { ServiceTeamMemberRead, ServiceTeamMemberUpdate } from '~/composables/useServicesApi'
import type { UserRead } from '~/composables/useUsersApi'

const props = defineProps<{
  serviceId: string
}>()

const emit = defineEmits<{
  count: [value: number]
}>()

const {
  getServiceTeamMembers,
  addServiceTeamMember,
  updateServiceTeamMember,
  deleteServiceTeamMember,
  reorderServiceTeamMembers,
} = useServicesApi()
const { listUsers, getUserById, getFullName } = useUsersApi()
const { getMediaUrl } = useMediaApi()

// ============================================================================
// Types locaux
// ============================================================================

interface TeamUser {
  id: string
  fullName: string
  email: string
  photo_external_id: string | null
  active: boolean
}

type MemberState = 'current' | 'upcoming' | 'ended' | 'inactive'

// ============================================================================
// État
// ============================================================================

const rootEl = ref<HTMLElement | null>(null)
const members = ref<ServiceTeamMemberRead[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isReordering = ref(false)

/** Utilisateurs résolus par ID (`null` = introuvable ou inaccessible). */
const usersById = ref<Record<string, TeamUser | null>>({})
/** Photos qui n'ont pas pu être chargées (repli sur les initiales). */
const brokenPhotos = ref<Set<string>>(new Set())

// Bandeau de retour (succès / erreur)
const feedback = ref<{ type: 'success' | 'error'; text: string } | null>(null)
let feedbackTimer: ReturnType<typeof setTimeout> | null = null
// Annonce pour les lecteurs d'écran (déplacements au clavier)
const liveAnnouncement = ref('')

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
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined
    if (first?.msg) return `${fallback} (${first.msg})`
  }
  return fallback
}

function emitCount() {
  emit('count', members.value.length)
}

// ============================================================================
// Chargement
// ============================================================================

function toTeamUser(user: UserRead): TeamUser {
  return {
    id: user.id,
    fullName: getFullName(user) || user.email,
    email: user.email,
    photo_external_id: user.photo_external_id,
    active: user.active,
  }
}

async function resolveUsers(ids: string[]) {
  const missing = [...new Set(ids)].filter(id => id && !(id in usersById.value))
  if (missing.length === 0) return
  const results = await Promise.allSettled(missing.map(id => getUserById(id)))
  const next = { ...usersById.value }
  results.forEach((result, index) => {
    const id = missing[index]!
    next[id] = result.status === 'fulfilled' ? toTeamUser(result.value) : null
  })
  usersById.value = next
}

function sortMembers(list: ServiceTeamMemberRead[]): ServiceTeamMemberRead[] {
  // Tri stable : l'ordre renvoyé par l'API départage les égalités
  return list
    .map((member, index) => ({ member, index }))
    .sort((a, b) => (a.member.display_order - b.member.display_order) || (a.index - b.index))
    .map(entry => entry.member)
}

async function loadMembers(showSpinner = true) {
  if (showSpinner) isLoading.value = true
  loadError.value = null
  try {
    const list = await getServiceTeamMembers(props.serviceId)
    members.value = sortMembers(list)
    emitCount()
    await resolveUsers(members.value.map(m => m.user_external_id))
  }
  catch (error) {
    console.error('Erreur lors du chargement de l\'équipe :', error)
    loadError.value = extractErrorMessage(error, 'Impossible de charger l\'équipe du service.')
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => loadMembers())

watch(() => props.serviceId, (next, previous) => {
  if (next && next !== previous) {
    usersById.value = {}
    loadMembers()
  }
})

onBeforeUnmount(() => {
  if (feedbackTimer) clearTimeout(feedbackTimer)
  if (searchTimer) clearTimeout(searchTimer)
})

// ============================================================================
// Présentation
// ============================================================================

function memberUser(member: ServiceTeamMemberRead): TeamUser | null {
  if (member.user) {
    return {
      id: member.user.id,
      fullName: `${member.user.first_name} ${member.user.last_name}`.trim() || member.user.email,
      email: member.user.email,
      photo_external_id: member.user.photo_external_id,
      active: true,
    }
  }
  return usersById.value[member.user_external_id] ?? null
}

function memberName(member: ServiceTeamMemberRead): string {
  return memberUser(member)?.fullName || 'Utilisateur inconnu'
}

function photoUrl(user: TeamUser | null): string | null {
  if (!user?.photo_external_id || brokenPhotos.value.has(user.photo_external_id)) return null
  return getMediaUrl(user.photo_external_id, 'low')
}

function markPhotoBroken(photoId: string | null | undefined) {
  if (!photoId) return
  const next = new Set(brokenPhotos.value)
  next.add(photoId)
  brokenPhotos.value = next
}

function initials(name: string): string {
  const parts = name.replace(/^(M\.|Mme|Dr|Pr)\s+/i, '').split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts[parts.length - 1]![0]}` : (parts[0]?.slice(0, 2) ?? '?')
  return letters.toUpperCase()
}

function todayIso(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function memberState(member: ServiceTeamMemberRead): MemberState {
  if (!member.active) return 'inactive'
  const today = todayIso()
  if (member.end_date && member.end_date.slice(0, 10) < today) return 'ended'
  if (member.start_date && member.start_date.slice(0, 10) > today) return 'upcoming'
  return 'current'
}

function isFormerMember(member: ServiceTeamMemberRead): boolean {
  const state = memberState(member)
  return state === 'ended' || state === 'inactive'
}

const stateLabels: Record<MemberState, string> = {
  current: 'En poste',
  upcoming: 'À venir',
  ended: 'Mandat terminé',
  inactive: 'Inactif',
}

const stateClasses: Record<MemberState, string> = {
  current: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  ended: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

function formatDay(value: string | null): string {
  if (!value) return ''
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return value
  // Construction locale pour éviter le décalage d'un jour lié au fuseau
  return dateFormatter.format(new Date(y, m - 1, d))
}

function periodLabel(member: ServiceTeamMemberRead): string {
  const start = formatDay(member.start_date)
  const end = formatDay(member.end_date)
  if (start && end) return `${start} → ${end}`
  if (start) return `Depuis le ${start}`
  if (end) return `Jusqu'au ${end}`
  return ''
}

const currentCount = computed(() => members.value.filter(m => memberState(m) === 'current').length)
const formerCount = computed(() => members.value.filter(isFormerMember).length)

// ============================================================================
// Réordonnancement (glisser-déposer + clavier)
// ============================================================================

const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)

async function persistOrder(nextList: ServiceTeamMemberRead[], previousList: ServiceTeamMemberRead[]) {
  members.value = nextList
  isReordering.value = true
  try {
    await reorderServiceTeamMembers(props.serviceId, nextList.map(m => m.id))
    // Aligne l'ordre local sur ce qui vient d'être persisté
    members.value = nextList.map((member, index) => ({ ...member, display_order: index }))
    showFeedback('success', 'Ordre de l\'équipe enregistré.')
  }
  catch (error) {
    console.error('Erreur lors du réordonnancement de l\'équipe :', error)
    members.value = previousList
    showFeedback('error', extractErrorMessage(error, 'L\'ordre n\'a pas pu être enregistré. L\'ordre précédent a été rétabli.'))
  }
  finally {
    isReordering.value = false
  }
}

function moveMember(from: number, to: number): boolean {
  if (isReordering.value) return false
  if (from === to || from < 0 || to < 0 || from >= members.value.length || to >= members.value.length) return false
  const previous = [...members.value]
  const next = [...members.value]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved!)
  liveAnnouncement.value = `${memberName(moved!)} déplacé en position ${to + 1} sur ${next.length}.`
  persistOrder(next, previous)
  return true
}

async function moveWithButton(member: ServiceTeamMemberRead, direction: -1 | 1) {
  const index = members.value.findIndex(m => m.id === member.id)
  if (!moveMember(index, index + direction)) return
  await nextTick()
  // Garde le focus sur le même membre après déplacement
  const newIndex = index + direction
  const atEdge = direction === -1 ? newIndex === 0 : newIndex === members.value.length - 1
  const selector = atEdge
    ? `[data-handle="${member.id}"]`
    : `[data-move="${member.id}-${direction === -1 ? 'up' : 'down'}"]`
  rootEl.value?.querySelector<HTMLElement>(selector)?.focus()
}

async function onHandleKeydown(event: KeyboardEvent, member: ServiceTeamMemberRead) {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
  event.preventDefault()
  const index = members.value.findIndex(m => m.id === member.id)
  if (!moveMember(index, index + (event.key === 'ArrowUp' ? -1 : 1))) return
  await nextTick()
  rootEl.value?.querySelector<HTMLElement>(`[data-handle="${member.id}"]`)?.focus()
}

function onDragStart(event: DragEvent, index: number) {
  if (isReordering.value || members.value.length < 2) {
    event.preventDefault()
    return
  }
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    // Requis par Firefox pour démarrer le glisser
    event.dataTransfer.setData('text/plain', members.value[index]?.id ?? '')
  }
}

function onDragOver(event: DragEvent, index: number) {
  if (dragIndex.value === null) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  overIndex.value = index
}

function onDrop(event: DragEvent, index: number) {
  event.preventDefault()
  const from = dragIndex.value
  dragIndex.value = null
  overIndex.value = null
  if (from !== null) moveMember(from, index)
}

function onDragEnd() {
  dragIndex.value = null
  overIndex.value = null
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
// Modale ajout / modification
// ============================================================================

const showFormModal = ref(false)
const formDialogEl = ref<HTMLElement | null>(null)
const editingMember = ref<ServiceTeamMemberRead | null>(null)
const isSaving = ref(false)
const formError = ref<string | null>(null)
const formSubmitted = ref(false)
const form = ref({
  user_external_id: '',
  position: '',
  start_date: '' as string,
  end_date: '' as string,
  active: true,
})
const selectedUser = ref<TeamUser | null>(null)

const positionError = computed(() => {
  if (!formSubmitted.value) return null
  return form.value.position.trim() ? null : 'Le poste est obligatoire.'
})
const userError = computed(() => {
  if (!formSubmitted.value) return null
  return form.value.user_external_id ? null : 'Sélectionnez un utilisateur.'
})
const datesError = computed(() => {
  const { start_date, end_date } = form.value
  if (start_date && end_date && end_date < start_date) return 'La date de fin doit être postérieure à la date de début.'
  return null
})

async function openAddModal() {
  rememberFocus()
  editingMember.value = null
  form.value = { user_external_id: '', position: '', start_date: '', end_date: '', active: true }
  selectedUser.value = null
  formError.value = null
  formSubmitted.value = false
  resetUserSearch()
  showFormModal.value = true
  runUserSearch('')
  await nextTick()
  userSearchInput.value?.focus()
}

async function openEditModal(member: ServiceTeamMemberRead) {
  rememberFocus()
  editingMember.value = member
  form.value = {
    user_external_id: member.user_external_id,
    position: member.position,
    start_date: member.start_date?.slice(0, 10) ?? '',
    end_date: member.end_date?.slice(0, 10) ?? '',
    active: member.active,
  }
  selectedUser.value = memberUser(member) ?? {
    id: member.user_external_id,
    fullName: 'Utilisateur inconnu',
    email: '',
    photo_external_id: null,
    active: false,
  }
  formError.value = null
  formSubmitted.value = false
  resetUserSearch()
  showFormModal.value = true
  await nextTick()
  positionInput.value?.focus()
}

function closeFormModal() {
  if (isSaving.value) return
  showFormModal.value = false
  editingMember.value = null
  restoreFocus()
}

async function submitForm() {
  formSubmitted.value = true
  formError.value = null
  if (userError.value || positionError.value || datesError.value) return

  const payload = {
    user_external_id: form.value.user_external_id,
    position: form.value.position.trim(),
    start_date: form.value.start_date || null,
    end_date: form.value.end_date || null,
    active: form.value.active,
  }

  isSaving.value = true
  try {
    if (editingMember.value) {
      await updateServiceTeamMember(props.serviceId, editingMember.value.id, payload as ServiceTeamMemberUpdate)
    }
    else {
      const nextOrder = members.value.reduce((max, m) => Math.max(max, m.display_order), -1) + 1
      await addServiceTeamMember(props.serviceId, { ...payload, display_order: nextOrder })
    }
    // Mémorise l'utilisateur choisi pour éviter une requête supplémentaire
    if (selectedUser.value && selectedUser.value.id === payload.user_external_id) {
      usersById.value = { ...usersById.value, [selectedUser.value.id]: selectedUser.value }
    }
    const wasEditing = !!editingMember.value
    const name = selectedUser.value?.fullName || 'Le membre'
    isSaving.value = false
    closeFormModal()
    await loadMembers(false)
    showFeedback('success', wasEditing ? `${name} a été mis à jour.` : `${name} a été ajouté à l'équipe.`)
  }
  catch (error) {
    console.error('Erreur lors de l\'enregistrement du membre :', error)
    formError.value = extractErrorMessage(error, 'L\'enregistrement a échoué. Veuillez réessayer.')
  }
  finally {
    isSaving.value = false
  }
}

// ---------------------------------------------------------------------------
// Sélecteur d'utilisateur (combobox avec recherche serveur)
// ---------------------------------------------------------------------------

const userSearchInput = ref<HTMLInputElement | null>(null)
const positionInput = ref<HTMLInputElement | null>(null)
const userQuery = ref('')
const userResults = ref<TeamUser[]>([])
const isSearchingUsers = ref(false)
const userSearchError = ref<string | null>(null)
const activeOptionIndex = ref(-1)
let searchTimer: ReturnType<typeof setTimeout> | null = null
let searchToken = 0

const memberUserIds = computed(() => new Set(members.value.map(m => m.user_external_id)))

function resetUserSearch() {
  userQuery.value = ''
  userResults.value = []
  userSearchError.value = null
  activeOptionIndex.value = -1
}

async function runUserSearch(query: string) {
  const token = ++searchToken
  isSearchingUsers.value = true
  userSearchError.value = null
  try {
    const response = await listUsers({ search: query.trim() || null, active: true, limit: 20 })
    if (token !== searchToken) return
    userResults.value = response.items.map(toTeamUser)
    activeOptionIndex.value = userResults.value.length > 0 ? 0 : -1
  }
  catch (error) {
    if (token !== searchToken) return
    console.error('Erreur lors de la recherche d\'utilisateurs :', error)
    userResults.value = []
    userSearchError.value = extractErrorMessage(error, 'La recherche d\'utilisateurs a échoué.')
  }
  finally {
    if (token === searchToken) isSearchingUsers.value = false
  }
}

watch(userQuery, (query) => {
  if (!showFormModal.value || selectedUser.value) return
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => runUserSearch(query), 250)
})

async function selectUser(user: TeamUser) {
  selectedUser.value = user
  form.value.user_external_id = user.id
  await nextTick()
  positionInput.value?.focus()
}

async function changeUser() {
  selectedUser.value = null
  form.value.user_external_id = ''
  resetUserSearch()
  runUserSearch('')
  await nextTick()
  userSearchInput.value?.focus()
}

function onUserSearchKeydown(event: KeyboardEvent) {
  const count = userResults.value.length
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (count) activeOptionIndex.value = (activeOptionIndex.value + 1) % count
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (count) activeOptionIndex.value = (activeOptionIndex.value - 1 + count) % count
  }
  else if (event.key === 'Enter') {
    // Empêche la soumission du formulaire depuis le champ de recherche
    event.preventDefault()
    const option = userResults.value[activeOptionIndex.value]
    if (option) selectUser(option)
  }
  else if (event.key === 'Escape' && userQuery.value) {
    // Échap efface d'abord la recherche avant de fermer la modale
    event.stopPropagation()
    userQuery.value = ''
  }
}

watch(activeOptionIndex, async (index) => {
  if (index < 0) return
  await nextTick()
  document.getElementById(`team-user-option-${index}`)?.scrollIntoView({ block: 'nearest' })
})

function onFormDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeFormModal()
    return
  }
  trapTab(event, formDialogEl.value)
}

// ============================================================================
// Suppression
// ============================================================================

const deletingMember = ref<ServiceTeamMemberRead | null>(null)
const deleteDialogEl = ref<HTMLElement | null>(null)
const deleteCancelButton = ref<HTMLButtonElement | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

async function openDeleteModal(member: ServiceTeamMemberRead) {
  rememberFocus()
  deletingMember.value = member
  deleteError.value = null
  await nextTick()
  deleteCancelButton.value?.focus()
}

function closeDeleteModal() {
  if (isDeleting.value) return
  deletingMember.value = null
  restoreFocus()
}

async function confirmDelete() {
  const member = deletingMember.value
  if (!member) return
  isDeleting.value = true
  deleteError.value = null
  try {
    await deleteServiceTeamMember(props.serviceId, member.id)
    members.value = members.value.filter(m => m.id !== member.id)
    emitCount()
    const name = memberName(member)
    isDeleting.value = false
    deletingMember.value = null
    lastFocused = null
    showFeedback('success', `${name} a été retiré de l'équipe.`)
    await nextTick()
    rootEl.value?.querySelector<HTMLElement>('[data-add-member]')?.focus()
  }
  catch (error) {
    console.error('Erreur lors de la suppression du membre :', error)
    deleteError.value = extractErrorMessage(error, 'La suppression a échoué. Veuillez réessayer.')
  }
  finally {
    isDeleting.value = false
  }
}

function onDeleteDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeDeleteModal()
    return
  }
  trapTab(event, deleteDialogEl.value)
}

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500'
</script>

<template>
  <section ref="rootEl" aria-labelledby="service-team-title" class="space-y-4">
    <!-- En-tête -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 id="service-team-title" class="text-lg font-semibold text-gray-900 dark:text-white">
          Équipe du service
        </h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <template v-if="!isLoading && members.length > 0">
            {{ members.length }} membre{{ members.length > 1 ? 's' : '' }}
            · {{ currentCount }} en poste<template v-if="formerCount > 0">
              · {{ formerCount }} ancien{{ formerCount > 1 ? 's' : '' }}
            </template>
          </template>
          <template v-else>
            Les personnes présentées dans l'onglet « Équipe » de la fiche publique du service.
          </template>
        </p>
      </div>
      <button
        type="button"
        data-add-member
        class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        :disabled="isLoading"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'user-plus']" class="h-4 w-4" aria-hidden="true" />
        Ajouter un membre
      </button>
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
    <p class="sr-only" aria-live="assertive">{{ liveAnnouncement }}</p>

    <!-- Chargement -->
    <div
      v-if="isLoading"
      class="space-y-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
      aria-busy="true"
      aria-label="Chargement de l'équipe"
    >
      <div v-for="i in 3" :key="i" class="flex animate-pulse items-center gap-3 py-2">
        <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div class="flex-1 space-y-2">
          <div class="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="h-3 w-1/4 rounded bg-gray-100 dark:bg-gray-700/60" />
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
        @click="loadMembers()"
      >
        <font-awesome-icon :icon="['fas', 'rotate-right']" class="h-4 w-4" aria-hidden="true" />
        Réessayer
      </button>
    </div>

    <!-- État vide -->
    <div
      v-else-if="members.length === 0"
      class="rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-600 dark:bg-gray-800"
    >
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-red-50 dark:bg-brand-red-900/20">
        <font-awesome-icon :icon="['fas', 'people-group']" class="h-8 w-8 text-brand-red-500 dark:text-brand-red-400" aria-hidden="true" />
      </div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
        Présentez les visages du service
      </h3>
      <p class="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
        Ajoutez la direction et les collaborateurs du service : leur photo, leur nom et leur fonction
        apparaîtront sur la fiche publique, dans l'ordre que vous choisirez.
      </p>
      <button
        type="button"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'user-plus']" class="h-4 w-4" aria-hidden="true" />
        Ajouter le premier membre
      </button>
    </div>

    <!-- Liste ordonnée -->
    <div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <p
        v-if="members.length > 1"
        id="team-reorder-help"
        class="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400"
      >
        <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-3 w-3" aria-hidden="true" />
        Glissez-déposez les lignes, ou utilisez les flèches, pour définir l'ordre d'affichage public.
        Au clavier : focus sur la poignée puis flèches haut / bas.
        <font-awesome-icon
          v-if="isReordering"
          :icon="['fas', 'spinner']"
          class="ml-auto h-3 w-3 animate-spin"
          aria-label="Enregistrement de l'ordre en cours"
        />
      </p>

      <!-- En-têtes (écran large) -->
      <div
        class="hidden grid-cols-[2rem_minmax(0,2.2fr)_minmax(0,1.5fr)_minmax(0,1.4fr)_7rem_auto] items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400 lg:grid"
        aria-hidden="true"
      >
        <span />
        <span>Membre</span>
        <span>Poste</span>
        <span>Période</span>
        <span>Statut</span>
        <span class="text-right">Actions</span>
      </div>

      <ol class="divide-y divide-gray-200 dark:divide-gray-700" aria-label="Membres de l'équipe, dans l'ordre d'affichage">
        <li
          v-for="(member, index) in members"
          :key="member.id"
          :draggable="members.length > 1 && !isReordering"
          class="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors lg:grid lg:grid-cols-[2rem_minmax(0,2.2fr)_minmax(0,1.5fr)_minmax(0,1.4fr)_7rem_auto]"
          :class="[
            dragIndex === index ? 'bg-brand-red-50/60 opacity-60 dark:bg-brand-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40',
            overIndex === index && dragIndex !== null && dragIndex !== index
              ? (dragIndex > index ? 'shadow-[inset_0_2px_0_0_#f32525]' : 'shadow-[inset_0_-2px_0_0_#f32525]')
              : '',
          ]"
          @dragstart="onDragStart($event, index)"
          @dragover="onDragOver($event, index)"
          @drop="onDrop($event, index)"
          @dragend="onDragEnd"
        >
          <!-- Poignée -->
          <button
            v-if="members.length > 1"
            type="button"
            :data-handle="member.id"
            class="flex h-8 w-8 cursor-grab items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 active:cursor-grabbing dark:hover:bg-gray-700 dark:hover:text-gray-300"
            :aria-label="`Réordonner ${memberName(member)} (position ${index + 1} sur ${members.length})`"
            aria-describedby="team-reorder-help"
            :disabled="isReordering"
            @keydown="onHandleKeydown($event, member)"
          >
            <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-4 w-4" aria-hidden="true" />
          </button>
          <span v-else class="hidden lg:block" />

          <!-- Membre -->
          <div class="flex min-w-0 flex-1 items-center gap-3 lg:flex-none" :class="{ 'opacity-60': isFormerMember(member) }">
            <div class="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-gray-600 dark:bg-gray-600 dark:text-gray-200" :class="{ grayscale: isFormerMember(member) }">
              <img
                v-if="photoUrl(memberUser(member))"
                :src="photoUrl(memberUser(member))!"
                alt=""
                class="h-full w-full object-cover"
                loading="lazy"
                @error="markPhotoBroken(memberUser(member)?.photo_external_id)"
              >
              <span v-else aria-hidden="true">{{ memberUser(member) ? initials(memberName(member)) : '?' }}</span>
            </div>
            <div class="min-w-0">
              <p class="truncate font-medium text-gray-900 dark:text-white">
                {{ memberName(member) }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-gray-400">
                {{ memberUser(member)?.email || '' }}
              </p>
            </div>
          </div>

          <!-- Poste -->
          <p class="w-full min-w-0 text-sm text-gray-900 dark:text-gray-100 sm:w-auto lg:w-auto" :class="{ 'opacity-60': isFormerMember(member) }">
            <span class="sr-only">Poste : </span>
            <span class="lg:line-clamp-2">{{ member.position }}</span>
          </p>

          <!-- Période -->
          <p class="text-sm text-gray-500 dark:text-gray-400" :class="{ 'opacity-60': isFormerMember(member) }">
            <span class="sr-only">Période : </span>
            <template v-if="periodLabel(member)">{{ periodLabel(member) }}</template>
            <span v-else class="text-gray-400 dark:text-gray-500" title="Période non renseignée">
              <span aria-hidden="true">—</span><span class="sr-only">non renseignée</span>
            </span>
          </p>

          <!-- Statut -->
          <div>
            <span class="inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium" :class="stateClasses[memberState(member)]">
              {{ stateLabels[memberState(member)] }}
            </span>
          </div>

          <!-- Actions -->
          <div class="ml-auto flex items-center justify-end gap-1">
            <template v-if="members.length > 1">
              <button
                type="button"
                :data-move="`${member.id}-up`"
                class="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                :disabled="index === 0 || isReordering"
                :aria-label="`Monter ${memberName(member)}`"
                title="Monter"
                @click="moveWithButton(member, -1)"
              >
                <font-awesome-icon :icon="['fas', 'arrow-up']" class="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                :data-move="`${member.id}-down`"
                class="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                :disabled="index === members.length - 1 || isReordering"
                :aria-label="`Descendre ${memberName(member)}`"
                title="Descendre"
                @click="moveWithButton(member, 1)"
              >
                <font-awesome-icon :icon="['fas', 'arrow-down']" class="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </template>
            <button
              type="button"
              class="rounded p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
              :aria-label="`Modifier ${memberName(member)}`"
              title="Modifier"
              @click="openEditModal(member)"
            >
              <font-awesome-icon :icon="['fas', 'pen']" class="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              :aria-label="`Retirer ${memberName(member)} de l'équipe`"
              title="Retirer de l'équipe"
              @click="openDeleteModal(member)"
            >
              <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </li>
      </ol>
    </div>

    <!-- Modale ajout / modification -->
    <Teleport to="body">
      <div
        v-if="showFormModal"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
        @click.self="closeFormModal"
      >
        <div
          ref="formDialogEl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-form-title"
          class="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-xl bg-white shadow-xl dark:bg-gray-800 sm:rounded-xl"
          @keydown="onFormDialogKeydown"
        >
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 id="team-form-title" class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingMember ? 'Modifier le membre' : 'Ajouter un membre' }}
            </h2>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Fermer"
              :disabled="isSaving"
              @click="closeFormModal"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <form class="flex min-h-0 flex-1 flex-col" novalidate @submit.prevent="submitForm">
            <div class="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
              <!-- Utilisateur -->
              <div>
                <span id="team-user-label" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Utilisateur <span class="text-red-500" aria-hidden="true">*</span>
                </span>

                <div
                  v-if="selectedUser"
                  class="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/60"
                >
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-gray-600 dark:bg-gray-600 dark:text-gray-200">
                    <img
                      v-if="photoUrl(selectedUser)"
                      :src="photoUrl(selectedUser)!"
                      alt=""
                      class="h-full w-full object-cover"
                      @error="markPhotoBroken(selectedUser?.photo_external_id)"
                    >
                    <span v-else aria-hidden="true">{{ initials(selectedUser.fullName) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium text-gray-900 dark:text-white">{{ selectedUser.fullName }}</p>
                    <p class="truncate text-sm text-gray-500 dark:text-gray-400">{{ selectedUser.email }}</p>
                  </div>
                  <button
                    type="button"
                    class="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-red-600 hover:bg-brand-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-brand-red-400 dark:hover:bg-brand-red-900/20"
                    @click="changeUser"
                  >
                    Changer
                  </button>
                </div>

                <template v-else>
                  <div class="relative">
                    <font-awesome-icon
                      :icon="['fas', 'magnifying-glass']"
                      class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      ref="userSearchInput"
                      v-model="userQuery"
                      type="search"
                      role="combobox"
                      autocomplete="off"
                      aria-labelledby="team-user-label"
                      aria-autocomplete="list"
                      aria-controls="team-user-listbox"
                      aria-expanded="true"
                      :aria-activedescendant="activeOptionIndex >= 0 ? `team-user-option-${activeOptionIndex}` : undefined"
                      :aria-invalid="!!userError"
                      :aria-describedby="userError ? 'team-user-error' : undefined"
                      placeholder="Rechercher par nom ou e-mail…"
                      :class="[inputClass, 'pl-9']"
                      @keydown="onUserSearchKeydown"
                    >
                  </div>

                  <div class="mt-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div v-if="isSearchingUsers" class="flex items-center gap-2 px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                      <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
                      Recherche en cours…
                    </div>
                    <p v-else-if="userSearchError" class="px-3 py-3 text-sm text-red-600 dark:text-red-400" role="alert">
                      {{ userSearchError }}
                    </p>
                    <p v-else-if="userResults.length === 0" class="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                      Aucun utilisateur actif ne correspond à « {{ userQuery }} ».
                    </p>
                    <ul
                      v-show="!isSearchingUsers && !userSearchError && userResults.length > 0"
                      id="team-user-listbox"
                      role="listbox"
                      aria-labelledby="team-user-label"
                      class="max-h-60 overflow-y-auto py-1"
                    >
                      <li
                        v-for="(user, optionIndex) in userResults"
                        :id="`team-user-option-${optionIndex}`"
                        :key="user.id"
                        role="option"
                        :aria-selected="optionIndex === activeOptionIndex"
                        class="flex cursor-pointer items-center gap-3 px-3 py-2"
                        :class="optionIndex === activeOptionIndex
                          ? 'bg-brand-red-50 dark:bg-brand-red-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                        @mouseenter="activeOptionIndex = optionIndex"
                        @mousedown.prevent
                        @click="selectUser(user)"
                      >
                        <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-600 dark:text-gray-200">
                          <img
                            v-if="photoUrl(user)"
                            :src="photoUrl(user)!"
                            alt=""
                            class="h-full w-full object-cover"
                            loading="lazy"
                            @error="markPhotoBroken(user.photo_external_id)"
                          >
                          <span v-else aria-hidden="true">{{ initials(user.fullName) }}</span>
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ user.fullName }}</p>
                          <p class="truncate text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                        </div>
                        <span
                          v-if="memberUserIds.has(user.id)"
                          class="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                          Déjà dans l'équipe
                        </span>
                      </li>
                    </ul>
                  </div>
                  <p v-if="!userQuery && !isSearchingUsers && userResults.length > 0" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Affichage des 20 premiers utilisateurs actifs : saisissez un nom ou un e-mail pour affiner.
                  </p>
                </template>
                <p v-if="userError" id="team-user-error" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ userError }}
                </p>
              </div>

              <!-- Poste -->
              <div>
                <label for="team-position" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Poste / fonction <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="team-position"
                  ref="positionInput"
                  v-model="form.position"
                  type="text"
                  maxlength="255"
                  required
                  :aria-invalid="!!positionError"
                  :aria-describedby="positionError ? 'team-position-error' : undefined"
                  :class="inputClass"
                  placeholder="Ex. : Chef de service, chargée de mission…"
                >
                <p v-if="positionError" id="team-position-error" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ positionError }}
                </p>
              </div>

              <!-- Dates -->
              <fieldset>
                <legend class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Période <span class="font-normal text-gray-500 dark:text-gray-400">(facultative)</span>
                </legend>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label for="team-start-date" class="mb-1 block text-xs text-gray-500 dark:text-gray-400">Date de début</label>
                    <input id="team-start-date" v-model="form.start_date" type="date" :class="inputClass">
                  </div>
                  <div>
                    <label for="team-end-date" class="mb-1 block text-xs text-gray-500 dark:text-gray-400">Date de fin</label>
                    <input
                      id="team-end-date"
                      v-model="form.end_date"
                      type="date"
                      :min="form.start_date || undefined"
                      :aria-invalid="!!datesError"
                      :aria-describedby="datesError ? 'team-dates-error' : 'team-dates-help'"
                      :class="inputClass"
                    >
                  </div>
                </div>
                <p v-if="datesError" id="team-dates-error" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ datesError }}
                </p>
                <p v-else id="team-dates-help" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Une date de fin passée signale un ancien membre (affiché en retrait ici).
                </p>
              </fieldset>

              <!-- Actif -->
              <label class="flex cursor-pointer items-start gap-3">
                <input
                  v-model="form.active"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 rounded border-gray-300 bg-white text-brand-red-600 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700"
                >
                <span>
                  <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">Membre actif</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">Décochez pour conserver l'historique sans mettre la personne en avant.</span>
                </span>
              </label>

              <p v-if="formError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300" role="alert">
                {{ formError }}
              </p>
            </div>

            <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSaving"
                @click="closeFormModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-800"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
                {{ isSaving ? 'Enregistrement…' : (editingMember ? 'Enregistrer' : 'Ajouter') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modale suppression -->
    <Teleport to="body">
      <div
        v-if="deletingMember"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div
          ref="deleteDialogEl"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="team-delete-title"
          aria-describedby="team-delete-desc"
          class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800"
          @keydown="onDeleteDialogKeydown"
        >
          <div class="p-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'user-minus']" class="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <h3 id="team-delete-title" class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Retirer ce membre de l'équipe ?
            </h3>
            <p id="team-delete-desc" class="text-sm text-gray-500 dark:text-gray-400">
              <strong class="text-gray-900 dark:text-white">{{ memberName(deletingMember) }}</strong>
              ({{ deletingMember.position }}) ne sera plus affiché sur la fiche du service.
              Son compte utilisateur n'est pas supprimé.
            </p>
            <p v-if="deleteError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300" role="alert">
              {{ deleteError }}
            </p>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              ref="deleteCancelButton"
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isDeleting"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-800"
              :disabled="isDeleting"
              @click="confirmDelete"
            >
              <font-awesome-icon v-if="isDeleting" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
              {{ isDeleting ? 'Suppression…' : 'Retirer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
