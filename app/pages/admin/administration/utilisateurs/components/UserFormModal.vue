<script setup lang="ts">
import type { UserFormData, SectorOption, ServiceOption, CampusOption } from '../composables/useUsersManagement'
import type { ImageVariants } from '~/types/api'

interface RoleOption {
  id: string
  code: string
  name_fr: string
}

interface SalutationOption {
  value: string
  label: string
}

const props = defineProps<{
  show: boolean
  isEditing: boolean
  isSaving: boolean
  formData: UserFormData
  formErrors: Record<string, string>
  roleOptions: RoleOption[]
  salutationOptions: SalutationOption[]
  getRoleColor: (code: string) => string
  // Photo upload props
  pendingPhotoFile: File | null
  showPhotoEditor: boolean
  isUploadingPhoto: boolean
  photoPreviewUrl: string | null
  // Affectation props
  sectorOptions: SectorOption[]
  filteredServiceOptions: ServiceOption[]
  campusOptions: CampusOption[]
}>()

const emit = defineEmits<{
  'close': []
  'save': []
  'update:formData': [data: UserFormData]
  'photo-upload': [event: Event]
  'photo-save': [variants: ImageVariants]
  'photo-cancel': []
  'photo-remove': []
}>()

const localFormData = computed({
  get: () => props.formData,
  set: (value) => emit('update:formData', value),
})

// Biographie avec EditorJS
const biographyData = computed({
  get: () => {
    if (!props.formData.biography) {
      return { time: Date.now(), blocks: [], version: '2.28.0' }
    }
    try {
      return JSON.parse(props.formData.biography)
    }
    catch {
      return { time: Date.now(), blocks: [], version: '2.28.0' }
    }
  },
  set: (value: { time: number, blocks: unknown[], version: string }) => {
    localFormData.value = {
      ...props.formData,
      biography: JSON.stringify(value),
    }
  },
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      @click.self="!showPhotoEditor && !isUploadingPhoto && emit('close')"
    >
      <div class="w-full max-w-3xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
          </h3>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50"
            :disabled="isUploadingPhoto"
            @click="emit('close')"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" />
          </button>
        </div>

        <!-- Body -->
        <form class="admin-scrollbar max-h-[60vh] overflow-y-auto p-4" data-lenis-prevent @submit.prevent="emit('save')">
          <!-- General error -->
          <div v-if="formErrors.general" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {{ formErrors.general }}
          </div>

          <!-- Identification -->
          <div class="mb-6">
            <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Identification
            </h4>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="localFormData.email"
                  type="email"
                  class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  :class="formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                />
                <p v-if="formErrors.email" class="mt-1 text-sm text-red-500">
                  {{ formErrors.email }}
                </p>
              </div>
              <div :class="isEditing ? 'sm:col-span-2' : ''">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe <span v-if="!isEditing" class="text-red-500">*</span>
                  <span v-if="isEditing" class="text-gray-400">(laisser vide pour ne pas changer)</span>
                </label>
                <input
                  v-model="localFormData.password"
                  type="password"
                  class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  :class="formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                />
                <p v-if="formErrors.password" class="mt-1 text-sm text-red-500">
                  {{ formErrors.password }}
                </p>
              </div>
            </div>
          </div>

          <!-- Photo de profil -->
          <div class="mb-6">
            <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Photo de profil
            </h4>
            <div class="flex items-start gap-4">
              <!-- Prévisualisation -->
              <div class="relative h-24 w-24 flex-shrink-0">
                <div
                  v-if="photoPreviewUrl"
                  class="relative h-24 w-24 overflow-hidden rounded-full"
                >
                  <img
                    :src="photoPreviewUrl"
                    alt="Photo de profil"
                    class="h-full w-full object-cover"
                  />
                  <div class="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                    <button
                      type="button"
                      class="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
                      title="Supprimer"
                      @click="emit('photo-remove')"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div
                  v-else
                  class="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <font-awesome-icon :icon="['fas', 'user']" class="h-10 w-10 text-gray-400" />
                </div>
              </div>

              <!-- Upload -->
              <div class="flex-1">
                <label
                  class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:border-primary-400 hover:bg-primary-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-primary-500"
                >
                  <font-awesome-icon
                    v-if="isUploadingPhoto"
                    :icon="['fas', 'spinner']"
                    class="mb-2 h-6 w-6 animate-spin text-gray-400"
                  />
                  <font-awesome-icon
                    v-else
                    :icon="['fas', 'cloud-upload-alt']"
                    class="mb-2 h-6 w-6 text-gray-400"
                  />
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ isUploadingPhoto ? 'Téléversement...' : (photoPreviewUrl ? 'Changer la photo' : 'Ajouter une photo') }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG (ratio 1:1 recommandé)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    :disabled="isUploadingPhoto || isSaving"
                    @change="emit('photo-upload', $event)"
                  />
                </label>
                <p v-if="formErrors.photo" class="mt-1 text-sm text-red-500">
                  {{ formErrors.photo }}
                </p>
              </div>
            </div>
          </div>

          <!-- Personal info -->
          <div class="mb-6">
            <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Informations personnelles
            </h4>
            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Civilité</label>
                <select
                  v-model="localFormData.salutation"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option :value="null">
                    -
                  </option>
                  <option v-for="option in salutationOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="localFormData.last_name"
                  type="text"
                  class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  :class="formErrors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                />
                <p v-if="formErrors.last_name" class="mt-1 text-sm text-red-500">
                  {{ formErrors.last_name }}
                </p>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prénom <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="localFormData.first_name"
                  type="text"
                  class="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  :class="formErrors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
                />
                <p v-if="formErrors.first_name" class="mt-1 text-sm text-red-500">
                  {{ formErrors.first_name }}
                </p>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date de naissance</label>
                <input
                  v-model="localFormData.birth_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="mb-6">
            <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Coordonnées
            </h4>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                <input
                  v-model="localFormData.phone"
                  type="tel"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
                <input
                  v-model="localFormData.phone_whatsapp"
                  type="tel"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
                <input
                  v-model="localFormData.city"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <font-awesome-icon :icon="['fab', 'linkedin']" class="mr-1 text-[#0A66C2]" />
                  LinkedIn
                </label>
                <input
                  v-model="localFormData.linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <font-awesome-icon :icon="['fab', 'facebook']" class="mr-1 text-[#1877F2]" />
                  Facebook
                </label>
                <input
                  v-model="localFormData.facebook"
                  type="url"
                  placeholder="https://facebook.com/..."
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div class="sm:col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                <textarea
                  v-model="localFormData.address"
                  rows="2"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <!-- Biographie -->
          <div class="mb-6">
            <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Biographie
            </h4>
            <div class="rounded-lg border border-gray-300 dark:border-gray-600">
              <EditorJS
                v-model="biographyData"
                placeholder="Quelques mots sur vous..."
                :min-height="150"
              />
            </div>
          </div>

          <!-- Affectation organisationnelle -->
          <div class="mb-6">
            <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Affectation organisationnelle
              <span class="ml-2 text-xs font-normal normal-case text-gray-400">(optionnel)</span>
            </h4>
            <div class="grid gap-4 sm:grid-cols-2">
              <!-- Secteur -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Secteur</label>
                <select
                  v-model="localFormData.affectation.sector_id"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  @change="localFormData.affectation.service_id = null"
                >
                  <option :value="null">
                    Aucun secteur
                  </option>
                  <option v-for="sector in sectorOptions" :key="sector.id" :value="sector.id">
                    {{ sector.name }}
                  </option>
                </select>
              </div>

              <!-- Service (Département) -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Département / Service
                </label>
                <select
                  v-model="localFormData.affectation.service_id"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  :disabled="filteredServiceOptions.length === 0"
                >
                  <option :value="null">
                    Aucun département
                  </option>
                  <option v-for="service in filteredServiceOptions" :key="service.id" :value="service.id">
                    {{ service.name }}
                  </option>
                </select>
              </div>

              <!-- Position Service -->
              <div v-if="localFormData.affectation.service_id">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Poste dans le département
                </label>
                <input
                  v-model="localFormData.affectation.service_position"
                  type="text"
                  placeholder="Ex: Responsable, Membre, Assistant..."
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Laisser vide pour "Membre" par défaut
                </p>
              </div>

              <!-- Campus -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Campus</label>
                <select
                  v-model="localFormData.affectation.campus_id"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option :value="null">
                    Aucun campus
                  </option>
                  <option v-for="campus in campusOptions" :key="campus.id" :value="campus.id">
                    {{ campus.name }} ({{ campus.code }})
                  </option>
                </select>
              </div>

              <!-- Position Campus -->
              <div v-if="localFormData.affectation.campus_id">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Poste dans le campus
                </label>
                <input
                  v-model="localFormData.affectation.campus_position"
                  type="text"
                  placeholder="Ex: Directeur, Personnel, Enseignant..."
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Laisser vide pour "Membre" par défaut
                </p>
              </div>
            </div>
          </div>

          <!-- Roles & Access -->
          <div class="mb-6">
            <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Rôles et accès
            </h4>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rôles <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2 rounded-lg border p-3" :class="formErrors.role_ids ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'">
                <label
                  v-for="role in roleOptions"
                  :key="role.id"
                  class="flex items-center gap-2"
                >
                  <input
                    v-model="localFormData.role_ids"
                    type="checkbox"
                    :value="role.id"
                    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="getRoleColor(role.code)"
                  >
                    {{ role.name_fr }}
                  </span>
                </label>
              </div>
              <p v-if="formErrors.role_ids" class="mt-1 text-sm text-red-500">
                {{ formErrors.role_ids }}
              </p>
            </div>
          </div>

          <!-- Options -->
          <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <label class="flex items-center gap-2">
              <input
                v-model="localFormData.active"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">Compte actif</span>
            </label>
          </div>
        </form>

        <!-- Footer -->
        <div class="flex justify-end gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
            :disabled="isUploadingPhoto"
            @click="emit('close')"
          >
            Annuler
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            :disabled="isSaving || isUploadingPhoto"
            @click="emit('save')"
          >
            <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
            {{ isEditing ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal Éditeur d'image -->
  <Teleport to="body">
    <div
      v-if="showPhotoEditor && pendingPhotoFile"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      @click.stop
      @mousedown.stop
    >
      <div @click.stop @mousedown.stop>
        <MediaImageEditor
          :image-file="pendingPhotoFile"
          :aspect-ratio="1"
          :default-low-width="150"
          :default-medium-width="400"
          @save="emit('photo-save', $event)"
          @cancel="emit('photo-cancel')"
        />
      </div>
    </div>
  </Teleport>
</template>
