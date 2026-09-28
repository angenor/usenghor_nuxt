<script setup lang="ts">
/**
 * Création d'un service (ou d'un pôle) — admin « Organisation ».
 *
 * Même formulaire que la page du service (onglets Général et Présentation) ;
 * les autres onglets sont visibles mais verrouillés tant que le service n'existe pas.
 * Pré-remplissage : `?secteur=<id>` et `?parent=<id>` (le secteur du parent prime).
 * Après création : page du service sur l'onglet « Équipe », pour enchaîner.
 */
import type { ServiceDisplay } from '~/composables/useServicesApi'
import type { ServiceRead } from '~/types/api'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { getAllServices, getSectorsForSelect } = useServicesApi({ fallbackToMock: false })
const { hasPermission } = usePermissions()

const canEdit = computed(() => hasPermission('organization.edit'))

// ============================================================================
// Données de référence et pré-remplissage
// ============================================================================

const sectors = ref<Array<{ id: string, name: string, code: string }>>([])
const allServices = ref<ServiceDisplay[]>([])
const isLoading = ref(true)
const initial = ref<Partial<ServiceRead> | null>(null)
const prefillNotice = ref<string | null>(null)

function queryString(value: unknown): string | null {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' && v ? v : null
}

onMounted(async () => {
  await Promise.all([
    getSectorsForSelect().then(list => (sectors.value = list)).catch((err) => {
      console.error('Erreur chargement des secteurs:', err)
    }),
    getAllServices().then(list => (allServices.value = list)).catch((err) => {
      console.error('Erreur chargement des services:', err)
    }),
  ])

  let sectorId = queryString(route.query.secteur)
  let parentId = queryString(route.query.parent)

  if (sectorId && !sectors.value.some(s => s.id === sectorId)) {
    sectorId = null
  }

  if (parentId) {
    const parent = allServices.value.find(s => s.id === parentId)
    if (!parent) {
      parentId = null
      prefillNotice.value = 'Le service parent indiqué est introuvable : le nouveau service sera créé au premier niveau.'
    }
    else if (parent.parent_id) {
      // Un seul niveau : un pôle ne peut pas avoir de pôle
      parentId = null
      prefillNotice.value = `« ${parent.name} » est lui-même un pôle : le nouveau service sera créé au premier niveau.`
    }
    else {
      // Le pôle appartient forcément au secteur de son parent
      sectorId = parent.sector_id || sectorId
    }
  }

  initial.value = { sector_id: sectorId, parent_id: parentId, active: true }
  isLoading.value = false
})

// ============================================================================
// Onglets (seuls Général et Présentation sont disponibles avant création)
// ============================================================================

type FormTab = 'general' | 'presentation'
const activeTab = ref<FormTab>('general')

const lockedTabs = [
  { key: 'equipe', label: 'Équipe', icon: 'users' },
  { key: 'objectifs', label: 'Objectifs', icon: 'bullseye' },
  { key: 'realisations', label: 'Réalisations', icon: 'trophy' },
  { key: 'projets', label: 'Projets', icon: 'diagram-project' },
  { key: 'medias', label: 'Médias', icon: 'images' },
]

// ============================================================================
// Formulaire
// ============================================================================

interface ServiceFormHandle {
  save: () => Promise<boolean>
  isSaving: boolean
  form: { name: string, sector_id: string, parent_id: string | null }
}
const formRef = ref<ServiceFormHandle | null>(null)
const isDirty = ref(false)
const isSaving = computed(() => formRef.value?.isSaving ?? false)

// Contexte courant (suit les choix faits dans le formulaire)
const currentSectorId = computed(() => formRef.value?.form.sector_id || initial.value?.sector_id || null)
const currentParentId = computed(() => formRef.value?.form.parent_id ?? initial.value?.parent_id ?? null)
const currentSector = computed(() => sectors.value.find(s => s.id === currentSectorId.value) || null)
const currentParent = computed(() => allServices.value.find(s => s.id === currentParentId.value) || null)
const isPole = computed(() => !!currentParent.value)
const typedName = computed(() => formRef.value?.form.name?.trim() || '')

const backLink = computed(() => {
  if (currentParent.value) return `/admin/organisation/services/${currentParent.value.id}`
  return currentSectorId.value ? `/admin/organisation?secteur=${currentSectorId.value}` : '/admin/organisation'
})

const flash = useState<{ type: 'success' | 'info', text: string } | null>('admin-organisation-service-flash', () => null)

async function create() {
  if (!formRef.value || !canEdit.value) return
  await formRef.value.save()
}

async function onSaved(payload: { id: string, created: boolean }) {
  const label = isPole.value ? 'Pôle créé' : 'Service créé'
  flash.value = {
    type: 'success',
    text: `${label}. Vous pouvez maintenant compléter son équipe, puis ses objectifs, réalisations, projets et médias.`,
  }
  bypassLeaveGuard = true
  await navigateTo(`/admin/organisation/services/${payload.id}?onglet=equipe`)
}

// ============================================================================
// Garde « modifications non enregistrées »
// ============================================================================

const LEAVE_MESSAGE = 'Le nouveau service n\'a pas été créé : les informations saisies seront perdues. Quitter la page quand même ?'
let bypassLeaveGuard = false

onBeforeRouteLeave(() => {
  if (isDirty.value && !bypassLeaveGuard && !window.confirm(LEAVE_MESSAGE)) return false
})

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (isDirty.value && !bypassLeaveGuard) {
    event.preventDefault()
    event.returnValue = ''
  }
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's' && !isLoading.value) {
    event.preventDefault()
    create()
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

useHead(() => ({
  title: `${isPole.value ? 'Nouveau pôle' : 'Nouveau service'} · Organisation`,
}))
</script>

<template>
  <div>
    <!-- Permission manquante -->
    <div v-if="!canEdit" class="flex flex-col items-center justify-center py-16 text-center">
      <font-awesome-icon :icon="['fas', 'lock']" class="h-16 w-16 text-gray-300 dark:text-gray-600" />
      <h1 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
        Création non autorisée
      </h1>
      <p class="mt-2 max-w-md text-gray-500 dark:text-gray-400">
        La permission « Modifier l'organisation » est nécessaire pour créer un service.
      </p>
      <NuxtLink
        to="/admin/organisation"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4 rtl:-scale-x-100" />
        Retour à l'organisation
      </NuxtLink>
    </div>

    <!-- Chargement -->
    <div v-else-if="isLoading" class="flex min-h-[400px] items-center justify-center">
      <div class="text-center">
        <font-awesome-icon :icon="['fas', 'spinner']" class="mb-4 h-8 w-8 animate-spin text-brand-red-600" />
        <p class="text-gray-500 dark:text-gray-400">
          Préparation du formulaire…
        </p>
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
          <template v-if="currentSector">
            <li aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3 rtl:-scale-x-100" />
            </li>
            <li>
              <NuxtLink :to="`/admin/organisation?secteur=${currentSector.id}`" class="hover:text-brand-red-600 hover:underline dark:hover:text-brand-red-400">
                {{ currentSector.name }}
              </NuxtLink>
            </li>
          </template>
          <template v-if="currentParent">
            <li aria-hidden="true">
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3 rtl:-scale-x-100" />
            </li>
            <li>
              <NuxtLink :to="`/admin/organisation/services/${currentParent.id}`" class="hover:text-brand-red-600 hover:underline dark:hover:text-brand-red-400">
                {{ currentParent.sigle || currentParent.name }}
              </NuxtLink>
            </li>
          </template>
          <li aria-hidden="true">
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3 rtl:-scale-x-100" />
          </li>
          <li aria-current="page" class="font-medium text-gray-900 dark:text-white">
            {{ isPole ? 'Nouveau pôle' : 'Nouveau service' }}
          </li>
        </ol>
      </nav>

      <!-- En-tête -->
      <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex min-w-0 items-start gap-4">
          <NuxtLink
            :to="backLink"
            class="mt-1 flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="Retour"
            aria-label="Retour"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5 rtl:-scale-x-100" />
          </NuxtLink>
          <span
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-red-50 text-brand-red-600 dark:bg-brand-red-900/30 dark:text-brand-red-300"
            aria-hidden="true"
          >
            <font-awesome-icon :icon="['fas', isPole ? 'code-branch' : 'plus']" class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ isPole ? 'Nouveau pôle' : 'Nouveau service' }}
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <template v-if="typedName">
                {{ typedName }}
              </template>
              <template v-else-if="currentParent">
                Pôle rattaché à {{ currentParent.name }}
              </template>
              <template v-else>
                Renseignez les informations générales, puis la présentation du service.
              </template>
            </p>
          </div>
        </div>

        <div class="flex flex-shrink-0 flex-wrap items-center gap-2">
          <span
            v-if="isDirty"
            class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            role="status"
          >
            <span class="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
            Non enregistré
          </span>
          <NuxtLink
            :to="backLink"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Annuler
          </NuxtLink>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSaving"
            title="Créer (Ctrl + S)"
            @click="create"
          >
            <font-awesome-icon :icon="['fas', isSaving ? 'spinner' : 'check']" :class="{ 'animate-spin': isSaving }" class="h-4 w-4" />
            {{ isSaving ? 'Création…' : (isPole ? 'Créer le pôle' : 'Créer le service') }}
          </button>
        </div>
      </div>

      <div
        v-if="prefillNotice"
        role="status"
        class="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
      >
        <font-awesome-icon :icon="['fas', 'info-circle']" class="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span class="flex-1">{{ prefillNotice }}</span>
      </div>

      <!-- Onglets -->
      <div class="sticky top-16 z-20 -mx-6 mb-6 border-b border-gray-200 bg-gray-50/95 px-6 backdrop-blur dark:border-gray-700 dark:bg-gray-950/95">
        <nav
          role="tablist"
          aria-label="Rubriques du service"
          class="admin-scrollbar -mb-px flex gap-1 overflow-x-auto"
        >
          <button
            v-for="tab in ([
              { key: 'general', label: 'Général', icon: 'info-circle' },
              { key: 'presentation', label: 'Présentation', icon: 'align-left' },
            ] as const)"
            :id="`service-tab-${tab.key}`"
            :key="tab.key"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.key"
            aria-controls="service-panel-form"
            class="flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors"
            :class="activeTab === tab.key
              ? 'border-brand-red-600 text-brand-red-600 dark:text-brand-red-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = tab.key"
          >
            <font-awesome-icon :icon="['fas', tab.icon]" class="h-4 w-4" />
            {{ tab.label }}
          </button>
          <span
            v-for="tab in lockedTabs"
            :key="tab.key"
            role="tab"
            aria-disabled="true"
            :aria-selected="false"
            tabindex="-1"
            class="flex flex-shrink-0 cursor-not-allowed items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-gray-300 dark:text-gray-600"
            title="Enregistrez d'abord le service"
          >
            <font-awesome-icon :icon="['fas', tab.icon]" class="h-4 w-4" />
            {{ tab.label }}
            <font-awesome-icon :icon="['fas', 'lock']" class="h-3 w-3" />
          </span>
        </nav>
      </div>

      <div id="service-panel-form" role="tabpanel" :aria-labelledby="`service-tab-${activeTab}`">
        <AdminOrganisationServiceForm
          ref="formRef"
          :initial="initial"
          :tab="activeTab"
          :sectors="sectors"
          :services="allServices"
          @saved="onSaved"
          @dirty-change="v => (isDirty = v)"
          @request-tab="t => (activeTab = t)"
        >
          <template #general-after>
            <p class="flex items-start gap-2 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
              <font-awesome-icon :icon="['fas', 'circle-info']" class="mt-0.5 h-4 w-4 flex-shrink-0" />
              L'équipe, les objectifs, les réalisations, les projets et les médias se gèrent dans leurs onglets, une fois le service créé.
            </p>
          </template>
        </AdminOrganisationServiceForm>

        <div class="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            v-if="activeTab === 'general'"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="activeTab = 'presentation'"
          >
            Présentation
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3.5 w-3.5 rtl:-scale-x-100" />
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSaving"
            @click="create"
          >
            <font-awesome-icon :icon="['fas', isSaving ? 'spinner' : 'check']" :class="{ 'animate-spin': isSaving }" class="h-4 w-4" />
            {{ isSaving ? 'Création…' : (isPole ? 'Créer le pôle' : 'Créer le service') }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
