<script setup lang="ts">
import type { Formation } from '~/composables/useMockData'
import type { OutputData } from '@editorjs/editorjs'
import type { EditorJSContent } from '@bank/mock-data/formations'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  formations,
  departments,
  getDepartmentById
} = useMockData()

// Récupérer le programme
const program = computed(() => {
  return formations.value.find(f => f.id === route.params.id)
})

// Rediriger si le programme n'existe pas
watchEffect(() => {
  if (!program.value && route.params.id) {
    router.replace('/admin/formations/programmes')
  }
})

// État du formulaire
const form = ref({
  title_fr: '',
  title_en: '',
  slug: '',
  formation_type: 'master' as Formation['formation_type'],
  short_description_fr: '',
  short_description_en: '',
  department_id: '',
  campus: 'alexandrie' as Formation['campus'],
  duration_fr: '',
  duration_en: '',
  credits: 120,
  diploma_fr: '',
  diploma_en: '',
  image: '',
  is_published: false,
  is_featured: false,
  application_open: false
})

// Contenu EditorJS (séparé du formulaire pour éviter les problèmes de réactivité)
const contentFr = ref<OutputData | undefined>(undefined)
const contentEn = ref<OutputData | undefined>(undefined)

// Tab active pour l'éditeur
const activeContentTab = ref<'fr' | 'en'>('fr')

// Charger les données du programme dans le formulaire
watchEffect(() => {
  if (program.value) {
    form.value = {
      title_fr: program.value.title_fr,
      title_en: program.value.title_en || '',
      slug: program.value.slug,
      formation_type: program.value.formation_type,
      short_description_fr: program.value.short_description_fr,
      short_description_en: program.value.short_description_en || '',
      department_id: program.value.department_id,
      campus: program.value.campus,
      duration_fr: program.value.duration_fr,
      duration_en: program.value.duration_en || '',
      credits: program.value.credits || 0,
      diploma_fr: program.value.diploma_fr || '',
      diploma_en: program.value.diploma_en || '',
      image: program.value.image || '',
      is_published: program.value.is_published,
      is_featured: program.value.is_featured,
      application_open: program.value.application_open
    }
    // Charger le contenu EditorJS
    contentFr.value = program.value.content_fr as OutputData | undefined
    contentEn.value = program.value.content_en as OutputData | undefined
  }
})

// Génération de slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// États
const isSubmitting = ref(false)
const hasChanges = ref(false)
const showDiscardModal = ref(false)

// Détecter les changements du formulaire
watch(form, () => {
  hasChanges.value = true
}, { deep: true })

// Détecter les changements du contenu EditorJS
const onContentChange = () => {
  hasChanges.value = true
}

// Soumettre le formulaire
const submitForm = async () => {
  if (!program.value) return

  isSubmitting.value = true
  try {
    const payload = {
      ...form.value,
      content_fr: contentFr.value,
      content_en: contentEn.value
    }
    console.log('Updating program:', program.value.id, payload)
    // En production: PUT /api/admin/programs/{id}

    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 500))

    hasChanges.value = false
    router.push(`/admin/formations/programmes/${program.value.id}`)
  } catch (error) {
    console.error('Error updating program:', error)
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
  form.value.slug = generateSlug(form.value.title_fr)
}
</script>

<template>
  <div v-if="program" class="space-y-6">
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
              {{ program.title_fr }}
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
          <!-- Titres -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="title_fr" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre (FR) <span class="text-red-500">*</span>
              </label>
              <input
                id="title_fr"
                v-model="form.title_fr"
                type="text"
                required
                placeholder="Master en..."
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label for="title_en" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre (EN)
              </label>
              <input
                id="title_en"
                v-model="form.title_en"
                type="text"
                placeholder="Master in..."
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
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

          <!-- Type et Département -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="formation_type" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type de formation <span class="text-red-500">*</span>
              </label>
              <select
                id="formation_type"
                v-model="form.formation_type"
                required
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="master">Master</option>
                <option value="doctorat">Doctorat</option>
                <option value="du">Diplôme d'Université (DU)</option>
                <option value="certifiante">Formation certifiante</option>
              </select>
            </div>
            <div>
              <label for="department_id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Département <span class="text-red-500">*</span>
              </label>
              <select
                id="department_id"
                v-model="form.department_id"
                required
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name_fr }}
                </option>
              </select>
            </div>
          </div>

          <!-- Campus -->
          <div>
            <label for="campus" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Campus <span class="text-red-500">*</span>
            </label>
            <select
              id="campus"
              v-model="form.campus"
              required
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:max-w-xs"
            >
              <option value="alexandrie">Alexandrie</option>
              <option value="externalise">Campus externalisé</option>
              <option value="en_ligne">En ligne</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Descriptions -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-align-left" class="w-5 h-5 text-green-500" />
          Description
        </h2>

        <div class="space-y-6">
          <div>
            <label for="short_description_fr" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description courte (FR) <span class="text-red-500">*</span>
            </label>
            <textarea
              id="short_description_fr"
              v-model="form.short_description_fr"
              rows="4"
              required
              placeholder="Décrivez brièvement la formation..."
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ form.short_description_fr.length }} caractères
            </p>
          </div>

          <div>
            <label for="short_description_en" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description courte (EN)
            </label>
            <textarea
              id="short_description_en"
              v-model="form.short_description_en"
              rows="4"
              placeholder="Briefly describe the program..."
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Contenu détaillé (EditorJS) -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-file-lines" class="w-5 h-5 text-indigo-500" />
          Contenu détaillé
        </h2>
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Rédigez le contenu complet de la formation avec l'éditeur riche (titres, listes, images, etc.)
        </p>

        <!-- Tabs FR/EN -->
        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex gap-4">
            <button
              type="button"
              :class="[
                'pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
                activeContentTab === 'fr'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              ]"
              @click="activeContentTab = 'fr'"
            >
              <font-awesome-icon icon="fa-solid fa-flag" class="w-3 h-3 mr-1" />
              Français
            </button>
            <button
              type="button"
              :class="[
                'pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
                activeContentTab === 'en'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              ]"
              @click="activeContentTab = 'en'"
            >
              <font-awesome-icon icon="fa-solid fa-globe" class="w-3 h-3 mr-1" />
              English
            </button>
          </nav>
        </div>

        <!-- Éditeur Français -->
        <div v-show="activeContentTab === 'fr'">
          <ClientOnly>
            <EditorJS
              v-model="contentFr"
              placeholder="Décrivez en détail la formation, les objectifs, le programme, les débouchés..."
              :min-height="400"
              @change="onContentChange"
            />
            <template #fallback>
              <div class="flex h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <div class="text-center">
                  <font-awesome-icon icon="fa-solid fa-spinner" class="w-6 h-6 animate-spin text-gray-400" />
                  <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Chargement de l'éditeur...</p>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Éditeur Anglais -->
        <div v-show="activeContentTab === 'en'">
          <ClientOnly>
            <EditorJS
              v-model="contentEn"
              placeholder="Describe the program in detail, objectives, curriculum, career opportunities..."
              :min-height="400"
              @change="onContentChange"
            />
            <template #fallback>
              <div class="flex h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <div class="text-center">
                  <font-awesome-icon icon="fa-solid fa-spinner" class="w-6 h-6 animate-spin text-gray-400" />
                  <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading editor...</p>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <!-- Détails académiques -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-5 h-5 text-purple-500" />
          Détails académiques
        </h2>

        <div class="space-y-6">
          <!-- Durée -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="duration_fr" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Durée (FR)
              </label>
              <input
                id="duration_fr"
                v-model="form.duration_fr"
                type="text"
                placeholder="2 ans (4 semestres)"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label for="duration_en" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Durée (EN)
              </label>
              <input
                id="duration_en"
                v-model="form.duration_en"
                type="text"
                placeholder="2 years (4 semesters)"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Crédits -->
          <div class="sm:max-w-xs">
            <label for="credits" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Crédits ECTS
            </label>
            <input
              id="credits"
              v-model.number="form.credits"
              type="number"
              min="0"
              max="500"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Diplôme -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="diploma_fr" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme délivré (FR)
              </label>
              <input
                id="diploma_fr"
                v-model="form.diploma_fr"
                type="text"
                placeholder="Master professionnel"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label for="diploma_en" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme délivré (EN)
              </label>
              <input
                id="diploma_en"
                v-model="form.diploma_en"
                type="text"
                placeholder="Professional Master's Degree"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-image" class="w-5 h-5 text-cyan-500" />
          Image
        </h2>

        <div>
          <label for="image" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            URL de l'image
          </label>
          <input
            id="image"
            v-model="form.image"
            type="url"
            placeholder="https://example.com/image.jpg"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Entrez l'URL d'une image (format recommandé : 1200x630px)
          </p>

          <!-- Preview -->
          <div v-if="form.image" class="mt-4">
            <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Aperçu :</p>
            <div
              class="h-40 w-full max-w-md rounded-lg bg-cover bg-center"
              :style="{ backgroundImage: `url(${form.image})` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Options de publication -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-cog" class="w-5 h-5 text-gray-500" />
          Options de publication
        </h2>

        <div class="space-y-4">
          <label class="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
            <input
              v-model="form.is_published"
              type="checkbox"
              class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Publié</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Le programme sera visible sur le site public
              </p>
            </div>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
            <input
              v-model="form.is_featured"
              type="checkbox"
              class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Mis en avant</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Le programme apparaîtra sur la page d'accueil et en haut des listes
              </p>
            </div>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
            <input
              v-model="form.application_open"
              type="checkbox"
              class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Candidatures ouvertes</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Les candidats pourront postuler à ce programme
              </p>
            </div>
          </label>
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
