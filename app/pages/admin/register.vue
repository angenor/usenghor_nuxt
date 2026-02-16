<script setup lang="ts">
import { useAdminRegistration } from '~/composables/useAdminRegistration'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()

if (authStore.isAuthenticated) {
  router.replace('/admin/candidatures/appels')
}

const {
  isLoading,
  isSubmitting,
  isSuccess,
  formData,
  formErrors,
  serverError,
  salutationOptions,
  sectorOptions,
  campusOptions,
  filteredServiceOptions,
  loadOptions,
  submitRegistration,
  onSectorChange,
  pendingPhotoFile,
  showPhotoEditor,
  isUploadingPhoto,
  photoPreviewUrl,
  handlePhotoUpload,
  saveEditedPhoto,
  cancelPhotoEditor,
  removePhoto,
} = useAdminRegistration()

// Step management
const currentStep = ref(1)
const totalSteps = 4
const direction = ref('forward')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const steps = [
  {
    number: 1,
    title: 'Identité',
    icon: ['fas', 'user'],
    message: 'Commençons par faire connaissance',
    description: 'Vos informations personnelles',
  },
  {
    number: 2,
    title: 'Affectation',
    icon: ['fas', 'building'],
    message: 'Où exercez-vous ?',
    description: 'Votre rattachement organisationnel',
  },
  {
    number: 3,
    title: 'Profil',
    icon: ['fas', 'id-card'],
    message: 'Personnalisez votre profil',
    description: 'Photo et liens sociaux',
  },
  {
    number: 4,
    title: 'Sécurité',
    icon: ['fas', 'lock'],
    message: 'Dernière étape !',
    description: 'Choisissez un mot de passe sécurisé',
  },
]

const currentStepData = computed(() => steps[currentStep.value - 1])
const progress = computed(() => (currentStep.value / totalSteps) * 100)
const transitionName = computed(() => direction.value === 'forward' ? 'slide-left' : 'slide-right')

// Biographie avec EditorJS dans un modal
const showBiographyModal = ref(false)
const biographyData = computed({
  get: () => {
    if (!formData.value.biography) {
      return { time: Date.now(), blocks: [], version: '2.28.0' }
    }
    try {
      return JSON.parse(formData.value.biography)
    }
    catch {
      return { time: Date.now(), blocks: [], version: '2.28.0' }
    }
  },
  set: (value) => {
    formData.value.biography = JSON.stringify(value)
  },
})

const biographyPreview = computed(() => {
  const blocks = biographyData.value?.blocks
  if (!blocks || blocks.length === 0) return ''
  return blocks
    .filter((b: { type: string }) => b.type === 'paragraph')
    .map((b: { data?: { text?: string } }) => b.data?.text || '')
    .join(' ')
    .replace(/<[^>]*>/g, '')
    .slice(0, 150)
})

// Validation par étape
function validateCurrentStep() {
  formErrors.value = {}

  if (currentStep.value === 1) {
    if (!formData.value.last_name.trim()) {
      formErrors.value.last_name = 'Le nom est requis'
    }
    if (!formData.value.first_name.trim()) {
      formErrors.value.first_name = 'Le prénom est requis'
    }
    if (!formData.value.email.trim()) {
      formErrors.value.email = 'L\'email est requis'
    }
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.value.email)) {
        formErrors.value.email = 'Format d\'email invalide'
      }
    }
  }
  else if (currentStep.value === 2) {
    if (!formData.value.affectation.sector_id) {
      formErrors.value.sector_id = 'Le secteur est requis'
    }
    if (!formData.value.affectation.service_id) {
      formErrors.value.service_id = 'Le département est requis'
    }
    if (!formData.value.affectation.campus_id) {
      formErrors.value.campus_id = 'Le campus est requis'
    }
  }
  // Étape 3 : tout est optionnel
  else if (currentStep.value === 4) {
    if (!formData.value.password) {
      formErrors.value.password = 'Le mot de passe est requis'
    }
    else {
      const pwd = formData.value.password
      if (pwd.length < 8) {
        formErrors.value.password = 'Minimum 8 caractères'
      }
      else if (!/[A-Z]/.test(pwd)) {
        formErrors.value.password = 'Au moins une majuscule requise'
      }
      else if (!/[a-z]/.test(pwd)) {
        formErrors.value.password = 'Au moins une minuscule requise'
      }
      else if (!/\d/.test(pwd)) {
        formErrors.value.password = 'Au moins un chiffre requis'
      }
    }
    if (!formData.value.password_confirm) {
      formErrors.value.password_confirm = 'La confirmation est requise'
    }
    else if (formData.value.password !== formData.value.password_confirm) {
      formErrors.value.password_confirm = 'Les mots de passe ne correspondent pas'
    }
  }

  return Object.keys(formErrors.value).length === 0
}

function nextStep() {
  if (validateCurrentStep()) {
    direction.value = 'forward'
    currentStep.value = Math.min(currentStep.value + 1, totalSteps)
  }
}

function prevStep() {
  formErrors.value = {}
  direction.value = 'backward'
  currentStep.value = Math.max(currentStep.value - 1, 1)
}

function goToStep(step: number) {
  if (step < currentStep.value) {
    direction.value = 'backward'
    formErrors.value = {}
    currentStep.value = step
  }
}

async function handleSubmit() {
  if (currentStep.value < totalSteps) {
    nextStep()
    return
  }
  if (validateCurrentStep()) {
    await submitRegistration()
  }
}

onMounted(() => {
  loadOptions()
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-blue-900 via-brand-blue-800 to-brand-blue-950">
    <!-- Éléments décoratifs d'arrière-plan -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-brand-blue-500/20 blur-3xl" />
      <div class="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-red-500/10 blur-3xl" />
      <div class="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-blue-400/10 blur-3xl" />
    </div>

    <!-- Conteneur principal -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-4 lg:p-8">
      <Transition name="fade" mode="out-in">
        <!-- Loading -->
        <div v-if="isLoading" key="loading" class="flex items-center justify-center">
          <div class="rounded-3xl border border-white/20 bg-white/80 p-16 shadow-2xl backdrop-blur-2xl dark:bg-gray-900/80">
            <font-awesome-icon :icon="['fas', 'spinner']" class="h-10 w-10 animate-spin text-brand-blue-500" />
          </div>
        </div>

        <!-- Succès -->
        <div v-else-if="isSuccess" key="success" class="w-full max-w-lg">
          <div class="rounded-3xl border border-white/20 bg-white/80 p-10 text-center shadow-2xl backdrop-blur-2xl dark:bg-gray-900/80">
            <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100/80 dark:bg-green-900/30">
              <font-awesome-icon :icon="['fas', 'check']" class="h-10 w-10 text-green-500" />
            </div>
            <h2 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              Inscription réussie !
            </h2>
            <p class="mb-6 text-gray-600 dark:text-gray-400">
              Votre compte a été créé. Un administrateur doit vérifier votre email avant que vous puissiez vous connecter.
            </p>
            <div class="mb-8 rounded-xl bg-amber-50/80 p-4 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-2" />
              Vous recevrez une notification lorsque votre compte sera activé.
            </div>
            <NuxtLink
              to="/admin/login"
              class="inline-flex items-center gap-2 rounded-xl bg-brand-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-blue-600 hover:shadow-lg"
            >
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
              Retour à la connexion
            </NuxtLink>
          </div>
        </div>

        <!-- Formulaire d'inscription -->
        <div v-else key="form" class="w-full max-w-5xl">
          <div class="overflow-hidden rounded-3xl border border-white/20 shadow-2xl lg:grid lg:grid-cols-12">
            <!-- Panneau gauche : Image + branding (desktop) -->
            <div class="relative hidden lg:col-span-4 lg:block">
              <img
                src="https://picsum.photos/seed/senghor-register/800/1200"
                alt=""
                class="absolute inset-0 h-full w-full object-cover"
              >
              <div class="absolute inset-0 bg-gradient-to-b from-brand-blue-900/85 via-brand-blue-800/75 to-brand-blue-900/90 backdrop-blur-[2px]" />
              <div class="relative flex h-full flex-col justify-between p-8">
                <!-- Branding -->
                <div>
                  <h1 class="text-2xl font-bold text-white">
                    Université Senghor
                  </h1>
                  <p class="mt-1 text-sm text-white/60">
                    Créer un compte
                  </p>
                </div>

                <!-- Info étape animée -->
                <div class="space-y-6">
                  <Transition name="fade" mode="out-in">
                    <div :key="currentStep" class="space-y-3">
                      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <font-awesome-icon :icon="currentStepData.icon" class="h-5 w-5 text-white" />
                      </div>
                      <h2 class="text-xl font-semibold text-white">
                        {{ currentStepData.message }}
                      </h2>
                      <p class="text-sm leading-relaxed text-white/70">
                        {{ currentStepData.description }}
                      </p>
                    </div>
                  </Transition>

                  <!-- Indicateurs de progression -->
                  <div class="flex gap-2">
                    <button
                      v-for="step in steps"
                      :key="step.number"
                      class="h-2 rounded-full transition-all duration-300"
                      :class="
                        step.number === currentStep
                          ? 'w-8 bg-white'
                          : step.number < currentStep
                            ? 'w-2 cursor-pointer bg-white/60 hover:bg-white/80'
                            : 'w-2 bg-white/30'
                      "
                      @click="goToStep(step.number)"
                    />
                  </div>
                </div>

                <!-- Lien connexion -->
                <p class="text-sm text-white/50">
                  Déjà un compte ?
                  <NuxtLink to="/admin/login" class="text-white/80 underline transition hover:text-white">
                    Se connecter
                  </NuxtLink>
                </p>
              </div>
            </div>

            <!-- Panneau droit : Formulaire -->
            <div class="bg-white/95 dark:bg-gray-900/95 lg:col-span-8">
              <!-- En-tête mobile -->
              <div class="bg-gradient-to-r from-brand-blue-700 to-brand-blue-900 p-6 lg:hidden">
                <div class="flex items-center justify-between">
                  <div>
                    <h1 class="text-lg font-bold text-white">
                      Créer un compte
                    </h1>
                    <p class="text-sm text-white/70">
                      Université Senghor
                    </p>
                  </div>
                  <Transition name="fade" mode="out-in">
                    <div :key="currentStep" class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <font-awesome-icon :icon="currentStepData.icon" class="h-5 w-5 text-white" />
                    </div>
                  </Transition>
                </div>
                <!-- Barre de progression mobile -->
                <div class="mt-4">
                  <div class="flex items-center justify-between text-xs text-white/70">
                    <span>Étape {{ currentStep }} / {{ totalSteps }}</span>
                    <span>{{ currentStepData.title }}</span>
                  </div>
                  <div class="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
                    <div
                      class="h-full rounded-full bg-white transition-all duration-500 ease-out"
                      :style="{ width: `${progress}%` }"
                    />
                  </div>
                </div>
              </div>

              <!-- Barre de progression desktop -->
              <div class="hidden border-b border-gray-200/50 px-8 pt-8 lg:block dark:border-gray-700/50">
                <div class="flex items-center justify-between">
                  <template v-for="(step, index) in steps" :key="step.number">
                    <button
                      class="flex items-center gap-2"
                      :class="step.number <= currentStep ? 'cursor-pointer' : 'cursor-default'"
                      @click="goToStep(step.number)"
                    >
                      <div
                        class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
                        :class="
                          step.number < currentStep
                            ? 'bg-brand-blue-500 text-white'
                            : step.number === currentStep
                              ? 'bg-brand-blue-500 text-white ring-4 ring-brand-blue-500/20'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                        "
                      >
                        <font-awesome-icon v-if="step.number < currentStep" :icon="['fas', 'check']" class="h-3 w-3" />
                        <span v-else>{{ step.number }}</span>
                      </div>
                      <span
                        class="hidden text-sm font-medium transition-colors xl:inline"
                        :class="step.number <= currentStep ? 'text-brand-blue-600 dark:text-brand-blue-400' : 'text-gray-400'"
                      >
                        {{ step.title }}
                      </span>
                    </button>
                    <div
                      v-if="index < steps.length - 1"
                      class="mx-2 h-px flex-1 transition-colors duration-500"
                      :class="step.number < currentStep ? 'bg-brand-blue-500' : 'bg-gray-200 dark:bg-gray-700'"
                    />
                  </template>
                </div>

                <!-- Message animé -->
                <div class="mt-6 pb-6">
                  <Transition name="fade" mode="out-in">
                    <p :key="currentStepData.message" class="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {{ currentStepData.message }}
                    </p>
                  </Transition>
                </div>
              </div>

              <!-- Message animé mobile -->
              <div class="px-6 pt-6 lg:hidden">
                <Transition name="fade" mode="out-in">
                  <p :key="currentStepData.message" class="text-base font-medium text-gray-800 dark:text-gray-200">
                    {{ currentStepData.message }}
                  </p>
                </Transition>
              </div>

              <!-- Contenu du formulaire -->
              <form class="p-6 lg:p-8" @submit.prevent="handleSubmit">
                <!-- Erreur serveur -->
                <div v-if="serverError" class="mb-6 rounded-xl bg-red-50/80 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
                  {{ serverError }}
                </div>

                <!-- Étapes avec transitions -->
                <Transition :name="transitionName" mode="out-in">
                  <!-- Étape 1 : Identité -->
                  <div v-if="currentStep === 1" key="step1" class="space-y-5">
                    <div>
                      <label for="salutation" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Civilité
                      </label>
                      <select
                        id="salutation"
                        v-model="formData.salutation"
                        class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                      >
                        <option :value="null">
                          -
                        </option>
                        <option v-for="option in salutationOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label for="last_name" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nom <span class="text-red-500">*</span>
                        </label>
                        <input
                          id="last_name"
                          v-model="formData.last_name"
                          type="text"
                          required
                          autocomplete="family-name"
                          class="w-full rounded-xl border bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:bg-gray-800/50 dark:text-white"
                          :class="formErrors.last_name ? 'border-red-500' : 'border-gray-200/80 dark:border-gray-700/50'"
                          placeholder="Dupont"
                        >
                        <p v-if="formErrors.last_name" class="mt-1 text-sm text-red-500">
                          {{ formErrors.last_name }}
                        </p>
                      </div>
                      <div>
                        <label for="first_name" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Prénom <span class="text-red-500">*</span>
                        </label>
                        <input
                          id="first_name"
                          v-model="formData.first_name"
                          type="text"
                          required
                          autocomplete="given-name"
                          class="w-full rounded-xl border bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:bg-gray-800/50 dark:text-white"
                          :class="formErrors.first_name ? 'border-red-500' : 'border-gray-200/80 dark:border-gray-700/50'"
                          placeholder="Jean"
                        >
                        <p v-if="formErrors.first_name" class="mt-1 text-sm text-red-500">
                          {{ formErrors.first_name }}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email <span class="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        v-model="formData.email"
                        type="email"
                        required
                        autocomplete="email"
                        class="w-full rounded-xl border bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:bg-gray-800/50 dark:text-white"
                        :class="formErrors.email ? 'border-red-500' : 'border-gray-200/80 dark:border-gray-700/50'"
                        placeholder="jean.dupont@usenghor.org"
                      >
                      <p v-if="formErrors.email" class="mt-1 text-sm text-red-500">
                        {{ formErrors.email }}
                      </p>
                    </div>
                  </div>

                  <!-- Étape 2 : Affectation -->
                  <div v-else-if="currentStep === 2" key="step2" class="space-y-5">
                    <div class="rounded-xl bg-brand-blue-50/60 p-4 text-sm text-brand-blue-700 dark:bg-brand-blue-900/20 dark:text-brand-blue-400">
                      <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-2" />
                      Votre compte devra être validé par un administrateur avant de pouvoir vous connecter.
                    </div>

                    <div>
                      <label for="sector" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Secteur <span class="text-red-500">*</span>
                      </label>
                      <select
                        id="sector"
                        v-model="formData.affectation.sector_id"
                        required
                        class="w-full rounded-xl border bg-white/50 px-4 py-3 text-gray-900 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:bg-gray-800/50 dark:text-white"
                        :class="formErrors.sector_id ? 'border-red-500' : 'border-gray-200/80 dark:border-gray-700/50'"
                        @change="onSectorChange"
                      >
                        <option :value="null">
                          Sélectionnez un secteur
                        </option>
                        <option v-for="sector in sectorOptions" :key="sector.id" :value="sector.id">
                          {{ sector.name }}
                        </option>
                      </select>
                      <p v-if="formErrors.sector_id" class="mt-1 text-sm text-red-500">
                        {{ formErrors.sector_id }}
                      </p>
                    </div>

                    <div>
                      <label for="service" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Département / Service <span class="text-red-500">*</span>
                      </label>
                      <select
                        id="service"
                        v-model="formData.affectation.service_id"
                        required
                        class="w-full rounded-xl border bg-white/50 px-4 py-3 text-gray-900 outline-none backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800/50 dark:text-white"
                        :class="formErrors.service_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200/80 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50'"
                        :disabled="!formData.affectation.sector_id || filteredServiceOptions.length === 0"
                      >
                        <option :value="null">
                          {{ !formData.affectation.sector_id ? 'Sélectionnez d\'abord un secteur' : 'Sélectionnez un département' }}
                        </option>
                        <option v-for="service in filteredServiceOptions" :key="service.id" :value="service.id">
                          {{ service.name }}
                        </option>
                      </select>
                      <p v-if="formErrors.service_id" class="mt-1 text-sm text-red-500">
                        {{ formErrors.service_id }}
                      </p>
                    </div>

                    <div>
                      <label for="campus" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Campus <span class="text-red-500">*</span>
                      </label>
                      <select
                        id="campus"
                        v-model="formData.affectation.campus_id"
                        required
                        class="w-full rounded-xl border bg-white/50 px-4 py-3 text-gray-900 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:bg-gray-800/50 dark:text-white"
                        :class="formErrors.campus_id ? 'border-red-500' : 'border-gray-200/80 dark:border-gray-700/50'"
                      >
                        <option :value="null">
                          Sélectionnez un campus
                        </option>
                        <option v-for="campus in campusOptions" :key="campus.id" :value="campus.id">
                          {{ campus.name }} ({{ campus.code }})
                        </option>
                      </select>
                      <p v-if="formErrors.campus_id" class="mt-1 text-sm text-red-500">
                        {{ formErrors.campus_id }}
                      </p>
                    </div>
                  </div>

                  <!-- Étape 3 : Profil -->
                  <div v-else-if="currentStep === 3" key="step3" class="space-y-6">
                    <!-- Photo de profil -->
                    <div class="flex flex-col items-center gap-4">
                      <div class="relative">
                        <div class="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300/80 bg-gray-50/50 dark:border-gray-600/50 dark:bg-gray-800/50">
                          <img
                            v-if="photoPreviewUrl"
                            :src="photoPreviewUrl"
                            alt="Photo de profil"
                            class="h-full w-full object-cover"
                          >
                          <font-awesome-icon v-else :icon="['fas', 'user']" class="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        </div>
                        <button
                          v-if="photoPreviewUrl"
                          type="button"
                          class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg ring-2 ring-white hover:bg-red-600 dark:ring-gray-900"
                          title="Supprimer la photo"
                          @click="removePhoto"
                        >
                          <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3" />
                        </button>
                      </div>
                      <label
                        class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200/80 bg-white/50 px-5 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition hover:bg-white/80 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-300"
                        :class="{ 'cursor-not-allowed opacity-50': isUploadingPhoto }"
                      >
                        <font-awesome-icon
                          :icon="isUploadingPhoto ? ['fas', 'spinner'] : ['fas', 'camera']"
                          class="h-4 w-4"
                          :class="{ 'animate-spin': isUploadingPhoto }"
                        />
                        {{ photoPreviewUrl ? 'Changer la photo' : 'Ajouter une photo' }}
                        <input
                          type="file"
                          class="hidden"
                          accept="image/*"
                          :disabled="isUploadingPhoto"
                          @change="handlePhotoUpload"
                        >
                      </label>
                      <p v-if="formErrors.photo" class="text-sm text-red-500">
                        {{ formErrors.photo }}
                      </p>
                    </div>

                    <!-- Biographie -->
                    <div>
                      <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Biographie
                      </label>
                      <button
                        type="button"
                        class="group w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-4 text-left transition hover:border-brand-blue-300 hover:bg-white/80 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:border-brand-blue-600"
                        @click="showBiographyModal = true"
                      >
                        <div v-if="biographyPreview" class="space-y-2">
                          <p class="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
                            {{ biographyPreview }}{{ biographyPreview.length >= 150 ? '...' : '' }}
                          </p>
                          <span class="inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue-500">
                            <font-awesome-icon :icon="['fas', 'pen']" class="h-3 w-3" />
                            Modifier la biographie
                          </span>
                        </div>
                        <div v-else class="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                          <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-5 w-5 transition group-hover:text-brand-blue-500" />
                          <span class="text-sm">Quelques mots sur vous...</span>
                        </div>
                      </button>
                    </div>

                    <!-- Liens sociaux -->
                    <div class="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label for="linkedin_url" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          <font-awesome-icon :icon="['fab', 'linkedin']" class="mr-1 text-[#0A66C2]" />
                          LinkedIn
                        </label>
                        <input
                          id="linkedin_url"
                          v-model="formData.linkedin_url"
                          type="url"
                          class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                          placeholder="https://linkedin.com/in/..."
                        >
                      </div>
                      <div>
                        <label for="facebook_url" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          <font-awesome-icon :icon="['fab', 'facebook']" class="mr-1 text-[#1877F2]" />
                          Facebook
                        </label>
                        <input
                          id="facebook_url"
                          v-model="formData.facebook_url"
                          type="url"
                          class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                          placeholder="https://facebook.com/..."
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Étape 4 : Sécurité -->
                  <div v-else-if="currentStep === 4" key="step4" class="space-y-5">
                    <div>
                      <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mot de passe <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          id="password"
                          v-model="formData.password"
                          :type="showPassword ? 'text' : 'password'"
                          required
                          autocomplete="new-password"
                          class="w-full rounded-xl border bg-white/50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:bg-gray-800/50 dark:text-white"
                          :class="formErrors.password ? 'border-red-500' : 'border-gray-200/80 dark:border-gray-700/50'"
                          placeholder="Mot de passe"
                        >
                        <button
                          type="button"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
                          @click="showPassword = !showPassword"
                        >
                          <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" class="h-4 w-4" />
                        </button>
                      </div>
                      <p v-if="formErrors.password" class="mt-1 text-sm text-red-500">
                        {{ formErrors.password }}
                      </p>
                      <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                      </p>
                    </div>

                    <div>
                      <label for="password_confirm" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirmer le mot de passe <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          id="password_confirm"
                          v-model="formData.password_confirm"
                          :type="showPasswordConfirm ? 'text' : 'password'"
                          required
                          autocomplete="new-password"
                          class="w-full rounded-xl border bg-white/50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:bg-gray-800/50 dark:text-white"
                          :class="formErrors.password_confirm ? 'border-red-500' : 'border-gray-200/80 dark:border-gray-700/50'"
                          placeholder="Confirmer le mot de passe"
                        >
                        <button
                          type="button"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
                          @click="showPasswordConfirm = !showPasswordConfirm"
                        >
                          <font-awesome-icon :icon="['fas', showPasswordConfirm ? 'eye-slash' : 'eye']" class="h-4 w-4" />
                        </button>
                      </div>
                      <p v-if="formErrors.password_confirm" class="mt-1 text-sm text-red-500">
                        {{ formErrors.password_confirm }}
                      </p>
                    </div>
                  </div>
                </Transition>

                <!-- Boutons de navigation -->
                <div class="mt-8 flex items-center" :class="currentStep > 1 ? 'justify-between' : 'justify-end'">
                  <button
                    v-if="currentStep > 1"
                    type="button"
                    class="inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white/50 px-5 py-3 text-sm font-medium text-gray-700 backdrop-blur-sm transition hover:bg-white/80 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800/80"
                    @click="prevStep"
                  >
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-3.5 w-3.5" />
                    Retour
                  </button>

                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="inline-flex items-center gap-2 rounded-xl bg-brand-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition-all hover:bg-brand-blue-600 hover:shadow-xl hover:shadow-brand-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <template v-if="currentStep < totalSteps">
                      Continuer
                      <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3.5 w-3.5" />
                    </template>
                    <template v-else>
                      <span v-if="isSubmitting" class="inline-flex items-center gap-2">
                        <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                        Inscription...
                      </span>
                      <span v-else class="inline-flex items-center gap-2">
                        S'inscrire
                        <font-awesome-icon :icon="['fas', 'check']" class="h-3.5 w-3.5" />
                      </span>
                    </template>
                  </button>
                </div>

                <!-- Lien connexion (mobile) -->
                <p class="mt-6 text-center text-sm text-gray-500 lg:hidden dark:text-gray-400">
                  Déjà un compte ?
                  <NuxtLink to="/admin/login" class="font-medium text-brand-blue-600 hover:text-brand-blue-500 dark:text-brand-blue-400">
                    Se connecter
                  </NuxtLink>
                </p>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Modale biographie -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showBiographyModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          @click.self="showBiographyModal = false"
        >
          <div class="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            <!-- En-tête modal -->
            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                <font-awesome-icon :icon="['fas', 'pen-to-square']" class="mr-2 h-4 w-4 text-brand-blue-500" />
                Biographie
              </h3>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                @click="showBiographyModal = false"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
              </button>
            </div>
            <!-- Éditeur -->
            <div class="flex-1 overflow-y-auto p-6">
              <ClientOnly>
                <AdminRichTextEditor
                  v-model="biographyData"
                  :show-card="false"
                  placeholder="Quelques mots sur vous..."
                  :min-height="300"
                />
                <template #fallback>
                  <div
                    class="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    style="min-height: 300px"
                  >
                    <font-awesome-icon :icon="['fas', 'spinner']" class="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                </template>
              </ClientOnly>
            </div>
            <!-- Pied de modal -->
            <div class="flex justify-end border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-brand-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-600"
                @click="showBiographyModal = false"
              >
                <font-awesome-icon :icon="['fas', 'check']" class="h-3.5 w-3.5" />
                Valider
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modale éditeur photo -->
    <Teleport to="body">
      <div
        v-if="showPhotoEditor && pendingPhotoFile"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <div class="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
          <MediaImageEditor
            :image-file="pendingPhotoFile"
            :aspect-ratio="1"
            :default-low-width="150"
            :default-medium-width="400"
            @save="saveEditedPhoto"
            @cancel="cancelPhotoEditor"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Transitions entre étapes */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Transition fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
