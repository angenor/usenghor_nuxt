<script setup lang="ts">
import { useAdminRegistration } from '~/composables/useAdminRegistration'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()

// Si déjà connecté, rediriger
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
  // Photo upload
  pendingPhotoFile,
  showPhotoEditor,
  isUploadingPhoto,
  photoPreviewUrl,
  handlePhotoUpload,
  saveEditedPhoto,
  cancelPhotoEditor,
  removePhoto,
} = useAdminRegistration()

// Biographie avec EditorJS
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
  set: (value: { time: number, blocks: unknown[], version: string }) => {
    formData.value.biography = JSON.stringify(value)
  },
})

onMounted(() => {
  loadOptions()
})

async function handleSubmit() {
  await submitRegistration()
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-900">
    <div class="w-full max-w-lg">
      <div class="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Créer un compte
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Administration - Université Senghor
          </p>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
        </div>

        <!-- Success Message -->
        <div v-else-if="isSuccess" class="text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'check']" class="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Inscription réussie !
          </h2>
          <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Votre compte a été créé. Un administrateur doit vérifier votre email avant que vous puissiez vous connecter.
          </p>
          <p class="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-2" />
            Vous recevrez une notification lorsque votre compte sera activé.
          </p>
          <NuxtLink
            to="/admin/login"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
            Retour à la connexion
          </NuxtLink>
        </div>

        <!-- Registration Form -->
        <form v-else class="space-y-5" @submit.prevent="handleSubmit">
          <!-- Server Error -->
          <div v-if="serverError" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {{ serverError }}
          </div>

          <!-- Info Banner -->
          <div class="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-2" />
            Votre compte devra être validé par un administrateur avant de pouvoir vous connecter.
          </div>

          <!-- Photo de profil -->
          <div class="flex flex-col items-center gap-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Photo de profil
            </label>
            <div class="flex items-center gap-6">
              <!-- Avatar preview -->
              <div class="relative">
                <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <img
                    v-if="photoPreviewUrl"
                    :src="photoPreviewUrl"
                    alt="Photo de profil"
                    class="h-full w-full object-cover"
                  >
                  <font-awesome-icon
                    v-else
                    :icon="['fas', 'user']"
                    class="h-12 w-12 text-gray-400"
                  />
                </div>
                <!-- Delete button -->
                <button
                  v-if="photoPreviewUrl"
                  type="button"
                  class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                  title="Supprimer la photo"
                  @click="removePhoto"
                >
                  <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3" />
                </button>
              </div>

              <!-- Upload button -->
              <div class="flex flex-col gap-2">
                <label
                  class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  :class="{ 'cursor-not-allowed opacity-50': isUploadingPhoto }"
                >
                  <font-awesome-icon
                    :icon="isUploadingPhoto ? ['fas', 'spinner'] : ['fas', 'camera']"
                    class="h-4 w-4"
                    :class="{ 'animate-spin': isUploadingPhoto }"
                  />
                  {{ photoPreviewUrl ? 'Changer' : 'Ajouter une photo' }}
                  <input
                    type="file"
                    class="hidden"
                    accept="image/*"
                    :disabled="isUploadingPhoto"
                    @change="handlePhotoUpload"
                  >
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG ou WebP
                </p>
              </div>
            </div>
            <p v-if="formErrors.photo" class="text-sm text-red-500">
              {{ formErrors.photo }}
            </p>
          </div>

          <!-- Civilité -->
          <div>
            <label for="salutation" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Civilité
            </label>
            <select
              id="salutation"
              v-model="formData.salutation"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option :value="null">
                -
              </option>
              <option v-for="option in salutationOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Nom / Prénom -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="last_name" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom <span class="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                v-model="formData.last_name"
                type="text"
                required
                autocomplete="family-name"
                class="w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white"
                :class="formErrors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                placeholder="Dupont"
              />
              <p v-if="formErrors.last_name" class="mt-1 text-sm text-red-500">
                {{ formErrors.last_name }}
              </p>
            </div>
            <div>
              <label for="first_name" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prénom <span class="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                v-model="formData.first_name"
                type="text"
                required
                autocomplete="given-name"
                class="w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white"
                :class="formErrors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                placeholder="Jean"
              />
              <p v-if="formErrors.first_name" class="mt-1 text-sm text-red-500">
                {{ formErrors.first_name }}
              </p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              autocomplete="email"
              class="w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white"
              :class="formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
              placeholder="jean.dupont@usenghor.org"
            />
            <p v-if="formErrors.email" class="mt-1 text-sm text-red-500">
              {{ formErrors.email }}
            </p>
          </div>

          <!-- Affectation organisationnelle -->
          <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Affectation organisationnelle
            </h3>
            <div class="space-y-4">
              <!-- Secteur -->
              <div>
                <label for="sector" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Secteur <span class="text-red-500">*</span>
                </label>
                <select
                  id="sector"
                  v-model="formData.affectation.sector_id"
                  required
                  class="w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white"
                  :class="formErrors.sector_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
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

              <!-- Département / Service -->
              <div>
                <label for="service" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Département / Service <span class="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  v-model="formData.affectation.service_id"
                  required
                  class="w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white"
                  :class="formErrors.service_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
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

              <!-- Campus -->
              <div>
                <label for="campus" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campus <span class="text-red-500">*</span>
                </label>
                <select
                  id="campus"
                  v-model="formData.affectation.campus_id"
                  required
                  class="w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white"
                  :class="formErrors.campus_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
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
          </div>

          <!-- Informations complémentaires (optionnel) -->
          <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Informations complémentaires
              <span class="ml-1 text-xs font-normal normal-case">(optionnel)</span>
            </h3>
            <div class="space-y-4">
              <!-- Biographie -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Biographie
                </label>
                <div class="rounded-lg border border-gray-300 dark:border-gray-600">
                  <EditorJS
                    v-model="biographyData"
                    placeholder="Quelques mots sur vous..."
                    :min-height="120"
                  />
                </div>
              </div>

              <!-- LinkedIn -->
              <div>
                <label for="linkedin_url" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <font-awesome-icon :icon="['fab', 'linkedin']" class="mr-1 text-[#0A66C2]" />
                  LinkedIn
                </label>
                <input
                  id="linkedin_url"
                  v-model="formData.linkedin_url"
                  type="url"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="https://linkedin.com/in/votre-profil"
                >
              </div>

              <!-- Facebook -->
              <div>
                <label for="facebook_url" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <font-awesome-icon :icon="['fab', 'facebook']" class="mr-1 text-[#1877F2]" />
                  Facebook
                </label>
                <input
                  id="facebook_url"
                  v-model="formData.facebook_url"
                  type="url"
                  class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="https://facebook.com/votre-profil"
                >
              </div>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe <span class="text-red-500">*</span>
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              autocomplete="new-password"
              class="w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white"
              :class="formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
              placeholder="Mot de passe"
            />
            <p v-if="formErrors.password" class="mt-1 text-sm text-red-500">
              {{ formErrors.password }}
            </p>
            <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
            </p>
          </div>

          <!-- Password Confirm -->
          <div>
            <label for="password_confirm" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmer le mot de passe <span class="text-red-500">*</span>
            </label>
            <input
              id="password_confirm"
              v-model="formData.password_confirm"
              type="password"
              required
              autocomplete="new-password"
              class="w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:text-white"
              :class="formErrors.password_confirm ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
              placeholder="Confirmer le mot de passe"
            />
            <p v-if="formErrors.password_confirm" class="mt-1 text-sm text-red-500">
              {{ formErrors.password_confirm }}
            </p>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span v-if="isSubmitting" class="inline-flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
              Inscription en cours...
            </span>
            <span v-else>S'inscrire</span>
          </button>

          <!-- Login Link -->
          <p class="text-center text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte ?
            <NuxtLink to="/admin/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Se connecter
            </NuxtLink>
          </p>
        </form>
      </div>
    </div>

    <!-- Image Editor Modal -->
    <Teleport to="body">
      <div
        v-if="showPhotoEditor && pendingPhotoFile"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <div class="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800">
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
