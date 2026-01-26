<script setup lang="ts">
import type { ProgramType, ProgramWithDetails, PublicationStatus } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getProgramById,
  updateProgram,
  programTypeLabels,
  publicationStatusLabels,
} = useProgramsApi()

// États
const loading = ref(true)
const isSubmitting = ref(false)
const program = ref<ProgramWithDetails | null>(null)

// État du formulaire
const form = ref({
  code: '',
  title: '',
  subtitle: '',
  slug: '',
  description: '',
  teaching_methods: '',
  type: 'master' as ProgramType,
  duration_months: null as number | null,
  credits: null as number | null,
  degree_awarded: '',
  required_degree: '',
  status: 'draft' as PublicationStatus,
})

// Chargement du programme
async function loadProgram() {
  loading.value = true
  try {
    program.value = await getProgramById(route.params.id as string)
    // Charger les données dans le formulaire
    form.value = {
      code: program.value.code,
      title: program.value.title,
      subtitle: program.value.subtitle || '',
      slug: program.value.slug,
      description: program.value.description || '',
      teaching_methods: program.value.teaching_methods || '',
      type: program.value.type,
      duration_months: program.value.duration_months,
      credits: program.value.credits,
      degree_awarded: program.value.degree_awarded || '',
      required_degree: program.value.required_degree || '',
      status: program.value.status,
    }
  } catch (e) {
    console.error('Erreur lors du chargement du programme:', e)
    alert('Programme non trouvé')
    router.replace('/admin/formations/programmes')
  } finally {
    loading.value = false
  }
}

onMounted(loadProgram)

// Génération de slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// États de modification
const hasChanges = ref(false)
const showDiscardModal = ref(false)

// Détecter les changements du formulaire
watch(form, () => {
  hasChanges.value = true
}, { deep: true })

// Soumettre le formulaire
const submitForm = async () => {
  if (!program.value) return

  isSubmitting.value = true
  try {
    await updateProgram(program.value.id, {
      code: form.value.code,
      title: form.value.title,
      subtitle: form.value.subtitle || null,
      slug: form.value.slug,
      description: form.value.description || null,
      teaching_methods: form.value.teaching_methods || null,
      type: form.value.type,
      duration_months: form.value.duration_months,
      credits: form.value.credits,
      degree_awarded: form.value.degree_awarded || null,
      required_degree: form.value.required_degree || null,
      status: form.value.status,
    })

    hasChanges.value = false
    router.push(`/admin/formations/programmes/${program.value.id}`)
  } catch (error: unknown) {
    console.error('Erreur lors de la mise à jour:', error)
    const fetchError = error as { data?: { detail?: string } }
    const detail = fetchError.data?.detail || 'Impossible de mettre à jour le programme'
    alert(detail)
  } finally {
    isSubmitting.value = false
  }
}

// Annuler
const handleCancel = () => {
  if (hasChanges.value) {
    showDiscardModal.value = true
  } else {
    router.push(`/admin/formations/programmes/${program.value?.id}`)
  }
}

const confirmDiscard = () => {
  showDiscardModal.value = false
  router.push(`/admin/formations/programmes/${program.value?.id}`)
}

// Régénérer le slug
const regenerateSlug = () => {
  form.value.slug = generateSlug(form.value.title)
}

// Options pour les selects
const programTypes: { value: ProgramType; label: string }[] = [
  { value: 'master', label: 'Master' },
  { value: 'doctorate', label: 'Doctorat' },
  { value: 'university_diploma', label: 'Diplôme d\'Université (DU)' },
  { value: 'certificate', label: 'Formation certifiante' },
]

const publicationStatuses: { value: PublicationStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'archived', label: 'Archivé' },
]
</script>

<template>
  <!-- État de chargement -->
  <div v-if="loading" class="flex items-center justify-center py-12">
    <div class="text-center">
      <font-awesome-icon icon="fa-solid fa-spinner" class="w-8 h-8 animate-spin text-blue-600" />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Chargement du programme...</p>
    </div>
  </div>

  <div v-else-if="program" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <button
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          @click="handleCancel"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-5 h-5" />
        </button>
        <div>
          <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <NuxtLink to="/admin/formations/programmes" class="hover:text-blue-600 dark:hover:text-blue-400">
              Programmes
            </NuxtLink>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3" />
            <NuxtLink :to="`/admin/formations/programmes/${program.id}`" class="hover:text-blue-600 dark:hover:text-blue-400">
              {{ program.title }}
            </NuxtLink>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3" />
            <span class="text-gray-900 dark:text-white">Modifier</span>
          </nav>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Modifier le programme
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="handleCancel"
        >
          Annuler
        </button>
        <button
          type="submit"
          form="edit-form"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="w-4 h-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-save" class="w-4 h-4" />
          Enregistrer
        </button>
      </div>
    </div>

    <!-- Formulaire -->
    <form id="edit-form" @submit.prevent="submitForm" class="space-y-6">
      <!-- Informations générales -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-info-circle" class="w-5 h-5 text-blue-500" />
          Informations générales
        </h2>

        <div class="space-y-6">
          <!-- Code et Titre -->
          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label for="code" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code <span class="text-red-500">*</span>
              </label>
              <input
                id="code"
                v-model="form.code"
                type="text"
                required
                placeholder="MPAGD"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div class="sm:col-span-2">
              <label for="title" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre <span class="text-red-500">*</span>
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                placeholder="Master en..."
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Sous-titre -->
          <div>
            <label for="subtitle" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sous-titre
            </label>
            <input
              id="subtitle"
              v-model="form.subtitle"
              type="text"
              placeholder="Une courte description..."
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Slug -->
          <div>
            <label for="slug" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug (URL) <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                id="slug"
                v-model="form.slug"
                type="text"
                required
                placeholder="master-en-..."
                class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Régénérer depuis le titre"
                @click="regenerateSlug"
              >
                <font-awesome-icon icon="fa-solid fa-rotate" class="w-4 h-4" />
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL: /formations/{{ form.slug || '...' }}
            </p>
          </div>

          <!-- Type -->
          <div class="sm:max-w-xs">
            <label for="type" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type de formation <span class="text-red-500">*</span>
            </label>
            <select
              id="type"
              v-model="form.type"
              required
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="pt in programTypes" :key="pt.value" :value="pt.value">
                {{ pt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-align-left" class="w-5 h-5 text-green-500" />
          Description
        </h2>

        <div class="space-y-6">
          <div>
            <label for="description" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description complète
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="6"
              placeholder="Décrivez le programme en détail..."
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ form.description.length }} caractères
            </p>
          </div>

          <div>
            <label for="teaching_methods" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Méthodes d'enseignement
            </label>
            <textarea
              id="teaching_methods"
              v-model="form.teaching_methods"
              rows="4"
              placeholder="Décrivez les méthodes pédagogiques utilisées..."
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Détails académiques -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-5 h-5 text-purple-500" />
          Détails académiques
        </h2>

        <div class="space-y-6">
          <!-- Durée et Crédits -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="duration_months" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Durée (en mois)
              </label>
              <input
                id="duration_months"
                v-model.number="form.duration_months"
                type="number"
                min="1"
                max="120"
                placeholder="24"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Exemple: 24 mois = 2 ans
              </p>
            </div>
            <div>
              <label for="credits" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Crédits ECTS
              </label>
              <input
                id="credits"
                v-model.number="form.credits"
                type="number"
                min="0"
                max="500"
                placeholder="120"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Diplôme délivré et requis -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="degree_awarded" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme délivré
              </label>
              <input
                id="degree_awarded"
                v-model="form.degree_awarded"
                type="text"
                placeholder="Master professionnel"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label for="required_degree" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme requis
              </label>
              <input
                id="required_degree"
                v-model="form.required_degree"
                type="text"
                placeholder="Licence ou équivalent Bac+3"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Options de publication -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-cog" class="w-5 h-5 text-gray-500" />
          Publication
        </h2>

        <div class="sm:max-w-xs">
          <label for="status" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Statut de publication
          </label>
          <select
            id="status"
            v-model="form.status"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="ps in publicationStatuses" :key="ps.value" :value="ps.value">
              {{ ps.label }}
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Seuls les programmes publiés sont visibles sur le site public.
          </p>
        </div>
      </div>

      <!-- Boutons -->
      <div class="flex items-center justify-between rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <span v-if="hasChanges" class="text-yellow-600 dark:text-yellow-400">
            <font-awesome-icon icon="fa-solid fa-circle" class="mr-1 w-2 h-2" />
            Modifications non enregistrées
          </span>
          <span v-else class="text-green-600 dark:text-green-400">
            <font-awesome-icon icon="fa-solid fa-check" class="mr-1 w-3 h-3" />
            Aucune modification
          </span>
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="handleCancel"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="w-4 h-4 animate-spin" />
            <font-awesome-icon v-else icon="fa-solid fa-save" class="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </form>

    <!-- Modal de confirmation d'annulation -->
    <Teleport to="body">
      <div
        v-if="showDiscardModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDiscardModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifications non enregistrées
            </h3>
          </div>

          <p class="mb-6 text-gray-600 dark:text-gray-300">
            Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter sans enregistrer ?
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDiscardModal = false"
            >
              Continuer l'édition
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="confirmDiscard"
            >
              Quitter sans enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- État non trouvé -->
  <div v-else class="flex flex-col items-center justify-center py-12">
    <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
      <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-8 h-8 text-gray-400" />
    </div>
    <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
      Programme non trouvé
    </h3>
    <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
      Ce programme n'existe pas ou a été supprimé.
    </p>
    <NuxtLink
      to="/admin/formations/programmes"
      class="text-sm text-blue-600 hover:underline dark:text-blue-400"
    >
      Retour à la liste des programmes
    </NuxtLink>
  </div>
</template>
